import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { TextInputMask } from 'react-native-masked-text';
import axios from 'axios';

const CadastrarMedico = () => {
  const [form, setForm] = useState({
    medi_nome: '',
    medi_CPF: '',
    medi_cel: '',
    medi_email: '',
    medi_senha: '',
    ubs_id: '',
    area_nome: '',
    medi_CRM: '', // Novo campo CRM
    medi_especializa: '', // Novo campo Especialização
  });
  const [ubsList, setUbsList] = useState([]);
  const [selectedUbs, setSelectedUbs] = useState('');
  const [areasList, setAreasList] = useState([]);
  const [selectedArea, setSelectedArea] = useState('');
  const [medicosList, setMedicosList] = useState([]);

  useEffect(() => {
    const fetchUbs = async () => {
      try {
        const response = await axios.get('http://192.168.0.100:3000/api/Ubs');
        setUbsList(response.data.result);
      } catch (error) {
        console.error(error);
        Alert.alert('Erro', 'Falha ao buscar UBS. Tente novamente.');
      }
    };
    fetchUbs();
  }, []);

  useEffect(() => {
    if (selectedUbs) {
      fetchAreas(selectedUbs);
    }
  }, [selectedUbs]);

  useEffect(() => {
    if (selectedArea) {
      fetchMedicos(selectedArea); // Passando selectedArea, que é area_nome
    }
  }, [selectedArea]);

  const fetchAreas = async (ubs_id) => {
    try {
      const response = await axios.get(`http://192.168.0.100:3000/api/areas/${ubs_id}`);
      if (response.data.result && Array.isArray(response.data.result)) {
        console.log('Resultado:', response.data.result);
        setAreasList(response.data.result);
      } else {
        setAreasList([]);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Falha ao buscar áreas da UBS. Tente novamente.');
      setAreasList([]);
    }
  };

  const fetchMedicos = async (area_nome) => {
    try {
      const response = await axios.get(`http://192.168.0.100:3000/api/Medic/${area_nome}`);
      if (response.data.result && Array.isArray(response.data.result)) {
        console.log('Resultado:', response.data);
        setMedicosList(response.data.result);
      } else {
        setMedicosList([]);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Falha ao buscar médicos da área. Tente novamente.');
      setMedicosList([]);
    }
  };

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const validateEmail = (email) => {
    const emailRegex = /\S+@\S+\.\S+/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    // Validação do e-mail
    if (!validateEmail(form.medi_email)) {
      Alert.alert('Erro', 'Por favor, insira um e-mail válido.');
      return;
    }
  
    // Formatação dos dados para remover as máscaras
    const formData = {
      ...form,
      medi_CPF: form.medi_CPF.replace(/\D/g, ''), // Remove a máscara do CPF
      medi_cel: form.medi_cel.replace(/\D/g, ''),  // Remove a máscara do celular
      medi_area: form.area_nome // Substitui "area_nome" por "medi_area"
    };
  
    // Imprime os dados que serão enviados no console
    console.log('Enviando os seguintes dados para o cadastro do médico:', formData);
  
    try {
      // Envia os dados para cadastrar o médico
      const response = await axios.post('http://192.168.0.100:3000/api/Medico', formData);
  
      // Verifique a resposta do servidor no log
      console.log('Resposta do servidor:', response);
  
      // Verifique se a resposta contém a propriedade 'result' e 'medi_id'
      if (response.status === 200 && response.data.result && response.data.result.medi_id) {
        const medi_id = response.data.result.medi_id;
  
        Alert.alert('Sucesso', `Médico cadastrado com sucesso! ID: ${medi_id}`);
  
        // Atualiza a lista de médicos chamando a função fetchMedicos
        fetchMedicos(form.area_nome);
  
        // Limpa o formulário após o cadastro
        setForm({
          medi_nome: '',
          medi_CPF: '',
          medi_cel: '',
          medi_email: '',
          medi_senha: '',
          ubs_id: '',
          area_nome: '',
          medi_CRM: '',
          medi_especializa: ''
        });
      } else {
        console.error('Erro: ID do médico não encontrado na resposta.');
        Alert.alert('Erro', 'Falha ao cadastrar médico. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro no cadastro:', error);
  
      // Verifica o erro completo
      if (error.response) {
        console.error('Erro na resposta do servidor:', error.response.data);
        Alert.alert('Erro', `Falha ao cadastrar médico: ${error.response.data.message || 'Verifique os dados e tente novamente.'}`);
      } else {
        Alert.alert('Erro', 'Falha na conexão com o servidor. Tente novamente mais tarde.');
      }
    }
  };
  
  
  
  
  
  
  

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Cadastrar Médico</Text>

        <Text style={styles.label}>Escolha a UBS</Text>
        <Picker
          selectedValue={selectedUbs}
          onValueChange={(value) => {
            setSelectedUbs(value);
            handleChange('ubs_id', value);
            setSelectedArea('');
            setMedicosList([]);
          }}
          style={styles.input}
        >
          <Picker.Item label="Selecione a UBS" value="" />
          {ubsList.map((ubs) => (
            <Picker.Item key={ubs.ubs_id} label={ubs.ubs_nome} value={ubs.ubs_id} />
          ))}
        </Picker>

        {areasList.length > 0 && (
          <>
            <Text style={styles.label}>Escolha a Área</Text>
            <Picker
              selectedValue={selectedArea}
              onValueChange={(value) => {
                setSelectedArea(value);
                handleChange('area_nome', value);
              }}
              style={styles.input}
            >
              <Picker.Item label="Selecione a Área" value="" />
              {areasList.map((area) => (
                <Picker.Item key={area.area_id} label={area.area_nome} value={area.area_nome} />
              ))}
            </Picker>
          </>
        )}

        {medicosList.length > 0 && (
          <View style={styles.ubsDetails}>
            <Text style={styles.title}>Médicos:</Text>
            {medicosList.map((item, index) => (
              <Text key={item.medi_id || index}>
                Nome: {item.medi_nome || 'Nome não disponível'}
              </Text>
            ))}
          </View>
        )}

        <TextInput
          style={styles.input}
          placeholder="Nome"
          value={form.medi_nome}
          onChangeText={(value) => handleChange('medi_nome', value)}
        />

        <TextInputMask
          style={styles.input}
          placeholder="CPF"
          value={form.medi_CPF}
          onChangeText={(value) => handleChange('medi_CPF', value)}
          type={'cpf'}
          keyboardType="numeric"
        />

        <TextInputMask
          style={styles.input}
          placeholder="Celular"
          value={form.medi_cel}
          onChangeText={(value) => handleChange('medi_cel', value)}
          type={'cel-phone'}
          options={{ maskType: 'BR' }}
          keyboardType="numeric"
        />

        <TextInput
          style={styles.input}
          placeholder="E-mail"
          value={form.medi_email}
          onChangeText={(value) => handleChange('medi_email', value)}
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          value={form.medi_senha}
          onChangeText={(value) => handleChange('medi_senha', value)}
          secureTextEntry
        />

        <TextInput
          style={styles.input}
          placeholder="CRM"
          value={form.medi_CRM}
          onChangeText={(value) => handleChange('medi_CRM', value)}
        />

        <TextInput
          style={styles.input}
          placeholder="Especialização"
          value={form.medi_especializa}
          onChangeText={(value) => handleChange('medi_especializa', value)}
        />

        <Button title="Cadastrar Médico" onPress={handleSubmit} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  ubsDetails: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 5,
    marginBottom: 20,
  },
});

export default CadastrarMedico;
