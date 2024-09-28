// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBZlmhgpkXkQMONIvM1cyQEaC4wEj-Db7g",
  authDomain: "my-app-67cd4.firebaseapp.com",
  projectId: "my-app-67cd4",
  storageBucket: "my-app-67cd4.appspot.com",
  messagingSenderId: "731899602960",
  appId: "1:731899602960:web:d06424049720d262268295",
  measurementId: "G-6YZDW37X9D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export const db = getFirestore(app);