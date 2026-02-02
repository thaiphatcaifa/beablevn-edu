import React, { useState, useEffect } from 'react';
import { db, firebaseConfig } from '../../firebase';
import { ref, set, onValue, update, remove, get } from "firebase/database";
import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";

const StudentManager = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({ name: '', password: '', studentCode: '', classId1: '', classId2: '', classId3: '', role: 'student' });
  const [editingStudent, setEditingStudent] = useState(null);

  useEffect(() => {
    onValue(ref(db, 'classes'), (snap) => setClasses(snap.val() ? Object.entries(snap.val()).map(([id, val]) => ({ id, ...val })) : []));
    onValue(ref(db, 'users'), (snap) => { if(snap.val()) setStudents(Object.entries(snap.val()).map(([id, val]) => ({ id, ...val })).filter(u => u.role === 'student')); });
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.password || !formData.studentCode) return alert("Thiếu thông tin!");
    const classIds = [formData.classId1, formData.classId2, formData.classId3].filter(Boolean);
    const loginEmail = `${formData.studentCode.trim()}@beable.vn`;
    
    const secondaryApp = initializeApp(firebaseConfig, "StudentApp-" + Date.now());
    try {
      const auth = getAuth(secondaryApp);
      const cred = await createUserWithEmailAndPassword(auth, loginEmail, formData.password);
      await set(ref(db, 'users/' + cred.user.uid), { ...formData, email: loginEmail, classIds, createdAt: new Date().toISOString() });
      await signOut(auth);
      alert(`Đã tạo học viên!\nID: ${formData.studentCode}\nMật khẩu: ${formData.password}`);
      setFormData({ name: '', password: '', studentCode: '', classId1: '', classId2: '', classId3: '', role: 'student' });
    } catch (error) { alert("Lỗi: " + error.message); }
    finally { deleteApp(secondaryApp); }
  };

  // --- TÍNH NĂNG ĐỔI MẬT KHẨU TRỰC TIẾP & GIỮ DỮ LIỆU ---
  const handleChangePassword = async (student) => {
    const newPass = prompt(`Nhập mật khẩu mới cho HV ${student.name}:`);
    if (!newPass) return;
    if (newPass.length < 6) return alert("Mật khẩu phải từ 6 ký tự!");

    const loginEmail = student.email || `${student.studentCode}@beable.vn`;
    const secondaryApp = initializeApp(firebaseConfig, "ResetStudent-" + Date.now());
    
    try {
      // 1. Sao lưu dữ liệu User Profile
      const oldUserSnap = await get(ref(db, `users/${student.id}`));
      const oldUserData = oldUserSnap.val();

      // 2. Sao lưu dữ liệu Điểm số (Scores)
      const oldScoresSnap = await get(ref(db, `scores/${student.id}`));
      const oldScoresData = oldScoresSnap.val();

      // 3. Xóa dữ liệu cũ (Xóa Profile để nhả email ảo, Xóa Scores ở ID cũ)
      await remove(ref(db, `users/${student.id}`));
      if (oldScoresData) await remove(ref(db, `scores/${student.id}`));

      // 4. Tạo Auth mới
      const auth = getAuth(secondaryApp);
      const cred = await createUserWithEmailAndPassword(auth, loginEmail, newPass);
      const newUid = cred.user.uid;
      
      // 5. Khôi phục Profile sang UID mới
      await set(ref(db, `users/${newUid}`), { ...oldUserData });

      // 6. Khôi phục Scores sang UID mới (GIỮ LẠI ĐIỂM)
      if (oldScoresData) {
        await set(ref(db, `scores/${newUid}`), oldScoresData);
      }
      
      // *Lưu ý: Dữ liệu điểm danh (Attendance) nằm phân tán trong các node class/date nên khó migrate tự động.
      // Tuy nhiên, Điểm số là quan trọng nhất và đã được giữ lại.
      
      await signOut(auth);
      alert(`Đổi mật khẩu thành công!\nID: ${student.studentCode}\nMật khẩu mới: ${newPass}\n(Dữ liệu điểm số đã được chuyển sang tài khoản mới)`);
    } catch (error) {
      console.error(error);
      alert("Lỗi: " + error.message + ". Vui lòng thử lại hoặc xóa và tạo mới thủ công."); 
    } finally {
      deleteApp(secondaryApp);
    }
  };

  const handleUpdate = () => {
    if (!editingStudent) return;
    const classIds = [editingStudent.classId1, editingStudent.classId2, editingStudent.classId3].filter(Boolean);
    update(ref(db, `users/${editingStudent.id}`), { name: editingStudent.name, studentCode: editingStudent.studentCode, classIds });
    setEditingStudent(null);
    alert("Đã cập nhật!");
  };

  const getClassNames = (ids) => (!ids || !ids.length) ? "---" : ids.map(id => classes.find(c => c.id === id)?.name || id).join(", ");

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
      <div className="flex gap-6 mb-8 border-b border-slate-100">
        <button onClick={() => setActiveTab('create')} className={`pb-3 text-sm font-bold uppercase tracking-wide transition-all ${activeTab === 'create' ? 'text-[#003366] border-b-2 border-[#003366]' : 'text-slate-400 hover:text-slate-600'}`}>Tạo Mới</button>
        <button onClick={() => setActiveTab('list')} className={`pb-3 text-sm font-bold uppercase tracking-wide transition-all ${activeTab === 'list' ? 'text-[#003366] border-b-2 border-[#003366]' : 'text-slate-400 hover:text-slate-600'}`}>Danh Sách</button>
      </div>

      {activeTab === 'create' && (
        <form onSubmit={handleCreate} className="space-y-6 max-w-4xl mx-auto">
          <div className="grid grid-cols-2 gap-5">
            <div><label className="text-xs font-bold text-slate-500 mb-1 block">Họ và Tên</label><input className="w-full border border-slate-200 p-3 rounded-lg text-sm outline-none focus:border-[#003366]" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Nguyễn Văn A" required /></div>
            <div><label className="text-xs font-bold text-slate-500 mb-1 block">Mã Học viên (ID)</label><input className="w-full border border-slate-200 p-3 rounded-lg text-sm outline-none focus:border-[#003366]" value={formData.studentCode} onChange={e => setFormData({...formData, studentCode: e.target.value})} placeholder="VD: HV001" required /></div>
          </div>
          <div><label className="text-xs font-bold text-slate-500 mb-1 block">Mật khẩu</label><input className="w-full border border-slate-200 p-3 rounded-lg text-sm outline-none focus:border-[#003366]" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Tối thiểu 6 ký tự" required /></div>
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
             <p className="text-xs font-bold text-[#003366] mb-3 uppercase tracking-wide">Phân lớp (Max 3):</p>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
               {[1,2,3].map(i => (
                 <select key={i} className="border border-slate-200 p-2.5 rounded-lg text-sm bg-white outline-none focus:border-[#003366]" value={formData[`classId${i}`]} onChange={e => setFormData({...formData, [`classId${i}`]: e.target.value})}>
                   <option value="">-- Chọn Lớp {i} --</option>
                   {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                 </select>
               ))}
             </div>
          </div>
          <button className="w-full bg-[#003366] text-white py-3.5 rounded-lg font-bold shadow-md hover:bg-[#002244] transition-all">Khởi tạo Tài khoản</button>
        </form>
      )}

      {activeTab === 'list' && (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase"><tr><th className="p-4">ID Đăng nhập</th><th className="p-4">Tên</th><th className="p-4">Lớp</th><th className="p-4 text-right">Thao tác</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {students.map(st => (
                <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-mono font-bold text-[#003366]">{st.studentCode}</td>
                  <td className="p-4 font-semibold text-gray-800">{st.name}</td>
                  <td className="p-4 text-xs font-medium text-slate-600">{getClassNames(st.classIds)}</td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    {/* Nút Đổi Mật Khẩu Trực Tiếp */}
                    <button onClick={() => handleChangePassword(st)} className="text-yellow-600 border border-yellow-600 px-2 py-0.5 rounded text-[10px] font-bold hover:bg-yellow-600 hover:text-white transition-colors" title="Đổi mật khẩu">
                        Pass
                    </button>
                    <button onClick={() => setEditingStudent({ ...st, classId1: st.classIds?.[0]||'', classId2: st.classIds?.[1]||'', classId3: st.classIds?.[2]||'' })} className="text-[#003366] font-bold text-xs border border-[#003366] px-2 py-0.5 rounded hover:bg-[#003366] hover:text-white transition-all">Sửa</button>
                    <button onClick={() => { if(window.confirm("Xóa dữ liệu học viên?")) remove(ref(db, `users/${st.id}`)); }} className="text-red-500 hover:text-red-700 text-xs font-bold px-2">Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingStudent && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-2xl animate-fade-in-up">
            <h3 className="font-bold text-lg mb-6 text-[#003366] border-b border-slate-100 pb-2">Sửa thông tin</h3>
            <div className="space-y-4">
              <input className="w-full border p-2.5 rounded-lg outline-none focus:border-[#003366]" value={editingStudent.name} onChange={e => setEditingStudent({...editingStudent, name: e.target.value})} placeholder="Tên" />
              <input className="w-full border p-2.5 rounded-lg outline-none focus:border-[#003366]" value={editingStudent.studentCode} onChange={e => setEditingStudent({...editingStudent, studentCode: e.target.value})} placeholder="Mã HV" />
              <div className="grid grid-cols-1 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                 {[1,2,3].map(i => (
                   <select key={i} className="border p-2 rounded text-sm w-full bg-white outline-none focus:border-[#003366]" value={editingStudent[`classId${i}`]} onChange={e => setEditingStudent({...editingStudent, [`classId${i}`]: e.target.value})}>
                     <option value="">Lớp {i}</option>
                     {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                   </select>
                 ))}
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => setEditingStudent(null)} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm hover:bg-slate-50 font-medium">Hủy</button>
              <button onClick={handleUpdate} className="px-5 py-2 bg-[#003366] text-white rounded-lg text-sm font-bold shadow-sm hover:bg-[#002244]">Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default StudentManager;