import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, StatusBar, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getDatabase, ref, get, set, update } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { useRouter, useLocalSearchParams } from "expo-router";
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

export default function Dashboard() {
  const router = useRouter();
  const { showModal, timeIn, slotNo } = useLocalSearchParams();
  const [selectedTab, setSelectedTab] = useState("null");
  const [userData, setUserData] = useState(null);
  const [parkingData, setParkingData] = useState({ timeIn: '--', slotNo: '--' });
  const [isParked, setIsParked] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [location, setLocation] = useState(null);
  
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

    const fetchParkingData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;
    
      const db = getDatabase();
      const parkingRef = ref(db, `notifications/${user.uid}`);
      const snapshot = await get(parkingRef);
    
      if (snapshot.exists()) {
        const parkingInfo = snapshot.val();
        const notificationKeys = Object.keys(parkingInfo);
        const latestNotificationKey = notificationKeys[notificationKeys.length - 1];
        const latestNotification = parkingInfo[latestNotificationKey];
    
        const today = new Date().toDateString(); // Format: "Mar 23, 2025"
    
        if (!latestNotification.timeOut) {
          setParkingData({
            timeIn: latestNotification.timeIn || '--',
            slotNo: latestNotification.slotNo || '--'
          });
          setIsParked(true);
        } else if (latestNotification.date === today) {
          setParkingData({
            timeIn: latestNotification.timeIn || '--',
            slotNo: latestNotification.slotNo || '--'
          });
          setIsParked(true);
        }
      }
    };    

    fetchUserData();
    fetchParkingData();
  }, []);

  useEffect(() => {
    if (showModal === "true") {
      setParkingData({
        timeIn: timeIn,
        slotNo: slotNo,
      });
      setIsParked(true); // User has confirmed parking
    } else if (showModal === "false") {
      setParkingData({
        timeIn: '--',
        slotNo: '--'
      });
      setIsParked(false); // User has left parking
    }
  }, [showModal, timeIn, slotNo]);

  useEffect(() => {
    const fetchLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: 14.6089,
        longitude: 121.0535,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    };

    fetchLocation();
  }, []);

  const handleNavigation = (tab) => {
    setSelectedTab(tab);
    if (tab === "Help") router.push('/help');
    if (tab === "Location") router.push('/location');
    if (tab === "Notification") router.push('/notification');
    if (tab === "Profile") router.push('/userprofile');
  };

  const handleLeave = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
  
    if (!user) return; // Ensure the user is authenticated
  
    const db = getDatabase();
    const userRef = ref(db, `notifications/${user.uid}`);
  
    // Fetch the latest notification key
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      const notifications = snapshot.val();
      const notificationKeys = Object.keys(notifications);
      const latestNotificationKey = notificationKeys[notificationKeys.length - 1];
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
  
      if (latestNotificationKey) {
        const latestNotificationRef = ref(db, `notifications/${user.uid}/${latestNotificationKey}`);
  
        const timeOut = newTime;
        const dateOut = newDate;
  
        await update(latestNotificationRef, { timeOut, dateOut });
  
        router.push('/parkreceipt');
      }
    }
  };    

  return (
    <ImageBackground source={require('../assets/images/gradientBG.png')} style={styles.background}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />

  {/* User Info */}
        <View style={styles.userInfo}>
          <Image
            source={userData?.profileImage ? { uri: userData.profileImage } : require('../assets/images/defaultPFP.jpg')}
            style={styles.userImage}
          />
          <View style={styles.userTextContainer}>
            <Text style={styles.teamText}>WELCOME BACK!</Text>
            <Text style={styles.roleText}>{userData?.fullName}</Text>
          </View>
        </View>

        <View style={styles.QTextContainer}>
          <Text style={styles.QText}>Do you need a parking space for your car?</Text>
        </View>

  {/* Map Section */}
        <View style={styles.mapContainer}>
          {location ? (
            <MapView
              style={styles.map}
              initialRegion={location}
              showsUserLocation={true}
              followsUserLocation={true}
            >
              <Marker coordinate={location} />
            </MapView>
          ) : (
            <Text style={styles.loadingText}>Loading map...</Text>
          )}
        </View>

  {/* Parking Locations */}
        <View style={styles.parkingLocationContainer}>
          <View style={styles.parkingDetailsRow}>
            <Icon name="local-parking" style={styles.icon2} />
            <View style={styles.detailsTextContainer}>
              <Text style={styles.detailsText}>{userData?.plateNumber}</Text>
              <Text style={styles.detailsText}>{userData?.vehicleType}</Text>
            </View>
          </View>

  {/* Time Parked, Slot No. Row */}
          <View style={styles.infoRow}>
            <View style={styles.infoColumn}>
              <Text style={styles.infoLabel}>Time In:</Text>
              <Text style={styles.infoValue}>{parkingData.timeIn}</Text>
            </View>

            <View style={styles.infoColumn}>
              <Text style={styles.infoLabel}>Slot No.:</Text>
              <Text style={styles.infoValue}>{parkingData.slotNo}</Text>
            </View>
          </View>

  {/* "Leave Parking" Button */}
           {isParked && (
             <TouchableOpacity style={styles.moreButton} onPress={handleLeave}>
               <Text style={styles.moreText}>Leave Parking</Text>
             </TouchableOpacity>
           )}
        </View>

  {/* Bottom Navigation Tabs */}
        <View style={styles.tabContainer}>

          <TouchableOpacity style={[styles.button, selectedTab === "Location" && styles.activeButton]} onPress={() => handleNavigation("Location")}>
            <Icon name="location-on" style={selectedTab === "Location" ? styles.activeTabIcon : styles.tabIcon} />
            <Text style={selectedTab === "Location" ? styles.activeTabText : styles.tabText}>Location</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, selectedTab === "Notification" && styles.activeButton]} onPress={() => handleNavigation("Notification")}>
            <Icon name="notifications" style={selectedTab === "Notification" ? styles.activeTabIcon : styles.tabIcon} />
            <Text style={selectedTab === "Notification" ? styles.activeTabText : styles.tabText}>Notification</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, selectedTab === "Help" && styles.activeButton]} onPress={() => handleNavigation("Help")}>
            <Icon name="help" style={selectedTab === "Help" ? styles.activeTabIcon : styles.tabIcon} />
            <Text style={selectedTab === "Help" ? styles.activeTabText : styles.tabText}>Help</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, selectedTab === "Profile" && styles.activeButton]} onPress={() => handleNavigation("Profile")}>
            <Icon name="person" style={selectedTab === "Profile" ? styles.activeTabIcon : styles.tabIcon} />
            <Text style={selectedTab === "Profile" ? styles.activeTabText : styles.tabText}>Profile</Text>
          </TouchableOpacity>
        </View>
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
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 10,
  },
  userImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'white',
  },
  userTextContainer: {
    marginLeft: 10,
  },
  teamText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  roleText: {
    fontSize: 14,
    color: 'white',
  },
  QTextContainer: {
    marginTop: 10,
  },
  QText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  mapContainer: {
    width: '100%',
    height: '35%',
    marginVertical: '3%',
    borderWidth: 1,
    borderColor: '#c3f0ec',
    borderRadius: 10,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    color: 'white',
    fontSize: 16,
  },
  parkingLocationContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: '3%',
    alignItems: 'center',
    marginTop: 5,
  },
  parkingDetailsRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 10,
  },
  icon2: {
    fontSize: 32,
    color: "black",
    marginRight: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderRadius: 20,
  },
  detailsTextContainer: {
    flex: 1, // Ensures text stays to the right
  },
  detailsText: {
    fontSize: 16,
    color: 'black',
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "70%",
    paddingHorizontal: 0,
    marginVertical: 15,
  },
  infoColumn: {
    alignItems: "center",
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: "gray",
    fontWeight: "bold",
  },
  infoValue: {
    fontSize: 16,
    color: "black",
    fontWeight: "bold",
    marginTop: 2, // Small spacing between label and value
  },
  moreButton: {
    width: '80%', // Center the button
    backgroundColor: '#c3f0ec',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  moreText: {
    color: '#1b2c46',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#1b2c46",
    width: '100%',
    borderRadius: 30,
    justifyContent: 'space-around',
    paddingVertical: 10,
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 50,
    shadowOffset: { width: 2, height: 5 },
    shadowRadius: 5,
  },
  button: {
    flexDirection: "column",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 23,
  },
  activeButton: {
    backgroundColor: "#c3f0ec",
  },
  tabIcon: {
    marginTop: 3,
    color: "gray",
    fontSize: 14,
  },
  tabText: {
    color: "gray",
    fontSize: 12,
  },
  activeTabText: {
    color: "#1f3c53",
    fontWeight: "bold",
    fontSize: 14,
  },
  activeTabIcon: {
    color: "#1f3c53",
    fontWeight: "bold",
    fontSize: 16,
  },
});