import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Button } from 'react-native';
import { useUser } from '../UserContext'; 
import { supabase } from '../Supabase'; 
import { useNavigation } from '@react-navigation/native'; 

const UserTypeDisplay: React.FC = () => {
    const { user, setUser } = useUser();
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
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
                } else if (user.type === 'Paciente') {
                    ({ data, error } = await supabase
                        .from('paciente')
                        .select('*')
                        .eq('paci_id', user.id)
                        .single());
                } else if (user.type === 'Medico') {
                    ({ data, error } = await supabase
                        .from('medico')
                        .select('*')
                        .eq('medi_id', user.id)
                        .single());
                }

                if (error) {
                    throw error;
                }

                setUserInfo(data);
            } catch (error) {
                console.error('Erro ao buscar informações do usuário:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserInfo();
    }, [user.id, user.type]);

    const handleLogout = () => {
        setUser({ id: null, type: '' }); 
        navigation.navigate('Login'); 
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    if (user.type === 'Recepcionista' && userInfo) {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>Recepcionista: {userInfo.recep_nome}</Text>
                <Text style={styles.text}>Email: {userInfo.recep_email}</Text>
                <Text style={styles.text}>Telefone: {userInfo.recep_cel}</Text>
                <Text style={styles.text}>CPF: {userInfo.recep_CPF}</Text>
                <Text style={styles.text}>Senha: {userInfo.recep_senha}</Text>
                <Button title="Sair" onPress={handleLogout} color="#FF6347" />
            </View>
        );
    }

    if (user.type === 'Paciente' && userInfo) {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>Paciente: {userInfo.paci_nome}</Text>
                <Text style={styles.text}>Email: {userInfo.paci_email}</Text>
                <Text style={styles.text}>Telefone: {userInfo.paci_cel}</Text>
                <Text style={styles.text}>CPF: {userInfo.paci_CPF}</Text>
                <Text style={styles.text}>Senha: {userInfo.paci_senha}</Text>
                <Button title="Sair" onPress={handleLogout} color="#FF6347" />
            </View>
        );
    }

    if (user.type === 'Medico' && userInfo) {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>Médico: {userInfo.medi_nome}</Text>
                <Text style={styles.text}>Email: {userInfo.medi_email}</Text>
                <Text style={styles.text}>Telefone: {userInfo.medi_cel}</Text>
                <Text style={styles.text}>CRM: {userInfo.medi_CRM}</Text>
                <Text style={styles.text}>Especialização: {userInfo.medi_especializa}</Text>
                <Text style={styles.text}>Senha: {userInfo.medi_senha}</Text>
                <Button title="Sair" onPress={handleLogout} color="#FF6347" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Desconhecido</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    text: {
        fontSize: 16,
        marginVertical: 5,
    },
});

export default UserTypeDisplay;
