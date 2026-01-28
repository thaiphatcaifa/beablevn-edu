import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../firebase';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const { currentUser, userRole } = useAuth();

  // 1. Tự động chuyển trang nếu phát hiện đã đăng nhập từ trước
  useEffect(() => {
    if (currentUser && userRole) {
      console.log("Đã đăng nhập, đang chuyển hướng...");
      if (userRole === 'admin') navigate('/admin/staff');
      else if (userRole === 'staff') navigate('/staff/attendance');
      else if (userRole === 'student') navigate('/student/dashboard');
      else navigate('/');
    }
  }, [currentUser, userRole, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // 2. Thực hiện đăng nhập
      await signInWithEmailAndPassword(auth, email, password);
      
      // 3. FORCE NAVIGATE: Chuyển hướng ngay lập tức (Fallback)
      // Mặc định về trang chủ, sau đó App.jsx sẽ phân luồng tiếp
      navigate('/'); 
      
    } catch (err) {
      console.error(err);
      setError('Đăng nhập thất bại. Vui lòng kiểm tra lại Email/Mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-blue-800">Đăng nhập Hệ thống</h2>
        
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input 
              type="email" required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
            <input 
              type="password" required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button 
            type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;