import type React from 'react';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Button, TouchableOpacity, TextInput, Image, ScrollView, SafeAreaView } from 'react-native';
import { useUser } from '../UserContext'; 
import { supabase } from '../Supabase'; 
import { useNavigation } from '@react-navigation/native'; 
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/Feather';

const UserTypeDisplay: React.FC = () => {
    const { user, setUser } = useUser();
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditable, setIsEditable] = useState(false);
    const [userPhoto, setUserPhoto] = useState(require('../assets/avatar.png'));
    const navigation = useNavigation(); 

    async function handleUserPhotoSelect() {
        const photoSelected = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
            aspect: [4, 4],
            allowsEditing: true,
        });

        if (photoSelected.canceled) {
            return;
        }

        const photoURI = photoSelected.assets[0].uri;
        setUserPhoto(photoURI);
    }

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

    const handleEditToggle = () => {
        setIsEditable(!isEditable);
    };

    const handleLogout = () => {
        setUser({ id: null, type: '' }); 
        navigation.navigate('Login'); 
    };

    const handleGoBack = () => {
        navigation.goBack(); 
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    const UserDetails = ({ userData }) => (
        <View style={styles.userInfoContainer}>
            <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
                <Icon name="arrow-left" size={28} color="#0000ff" />
            </TouchableOpacity>

            <Image
                source={userPhoto} 
                style={styles.profileImage}
            />
            <TouchableOpacity onPress={handleUserPhotoSelect}>
                <Text style={[styles.headingText, { marginTop: 0, marginBottom: 16 }]}>Alterar foto</Text>
            </TouchableOpacity>
            
            <Text style={styles.label}>Nome:</Text>
            <TextInput editable={isEditable} style={[styles.userInputInfo, { opacity: isEditable ? 1 : 0.5 }]}>{userData.name}</TextInput>

            <Text style={styles.label}>Email:</Text>
            <TextInput editable={isEditable} style={[styles.userInputInfo, { opacity: isEditable ? 1 : 0.5 }]}>{userData.email}</TextInput>

            <Text style={styles.label}>Celular:</Text>
            <TextInput editable={isEditable} style={[styles.userInputInfo, { opacity: isEditable ? 1 : 0.5 }]}>{userData.phone}</TextInput>

            {userData.cpf && (
                <>
                    <Text style={styles.label}>CPF:</Text>
                    <TextInput editable={isEditable} style={[styles.userInputInfo, { opacity: isEditable ? 1 : 0.5 }]}>{userData.cpf}</TextInput>
                </>
            )}
            {userData.crm && (
                <>
                    <Text style={styles.label}>CRM:</Text>
                    <TextInput editable={isEditable} style={[styles.userInputInfo, { opacity: isEditable ? 1 : 0.5 }]}>{userData.crm}</TextInput>
                </>
            )}
            {userData.specialization && (
                <>
                    <Text style={styles.label}>Especialização:</Text>
                    <TextInput editable={isEditable} style={[styles.userInputInfo, { opacity: isEditable ? 1 : 0.5 }]}>{userData.specialization}</TextInput>
                </>
            )}

            <Text style={styles.label}>Alterar Senha:</Text>
            <TextInput editable={isEditable} secureTextEntry={true} style={[styles.userInputInfo, { opacity: isEditable ? 1 : 0.5 }]}>{userData.password}</TextInput>
            
            <TouchableOpacity style={styles.editButton} onPress={handleEditToggle}>
                <Text style={styles.buttonText}>
                    {isEditable ? 'Salvar' : 'Editar Dados'}
                </Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView 
                contentContainerStyle={styles.scrollContainer} 
                showsVerticalScrollIndicator={false} // Oculta a barra de rolagem
            >
                {user.type === 'Recepcionista' && userInfo && (
                    <UserDetails userData={{ name: userInfo.recep_nome, email: userInfo.recep_email, phone: userInfo.recep_cel, cpf: userInfo.recep_cpf, password: userInfo.recep_senha }} />
                )}
                {user.type === 'Paciente' && userInfo && (
                    <UserDetails userData={{ name: userInfo.paci_nome, email: userInfo.paci_email, phone: userInfo.paci_cel, cpf: userInfo.paci_cpf, password: userInfo.paci_senha }} />
                )}
                {user.type === 'Medico' && userInfo && (
                    <UserDetails userData={{ name: userInfo.medi_nome, email: userInfo.medi_email, phone: userInfo.medi_cel, crm: userInfo.medi_crm, specialization: userInfo.medi_especializa, password: userInfo.medi_senha }} />
                )}

                <TouchableOpacity style={styles.logOutButton} onPress={handleLogout}>
                    <Text style={styles.TextButton}>Sair</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    container: {
        flex: 1,
        padding: 20,
    },
    scrollContainer: {
        flexGrow: 1, // Permite que o ScrollView expanda conforme necessário
        padding: 20,
         // Adiciona espaço inferior
    },
    backButton: {
        position: 'absolute',
        top: 0, 
        left: 0, 
    },
    profileImage: {
        borderRadius: 100,
        borderWidth: 2,
        borderColor: '#CCC',
        width: 120,
        height: 120,
        marginTop: 20, // Adicione uma margem superior
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    editButton: {
        width: '100%',
        backgroundColor: '#4fadfa', 
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 6,
        marginBottom: 25,
    },
    userInfoContainer: {
        flex: 1,
        gap: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    userInputInfo: {
        backgroundColor: "#ccc",
        borderRadius: 6,
        width: '100%',
        padding: 16,
    },
    label: {
        fontWeight: 'bold',
        fontSize: 14,
        color: '#000',
        alignSelf: 'flex-start',
        marginTop: 16,
    },
    headingText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
        alignSelf: 'flex-start',
        marginTop: 16,
    },
    TextButton: {
        color: '#FFF',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    logOutButton: {
        width: '100%',
        backgroundColor: '#f44336',
        paddingVertical: 12,
        borderRadius: 6,
    },
});

export default UserTypeDisplay;
