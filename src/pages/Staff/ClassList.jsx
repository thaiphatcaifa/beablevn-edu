import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { ref, onValue } from "firebase/database";

const ClassList = () => {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const unsubscribe = onValue(ref(db, 'users'), (snapshot) => {
      const data = snapshot.val();
      if(data) {
        // Lọc ra user có role là 'student'
        const list = Object.values(data).filter(u => u.role === 'student');
        setStudents(list);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4 text-blue-900">Danh sách Học viên</h2>
      <div className="grid gap-3">
        {students.length === 0 && <p className="text-gray-500">Chưa có học viên nào.</p>}
        {students.map((st, idx) => (
          <div key={idx} className="flex justify-between items-center p-3 border rounded bg-gray-50">
            <div>
              <div className="font-bold">{st.name}</div>
              <div className="text-sm text-gray-500">{st.studentCode} | {st.email}</div>
            </div>
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm font-medium">
              {st.classId || 'Chưa xếp lớp'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default ClassList;