import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../UserContext';
import CustomDrawerContent from './CustomDrawerContent';
import LoginScreen from '../Login/Login'; 
import CadastroScreen from '../Cadastro/Cadastro'; 
import NoticiasScreen from '../Noticias/telaNoticias'; 
import ConsultasScreen from '../Consultas/Consultas'; 
import AgendarScreen from '../Agendar/Agendar'; 
import UserScreen from '../Usuario/UserScreen'; 
import ConsultaRecepScreen from '../Consultas Recep/ConsultasRecep'; 
import AgendarHoraScreen from '../AgendarHora/AgendarHora'; 
import ConsultaMedScreen from '../Consultas Med/ConsultasMed'; 
import ExamesMedScreen from '../Exames Med/ExamesMed'; 
import CriarExameScreen from '../CriarExame/CriarExame'; 

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

function MedicoStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ConsultaMed" component={ConsultaMedScreen} />
      <Stack.Screen name="ExamesMed" component={ExamesMedScreen} />
      <Stack.Screen name="CriarExame" component={CriarExameScreen} />
    </Stack.Navigator>
  );
}

export default function DrawerRoutes() {
  const { user } = useUser();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{ headerShown: false }}
    >
      {user.type === '' ? (
        <>
          <Drawer.Screen name="Login" component={LoginScreen} options={{
            drawerLabel: 'Login',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
            swipeEnabled: false,
          }} />
          <Drawer.Screen name="Cadastro" component={CadastroScreen} options={{
            drawerLabel: 'Cadastro',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="document-text" size={size} color={color} />
            ),
            swipeEnabled: false,
          }} />
        </>
      ) : user.type === 'Paciente' ? (
        <>
          <Drawer.Screen name="Noticias" component={NoticiasScreen} options={{
            drawerLabel: 'Noticias',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }} />
          <Drawer.Screen name="consultas" component={ConsultasScreen} options={{
            drawerLabel: 'Minhas Consultas',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="albums" size={size} color={color} />
            ),
          }} />
          <Drawer.Screen name="Agendar" component={AgendarScreen} options={{
            drawerLabel: 'Agendar Consulta',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }} />
          <Drawer.Screen name="usuario" component={UserScreen} options={{
            drawerLabel: 'usuario',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }} />
        </>
      ) : user.type === 'Recepcionista' ? (
        <>
          <Drawer.Screen name="Noticias" component={NoticiasScreen} options={{
            drawerLabel: 'Noticias',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }} />
          <Drawer.Screen name="usuario" component={UserScreen} options={{
            drawerLabel: 'usuario',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }} />
          <Drawer.Screen name="Consul_Recep" component={ConsultaRecepScreen} options={{
            drawerLabel: 'Consultas',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }} />
          <Drawer.Screen name="AgendarHora_Recep" component={AgendarHoraScreen} options={{
            drawerLabel: 'Cadastrar Horario',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }} />
        </>
      ) : user.type === 'Medico' ? (
        <>
          <Drawer.Screen name="Noticias" component={NoticiasScreen} options={{
            drawerLabel: 'Noticias',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }} />
          <Drawer.Screen name="usuario" component={UserScreen} options={{
            drawerLabel: 'usuario',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }} />
          <Drawer.Screen name="Consultas" component={MedicoStack} options={{
            drawerLabel: 'Consultas',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="albums" size={size} color={color} />
            ),
          }} />
        </>
      ) : null}
    </Drawer.Navigator>
  );
}
