import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

// --- CẤU HÌNH ---
export const firebaseConfig = {
  apiKey: "AIzaSyDib-AzfVlINhKd-EiiFhZq1PQwPCMMrBw",
  authDomain: "beablevn-learning.firebaseapp.com",
  
  // ⚠️ QUAN TRỌNG: Link này lấy chính xác từ ảnh bạn gửi
  databaseURL: "https://beablevn-learning-default-rtdb.asia-southeast1.firebasedatabase.app",
  
  projectId: "beablevn-learning",
  storageBucket: "beablevn-learning.firebasestorage.app",
  messagingSenderId: "929043730121",
  appId: "1:929043730121:web:3f95e39b6bfe93d2f2c718",
  measurementId: "G-8TL2GYB1L8"
};

// 1. Khởi tạo App
const app = initializeApp(firebaseConfig);

// 2. Khởi tạo Database (QUAN TRỌNG: Phải truyền URL vào đây vì server là Asia)
export const db = getDatabase(app, firebaseConfig.databaseURL);

// 3. Khởi tạo Auth
export const auth = getAuth(app);

export default app;