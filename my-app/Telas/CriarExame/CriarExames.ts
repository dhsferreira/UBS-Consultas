import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5', // Cor de fundo leve
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  leftButton: {
    padding: 10,
  },
  buttonImage: {
    width: 30,
    height: 30,
  },
  centerImage: {
    width: 100,
    height: 50,
    resizeMode: 'contain',
  },
  secondHeader: {
    marginVertical: 20,
  },
  smallText: {
    fontSize: 14,
    color: '#555',
  },
  largeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
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
