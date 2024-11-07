import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Image, Alert } from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import axios from 'axios';
import { TextInputMask } from 'react-native-masked-text';
import { styles } from '../Exames Med/ExamesStylesMed';
import { supabase } from '../Supabase';
import { useNavigation, DrawerActions, useFocusEffect } from '@react-navigation/native';

const ExamesScreen = ({ route }) => {
  const { paciId } = route.params;
  const navigation = useNavigation();
  const [consultas, setConsultas] = useState([]);
  const [filteredConsultas, setFilteredConsultas] = useState([]);
  const [exames, setExames] = useState([]);
  const [filteredExames, setFilteredExames] = useState([]);
  const [filteredReceitas, setFilteredReceitas] = useState([]);
  const [receitas, setReceitas] = useState([]);
  const [date, setDate] = useState('');
  const [selectedMenu, setSelectedMenu] = useState('Perfil');
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('todas');
  const [expandedExameId, setExpandedExameId] = useState(null);
  const [expandedReceitaId, setExpandedReceitaId] = useState(null); // Controle de expansão dos exames
  const dateInputRef = useRef(null);

  const fetchConsultas = async () => {
    try {
      const response = await axios.get(`http://192.168.0.103:3000/api/Consulta/${paciId}`);
      setConsultas(response.data.result || []);
      setFilteredConsultas(response.data.result || []);
    } catch (error) {
      console.error('Erro ao buscar consultas:', error);
    }
  };

  const fetchExames = async () => {
    try {
      const response = await axios.get(`http://192.168.0.103:3000/api/paciente/${paciId}/exames`);
      setExames(response.data.result || []);
      setFilteredExames(response.data.result || []);
    } catch (error) {
      console.error('Erro ao buscar exames:', error);
    }
  };

  const fetchReceitas = async () => {
    try {
      const response = await axios.get(`http://192.168.0.103:3000/api/paciente/${paciId}/receitas`); // Corrigido URL
      setReceitas(response.data.result || []);
      setFilteredReceitas(response.data.result || []);
    } catch (error) {
      console.error('Erro ao buscar receitas:', error);
    }
  };

  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('paciente')
        .select('*')
        .eq('paci_id', paciId)
        .single();

      if (error) throw error;
      setUserInfo(data);
    } catch (error) {
      console.error('Erro ao buscar informações do paciente:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Paciente ID:", paciId);
    if (selectedMenu === 'Exames') {
      fetchExames();
    } else if (selectedMenu === 'Consultas') {
      fetchConsultas();
    } else if (selectedMenu === 'Receitas') {
      fetchReceitas();
    } else if (selectedMenu === 'Perfil') {
      fetchUserInfo();
    }
  }, [selectedMenu, paciId]);

  const handleDateSubmit = () => {
    const formattedDate = date.split('/').reverse().join('-');
    const filtered = consultas.filter(consulta =>
      consulta.horarios_dia.includes(formattedDate)
    );
    setFilteredConsultas(date ? filtered : consultas);
  };

  const openFilterModal = () => {
    setFilterModalVisible(true);
  };

  const closeFilterModal = () => {
    setFilterModalVisible(false);
  };

  const handleFilterOption = (status) => {
    setSelectedFilter(status);
    const filtered = status === 'todas' ? consultas : consultas.filter(consulta => consulta.consul_estado === status);
    setFilteredConsultas(filtered);
    closeFilterModal();
  };

  const renderProfile = () => (
    <View style={styles.profileContainer}>
      {loading ? (
        <Text style={styles.profileText}>Carregando informações do paciente...</Text>
      ) : userInfo ? (
        <View>
          <View style={styles.infoContainer}>
            <Text style={styles.profileLabel}>Nome:</Text>
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>{userInfo.paci_nome}</Text>
            </View>
            <Text style={styles.profileLabel}>Email:</Text>
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>{userInfo.paci_email}</Text>
            </View>
            <Text style={styles.profileLabel}>Data de nascimento:</Text>
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>{userInfo.paci_data_nascimento}</Text>
            </View>
          </View>
        </View>
      ) : (
        <Text style={styles.profileText}>Erro ao carregar informações do paciente.</Text>
      )}
    </View>
  );

  const renderConsultas = () => (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      {filteredConsultas.length > 0 ? (
        filteredConsultas.map((consulta, index) => (
          <View key={index} style={styles.card}>
            <Text>Nome: {consulta.paci_nome}</Text>
            <Text>UBS: {consulta.ubs_nome}</Text>
            <Text>Data: {consulta.horarios_dia}</Text>
            <Text>Horário: {consulta.horarios_horarios}</Text>
            <Text>Área de Atendimento: {consulta.area_nome}</Text>
            <Text>Status: {consulta.consul_estado}</Text>
          </View>
        ))
      ) : (
        <Text>Nenhuma consulta encontrada</Text>
      )}
    </ScrollView>
  );

  const renderExames = () => (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      {filteredExames.length > 0 ? (
        filteredExames.map((exame, index) => (
          <View key={index} style={styles.card}>
            <Text>Nome: {exame.paci_nome}</Text>
            <Text>UBS: {exame.ubs_nome}</Text>
            <Text>Exame: {exame.exame_descricao}</Text>
            <Text>Data: {exame.exame_dia}</Text>
            <Text>Horário: {exame.exame_hora}</Text>
            <TouchableOpacity
              style={styles.expandButton}
              onPress={() => {
                setExpandedExameId(prevId => (prevId === exame.exame_id ? null : exame.exame_id));
              }}
            >
              <Text style={styles.expandButtonText}>
                {expandedExameId === exame.exame_id ? 'Ocultar Resultados' : 'Ver Resultados'}
              </Text>
            </TouchableOpacity>
            {expandedExameId === exame.exame_id && (
              <View style={styles.resultsContainer}>
                <Text>Resultados: {exame.exame_resultado}</Text>
              </View>
            )}
          </View>
        ))
      ) : (
        <Text>Nenhum exame encontrado</Text>
      )}
    </ScrollView>
  );

  const exportReceitaToPDF = async (receita) => {
    const htmlContent = `
      <h1>Detalhes da Receita</h1>
      <p><strong>Nome do Paciente:</strong> ${receita.paci_nome}</p>
      <p><strong>UBS:</strong> ${receita.ubs_nome}</p>
      <p><strong>Medicamento:</strong> ${receita.medicamento_nome}</p>
      <p><strong>Dosagem:</strong> ${receita.dosagem}</p>
      <p><strong>Frequência de Uso:</strong> ${receita.frequencia_dosagem}</p>
      <p><strong>Tempo de Uso:</strong> ${receita.tempo_uso}</p>
      <p><strong>Data de Emissão:</strong> ${receita.data_emissao}</p>
      <p><strong>Data de Validade:</strong> ${receita.data_validade}</p>
      <p><strong>Observações:</strong> ${receita.observacoes || 'N/A'}</p>
    `;

    try {
      const pdf = await RNHTMLtoPDF.convert({
        html: htmlContent,
        fileName: `Receita_${receita.receita_id}`,
        base64: true,
      });

      Alert.alert('PDF Gerado com Sucesso', `O PDF foi gerado com sucesso: ${pdf.filePath}`);
    } catch (error) {
      console.error('Erro ao gerar o PDF:', error);
    }
  };

  const renderReceitas = () => (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      {filteredReceitas.length > 0 ? (
        filteredReceitas.map((receita, index) => (
          <View key={receita.receita_id} style={styles.card}>
            <Text>Nome: {receita.paci_nome}</Text>
            <Text>Medicamento: {receita.medicamento_nome}</Text>
            <Text>Dosagem: {receita.dosagem}</Text>
            <Text>Data de Emissão: {receita.data_emissao}</Text>
            <TouchableOpacity
              style={styles.expandButton}
              onPress={() => {
                // Atualiza o estado para mostrar ou esconder os detalhes apenas do card clicado
                setExpandedReceitaId(prevId => (prevId === receita.receita_id ? null : receita.receita_id));
              }}
            >
              <Text style={styles.expandButtonText}>
                {expandedReceitaId === receita.receita_id ? 'Ocultar Detalhes' : 'Ver Detalhes'}
              </Text>
            </TouchableOpacity>
            {expandedReceitaId === receita.receita_id && (
              <View style={styles.resultsContainer}>
                <Text style={styles.boldText}>Frequência: {receita.frequencia_dosagem}</Text>
                <Text style={styles.boldText}>Tempo de Uso: {receita.tempo_uso}</Text>
                <Text style={styles.boldText}>Observações: {receita.observacoes || 'N/A'}</Text>
                <TouchableOpacity
                  onPress={() => exportReceitaToPDF(receita)}
                  style={styles.exportButton}
                >
                  <Text style={styles.exportButtonText}>Exportar PDF</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))
      ) : (
        <Text>Nenhuma receita encontrada</Text>
      )}
  
      {/* Botão para levar para outra tela */}
      <TouchableOpacity
        style={styles.navigateButton} // Defina o estilo para o botão
        onPress={() => {
          // Navega para a tela "OutraTela"
          navigation.navigate('CriarExame', {paciId }); // Substitua "OutraTela" pelo nome real da sua tela
        }}
      >
        <Text style={styles.navigateButtonText}>Ir para outra tela</Text>
      </TouchableOpacity>
    </ScrollView>
  );
  
  

  return (
    <View style={styles.container}>
      {/* Menu Section */}
      <View style={styles.menuContainer}>
        {['Perfil', 'Consultas', 'Exames', 'Receitas'].map(menu => (
          <TouchableOpacity
            key={menu}
            style={[styles.menuButton, selectedMenu === menu && styles.selectedMenuButton]}
            onPress={() => setSelectedMenu(menu)}
          >
            <Text style={[styles.menuButtonText, selectedMenu === menu && styles.selectedMenuButtonText]}>
              {menu}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content Section based on the selected menu */}
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {selectedMenu === 'Perfil' && renderProfile()}
        {selectedMenu === 'Consultas' && renderConsultas()}
        {selectedMenu === 'Exames' && renderExames()}
        {selectedMenu === 'Receitas' && renderReceitas()}
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        onRequestClose={closeFilterModal}
        animationType="slide"
      >
        <View style={styles.filterModalContainer}>
          <Text style={styles.filterModalTitle}>Filtrar Consultas</Text>
          <TouchableOpacity onPress={() => handleFilterOption('todas')}>
            <Text style={styles.filterOption}>Todas</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleFilterOption('agendado')}>
            <Text style={styles.filterOption}>Agendado</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleFilterOption('concluido')}>
            <Text style={styles.filterOption}>Concluído</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={closeFilterModal}>
            <Text style={styles.closeModal}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default ExamesScreen;
