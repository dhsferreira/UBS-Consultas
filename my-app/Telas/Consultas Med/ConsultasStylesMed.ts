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
    marginLeft: -50,
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
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    flex: 1,
    backgroundColor: 'white',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#123CD3',
    borderRadius: 5,
  },
  filterButtonImage: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  filterButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  scrollViewContent: {
    padding: 10,
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    marginVertical: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  cardText: {
    fontSize: 16,
    marginVertical: 5,
  },
  textStatus: {
    backgroundColor: 'rgba(255,255,0,0.3)',
    borderRadius: 5,
    borderColor: 'rgba(255,255,0,0.6)',
    borderWidth: 1, // Adicionando a borda
    padding: 5, // Adicionando algum preenchimento
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#007bff',
    width: 300,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  filterOption: {
    paddingVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  filterOptionText: {
    color: '#fff',
    fontSize: 16,
  },
  // Estilos adicionais para os botões "Exames" e "Receitas"
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    backgroundColor: '#123CD3',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
