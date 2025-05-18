import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, ImageBackground, TouchableOpacity, Alert, Dimensions, Animated } from "react-native";
import { StatusBar } from "expo-status-bar";
import { WebView } from "react-native-webview";
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function Location() {
  const { width } = Dimensions.get("window");
  const screenWidth = width - 30;
  const height = (screenWidth * 9) / 16;

  const [parkingStatus, setParkingStatus] = useState({
    parked_cars: 0,
    available_spaces: 0,
  });

  const [isReserved, setIsReserved] = useState(false); 

  const scaleAnim = useState(new Animated.Value(1))[0]; 
  const rotateAnim = useState(new Animated.Value(0))[0]; 
  const translateAnim = useState(new Animated.Value(0))[0]; 
  const opacityAnim = useState(new Animated.Value(0))[0]; 
  const boxAnim = useState(new Animated.Value(0))[0]; 

  useEffect(() => {
    const fetchParkingStatus = async () => {
      try {
        const response = await fetch("https://assuring-informed-horse.ngrok-free.app/parking_status");
        const data = await response.json();
        setParkingStatus(data);
      } catch (error) {
        console.error("Error fetching parking status:", error);
      }
    };

    const interval = setInterval(() => {
      fetchParkingStatus();
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

    return () => clearInterval(interval);
  }, []);

  const handleReserve = () => {
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

    if (!isReserved && parkingStatus.available_spaces > 0) {
      const updatedStatus = {
        ...parkingStatus,
        available_spaces: parkingStatus.available_spaces - 1,
      };
      setParkingStatus(updatedStatus);
      setIsReserved(true); 
    } else if (isReserved) {
      const updatedStatus = {
        ...parkingStatus,
        available_spaces: parkingStatus.available_spaces + 1,
      };
      setParkingStatus(updatedStatus);
      setIsReserved(false); 
    } else {
      Alert.alert("No available spaces to reserve!");
    }
  };

  return (
    <ImageBackground source={require("../assets/images/gradientBG.png")} style={styles.background}>
      <StatusBar style="light" />

      {/* Header Section Above the Video Feed */}
      <View style={styles.header}>
        <MaterialCommunityIcons name="car" size={30} color="#fff" style={styles.headerIcon} />
        <Text style={styles.headerTitle}>Find and Reserve Your Spot</Text>
      </View>

      <View style={styles.mapContainer}>
        {/* Video Feed with Gradient Overlay */}
        <View style={[styles.mapPlaceholder, { width: screenWidth, height }]}>
          <WebView
            originWhitelist={['*']}
            source={{ uri: "https://assuring-informed-horse.ngrok-free.app/video_feed" }}
            style={styles.cameraFeed}
          />
        </View>
      </View>

      {/* Animated Parked Cars and Available Spaces */}
      <Animated.View
        style={[styles.statusContainer, { opacity: opacityAnim, transform: [{ scale: boxAnim }] }]}>
        {/* Animated Parked Cars Box */}
        <Animated.View style={[styles.statusBox, { backgroundColor: "#1976D2" }]}>
          <Text style={styles.statusBoxText}>Parked Cars</Text>
          <Text style={styles.statusBoxCount}>{parkingStatus.parked_cars}</Text>
        </Animated.View>

        {/* Animated Available Spaces Box */}
        <Animated.View style={[styles.statusBox, { backgroundColor: "#388E3C" }]}>
          <Text style={styles.statusBoxText}>Available Spaces</Text>
          <Text style={styles.statusBoxCount}>{parkingStatus.available_spaces}</Text>
        </Animated.View>
      </Animated.View>

      {/* Reserve Button */}
      <Animated.View
        style={{
          transform: [
            { scale: scaleAnim },
            { rotateY: rotateAnim.interpolate({ inputRange: [0, 15], outputRange: ["0deg", "15deg"] }) },
            { translateY: translateAnim },
          ],
        }}
      >
        <TouchableOpacity onPress={handleReserve} style={[styles.reserveButton, { backgroundColor: isReserved ? "#D32F2F" : "#388E3C" }]}>
          <Text style={styles.reserveButtonText}>{isReserved ? "Cancel Reservation" : "Reserve Spot"}</Text>
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
    paddingHorizontal: 20,
    marginTop: 30,
  },
  statusBox: {
    width: "45%",
    borderRadius: 15,
    padding: 20,
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
    fontSize: 20,
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
    marginTop: 30,
  },
  reserveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
});