// utils/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyALBmUgyrAx7ENfLKRbhhNjUvI1JWkYPyY",
  authDomain: "gymliftv2.firebaseapp.com",
  projectId: "gymliftv2",
  storageBucket: "gymliftv2.firebasestorage.app",
  messagingSenderId: "140311157981",
  appId: "1:140311157981:web:8963756cdee3cbdcf34f34",
  measurementId: "G-1KWC0P1Y52",
};

const app = initializeApp(firebaseConfig);
// Use default web persistence. Works for Expo web, mobile, and Vercel.
const auth: Auth = getAuth(app);

export { auth };
