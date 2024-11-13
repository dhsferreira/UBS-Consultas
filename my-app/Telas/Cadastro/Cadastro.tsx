import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, Text } from 'react-native';
import { TextInput, Button, Snackbar, IconButton } from 'react-native-paper';
import axios from 'axios';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Cadastro/types/User.type';
import { TextInputMask } from 'react-native-masked-text';
import { supabase } from '../Supabase';// Ajuste o caminho conforme necessário

type SignUpScreenProps = NativeStackScreenProps<RootStackParamList, 'Cadastro'>;

const SignUpScreen = ({ navigation }: SignUpScreenProps) => {
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
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const formatDateToAmerican = (date: string) => {
        const [day, month, year] = date.split('/');
        return `${year}-${month}-${day}`;
    };

    const handleSignUp = async () => {
        if (name && birthdate && cpf && phone && email && address && password && password === confirmPassword) {
            const pacienteData = {
                paci_nome: name.trim(),
                paci_data_nascimento: formatDateToAmerican(birthdate.trim()),
                paci_CPF: cpf.trim().replace(/\D/g, ''),
                paci_cel: phone.trim().replace(/\D/g, ''),
                paci_email: email.trim(),
                paci_endereco: address.trim(),
                paci_senha: password.trim()
            };

            console.log('Dados do paciente a serem enviados:', pacienteData);

            try {
                // Registrar o usuário no Supabase Auth
                const { user, session, error: signUpError } = await supabase.auth.signUp({
                    email: email.trim(),
                    password: password.trim(),
                });

                if (signUpError && signUpError.message !== 'Email rate limit exceeded') {
                    console.error('Erro ao cadastrar no Supabase Auth:', signUpError.message);
                    setSnackbarMessage('Erro ao cadastrar usuário no Supabase.');
                    setSnackbarVisible(true);
                    return;
                }

                // Enviar dados para a API externa
                const apiResponse = await axios.post('http://192.168.137.1:3000/api/Paciente', pacienteData);
                console.log('Resposta da API:', apiResponse.data);

                if (!apiResponse.data.error) {
                    // Inserir dados do paciente na tabela 'paciente' no Supabase
                    const { data: supabaseResponse, error: supabaseError } = await supabase
                        .from('paciente')
                        .insert([pacienteData]);

                    if (supabaseError) {
                        console.error('Erro ao cadastrar no Supabase:', supabaseError.message);
                        setSnackbarMessage('Erro ao cadastrar paciente no Supabase.');
                    } else {
                        setSnackbarMessage('Usuário cadastrado com sucesso!');
                        setTimeout(() => {
                            setSnackbarVisible(false);
                            navigation.navigate('Login');
                        }, 1500);
                    }
                } else {
                    console.error('Erro ao cadastrar paciente:', apiResponse.data.error);
                    setSnackbarMessage('Erro ao cadastrar paciente.');
                }
            } catch (error) {
                console.error('Erro ao conectar com a API:', error);
                setSnackbarMessage('Erro ao conectar com a API.');
            } finally {
                setSnackbarVisible(true);
            }
        } else {
            console.error('Por favor, preencha todos os campos corretamente.');
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
                <TextInput
                    label="Nome"
                    value={name}
                    onChangeText={setName}
                    mode="outlined"
                    style={styles.input}
                />
                <TextInputMask
                    type={'datetime'}
                    options={{ format: 'DD/MM/YYYY' }}
                    label="Data de Nascimento"
                    value={birthdate}
                    onChangeText={setBirthdate}
                    mode="outlined"
                    style={styles.input}
                    customTextInput={TextInput}
                    customTextInputProps={{ mode: 'outlined' }}
                />
                <TextInputMask
                    type={'cpf'}
                    label="CPF"
                    value={cpf}
                    onChangeText={setCpf}
                    mode="outlined"
                    style={styles.input}
                    keyboardType="numeric"
                    customTextInput={TextInput}
                    customTextInputProps={{ mode: 'outlined' }}
                />
                <TextInputMask
                    type={'cel-phone'}
                    options={{
                        maskType: 'BRL',
                        withDDD: true,
                        dddMask: '(99) '
                    }}
                    label="Telefone"
                    value={phone}
                    onChangeText={setPhone}
                    mode="outlined"
                    style={styles.input}
                    keyboardType="numeric"
                    customTextInput={TextInput}
                    customTextInputProps={{ mode: 'outlined' }}
                />
                <TextInput
                    label="E-mail"
                    value={email}
                    onChangeText={setEmail}
                    mode="outlined"
                    style={styles.input}
                    keyboardType="email-address"
                />
                <TextInput
                    label="Endereço"
                    value={address}
                    onChangeText={setAddress}
                    mode="outlined"
                    style={styles.input}
                />
                <TextInput
                    label="Senha"
                    value={password}
                    onChangeText={setPassword}
                    mode="outlined"
                    secureTextEntry={!passwordVisible}
                    style={styles.input}
                    right={<TextInput.Icon icon={passwordVisible ? "eye-off" : "eye"} onPress={() => setPasswordVisible(!passwordVisible)} />}
                />
                <TextInput
                    label="Confirmar Senha"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    mode="outlined"
                    secureTextEntry={!confirmPasswordVisible}
                    style={styles.input}
                    right={<TextInput.Icon icon={confirmPasswordVisible ? "eye-off" : "eye"} onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)} />}
                />
                <Button mode="contained" onPress={handleSignUp} style={styles.button}>
                    Cadastrar
                </Button>
                <Snackbar
                    visible={snackbarVisible}
                    onDismiss={() => setSnackbarVisible(false)}
                    duration={3000}
                >
                    {snackbarMessage}
                </Snackbar>
                <IconButton
                    icon="arrow-left"
                    onPress={() => navigation.navigate('Login')}
                    style={styles.button}
                />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#D9D9D9',
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'black',
    },
    centerImage: {
        width: 250,
        height: 100,
        borderRadius: 50,
    },
    headerText: {
        fontSize: 30,
        fontWeight: 'normal',
        textAlign: 'center',
        marginVertical: 20,
    },
    input: {
        marginBottom: 10,
    },
    button: {
        marginTop: 10,
    },
});

export default SignUpScreen;
