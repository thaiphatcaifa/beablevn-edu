import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { ref, push, onValue } from "firebase/database";

const Notifications = () => {
  // State cho nội dung
  const [mode, setMode] = useState('text'); // 'text' | 'link'
  const [content, setContent] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [label, setLabel] = useState('homework');

  // State cho Phạm vi (Target)
  const [targetType, setTargetType] = useState('all'); // 'all' | 'class' | 'date'
  const [selectedTargets, setSelectedTargets] = useState([]); // Mảng lưu ID lớp hoặc Thứ (T2, T3...)
  
  // Dữ liệu lớp học để hiển thị checkbox
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    // Lấy danh sách lớp để giáo viên chọn
    onValue(ref(db, 'classes'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setClasses(Object.entries(data).map(([id, val]) => ({ id, ...val })));
      }
    });
  }, []);

  // Xử lý chọn/bỏ chọn target
  const toggleTarget = (value) => {
    setSelectedTargets(prev => 
      prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
    );
  };

  const handlePost = () => {
    // Validate nội dung
    if (mode === 'text' && !content) return alert("Vui lòng nhập nội dung!");
    if (mode === 'link' && !linkUrl) return alert("Vui lòng nhập đường dẫn!");

    // Validate phạm vi
    if (targetType !== 'all' && selectedTargets.length === 0) {
      return alert(targetType === 'class' ? "Vui lòng chọn ít nhất 1 lớp!" : "Vui lòng chọn ít nhất 1 ngày!");
    }

    push(ref(db, 'notifications'), {
      mode,
      content: mode === 'text' ? content : linkUrl,
      label: mode === 'text' ? label : 'link',
      date: new Date().toLocaleDateString('vi-VN'),
      author: 'Giáo viên/CCO',
      timestamp: Date.now(),
      // Lưu thông tin target để lọc
      targetType, 
      targets: targetType === 'all' ? ['all'] : selectedTargets
    });

    // Reset form
    setContent('');
    setLinkUrl('');
    setSelectedTargets([]);
    setTargetType('all');
    alert('Đã đăng thông báo thành công!');
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
      <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#003366" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.996.912 2.164 1.661 2.868C12.72 18.261 13.9 18 14.5 18c.6 0 1.78-.261 2.5-.952.749-.704 1.408-1.872 1.661-2.868m-7.821-7.42a6 6 0 00-1.2-.533m8.91 9.963a6.002 6.002 0 01-1.2.533m-7.71-10.496a3.504 3.504 0 011.05-1.928m6.72 1.928a3.504 3.504 0 00-1.05-1.928" /></svg>
         <h2 className="text-xl font-bold text-[#003366]">Đăng Thông Báo Mới</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* CỘT TRÁI: Nội dung & Loại */}
        <div className="space-y-6">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase block mb-2">1. Loại nội dung:</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer p-2 border rounded-lg hover:bg-slate-50 transition-colors w-full justify-center">
                <input type="radio" name="postMode" className="accent-[#003366]" checked={mode === 'text'} onChange={() => setMode('text')} />
                <span className="text-sm font-bold text-slate-700">Văn bản & Nhãn</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer p-2 border rounded-lg hover:bg-slate-50 transition-colors w-full justify-center">
                <input type="radio" name="postMode" className="accent-[#003366]" checked={mode === 'link'} onChange={() => setMode('link')} />
                <span className="text-sm font-bold text-slate-700">Hyperlink (Web)</span>
              </label>
            </div>
          </div>

          {mode === 'text' ? (
            <div className="animate-fade-in-up space-y-4">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase block mb-2">Nhãn dán:</span>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => setLabel('homework')} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${label === 'homework' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-600 border-blue-100'}`}>📘 Báo bài</button>
                  <button onClick={() => setLabel('important')} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${label === 'important' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-red-600 border-red-100'}`}>📕 Quan trọng</button>
                  <button onClick={() => setLabel('event')} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${label === 'event' ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-white text-yellow-600 border-yellow-100'}`}>🏆 Sự kiện</button>
                </div>
              </div>
              <textarea 
                  className="w-full border border-slate-200 p-4 rounded-xl h-40 focus:ring-2 focus:ring-blue-50 focus:border-[#003366] outline-none resize-none text-sm"
                  placeholder="Nhập nội dung thông báo..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
              />
            </div>
          ) : (
            <div className="animate-fade-in-up">
               <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Đường dẫn Website:</label>
               <input 
                  className="w-full border border-slate-200 p-3 rounded-xl text-sm outline-none focus:border-[#003366] text-[#003366]"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={e => setLinkUrl(e.target.value)}
               />
            </div>
          )}
        </div>

        {/* CỘT PHẢI: Phạm vi hiển thị */}
        <div className="space-y-4">
           <label className="text-xs font-bold text-slate-400 uppercase block">2. Phạm vi hiển thị:</label>
           
           {/* Tabs chọn loại Target */}
           <div className="flex bg-slate-100 p-1 rounded-lg">
              {['all', 'class', 'date'].map(type => (
                <button 
                  key={type}
                  onClick={() => { setTargetType(type); setSelectedTargets([]); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${targetType === type ? 'bg-white text-[#003366] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {type === 'all' ? 'Tất cả' : type === 'class' ? 'Theo Lớp' : 'Theo Lịch'}
                </button>
              ))}
           </div>

           {/* Nội dung chọn Target */}
           <div className="border border-slate-200 rounded-xl p-4 h-64 overflow-y-auto bg-slate-50/50 custom-scrollbar">
              {targetType === 'all' && (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 mb-2 opacity-50"><path strokeLinecap="round" strokeLinejoin="round" d="M12.75 19.5v-.75a7.5 7.5 0 00-7.5-7.5H4.5m0-6.75h.75c7.87 0 14.25 6.38 14.25 14.25v.75M6 18.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>
                   <p className="text-sm font-medium">Thông báo sẽ gửi đến toàn bộ học viên.</p>
                </div>
              )}

              {targetType === 'class' && (
                <div className="grid grid-cols-1 gap-2 animate-fade-in-up">
                   {classes.map(cls => (
                     <label key={cls.id} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${selectedTargets.includes(cls.id) ? 'bg-blue-50 border-[#003366]' : 'bg-white border-slate-200 hover:border-blue-300'}`}>
                        <input type="checkbox" className="accent-[#003366] w-4 h-4 mr-3" checked={selectedTargets.includes(cls.id)} onChange={() => toggleTarget(cls.id)} />
                        <div>
                           <div className="text-sm font-bold text-[#003366]">{cls.name}</div>
                           <div className="text-xs text-slate-500">{cls.schedule}</div>
                        </div>
                     </label>
                   ))}
                   {classes.length === 0 && <p className="text-center text-slate-400 py-4">Chưa có lớp học nào.</p>}
                </div>
              )}

              {targetType === 'date' && (
                <div className="grid grid-cols-2 gap-2 animate-fade-in-up">
                   {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(day => (
                     <label key={day} className={`flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all ${selectedTargets.includes(day) ? 'bg-blue-50 border-[#003366] text-[#003366] font-bold' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                        <input type="checkbox" className="hidden" checked={selectedTargets.includes(day)} onChange={() => toggleTarget(day)} />
                        {day === 'CN' ? 'Chủ Nhật' : `Thứ ${day.replace('T', '')}`}
                     </label>
                   ))}
                </div>
              )}
           </div>
        </div>
      </div>

      <div className="flex justify-end mt-6 pt-4 border-t border-slate-100">
         <button onClick={handlePost} className="bg-[#003366] text-white px-8 py-3 rounded-xl font-bold shadow-md hover:bg-[#002244] hover:shadow-lg transition-all flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
            Đăng Thông Báo
         </button>
      </div>
    </div>
  );
};
export default Notifications;