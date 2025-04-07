import { Text, View, StyleSheet, ImageBackground, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from 'expo-status-bar';

export default function Index() {
  const router = useRouter();

  return (
    <ImageBackground source={require('../assets/images/homeBG.jpg')} style={styles.background}>
      <View style={styles.overlay} />
      <StatusBar barStyle="light-content" />
      <Image source={require('../assets/images/logo.png')} style={styles.logo} />

      <TouchableOpacity onPress={() => router.push('/login')} style={styles.button}>
        <Image source={require('../assets/images/start.png')} style={styles.imageButton} />
      </TouchableOpacity>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  logo: {
    width: 400,
    height: 400,
    marginBottom: 40,
  },
  imageButton: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  button: {
    alignItems: 'center',
  },
});

