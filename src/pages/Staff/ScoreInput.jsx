import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { ref, onValue, update } from "firebase/database";

const ScoreInput = () => {
  const [students, setStudents] = useState([]);
  const [scores, setScores] = useState({});

  useEffect(() => {
    onValue(ref(db, 'users'), (snap) => {
      const data = snap.val();
      if(data) {
        setStudents(Object.entries(data).map(([id, val]) => ({ id, ...val })).filter(u => u.role === 'student'));
      }
    });
  }, []);

  const handleChange = (studentId, field, value) => {
    setScores(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: Number(value) }
    }));
  };

  const handleSave = (studentId) => {
    if(!scores[studentId]) return;
    update(ref(db, `scores/${studentId}`), scores[studentId]);
    alert("Đã cập nhật điểm!");
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4 text-blue-900">Thẻ Kết quả học tập</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Học viên</th>
              <th className="p-3">Điểm Cộng</th>
              <th className="p-3">Bài tập về nhà</th>
              <th className="p-3">Kiểm tra Định kỳ</th>
              <th className="p-3">Lưu</th>
            </tr>
          </thead>
          <tbody>
            {students.map(st => (
              <tr key={st.id} className="border-b">
                <td className="p-3">{st.name}<br/><small>{st.studentCode}</small></td>
                <td className="p-3"><input type="number" className="border w-20 p-1" placeholder="0" onChange={(e) => handleChange(st.id, 'bonus', e.target.value)} /></td>
                <td className="p-3"><input type="number" className="border w-20 p-1" placeholder="0" onChange={(e) => handleChange(st.id, 'homework', e.target.value)} /></td>
                <td className="p-3"><input type="number" className="border w-20 p-1" placeholder="0" onChange={(e) => handleChange(st.id, 'test', e.target.value)} /></td>
                <td className="p-3"><button onClick={() => handleSave(st.id)} className="text-blue-600 font-bold">💾</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default ScoreInput;