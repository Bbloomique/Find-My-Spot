import { useRouter } from "expo-router";
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, StatusBar, Image, TouchableOpacity, Modal, Pressable, Alert, TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getDatabase, ref, get, update } from 'firebase/database';
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

  const handleArrowPress = (title, message) => {
    Alert.alert(
      title,
      message,
      [{ text: 'OK' }],
      { cancelable: true }
    );
  };  

  const handleArrowPress2 = (vehicleType, vehicleColor, plateNumber) => {
    Alert.alert(
      'Car Information',
      `Vehicle Type: ${vehicleType || 'N/A'}\nVehicle Color: ${vehicleColor || 'N/A'}\nPlate Number: ${plateNumber || 'N/A'}`,
      [{ text: 'OK' }],
      { cancelable: true }
    );
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

  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editedFullName, setEditedFullName] = useState('');
  const [editedContactNumber, setEditedContactNumber] = useState('');
  const [editedEmail, setEditedEmail] = useState('');

  const handleEditProfile = () => {
    setEditedFullName(userData?.fullName || '');
    setEditedContactNumber(userData?.contactNumber || '');
    setEditedEmail(userData?.email || '');
    setEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const db = getDatabase();
        const userRef = ref(db, `users/${user.uid}`);

        await update(userRef, {
          fullName: editedFullName,
          contactNumber: editedContactNumber,
          email: editedEmail,
        });

        setUserData((prevData) => ({
          ...prevData,
          fullName: editedFullName,
          contactNumber: editedContactNumber,
          email: editedEmail,
        }));

        Alert.alert('Profile Updated', 'Your profile has been successfully updated.');
        setEditModalVisible(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Update Failed', 'An error occurred while updating your profile.');
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
          <Icon name="directions-car" style={styles.icon} />
          <Text style={styles.categoryText}>Car Information</Text>
          <TouchableOpacity 
            style={styles.arrowButton} 
            onPress={() => handleArrowPress2(userData?.vehicleType, userData?.vehicleColor, userData?.plateNumber)}>
            <Icon name="arrow-forward" style={styles.icon} />
          </TouchableOpacity>
        </View>
        <View style={styles.separator} />

        <View style={styles.categoryTextContainer}>
          <Icon name="check-circle-outline" style={styles.icon} />
          <Text style={styles.categoryText}>Valid Until</Text>
          <TouchableOpacity 
            style={styles.arrowButton} 
            onPress={() => handleArrowPress(
              'Account Valid Until: May 30, 2025', 
              'Your parking account is active and valid until the date specified above. Please renew your account before the expiration date to continue the access to our parking services.'
            )}
          >
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
          <Icon name="edit" style={styles.icon} />
          <Text style={styles.categoryText}>Edit Profile</Text>
          <TouchableOpacity 
            style={styles.arrowButton} 
            onPress={handleEditProfile}>
            <Icon name="arrow-forward" style={styles.icon} />
          </TouchableOpacity>
        </View>
        <View style={styles.separator} />

        <Modal
          animationType="slide"
          transparent={true}
          visible={isEditModalVisible}
          onRequestClose={() => setEditModalVisible(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Profile</Text>

              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={editedFullName}
                onChangeText={setEditedFullName}
              />
              <TextInput
                style={styles.input}
                placeholder="Contact Number"
                value={editedContactNumber}
                onChangeText={setEditedContactNumber}
                keyboardType="phone-pad"
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={editedEmail}
                onChangeText={setEditedEmail}
                keyboardType="email-address"
              />

              <View style={styles.modalButtons}>
                <Pressable style={styles.button} onPress={() => setEditModalVisible(false)}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.button} onPress={handleSaveProfile}>
                  <Text style={styles.buttonText}>Save</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        <View style={styles.logOutTextContainer}>
          <Icon name="exit-to-app" style={styles.icon2} />
          <Text style={styles.categoryText2}>Log Out</Text>
          <TouchableOpacity style={styles.arrowButton} onPress={handleLogOut}>
            <Icon name="arrow-forward" style={styles.icon2} />
          </TouchableOpacity>
        </View>
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
    width: 180,
    height: 180,
    marginVertical: 15,
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
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 2,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    padding: 10,
    borderRadius: 5,

    alignItems: 'center',
  },
  buttonText: {
    color: '#005a9c',
  },
});
