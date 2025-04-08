import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, StatusBar, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { getDatabase, ref, get, remove } from 'firebase/database';
import { getAuth } from 'firebase/auth';

export default function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [groupedNotifications, setGroupedNotifications] = useState({});

  // Fetch notifications from Firebase
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

          // Group notifications by date
          const grouped = formattedNotifications.reduce((acc, notification) => {
            const date = new Date(notification.timeIn).toDateString();
            if (!acc[date]) acc[date] = [];
            acc[date].push(notification);
            return acc;
          }, {});

          setGroupedNotifications(grouped);
          setNotifications(formattedNotifications);
        }
      }
    };

    fetchNotifications();
  }, []);

  // Delete all notifications with timeOut
  const handleClearAll = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const db = getDatabase();
      const notificationsRef = ref(db, `notifications/${user.uid}`);
      const snapshot = await get(notificationsRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const notificationsWithTimeOut = Object.keys(data).filter(
          (key) => data[key].timeOut
        );

        // Remove only notifications with timeOut
        for (const id of notificationsWithTimeOut) {
          const notificationRef = ref(db, `notifications/${user.uid}/${id}`);
          await remove(notificationRef);
        }

        // Update local state
        setNotifications((prevNotifications) =>
          prevNotifications.filter((notification) => !notification.timeOut)
        );
      }
    }
  };

  const confirmClearAll = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: handleClearAll },
      ]
    );
  };

  // Show delete confirmation for individual notification
  const confirmDeleteNotification = (id, timeOut) => {
    if (!timeOut) {
      Alert.alert('Cannot Delete', 'This notification cannot be deleted.');
      return;
    }

    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => handleDeleteNotification(id) },
      ]
    );
  };

  // Delete individual notification with timeOut
  const handleDeleteNotification = async (id) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const db = getDatabase();
      const notificationRef = ref(db, `notifications/${user.uid}/${id}`);
      await remove(notificationRef); // Remove from Firebase

      // Update local state
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification.id !== id)
      );
    }
  };

  return (
    <ImageBackground source={require('../assets/images/gradientBG.png')} style={styles.background}>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        {Object.keys(groupedNotifications).length > 0 ? (
          <ScrollView style={styles.scrollContainer}>
            {Object.keys(groupedNotifications).map((date) => (
              <View key={date}>
                {groupedNotifications[date].map((notification) => (
                  <TouchableOpacity
                    key={notification.id}
                    onLongPress={() => confirmDeleteNotification(notification.id, notification.timeOut)}
                    style={styles.notificationContainer}>
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                    <Text style={styles.notificationTime}>{notification.date}</Text>
                    <Text style={styles.notificationTime}>{notification.timeIn}</Text>
                    <Text style={styles.notificationMessage}>{notification.message}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}

            {notifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                onLongPress={() => confirmDeleteNotification(notification.id, notification.timeOut)}
                style={styles.notificationContainer}>
                <Text style={styles.notificationTitle}>{notification.title2}</Text>
                <Text style={styles.notificationTime}>{notification.dateOut}</Text>
                <Text style={styles.notificationTime}>{notification.timeOut}</Text>
                <Text style={styles.notificationMessage}>{notification.message2}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.noNotificationsText}>No notifications</Text>
        )}
        <View style={styles.clearButtonContainer}>
          <TouchableOpacity style={styles.clearButton} onPress={confirmClearAll}>
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { 
    flex: 1, 
    resizeMode: 'cover' 
  },
  container: { 
    flex: 1, 
    alignItems: 'center', 
    padding: 10,
    paddingTop: 15, 
  },
  dateText: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: 'white', 
    marginBottom: 15 
  },
  scrollContainer: { 
    flex: 1, 
    width: '95%',
    marginBottom: 65
  },
  notificationContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    width: '95%',
    alignSelf: 'center',
  },
  notificationTitle: { 
    fontSize: 16, 
    fontWeight: 'bold',
    marginBottom: 8 
  },
  notificationTime: { 
    fontSize: 10, 
    color: 'grey',
  },
  notificationMessage: { 
    fontSize: 14, 
    color: 'grey' 
  },
  clearButtonContainer: { 
    position: 'absolute', 
    bottom: 10, 
    width: '100%', 
    alignItems: 'flex-end', 
    padding: 10 
  },
  clearButton: { 
    backgroundColor: '#c3f0ec', 
    padding: 10, 
    borderRadius: 10 
  },
  clearButtonText: { 
    color: '#1f3c53', 
    fontWeight: 'bold' 
  },
  noNotificationsText: { 
    fontSize: 18, 
    color: 'white', 
    textAlign: 'center', 
    marginTop: 20 
  },
});
