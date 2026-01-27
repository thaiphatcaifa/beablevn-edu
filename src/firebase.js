// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

// Cấu hình Firebase của bạn
const firebaseConfig = {
  apiKey: "AIzaSyDib-AzfVlINhKd-EiiFhZq1PQwPCMMrBw",
  authDomain: "bavn-learning.firebaseapp.com",
  databaseURL: "https://bavn-learning-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "bavn-learning",
  storageBucket: "bavn-learning.firebasestorage.app",
  messagingSenderId: "929043730121",
  appId: "1:929043730121:web:3f95e39b6bfe93d2f2c718",
  measurementId: "G-8TL2GYB1L8"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Khởi tạo các dịch vụ
const analytics = getAnalytics(app);
export const db = getDatabase(app);
export const auth = getAuth(app);

export default app;