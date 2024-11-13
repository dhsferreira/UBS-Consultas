import type React from 'react';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput, Image, ScrollView, SafeAreaView } from 'react-native';
import { useUser } from '../UserContext'; 
import { supabase } from '../Supabase'; 
import { useNavigation } from '@react-navigation/native'; 
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/Feather';
import { TextInputMask } from 'react-native-masked-text';

const UserTypeDisplay: React.FC = () => {
    const { user, setUser } = useUser();
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditable, setIsEditable] = useState(false);
    const [userPhoto, setUserPhoto] = useState(require('../assets/avatar.png'));
    const navigation = useNavigation(); 

    // Função para selecionar foto do usuário
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
        
        // Atualiza a URL da foto no Supabase
        await updatePhotoInSupabase(photoURI);
    }

    // Atualiza a foto do usuário no Supabase
    const updatePhotoInSupabase = async (photoURI: string) => {
        try {
            const { error } = await supabase
                .from(user.type.toLowerCase()) // 'paciente', 'recepcionista' ou 'medico'
                .update({ paci_foto: photoURI }) // Atualize conforme o tipo de usuário
                .eq(user.type === 'Paciente' ? 'paci_id' : user.type === 'Recepcionista' ? 'recep_id' : 'medi_id', user.id);

            if (error) throw error;

            console.log('Foto atualizada com sucesso no Supabase');
        } catch (error) {
            console.error('Erro ao atualizar foto no Supabase:', error);
        }
    };

    // Carrega as informações do usuário
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
                // Carrega a foto do usuário
                if (data.paci_foto) {
                    setUserPhoto(data.paci_foto); // Atualiza a foto do usuário com a URL do Supabase
                }
            } catch (error) {
                console.error('Erro ao buscar informações do usuário:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserInfo();
    }, [user.id, user.type]);

    // Alterna o estado de edição
    const handleEditToggle = () => {
        setIsEditable(!isEditable);
    };

    // Salva as informações editadas
    const handleSave = async () => {
        try {
            let updatedData;

            if (user.type === 'Recepcionista') {
                updatedData = {
                    recep_nome: userInfo.recep_nome,
                    recep_email: userInfo.recep_email,
                    recep_cel: userInfo.recep_cel,
                    recep_senha: userInfo.recep_senha,
                };

                const response = await fetch(`http://10.47.7.48:3000/api/recepcionista/${user.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedData),
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log('Dados da recepcionista atualizados com sucesso:', result);
                } else {
                    console.error('Erro ao atualizar dados da recepcionista:', response.status);
                }
            } else if (user.type === 'Paciente') {
                updatedData = {
                    paci_nome: userInfo.paci_nome,
                    paci_email: userInfo.paci_email,
                    paci_cel: userInfo.paci_cel,
                    paci_senha: userInfo.paci_senha,
                };

               // Log dos parâmetros alterados
            console.log('Alterações do Paciente:', updatedData);

            const response = await fetch(`http://192.168.137.1:3000/api/paciente/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData),
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Dados do paciente atualizados com sucesso:', result);
            } else {
                const errorResponse = await response.text();  // Pega a resposta em texto
                console.error('Erro ao atualizar dados do paciente:', response.status, errorResponse);
            }
                
            } else if (user.type === 'Medico') {
                updatedData = {
                    medi_nome: userInfo.medi_nome,
                    medi_email: userInfo.medi_email,
                    medi_cel: userInfo.medi_cel,
                    medi_senha: userInfo.medi_senha,
                };

                const response = await fetch(`http://192.168.137.1:3000/api/medico/${user.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedData),
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log('Dados do médico atualizados com sucesso:', result);
                } else {
                    console.error('Erro ao atualizar dados do médico:', response.status);
                }
            }

        } catch (error) {
            console.error('Erro ao realizar a requisição:', error);
        } finally {
            setIsEditable(false); // Desabilita a edição após salvar
        }
    };

    // Função de logout
    const handleLogout = () => {
        setUser({ id: null, type: '' }); 
        navigation.navigate('Login'); 
    };

    // Retorna para a tela anterior
    const handleGoBack = () => {
        navigation.goBack(); 
    };

    // Exibe indicador de carregamento
    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView 
                contentContainerStyle={styles.scrollContainer} 
                showsVerticalScrollIndicator={false} // Oculta a barra de rolagem
            >
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
                    <TextInput 
                        editable={isEditable} 
                        value={userInfo?.paci_nome || userInfo?.recep_nome || userInfo?.medi_nome || ''} 
                        onChangeText={(text) => setUserInfo(prev => ({ ...prev, paci_nome: text, recep_nome: text, medi_nome: text }))} 
                        style={[styles.userInputInfo, { opacity: isEditable ? 1 : 0.5 }]} 
                    />

                    <Text style={styles.label}>Email:</Text>
                    <TextInput 
                        editable={isEditable} 
                        value={userInfo?.paci_email || userInfo?.recep_email || userInfo?.medi_email || ''} 
                        onChangeText={(text) => setUserInfo(prev => ({ ...prev, paci_email: text, recep_email: text, medi_email: text }))} 
                        style={[styles.userInputInfo, { opacity: isEditable ? 1 : 0.5 }]} 
                    />

<Text style={styles.label}>Celular:</Text>
                    <TextInputMask
                        type={'cel-phone'}
                        options={{
                            maskType: 'BRL',
                            withDDD: true,
                            dddMask: '(99) ',
                        }}
                        value={userInfo?.paci_cel || userInfo?.recep_cel || userInfo?.medi_cel || ''}
                        onChangeText={(text) => setUserInfo(prev => ({
                            ...prev, 
                            paci_cel: text, 
                            recep_cel: text, 
                            medi_cel: text,
                        }))}
                        editable={isEditable}
                        style={[styles.userInputInfo, { opacity: isEditable ? 1 : 0.5 }]}
                    />

                  

                    {isEditable ? (
                        <TouchableOpacity style={styles.editButton} onPress={handleSave}>
                            <Text style={styles.buttonText}>Salvar</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={styles.editButton} onPress={handleEditToggle}>
                            <Text style={styles.buttonText}>Editar</Text>
                        </TouchableOpacity>
                    )}
                    
                    <TouchableOpacity style={styles.logOutButton} onPress={handleLogout}>
                        <Text style={styles.buttonText}>Logout</Text>
                    </TouchableOpacity>
                </View>
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
        flexGrow: 1,
        padding: 20,
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
        marginTop: 20,
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
        width: '100%',
        fontSize: 16,
        fontWeight: 'bold',
        marginVertical: 6,
        textAlign: 'left',
    },
    logOutButton: {
        backgroundColor: '#e63946',
        borderRadius: 6,
        paddingVertical: 12,
        paddingHorizontal: 32,
        marginBottom: 20,
    },
});

export default UserTypeDisplay;
