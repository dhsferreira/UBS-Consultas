import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import LoginScreen from '../Login/Login'; 
import CadastroScreen from '../Cadastro/Cadastro'; 
import NoticiasScreen from '../Noticias/telaNoticias'; 
import ConsultasScreen from '../Consultas/Consultas'; 
import AgendarScreen from '../Agendar/Agendar'; 
import CustomDrawerContent from './CustomDrawerContent';
import UserInfo from '../UserInfo'; 
import UserScreen from '../Usuario/UserScreen'; 
import ConsultaRecepScreen from '../Consultas Recep/ConsultasRecep'; 
import AgendarHoraScreen from '../AgendarHora/AgendarHora'; 
import ConsultaMedScreen from '../Consultas Med/ConsultasMed'; 

import { Ionicons } from '@expo/vector-icons'; 
import { useUser } from '../UserContext'; 

const Drawer = createDrawerNavigator();

export default function DrawerRoutes() {
  const { user } = useUser(); 

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
      ) : user.type === 'Medico' ? (
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
            name="Consul_med"
            component={ConsultaMedScreen}
            options={{
              drawerLabel: 'Consultas',
              drawerIcon: ({ color, size }) => (
                <Ionicons name="person" size={size} color={color} />
              ),
            }}
          />
        </>
      ) : null}
    </Drawer.Navigator>
  );
}
