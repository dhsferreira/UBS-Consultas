import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Image } from 'react-native';
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
      console.log('Buscando consultas para paciId:', paciId); // Verifica o paciId antes de fazer a requisição
      const response = await axios.get(`http://192.168.0.102:3000/api/Consulta/${paciId}`);
      
      // Log para inspecionar a estrutura completa da resposta
    //  console.log('Resposta completa da API (Consultas):', JSON.stringify(response.data, null, 2));
      
      // Se a estrutura da resposta for diferente do esperado, faça os ajustes necessários
      if (response.data.result && Array.isArray(response.data.result.result)) {
        setConsultas(response.data.result.result); // Acessando o array correto
        setFilteredConsultas(response.data.result.result); // Acessando o array correto
      } else {
        console.log('A estrutura de dados não é a esperada:', response.data);
      }
    } catch (error) {
      console.error('Erro ao buscar consultas:', error);
    }
  };
  

  const fetchExames = async () => {
    try {
      const response = await axios.get(`http://192.168.0.102:3000/api/paciente/${paciId}/exames`);
      setExames(response.data.result || []);
      setFilteredExames(response.data.result || []);
    } catch (error) {
      console.error('Erro ao buscar exames:', error);
    }
  };

  const fetchReceitas = async () => {
    try {
      const response = await axios.get(`http://192.168.0.102:3000/api/paciente/${paciId}/receitas`);
      setReceitas(response.data.result || []);
      setFilteredReceitas(response.data.result || []);
    } catch (error) {
      console.error('Erro ao buscar Receitas:', error);
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
  const formattedDate = date.split('/').reverse().join('-'); // Formata a data para o padrão YYYY-MM-DD

  // Filtrando de acordo com o menu selecionado
  if (selectedMenu === 'Consultas') {
    const filtered = consultas.filter(consulta =>
      consulta.horarios_dia.includes(formattedDate)
    );
    setFilteredConsultas(date ? filtered : consultas);
  } else if (selectedMenu === 'Exames') {
    const filtered = exames.filter(exame =>
      exame.exame_dia.includes(formattedDate)
    );
    setFilteredExames(date ? filtered : exames);
  } else if (selectedMenu === 'Receitas') {
    const filtered = receitas.filter(receita =>
      receita.data_emissao.includes(formattedDate)
    );
    setFilteredReceitas(date ? filtered : receitas);
  }
};

const openFilterModal = () => {
  setFilterModalVisible(true);
};

const closeFilterModal = () => {
  setFilterModalVisible(false);
};

const handleFilterOption = (status) => {
  setSelectedFilter(status);

  // Filtrando de acordo com o menu selecionado
  if (selectedMenu === 'Consultas') {
    const filtered = status === 'todas' ? consultas : consultas.filter(consulta => consulta.consul_estado === status);
    setFilteredConsultas(filtered);
  } else if (selectedMenu === 'Exames') {
    const filtered = status === 'todas' ? exames : exames.filter(exame => exame.exame_estado === status);
    setFilteredExames(filtered);
  } else if (selectedMenu === 'Receitas') {
    const filtered = status === 'todas' ? receitas : receitas.filter(receita => receita.receita_estado === status);
    setFilteredReceitas(filtered);
  }

  closeFilterModal();
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Mês começa de 0
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
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
        <Text style={styles.infoText}>{formatDate(userInfo.paci_data_nascimento)}</Text>
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
                // Altera o ID expandido. Se o ID atual for igual ao que está expandido, fecha, senão, abre o novo
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

  const renderReceitas = () => (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      {filteredReceitas.length > 0 ? (
        filteredReceitas.map((receita, index) => (
          <View key={index} style={styles.card}>
            <Text>Nome do Paciente: {receita.paci_nome}</Text>
            <Text>UBS: {receita.ubs_nome}</Text>
            <Text>Data de Emissão: {receita.data_emissao}</Text>
           
            
            <TouchableOpacity
              style={styles.expandButton}
              onPress={() => {
                // Altera o ID expandido. Se o ID atual for igual ao que está expandido, fecha, senão, abre o novo
                setExpandedReceitaId(prevId => (prevId === receita.receita_id ? null : receita.receita_id));
              }}
            >
              <Text style={styles.expandButtonText}>
                {expandedReceitaId === receita.receita_id ? 'Ocultar Detalhes' : 'Ver Detalhes'}
              </Text>
            </TouchableOpacity>
  
            {expandedReceitaId === receita.receita_id && (
              <View style={styles.resultsContainer}>
                <Text>-Medicamento: {receita.medicamento_nome}</Text>
                <Text>-Dosagem: {receita.dosagem}</Text>
                <Text>-Frequência de Uso: {receita.frequencia_dosagem}</Text>
                <Text>-Tempo de Uso: {receita.tempo_uso}</Text>
                <Text>-Data de Validade: {receita.data_validade}</Text>
                <Text>-Observação: {receita.observacao_medica}</Text>
              </View>
            )}
          </View>
        ))
      ) : (
        <Text>Nenhuma receita encontrada</Text>
      )}
       <TouchableOpacity
        style={styles.createRecipeButton}
        onPress={() => navigation.navigate('CriarExame', { paciId })}
      >
        <Text style={styles.createRecipeButtonText}>Criar Receita</Text>
      </TouchableOpacity>
    </ScrollView>
    
  );
  
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
    <TouchableOpacity style={styles.leftButton} onPress={() => { /* lógica para abrir o drawer */ }}>
      <Image source={require('../assets/3 linhas.png')} style={styles.buttonImage} />
    </TouchableOpacity>
    
    {/* Logo como botão para navegar para outra tela */}
    <TouchableOpacity onPress={() => navigation.navigate('Noticias')}>
      <Image source={require('../assets/ubsLogo.png')} style={styles.centerImage} />
    </TouchableOpacity>
  </View>
      <View style={styles.secondHeader}>
        <Text style={styles.smallText}>Você está em Home / Perfil do paciente</Text>
        <Text style={styles.largeText}>Perfil do paciente</Text>
      </View>

      <View style={styles.menuContainer}>
        {['Perfil', 'Consultas', 'Exames', 'Receitas'].map(menu => (
          <TouchableOpacity
            key={menu}
            style={[styles.menuButton, selectedMenu === menu && styles.menuButtonSelected]}
            onPress={() => setSelectedMenu(menu)}
          >
            <Text style={[styles.menuButtonText, selectedMenu === menu && styles.menuButtonTextSelected]}>
              {menu}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Campo de pesquisa */}
{['Consultas', 'Exames', 'Receitas'].includes(selectedMenu) && (
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
    {selectedMenu === 'Consultas' && (
      <TouchableOpacity style={styles.filterButton} onPress={openFilterModal}>
        <Text style={styles.filterButtonText}>Filtrar</Text>
      </TouchableOpacity>
    )}
  </View>
)}


      {/* Renderização do conteúdo com base no menu selecionado */}
      {selectedMenu === 'Perfil' && renderProfile()}
      {selectedMenu === 'Consultas' && renderConsultas()}
      {selectedMenu === 'Exames' && renderExames()}
      {selectedMenu === 'Receitas' && renderReceitas()}

      {/* Modal de filtro */}
      <Modal visible={filterModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Filtrar Consultas por Status</Text>
          {['todas', 'confirmada', 'pendente', 'cancelada'].map(status => (
            <TouchableOpacity key={status} onPress={() => handleFilterOption(status)}>
              <Text style={styles.modalOption}>{status}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={closeFilterModal}>
            <Text style={styles.closeModal}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default ExamesScreen;
