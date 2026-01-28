import React from 'react';
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../firebase';

// Bộ Icon SVG Minimalist
const Icons = {
  Class: ({ active }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke={active ? "#003366" : "#94a3b8"} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.499 5.516 50.552 50.552 0 00-2.658.813m-15.482 0A50.55 50.55 0 0112 13.489a50.55 50.55 0 016.744-3.342" />
    </svg>
  ),
  Attendance: ({ active }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke={active ? "#003366" : "#94a3b8"} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Scores: ({ active }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke={active ? "#003366" : "#94a3b8"} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  ),
  Notifications: ({ active }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke={active ? "#003366" : "#94a3b8"} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  ),
  Logout: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
  )
};

const StaffLayout = () => {
  const { userData, currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) return <Navigate to="/login" />;

  const isActive = (path) => location.pathname.includes(path);

  // Style đồng bộ: Xanh dương đậm (#003366)
  const linkClass = (path) => `
    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
    ${isActive(path) 
      ? 'bg-[#e0f2fe] text-[#003366] font-bold shadow-sm' 
      : 'text-gray-500 hover:bg-gray-50 hover:text-[#003366] font-medium'}
  `;

  return (
    <div className="flex h-screen bg-[#f3f4f6] font-sans">
      
      {/* SIDEBAR CỐ ĐỊNH BÊN TRÁI */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-50 shadow-sm">
        
        {/* HEADER */}
        <div className="p-6 border-b border-gray-100 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <img src="/BA LOGO.png" alt="Logo" className="w-10 h-10 object-contain" />
            <div>
              <h1 className="text-[#003366] font-extrabold text-lg leading-none">Be Able VN</h1>
              <span className="text-xs text-gray-400 font-medium tracking-wide">Staff Portal</span>
            </div>
          </div>
          
          {/* User Info Minimalist */}
          <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
            <div className="w-8 h-8 rounded-full bg-[#003366] text-white flex items-center justify-center font-bold text-xs">
              {userData?.name?.charAt(0) || "S"}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-bold text-gray-700 truncate">{userData?.name || "Nhân viên"}</div>
              <div className="text-[10px] text-gray-400 truncate">{userData?.email}</div>
            </div>
          </div>
        </div>

        {/* MENU NAVIGATION */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="px-4 pb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Menu</div>
          <Link to="/staff/classes" className={linkClass('classes')}>
            <Icons.Class active={isActive('classes')} /> <span>Lớp học</span>
          </Link>
          <Link to="/staff/attendance" className={linkClass('attendance')}>
            <Icons.Attendance active={isActive('attendance')} /> <span>Điểm danh</span>
          </Link>
          <Link to="/staff/scores" className={linkClass('scores')}>
            <Icons.Scores active={isActive('scores')} /> <span>Kết quả học tập</span>
          </Link>
          <Link to="/staff/notifications" className={linkClass('notifications')}>
            <Icons.Notifications active={isActive('notifications')} /> <span>Thông báo</span>
          </Link>
        </nav>

        {/* FOOTER */}
        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={() => auth.signOut()} 
            className="w-full flex items-center justify-center gap-2 p-3 text-red-600 rounded-xl hover:bg-red-50 transition-all font-semibold text-sm group"
          >
            <Icons.Logout /> 
            <span className="group-hover:translate-x-1 transition-transform">Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 ml-64 p-8 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default StaffLayout;