import React, { useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, StatusBar, Image, TouchableOpacity, Alert, TextInput, Modal, TouchableWithoutFeedback, FlatList } from 'react-native';
import { useRouter } from "expo-router";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, update, get } from 'firebase/database';

export default function Dashboard() {
  const router = useRouter();

  const [isTypeDropdownVisible, setTypeDropdownVisible] = useState(false);
  const [selectedType, setSelectedType] = useState('Select your vehicle type');
  const [selectedColor, setSelectedColor] = useState(null);
  const [plateNumber, setPlateNumber] = useState('');

  const vehicleColors = [
    { name: 'Black', colorCode: '#000000' },
    { name: 'White', colorCode: '#FFFFFF' },
    { name: 'Blue', colorCode: '#3B82F6' },
    { name: 'Red', colorCode: '#EF4444' },
    { name: 'Grey', colorCode: '#808080' },
    { name: 'Silver', colorCode: '#C0C0C0' },
  ];

  const types = ['Sedan', 'Coupes', 'Pickup', 'Van', 'SUV'];

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setTypeDropdownVisible(false);
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
  };

  const handleContinue = async () => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!plateNumber || selectedType === 'Select your vehicle type' || !selectedColor) {
    Alert.alert('Error', 'Please fill out all fields.');
    return;
  }

  if (user) {
    const uid = user.uid;
    const db = getDatabase();
    const userRef = ref(db, `users/${uid}`);
    const allUsersRef = ref(db, 'users');

    try {
      const snapshot = await get(allUsersRef);
      let plateExists = false;

      if (snapshot.exists()) {
        snapshot.forEach(childSnapshot => {
          const data = childSnapshot.val();
          if (
            data.plateNumber?.toLowerCase() === plateNumber.toLowerCase() &&
            childSnapshot.key !== uid
          ) {
            plateExists = true;
          }
        });
      }

      if (plateExists) {
        throw { code: 'custom/plate-already-in-use' };
      }

      const vehicleData = {
        vehicleType: selectedType,
        vehicleColor: selectedColor,
        plateNumber: plateNumber,
      };

      await update(userRef, vehicleData);
      Alert.alert('Success', 'Vehicle information has been saved.');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving vehicle data:', error);

      switch (error.code) {
        case 'custom/plate-already-in-use':
          Alert.alert('Error', 'License plate is already registered.');
          break;
        default:
          Alert.alert('Error', 'Failed to save data. Please try again.');
          break;
      }
    }
  } else {
    console.error('User not logged in');
    Alert.alert('Error', 'You must be logged in to continue.');
  }
};


  return (
    <ImageBackground source={require('../assets/images/gradientBG.png')} style={styles.background}>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.carContainer}>
          <Image source={require('../assets/images/car.png')} style={styles.car} />
          <Text style={styles.carText}>Please set up the Vehicle Information for security purposes.</Text>
        </View>
      </View>

      <View style={styles.mainInputContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Vehicle Type</Text>
          <View style={styles.inputRow}>
            <Icon name="directions-car" style={styles.icon} />
            <TouchableOpacity style={styles.inputTouchable} onPress={() => setTypeDropdownVisible(true)}>
              <Text style={{ color: selectedType === 'Select your vehicle type' ? '#ccc' : 'white' }}>{selectedType}</Text>
            </TouchableOpacity>
            <Icon name="arrow-drop-down" onPress={() => setTypeDropdownVisible(true)} style={styles.icon} />
          </View>
        </View>

        <Modal visible={isTypeDropdownVisible} transparent animationType="fade">
          <TouchableWithoutFeedback onPress={() => setTypeDropdownVisible(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.dropdownContainer}>
                  <FlatList
                    data={types}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                      <TouchableOpacity style={styles.dropdownItem} onPress={() => handleTypeSelect(item)}>
                        <Text style={styles.dropdownText}>{item}</Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Vehicle Plate Number</Text>
          <View style={styles.inputRow}>
            <Icon name="credit-card" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your vehicle plate number"
              placeholderTextColor="#ccc"
              value={plateNumber}
              onChangeText={setPlateNumber}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Vehicle Color</Text>
          <View style={styles.checkboxContainer}>
            {vehicleColors.map((color) => (
              <TouchableOpacity
                key={color.name}
                style={[
                  styles.checkbox,
                  { backgroundColor: color.colorCode, borderColor: selectedColor === color.name ? '#fff' : '#ccc' },
                ]}
                onPress={() => handleColorSelect(color.name)}
              >
                {selectedColor === color.name && <Icon name="check" size={20} color="black" />}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
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
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    carContainer: {
      flex: 1,
      alignItems: 'center',
      marginTop: 40,
    },
    car: {
      width: 150,
      height: 70,
      marginTop: 20,
      transform: [{ rotate: '90deg' }],
    },
    carText: {
      marginTop: 55,
      fontSize: 14,
      textAlign: 'center',
      paddingVertical: 5,
      marginBottom: 50,
      color: '#ccc',
    },
    mainInputContainer: {
      alignItems: 'center',
      marginTop: 10,
    },
    inputContainer: {
      width: '90%',
      marginBottom: 20,
      alignSelf: 'center',
    },
    label: {
      fontSize: 14,
      color: 'white',
      marginBottom: 10,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#1f3c53',
      borderRadius: 30,
      paddingHorizontal: 20,
      borderWidth: 2,
      borderColor: '#3accdb',
      marginBottom: 10,
    },
    inputTouchable: {
      flex: 1,
      height: 50,
      justifyContent: 'center',
      paddingHorizontal: 10,
    },
    input: {
      flex: 1,
      height: 50,
      color: 'white',
      paddingHorizontal: 10,
    },
    icon: {
      marginHorizontal: 5,
      fontSize: 20,
      color: "#fff"
    },
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    dropdownContainer: {
      backgroundColor: '#fff',
      width: '80%',
      borderRadius: 8,
      paddingVertical: 10,
    },
    dropdownItem: {
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#ccc',
    },
    dropdownText: {
      fontSize: 16,
      color: '#333',
    },
    checkboxContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    checkbox: {
      width: 40,
      height: 40,
      borderRadius: 10,
      borderWidth: 2,
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: 3,
      marginBottom: 10,
    },
    continueButton: {
        width: '90%',
        backgroundColor: '#c3f0ec',
        paddingVertical: 15,
        borderRadius: 30,
        alignItems: 'center',
        marginBottom: 50,
    },
    continueText: {
      color: '#1f3c53',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });