import React, { useState, useEffect } from 'react';
import { db, firebaseConfig } from '../../firebase'; // Import config để dùng cho app phụ
import { ref, set, onValue, remove } from "firebase/database";
import { initializeApp, getApp, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";

const StaffManager = () => {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', // Thêm trường password
    subRole: 'teacher', 
    assignedClasses: [] 
  });

  const [staffList, setStaffList] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);

  useEffect(() => {
    // Load danh sách lớp
    onValue(ref(db, 'classes'), (snapshot) => {
      const data = snapshot.val();
      setAvailableClasses(data ? Object.entries(data).map(([id, val]) => ({ id, ...val })) : []);
    });

    // Load danh sách nhân sự
    onValue(ref(db, 'users'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setStaffList(Object.entries(data).map(([id, val]) => ({ id, ...val })).filter(u => u.role === 'staff'));
      } else {
        setStaffList([]);
      }
    });
  }, []);

  const handleClassToggle = (classId) => {
    setFormData(prev => {
      const current = prev.assignedClasses || [];
      return current.includes(classId) 
        ? { ...prev, assignedClasses: current.filter(id => id !== classId) }
        : { ...prev, assignedClasses: [...current, classId] };
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) return alert("Vui lòng nhập đủ tên, email và mật khẩu!");
    if (formData.password.length < 6) return alert("Mật khẩu phải có ít nhất 6 ký tự!");

    // --- KỸ THUẬT SECONDARY APP (Để không bị logout Admin) ---
    const secondaryAppName = "SecondaryApp-" + Date.now();
    let secondaryApp;
    
    try {
      // 1. Khởi tạo app phụ
      secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
      const secondaryAuth = getAuth(secondaryApp);

      // 2. Tạo User trên Authentication
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, formData.email, formData.password);
      const newUid = userCredential.user.uid;

      // 3. Lưu thông tin vào Realtime Database với UID vừa tạo
      await set(ref(db, 'users/' + newUid), {
        name: formData.name,
        email: formData.email,
        subRole: formData.subRole,
        assignedClasses: formData.assignedClasses,
        role: 'staff',
        createdAt: new Date().toISOString()
      });

      // 4. Đăng xuất khỏi app phụ để an toàn
      await signOut(secondaryAuth);
      
      alert(`Đã tạo nhân sự thành công!\nEmail: ${formData.email}\nMật khẩu: ${formData.password}`);
      setFormData({ name: '', email: '', password: '', subRole: 'teacher', assignedClasses: [] });

    } catch (error) {
      console.error(error);
      if (error.code === 'auth/email-already-in-use') alert("Email này đã được sử dụng!");
      else alert("Lỗi: " + error.message);
    } finally {
      // 5. Xóa app phụ để giải phóng bộ nhớ
      if (secondaryApp) deleteApp(secondaryApp);
    }
  };

  const handleDelete = async (staffId) => {
    if (window.confirm("Lưu ý: Hành động này chỉ xóa dữ liệu trong danh sách, không xóa tài khoản đăng nhập (Auth). Bạn có chắc chắn xóa?")) {
      await remove(ref(db, `users/${staffId}`));
    }
  };

  const getClassNames = (classIds) => {
    if (!classIds || !Array.isArray(classIds)) return "Chưa phân công";
    return classIds.map(id => availableClasses.find(c => c.id === id)?.name || id).join(", ");
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded shadow-lg border-t-4 border-blue-600">
        <h2 className="text-xl font-bold mb-6 text-blue-900">👤 Tạo Tài khoản Nhân sự</h2>
        
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Họ và Tên</label>
              <input className="w-full border p-2 rounded" placeholder="Nguyen Van A" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Email đăng nhập</label>
                <input type="email" className="w-full border p-2 rounded" placeholder="email@bavn.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mật khẩu</label>
                <input type="text" className="w-full border p-2 rounded" placeholder="Tối thiểu 6 ký tự" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Chức vụ</label>
              <select className="w-full border p-2 rounded" value={formData.subRole} onChange={e => setFormData({...formData, subRole: e.target.value})}>
                <option value="teacher">Giáo viên</option>
                <option value="cco">CCO</option>
              </select>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded border">
            <label className="block text-sm font-bold mb-2">Phân quyền Lớp học:</label>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {availableClasses.map((cls) => (
                <label key={cls.id} className="flex items-center space-x-2">
                  <input type="checkbox" checked={formData.assignedClasses.includes(cls.id)} onChange={() => handleClassToggle(cls.id)} />
                  <span className="text-sm">{cls.name} ({cls.room})</span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="md:col-span-2 bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700">
            + Tạo Tài khoản & Cấp quyền
          </button>
        </form>
      </div>

      {/* Bảng danh sách nhân sự giữ nguyên logic cũ, chỉ cập nhật UI nếu cần */}
      <div className="bg-white p-6 rounded shadow-lg">
        <h2 className="text-xl font-bold mb-4">Danh sách Nhân sự</h2>
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Họ tên</th>
              <th className="p-3">Email</th>
              <th className="p-3">Chức vụ</th>
              <th className="p-3">Lớp</th>
              <th className="p-3">Xóa</th>
            </tr>
          </thead>
          <tbody>
            {staffList.map(staff => (
              <tr key={staff.id} className="border-b">
                <td className="p-3 font-medium">{staff.name}</td>
                <td className="p-3">{staff.email}</td>
                <td className="p-3 uppercase text-xs font-bold">{staff.subRole}</td>
                <td className="p-3 text-sm text-gray-500">{getClassNames(staff.assignedClasses)}</td>
                <td className="p-3">
                  <button onClick={() => handleDelete(staff.id)} className="text-red-500 hover:underline">Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffManager;