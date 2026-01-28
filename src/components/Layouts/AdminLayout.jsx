import React from 'react';
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../firebase';

// Bộ Icon SVG Minimalist - Xanh dương đậm
const Icons = {
  Staff: ({ active }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke={active ? "#003366" : "#94a3b8"} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  Student: ({ active }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke={active ? "#003366" : "#94a3b8"} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.499 5.516 50.552 50.552 0 00-2.658.813m-15.482 0A50.55 50.55 0 0112 13.489a50.55 50.55 0 016.744-3.342" />
    </svg>
  ),
  Data: ({ active }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke={active ? "#003366" : "#94a3b8"} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
    </svg>
  ),
  Logout: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
  )
};

const AdminLayout = () => {
  const { currentUser, userData } = useAuth();
  const location = useLocation();
  
  if (!currentUser) return <Navigate to="/login" />;

  const isActive = (path) => location.pathname.includes(path);

  // Style đồng bộ: Xanh dương đậm khi active
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
        
        {/* HEADER: LOGO + TÊN TÀI KHOẢN */}
        <div className="p-6 border-b border-gray-100 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <img src="/BA LOGO.png" alt="Logo" className="w-10 h-10 object-contain" />
            <div>
              <h1 className="text-[#003366] font-extrabold text-lg leading-none">BAVN Admin</h1>
              <span className="text-xs text-gray-400 font-medium tracking-wide">System Manager</span>
            </div>
          </div>
          
          {/* User Info Minimalist */}
          <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
            <div className="w-8 h-8 rounded-full bg-[#003366] text-white flex items-center justify-center font-bold text-xs">
              {userData?.name?.charAt(0) || "A"}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-bold text-gray-700 truncate">{userData?.name || "Admin"}</div>
              <div className="text-[10px] text-gray-400 truncate">Administrator</div>
            </div>
          </div>
        </div>

        {/* MENU NAVIGATION */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="px-4 pb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Quản lý</div>
          <Link to="/admin/staff" className={linkClass('staff')}>
            <Icons.Staff active={isActive('staff')} /> <span>Nhân sự</span>
          </Link>
          <Link to="/admin/students" className={linkClass('students')}>
            <Icons.Student active={isActive('students')} /> <span>Học viên</span>
          </Link>
          <Link to="/admin/data" className={linkClass('data')}>
            <Icons.Data active={isActive('data')} /> <span>Cấu trúc Dữ liệu</span>
          </Link>
        </nav>

        {/* FOOTER: NÚT ĐĂNG XUẤT */}
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

export default AdminLayout;