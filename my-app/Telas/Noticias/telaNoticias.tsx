import React from 'react';
import { View, Image, TouchableOpacity, ScrollView, Text, Linking } from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { styles } from './noticiasStyles';

const images = [
  { src: require('../assets/noticia1.png'), text: 'Atende Já Dengue e Saúde Agora abrem quatro UBS neste sábado', link: 'https://guarulhosweb.com.br/atende-ja-dengue-e-saude-agora-abrem-quatro-ubs-neste-sabado/' },
  { src: require('../assets/noticia2.png'), text: 'Paciente denuncia burocracia e demora no tratamento de um câncer na rede pública de saúde de SP', link: 'https://jovempan.com.br/programas/jornal-da-manha/paciente-denuncia-burocracia-e-demora-no-tratamento-de-um-cancer-na-rede-publica-de-saude-de-sp.html' },
  { src: require('../assets/noticia3.png'), text: 'UBS Progresso realiza ação de prevenção de acidentes na infância em escola', link: 'https://www.pjf.mg.gov.br/noticias/view.php?modo=link2&idnoticia2=80932' },
  { src: require('../assets/noticia4.png'), text: 'Com queda na procura, Sorocaba encerra atendimento exclusivo para dengue em UBSs Sentinelas', link: 'https://g1.globo.com/sp/sorocaba-jundiai/noticia/2024/06/13/com-queda-na-procura-sorocaba-encerra-atendimento-exclusivo-para-dengue-em-ubss-sentinelas.ghtml' },
];

export default function HomeScreen() {
  const navigation = useNavigation();

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const handlePress = (link) => {
    Linking.openURL(link);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.leftButton} onPress={openDrawer}>
          <Image
            source={require('../assets/3 linhas.png')}
            style={styles.buttonImage}
          />
        </TouchableOpacity>
        <Image
          source={require('../assets/ubsLogo.png')}
          style={styles.centerImage}
        />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {images.map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.imageContainer} 
            onPress={() => item.link ? handlePress(item.link) : null}
          >
            <Image source={item.src} style={styles.image} />
            <Text style={styles.imageText}>{item.text}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
