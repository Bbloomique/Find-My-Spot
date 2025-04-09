import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: '',
  authDomain: 'findmyspot-ecac4.firebaseapp.com',
  databaseURL: "https://findmyspot-ecac4-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: 'findmyspot-ecac4',
  storageBucket: 'findmyspot-ecac4.appspot.com',
  messagingSenderId: '130702745328',
  appId: '1:130702745328:web:4c6799192e558b4ed1ac35',
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const database = getDatabase(app);
