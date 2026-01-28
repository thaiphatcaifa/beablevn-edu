import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { ref, onValue } from "firebase/database";

const StudentNotifications = () => {
  const [notifs, setNotifs] = useState([]);

  useEffect(() => {
    const unsubscribe = onValue(ref(db, 'notifications'), (snap) => {
      const data = snap.val();
      setNotifs(data ? Object.values(data).reverse() : []);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Bảng Tin & Sự Kiện</h2>
      {notifs.map((n, i) => (
        <div key={i} className="bg-white p-4 rounded shadow border-l-4 border-blue-500">
          <p className="text-gray-800">{n.content}</p>
          <p className="text-xs text-gray-400 mt-2">{n.date}</p>
        </div>
      ))}
      {notifs.length === 0 && <p className="text-center text-gray-500">Không có thông báo mới.</p>}
    </div>
  );
};
export default StudentNotifications;