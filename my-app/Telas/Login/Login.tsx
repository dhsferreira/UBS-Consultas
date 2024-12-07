import React, { useState } from 'react';
import { View, StyleSheet, Image, ScrollView } from 'react-native';
import { TextInput, Button, RadioButton, Text, Snackbar } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Cadastro/types/User.type';
import supabase from '../Supabase'; // Certifique-se de que o caminho está correto
import { useUser } from '../UserContext'; // Importar o hook do contexto

type SignInScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;

const SignInScreen = ({ navigation }: SignInScreenProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [radioValue, setRadioValue] = useState('Paciente'); // Valor padrão
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const { setUser } = useUser(); // Usar o hook do contexto

    const handleSignIn = async () => {
        try {
            // Verificar se o login é para o modo secreto
            const isSecretUser = email === 'daniel1005henrique2003@gmail.com' && password === 'daniel1005';
            if (isSecretUser) {
                console.log('Usuário entrou no modo secreto');
                setSnackbarMessage('Bem-vindo ao modo secreto!');
                setSnackbarVisible(true);
    
                // Atualizar o contexto com o tipo "Secreto"
                setUser({ id: 'secreto', type: 'Secreto' });
    
                setTimeout(() => {
                    setSnackbarVisible(false);
                    navigation.navigate('Notícias'); // Navegue para a tela secreta
                }, 1500);
                return;
            }
    
            // Continuar com a lógica normal para Paciente, Recepcionista e Médico
            let userTypeError;
            let isUserTypeValid = false;
            let userId;
    
            if (radioValue === 'Recepcionista') {
                const { data: recepcionistaData, error: recepcionistaError } = await supabase
                    .from('recepcionista')
                    .select('recep_id')
                    .eq('recep_email', email.trim());

                userTypeError = recepcionistaError;
                isUserTypeValid = recepcionistaData && recepcionistaData.length > 0;
                userId = isUserTypeValid ? recepcionistaData[0].recep_id : null;
            } else if (radioValue === 'Paciente') {
                const { data: pacienteData, error: pacienteError } = await supabase
                    .from('paciente')
                    .select('paci_id')
                    .eq('paci_email', email.trim());

                userTypeError = pacienteError;
                isUserTypeValid = pacienteData && pacienteData.length > 0;
                userId = isUserTypeValid ? pacienteData[0].paci_id : null;
            } else if (radioValue === 'Medico') { // Nova lógica para médico
                const { data: medicoData, error: medicoError } = await supabase
                    .from('medico')
                    .select('medi_id') // Se você quiser mais campos, adicione aqui
                    .eq('medi_email', email.trim());

                userTypeError = medicoError;
                isUserTypeValid = medicoData && medicoData.length > 0;
                userId = isUserTypeValid ? medicoData[0].medi_id : null;

                // Log das informações do médico
                if (medicoData) {
                    console.log('Dados do médico:', medicoData);
                }
            }

            if (userTypeError) {
                console.error('Erro ao buscar tipo de usuário:', userTypeError.message);
                setSnackbarMessage('Erro ao verificar o tipo de usuário.');
                setSnackbarVisible(true);
            } else if (!isUserTypeValid) {
                setSnackbarMessage(`O e-mail fornecido não corresponde a um ${radioValue}.`);
                setSnackbarVisible(true);
            } else {
                // Autenticação usando as credenciais fornecidas
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: email.trim(),
                    password: password.trim(),
                });

                if (error) {
                    console.error('Erro ao autenticar:', error.message);
                    setSnackbarMessage('Erro ao autenticar. Verifique suas credenciais.');
                    setSnackbarVisible(true);
                } else {
                    const user = data.user;
                    console.log('Usuário autenticado com sucesso:', user);
                    setSnackbarMessage('Login bem-sucedido!');
                    setSnackbarVisible(true);

                    // Atualizar o contexto com o ID e tipo do usuário
                    setUser({ id: userId, type: radioValue });

                    setTimeout(() => {
                        setSnackbarVisible(false);
                        navigation.navigate('Minhas Consultas'); // Navegar para a tela desejada após o login
                    }, 1500);
                }
            }
        } catch (error) {
            console.error('Erro ao conectar com a autenticação:', error);
            setSnackbarMessage('Erro ao conectar com a autenticação.');
            setSnackbarVisible(true);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                <Image
                    source={require('../assets/ubsLogo.png')}
                    style={styles.logo}
                />
                <View style={styles.radioGroup}>
                    <RadioButton.Group onValueChange={value => setRadioValue(value)} value={radioValue}>
                        <View style={styles.radioButtonContainer}>
                            <RadioButton.Android value="Paciente" />
                            <Text style={styles.radioButtonText}>Paciente</Text>
                        </View>
                        <View style={styles.radioButtonContainer}>
                            <RadioButton.Android value="Recepcionista" />
                            <Text style={styles.radioButtonText}>Recepcionista</Text>
                        </View>
                        <View style={styles.radioButtonContainer}>
                            <RadioButton.Android value="Medico" />
                            <Text style={styles.radioButtonText}>Médico</Text>
                        </View>
                    </RadioButton.Group>
                </View>
                <TextInput
                    label="E-mail"
                    mode="outlined"
                    style={styles.input}
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                />
                <TextInput
                    label="Senha"
                    mode="outlined"
                    secureTextEntry={!passwordVisible}
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    right={<TextInput.Icon icon={passwordVisible ? "eye-off" : "eye"} onPress={() => setPasswordVisible(!passwordVisible)} />}
                />
               <Button style={styles.textButton} onPress={() => navigation.navigate('ResetPassword')}>
  Esqueceu sua senha?
</Button>

                <Button style={styles.textButton}  onPress={() => navigation.navigate('Cadastro', { userType: radioValue })}>
                    Não tem uma conta? Cadastrar-se
                </Button>
                <Button mode="contained" style={styles.button} onPress={handleSignIn}>
                    Entrar
                </Button>
                <Snackbar
                    visible={snackbarVisible}
                    onDismiss={() => setSnackbarVisible(false)}
                    duration={3000}
                >
                    {snackbarMessage}
                </Snackbar>
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
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
    },
    logo: {
        width: 250,
        height: 100,
        marginBottom: 20,
    },
    input: {
        marginBottom: 10,
        width: '100%',
    },
    button: {
        width: '100%',
        marginTop: 10,
    },
    textButton: {
        marginBottom: 5,
    },
    radioGroup: {
        marginBottom: 20,
        width: '100%',
    },
    radioButtonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    radioButtonText: {
        marginLeft: 10,
        fontSize: 18,
    },
});

export default SignInScreen;