import React, { useState } from 'react';
import { Text, View, StyleSheet, ImageBackground, Image, TouchableOpacity, TextInput, Modal, Alert, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getDatabase, ref, get, onValue, set, update } from 'firebase/database';
import { signInWithEmailAndPassword, sendPasswordResetEmail, } from 'firebase/auth';
import { auth } from "../app/firebaseConfig";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSignIn = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      console.log('User signed in successfully!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Authentication error:', error.message);
      Alert.alert('Sign In Failed', error.message);
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      setResetMessage('Please enter your email.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage('Password reset email sent! Check your inbox.');
    } catch (error) {
      setResetMessage('Error: ' + error.message);
    }
  };

  const handleCloseModal = () => {
    setResetEmail('');
    setResetMessage('');
    setModalVisible(false);
  };

  return (
    <ImageBackground source={require('../assets/images/gradientBG.png')} style={styles.background}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <Image source={require('../assets/images/logo.png')} style={styles.logo} />
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>Enter your details below to sign in into your account.</Text>

        <View style={styles.inputContainer}>
          <Icon name="email" style={styles.icon} />
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="#ccc"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="lock" style={styles.icon} />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor="#ccc"
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Icon name={showPassword ? 'visibility' : 'visibility-off'} style={styles.icon} />
          </TouchableOpacity>
        </View>

        <View style={styles.rememberForgotContainer}>
          <TouchableOpacity style={styles.rememberMe} onPress={() => setRememberMe(!rememberMe)}>
            <View style={styles.checkbox}>{rememberMe && <Icon name="check" size={18} color="#fff" />}</View>
            <Text style={styles.rememberMeText}>Remember Me?</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
          <Text style={styles.signInText}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.signUpButton} onPress={() => router.push('/signup')}>
          <Text style={{ color: 'white' }}>
            Don't have an account yet? <Text style={styles.signUpText}>Sign Up.</Text>
          </Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reset Password</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter your email"
              placeholderTextColor="#ccc"
              value={resetEmail}
              onChangeText={setResetEmail}
            />
            <Text style={styles.Message}>We'll send a link for password reset to this email if it matches an existing account.</Text>
            <Text style={styles.resetMessage}>{resetMessage}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={handlePasswordReset}>
              <Text style={styles.modalButtonText}>Next</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCloseButton} onPress={handleCloseModal}>
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    width: '100%',
  },
  logo: {
    width: 300,
    height: 200,
    marginTop: 20,
  },
  title: {
      fontSize: 38,
      fontWeight: 'bold',
      color: 'white',
    },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 10,
    marginBottom: 40,
    color: '#ccc',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f3c53',
    borderRadius: 30,
    paddingHorizontal: 15,
    borderWidth: 2,
    borderColor: '#3accdb',
    marginBottom: 20,
    width: '95%',
    height: 50,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    color: '#fff',
  },
  icon: {
    marginHorizontal: 5,
    fontSize: 20,
    color: "#fff"
  },
  forgotPasswordText: {
    color: 'white',
    marginRight: 20,
    marginTop: 15,
  },
  rememberForgotContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '95%',
    marginBottom: 20,
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 15,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#3accdb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
  },
  rememberMeText: {
    color: 'white',
  },
  signInButton: {
    width: '95%',
    backgroundColor: '#c3f0ec',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 15,
  },
  signInText: {
    color: '#1f3c53',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signUpButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  signUpText: {
    color: '#3accdb',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#1f3c53',
    paddingTop: 50,
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  modalContent: {
    backgroundColor: '#1f3c53',
    padding: 20,
    borderRadius: 20,
    width: '90%',
    alignItems: 'center',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 30,
    paddingRight: 120,
  },
  modalInput: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 5,
    width: '100%',
    marginBottom: 10,
  },
  Message: {
    color: 'white',
    marginVertical: 10,
  },
  resetMessage: {
    color: '#ccc',
    marginVertical: 10,
  },
  modalButton: {
    backgroundColor: '#c3f0ec',
    padding: 15,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#1f3c53',
    fontWeight: 'bold',
  },
  modalCloseButton: {
    marginTop: 10,
  },
  modalCloseButtonText: {
    color: '#3accdb',
    fontWeight: 'bold',
  },
});
