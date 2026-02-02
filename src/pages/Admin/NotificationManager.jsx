import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { ref, onValue, remove } from "firebase/database";

const NotificationManager = () => {
  const [notifs, setNotifs] = useState([]);
  const [classes, setClasses] = useState({});

  useEffect(() => {
    // Lấy danh sách lớp để hiển thị tên lớp thay vì ID
    onValue(ref(db, 'classes'), (snapshot) => {
      const data = snapshot.val();
      if (data) setClasses(data);
    });

    // Lấy danh sách thông báo
    onValue(ref(db, 'notifications'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Chuyển object thành array và sắp xếp mới nhất lên đầu
        const list = Object.entries(data)
          .map(([id, val]) => ({ id, ...val }))
          .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        setNotifs(list);
      } else {
        setNotifs([]);
      }
    });
  }, []);

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa thông báo này không? Hành động này không thể hoàn tác.")) {
      remove(ref(db, `notifications/${id}`));
    }
  };

  // Helper: Hiển thị phạm vi áp dụng (Target)
  const renderTargets = (n) => {
    if (!n.targetType || n.targetType === 'all') return <span className="text-emerald-600 font-bold">Toàn hệ thống</span>;
    
    if (n.targetType === 'class') {
      const classNames = (n.targets || []).map(id => classes[id]?.name || id).join(', ');
      return <span className="text-blue-600" title={classNames}>Lớp: {classNames.length > 30 ? classNames.substring(0, 30) + '...' : classNames}</span>;
    }

    if (n.targetType === 'date') {
      return <span className="text-orange-600">Lịch: {(n.targets || []).join(', ')}</span>;
    }
    return '---';
  };

  // Helper: Hiển thị nhãn
  const renderLabel = (label) => {
    const map = {
      'homework': { text: 'Báo bài', color: 'bg-blue-100 text-blue-700' },
      'important': { text: 'Quan trọng', color: 'bg-red-100 text-red-700' },
      'event': { text: 'Sự kiện', color: 'bg-yellow-100 text-yellow-700' },
      'link': { text: 'Liên kết', color: 'bg-gray-100 text-gray-700' },
    };
    const style = map[label] || { text: 'Chung', color: 'bg-gray-100 text-gray-600' };
    return <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${style.color}`}>{style.text}</span>;
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
      <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#003366" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        <h2 className="text-xl font-bold text-[#003366]">Quản lý Thông báo</h2>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase">
            <tr>
              <th className="p-4 w-32">Ngày đăng</th>
              <th className="p-4 w-24">Loại</th>
              <th className="p-4">Nội dung / Liên kết</th>
              <th className="p-4 w-40">Phạm vi</th>
              <th className="p-4 w-32">Người đăng</th>
              <th className="p-4 w-20 text-right">Xóa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {notifs.map(n => (
              <tr key={n.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 text-slate-500 text-xs">{n.date}<br/>{new Date(n.timestamp).toLocaleTimeString('vi-VN')}</td>
                <td className="p-4">{renderLabel(n.label)}</td>
                <td className="p-4">
                  <div className={`text-sm ${n.mode === 'link' ? 'text-blue-600 underline truncate max-w-xs' : 'text-slate-800'}`}>
                    {n.mode === 'link' ? <a href={n.content} target="_blank" rel="noreferrer">{n.content}</a> : n.content}
                  </div>
                </td>
                <td className="p-4 text-xs font-medium">{renderTargets(n)}</td>
                <td className="p-4 text-slate-500 text-xs">{n.author}</td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => handleDelete(n.id)} 
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Xóa thông báo này"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
            {notifs.length === 0 && (
              <tr>
                <td colSpan="6" className="p-8 text-center text-slate-400 italic">Chưa có thông báo nào trên hệ thống.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NotificationManager;