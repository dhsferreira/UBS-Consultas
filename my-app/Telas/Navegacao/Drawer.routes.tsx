import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../Login/Login';
import ResetPasswordScreen from '../Login/RecuperarSenha';
import CadastroScreen from '../Cadastro/Cadastro';
import NoticiasScreen from '../Noticias/telaNoticias';
import ConsultasScreen from '../Consultas/Consultas';
import AgendarScreen from '../Agendar/Agendar';
import UserScreen from '../Usuario/UserScreen';
import ConsultaRecepScreen from '../Consultas Recep/ConsultasRecep';
import AgendarHoraScreen from '../AgendarHora/AgendarHora';
import ConsultaMedScreen from '../Consultas Med/ConsultasMed';
import ExamesMedScreen from '../Exames Med/ExamesMed';
import CriarExame from '../CriarExame/CriarExame';
import CustomDrawerContent from './CustomDrawerContent';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../UserContext';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

function DrawerRoutes() {
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
            name="ResetPassword"
            component={ResetPasswordScreen}
            options={{
              drawerLabel: 'RecuperarSenha',
              drawerIcon: ({ color, size }) => (
                <Ionicons name="senha" size={size} color={color} />
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
              drawerLabel: 'Notícias',
              drawerIcon: ({ color, size }) => (
                <Ionicons name="newspaper" size={size} color={color} />
              ),
            }}
          />
          <Drawer.Screen
            name="Consultas"
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
                <Ionicons name="calendar" size={size} color={color} />
              ),
            }}
          />
          <Drawer.Screen
            name="Usuario"
            component={UserScreen}
            options={{
              drawerLabel: 'Usuário',
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
              drawerLabel: 'Notícias',
              drawerIcon: ({ color, size }) => (
                <Ionicons name="newspaper" size={size} color={color} />
              ),
            }}
          />
          <Drawer.Screen
            name="Usuario"
            component={UserScreen}
            options={{
              drawerLabel: 'Usuário',
              drawerIcon: ({ color, size }) => (
                <Ionicons name="person" size={size} color={color} />
              ),
            }}
          />
          <Drawer.Screen
            name="ConsultasRecep"
            component={ConsultaRecepScreen}
            options={{
              drawerLabel: 'Consultas',
              drawerIcon: ({ color, size }) => (
                <Ionicons name="albums" size={size} color={color} />
              ),
            }}
          />
          <Drawer.Screen
            name="AgendarHoraRecep"
            component={AgendarHoraScreen}
            options={{
              drawerLabel: 'Cadastrar Horário',
              drawerIcon: ({ color, size }) => (
                <Ionicons name="time" size={size} color={color} />
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
              drawerLabel: 'Notícias',
              drawerIcon: ({ color, size }) => (
                <Ionicons name="newspaper" size={size} color={color} />
              ),
            }}
          />
          <Drawer.Screen
            name="Usuario"
            component={UserScreen}
            options={{
              drawerLabel: 'Usuário',
              drawerIcon: ({ color, size }) => (
                <Ionicons name="person" size={size} color={color} />
              ),
            }}
          />
          <Drawer.Screen
            name="ConsultasMed"
            component={ConsultaMedScreen}
            options={{
              drawerLabel: 'Consultas',
              drawerIcon: ({ color, size }) => (
                <Ionicons name="albums" size={size} color={color} />
              ),
            }}
          />
         
          
        </>
      ) : null}
    </Drawer.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Inclui o Drawer Navigator */}
      <Stack.Screen name="Drawer" component={DrawerRoutes} />
      
      {/* Adiciona as telas ocultas no Stack Navigator */}
      <Stack.Screen name="CriarExame" component={CriarExame} />
      <Stack.Screen name="ExamesMed" component={ExamesMedScreen} />
    </Stack.Navigator>
  );
}
