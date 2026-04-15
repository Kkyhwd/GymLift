// utils/firebaseConfig.js
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyALBmUgyrAx7ENfLKRbhhNjUvI1JWkYPyY",
  authDomain: "gymliftv2.firebaseapp.com",
  projectId: "gymliftv2",
  storageBucket: "gymliftv2.firebasestorage.app",
  messagingSenderId: "140311157981",
  appId: "1:140311157981:web:8963756cdee3cbdcf34f34",
  measurementId: "G-1KWC0P1Y52",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with React Native persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
