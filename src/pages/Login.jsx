import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { ref, get } from 'firebase/database';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({ id: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let loginEmail = formData.id.trim();
      if (!loginEmail.includes('@')) {
        loginEmail = `${loginEmail}@beable.vn`;
      }

      const userCredential = await signInWithEmailAndPassword(auth, loginEmail, formData.password);
      const user = userCredential.user;

      const snapshot = await get(ref(db, 'users/' + user.uid));
      if (snapshot.exists()) {
        const userData = snapshot.val();
        if (userData.role === 'admin') navigate('/admin/staff');
        else if (userData.role === 'staff') navigate('/staff/classes');
        else navigate('/student/dashboard');
      } else {
        setError("Không tìm thấy dữ liệu người dùng.");
      }
    } catch (err) {
      setError("Đăng nhập thất bại! Kiểm tra lại ID và Mật khẩu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        <div className="text-center mb-8">
          {/* Logo giữ nguyên bản, không filter màu */}
          <div className="w-20 h-20 bg-white rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-sm border border-slate-50">
            <img src="/BA LOGO.png" alt="Logo" className="w-14 h-14 object-contain" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#003366]">BE ABLE VN</h1>
          <p className="text-slate-400 text-sm mt-1 font-medium">Hệ thống Quản lý Đào tạo</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-6 flex items-center gap-2 border border-red-100 font-medium">⚠️ {error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-[#003366] uppercase mb-1.5 ml-1">Tên đăng nhập / Mã HV</label>
            <div className="relative">
              <input 
                type="text" 
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#003366] focus:border-transparent outline-none transition-all bg-white text-slate-700 font-medium"
                placeholder="Ví dụ: gv01 hoặc HV001" 
                value={formData.id} 
                onChange={(e) => setFormData({...formData, id: e.target.value})} 
                required 
              />
              <span className="absolute left-3 top-3.5 text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#003366] uppercase mb-1.5 ml-1">Mật khẩu</label>
            <div className="relative">
              <input 
                type="password" 
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#003366] focus:border-transparent outline-none transition-all bg-white text-slate-700 font-medium"
                placeholder="••••••••" 
                value={formData.password} 
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                required 
              />
              <span className="absolute left-3 top-3.5 text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
              </span>
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-[#003366] text-white font-bold py-3.5 rounded-xl hover:bg-[#002244] transition-all shadow-lg shadow-blue-900/10 active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Đăng Nhập</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;