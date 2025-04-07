import { useRouter } from "expo-router";
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, StatusBar, Image, TouchableOpacity, Modal, Pressable, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getDatabase, ref, get } from 'firebase/database';
import { getAuth, signOut } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function UserProfile() {
  const router = useRouter();

  const [userData, setUserData] = useState(null);
  
  // Fetch user data from Firebase
  useEffect(() => {
    const fetchUserData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const db = getDatabase();
        const userRef = ref(db, `users/${user.uid}`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
          setUserData(snapshot.val());
        }
      }
    };

    fetchUserData();
  }, []);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalText, setModalText] = useState('');
  const [userImage, setUserImage] = useState(require('../assets/images/user.png'));

  const handleImagePicker = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Camera permission is required to use this feature.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setUserImage({ uri });
    }
  };

  const handleArrowPress = (text) => {
    setModalText(text);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const handleLogOut = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      await AsyncStorage.removeItem('email');
      await AsyncStorage.removeItem('password');
      console.log('User logged out successfully!');
      router.push('/');
    } catch (error) {
      console.error('Sign Out error:', error.message);
      Alert.alert('Log Out Failed', error.message);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/images/gradientBG.png')}
      style={styles.background}>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />

        <View style={styles.userInfo}>
          <TouchableOpacity onPress={handleImagePicker}>
            <Image
            source={userData?.profileImage ? { uri: userData.profileImage } : require('../assets/images/defaultPFP.jpg')}
            style={styles.userImage}
            />
          </TouchableOpacity>
          <View style={styles.userTextContainer}>
            <Text style={styles.nameText}>{userData?.fullName}</Text>
            <Text style={styles.emailText}>{userData?.email}</Text>
          </View>
        </View>

        <View style={styles.categoryTextContainer}>
          <Icon name="credit-card" style={styles.icon} />
          <Text style={styles.categoryText}>Valid Until</Text>
          <TouchableOpacity style={styles.arrowButton} onPress={() => handleArrowPress('Your valid date is until December 14, 2024.')}>
            <Icon name="arrow-forward" style={styles.icon} />
          </TouchableOpacity>
        </View>
        <View style={styles.separator} />

        <View style={styles.categoryTextContainer}>
          <Icon name="notifications" style={styles.icon} />
          <Text style={styles.categoryText}>Notification</Text>
          <TouchableOpacity style={styles.arrowButton} onPress={() => router.push('/notification')}>
            <Icon name="arrow-forward" style={styles.icon} />
          </TouchableOpacity>
        </View>
        <View style={styles.separator} />

        <View style={styles.categoryTextContainer}>
          <Icon name="phone" style={styles.icon} />
          <Text style={styles.categoryText}>Contact Number</Text>
          <TouchableOpacity style={styles.arrowButton} onPress={() => handleArrowPress(userData?.contactNumber)}>
            <Icon name="arrow-forward" style={styles.icon} />
          </TouchableOpacity>
        </View>
        <View style={styles.separator} />

        <View style={styles.categoryTextContainer}>
          <Icon name="lock" style={styles.icon} />
          <Text style={styles.categoryText}>Privacy Policy</Text>
          <TouchableOpacity style={styles.arrowButton} onPress={() => handleArrowPress('Privacy policy details.')}>
            <Icon name="arrow-forward" style={styles.icon} />
          </TouchableOpacity>
        </View>
        <View style={styles.separator} />

        <View style={styles.categoryTextContainer}>
          <Icon name="person-add" style={styles.icon} />
          <Text style={styles.categoryText}>Invite Friends</Text>
          <TouchableOpacity style={styles.arrowButton} onPress={() => handleArrowPress('Invite your friends!')}>
            <Icon name="arrow-forward" style={styles.icon} />
          </TouchableOpacity>
        </View>
        <View style={styles.separator} />

        <View style={styles.logOutTextContainer}>
          <Icon name="exit-to-app" style={styles.icon2} />
          <Text style={styles.categoryText2}>Log Out</Text>
          <TouchableOpacity style={styles.arrowButton} onPress={handleLogOut}>
            <Icon name="arrow-forward" style={styles.icon2} />
          </TouchableOpacity>
        </View>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>{modalText}</Text>
              <Pressable style={styles.button} onPress={closeModal}>
                <Text style={styles.buttonText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 25,
    paddingTop: 10,
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userImage: {
    width: 150,
    height: 150,
    marginVertical: 20,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'white',
  },
  userTextContainer: {
    alignItems: 'center',
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  emailText: {
    fontSize: 14,
    color: 'white',
    marginBottom: 10
  },
  categoryTextContainer: {
    paddingVertical: 18,
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryText: {
    fontSize: 18,
    color: 'white',
    marginLeft: 10,
  },
  categoryText2: {
    fontSize: 18,
    marginLeft: 10,
  },
  icon: {
    marginHorizontal: 5,
    fontSize: 20,
    color: "#fff"
  },
  icon2: {
    marginHorizontal: 5,
    fontSize: 20,
    color: "black"
  },
  separator: {
    height: 1,
    width: '100%',
    backgroundColor: 'white',
  },
  arrowButton: {
    marginLeft: 'auto',
  },
  logOutTextContainer: {
    flexDirection: 'row',
    paddingVertical: 20,
    width: '100%',
    alignItems: 'center',
    marginBottom: 30
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#2196F3',
    borderRadius: 5,
    padding: 10,
    elevation: 2,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
