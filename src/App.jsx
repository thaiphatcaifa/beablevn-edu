// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import AdminLayout from './components/Layouts/AdminLayout';
import StaffLayout from './components/Layouts/StaffLayout';
import StudentLayout from './components/Layouts/StudentLayout';

// Pages
import Login from './pages/Login';

// Admin Pages
import StaffManager from './pages/Admin/StaffManager';
import StudentManager from './pages/Admin/StudentManager';
import DataManager from './pages/Admin/DataManager';

// Staff Pages
import ClassList from './pages/Staff/ClassList';
import Attendance from './pages/Staff/Attendance';
import ScoreInput from './pages/Staff/ScoreInput';
import StaffNotifications from './pages/Staff/Notifications';

// Student Pages
import StudentDashboard from './pages/Student/Dashboard';
import MyAttendance from './pages/Student/MyAttendance';
import MyGrades from './pages/Student/MyGrades';
import StudentNotifications from './pages/Student/Notifications';

// Component điều hướng thông minh
const RedirectBasedOnRole = () => {
  const { currentUser, userRole, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center">Đang tải...</div>;
  if (!currentUser) return <Navigate to="/login" />;
  
  if (userRole === 'admin') return <Navigate to="/admin/staff" />;
  if (userRole === 'staff') return <Navigate to="/staff/classes" />;
  if (userRole === 'student') return <Navigate to="/student/dashboard" />;
  
  return <div className="p-10 text-center">Tài khoản chưa được phân quyền.</div>;
};

// Component bảo vệ Route
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, userRole, loading } = useAuth();
  if (loading) return <div>Đang kiểm tra quyền...</div>;
  if (!currentUser) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(userRole)) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* --- ADMIN --- */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
            <Route path="staff" element={<StaffManager />} />
            <Route path="students" element={<StudentManager />} />
            <Route path="data" element={<DataManager />} />
          </Route>

          {/* --- STAFF (BE ABLE) --- */}
          <Route path="/staff" element={<ProtectedRoute allowedRoles={['staff', 'admin']}><StaffLayout /></ProtectedRoute>}>
            <Route path="classes" element={<ClassList />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="scores" element={<ScoreInput />} />
            <Route path="notifications" element={<StaffNotifications />} />
          </Route>

          {/* --- STUDENT --- */}
          <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><StudentLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="attendance" element={<MyAttendance />} />
            <Route path="scores" element={<MyGrades />} />
            <Route path="notifications" element={<StudentNotifications />} />
          </Route>

          <Route path="/" element={<RedirectBasedOnRole />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;