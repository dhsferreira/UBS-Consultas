import React, { useState, useEffect } from 'react';
import { View, Image, Text, TouchableOpacity, TextInput, Button, Alert } from 'react-native';
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
        const response = await axios.get(`http://10.47.2.96:3000/api/Nome/${paciId}`);
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
        // Busca o medi_id, ubs_id e medi_nome na tabela medico
        const { data: medicoData, error: fetchError } = await supabase
          .from('medico')
          .select('medi_id, ubs_id, medi_nome')
          .eq('medi_email', user.email) // Assume que o email é a chave para encontrar o médico
          .single();

        if (fetchError) {
          console.error('Erro ao buscar medi_id, ubs_id e medi_nome:', fetchError);
          return;
        }

        setMediId(medicoData.medi_id); // Armazena o medi_id no estado
        setUbsId(medicoData.ubs_id); // Armazena o ubs_id no estado
        setMediNome(medicoData.medi_nome); // Armazena o nome do médico

        // Após obter o ubs_id, busca o nome da UBS
        fetchUbsNome(medicoData.ubs_id);
      }
    };

    fetchMediIdEubsId();
  }, []);

  // useEffect para buscar o nome da UBS
  const fetchUbsNome = async (ubsId) => {
    try {
      const response = await axios.get(`http://10.47.2.96:3000/api/Ubs/${ubsId}/nome`);
      console.log('Resposta da API de UBS:', response.data); // Adiciona log da resposta
      setUbsNome(response.data.result.ubs_nome);
      // Armazena o nome da UBS
    } catch (error) {
      console.error('Erro ao buscar o nome da UBS:', error);
    }
  };
  
  // useEffect para monitorar ubsNome após a atualização
  useEffect(() => {
    console.log('Nome da UBS atualizado:', ubsNome);
  }, [ubsNome]);
  

  // Função para enviar o POST
  const adicionarReceita = async () => {
    try {
      const response = await axios.post('http://10.47.2.96:3000/api/criarReceita', {
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
    } catch (error) {
      console.log(error);
      Alert.alert('Erro', 'Não foi possível adicionar a receita. Verifique os dados e tente novamente.');
    }
  };

  // Função para cancelar a operação e navegar para a tela "Exame"
  const cancelarReceita = () => {
    navigation.navigate('Exames', { paciId });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.leftButton} onPress={openDrawer}>
          <Image source={require('../assets/3 linhas.png')} style={styles.buttonImage} />
        </TouchableOpacity>
        <Image source={require('../assets/ubsLogo.png')} style={styles.centerImage} />
      </View>

      <View style={styles.secondHeader}>
        <Text style={styles.smallText}>Você está em Home / Adicionar Receita</Text>
        <Text style={styles.largeText}>Adicionar Receita</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder={`${ubsNome}`} // Coloca o nome da UBS no placeholder
          value={ubsId} // Continua mostrando o ubsId no value
          editable={false} // Defina como não editável
        />
        <TextInput
          style={styles.input}
          placeholder={`${mediNome}`} // Mostra o nome do médico no placeholder
          value={mediId} // Exibe o medi_id no value
          editable={false} // Defina como não editável
        />
        <TextInput
          style={styles.input}
          placeholder={`${paciNome}`} // Coloca o nome do paciente no placeholder
          value={paciId}
          editable={false} // Defina como não editável
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
      </View>
    </View>
  );
};

export default Consultas;
