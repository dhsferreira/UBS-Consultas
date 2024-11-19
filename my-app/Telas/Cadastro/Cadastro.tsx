import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, Text } from 'react-native';
import { TextInput, Button, Snackbar, IconButton } from 'react-native-paper';
import axios from 'axios';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Cadastro/types/User.type';
import { supabase } from '../Supabase'; // Ajuste o caminho conforme necessário
import { useRoute } from '@react-navigation/native';

type SignUpScreenProps = NativeStackScreenProps<RootStackParamList, 'Cadastro'>;

const SignUpScreen = ({ navigation }: SignUpScreenProps) => {
    const route = useRoute();
    const { userType } = route.params;

    const [name, setName] = useState('');
    const [birthdate, setBirthdate] = useState('');
    const [cpf, setCpf] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [crm, setCrm] = useState('');
    const [specialization, setSpecialization] = useState('');
    const [area, setArea] = useState('');
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const formatDateToAmerican = (date: string) => {
        const [day, month, year] = date.split('/');
        return `${year}-${month}-${day}`;
    };

    const handleSignUp = async () => {
        if (name && cpf && phone && email && password && password === confirmPassword) {
            let userData = {};
            let apiUrl = '';
            
            if (userType === 'Paciente') {
                userData = {
                    paci_nome: name.trim(),
                    paci_data_nascimento: formatDateToAmerican(birthdate.trim()),
                    paci_CPF: cpf.trim().replace(/\D/g, ''),
                    paci_cel: phone.trim().replace(/\D/g, ''),
                    paci_email: email.trim(),
                    paci_endereco: address.trim(),
                    paci_senha: password.trim()
                };
                apiUrl = 'http://192.168.0.103:3000/api/paciente';
            } else if (userType === 'Recepcionista') {
                userData = {
                    recep_nome: name.trim(),
                    recep_CPF: cpf.trim().replace(/\D/g, ''),
                    recep_cel: phone.trim().replace(/\D/g, ''),
                    recep_email: email.trim(),
                    recep_senha: password.trim(),
                    ubs_id: 1 // Ajuste conforme a lógica de UBS
                };
                apiUrl = 'http://192.168.0.103:3000/api/recepcionista';
            } else if (userType === 'Médico') {
                userData = {
                    medi_nome: name.trim(),
                    medi_CPF: cpf.trim().replace(/\D/g, ''),
                    medi_cel: phone.trim().replace(/\D/g, ''),
                    medi_email: email.trim(),
                    medi_senha: password.trim(),
                    medi_especializa: specialization.trim(),
                    medi_CRM: crm.trim(),
                    medi_area: area.trim(),
                    ubs_id: 1 // Ajuste conforme a lógica de UBS
                };
                apiUrl = 'http://192.168.0.103:3000/api/medico';
            }
    
            try {
                console.log("Tentando cadastrar usuário no Supabase...");
                const { user, session, error: signUpError } = await supabase.auth.signUp({
                    email: email.trim(),
                    password: password.trim(),
                });
    
                if (signUpError) {
                    console.log("Erro ao cadastrar no Supabase Auth:", signUpError.message);
                    setSnackbarMessage('Erro ao cadastrar usuário no Supabase.');
                    setSnackbarVisible(true);
                    return;
                } else {
                    console.log("Cadastro no Supabase Auth bem-sucedido. Usuário ID:", user?.id);
                }
    
                console.log("Enviando dados para a API:", apiUrl);
                console.log("Dados do usuário:", userData);
                const apiResponse = await axios.post(apiUrl, userData);
                console.log("Resposta da API:", apiResponse.data);
    
                if (!apiResponse.data.error) {
                    const supabaseTable = userType.toLowerCase();
                    console.log(`Inserindo dados na tabela ${supabaseTable} do Supabase...`);
                    const { data: supabaseResponse, error: supabaseError } = await supabase
                        .from(supabaseTable)
                        .insert([userData]);
    
                    if (supabaseError) {
                        console.log("Erro ao inserir dados no Supabase:", supabaseError.message);
                        setSnackbarMessage(`Erro ao cadastrar ${userType.toLowerCase()} no Supabase.`);
                    } else {
                        console.log("Dados inseridos no Supabase com sucesso:", supabaseResponse);
                        setSnackbarMessage(`${userType} cadastrado com sucesso!`);
                        
                        // Limpar os campos
                        setName('');
                        setBirthdate('');
                        setCpf('');
                        setPhone('');
                        setEmail('');
                        setAddress('');
                        setPassword('');
                        setConfirmPassword('');
                        setCrm('');
                        setSpecialization('');
                        setArea('');
    
                        setTimeout(() => {
                            setSnackbarVisible(false);
                            navigation.navigate('Login');
                        }, 1500);
                    }
                } else {
                    console.log(`Erro ao cadastrar ${userType.toLowerCase()} via API externa.`);
                    setSnackbarMessage(`Erro ao cadastrar ${userType.toLowerCase()}.`);
                }
            } catch (error) {
                console.log("Erro ao conectar com a API:", error);
                setSnackbarMessage('Erro ao conectar com a API.');
            } finally {
                setSnackbarVisible(true);
            }
        } else {
            setSnackbarMessage('Por favor, preencha todos os campos corretamente.');
            setSnackbarVisible(true);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Image
                    source={require('../assets/ubsLogo.png')}
                    style={styles.centerImage}
                />
            </View>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.headerText}>Cadastre-se</Text>
                <Text style={styles.userTypeText}>Tipo de usuário selecionado: {userType}</Text>
                <TextInput
                    label="Nome"
                    value={name}
                    onChangeText={setName}
                    mode="outlined"
                    style={styles.input}
                />
                {userType === 'Paciente' && (
                    <TextInput
                        label="Data de Nascimento"
                        value={birthdate}
                        onChangeText={setBirthdate}
                        mode="outlined"
                        style={styles.input}
                    />
                )}
                <TextInput
                    label="CPF"
                    value={cpf}
                    onChangeText={setCpf}
                    mode="outlined"
                    style={styles.input}
                    keyboardType="numeric"
                />
                <TextInput
                    label="Telefone"
                    value={phone}
                    onChangeText={setPhone}
                    mode="outlined"
                    style={styles.input}
                    keyboardType="numeric"
                />
                <TextInput
                    label="E-mail"
                    value={email}
                    onChangeText={setEmail}
                    mode="outlined"
                    style={styles.input}
                    keyboardType="email-address"
                />
                {userType === 'Paciente' && (
                    <TextInput
                        label="Endereço"
                        value={address}
                        onChangeText={setAddress}
                        mode="outlined"
                        style={styles.input}
                    />
                )}
                {userType === 'Medico' && (
                    <>
                        <TextInput
                            label="CRM"
                            value={crm}
                            onChangeText={setCrm}
                            mode="outlined"
                            style={styles.input}
                        />
                        <TextInput
                            label="Especialização"
                            value={specialization}
                            onChangeText={setSpecialization}
                            mode="outlined"
                            style={styles.input}
                        />
                        <TextInput
                            label="Área Médica"
                            value={area}
                            onChangeText={setArea}
                            mode="outlined"
                            style={styles.input}
                        />
                    </>
                )}
                <TextInput
                    label="Senha"
                    value={password}
                    onChangeText={setPassword}
                    mode="outlined"
                    style={styles.input}
                    secureTextEntry={!passwordVisible}
                    right={<TextInput.Icon icon={passwordVisible ? 'eye-off' : 'eye'} onPress={() => setPasswordVisible(!passwordVisible)} />}
                />
                <TextInput
                    label="Confirmar Senha"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    mode="outlined"
                    style={styles.input}
                    secureTextEntry={!confirmPasswordVisible}
                    right={<TextInput.Icon icon={confirmPasswordVisible ? 'eye-off' : 'eye'} onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)} />}
                />
                <Button mode="contained" onPress={handleSignUp} style={styles.button}>
                    Cadastrar
                </Button>
                <Button
    mode="text"
    onPress={() => navigation.navigate('Login')}
    style={styles.footerButton}
    labelStyle={styles.footerButtonText}
>
    Já tem conta? Fazer login
</Button>

            </ScrollView>
            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                action={{
                    label: 'Fechar',
                    onPress: () => setSnackbarVisible(false),
                }}
            >
                {snackbarMessage}
            </Snackbar>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#FFFFFF', // Fundo branco
    },
    header: {
        alignItems: 'center',
        marginBottom: 16,
    },
    centerImage: {
        width: 180, // Ajustar o tamanho do logo
        height: 80,
        resizeMode: 'contain',
    },
    scrollContainer: {
        flexGrow: 1,
        paddingHorizontal: 16,
    },
    headerText: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#000000',
        textAlign: 'center',
        marginBottom: 8,
    },
    userTypeText: {
        fontSize: 16,
        color: '#000000',
        textAlign: 'center',
        marginBottom: 24,
    },
    input: {
        marginBottom: 12,
        backgroundColor: '#F9F9F9', // Fundo claro para os inputs
        borderRadius: 8, // Bordas arredondadas
    },
    button: {
        marginTop: 16,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: '#0056FF', // Cor azul
    },
    buttonText: {
        fontSize: 16,
        color: '#FFFFFF',
        textAlign: 'center',
        fontWeight: '600',
    },
    footerText: {
        textAlign: 'center',
        marginTop: 16,
        fontSize: 14,
        color: '#0056FF', // Azul para o link
        textDecorationLine: 'underline',
    },
});


export default SignUpScreen;
