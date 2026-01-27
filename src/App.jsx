// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Learning from './pages/Learning';
import CourseDetail from './pages/CourseDetail';

// Trang Home tạm
const Home = () => <div className="p-8"><h1>Chào mừng trở lại!</h1></div>;

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Route cho trang chi tiết khóa học (Full màn hình, không cần Layout Sidebar) */}
          <Route path="/learning/:id" element={<CourseDetail />} />

          {/* Các Route có Sidebar chung */}
          <Route path="/learning" element={<Layout><Learning /></Layout>} />
          <Route path="/" element={<Layout><Home /></Layout>} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;