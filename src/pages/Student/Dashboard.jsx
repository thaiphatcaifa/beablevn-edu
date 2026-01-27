import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { ref, get } from "firebase/database";

const StudentDashboard = () => {
  const { userData } = useAuth();
  const [classInfo, setClassInfo] = useState(null);

  useEffect(() => {
    if (userData?.classId) {
      get(ref(db, `classes/${userData.classId}`)).then((snap) => {
        if (snap.exists()) setClassInfo(snap.val());
      });
    }
  }, [userData]);

  return (
    <div className="space-y-6">
      {/* Card Thông tin */}
      <div className="bg-white p-6 rounded-xl shadow border-l-4 border-blue-600 flex items-center gap-4">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl">🎓</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{userData?.name}</h1>
          <p className="text-gray-600">Mã Học viên: <span className="font-mono font-bold text-blue-800">{userData?.studentCode}</span></p>
          <p className="text-gray-500 text-sm">{userData?.email}</p>
        </div>
      </div>

      {/* Card Lịch học (Lấy từ Class) */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span>📅</span> Lớp học & Lịch trình
        </h3>
        {classInfo ? (
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="text-lg font-bold text-blue-900">{classInfo.name}</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <div><span className="text-gray-500">Môn học:</span> <br/>{classInfo.subject}</div>
              <div><span className="text-gray-500">Phòng:</span> <br/>{classInfo.room}</div>
              <div><span className="text-gray-500">Lịch học:</span> <br/><span className="font-bold text-green-600">{classInfo.schedule}</span></div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 italic">Bạn chưa được xếp lớp. Vui lòng liên hệ Giáo viên.</p>
        )}
      </div>
    </div>
  );
};
export default StudentDashboard;