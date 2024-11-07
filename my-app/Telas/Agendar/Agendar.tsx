import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from "../UserContext";
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications'; // Importa as notificações

interface UBS {
  ubs_id: number;
  ubs_nome: string;
}

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

// Função para formatar a data no formato dia/mês/ano
const formatDate = (dateString: string) => {
  const [year, month, day] = dateString.split('-');
  return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
};

// Configuração de notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [selectedUBS, setSelectedUBS] = useState('');
  const [selectedAtendimento, setSelectedAtendimento] = useState('');
  const [selectedData, setSelectedData] = useState('');
  const [selectedHorario, setSelectedHorario] = useState('');
  const [ubsList, setUbsList] = useState<UBS[]>([]);
  const [areasList, setAreasList] = useState<Area[]>([]);
  const [diasList, setDiasList] = useState<Dia[]>([]);
  const [horariosList, setHorariosList] = useState<Horario[]>([]);
  const { user } = useUser();
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUBS = async () => {
      try {
        const response = await fetch('http://192.168.137.1:3000/api/Ubs');
        const data = await response.json();
        if (data.error === '') {
          setUbsList(data.result);
        } else {
          console.error('Erro ao buscar as UBS:', data.error);
        }
      } catch (error) {
        console.error('Erro ao buscar as UBS:', error);
      }
    };

    fetchUBS();
  }, []);

  useEffect(() => {
    if (selectedUBS !== '') {
      const fetchAreas = async () => {
        try {
          const response = await fetch(`http://192.168.137.1:3000/api/areas/${selectedUBS}`);
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
  }, [selectedUBS]);

  useEffect(() => {
    if (selectedAtendimento !== '' && selectedUBS !== '') {
      const fetchDias = async () => {
        try {
          const response = await fetch(`http://192.168.137.1:3000/api/ubs/${selectedUBS}/areas/${selectedAtendimento}/horarios`);
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
  }, [selectedAtendimento, selectedUBS]);

  useEffect(() => {
    if (selectedData !== '' && selectedAtendimento !== '' && selectedUBS !== '') {
      const fetchHorarios = async () => {
        try {
          const response = await fetch(`http://192.168.137.1:3000/api/horario/horario/${selectedUBS}/${selectedAtendimento}/${selectedData}`);
          const data = await response.json();
          if (data.error === '') {
            const formattedHorarios = data.result.map((item: Horario) => ({
              ...item,
              horarios_horarios: item.horarios_horarios.slice(0, 5)
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
  }, [selectedData, selectedAtendimento, selectedUBS]);

  const agendarConsulta = async () => {
    if (!selectedUBS || !selectedAtendimento || !selectedData || !selectedHorario) {
      Alert.alert('Erro', 'Por favor, selecione todos os campos para agendar uma consulta.');
      return;
    }

    const area = areasList.find(a => a.area_nome === selectedAtendimento);

    if (!area) {
      Alert.alert('Erro', 'Área selecionada inválida.');
      return;
    }

    const consultaData = {
      ubs_id: parseInt(selectedUBS),
      paci_id: user.id,
      area_nome: `${selectedAtendimento}`,
      horarios_dia: `${selectedData}`,
      horarios_horarios: `${selectedHorario}`
    };

    try {
      const response = await fetch('http://192.168.137.1:3000/api/consultas/criar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(consultaData),
      });

      const data = await response.json();
      if (data.error === '') {
        Alert.alert('Sucesso', 'Consulta agendada com sucesso.');

        // Agendar a notificação 24 horas antes
        scheduleNotification(selectedData, selectedHorario);

        // Navega para a tela de destino após o agendamento bem-sucedido
        navigation.navigate('consultas');

        setSelectedUBS('');
        setSelectedAtendimento('');
        setSelectedData('');
        setSelectedHorario('');
        setAreasList([]);
        setDiasList([]);
        setHorariosList([]);
      } else {
        console.error('Erro ao agendar a consulta:', data.error, data.details);
        Alert.alert('Erro', `Erro ao agendar a consulta: ${data.error}`);
      }
    } catch (error) {
      console.error('Erro ao agendar a consulta:', error);
      Alert.alert('Erro', 'Erro ao agendar a consulta.');
    }
  };

  const scheduleNotification = (data: string, horario: string) => {
    const consultaData = new Date(`${data}T${horario}`);
    const notificationDate = new Date(consultaData.getTime() - (24 * 60 * 60 * 1000));

    Notifications.scheduleNotificationAsync({
      content: {
        title: 'Lembrete de Consulta',
        body: 'Sua consulta está marcada para amanhã. Por favor, não se esqueça!',
        data: { data, horario },
      },
      trigger: notificationDate,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
     
      {/* Primeiro cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.headerText}>UBS</Text>
        <Text style={styles.subHeaderText}>Unidade Básica de Saúde</Text>
      </View>

      {/* Segundo cabeçalho */}
      <View style={styles.secondHeader}>
        <Text style={styles.smallText}>Você está em Home / Agendamento</Text>
        <Text style={styles.largeText}>Agendar Consulta</Text>
      </View>

      <Text style={styles.title}>Agendar</Text>

      {/* Passos */}
      <View style={styles.steps}>
        <Ionicons name="desktop-outline" size={24} color="black" />
        <Ionicons name="create-outline" size={24} color="black" />
        <Ionicons name="checkmark-circle-outline" size={24} color="black" />
      </View>

      {/* Escolha a unidade de saúde */}
      <Text style={styles.subtitle}>Escolha a unidade de saúde:</Text>
      <Picker
        selectedValue={selectedUBS}
        onValueChange={(itemValue) => setSelectedUBS(itemValue)}
      >
        <Picker.Item label="Selecione uma UBS" value="" />
        {ubsList.map((ubs) => (
          <Picker.Item key={ubs.ubs_id} label={ubs.ubs_nome} value={ubs.ubs_id.toString()} />
        ))}
      </Picker>

      {/* Escolha o atendimento */}
      <Text style={styles.subtitle}>Escolha o atendimento:</Text>
      <Picker
        selectedValue={selectedAtendimento}
        onValueChange={(itemValue) => setSelectedAtendimento(itemValue)}
        enabled={selectedUBS !== ''}
      >
        <Picker.Item label="Selecione uma área" value="" />
        {areasList.map((area) => (
          <Picker.Item key={area.area_id} label={area.area_nome} value={area.area_nome} />
        ))}
      </Picker>

      {/* Escolha a data */}
      <Text style={styles.subtitle}>Escolha a data:</Text>
      <Picker
        selectedValue={selectedData}
        onValueChange={(itemValue) => setSelectedData(itemValue)}
        enabled={selectedAtendimento !== ''}
      >
        <Picker.Item label="Selecione uma data" value="" />
        {diasList.map((dia, index) => (
          <Picker.Item key={index} label={formatDate(dia.horarios_dia)} value={dia.horarios_dia} />
        ))}
      </Picker>

      {/* Escolha o horário */}
      <Text style={styles.subtitle}>Escolha o horário:</Text>
      <Picker
        selectedValue={selectedHorario}
        onValueChange={(itemValue) => setSelectedHorario(itemValue)}
        enabled={selectedData !== ''}
      >
        <Picker.Item label="Selecione um horário" value="" />
        {horariosList.map((horario, index) => (
          <Picker.Item key={index} label={horario.horarios_horarios} value={horario.horarios_horarios} />
        ))}
      </Picker>

      {/* Botão de agendamento */}
      <TouchableOpacity style={styles.button} onPress={agendarConsulta}>
        <Text style={styles.buttonText}>Agendar consulta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  container2: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 30,
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: 'black',
  },
  leftButton: {
    padding: 10,
  },
  buttonImage: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    marginTop: 45,
  },
  centerImage: {
    width: 200,
    height: 50,
    marginTop: 30,
    left: '50%',
    marginLeft: -50,
    marginRight: 120,
    marginBottom: 10,
  },
  secondHeader: {
    backgroundColor: '#123CD3',
    padding: 10,
    width: '100%',
    alignSelf: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'black',
  },
  headerText: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  subHeaderText: {
    fontSize: 16,
    color: 'gray',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  steps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
});
