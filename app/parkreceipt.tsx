import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, StatusBar, ImageBackground, Image, TextInput, Modal, TouchableOpacity, Animated } from 'react-native';
import { getDatabase, ref, get, update } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from "expo-router";

export default function ParkReceipt() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [rating, setRating] = useState(0);  // New state for star rating
  const animatedValues = useRef([...Array(5)].map(() => new Animated.Value(1))).current;
  const [notifications, setNotifications] = useState([]);
  
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

  useEffect(() => {
      const fetchNotifications = async () => {
        const auth = getAuth();
        const user = auth.currentUser;
  
        if (user) {
          const db = getDatabase();
          const notificationsRef = ref(db, `notifications/${user.uid}`);
          const snapshot = await get(notificationsRef);
  
          if (snapshot.exists()) {
            const data = snapshot.val();
            const formattedNotifications = Object.keys(data).map((key) => ({
              id: key,
              ...data[key],
            }));
            setNotifications(formattedNotifications);
          }
        }
      };
  
      fetchNotifications();
    }, []);

  const [isModalVisible, setModalVisible] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  const handleSubmitReview = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
  
    if (user) {
      try {
        const db = getDatabase();
        const notificationsRef = ref(db, `notifications/${user.uid}`);
        const snapshot = await get(notificationsRef);
  
        if (snapshot.exists()) {
          const data = snapshot.val();
          const notificationIds = Object.keys(data);
          const lastNotificationId = notificationIds[notificationIds.length - 1];
  
          if (lastNotificationId) {
            const feedback = feedbackText.trim();
            const newTime = new Date().toLocaleString("en-PH", {
              timeZone: "Asia/Manila",
              hour: "numeric",
              minute: "numeric",
              hour12: true,
            });
  
            const updateData = {
              feedback: feedback || 'No feedback provided',
              timeOut: newTime,
              rating: rating || 0,
              title2: 'Parking Receipt',
              message2: 'Thank you parking with us!'
            };
  
            await update(ref(db, `notifications/${user.uid}/${lastNotificationId}`), updateData);
            console.log('Feedback submitted successfully!');
            setModalVisible(true);  // Show modal on success
          }
        }
      } catch (error) {
        console.error('Error submitting feedback:', error);
      }
    }
  };  

  const handleCloseModal = () => {
    setModalVisible(false);
    router.push('/dashboard');
  };

  // Handle star press animation and rating
  const handlePress = (index) => {
    setRating(index + 1);
    Animated.sequence([
      Animated.timing(animatedValues[index], { toValue: 0, duration: 100, useNativeDriver: true }),
      Animated.timing(animatedValues[index], { toValue: 1.2, duration: 200, useNativeDriver: true }),
      Animated.timing(animatedValues[index], { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  return (
    <ImageBackground source={require('../assets/images/gradientBG.png')} style={styles.background}>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />

        {/* Information Section */}
        <View style={styles.infoContainer}>
          <Image
            source={userData?.profileImage ? { uri: userData.profileImage } : require('../assets/images/defaultPFP.jpg')}
            style={styles.image}
          />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoText}>{userData?.plateNumber}</Text>
            <Text style={styles.infoText}>{userData?.vehicleType}</Text>
            <Text style={styles.infoText2}>{notifications[0]?.slotInfo || 'N/A'}</Text>
          </View>
        </View>

        {/* Log Activities Section */}
        <View style={styles.logContainer}>
          <Text style={styles.logTitle}>Log Activities</Text>
          <View style={styles.logContent}>
            <View style={styles.logItem}>
              <Text style={styles.logText}>Log In: {notifications[0]?.timeIn || 'N/A'}</Text>
            </View>
            <View style={styles.logItem}>
              <Text style={styles.logText}>Log Out: {notifications[0]?.timeOut || 'N/A'}</Text>
              <Text style={styles.dateText}>{notifications[0]?.date || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* Tell Us Your Experience Section */}
        <View style={styles.experienceContainer}>
          <Text style={styles.experienceTitle}>Tell Us Your Experience</Text>
          <TextInput
            style={styles.experienceInput}
            placeholder="Share your feedback..."
            placeholderTextColor="gray"
            multiline
            value={feedbackText}
            onChangeText={setFeedbackText}
          />
        </View>

        {/* Interactive Star Rating Section */}
        <View style={styles.starsContainer}>
          <Text style={styles.experienceTitle}>Rate Your Experience</Text>
          <View style={styles.rating}>
            {Array(5)
              .fill()
              .map((_, index) => (
                <TouchableOpacity key={index} onPress={() => handlePress(index)}>
                  <Animated.View style={{ transform: [{ scale: animatedValues[index] }] }}>
                    <FontAwesome
                      name="star"
                      size={40}
                      color={index < rating ? '#ffc73a' : '#666'}
                      style={styles.star}
                    />
                  </Animated.View>
                </TouchableOpacity>
              ))}
          </View>
        </View>

        {/* Submit Review Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmitReview}>
          <Text style={styles.submitButtonText}>Submit Review</Text>
        </TouchableOpacity>

        {/* Modal for Thank You Message */}
        <Modal
          visible={isModalVisible}
          transparent
          animationType="fade"
          onRequestClose={handleCloseModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>Thank You for Your Feedback!</Text>
              <TouchableOpacity style={styles.closeButton} onPress={handleCloseModal}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
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
    padding: 20,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'grey',
    borderRadius: 20,
    paddingVertical: 20,
    width: '95%',
    marginLeft: 10,
    marginTop: 50,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 50,
    borderWidth: 1,
    marginHorizontal: 20,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoText: {
    fontSize: 16,
    color: 'white',
    marginBottom: 5,
  },
  infoText2: {
    fontSize: 14,
    color: 'white',
    marginTop: 10,
  },
  logContainer: {
    //backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
    padding: 15,
    marginTop: 30,
    marginHorizontal: 20,
  },
  logTitle: {
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  logContent: {
    flexDirection: 'column',
    marginTop: 20,
  },
  logItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  logText: {
    fontSize: 16,
    color: 'white',
  },
  dateText: {
    fontSize: 12,
    color: 'white',
    alignSelf: 'flex-end',
  },
  experienceContainer: {
    marginTop: 30,
    width: '95%',
    marginLeft: 10,
  },
  experienceTitle: {
    fontSize: 18,
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  experienceInput: {
    height: 140,
    borderColor: 'white',
    borderRadius: 20,
    padding: 10,
    color: 'white',
    backgroundColor: '#333',
    textAlignVertical: 'top',
    fontSize: 14,
  },
  submitButton: {
    width: '95%',
    backgroundColor: '#c3f0ec',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 15,
    marginHorizontal: 10,
    marginTop: 30,
  },
  submitButtonText: {
    color: '#1f3c53',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  starsContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  rating: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 5,
  },
  star: {
    marginHorizontal: 5,
  },
});