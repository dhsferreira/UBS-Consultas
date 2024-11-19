import React, { useState, useEffect } from 'react';
import { View, Image, Text, TouchableOpacity, TextInput, Button, Alert, ScrollView } from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import axios from 'axios';
import { supabase } from '../Supabase'; // Importa seu Supabase existente
import { styles } from '../CriarExame/CriarExames';

const Consultas = ({ route }) => {
  const navigation = useNavigation();
  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const [ubsId, setUbsId] = useState('');
  const [ubsNome, setUbsNome] = useState(''); // Estado para armazenar o nome da UBS
  const [mediId, setMediId] = useState(''); // Estado para armazenar medi_id
  const [mediNome, setMediNome] = useState(''); // Estado para armazenar medi_nome
  const [paciId, setPaciId] = useState(route.params.paciId || '');
  const [medicamentoNome, setMedicamentoNome] = useState('');
  const [dosagem, setDosagem] = useState('');
  const [frequenciaDosagem, setFrequenciaDosagem] = useState('');
  const [tempoUso, setTempoUso] = useState('');
  const [observacaoMedica, setObservacaoMedica] = useState('');
  const [dataEmissao, setDataEmissao] = useState('');
  const [dataValidade, setDataValidade] = useState('');
  const [paciNome, setPaciNome] = useState('');

  // useEffect para buscar o nome do paciente
  useEffect(() => {
    const fetchPaciNome = async () => {
      try {
        const response = await axios.get(`http://192.168.0.103:3000/api/Nome/${paciId}`);
        setPaciNome(response.data.paci_nome);
      } catch (error) {
        console.error('Erro ao buscar o nome do paciente:', error);
      }
    };

    if (paciId) {
      fetchPaciNome();
    }
  }, [paciId]);

  // useEffect para obter o medi_id, ubs_id e medi_nome do médico logado
  useEffect(() => {
    const fetchMediIdEubsId = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Erro ao obter usuário:', error);
        return;
      }

      if (user) {
        const { data: medicoData, error: fetchError } = await supabase
          .from('medico')
          .select('medi_id, ubs_id, medi_nome')
          .eq('medi_email', user.email)
          .single();

        if (fetchError) {
          console.error('Erro ao buscar medi_id, ubs_id e medi_nome:', fetchError);
          return;
        }

        setMediId(medicoData.medi_id);
        setUbsId(medicoData.ubs_id);
        setMediNome(medicoData.medi_nome);

        fetchUbsNome(medicoData.ubs_id);
      }
    };

    fetchMediIdEubsId();
  }, []);

  const fetchUbsNome = async (ubsId) => {
    try {
      const response = await axios.get(`http://192.168.0.103:3000/api/Ubs/${ubsId}/nome`);
      console.log('Resposta da API de UBS:', response.data);
      setUbsNome(response.data.result.ubs_nome);
    } catch (error) {
      console.error('Erro ao buscar o nome da UBS:', error);
    }
  };
  
  useEffect(() => {
    console.log('Nome da UBS atualizado:', ubsNome);
  }, [ubsNome]);

  const adicionarReceita = async () => {
    try {
      const response = await axios.post('http://192.168.0.103:3000/api/criarReceita', {
        ubs_id: ubsId,
        medi_id: mediId,
        paci_id: paciId,
        medicamento_nome: medicamentoNome,
        dosagem: dosagem,
        frequencia_dosagem: frequenciaDosagem,
        tempo_uso: tempoUso,
        observacao_medica: observacaoMedica,
        data_emissao: dataEmissao,
        data_validade: dataValidade,
      });
      Alert.alert('Sucesso', `Receita adicionada com ID: ${response.data.result.receita_id}`);
      // Navegação após sucesso na criação da receita
      navigation.navigate('ExamesMed', { paciId });
    } catch (error) {
      console.log(error);
      Alert.alert('Erro', 'Não foi possível adicionar a receita. Verifique os dados e tente novamente.');
    }
  };

  const cancelarReceita = () => {
    navigation.navigate('ExamesMed', { paciId });
  };

  return (
    <View style={styles.container}>
     <View style={styles.header}>
  <TouchableOpacity style={styles.leftButton} onPress={openDrawer}>
    <Image source={require('../assets/3 linhas.png')} style={styles.buttonImage} />
  </TouchableOpacity>
  
  {/* Logo transformada em botão */}
  <TouchableOpacity onPress={() => navigation.navigate('Noticias')}>
    <Image source={require('../assets/ubsLogo.png')} style={styles.centerImage} />
  </TouchableOpacity>
</View>


      <View style={styles.secondHeader}>
        <Text style={styles.smallText}>Você está em Home / Adicionar Receita</Text>
        <Text style={styles.largeText}>Adicionar Receita</Text>
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        <TextInput
          style={styles.input}
          placeholder={`${ubsNome}`}
          value={ubsId}
          editable={false}
        />
        <TextInput
          style={styles.input}
          placeholder={`${mediNome}`}
          value={mediId}
          editable={false}
        />
        <TextInput
          style={styles.input}
          placeholder={`${paciNome}`}
          value={paciId}
          editable={false}
        />
        <TextInput
          style={styles.input}
          placeholder="Nome do Medicamento"
          value={medicamentoNome}
          onChangeText={setMedicamentoNome}
        />
        <TextInput
          style={styles.input}
          placeholder="Dosagem"
          value={dosagem}
          onChangeText={setDosagem}
        />
        <TextInput
          style={styles.input}
          placeholder="Frequência da Dosagem"
          value={frequenciaDosagem}
          onChangeText={setFrequenciaDosagem}
        />
        <TextInput
          style={styles.input}
          placeholder="Tempo de Uso"
          value={tempoUso}
          onChangeText={setTempoUso}
        />
        <TextInput
          style={styles.input}
          placeholder="Observação Médica"
          value={observacaoMedica}
          onChangeText={setObservacaoMedica}
        />
        <TextInput
          style={styles.input}
          placeholder="Data de Emissão (YYYY-MM-DD)"
          value={dataEmissao}
          onChangeText={setDataEmissao}
        />
        <TextInput
          style={styles.input}
          placeholder="Data de Validade (YYYY-MM-DD)"
          value={dataValidade}
          onChangeText={setDataValidade}
        />

        <View style={styles.buttonContainer}>
          <Button title="Adicionar Receita" onPress={adicionarReceita} />
          <TouchableOpacity style={styles.cancelButton} onPress={cancelarReceita}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default Consultas;
