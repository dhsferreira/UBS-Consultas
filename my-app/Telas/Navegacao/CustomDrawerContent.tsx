import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { DrawerContentScrollView, DrawerItemList, DrawerContentComponentProps, DrawerItem } from '@react-navigation/drawer';

interface CustomDrawerContentProps extends DrawerContentComponentProps {
  userType: string;
}

const CustomDrawerContent: React.FC<CustomDrawerContentProps> = (props) => {
  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.imageContainer}>
        <Image
          source={require('../assets/ubsLogo.png')} // Verifique o caminho da sua imagem
          style={styles.drawerImage}
        />
      </View>
      <DrawerItemList {...props} />
      {props.userType === 'Recepcionista' && (
        <>
          <DrawerItem
            label="Cadastro"
            onPress={() => props.navigation.navigate('Cadastro')}
          />
          <DrawerItem
            label="Login"
            onPress={() => props.navigation.navigate('Login')}
          />
        </>
      )}
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  drawerImage: {
    width: 200, // Ajuste o tamanho conforme necessário
    height: 200,
    resizeMode: 'contain',
  },
});

export default CustomDrawerContent;