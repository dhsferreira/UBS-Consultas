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
      borderBottomWidth: 1,
      borderBottomColor: 'black',
  
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
    marginTop: 30,
    left: '50%',
    marginLeft: -200,
    marginRight: 120,
    marginBottom: 10,
  },
  secondHeader: {
    backgroundColor: '#123CD3',
    padding: 10,
    width: '100%',
    alignSelf: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'black',
  },
  smallText: {
    fontSize: 14,
    color: 'white',
  },
  largeText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    marginTop: 5,
  },
  form: {
    backgroundColor: '#fff', // Cor de fundo do formulário
    borderRadius: 8,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2, // Para Android
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    padding: 10,
  },
  cancelButtonText: {
    color: '#f00', // Cor do texto do botão cancelar
    fontSize: 16,
  },
});
