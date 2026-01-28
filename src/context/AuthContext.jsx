import React, { useContext, useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ref, get } from "firebase/database";

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("--- BẮT ĐẦU THEO DÕI AUTH (PHIÊN BẢN CHỐNG TREO) ---");
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("✅ 1. Auth OK:", user.email);
        const userRef = ref(db, `users/${user.uid}`);
        
        try {
          // --- KỸ THUẬT QUAN TRỌNG: TIMEOUT ---
          // Nếu Database không trả lời sau 3 giây -> Báo lỗi và đi tiếp, KHÔNG ĐƯỢC TREO
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Hết thời gian chờ Database (3s)")), 3000)
          );

          // Chạy đua: Lấy dữ liệu VS Đồng hồ đếm ngược
          const snapshot = await Promise.race([get(userRef), timeoutPromise]);

          if (snapshot.exists()) {
            const data = snapshot.val();
            console.log("✅ 2. Lấy được Role:", data.role);
            setUserRole(data.role);
            setUserData(data);
          } else {
            console.warn("⚠️ Không tìm thấy dữ liệu user trong DB.");
          }
        } catch (err) {
          // Bắt lỗi tại đây để App không bị sập (Màn hình trắng)
          console.error("⚠️ LỖI KẾT NỐI DB (Bỏ qua để vào App):", err.message);
        }
        
        setCurrentUser(user);
      } else {
        console.log("zzz Chưa đăng nhập");
        setCurrentUser(null);
        setUserRole(null);
        setUserData(null);
      }
      
      // QUAN TRỌNG: Luôn tắt Loading dù thành công hay thất bại
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = { currentUser, userRole, userData, loading };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-blue-600 font-semibold animate-pulse">
            Đang khởi động hệ thống...
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}