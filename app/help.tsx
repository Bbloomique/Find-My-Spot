import { useRouter } from "expo-router";
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, StatusBar, Image, TouchableOpacity, Modal, Pressable, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getDatabase, ref, get } from 'firebase/database';
import { getAuth, signOut } from 'firebase/auth';

export default function Help() {
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


  const handleArrowPress = (title, message) => {
    Alert.alert(
      title,
      message,
      [{ text: 'OK' }],
      { cancelable: true }
    );
  };  

  return (
    <ImageBackground
      source={require('../assets/images/gradientBG.png')}
      style={styles.background}>
      <View style={styles.container}>
      <Text style={styles.categoryText}>Need assistance? The team is here to help!</Text>
        <StatusBar barStyle="dark-content" />

        <View style={styles.NContainer}>
          <TouchableOpacity style={styles.NavContainer} onPress={() => handleArrowPress(
                'Frequently Asked Questions', 
                '1. How do I see available slots?\n\t- Go to the location, number of available slots will be displayed, confirm parking if there is available slots.\n\n2. How can I cancel my reservation?\n\t- Visit dashboard > Location > Cancel Reservation.\n\n3. How do I update my profile?\n\t- Go to Profile > Edit to update your details.\n\n4. What should I do if I encounter a problem?\n\t- Visit Dashboard > Profile > Help & Support > See Report a Problem > write us an email.\n\n5. Is my information safe?\n\t- Yes. See our Privacy Policy for details.\n\n6. Can I register another vehicle to my account?\n\t- Yes, you can register multiple vehicles under your account. Go to Profile > Add Vehicle > Follow the instructions.'
          )}>
            <Icon name="question-answer" style={styles.icon} />
            <Text style={styles.NavText}>FAQs</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/notification')} style={styles.NavContainer}>
            <Icon name="notifications" style={styles.icon} />
            <Text style={styles.NavText}>Notification</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.NContainer}>
          <TouchableOpacity style={styles.NavContainer} onPress={() => handleArrowPress(
              'Contact Information', 
              'For any concerns, or inquiries, reach us at:\n\n📞\n+63 999 999 9999\n\n📧\nteam59parkingmanagement@gmail.com\n\n⌚\n8:00 AM to 5:00 PM (Daily)'
            )}>
            <Icon name="phone" style={styles.icon} />
            <Text style={styles.NavText}>Contact Us</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.NavContainer} onPress={() => handleArrowPress(
              'Report a Problem', 
              'Encountered a bug or error? Report it to:\n\n📧 team59parkingmanagement@gmail.com\n\nPlease include your name, contact number, and a detailed description of the encountered problem'
            )}>
            <Icon name="bug-report" style={styles.icon} />
            <Text style={styles.NavText}>Report a Problem</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.NContainer}>
          <TouchableOpacity style={styles.NavContainer} onPress={() => handleArrowPress(
              'Privacy Policy',
              'Thank you for using Find My Spot. We value your trust and are committed to protecting your personal information.\n\nInformation We Collect:\n- Name, Contact Number, Email Address, Image\n- Vehicle Details (Plate Number, Type, Color)\n- Location Data (For Parking Slot Booking)\n\nHow We Use Your Information:\n- To provide and manage parking services\n- To send booking notifications\n- To contact you for support\n- To ensure security and safety\n\nData Sharing & Security:\n- We do not sell or share your information without consent\n\nUser Rights:\n- You can update or request deletion of your data'
            )}>
            <Icon name="lock" style={styles.icon} />
            <Text style={styles.NavText}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.NavContainer} onPress={() => handleArrowPress(
              'Invite Your Friends',
              'Share -Find My Spot- with your friends and family!\n\nLet them experience a convenient way of finding parking slots.\n\nStart inviting now and help others enjoy hassle-free parking!'
            )}>
            <Icon name="person-add" style={styles.icon} />
            <Text style={styles.NavText}>Invite Friends</Text>
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
  },
  NContainer: {
    marginTop: 25,
    flexDirection: "row",
    justifyContent: "space-between", 
    alignItems: "center",
    width: "100%",
  },
  NavContainer: {
    flex: 1, 
    marginHorizontal: 5,
    backgroundColor: "#1b2c46",
    paddingVertical: 20, 
    borderRadius: 10, 
    alignItems: "center",
    justifyContent: "center",
    height: 150,
    borderWidth: 0.5,
    borderColor: "#c3f0ec",
  },
  NavText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  categoryTextContainer: {
    paddingVertical: 18,
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    paddingVertical: 20,
  },
  icon: {
    marginHorizontal: 5,
    fontSize: 24,
    color: "white"
  },
});
