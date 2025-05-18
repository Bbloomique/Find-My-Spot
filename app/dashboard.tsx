import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, StatusBar, Image, Dimensions, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getDatabase, ref, get } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { useRouter } from 'expo-router';
//import MapView, { Marker, Polyline } from 'react-native-maps';
import Mapbox from '@rnmapbox/maps';

Mapbox.setAccessToken('pk.eyJ1IjoicWFtYXBhY2lub3MiLCJhIjoiY205OHE1Y2tuMDVvbzJpcHpxYnQ1a28zMyJ9.EffmbXNI5HuQPcL2HVSI9g');

export default function Dashboard() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState("Home");
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const snapshot = await get(ref(getDatabase(), `users/${user.uid}`));
        if (snapshot.exists()) setUserData(snapshot.val());
      }
    };
    fetchUserData();
  }, []);

  const handleNavigation = (tab: string) => {
    setSelectedTab(tab);
    router.push({
      Home: '/dashboard',
      Location: '/location',
      Notification: '/notification',
      Profile: '/userprofile',
    }[tab]);
  };

  const navigateToGate = (gateId: string) => {
    try {
      router.push(`/navigation?gate=${gateId}`);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  // Gate coordinates
  const gate1Loc = { latitude: 14.609507771555753, longitude: 121.0558149907478 };
  const gate1Dest = { latitude: 14.60916054916132, longitude: 121.05328308456238 };
  const gate2Loc = { latitude: 14.607290055189193, longitude: 121.05651809732714 };
  const gate2Dest = { latitude: 14.609127565545906, longitude: 121.05347508641327 };

  const calcRegion = (a: any, b: any) => {
    const lats = [a.latitude, b.latitude], lons = [a.longitude, b.longitude];
    const minLat = Math.min(...lats), maxLat = Math.max(...lats);
    const minLon = Math.min(...lons), maxLon = Math.max(...lons);
    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLon + maxLon) / 2,
      latitudeDelta: maxLat - minLat + 0.005,
      longitudeDelta: maxLon - minLon + 0.005,
    };
  }; 

  // Fancy button component without Expo LinearGradient
  const FancyButton = ({ gateId, colors }: { gateId: string; colors: string[] }) => {
    const scale = useRef(new Animated.Value(1)).current;
    const onPressIn = () => Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start();
    const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

    return (
      <Animated.View style={[styles.buttonWrapper, { transform: [{ scale }] }]}>  
        <TouchableOpacity
          style={[styles.navigateButton, { backgroundColor: colors[0] }]}
          onPress={() => navigateToGate(gateId)}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          activeOpacity={0.8}
        >
          <Icon name="directions" size={20} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.navigateText}>Navigate</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const { width } = Dimensions.get('window');

  return (
    <ImageBackground source={require('../assets/images/gradientBG.png')} style={styles.background}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>

        {/* User Info Header */}
        <View style={styles.userInfo}>
          <Image
            source={
              userData?.profileImage
                ? { uri: userData.profileImage }
                : require('../assets/images/defaultPFP.jpg')
            }
            style={styles.userImage}
          />
          <View style={styles.userTextContainer}>
            <Text style={styles.teamText}>WELCOME BACK!</Text>
            <Text style={styles.roleText}>{userData?.fullName}</Text>
          </View>
        </View>

        {/* Prompt */}
        <Text style={styles.QText}>Do you need a parking space for your car?</Text>

         {/* Maps */}
        <View style={styles.mapsContainer}>

          {/* Gate 1 */}
          <View style={styles.mapContainer}>
            <View style={styles.mapLabelContainer}>
              <Text style={styles.mapLabel}>Gate 1</Text>
            </View>
            <Mapbox.MapView style={styles.map}>
              <Mapbox.Camera
                zoomLevel={15}
                centerCoordinate={[gate1Loc.longitude, gate1Loc.latitude]}
              />
              <Mapbox.PointAnnotation
                id="gate1Start"
                coordinate={[gate1Loc.longitude, gate1Loc.latitude]}
                title="Gate 1 Start"
              />
              <Mapbox.PointAnnotation
                id="gate1End"
                coordinate={[gate1Dest.longitude, gate1Dest.latitude]}
                title="Gate 1 End"
              />
              <Mapbox.LineLayer
                id="gate1Line"
                style={{
                  lineColor: '#4285F4',
                  lineWidth: 3,
                }}
                geometry={{
                  type: 'LineString',
                  coordinates: [
                    [gate1Loc.longitude, gate1Loc.latitude],
                    [gate1Dest.longitude, gate1Dest.latitude],
                  ],
                }}
              />
            </Mapbox.MapView>
            <FancyButton gateId="1" colors={['#00c6ff', '#0072ff']} />
          </View>

          {/* Space between maps */}
          <View style={styles.spaceBetweenMaps} />

          {/* Gate 2 */}
          <View style={styles.mapContainer}>
            <View style={styles.mapLabelContainer}>
              <Text style={styles.mapLabel}>Gate 2</Text>
            </View>
            <Mapbox.MapView style={styles.map}>
              <Mapbox.Camera
                zoomLevel={15}
                centerCoordinate={[gate2Loc.longitude, gate2Loc.latitude]}
              />
              <Mapbox.PointAnnotation
                id="gate2Start"
                coordinate={[gate2Loc.longitude, gate2Loc.latitude]}
                title="Gate 2 Start"
              />
              <Mapbox.PointAnnotation
                id="gate2End"
                coordinate={[gate2Dest.longitude, gate2Dest.latitude]}
                title="Gate 2 End"
              />
              <Mapbox.LineLayer
                id="gate2Line"
                style={{
                  lineColor: '#4285F4',
                  lineWidth: 3,
                }}
                geometry={{
                  type: 'LineString',
                  coordinates: [
                    [gate2Loc.longitude, gate2Loc.latitude],
                    [gate2Dest.longitude, gate2Dest.latitude],
                  ],
                }}
              />
            </Mapbox.MapView>
            <FancyButton gateId="2" colors={['#00c6ff', '#0072ff']} />
          </View>

        </View>

        {/* Bottom Navigation */}
        <View style={styles.tabContainer}>
          {['Home', 'Location', 'Notification', 'Profile'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.button, selectedTab === tab && styles.activeButton]}
              onPress={() => handleNavigation(tab)}
            >
              <Icon
                name={{ Home: 'home', Location: 'location-on', Notification: 'notifications', Profile: 'person' }[tab]}
                style={selectedTab === tab ? styles.activeTabIcon : styles.tabIcon}
              />
              <Text style={selectedTab === tab ? styles.activeTabText : styles.tabText}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, resizeMode: 'cover' },
  container: { flex: 1, padding: 20 },
  userInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 50, marginBottom: 10 },
  userImage: { width: 70, height: 70, borderRadius: 35, borderWidth: 2, borderColor: 'white' },
  userTextContainer: { marginLeft: 15 },
  teamText: { fontSize: 20, fontWeight: 'bold', color: 'white' },
  roleText: { fontSize: 16, color: 'white' },
  QText: { fontSize: 24, fontWeight: 'bold', color: 'white', marginTop: 15 },
  mapsContainer: { flex: 1, marginTop: 20 },
  mapContainer: {
    width: '100%',
    height: Dimensions.get('window').width * 0.53,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#c3f0ec',
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  map: { flex: 1 },
  mapLabelContainer: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    zIndex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 25,
    marginHorizontal: 20,
  },
  spaceBetweenMaps: { height: 20 },
  mapLabel: { fontSize: 22, fontWeight: 'bold', color: 'white', letterSpacing: 1.2 },
  buttonWrapper: { position: 'absolute', bottom: 10, right: 10 },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
  },
  buttonIcon: { marginRight: 6 },
  navigateText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1b2c46',
    width: '100%',
    borderRadius: 30,
    justifyContent: 'space-around',
    paddingVertical: 12,
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowOffset: { width: 2, height: 5 },
    shadowRadius: 5,
  },
  button: { alignItems: 'center', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 23 },
  activeButton: { backgroundColor: '#c3f0ec' },
  tabIcon: { marginTop: 3, color: 'gray', fontSize: 14 },
  tabText: { color: 'gray', fontSize: 12 },
  activeTabIcon: { color: '#1f3c53', fontSize: 16 },
  activeTabText: { color: '#1f3c53', fontWeight: 'bold', fontSize: 14 },
});
