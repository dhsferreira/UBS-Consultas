// App.tsx

import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import DrawerRoutes from './Telas/Navegacao/Drawer.routes'; // Certifique-se de que o caminho está correto
import { UserProvider } from './Telas/UserContext'; // Certifique-se de que o caminho está correto

export default function App() {
    return (
        <NavigationContainer>
            <UserProvider>
                <DrawerRoutes />
            </UserProvider>
        </NavigationContainer>
    );
}
