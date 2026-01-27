import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import AdminLayout from './components/Layouts/AdminLayout';
import StaffLayout from './components/Layouts/StaffLayout';
import StudentLayout from './components/Layouts/StudentLayout';

// Pages
import StaffManager from './pages/Admin/StaffManager';
import Attendance from './pages/Staff/Attendance';
import StudentDashboard from './pages/Student/Dashboard';
import Login from './pages/Login';

// Component điều hướng thông minh
const RedirectBasedOnRole = () => {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) return <div className="h-screen flex items-center justify-center">Đang tải dữ liệu...</div>;
  
  if (!currentUser) return <Navigate to="/login" />;

  // Phân luồng dựa trên Role
  if (userRole === 'admin') return <Navigate to="/admin/staff" />;
  if (userRole === 'staff') return <Navigate to="/staff/attendance" />;
  if (userRole === 'student') return <Navigate to="/student/dashboard" />;
  
  return <div className="p-10 text-center">Tài khoản chưa được phân quyền.</div>;
};

// Component bảo vệ Route
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, userRole, loading } = useAuth();
  
  if (loading) return <div>Checking...</div>;
  if (!currentUser) return <Navigate to="/login" />;
  
  if (allowedRoles && !allowedRoles.includes(userRole)) {
     return <Navigate to="/" />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
            <Route path="staff" element={<StaffManager />} />
          </Route>

          {/* Staff */}
          <Route path="/staff" element={<ProtectedRoute allowedRoles={['staff', 'admin']}><StaffLayout /></ProtectedRoute>}>
            <Route path="attendance" element={<Attendance />} />
          </Route>

          {/* Student */}
          <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><StudentLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<StudentDashboard />} />
          </Route>

          {/* Trang chủ mặc định */}
          <Route path="/" element={<RedirectBasedOnRole />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;