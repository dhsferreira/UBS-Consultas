import React, { useState } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { Button, Text } from 'react-native-paper'; // Corrigido para Button do react-native-paper
import { Snackbar } from 'react-native-paper'; // Correto
import supabase from '../Supabase'; // Certifique-se de que o caminho está correto

const ResetPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleSendResetLink = async () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      console.log('E-mail inválido:', email);
      setSnackbarMessage('Por favor, insira um e-mail válido.');
      setSnackbarVisible(true);
      return;
    }

    try {
      const tables = [
        { name: 'paciente', emailColumn: 'paci_email', idColumn: 'paci_id' },
        { name: 'recepcionista', emailColumn: 'recep_email', idColumn: 'recep_id' },
        { name: 'medico', emailColumn: 'medi_email', idColumn: 'medi_id' },
      ];

      let userFound = false;

      for (let table of tables) {
        console.log(`Verificando e-mail na tabela: ${table.name}`);
        const { data, error: userError } = await supabase
          .from(table.name)
          .select(table.idColumn)
          .eq(table.emailColumn, email)
          .single();

        if (data) {
          console.log(`E-mail encontrado na tabela: ${table.name}, ID do usuário: ${data[table.idColumn]}`);
          userFound = true;
          break;
        }

        if (userError) {
          console.error(`Erro ao buscar e-mail na tabela ${table.name}:`, userError.message || userError);
        }
      }

      if (!userFound) {
        console.log('E-mail não encontrado em nenhuma tabela.');
        setSnackbarMessage('E-mail não cadastrado. Verifique ou registre-se.');
        setSnackbarVisible(true);
        return;
      }

      console.log('E-mail válido, tentando enviar o link de recuperação...');
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        console.error('Erro ao enviar o link de recuperação:', error.message || error);
        setSnackbarMessage(`Erro ao enviar link: ${error.message || 'Erro desconhecido'}`);
        setSnackbarVisible(true);
      } else {
        console.log('Link de recuperação enviado com sucesso para:', email);
        setSnackbarMessage('Link de recuperação enviado com sucesso! Verifique seu e-mail.');
        setSnackbarVisible(true);
        setTimeout(() => {
          navigation.goBack();
        }, 2000);
      }
    } catch (error) {
      console.error('Erro inesperado ao tentar enviar o link:', error.message || error);
      setSnackbarMessage('Erro ao enviar o link. Tente novamente.');
      setSnackbarVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recuperar Senha</Text>
      <TextInput
        label="E-mail"
        mode="outlined"
        style={styles.input}
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <Button mode="contained" style={styles.button} onPress={handleSendResetLink}>
        Enviar Link de Recuperação
      </Button>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    marginBottom: 20,
    width: '100%',
    backgroundColor: '#f0f0f0', // Cor de fundo cinza claro
    borderRadius: 8, // Bordas arredondadas
    paddingHorizontal: 10, // Espaço interno
    shadowColor: '#000', // Cor da sombra
    shadowOffset: { width: 0, height: 2 }, // Posição da sombra
    shadowOpacity: 0.25, // Opacidade da sombra
    shadowRadius: 3.5, // Raio da sombra
    elevation: 5, // Efeito de sombra no Android
  },
  button: {
    width: '100%',
  },
});

export default ResetPasswordScreen;
