import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6EEFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 30,
    position: 'relative',
    borderBottomWidth: 1, // Adiciona uma borda inferior
    borderBottomColor: 'black', // Cor da borda inferior
  },
  leftButton: {
    padding: 10,
  },
  buttonImage: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    marginTop: 45,
  },
  centerImage: {
    width: 200,
    height: 50,
    marginTop: 30, // Ajuste o valor para mover a imagem para baixo
    left: '50%',
    marginLeft: -50,
    marginRight: 120, 
    marginBottom: 10,
  },
  scrollContainer: {
    padding: 10,
    alignItems: 'center',
  },
  imageContainer: {
    width: 350,
    backgroundColor: 'white',
    padding: 10,
    marginBottom: 30,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 100,
    marginBottom: 10,
    resizeMode: 'cover',
    borderRadius: 8,
  },
  imageText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center', // Adicionando justificação ao texto
  },
  
});
