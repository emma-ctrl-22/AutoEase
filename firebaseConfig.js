import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getStorage } from 'firebase/storage'; // Import getStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBy5CESSX2lL5RWcB4m1gALso0Un-X0b6c",
  authDomain: "autoease-7b15b.firebaseapp.com",
  projectId: "autoease-7b15b",
  storageBucket: "autoease-7b15b.appspot.com",
  messagingSenderId: "387729360481",
  appId: "1:387729360481:web:87a14162e6a99a19decc20",
  measurementId: "G-HQ20HNKCNJ",
};

let app;
let auth;
let db;
let storage; // Declare storage

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} else {
  app = getApp();
  auth = getAuth(app);
}

db = getFirestore(app);
storage = getStorage(app); // Initialize storage

export { auth, db, storage }; // Export storage along with auth and db
