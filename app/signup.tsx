import React, { useState } from 'react';
import { Text, View, StyleSheet, ImageBackground, Image, TouchableOpacity, TextInput, Modal, Alert } from "react-native";
import { useRouter } from "expo-router";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from "../app/firebaseConfig";

export default function SignUp() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      console.log('Success', 'Account created successfully!');
      router.push('/driverinfo');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setPasswordError('');
    } catch (error) {
      console.log('Error', error.message);
      if (error.code === 'auth/password-does-not-meet-requirements') {
        setPasswordError('Password must contain:\n• At least 1 uppercase letter\n• At least 1 special character\n• At least 1 number\n• Minimum of 6 characters');
      } else {
        setPasswordError(error.message);
      }
    }
  };

  const handleSignIn = () => {
    router.push('/login');
  };

  return (
    <ImageBackground source={require('../assets/images/gradientBG.png')} style={styles.background}>
      <View style={styles.container}>
        <Image source={require('../assets/images/logo.png')} style={styles.logo} />
        <Text style={styles.title}>Sign Up</Text>
        <Text style={styles.subtitle}>Create an account to continue!</Text>

        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <Icon name="email" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#ccc"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <Icon name="lock" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#ccc"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon name={showPassword ? 'visibility' : 'visibility-off'} style={styles.icon} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <Icon name="lock" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#ccc"
              secureTextEntry={!showPassword2}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword2(!showPassword2)}>
              <Icon name={showPassword2 ? 'visibility' : 'visibility-off'} style={styles.icon} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Display Password Error Message */}
        {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

        <TouchableOpacity style={styles.SignUpbutton} onPress={handleSignUp}>
          <Text style={styles.SignUpText}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.SignInbutton} onPress={handleSignIn}>
          <Text style={{ color: 'white' }}>
            Already have an account? <Text style={styles.SignInText}>Sign In.</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
    background: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
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
      width: '95%',
      marginBottom: 20,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#1f3c53',
      borderRadius: 30,
      paddingHorizontal: 15,
      borderWidth: 2,
      borderColor: '#3accdb',
      height: 50,
    },
    icon: {
        marginHorizontal: 5,
        fontSize: 20,
        color: 'white',
      },
    input: {
      flex: 1,
      color: 'white',
      paddingHorizontal: 10,
    },
    errorText: {
      color: '#ff4500',
      fontSize: 12,
      textAlign: 'left',
      marginLeft: 50,
      width: '95%',
      marginBottom: 20,
    },
    SignUpbutton: {
      width: '95%',
      backgroundColor: '#c3f0ec',
      paddingVertical: 15,
      borderRadius: 30,
      alignItems: 'center',
      marginBottom: 15,
    },
    SignUpText: {
      color: '#1f3c53',
      fontSize: 16,
      fontWeight: 'bold',
    },
    SignInbutton: {
      paddingVertical: 10,
      alignItems: 'center',
    },
    SignInText: {
      color: '#3accdb',
      fontWeight: 'bold',
      textDecorationLine: 'underline',
    },
  });