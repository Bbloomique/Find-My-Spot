import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, StatusBar, Image, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useRouter } from "expo-router";
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getDatabase, ref, set, get } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '../app/firebaseConfig';

export default function DriverInfo() {
  const router = useRouter();

  const [userImage, setUserImage] = useState(require('../assets/images/defaultPFP.jpg'));
  const [fullName, setFullName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const db = getDatabase(app);
  const auth = getAuth(app);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setEmail(currentUser.email); 
        fetchUserData(currentUser.uid);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe(); 
  }, []);

  const fetchUserData = async (uid) => {
    try {
      const userRef = ref(db, `users/${uid}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        setFullName(data.fullName || '');
        setContactNumber(data.contactNumber || '');
        if (data.profileImage) setUserImage({ uri: data.profileImage });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handlePressToolbarCamera = async () => {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) {
      Alert.alert('Camera permission is required to use this feature.');
      return;
    }
  
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaType.IMAGE, // Updated to use the new API
      quality: 1,
    });
  
    if (!result.canceled && result.assets.length > 0) {
      setUserImage({ uri: result.assets[0].uri });
    }
  };

  const handleSaveUserInfo = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be signed in to save data.');
      return;
    }

    try {
      const userRef = ref(db, `users/${user.uid}`);
      await set(userRef, {
        fullName,
        contactNumber,
        email: user.email,
        profileImage: userImage.uri || '',
      });

      Alert.alert('Success', 'Your information has been saved.');
      router.push('/vehicleinfo');
    } catch (error) {
      console.error("Database write error:", error);
      Alert.alert('Error', 'Failed to save data. Please try again.');
    }
  };

  return (
    <ImageBackground source={require('../assets/images/gradientBG.png')} style={styles.background}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <View style={styles.userInfoContainer}>
          <TouchableOpacity onPress={handlePressToolbarCamera}>
            <Image source={userImage} style={styles.userImage} />
          </TouchableOpacity>
          <Text style={styles.Text}>Enter personal information</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Full Name</Text>
          <View style={styles.inputRow}>
            <Icon name="person" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Enter Full Name"
              placeholderTextColor="#ccc"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Contact Number</Text>
          <View style={styles.inputRow}>
            <Icon name="phone" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Enter Contact Number"
              placeholderTextColor="#ccc"
              keyboardType="phone-pad"
              value={contactNumber}
              onChangeText={setContactNumber}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email Address</Text>
          <View style={styles.inputRow}>
            <Icon name="email" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Enter Email"
              placeholderTextColor="#ccc"
              keyboardType="email-address"
              value={email}
              editable={false} 
            />
          </View>
        </View>

        <TouchableOpacity style={styles.continueButton} onPress={handleSaveUserInfo}>
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    width: '100%',
  },
  userInfoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  userImage: {
    width: 120,
    height: 120,
    marginBottom: 5,
    borderRadius: 100,
  },
  Text: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 10,
    marginBottom: 20,
    color: '#ccc',
  },
  inputContainer: {
    width: '95%',
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: 'white',
    marginBottom: 5,
    marginLeft: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f3c53',
    borderRadius: 30,
    paddingHorizontal: 15,
    borderWidth: 2,
    borderColor: '#3accdb',
    marginBottom: 20,
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
  continueButton: {
    width: '95%',
    backgroundColor: '#c3f0ec',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 15,
  },
  continueText: {
    color: '#1f3c53',
    fontSize: 16,
    fontWeight: 'bold',
  },
});