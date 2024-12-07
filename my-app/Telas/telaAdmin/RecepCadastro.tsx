import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView, // Importa o ScrollView
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { TextInputMask } from 'react-native-masked-text';
import axios from 'axios';

const CadastrarRecepcionista = () => {
  const [form, setForm] = useState({
    recep_nome: '',
    recep_CPF: '',
    recep_cel: '',
    recep_email: '',
    recep_senha: '',
    ubs_id: '',
  });
  const [ubsList, setUbsList] = useState([]);
  const [selectedUbs, setSelectedUbs] = useState('');
  const [ubsDetails, setUbsDetails] = useState(null);

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
      fetchUbsDetails(selectedUbs);
    }
  }, [selectedUbs]);

  const fetchUbsDetails = async (ubs_id) => {
    try {
      const response = await axios.get(`http://192.168.0.100:3000/api/Recep/${ubs_id}`);
      if (response.data.result && Array.isArray(response.data.result)) {
        setUbsDetails(response.data.result);
      } else {
        setUbsDetails([]);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Falha ao buscar dados da UBS. Tente novamente.');
      setUbsDetails([]);
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
    if (!validateEmail(form.recep_email)) {
      Alert.alert('Erro', 'Por favor, insira um e-mail válido.');
      return;
    }
  
    const formData = {
      ...form,
      recep_CPF: form.recep_CPF.replace(/\D/g, ''), // Remove máscaras do CPF
      recep_cel: form.recep_cel.replace(/\D/g, '')  // Remove máscaras do celular
    };
  
    try {
      // Envia os dados para cadastrar o recepcionista
      const response = await axios.post('http://192.168.0.100:3000/api/recepcionista', formData);
      Alert.alert('Sucesso', `Recepcionista cadastrado com sucesso! ID: ${response.data.recep_id}`);
      
      // Atualiza a lista de recepcionistas da UBS selecionada
      fetchUbsDetails(form.ubs_id); // Passa o ID da UBS do formulário para atualizar a lista de recepcionistas
  
      // Limpa o formulário após o cadastro
      setForm({
        recep_nome: '',
        recep_CPF: '',
        recep_cel: '',
        recep_email: '',
        recep_senha: '',
        ubs_id: ''
      });
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Falha ao cadastrar recepcionista. Verifique os dados e tente novamente.');
    }
  };
  

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Cadastrar Recepcionista</Text>

        <Text style={styles.label}>Escolha a UBS</Text>
        <Picker
          selectedValue={selectedUbs}
          onValueChange={(value) => {
            setSelectedUbs(value);
            handleChange('ubs_id', value);
          }}
          style={styles.input}
        >
          <Picker.Item label="Selecione a UBS" value="" />
          {ubsList.map((ubs) => (
            <Picker.Item key={ubs.ubs_id} label={ubs.ubs_nome} value={ubs.ubs_id} />
          ))}
        </Picker>

        {ubsDetails && ubsDetails.length > 0 ? (
          <View style={styles.ubsDetails}>
            <Text style={styles.title}>Recepcionistas:</Text>
            {ubsDetails.map((item, index) => (
              <Text key={item.recep_id || index}>
                - {item.recep_nome || 'Nome não disponível'}
              </Text>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyList}></Text>
        )}

        <TextInput
          style={styles.input}
          placeholder="Nome"
          value={form.recep_nome}
          onChangeText={(value) => handleChange('recep_nome', value)}
        />

        <TextInputMask
          style={styles.input}
          placeholder="CPF"
          value={form.recep_CPF}
          onChangeText={(value) => handleChange('recep_CPF', value)}
          type={'cpf'}
          keyboardType="numeric"
        />

        <TextInputMask
          style={styles.input}
          placeholder="Celular"
          value={form.recep_cel}
          onChangeText={(value) => handleChange('recep_cel', value)}
          type={'cel-phone'}
          options={{ maskType: 'BR' }}
          keyboardType="numeric"
        />

        <TextInput
          style={styles.input}
          placeholder="E-mail"
          value={form.recep_email}
          onChangeText={(value) => handleChange('recep_email', value)}
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          value={form.recep_senha}
          onChangeText={(value) => handleChange('recep_senha', value)}
          secureTextEntry
        />

        <Button title="Cadastrar Recepcionista" onPress={handleSubmit} />
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

export default CadastrarRecepcionista;
