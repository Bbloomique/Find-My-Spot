import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, StatusBar, ImageBackground, Image, TouchableOpacity, Modal, Alert } from 'react-native';
import { getDatabase, ref, get, push, update } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { useRouter, useLocalSearchParams } from "expo-router";

export default function ParkConfirm() {
  const router = useRouter();

  const [userData, setUserData] = useState(null);
  const [isModalVisible, setModalVisible] = useState(true);
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const db = getDatabase();
        const userRef = ref(db, `users/${user.uid}`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          setUserData(data);

          // Generate time and date once per session
          const newTime = new Date().toLocaleString("en-PH", {
            timeZone: "Asia/Manila",
            hour: "numeric",
            minute: "numeric",
            hour12: true,
          });
          const newDate = new Date().toLocaleDateString("en-PH", {
            timeZone: "Asia/Manila",
            month: "short",
            day: "numeric",
            year: "numeric",
          });

          setCurrentTime(newTime);
          setCurrentDate(newDate);

          // Removed the 6-hour check logic
          const notificationsRef = ref(db, `notifications/${user.uid}`);
          const notificationsSnapshot = await get(notificationsRef);

          // Create a new notification
          const newNotificationRef = push(notificationsRef);
          await update(newNotificationRef, {
            title: "Parking Successfully Booked",
            vehicleType: data.vehicleType,
            plateNumber: data.plateNumber,
            message: "Your parking reservation has been confirmed.",
            timestamp: new Date().toISOString(),
          });

          console.log("New notification created and saved in Firebase.");
        }
      }
    };
    fetchUserData();
  }, []);

  const handleConfirmParking = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const db = getDatabase();
    const notificationsRef = ref(db, `notifications/${user.uid}`);
    const snapshot = await get(notificationsRef);

    if (snapshot.exists()) {
      const notifications = snapshot.val();
      const notificationKeys = Object.keys(notifications);
      const latestNotificationKey = notificationKeys[notificationKeys.length - 1];

      if (latestNotificationKey) {
        const latestNotificationRef = ref(db, `notifications/${user.uid}/${latestNotificationKey}`);
        await update(latestNotificationRef, {
          timeIn: currentTime,
          date: currentDate,
          slotNo: "11", // papalitan pa or tatanggalin this
        });

        console.log("Parking session saved in Firebase.");
      }
    }

    router.push({
      pathname: '/dashboard',
      params: {
        showModal: "true",
        timeIn: currentTime,
        slotNo: "11", // papalitan pa or tatanggalin this
      },
    });
  };

  return (
    <ImageBackground source={require("../assets/images/4.png")} style={styles.background}>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <Modal visible={isModalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
            <View style={styles.modalContent}>
              <Image source={require("../assets/images/Ccar.png")} style={styles.circleImage} />
              <Text style={styles.modalSubtext}>{userData?.vehicleType}</Text>
              <Text style={styles.modalSubtext}>{userData?.plateNumber}</Text>
              <Text style={styles.modalTitle}>Parking Successfully Booked</Text>
              <Text style={styles.modalSubtext}>
                {currentTime} | {currentDate}
              </Text>
              <Text style={styles.modalSubtext}>{/*side ? `${side}, Slot No. 11` : "Slot No. 11"*/} Slot No. 11</Text>

              <TouchableOpacity style={styles.minButton} onPress={handleConfirmParking}>
                <Text style={styles.leaveButtonText}>Confirm Parking</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
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
    padding: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '90%',
    marginBottom: 20,
  },
  circleImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  modalSubtext: {
    fontSize: 16,
    color: 'gray',
  },
  minButton: {
    marginTop: 20,
    backgroundColor: '#777',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  leaveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

