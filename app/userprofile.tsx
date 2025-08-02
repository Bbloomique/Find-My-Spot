import { useRouter } from "expo-router";
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, StatusBar, Image, TouchableOpacity, Modal, Pressable, Alert, TextInput, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getDatabase, ref, get, update, remove } from 'firebase/database';
import { getAuth, signOut, deleteUser } from 'firebase/auth';
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

  const handleImagePicker = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Camera permission is required to use this feature.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      const base64 = result.assets[0].base64;
      const imageData = `data:image/jpeg;base64,${base64}`;

      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
          const db = getDatabase();
          const userRef = ref(db, `users/${user.uid}`);
          await update(userRef, { profileImage: imageData });

          setUserData((prevData) => ({
            ...prevData,
            profileImage: imageData,
          }));

          Alert.alert("Profile Image Updated", "Your profile image has been updated.");
        }
      } catch (error) {
        console.error("Image upload error:", error);
        Alert.alert("Error", "Failed to upload image. Please try again.");
      }
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

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account?\nThis action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const auth = getAuth();
              const user = auth.currentUser;
              if (user) {
                const db = getDatabase();
                const userRef = ref(db, `users/${user.uid}`);
                await remove(userRef); // Remove user data from database
                await deleteUser(user); // Delete user from Firebase Auth
                await AsyncStorage.clear();
                Alert.alert("Account Deleted", "Your account has been deleted.");
                router.push("/");
              }
            } catch (error) {
              console.error("Delete account error:", error);
              Alert.alert("Error", "Failed to delete account. Please re-login and try again.");
            }
          },
        },
      ]
    );
  };

  // Profile Edit Modal State
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

  // Vehicle Edit Modal State
  const [isEditVehicleModalVisible, setEditVehicleModalVisible] = useState(false);
  const [editedVehicleType, setEditedVehicleType] = useState('');
  const [editedVehicleColor, setEditedVehicleColor] = useState('');
  const [editedPlateNumber, setEditedPlateNumber] = useState('');

  const handleEditVehicle = () => {
    setEditedVehicleType(userData?.vehicleType || '');
    setEditedVehicleColor(userData?.vehicleColor || '');
    setEditedPlateNumber(userData?.plateNumber || '');
    setEditVehicleModalVisible(true);
  };

  const handleSaveVehicle = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const db = getDatabase();
        const userRef = ref(db, `users/${user.uid}`);

        await update(userRef, {
          vehicleType: editedVehicleType,
          vehicleColor: editedVehicleColor,
          plateNumber: editedPlateNumber,
        });

        setUserData((prevData) => ({
          ...prevData,
          vehicleType: editedVehicleType,
          vehicleColor: editedVehicleColor,
          plateNumber: editedPlateNumber,
        }));

        Alert.alert('Vehicle Information Updated', 'Your vehicle information has been successfully updated.');
        setEditVehicleModalVisible(false);
      }
    } catch (error) {
      console.error('Error updating vehicle information:', error);
      Alert.alert('Update Failed', 'An error occurred while updating your vehicle information.');
    }
  };

  return (
    <ImageBackground
      source={require('../assets/images/gradientBG.png')}
      style={styles.background}>
      <ScrollView contentContainerStyle={styles.container}>
        <StatusBar barStyle="dark-content" />

        <View style={styles.userInfo}>
          <TouchableOpacity onPress={handleImagePicker}>
            <Image
              source={
                userData?.profileImage
                  ? { uri: userData.profileImage }
                  : require('../assets/images/defaultPFP.jpg')
              }
              style={styles.userImage}
            />
          </TouchableOpacity>
          <View style={styles.userTextContainer}>
            <Text style={styles.nameText}>{userData?.fullName}</Text>
            <Text style={styles.emailText}>{userData?.email}</Text>
          </View>
        </View>

        {/* Car Information */}
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

        {/* Add Vehicle */}
        <View style={styles.categoryTextContainer}>
          <Icon name="add-circle-outline" style={styles.icon} />
          <Text style={styles.categoryText}>Add Vehicle</Text>
          <TouchableOpacity
            style={styles.arrowButton}
            onPress={() =>
              Alert.alert(
                "Add Vehicle",
                "To add another vehicle registered in your account, \n\nplease contact the management at +63 999 999 9999 \n(see Help > Contact Information)\n\nor directly ask the parking admin."
              )
            }
          >
            <Icon name="arrow-forward" style={styles.icon} />
          </TouchableOpacity>
        </View>
        <View style={styles.separator} />

                {/* Edit Profile */}
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

        {/* Help & Support */}
        <View style={styles.categoryTextContainer}>
          <Icon name="help" style={styles.icon} />
          <Text style={styles.categoryText}>Help & Support</Text>
          <TouchableOpacity
            style={styles.arrowButton}
            onPress={() => router.push('/help')}
          >
            <Icon name="arrow-forward" style={styles.icon} />
          </TouchableOpacity>
        </View>
        <View style={styles.separator} />

        {/* Delete Account */}
        <View style={styles.categoryTextContainer}>
          <Icon name="delete" style={styles.icon} />
          <Text style={styles.categoryText}>Delete Account</Text>
          <TouchableOpacity style={styles.arrowButton} onPress={handleDeleteAccount}>
            <Icon name="arrow-forward" style={styles.icon} />
          </TouchableOpacity>
        </View>

        {/* Log Out */}
        <View style={styles.logOutTextContainer}>
          <Icon name="exit-to-app" style={styles.icon2} />
          <Text style={styles.categoryText2}>Log Out</Text>
          <TouchableOpacity style={styles.arrowButton} onPress={handleLogOut}>
            <Icon name="arrow-forward" style={styles.icon2} />
          </TouchableOpacity>
        </View>

        {/* Edit Profile Modal */}
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

        {/* Edit Vehicle Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isEditVehicleModalVisible}
          onRequestClose={() => setEditVehicleModalVisible(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Vehicle Information</Text>
              <TextInput
                style={styles.input}
                placeholder="Vehicle Type"
                value={editedVehicleType}
                onChangeText={setEditedVehicleType}
              />
              <TextInput
                style={styles.input}
                placeholder="Vehicle Color"
                value={editedVehicleColor}
                onChangeText={setEditedVehicleColor}
              />
              <TextInput
                style={styles.input}
                placeholder="Plate Number"
                value={editedPlateNumber}
                onChangeText={setEditedPlateNumber}
              />
              <View style={styles.modalButtons}>
                <Pressable style={styles.button} onPress={() => setEditVehicleModalVisible(false)}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.button} onPress={handleSaveVehicle}>
                  <Text style={styles.buttonText}>Save</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
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
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  userImage: {
    width: 160,
    height: 160,
    marginVertical: 15,
    borderRadius: 100,
  },
  userTextContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  nameText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
  },
  emailText: {
    fontSize: 14,
    color: 'white',
  },
  categoryTextContainer: {
    paddingVertical: 18,
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryText: {
    fontSize: 16,
    color: 'white',
    marginLeft: 10,
  },
  categoryText2: {
    fontSize: 16,
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
    marginBottom: 30,
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
    backgroundColor: '#005a9c',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
