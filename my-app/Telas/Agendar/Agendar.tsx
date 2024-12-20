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
        const response = await fetch('http://192.168.0.102:3000/api/Ubs');
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
          const response = await fetch(`http://192.168.0.102:3000/api/areas/${selectedUBS}`);
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
  }, [selectedUBS]);

  useEffect(() => {
    if (selectedAtendimento !== '') {
      const area = areasList.find(a => a.area_nome === selectedAtendimento);
      if (area) {
        console.log('area_id:', area.area_id); // Log para verificar o area_id
      } else {
        console.error('Área não encontrada para o atendimento selecionado:', selectedAtendimento);
      }
    }
  }, [selectedAtendimento, areasList]);

  useEffect(() => {
    if (selectedAtendimento !== '' && selectedUBS !== '') {
      const fetchDias = async () => {
        try {
          const response = await fetch(`http://192.168.0.102:3000/api/ubs/${selectedUBS}/areas/${selectedAtendimento}/horarios`); 
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
      console.log('Requisitando horários para UBS:', selectedUBS, 'atendimento:', selectedAtendimento, 'data:', selectedData);
      const fetchHorarios = async () => {
        try {
          const response = await fetch(`http://192.168.0.102:3000/api/horarios/${selectedUBS}/${selectedAtendimento}/${selectedData}`);
          const data = await response.json();
          console.log('Resposta Horários:', data); // Logando a resposta da API
  
          // Alteração: Verificando se a resposta contém o campo "result"
          if (data && data.result && data.result.length > 0) {
            const formattedHorarios = data.result.map((item: Horario) => ({
              ...item,
              horarios_horarios: item.horarios_horarios.slice(0, 5) // Remove os segundos
            }));
            setHorariosList(formattedHorarios);
          } else {
            console.error('Erro: Nenhum horário encontrado ou resposta inválida.', data);
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

    const horario = horariosList.find(h => h.horarios_horarios === selectedHorario);
    if (!horario) {
      Alert.alert('Erro', 'Horário selecionado inválido.');
      return;
    }

    const consultaData = {
      ubs_id: parseInt(selectedUBS),
      paci_id: user.id,
      area_nome: `${selectedAtendimento}`,
      horarios_dia: `${selectedData}`,
      horarios_horarios: `${selectedHorario}`
    };

    console.log('Dados da consulta:', consultaData); // Adicionando log para inspecionar os dados

    try {
      const response = await fetch('http://192.168.0.102:3000/api/consultas/criar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(consultaData),
      });

      const data = await response.json();
      if (data.error === '') {
        Alert.alert('Sucesso', 'Consulta agendada com sucesso.');
        scheduleNotification(selectedData, selectedHorario);

                // Navega para a tela de destino após o agendamento bem-sucedido
                navigation.navigate('Consultas');
        // Resetar todos os pickers após o sucesso
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

      <Text style={styles.subtitle}>Escolha a data:</Text>
      <Picker
  selectedValue={selectedData}
  onValueChange={(itemValue) => setSelectedData(itemValue)}
  enabled={selectedAtendimento !== ''}
>
  {/* Exibe a opção "Selecione um dia" */}
  <Picker.Item label="Selecione um dia" value="" />

  {/* Lista todos os dias, mas torna apenas os disponíveis clicáveis */}
  {['2024-12-06', '2024-12-07', '2024-12-08', '2024-12-09'].map((dia) => {
    const isAvailable = diasList.some(d => d.horarios_dia === dia); // Verifica se o dia está disponível na lista
    return (
      <Picker.Item
        key={dia}
        label={`${formatDate(dia)} ${isAvailable ? '' : '❌'}`} // Adiciona "❌" se o dia não estiver disponível
        value={dia}
        style={{
          color: isAvailable ? 'black' : 'gray', // Aplica cinza se não for um dia disponível
        }}
        enabled={isAvailable} // Torna o item clicável somente se estiver disponível
      />
    );
  })}
</Picker>



      <Text style={styles.subtitle}>Escolha o horário:</Text>
      <Picker
  selectedValue={selectedHorario}
  onValueChange={(itemValue) => setSelectedHorario(itemValue)}
  enabled={selectedData !== ''}
>
  {/* Exibe a opção "Selecione um horário" */}
  <Picker.Item label="Selecione um horário" value="" />
  
  {/* Cria todos os horários possíveis */}
  {['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'].map((hora) => {
    const isAvailable = horariosList.some(h => h.horarios_horarios === hora); // Verifica se o horário está disponível
    return (
      <Picker.Item
      key={hora}
      label={`${hora} ${isAvailable ? '' : '❌'}`}
      value={hora}
      style={{
        color: isAvailable ? 'black' : 'gray', // Aplica cinza se não for um horário disponível
      }}
      enabled={isAvailable} // Torna o item clicável somente se estiver disponível
      />
    );
  })}
</Picker>


      <TouchableOpacity style={styles.button} onPress={agendarConsulta}>
        <Text style={styles.buttonText}>Agendar Consulta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
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
    fontSize: 16,
    color: '#888',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  steps: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
