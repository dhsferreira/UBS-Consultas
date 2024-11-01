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

  menuContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    padding: 10,
  },
  menuButton: {
    backgroundColor: '#123CD3', // Cor dos botões (você pode alterar conforme sua necessidade)
    padding: 5,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    marginTop: -30,
    alignItems: 'center',
  },
  menuButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  menuButtonSelected: {
    backgroundColor: '#303E71', 
    padding: 5,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    marginTop: -30,
    alignItems: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f4f8', // Fundo suave e claro
},
container: {
    flex: 1,
    backgroundColor: '#ffffff', // Fundo branco
    padding: 20,
},
scrollContainer: {
    flexGrow: 1,
    padding: 20,
},
backButton: {
    position: 'absolute',
    top: 10, 
    left: 10, 
    padding: 10,
    borderRadius: 50,
    backgroundColor: '#e1e8ed', // Botão de voltar com fundo claro
},
profileImage: {
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#4fadfa', // Borda azul suave
    width: 120,
    height: 120,
    marginTop: 20,
    backgroundColor: '#f0f4f8', // Fundo suave para a imagem
},
headingText: {
    color: '#4a90e2', // Texto com tom azul claro
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
},

editButton: {
    width: '100%',
    backgroundColor: '#4a90e2', // Botão azul moderno
    paddingVertical: 12,
    borderRadius: 6,
    marginBottom: 25,
},
saveButton: {
    width: '100%',
    backgroundColor: '#50e3c2', // Botão verde para salvar
    paddingVertical: 12,
    borderRadius: 6,
    marginBottom: 25,
},
userInfoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff', // Fundo branco para o container de informações
    borderRadius: 10,
    elevation: 5, // Sombra para dar profundidade
},
userInputInfo: {
    backgroundColor: '#f0f4f8', // Cor de fundo suave para campos de entrada
    borderRadius: 6,
    width: '100%',
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#d1d1d1', // Borda clara
},
label: {
    width: '100%',
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 6,
    color: '#333', // Texto mais escuro para contraste
    textAlign: 'left',
},
logoutButton: {
    backgroundColor: '#e63946', // Vermelho para logout
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginBottom: 20,
},
profileContainer: {
  padding: 20,
  backgroundColor: '#f5f5f5',
  borderRadius: 10,
  margin: 10,
},
profileText: {
  fontSize: 16,
  color: '#333',
  marginBottom: 10,
},
profileLabel: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#000',
  marginTop: 10,
},
profileContainer: {
  flex: 1,
  backgroundColor: '#E0F7FA', // Cor de fundo semelhante à da imagem
  padding: 20,
  alignItems: 'center',
},
profileImageContainer: {
  alignItems: 'center',
  marginBottom: 20,
},
profileImage: {
  width: 100,
  height: 100,
  borderRadius: 50, // Para a imagem circular
  borderWidth: 1,
  borderColor: '#ccc',
  backgroundColor: '#fff',
},
infoContainer: {
  width: '100%',
  paddingHorizontal: 20,
},
profileLabel: {
  fontSize: 16,
  fontWeight: 'bold',
  color: '#000',
  marginBottom: 5,
  marginTop: 15,
},
infoBox: {
  backgroundColor: '#E0E0E0', // Cinza claro
  borderRadius: 10,
  padding: 10,
  marginBottom: 10,
},
infoText: {
  fontSize: 16,
  color: '#757575', // Cinza escuro para o texto
},
createRecipeButton: {
  width: '50%',
  backgroundColor: '#4a90e2', // Botão azul moderno
  paddingVertical: 12,
  borderRadius: 6,
  marginBottom: 25,
  alignSelf: 'center', // Centraliza o botão horizontalmente
},
createRecipeButtonText: {
  fontSize: 16,
  color: '#fff',
  alignSelf: 'center',
}

});
