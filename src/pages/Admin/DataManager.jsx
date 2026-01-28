import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { ref, push, onValue, remove } from "firebase/database";

const DataManager = () => {
  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState({ name: '', room: '', subject: '', schedule: '' });

  useEffect(() => {
    onValue(ref(db, 'classes'), (snapshot) => {
      const data = snapshot.val();
      setClasses(data ? Object.entries(data).map(([id, val]) => ({ id, ...val })) : []);
    });
  }, []);

  const handleAdd = () => {
    if (!formData.name) return;
    push(ref(db, 'classes'), formData);
    setFormData({ name: '', room: '', subject: '', schedule: '' });
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4 text-blue-900">Thẻ Cấu trúc Dữ liệu</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-6 bg-gray-50 p-4 rounded">
        <input className="border p-2 rounded" placeholder="Tên lớp (VD: IE0201)" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
        <input className="border p-2 rounded" placeholder="Phòng (VD: P01)" value={formData.room} onChange={e => setFormData({...formData, room: e.target.value})} />
        <input className="border p-2 rounded" placeholder="Môn học (VD: AIM.2B)" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} />
        <input className="border p-2 rounded" placeholder="Lịch (VD: T2-T4)" value={formData.schedule} onChange={e => setFormData({...formData, schedule: e.target.value})} />
        <button onClick={handleAdd} className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700">Thêm Mới</button>
      </div>

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-100 border-b">
            <th className="p-3">Tên lớp</th>
            <th className="p-3">Phòng</th>
            <th className="p-3">Môn học</th>
            <th className="p-3">Lịch học</th>
            <th className="p-3">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {classes.map(c => (
            <tr key={c.id} className="border-b hover:bg-gray-50">
              <td className="p-3 font-medium">{c.name}</td>
              <td className="p-3">{c.room}</td>
              <td className="p-3">{c.subject}</td>
              <td className="p-3">{c.schedule}</td>
              <td className="p-3">
                <button onClick={() => remove(ref(db, `classes/${c.id}`))} className="text-red-500 hover:underline">Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default DataManager;