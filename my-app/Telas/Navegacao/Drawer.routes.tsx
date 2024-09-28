import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import LoginScreen from '../Login/Login'; // Verifique o caminho correto
import CadastroScreen from '../Cadastro/Cadastro'; // Verifique o caminho correto
import NoticiasScreen from '../Noticias/telaNoticias'; // Verifique o caminho correto
import ConsultasScreen from '../Consultas/Consultas'; // Verifique o caminho correto
import AgendarScreen from '../Agendar/Agendar'; // Verifique o caminho correto
import CustomDrawerContent from './CustomDrawerContent';
import UserInfo from '../UserInfo'; // Importa o novo componente
import UserScreen from '../Usuario/UserScreen'; // Importa o novo componente
import ConsultaRecepScreen from '../Consultas Recep/ConsultasRecep'; // Importa o novo componente
import AgendarHoraScreen from '../AgendarHora/AgendarHora'; // Importa o novo componente

import { Ionicons } from '@expo/vector-icons'; // Importando ícones do Expo
import { useUser } from '../UserContext'; // Importe o hook useUser

const Drawer = createDrawerNavigator();

export default function DrawerRoutes() {
  const { user } = useUser(); // Pegue o tipo de usuário do contexto

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{ headerShown: false }}
    >
      {user.type === '' ? (
        <>
          <Drawer.Screen
            name="Login"
            component={LoginScreen}
            options={{
              drawerLabel: 'Login',
              drawerIcon: ({ color, size }) => (
                <Ionicons name="home" size={size} color={color} />
              ),
              swipeEnabled: false,
            }}
          />
          <Drawer.Screen
            name="Cadastro"
            component={CadastroScreen}
            options={{
              drawerLabel: 'Cadastro',
              drawerIcon: ({ color, size }) => (
                <Ionicons name="document-text" size={size} color={color} />
              ),
              swipeEnabled: false,
            }}
          />
        </>
      ) : user.type === 'Paciente' ? (
        <>
          <Drawer.Screen
            name="Noticias"
            component={NoticiasScreen}
            options={{
              drawerLabel: 'Noticias',
              drawerIcon: ({ color, size }) => (
                <Ionicons name="person" size={size} color={color} />
              ),
            }}
          />
          <Drawer.Screen
            name="consultas"
            component={ConsultasScreen}
            options={{
              drawerLabel: 'Minhas Consultas',
              drawerIcon: ({ color, size }) => (
                <Ionicons name="albums" size={size} color={color} />
              ),
            }}
          />
          <Drawer.Screen
            name="Agendar"
            component={AgendarScreen}
            options={{
              drawerLabel: 'Agendar Consulta',
              drawerIcon: ({ color, size }) => (
                <Ionicons name="person" size={size} color={color} />
              ),
            }}
          />
          <Drawer.Screen
            name="usuario"
            component={UserScreen}
            options={{
              drawerLabel: 'usuario',
              drawerIcon: ({ color, size }) => (
                <Ionicons name="person" size={size} color={color} />
              ),
            }}
          />

        </>
      ) : user.type === 'Recepcionista' ? (
        <>
          <Drawer.Screen
            name="Noticias"
            component={NoticiasScreen}
            options={{
              drawerLabel: 'Noticias',
              drawerIcon: ({ color, size }) => (
                <Ionicons name="person" size={size} color={color} />
              ),
            }}
          />
          <Drawer.Screen
            name="usuario"
            component={UserScreen}
            options={{
              drawerLabel: 'usuario',
              drawerIcon: ({ color, size }) => (
                <Ionicons name="person" size={size} color={color} />
              ),
            }}
          />

<Drawer.Screen
            name="Consul_Recep"
            component={ConsultaRecepScreen}
            options={{
              drawerLabel: 'Consultas',
              drawerIcon: ({ color, size }) => (
                <Ionicons name="person" size={size} color={color} />
              ),
            }}
          />

<Drawer.Screen
            name="AgendarHora_Recep"
            component={AgendarHoraScreen}
            options={{
              drawerLabel: 'Cadastrar Horario',
              drawerIcon: ({ color, size }) => (
                <Ionicons name="person" size={size} color={color} />
              ),
            }}
          />
        </>

        
      ) : null /* Caso o user.type não seja reconhecido */
      }
    </Drawer.Navigator>
  );
}
