import React, { useState } from 'react';
import { View, StyleSheet, Image, ScrollView, Text } from 'react-native';
import { TextInput, Button, Snackbar } from 'react-native-paper';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Cadastro/types/User.type';
import supabase from '../Supabase'; // Certifique-se de que o caminho está correto
import { useUser } from '../UserContext'; // Importar o hook do contexto
import { TextInputMask } from 'react-native-masked-text'; // Importando a máscara

type SignUpScreenProps = NativeStackScreenProps<RootStackParamList, 'Cadastro'>;

const SignUpScreen = ({ navigation, route }: SignUpScreenProps) => {
    const { userType } = route.params; // Tipo de usuário (Paciente, Recepcionista, Médico)
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [name, setName] = useState('');
    const [cpf, setCpf] = useState('');
    const [phone, setPhone] = useState('');
    const [birthdate, setBirthdate] = useState('');
    const [address, setAddress] = useState('');
    const [crm, setCrm] = useState('');
    const [specialization, setSpecialization] = useState('');
    const [area, setArea] = useState('');
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const { setUser } = useUser(); // Usar o hook do contexto

    const handleSignUp = async () => {
        if (password !== confirmPassword) {
            setSnackbarMessage('As senhas não coincidem.');
            setSnackbarVisible(true);
            return;
        }

        try {
            // Realizar login com o e-mail e senha fornecidos
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: password.trim(),
            });

            if (error) {
                console.error('Erro ao cadastrar:', error.message);
                setSnackbarMessage('Erro ao autenticar. Tente novamente.');
                setSnackbarVisible(true);
            } else {
                // Fazer a busca do tipo de usuário (Paciente, Recepcionista, Médico)
                let userId;
                if (userType === 'Recepcionista') {
                    const { data: recepcionistaData, error: recepcionistaError } = await supabase
                        .from('recepcionista')
                        .select('recep_id')
                        .eq('recep_email', email.trim());

                    if (recepcionistaError || !recepcionistaData?.length) {
                        throw new Error('E-mail não corresponde a um recepcionista.');
                    }
                    userId = recepcionistaData[0].recep_id;
                } else if (userType === 'Paciente') {
                    const { data: pacienteData, error: pacienteError } = await supabase
                        .from('paciente')
                        .select('paci_id')
                        .eq('paci_email', email.trim());

                    if (pacienteError || !pacienteData?.length) {
                        throw new Error('E-mail não corresponde a um paciente.');
                    }
                    userId = pacienteData[0].paci_id;
                } else if (userType === 'Medico') {
                    const { data: medicoData, error: medicoError } = await supabase
                        .from('medico')
                        .select('medi_id')
                        .eq('medi_email', email.trim());

                    if (medicoError || !medicoData?.length) {
                        throw new Error('E-mail não corresponde a um médico.');
                    }
                    userId = medicoData[0].medi_id;
                }

                // Atualizar o contexto com o ID e tipo do usuário
                setUser({ id: userId, type: userType });

                // Limpar campos não usados para login
                setName('');
                setCpf('');
                setPhone('');
                setBirthdate('');
                setAddress('');
                setCrm('');
                setSpecialization('');
                setArea('');

                setSnackbarMessage('Cadastro bem-sucedido!');
                setSnackbarVisible(true);

                // Redirecionar para a tela de consultas ou outra tela após login
                setTimeout(() => {
                    setSnackbarVisible(false);
                    navigation.navigate('Minhas Consultas'); // Ajuste conforme necessário
                }, 1500);
            }
        } catch (error) {
            console.error('Erro ao conectar com a autenticação:', error);
            setSnackbarMessage('Erro ao conectar com a autenticação.');
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
                <Text style={styles.userTypeText}>Preencha todos os campos para concluir o cadastro</Text>

                {/* Campos adicionais */}
                <TextInput
                    label="Nome"
                    value={name}
                    onChangeText={setName}
                    mode="outlined"
                    style={styles.input}
                />
                {userType === 'Paciente' && (
                    <TextInputMask
                        type={'datetime'}
                        options={{
                            format: 'DD/MM/YYYY'
                        }}
                        value={birthdate}
                        onChangeText={setBirthdate}
                        keyboardType="numeric"
                        customTextInput={TextInput}
                        customTextInputProps={{
                            label: 'Data de Nascimento',
                            mode: 'outlined',
                            style: styles.input,
                        }}
                    />
                )}
                <TextInputMask
                    type={'cpf'}
                    value={cpf}
                    onChangeText={setCpf}
                    keyboardType="numeric"
                    customTextInput={TextInput}
                    customTextInputProps={{
                        label: 'CPF',
                        mode: 'outlined',
                        style: styles.input,
                    }}
                />
                <TextInputMask
                    type={'cel-phone'}
                    options={{
                        maskType: 'BRL',
                        withDDD: true,
                        dddMask: '(99)',
                    }}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="numeric"
                    customTextInput={TextInput}
                    customTextInputProps={{
                        label: 'Telefone',
                        mode: 'outlined',
                        style: styles.input,
                    }}
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

            {/* Exibição do Snackbar com mensagem */}
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
        backgroundColor: '#FFFFFF',
    },
    header: {
        alignItems: 'center',
        marginBottom: 16,
    },
    centerImage: {
        width: 180,
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
        backgroundColor: '#F9F9F9',
        borderRadius: 8,
    },
    button: {
        marginTop: 16,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: '#0056FF',
    },
    footerButton: {
        marginTop: 8,
        textAlign: 'center',
    },
    footerButtonText: {
        color: '#0056FF',
    },
});

export default SignUpScreen;
