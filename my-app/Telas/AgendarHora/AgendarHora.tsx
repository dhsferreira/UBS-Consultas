import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, FlatList, SafeAreaView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { StatusBar } from 'expo-status-bar';
import { useUser } from '../UserContext';
import supabase from '../Supabase';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface Area {
  area_id: number;
  area_nome: string;
}

interface Dia {
  horarios_dia: string;
}

interface Horario {
  horarios_horarios: string;
  horarios_dispo: string;
}

export default function App() {
  const [selectedAtendimento, setSelectedAtendimento] = useState('');
  const [selectedData, setSelectedData] = useState('');
  const [selectedHorario, setSelectedHorario] = useState('');
  const [areasList, setAreasList] = useState([]);
  const [diasList, setDiasList] = useState([]);
  const [horariosList, setHorariosList] = useState([]);
  const [horariosNaoVinculados, setHorariosNaoVinculados] = useState([]);
  const { user } = useUser();
  const [ubsPrecedencia, setUbsPrecedencia] = useState(null);
  const [ubsNome, setUbsNome] = useState(null);

  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        let data, error;
        if (user.type === 'Recepcionista') {
          ({ data, error } = await supabase
            .from('recepcionista')
            .select('*')
            .eq('recep_id', user.id)
            .single());

          if (error) {
            throw error;
          }

          if (data.ubs_id) {
            setUbsPrecedencia(data.ubs_id.toString());
          }
        }
      } catch (error) {
        console.error('Erro ao buscar informações da recepcionista:', error);
      }
    };

    fetchUserInfo();
  }, [user.id, user.type]);

  useEffect(() => {
    if (ubsPrecedencia) {
      const fetchUbsNome = async () => {
        try {
          const response = await fetch(`http://192.168.137.1:3000/api/Ubs/${ubsPrecedencia}/nome`);
          const data = await response.json();
          if (data.error === '') {
            setUbsNome(data.result.ubs_nome);
          } else {
            console.error('Erro ao buscar o nome da UBS:', data.error);
          }
        } catch (error) {
          console.error('Erro ao buscar o nome da UBS:', error);
        }
      };

      fetchUbsNome();
    }
  }, [ubsPrecedencia]);

  useEffect(() => {
    if (ubsPrecedencia !== '') {
      const fetchAreas = async () => {
        try {
          const response = await fetch(`http://192.168.137.1:3000/api/areas/${ubsPrecedencia}`);
          const data = await response.json();
          if (data.error === '') {
            setAreasList(data.result);
          } else {
            console.error('Erro ao buscar as áreas:', data.error);
          }
        } catch (error) {
          console.error('Erro ao buscar as áreas:', error);
        }
      };

      fetchAreas();
    } else {
      setAreasList([]);
    }
  }, [ubsPrecedencia]);

  useEffect(() => {
    if (selectedAtendimento !== '' && ubsPrecedencia !== '') {
      const fetchDias = async () => {
        try {
          const response = await fetch(`http://192.168.137.1:3000/api/buscarDiasNaoVinculados`);
          const data = await response.json();

          if (data.error === '') {
            setDiasList(data.result);
          } else {
            console.error('Erro ao buscar os dias:', data.error);
          }
        } catch (error) {
          console.error('Erro ao buscar os dias:', error);
        }
      };

      fetchDias();
    } else {
      setDiasList([]);
    }
  }, [selectedAtendimento, ubsPrecedencia]);

  useEffect(() => {
    if (selectedData !== '' && selectedAtendimento !== '' && ubsPrecedencia !== '') {
      const fetchHorarios = async () => {
        try {
          const response = await fetch(`http://192.168.137.1:3000/api/horario/${ubsPrecedencia}/${selectedAtendimento}/${selectedData}`);

          if (!response.ok) {
            console.error(`Erro: Status da resposta ${response.status}`);
            return;
          }

          const data = await response.json();

          if (data && data.result && !data.error) {
            const formattedHorarios = data.result.map((item: Horario) => ({
              ...item,
              horarios_horarios: item.horarios_horarios.slice(0, 5)  // Remove os segundos
            }));
            setHorariosList(formattedHorarios);
          } else if (data && data.error) {
            console.error('Erro ao buscar os horários:', data.error);
          } else {
            console.error('Erro ao buscar os horários: Formato de resposta inesperado', data);
          }
        } catch (error) {
          console.error('Erro ao buscar os horários:', error);
        }
      };

      fetchHorarios();
    } else {
      setHorariosList([]);
    }
  }, [selectedData, selectedAtendimento, ubsPrecedencia]);

  useEffect(() => {
    if (selectedData !== '') {
      const fetchHorariosNaoVinculados = async () => {
        try {
          const response = await fetch(`http://192.168.137.1:3000/api/buscarHorariosNaoVinculados/${selectedData}`);
          const data = await response.json();
          if (data.error === '') {
            const uniqueHorarios = Array.from(new Set(data.result.map(horario => horario.horarios_horarios)));
            setHorariosNaoVinculados(uniqueHorarios.map(horario => ({ horarios_horarios: horario })));
          } else {
            console.error('Erro ao buscar horários não vinculados:', data.error);
          }
        } catch (error) {
          console.error('Erro ao buscar horários não vinculados:', error);
        }
      };

      fetchHorariosNaoVinculados();
    } else {
      setHorariosNaoVinculados([]);
    }
  }, [selectedData]);

  const handleAgendar = () => {
    if (selectedAtendimento && selectedData && selectedHorario) {
      Alert.alert('Consulta Agendada', `Atendimento: ${selectedAtendimento}\nData: ${selectedData}\nHorário: ${selectedHorario}`);
    } else {
      Alert.alert('Erro', 'Por favor, selecione atendimento, data e horário.');
    }
  };

  const adicionarHorario = async () => {
    if (selectedData && selectedHorario && selectedAtendimento) {
      try {
        const response = await fetch('http://192.168.1.2:3000/api/adicionarHorarioAreaMedica', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            horarios_dia: selectedData,
            horarios_horarios: selectedHorario,
            area_nome: selectedAtendimento,
          }),
        });

        const data = await response.json();

        if (data.error === '') {
          Alert.alert('Sucesso', 'Horário adicionado com sucesso!');
        } else {
          Alert.alert('Erro', 'Erro ao adicionar horário: ' + data.error);
        }
      } catch (error) {
        console.error('Erro ao adicionar horário:', error);
        Alert.alert('Erro', 'Erro ao adicionar horário.');
      }
    } else {
      Alert.alert('Erro', 'Selecione todos os campos para adicionar o horário.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={24} color="#0000ff" />
        </TouchableOpacity>
        <View style={styles.header}>
          <Text style={styles.headerText}>UBS</Text>
          <Text style={styles.subHeaderText}>Unidade Básica de Saúde</Text>
        </View>
        <Text style={styles.title}>Agendar</Text>
        <View style={styles.steps}>
          <Ionicons name="desktop-outline" size={24} color="black" />
          <Ionicons name="create-outline" size={24} color="black" />
          <Ionicons name="checkmark-circle-outline" size={24} color="black" />
        </View>
       
        <Text style={styles.subtitle}>UBS: {ubsNome || 'Carregando...'}</Text>

        <Text style={styles.subtitle}>Escolha o atendimento:</Text>
        <Picker
          selectedValue={selectedAtendimento}
          onValueChange={(itemValue) => setSelectedAtendimento(itemValue)}
          enabled={ubsPrecedencia !== null}
        >
          <Picker.Item label="Selecione uma área" value="" />
          {areasList.map((area) => (
            <Picker.Item key={area.area_id} label={area.area_nome} value={area.area_nome} />
          ))}
        </Picker>

        <Text style={styles.subtitle}>Escolha o dia:</Text>
        <Picker
          selectedValue={selectedData}
          onValueChange={(itemValue) => setSelectedData(itemValue)}
          enabled={selectedAtendimento !== ''}
        >
          <Picker.Item label="Selecione uma data" value="" />
          {diasList.map((dia, index) => (
            <Picker.Item key={index} label={dia} value={dia} />
          ))}
        </Picker>

        <Text style={styles.subtitle}>Horários Disponíveis:</Text>
        <FlatList
          data={horariosList}
          keyExtractor={(item) => item.horarios_horarios}
          renderItem={({ item }) => (
            <View style={styles.horarioItem}>
              <Text style={styles.horarioText}>- {item.horarios_horarios}</Text>
            </View>
          )}
        />
        <Picker
          selectedValue={selectedHorario}
          onValueChange={(itemValue) => setSelectedHorario(itemValue)}
          enabled={selectedData !== ''}
        >
          <Picker.Item label="Selecione um horário" value="" />
          {horariosNaoVinculados.map((horario, index) => (
            <Picker.Item key={index} label={horario.horarios_horarios} value={horario.horarios_horarios} />
          ))}
        </Picker>

        {/* Botão para adicionar horário */}
        <TouchableOpacity style={styles.button} onPress={adicionarHorario}>
          <Text style={styles.buttonText}>Adicionar Horário</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    paddingHorizontal: 16,
  },
  scrollContainer: {
    paddingVertical: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subHeaderText: {
    fontSize: 16,
    color: '#555',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  steps: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  horarioItem: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#d3d3d3',
    borderRadius: 5,
    marginVertical: 5,
  },
  horarioText: {
    fontSize: 14,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
