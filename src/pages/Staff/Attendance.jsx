import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { ref, onValue, update } from "firebase/database";

const Attendance = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState({});

  useEffect(() => {
    // Lấy danh sách lớp
    onValue(ref(db, 'classes'), (snap) => {
      const data = snap.val();
      setClasses(data ? Object.entries(data).map(([id, val]) => ({ id, ...val })) : []);
    });
    // Lấy danh sách học viên
    onValue(ref(db, 'users'), (snap) => {
      const data = snap.val();
      if(data) {
        const list = Object.entries(data).map(([id, val]) => ({ id, ...val })).filter(u => u.role === 'student');
        setStudents(list);
      }
    });
  }, []);

  const filteredStudents = selectedClass ? students.filter(s => s.classId === selectedClass) : [];

  const handleSave = () => {
    const updates = {};
    filteredStudents.forEach(st => {
      if (status[st.id]) {
        // Lưu cấu trúc: attendance/CLASS_ID/DATE/STUDENT_ID
        const path = `attendance/${selectedClass || 'general'}/${date}/${st.id}`;
        updates[path] = status[st.id];
      }
    });
    update(ref(db), updates);
    alert("Đã lưu điểm danh!");
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4 text-blue-900">Thẻ Điểm danh</h2>
      
      <div className="flex gap-4 mb-6">
        <select className="border p-2 rounded" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
          <option value="">-- Chọn Lớp --</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input type="date" className="border p-2 rounded" value={date} onChange={e => setDate(e.target.value)} />
      </div>

      {selectedClass && (
        <>
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Học viên</th>
                <th className="p-3 text-center">Có mặt</th>
                <th className="p-3 text-center">Vắng (Phép)</th>
                <th className="p-3 text-center">Vắng (K.Phép)</th>
                <th className="p-3 text-center">Trễ</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(st => (
                <tr key={st.id} className="border-b">
                  <td className="p-3">{st.name} <br/><small className="text-gray-500">{st.studentCode}</small></td>
                  {['present', 'excused', 'absent', 'late'].map(type => (
                    <td key={type} className="p-3 text-center">
                      <input 
                        type="radio" 
                        name={`att-${st.id}`} 
                        checked={status[st.id] === type}
                        onChange={() => setStatus({...status, [st.id]: type})}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={handleSave} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded">Lưu Dữ Liệu</button>
        </>
      )}
    </div>
  );
};
export default Attendance;