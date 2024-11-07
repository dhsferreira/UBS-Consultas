import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Image, TouchableOpacity, Text, ScrollView, ActivityIndicator, Modal, TouchableWithoutFeedback, Alert } from 'react-native';
import { TextInputMask } from 'react-native-masked-text';
import { useNavigation, DrawerActions, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { useUser } from '../UserContext';
import { styles } from './ConsultasStylesRecep';
import { supabase } from '../Supabase';

interface Consulta {
  consul_id: number;
  paci_nome: string;
  paci_cpf: string;
  ubs_nome: string;
  area_nome: string;
  horarios_dia: string;
  horarios_horarios: string;
  consul_estado: string;
}

const Consultas = () => {
  const navigation = useNavigation();
  const { user } = useUser();
  const [date, setDate] = useState('');
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [filteredConsultas, setFilteredConsultas] = useState<Consulta[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedConsulta, setSelectedConsulta] = useState<Consulta | null>(null);
  const dateInputRef = useRef(null);
  const [ubsId, setUbsId] = useState<number | null>(null);

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const fetchUbsId = async () => {
    try {
      const { data, error } = await supabase
        .from('recepcionista')
        .select('ubs_id')
        .eq('recep_id', user.id)
        .single();

      if (error) {
        throw error;
      }

      setUbsId(data.ubs_id);
    } catch (error) {
      console.error('Erro ao buscar ubs_id:', error);
    }
  };

  const fetchConsultas = async (selectedDate?: string) => {
    try {
      if (ubsId !== null) {
        let url = `http://192.168.137.1:3000/api/Consulta/ubs/${ubsId}`;
        if (selectedDate) {
          url += `?data=${selectedDate}`;
        }
        const response = await axios.get(url);
        const consultasData: Consulta[] = response.data.result;
        setConsultas(consultasData);
        setFilteredConsultas(consultasData);
      }
    } catch (error) {
      console.error('Erro ao buscar consultas:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        await fetchUbsId();
        fetchConsultas();
      };

      fetchData();
    }, [ubsId])
  );

  const handleFilter = () => {
    setLoading(true);
    fetchConsultas(date.split('/').reverse().join('-'));
  };

  const handleDateSubmit = () => {
    if (dateInputRef.current) {
      dateInputRef.current.getElement().blur();
      handleFilter();
    }
  };

  const openFilterModal = () => {
    setShowFilterModal(true);
  };

  const closeFilterModal = () => {
    setShowFilterModal(false);
  };

  const handleFilterOption = (status: string) => {
    closeFilterModal();
    let filtered = [];
    switch (status) {
      case 'agendada':
        filtered = consultas.filter(consulta => consulta.consul_estado === 'Em espera');
        break;
      case 'realizada':
        filtered = consultas.filter(consulta => consulta.consul_estado === 'Finalizada');
        break;
      case 'cancelada':
        filtered = consultas.filter(consulta => consulta.consul_estado === 'Cancelada');
        break;
      case 'todas':
        filtered = consultas;
        break;
      default:
        filtered = consultas;
        break;
    }
    filtered.sort((a, b) => (a.consul_estado === 'Em andamento' ? -1 : 1));
    setFilteredConsultas(filtered);
  };

  const getCardStyle = (status: string) => {
    switch (status) {
      case 'Em espera':
        return [styles.card, { backgroundColor: 'rgba(255, 255, 0, 0.3)' }];
      case 'Finalizada':
        return [styles.card, { backgroundColor: 'rgba(0, 255, 0, 0.3)' }];
      case 'Cancelada':
        return [styles.card, { backgroundColor: 'rgba(255, 0, 0, 0.3)' }];
      default:
        return styles.card;
    }
  };

  const handleUpdateStatus = async (consulId: number, newStatus: string) => {
    try {
      console.log(`Atualizando status da consulta com consul_id: ${consulId} para ${newStatus}`);

      const url = `http://192.168.137.1:3000/api/consulta/${consulId}/estado`;
      await axios.put(url, { consul_estado: newStatus });

      Alert.alert('Sucesso', `Status da consulta atualizado para "${newStatus}".`);
      fetchConsultas(date); // Atualiza a lista após a alteração de status
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o status da consulta.');
    }
  };

  const handleOpenStatusModal = (consulta: Consulta) => {
    setSelectedConsulta(consulta);
    setShowStatusModal(true);
  };

  const handleCloseStatusModal = () => {
    setShowStatusModal(false);
    setSelectedConsulta(null);
  };

  const handleStatusChange = (status: string) => {
    if (selectedConsulta) {
      handleUpdateStatus(selectedConsulta.consul_id, status);
      handleCloseStatusModal(); // Fecha o modal após a atualização
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.leftButton} onPress={openDrawer}>
          <Image source={require('../assets/3 linhas.png')} style={styles.buttonImage} />
        </TouchableOpacity>
        <Image source={require('../assets/ubsLogo.png')} style={styles.centerImage} />
      </View>

      {/* Sub-cabeçalho */}
      <View style={styles.secondHeader}>
        <Text style={styles.smallText}>Você está em Home / Consultas</Text>
        <Text style={styles.largeText}>Consultas</Text>
      </View>

      {/* Filtro por data */}
      <View style={styles.filterContainer}>
        <TextInputMask
          ref={dateInputRef}
          type={'datetime'}
          options={{ format: 'DD/MM/YYYY' }}
          value={date}
          onChangeText={text => setDate(text)}
          style={styles.dateInput}
          placeholder="Selecione a data"
          placeholderTextColor="#000"
          returnKeyType="done"
          onSubmitEditing={handleDateSubmit}
        />
        <TouchableOpacity style={styles.filterButton} onPress={openFilterModal}>
          <Image source={require('../assets/filtrar.png')} style={styles.filterButtonImage} />
          <Text style={styles.filterButtonText}>Filtrar</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de filtro */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showFilterModal}
        onRequestClose={closeFilterModal}
      >
        <TouchableWithoutFeedback onPress={closeFilterModal}>
          <View style={styles.modalBackground}>
            <View style={styles.modalContent}>
              {/* Opções de filtro */}
              <TouchableOpacity style={styles.filterOption} onPress={() => handleFilterOption('todas')}>
                <Text style={styles.filterOptionText}>Todas as Consultas</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterOption} onPress={() => handleFilterOption('agendada')}>
                <Text style={styles.filterOptionText}>Consultas Agendadas</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterOption} onPress={() => handleFilterOption('realizada')}>
                <Text style={styles.filterOptionText}>Consultas Realizadas</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterOption} onPress={() => handleFilterOption('cancelada')}>
                <Text style={styles.filterOptionText}>Consultas Canceladas</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeButton} onPress={closeFilterModal}>
                <Text style={styles.closeButtonText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Lista de consultas */}
      <ScrollView style={styles.scrollView}>
        {filteredConsultas.map(consulta => (
          <TouchableOpacity
            key={consulta.consul_id}
            style={getCardStyle(consulta.consul_estado)}
            onPress={() => handleOpenStatusModal(consulta)}
          >
            <Text style={styles.cardText}>{consulta.paci_nome}</Text>
            <Text style={styles.cardText}>{consulta.ubs_nome} - {consulta.area_nome}</Text>
            <Text style={styles.cardText}>
              {consulta.horarios_dia} - {consulta.horarios_horarios}
            </Text>
            <Text style={styles.cardStatus}>{consulta.consul_estado}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Modal para alterar status da consulta */}
      {selectedConsulta && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showStatusModal}
          onRequestClose={handleCloseStatusModal}
        >
          <TouchableWithoutFeedback onPress={handleCloseStatusModal}>
            <View style={styles.modalBackground}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Alterar Status</Text>
                <TouchableOpacity style={styles.modalOption} onPress={() => handleStatusChange('Em espera')}>
                  <Text style={styles.modalOptionText}>Em Espera</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalOption} onPress={() => handleStatusChange('Finalizada')}>
                  <Text style={styles.modalOptionText}>Finalizada</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalOption} onPress={() => handleStatusChange('Cancelada')}>
                  <Text style={styles.modalOptionText}>Cancelada</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeButton} onPress={handleCloseStatusModal}>
                  <Text style={styles.closeButtonText}>Fechar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
    </View>
  );
};

export default Consultas;
