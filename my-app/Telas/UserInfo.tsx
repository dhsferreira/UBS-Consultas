// UserInfo.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useUser } from './UserContext'; // Certifique-se de que o caminho está correto

const UserInfo: React.FC = () => {
    const { user } = useUser();

    return (
        <View style={styles.container}>
            <Text style={styles.text}>ID do Usuário: {user.id}</Text>
            <Text style={styles.text}>Tipo do Usuário: {user.type}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    text: {
        fontSize: 16,
        marginVertical: 5,
    },
});

export default UserInfo;
