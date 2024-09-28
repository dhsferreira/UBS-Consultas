import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, TextInput, Button, FlatList } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../UserContext';
import supabase from '../Supabase';
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
  const [areasList, setAreasList] = useState<Area[]>([]);
  const [diasList, setDiasList] = useState<Dia[]>([]);
  const [horariosList, setHorariosList] = useState<Horario[]>([]);
  const [horariosNaoVinculados, setHorariosNaoVinculados] = useState<Horario[]>([]);
  const { user } = useUser();
  const [ubsPrecedencia, setUbsPrecedencia] = useState<string | null>(null);
  const [ubsNome, setUbsNome] = useState<string | null>(null);

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
          const response = await fetch(`http://10.47.4.51:3000/api/Ubs/${ubsPrecedencia}/nome`);
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
          const response = await fetch(`http://10.47.4.51:3000/api/areas/${ubsPrecedencia}`);
          const data = await response.json();
          if (data.error === '') {
            setAreasList(data.result);
            console.log('Áreas recebidas:', data.result); // Log para inspecionar as áreas
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
          const response = await fetch(`http://10.47.4.51:3000/api/ubs/${ubsPrecedencia}/areas/${selectedAtendimento}/horarios`);
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
          const response = await fetch(`http://10.47.4.51:3000/api/horario/horario/${ubsPrecedencia}/${selectedAtendimento}/${selectedData}`);
          const data = await response.json();
          if (data.error === '') {
            const formattedHorarios = data.result.map((item: Horario) => ({
              ...item,
              horarios_horarios: item.horarios_horarios.slice(0, 5)  // Remove os segundos
            }));
            setHorariosList(formattedHorarios);
          } else {
            console.error('Erro ao buscar os horários:', data.error);
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
          const response = await fetch(`http://10.47.4.51:3000/api/buscarHorariosNaoVinculados/${selectedData}`);
          const data = await response.json();
          if (data.error === '') {
            setHorariosNaoVinculados(data.result);
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

  return (
    <ScrollView style={styles.container}>
      <StatusBar style="auto" />
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
        {diasList.map((dia) => (
          <Picker.Item key={dia.horarios_dia} label={dia.horarios_dia} value={dia.horarios_dia} />
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
        <Picker.Item label="Adicionar um horário" value="" />
        {horariosNaoVinculados.map((horario) => (
          <Picker.Item key={horario.horarios_horarios} label={horario.horarios_horarios} value={horario.horarios_horarios} />
        ))}
      </Picker>

      <TouchableOpacity
  style={styles.button}
  onPress={async () => {
    if (selectedHorario && selectedAtendimento && selectedData) {
      try {
        const response = await fetch('http://10.47.4.51:3000/api/adicionarHorarioAreaMedica', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            area_nome: selectedAtendimento,
            horarios_dia: selectedData,
            horarios_horarios: selectedHorario,
          }),
        });

        const data = await response.json();

        if (data.error === '') {
          Alert.alert("Sucesso", "Consulta agendada com sucesso!");
        } else {
          Alert.alert("Erro", data.error);
        }
      } catch (error) {
        console.error('Erro ao agendar consulta:', error);
        Alert.alert("Erro", "Não foi possível agendar a consulta.");
      }
    } else {
      Alert.alert("Selecione um horário, área e data.");
    }
  }}
>
  <Text style={styles.buttonText}>Agendar Consulta</Text>
</TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subHeaderText: {
    fontSize: 18,
    color: 'gray',
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
  },
  steps: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  horarioItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  horarioText: {
    fontSize: 16,
  },
});