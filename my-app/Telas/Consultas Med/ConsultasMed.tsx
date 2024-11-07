import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  Image, 
  TouchableOpacity, 
  Text, 
  ScrollView, 
  ActivityIndicator, 
  Modal, 
  TouchableWithoutFeedback 
} from 'react-native';
import { TextInputMask } from 'react-native-masked-text';
import { useNavigation, DrawerActions, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { useUser } from '../UserContext'; // Importa o contexto do usuário
import { styles } from './ConsultasStylesMed'; // Importa estilos
import { supabase } from '../Supabase'; // Importa Supabase

interface Consulta {
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
  const dateInputRef = useRef(null);
  const [ubsId, setUbsId] = useState<number | null>(null);

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const fetchUbsId = async () => {
    try {
      const { data, error } = await supabase
        .from('medico')
        .select('ubs_id')
        .eq('medi_id', user.id)
        .single();

      if (error) throw error;
      setUbsId(data.ubs_id);
    } catch (error) {
      console.error('Erro ao buscar ubs_id:', error);
    }
  };

  const fetchConsultas = async (selectedDate?: string) => {
    try {
      if (ubsId !== null) {
        const { data: medicoData, error: medicoError } = await supabase
          .from('medico')
          .select('medi_area')
          .eq('medi_id', user.id)
          .single();

        if (medicoError) throw medicoError;
        const areaNome = medicoData.medi_area;

        let url = `http://192.168.137.1:3000/api/consultas/ubs/${ubsId}/area/${areaNome}`;
        if (selectedDate) url += `?data=${selectedDate}`;
        
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

  const openFilterModal = () => setShowFilterModal(true);
  const closeFilterModal = () => setShowFilterModal(false);

  const handleFilterOption = (status: string) => {
    closeFilterModal();
    let filtered = consultas;
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
    }
    filtered.sort((a, b) => (a.consul_estado === 'Em andamento' ? -1 : 1));
    setFilteredConsultas(filtered);
  };

  const getCardStyle = (status: string) => {
    switch (status) {
      case 'Em espera': return [styles.card, { backgroundColor: 'rgba(255, 255, 0, 0.3)' }];
      case 'Finalizada': return [styles.card, { backgroundColor: 'rgba(0, 255, 0, 0.3)' }];
      case 'Cancelada': return [styles.card, { backgroundColor: 'rgba(255, 0, 0, 0.3)' }];
      default: return styles.card;
    }
  };

  const handleExames = async (consulta: Consulta) => {
    try {
      const response = await axios.get(`http://192.168.137.1:3000/api/BuscarNome/${consulta.paci_nome}`);
      if (response.data && response.data.result && response.data.result.paci_id) {
        const paciId = response.data.result.paci_id;
        navigation.navigate('ExamesMed', { consulta, paciId });
      } else {
        console.error('Erro: paci_id não encontrado na resposta.');
      }
    } catch (error) {
      console.error('Erro ao buscar paci_id:', error);
    }
  };

  const handleReceitas = (consulta: Consulta) => {
    console.log('Navegando para receitas de:', consulta);
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
      {/* Primeiro cabeçalho */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.leftButton} onPress={openDrawer}>
          <Image
            source={require('../assets/3 linhas.png')}
            style={styles.buttonImage}
          />
        </TouchableOpacity>
        <Image
          source={require('../assets/ubsLogo.png')}
          style={styles.centerImage}
        />
      </View>

      {/* Segundo cabeçalho */}
      <View style={styles.secondHeader}>
        <Text style={styles.smallText}>Você está em Home / Consultas</Text>
        <Text style={styles.largeText}>Consultas</Text>
      </View>

      {/* Campo de pesquisa e botão de filtro */}
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
          <Image
            source={require('../assets/filtrar.png')}
            style={styles.filterButtonImage}
          />
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
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Adicionando ScrollView para os cartões */}
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {filteredConsultas.map((consulta, index) => (
          <View key={index} style={getCardStyle(consulta.consul_estado)}>
            <Text style={styles.consultaText}>Paciente: {consulta.paci_nome}</Text>
            <Text style={styles.consultaText}>CPF: {consulta.paci_cpf}</Text>
            <Text style={styles.consultaText}>UBS: {consulta.ubs_nome}</Text>
            <Text style={styles.consultaText}>Área: {consulta.area_nome}</Text>
            <Text style={styles.consultaText}>Data: {consulta.horarios_dia}</Text>
            <Text style={styles.consultaText}>Horário: {consulta.horarios_horarios}</Text>
            <Text style={styles.consultaText}>Status: {consulta.consul_estado}</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={() => handleExames(consulta)}>
                <Text style={styles.buttonText}>Exames</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={() => handleReceitas(consulta)}>
                <Text style={styles.buttonText}>Receitas</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default Consultas;
