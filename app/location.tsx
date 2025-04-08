import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, ImageBackground, TouchableOpacity, Image, Alert } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";

export default function Location() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
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

          // Generate time and date
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

          // Check last notification timestamp
          const notificationsRef = ref(db, `notifications/${user.uid}`);
          const notificationsSnapshot = await get(notificationsRef);

          if (notificationsSnapshot.exists()) {
            const notifications = notificationsSnapshot.val();
            const notificationKeys = Object.keys(notifications);
            if (notificationKeys.length > 0) {
              const latestNotificationKey = notificationKeys[notificationKeys.length - 1];
              const latestNotification = notifications[latestNotificationKey];

              if (!latestNotification.timeOut) {
                Alert.alert(
                  "Access Denied",
                  "You cannot book a new parking slot until you decide to leave your current spot.",
                  [{ text: "OK", onPress: () => router.replace('/dashboard') }]
                );
                return;
              }
            }
          }
        }
      }
    };

    fetchUserData();
  }, []);

  return (
    <ImageBackground source={require("../assets/images/gradientBG.png")} style={styles.background}>
      <StatusBar style="light" />
      <View style={styles.mapContainer}>
        <Image source={require("../assets/images/2.png")} style={styles.map} />
        <View style={styles.bottomContainer}>
          <View style={styles.slotsLeftContainer}>
            <Text style={styles.slotText}>{/*slotsLeft*/}</Text>
            <Text style={styles.statusText}>Slots Left</Text>
          </View>

          <TouchableOpacity onPress={() => router.push(`/parkconfirm`)} style={styles.reserveButton} >
            <Text style={styles.reserveButtonText}>Park Here</Text>
          </TouchableOpacity>

        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    alignItems: "center",
    paddingTop: "8%",
  },
  mapContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  map: {
    width: "90%",
    height: "85%",
    borderWidth: 1,
    borderColor: "white",
  },
  bottomContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
    marginTop: 90,
  },
  slotsLeftContainer: {
    marginBottom: 20,
    position: "absolute",
    bottom: 20,
    left: 20,
    alignItems: "center",
  },
  slotText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    top: 20,
  },
  statusText: {
    fontSize: 18,
    color: "white",
    top: 15,
  },
  reserveButton: {
    position: "absolute",
    bottom: 25,
    right: 20,
    backgroundColor: "#c3f0ec",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  reserveButtonText: {
    color: "#1f3c53",
    fontSize: 16,
    fontWeight: "bold",
  },
});

