import React, { useState, useEffect, useCallback } from 'react';
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
          const response = await fetch(`http://192.168.0.102:3000/api/Ubs/${ubsPrecedencia}/nome`);
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
          const response = await fetch(`http://192.168.0.102:3000/api/areas/${ubsPrecedencia}`);
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
          const response = await fetch(`http://192.168.0.102:3000/api/buscarDiasNaoVinculados`);
          const data = await response.json();
          console.log(data); // Adicione este console.log para verificar a estrutura do retorno
          
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
    console.log("selectedData:", selectedData);
    console.log("selectedAtendimento:", selectedAtendimento);
    console.log("ubsPrecedencia:", ubsPrecedencia);

    if (selectedData !== '' && selectedAtendimento !== '' && ubsPrecedencia !== '') {
      const fetchHorarios = async () => {
        try {
          console.log("Fetching data for:", selectedData);
          const response = await fetch(`http://192.168.0.102:3000/api/horario/${ubsPrecedencia}/${selectedAtendimento}/${selectedData}`);
          
          if (!response.ok) {
            console.error(`Erro: Status da resposta ${response.status}`);
            return;
          }

          const data = await response.json();
          console.log("Data received:", data);  // Exibir o conteúdo completo da resposta da API

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
            const response = await fetch(`http://192.168.0.102:3000/api/buscarHorariosNaoVinculados/${selectedData}`);
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
  {diasList.map((dia, index) => {
    // Divide a data no formato original (YYYY-MM-DD)
    const [year, month, day] = dia.split('-');
    // Formata a data para DD/MM/YYYY
    const formattedDate = `${day}/${month}/${year}`;

    return (
      <Picker.Item key={index} label={formattedDate} value={dia} />
    );
  })}
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
  {horariosNaoVinculados.map((horario) => {
    // Formatar a hora para mostrar apenas horas e minutos
    const formattedHorario = horario.horarios_horarios.split(':').slice(0, 2).join(':');
    return (
      <Picker.Item 
        key={horario.horarios_horarios} 
        label={formattedHorario} 
        value={horario.horarios_horarios} 
      />
    );
  })}
</Picker>


        <TouchableOpacity
  style={styles.button}
  onPress={async () => {
    // Verifica se todos os campos obrigatórios foram preenchidos
    if (selectedHorario && selectedAtendimento && selectedData) {
      // Imprimindo os valores no console
      console.log('Valores a serem enviados para a API:');
      console.log('ubs_id:', ubsPrecedencia);
      console.log('area_nome (atendimento):', selectedAtendimento); // area_nome
      console.log('horarios_dia (data):', selectedData); // horarios_dia
      console.log('horarios_horarios (horario):', selectedHorario); // horarios_horarios

      try {
        const response = await fetch('http://192.168.0.102:3000/api/adicionarHorarioAreaMedica', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            area_nome: selectedAtendimento, // Ajustado
            horarios_dia: selectedData, // Ajustado
            horarios_horarios: selectedHorario, // Ajustado
          }),
        });

        // Inspecionando a resposta
        const textResponse = await response.text(); // Obtém a resposta como texto
        console.log('Resposta da API:', textResponse); // Imprime a resposta

        // Verifica se a resposta é válida
        if (!response.ok) {
          // Captura a resposta de erro, se houver
          const errorData = JSON.parse(textResponse); // Tente converter a resposta em JSON
          throw new Error(errorData.error || 'Erro na resposta da API');
        }

        const data = JSON.parse(textResponse); // Converte a resposta em JSON

        // Verifica se houve erro no retorno da API
        if (data.error && data.error !== '') {
          Alert.alert('Erro', data.error);
        } else {
          Alert.alert('Sucesso', 'Agendamento realizado com sucesso!');
          
          // Resetando os pickers após o agendamento
          setSelectedAtendimento('');
          setSelectedData('');
          setSelectedHorario('');
        }
      } catch (error) {
        // Exibe mensagem de erro detalhada
        Alert.alert('Erro', error.message || 'Erro ao realizar o agendamento. Tente novamente mais tarde.');
      }
    } else {
      Alert.alert('Erro', 'Por favor, selecione todos os campos.');
    }
  }}
>
  <Text style={styles.buttonText}>Agendar</Text>
</TouchableOpacity>



      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0000ff'
  },
  subHeaderText: {
    fontSize: 16,
    color: '#000',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  steps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  subtitle: {
    fontSize: 18,
    marginVertical: 10,
  },
  horarioItem: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    marginVertical: 5,
  },
  horarioText: {
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007BFF',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    marginVertical: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
