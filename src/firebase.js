import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

// Sử dụng biến môi trường từ Vite (import.meta.env)
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DB_URL, // Dòng này sẽ tự lấy URL mới từ file .env
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// 1. Khởi tạo App
const app = initializeApp(firebaseConfig);

// 2. Khởi tạo Database (QUAN TRỌNG: Phải truyền URL vào đây)
export const db = getDatabase(app, firebaseConfig.databaseURL);

// 3. Khởi tạo Auth
export const auth = getAuth(app);

export default app;