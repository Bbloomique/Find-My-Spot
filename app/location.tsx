import React, { useState, useEffect, useRef } from "react";
  import { Text, View, StyleSheet, ImageBackground, TouchableOpacity, Alert, Dimensions, Animated } from "react-native";
  import { StatusBar } from "expo-status-bar";
  import { WebView } from "react-native-webview";
  import { MaterialCommunityIcons } from '@expo/vector-icons';
  import { getDatabase, ref, set, get, push } from 'firebase/database';
  import { app } from '../app/firebaseConfig';
  import { getAuth } from 'firebase/auth';
  import { update } from 'firebase/database';

  interface ParkingStatusType {
    parked_cars: number;
    available_spaces: number;
    reserved_spots: number;
    last_reserved_user?: string;
    last_reserved_user_name?: string;
    last_reserved_user_email?: string;
    last_reserved_user_plateNumber?: string;
    }

  export default function Location() {
    const { width } = Dimensions.get("window");
    const screenWidth = width - 30;
    const height = (screenWidth * 9) / 16;
    const db = getDatabase(app);
    const usersRef = ref(db, "parkingStatus/main");
    const usersRef2 = ref(db, "parkingStatus/updated");
  
    const [parkingStatus, setParkingStatus] = useState<ParkingStatusType>({
      parked_cars: 0,
      available_spaces: 0,
      reserved_spots: 0
    });

    const [parkingStatusUpdate, setParkingStatusUpdate] = useState<ParkingStatusType>({
      parked_cars: 0,
      available_spaces: 0,
      reserved_spots: 0
    });

    const [isReserved, setIsReserved] = useState(false);

    const scaleAnim = useState(new Animated.Value(1))[0];
    const rotateAnim = useState(new Animated.Value(0))[0];
    const translateAnim = useState(new Animated.Value(0))[0];
    const opacityAnim = useState(new Animated.Value(0))[0];
    const boxAnim = useState(new Animated.Value(0))[0];


    const STABLE_DURATION = 8000;
    const lastDetectionRef = useRef<ParkingStatusType | null>(null);
    const lastChangeTimeRef = useRef<number>(Date.now());
    const stabilityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
      const fetchParkingStatus = async () => {
        try {
          const response = await fetch("https://headphones-resource-est-aerial.trycloudflare.com/parking_status");
          const data: ParkingStatusType = await response.json();

          const currentDetection: ParkingStatusType = {
            parked_cars: data.parked_cars,
            available_spaces: data.available_spaces,
            reserved_spots: data.reserved_spots,
          };

          const lastDetection = lastDetectionRef.current;

          const hasChanged =
            !lastDetection ||
            currentDetection.parked_cars !== lastDetection.parked_cars ||
            currentDetection.available_spaces !== lastDetection.available_spaces ||
            currentDetection.reserved_spots !== lastDetection.reserved_spots;

          if (hasChanged) {
            lastDetectionRef.current = currentDetection;
            lastChangeTimeRef.current = Date.now();

            if (stabilityTimeoutRef.current) {
              clearTimeout(stabilityTimeoutRef.current);
              stabilityTimeoutRef.current = null;
            }
          } else {
            const timeStable = Date.now() - lastChangeTimeRef.current;

            if (timeStable >= STABLE_DURATION && !stabilityTimeoutRef.current) {
              console.log("Detection stable for 8 seconds. Uploading to Firebase...");

              try {
                await set(usersRef, currentDetection);
                await set(usersRef2, currentDetection);
              } catch (error) {
                console.error("Error writing to Firebase:", error);
              }

              stabilityTimeoutRef.current = setTimeout(() => {
                stabilityTimeoutRef.current = null;
              }, STABLE_DURATION);
            }
          }

          setParkingStatus(data);

        } catch (error) {
          console.error("Error fetching parking status:", error);
        }
      };

      const fetchParkingStatusUpdate = async () => {
        try {
          const snapshot = await get(usersRef2);
          if (snapshot.exists()) {
            const data = snapshot.val() as ParkingStatusType;
            setParkingStatusUpdate(data);

            const auth = getAuth();
            const user = auth.currentUser;
            setIsReserved(!!user && data.last_reserved_user === user.uid);
          } else {
            setParkingStatusUpdate({
              parked_cars: 0,
              available_spaces: 0,
              reserved_spots: 0,
            });
            setIsReserved(false);
          }
        } catch (error) {
          console.error("Error fetching Firebase status update:", error);
        }
      };

      const interval = setInterval(() => {
        fetchParkingStatus();
        fetchParkingStatusUpdate();
      }, 1000);

      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();

      Animated.spring(boxAnim, {
        toValue: 1,
        friction: 4,
        tension: 80,
        useNativeDriver: true,
      }).start();

      return () => {
        clearInterval(interval);
        if (stabilityTimeoutRef.current) {
          clearTimeout(stabilityTimeoutRef.current);
        }
      };
    }, []);

    const getAvailableData = async () => {
      try {
        const snapshot = await get(usersRef2);
        let firebaseData: ParkingStatusType = {
          parked_cars: 0,
          available_spaces: 0,
          reserved_spots: 0,
        };

        if (snapshot.exists()) {
          firebaseData = snapshot.val();
        }

        const auth = getAuth();
        const user = auth.currentUser;
        const userId = user?.uid;

        const isSameUser = userId && firebaseData.last_reserved_user === userId;

        const updatedStatus: ParkingStatusType = {
          parked_cars: parkingStatus.parked_cars,
          available_spaces: isSameUser
            ? firebaseData.available_spaces 
            : parkingStatus.available_spaces,
          reserved_spots: firebaseData.reserved_spots,
          last_reserved_user: firebaseData.last_reserved_user ?? "",
          last_reserved_user_name: firebaseData.last_reserved_user_name ?? "",
          last_reserved_user_email: firebaseData.last_reserved_user_email ?? "",
          last_reserved_user_plateNumber: firebaseData.last_reserved_user_plateNumber ?? "",
        };

        await set(usersRef, updatedStatus);
        await set(usersRef2, updatedStatus);

        setParkingStatusUpdate(updatedStatus);

        setIsReserved(userId === updatedStatus.last_reserved_user);

      } catch (error) {
        console.error("Error updating data: ", error);
      }
    };

    const handleReserve = async () => {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 15,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(translateAnim, {
          toValue: -5,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(translateAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      try {
        const snapshot = await get(usersRef2);
        if (!snapshot.exists()) return;

        const currentData = snapshot.val() as ParkingStatusType;
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          Alert.alert("Error", "You need to log in before reserving a spot.");
          return;
        }

        const userId = user.uid;
        const userDetailsRef = ref(db, `users/${userId}`);
        const userDetailsSnap = await get(userDetailsRef);

        if (!userDetailsSnap.exists()) {
          Alert.alert("Error", "User info not found. Please complete registration.");
          return;
        }

        const userData = userDetailsSnap.val();

        if (currentData.available_spaces > 0) {
          const updatedStatus = {
            ...currentData,
            available_spaces: currentData.available_spaces - 1,
            reserved_spots: (currentData.reserved_spots ?? 0) + 1,
            last_reserved_user: userId,
            last_reserved_user_name: userData.fullName || "",
            last_reserved_user_email: userData.email || "",
            last_reserved_user_plateNumber: userData.plateNumber || "",
          };

          await set(usersRef, updatedStatus);
          await set(usersRef2, updatedStatus);

          setParkingStatusUpdate(updatedStatus);
          setIsReserved(true);

          // Add notification logic here
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
          const db = getDatabase();
          const notificationsRef = ref(db, `notifications/${user.uid}`);
          const newNotificationRef = push(notificationsRef);
          await update(newNotificationRef, {
            title: "Parking Spot Reserved",
            message: "You have successfully reserved a parking spot.",
            reservedtime: new Date().toLocaleTimeString("en-PH", { timeZone: "Asia/Manila" }),
            date: new Date().toLocaleDateString("en-PH", { timeZone: "Asia/Manila" }),
          });
        }
        // End notification logic

          console.log("Spot reserved successfully.");
        } else {
          Alert.alert("No available spaces to reserve!");
        }

      } catch (error) {
        console.error("Error during reservation:", error);
      }
    };

    const handleCancelReservation = async () => {
      try {
        const snapshot = await get(usersRef2);
        if (!snapshot.exists()) return;

        const currentData = snapshot.val() as ParkingStatusType;
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          Alert.alert("Error", "You need to log in first.");
          return;
        }

        const userId = user.uid;

        // Only cancel if the current reserved user is this user
        if (currentData.last_reserved_user !== userId) {
          Alert.alert("Error", "You do not have an active reservation to cancel.");
          return;
        }

        const updatedStatus: ParkingStatusType = {
          ...currentData,
          available_spaces: currentData.available_spaces + 1,
          reserved_spots: Math.max((currentData.reserved_spots ?? 1) - 1, 0),
          last_reserved_user: "",
          last_reserved_user_name: "",
          last_reserved_user_email: "",
          last_reserved_user_plateNumber: "",
        };

        await set(usersRef, updatedStatus);
        await set(usersRef2, updatedStatus);

        setParkingStatusUpdate(updatedStatus);
        setIsReserved(false);

        console.log("Reservation cancelled successfully.");
      } catch (error) {
        console.error("Error cancelling reservation:", error);
      }
    };

  return (
    <ImageBackground source={require("../assets/images/gradientBG.png")} style={styles.background}>
      <StatusBar style="light" />

      {/* Header Section */}
      <View style={styles.header}>
        <MaterialCommunityIcons name="car" size={30} color="#fff" style={styles.headerIcon} />
        <Text style={styles.headerTitle}>Find and Reserve Your Spot</Text>
      </View>

      {/* Video Feed */}
      <View style={styles.mapContainer}>
        <View style={[styles.mapPlaceholder, { width: screenWidth, height }]}>
          <WebView
            originWhitelist={['*']}
            source={{ uri: "https://headphones-resource-est-aerial.trycloudflare.com/video_feed" }}
            style={styles.cameraFeed}
          />
        </View>
      </View>

      {/* Status Boxes */}
      <Animated.View
        style={[styles.statusContainer, { opacity: opacityAnim, transform: [{ scale: boxAnim }] }]}>
        <Animated.View style={[styles.statusBox, { backgroundColor: "#1976D2" }]}>
          <Text style={styles.statusBoxText}>Parked Cars</Text>
          <Text style={styles.statusBoxCount}>{parkingStatusUpdate.parked_cars ?? 0}</Text>
        </Animated.View>
        <Animated.View style={[styles.statusBox, { backgroundColor: "#388E3C" }]}>
          <Text style={styles.statusBoxText}>Available Spaces</Text>
          <Text style={styles.statusBoxCount}>{parkingStatusUpdate.available_spaces ?? 0}</Text>
        </Animated.View>
        <Animated.View style={[styles.statusBox, { backgroundColor: "#c24c46" }]}>
          <Text style={styles.statusBoxText}>Reserved Spots</Text>
          <Text style={styles.statusBoxCount}>{parkingStatusUpdate.reserved_spots ?? 0}</Text>
        </Animated.View>
      </Animated.View>

      {/* Buttons */}
      <Animated.View
        style={{
          transform: [
            { scale: scaleAnim },
            { rotateY: rotateAnim.interpolate({ inputRange: [0, 15], outputRange: ["0deg", "15deg"] }) },
            { translateY: translateAnim },
          ],
        }}
      >
        <TouchableOpacity onPress={getAvailableData} style={[styles.reserveButton, { backgroundColor: "#D32F2F" }]}>
          <Text style={styles.reserveButtonText}>{"Refresh"}</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View
        style={{
          transform: [
            { scale: scaleAnim },
            { rotateY: rotateAnim.interpolate({ inputRange: [0, 15], outputRange: ["0deg", "15deg"] }) },
            { translateY: translateAnim },
          ],
        }}
      >
        <TouchableOpacity
          onPress={isReserved ? handleCancelReservation : handleReserve}
          style={[styles.reserveButton, { backgroundColor: isReserved ? "#D32F2F" : "#388E3C" }]}
        >
          <Text style={styles.reserveButtonText}>
            {isReserved ? "Cancel Reservation" : "Reserve Spot"}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: "10%",
    paddingHorizontal: 20,
  },
  header: {
    width: "100%",
    paddingVertical: 15,
    backgroundColor: "#388E3C", 
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  headerIcon: {
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  mapContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 20,
    borderRadius: 15,
    overflow: "hidden",
    backgroundColor: "#00000090", 
  },
  mapPlaceholder: {
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  cameraFeed: {
    width: "100%",
    height: "100%",
    borderRadius: 15,
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 10,
    marginTop: 30,
  },
  statusBox: {
    width: "30%",
    borderRadius: 15,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    marginBottom: 20,
  },
  statusBoxText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  statusBoxCount: {
    fontSize: 40,
    color: "#fff",
    fontWeight: "700",
  },
  reserveButton: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
    marginTop: 20,
  },
  reserveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
});