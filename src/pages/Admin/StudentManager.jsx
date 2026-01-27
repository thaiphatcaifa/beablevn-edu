import React, { useState, useEffect } from 'react';
import { db, firebaseConfig } from '../../firebase';
import { ref, set, onValue } from "firebase/database";
import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";

const StudentManager = () => {
  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState({ 
    name: '', email: '', password: '', studentCode: '', classId: '', role: 'student' 
  });

  useEffect(() => {
    onValue(ref(db, 'classes'), (snapshot) => {
      const data = snapshot.val();
      setClasses(data ? Object.entries(data).map(([id, val]) => ({ id, ...val })) : []);
    });
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.studentCode) return alert("Thiếu thông tin!");
    if (formData.password.length < 6) return alert("Mật khẩu tối thiểu 6 ký tự!");

    const secondaryAppName = "SecondaryApp-Student-" + Date.now();
    let secondaryApp;

    try {
      secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
      const secondaryAuth = getAuth(secondaryApp);

      // Tạo User Auth
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, formData.email, formData.password);
      const newUid = userCredential.user.uid;

      // Lưu Database
      await set(ref(db, 'users/' + newUid), {
        name: formData.name,
        email: formData.email,
        studentCode: formData.studentCode,
        classId: formData.classId,
        role: 'student',
        createdAt: new Date().toISOString()
      });

      await signOut(secondaryAuth);
      alert(`Đã tạo học viên: ${formData.name}\nTài khoản: ${formData.email}\nMật khẩu: ${formData.password}`);
      setFormData({ name: '', email: '', password: '', studentCode: '', classId: '', role: 'student' });

    } catch (error) {
      if(error.code === 'auth/email-already-in-use') alert("Email đã tồn tại!");
      else alert("Lỗi: " + error.message);
    } finally {
      if (secondaryApp) deleteApp(secondaryApp);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow max-w-3xl">
      <h2 className="text-xl font-bold mb-6 text-blue-900">🎓 Quản lý Học viên</h2>
      <form onSubmit={handleCreate} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Họ và Tên</label>
            <input className="w-full border p-2 rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mã Học viên</label>
            <input className="w-full border p-2 rounded" value={formData.studentCode} onChange={e => setFormData({...formData, studentCode: e.target.value})} required placeholder="VD: BA001" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" className="w-full border p-2 rounded" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mật khẩu</label>
            <input type="text" className="w-full border p-2 rounded" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required placeholder="Min 6 chars" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Lớp học</label>
          <select className="w-full border p-2 rounded" value={formData.classId} onChange={e => setFormData({...formData, classId: e.target.value})} required>
            <option value="">-- Chọn Lớp --</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.room})</option>
            ))}
          </select>
        </div>

        <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 rounded hover:bg-green-700">
          + Khởi tạo Tài khoản Học viên
        </button>
      </form>
    </div>
  );
};
export default StudentManager;