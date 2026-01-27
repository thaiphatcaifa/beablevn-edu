import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { ref, onValue } from "firebase/database";

const MyGrades = () => {
  const { currentUser } = useAuth();
  const [score, setScore] = useState(null);

  useEffect(() => {
    if (currentUser) {
      onValue(ref(db, `scores/${currentUser.uid}`), (snap) => {
        setScore(snap.val());
      });
    }
  }, [currentUser]);

  if (!score) return <div className="bg-white p-6 rounded shadow text-center">Chưa có dữ liệu điểm.</div>;

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-6 text-blue-800">Bảng Tổng hợp Điểm</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-green-50 p-6 rounded-xl border border-green-100 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">+{score.bonus || 0}</div>
          <div className="text-green-800 font-medium">Điểm Cộng Khuyến khích</div>
        </div>

        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">{score.homework || 0}</div>
          <div className="text-blue-800 font-medium">Điểm Bài tập về nhà</div>
        </div>

        <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">{score.test || 0}</div>
          <div className="text-purple-800 font-medium">Điểm Kiểm tra Định kỳ</div>
        </div>

      </div>
    </div>
  );
};
export default MyGrades;