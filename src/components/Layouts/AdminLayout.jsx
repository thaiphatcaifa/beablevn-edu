import React from 'react';
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../firebase';

const Icons = {
  Staff: ({ active }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={active ? "#003366" : "#64748b"} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  Student: ({ active }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={active ? "#003366" : "#64748b"} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.499 5.516 50.552 50.552 0 00-2.658.813m-15.482 0A50.55 50.55 0 0112 13.489a50.55 50.55 0 016.744-3.342" />
    </svg>
  ),
  Data: ({ active }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={active ? "#003366" : "#64748b"} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
    </svg>
  ),
  Notification: ({ active }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={active ? "#003366" : "#64748b"} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  ),
  Logout: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
  )
};

const AdminLayout = () => {
  const { currentUser, userData } = useAuth();
  const location = useLocation();
  
  if (!currentUser) return <Navigate to="/login" />;

  const isActive = (path) => location.pathname.includes(path);

  const sidebarLinkClass = (path) => `
    flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group text-sm font-medium
    ${isActive(path) 
      ? 'bg-blue-50 text-[#003366]' 
      : 'text-slate-500 hover:bg-slate-50 hover:text-[#003366]'}
  `;

  const mobileLinkClass = (path) => `
    flex flex-col items-center justify-center w-full h-full space-y-1
    ${isActive(path) ? 'text-[#003366]' : 'text-slate-400'}
  `;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-64 border-r border-slate-200 flex-col fixed h-full z-50 bg-white">
        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <img src="/BA LOGO.png" alt="Logo" className="w-8 h-8 object-contain" />
            <div>
              <h1 className="text-[#003366] font-bold text-base">BAVN Admin</h1>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">System Manager</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <Link to="/admin/staff" className={sidebarLinkClass('staff')}>
            <Icons.Staff active={isActive('staff')} /> <span>Nhân sự</span>
          </Link>
          <Link to="/admin/students" className={sidebarLinkClass('students')}>
            <Icons.Student active={isActive('students')} /> <span>Học viên</span>
          </Link>
          <Link to="/admin/data" className={sidebarLinkClass('data')}>
            <Icons.Data active={isActive('data')} /> <span>Dữ liệu</span>
          </Link>
          {/* Thêm link Thông báo */}
          <Link to="/admin/notifications" className={sidebarLinkClass('notifications')}>
            <Icons.Notification active={isActive('notifications')} /> <span>Thông báo</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button onClick={() => auth.signOut()} className="w-full flex items-center justify-center gap-2 p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium">
            <Icons.Logout /> <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <header className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/BA LOGO.png" alt="Logo" className="w-7 h-7 object-contain" />
          <span className="text-[#003366] font-bold text-sm">BAVN Admin</span>
        </div>
        <button onClick={() => auth.signOut()} className="p-2 text-slate-400 hover:text-red-500"><Icons.Logout /></button>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pb-24 md:pb-8 overflow-auto">
        <div className="max-w-6xl mx-auto"><Outlet /></div>
      </main>

      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-16 flex justify-around items-center z-50 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <Link to="/admin/staff" className={mobileLinkClass('staff')}><Icons.Staff active={isActive('staff')} /><span className="text-[10px] font-medium">Nhân sự</span></Link>
        <Link to="/admin/students" className={mobileLinkClass('students')}><Icons.Student active={isActive('students')} /><span className="text-[10px] font-medium">Học viên</span></Link>
        <Link to="/admin/data" className={mobileLinkClass('data')}><Icons.Data active={isActive('data')} /><span className="text-[10px] font-medium">Dữ liệu</span></Link>
        <Link to="/admin/notifications" className={mobileLinkClass('notifications')}><Icons.Notification active={isActive('notifications')} /><span className="text-[10px] font-medium">Thông báo</span></Link>
      </nav>
    </div>
  );
};

export default AdminLayout;