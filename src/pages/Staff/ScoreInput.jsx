import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { ref, onValue, push, set } from "firebase/database";
import { useAuth } from '../../context/AuthContext';

const ScoreInput = () => {
  const { currentUser } = useAuth();
  
  // States cho phần Nhập điểm
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  
  const TABS = [
    { id: 'bonus', label: '1. Điểm Bonus' },
    { id: 'assignment', label: '2. Assignment' },
    { id: 'formative', label: '3. Formative Assessment' },
    { id: 'summative', label: '4. Summative Assessment' }
  ];
  const [activeTab, setActiveTab] = useState('bonus');

  const [commonInput, setCommonInput] = useState({
    date: new Date().toISOString().split('T')[0],
    content: '',
    examType: 'MMT'
  });

  const [studentScores, setStudentScores] = useState({});
  const [loading, setLoading] = useState(false);

  // States cho phần Tổng kết & Lịch sử
  const [classScores, setClassScores] = useState({});
  const [selectedStudentForView, setSelectedStudentForView] = useState('');

  // 1. Lấy danh sách lớp được phân công
  useEffect(() => {
    if (!currentUser) return;

    onValue(ref(db, 'classes'), (snap) => {
      const data = snap.val();
      if (data) {
        const list = Object.entries(data).map(([id, val]) => ({ id, ...val }));
        const assigned = currentUser.assignedClasses || [];
        const filteredList = currentUser.role === 'admin' 
            ? list 
            : list.filter(c => assigned.includes(c.id));
            
        setClasses(filteredList);
      }
    });
  }, [currentUser]);

  // 2. Lấy danh sách học viên và Điểm của lớp khi chọn lớp
  useEffect(() => {
    if (!selectedClass) {
        setStudents([]);
        setClassScores({});
        setSelectedStudentForView('');
        return;
    }

    // Lấy học viên
    const usersRef = ref(db, 'users');
    onValue(usersRef, (snap) => {
      const data = snap.val();
      if (data) {
        const list = Object.entries(data)
          .map(([id, val]) => ({ id, ...val }))
          .filter(u => u.role === 'student' && u.classIds && u.classIds.includes(selectedClass));
        setStudents(list);
        
        // Tự động chọn học viên đầu tiên cho phần View nếu chưa chọn
        if (list.length > 0 && !selectedStudentForView) {
            setSelectedStudentForView(list[0].id);
        }
      }
    });

    // Lấy toàn bộ điểm của lớp để phục vụ phần View & Xếp hạng
    const scoresRef = ref(db, `scores/${selectedClass}`);
    onValue(scoresRef, (snap) => {
        setClassScores(snap.val() || {});
    });

    setStudentScores({});
  }, [selectedClass]); // eslint-disable-next-line react-hooks/exhaustive-deps

  // Xử lý nhập điểm
  const handleScoreChange = (studentId, value) => {
    setStudentScores(prev => ({ ...prev, [studentId]: value }));
  };

  // Lưu điểm
  const handleSave = async (student) => {
    const scoreVal = studentScores[student.id];
    if (!scoreVal) return alert(`Chưa nhập điểm cho ${student.name}`);
    if (!commonInput.content) return alert("Vui lòng nhập 'Nội dung ghi nhận'");

    if (!window.confirm(`Xác nhận lưu điểm cho ${student.name}?`)) return;

    setLoading(true);
    try {
      const newScoreRef = push(ref(db, `scores/${selectedClass}/${student.id}/${activeTab}`));
      
      const payload = {
        score: scoreVal,
        date: commonInput.date,
        content: commonInput.content,
        timestamp: new Date().toISOString()
      };

      if (activeTab === 'summative') {
        payload.examType = commonInput.examType;
      }

      await set(newScoreRef, payload);
      alert(`✅ Đã lưu thành công cho ${student.name}!`);
      
      setStudentScores(prev => {
        const newState = { ...prev };
        delete newState[student.id];
        return newState;
      });

    } catch (error) {
      alert("Lỗi: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIC PHẦN TỔNG KẾT & XẾP HẠNG (CẬP NHẬT TỈ TRỌNG) ---
  const getRankInfo = () => {
    if (!students.length) return null;

    // Tính tổng điểm (GPA) cho tất cả học viên trong lớp theo công thức trọng số
    const totals = students.map(s => {
        const sData = classScores[s.id] || {};
        
        // Hàm tính điểm trung bình của một mảng các điểm
        const getAvg = (recordsObj) => {
            const vals = Object.values(recordsObj || {}).map(r => Number(r.score) || 0);
            return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
        };

        // 1. Assignment (10%)
        const assAvg = getAvg(sData['assignment']);
        
        // 2. Formative Assessment (20%)
        const formAvg = getAvg(sData['formative']);
        
        // 3. Summative Assessment (MMT 30%, EOMT 40%)
        const summativeRecords = Object.values(sData['summative'] || {});
        
        const mmtVals = summativeRecords.filter(r => r.examType === 'MMT').map(r => Number(r.score) || 0);
        const mmtAvg = mmtVals.length ? mmtVals.reduce((a, b) => a + b, 0) / mmtVals.length : 0;
        
        const eomtVals = summativeRecords.filter(r => r.examType === 'EOMT').map(r => Number(r.score) || 0);
        const eomtAvg = eomtVals.length ? eomtVals.reduce((a, b) => a + b, 0) / eomtVals.length : 0;

        // Tính tổng điểm tích lũy
        // Điểm Bonus không tính vào hệ số xếp hạng chung theo yêu cầu.
        const weightedScore = (assAvg * 0.10) + (formAvg * 0.20) + (mmtAvg * 0.30) + (eomtAvg * 0.40);

        return { id: s.id, score: weightedScore };
    });

    // Sắp xếp giảm dần theo tổng điểm tích lũy
    totals.sort((a, b) => b.score - a.score);

    // Tìm thứ hạng của học viên đang chọn
    const rankIndex = totals.findIndex(t => t.id === selectedStudentForView);
    if (rankIndex === -1) return null;

    return {
        rank: rankIndex + 1,
        totalStudents: students.length,
        totalScore: totals[rankIndex].score.toFixed(2) // Làm tròn 2 chữ số thập phân
    };
  };

  const rankInfo = selectedStudentForView ? getRankInfo() : null;
  const currentStudentScores = classScores[selectedStudentForView] || {};

  // Component render từng cột lịch sử
  const renderHistoryColumn = (catKey, label, colorClass) => {
    const recordsObj = currentStudentScores[catKey] || {};
    const records = Object.entries(recordsObj)
        .map(([id, val]) => ({ id, ...val }))
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    const total = records.reduce((sum, r) => sum + (Number(r.score) || 0), 0);
    const avg = records.length ? (total / records.length).toFixed(1) : 0;
    
    // Bonus tính tổng, các cột khác tính trung bình
    const summaryText = catKey === 'bonus' ? `Tổng: ${total}` : `TB: ${avg}`;

    return (
        <div className={`p-4 rounded-xl border flex flex-col h-full ${colorClass}`}>
            <div className="flex justify-between items-center mb-3 pb-3 border-b border-black/5">
                <h4 className="font-bold text-sm leading-tight pr-2">{label}</h4>
                <span className="text-xs font-bold bg-white/70 px-2 py-1 rounded shadow-sm whitespace-nowrap text-slate-800">{summaryText}</span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2 max-h-[300px] pr-1">
                {records.length > 0 ? records.map(r => (
                    <div key={r.id} className="bg-white/80 p-3 rounded-lg shadow-sm text-xs transition-all hover:bg-white">
                        <div className="flex justify-between font-bold text-[#003366] mb-1.5">
                            <span className="text-sm">{r.score} điểm</span>
                            <span className="text-slate-500 font-mono font-medium">{new Date(r.date).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <p className="text-slate-600 line-clamp-2 leading-relaxed">{r.content}</p>
                        {r.examType && (
                            <span className="inline-block mt-2 bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">
                                {r.examType}
                            </span>
                        )}
                    </div>
                )) : (
                    <div className="text-center text-xs text-slate-400 italic py-6 opacity-80">Chưa có dữ liệu</div>
                )}
            </div>
        </div>
    );
  };

  return (
    <div className="space-y-6 pb-20 mt-16 md:mt-0 animate-fade-in-up">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
         <div className="p-2 bg-blue-50 rounded-lg text-[#003366]">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
         </div>
         <h2 className="text-xl md:text-2xl font-bold text-[#003366]">Nhập Điểm Chi Tiết</h2>
      </div>

      {/* --- KHU VỰC CHỌN LỚP --- */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Chọn Lớp học (Được phân công)</label>
          <select 
              className="w-full md:w-1/2 p-2.5 border border-slate-300 rounded-lg outline-none focus:border-[#003366] font-medium"
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
          >
              <option value="">-- Chọn lớp --</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {classes.length === 0 && <p className="text-xs text-red-500 mt-2">Bạn chưa được phân công lớp nào.</p>}
      </div>

      {selectedClass && (
        <>
            {/* --- KHU VỰC NHẬP ĐIỂM --- */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* TABS HEADER */}
                <div className="flex border-b border-slate-200 bg-slate-50 overflow-x-auto custom-scrollbar">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-4 text-sm font-bold whitespace-nowrap transition-all ${
                                activeTab === tab.id 
                                ? 'bg-white text-[#003366] border-t-2 border-t-[#003366]' 
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* FORM THÔNG TIN CHUNG */}
                <div className="p-5 bg-blue-50/50 border-b border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-3">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ngày ghi nhận</label>
                        <input 
                            type="date" 
                            className="w-full p-2 border border-slate-300 rounded outline-none focus:border-[#003366]"
                            value={commonInput.date}
                            onChange={e => setCommonInput({...commonInput, date: e.target.value})}
                        />
                    </div>
                    
                    {activeTab === 'summative' && (
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kỳ thi</label>
                            <select 
                                className="w-full p-2 border border-slate-300 rounded outline-none focus:border-[#003366] font-bold text-[#003366]"
                                value={commonInput.examType}
                                onChange={e => setCommonInput({...commonInput, examType: e.target.value})}
                            >
                                <option value="MMT">MMT</option>
                                <option value="EOMT">EOMT</option>
                            </select>
                        </div>
                    )}

                    <div className={activeTab === 'summative' ? "md:col-span-7" : "md:col-span-9"}>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nội dung ghi nhận (Bắt buộc)</label>
                        <input 
                            type="text" 
                            placeholder="VD: Làm bài tập về nhà đầy đủ..."
                            className="w-full p-2 border border-slate-300 rounded outline-none focus:border-[#003366]"
                            value={commonInput.content}
                            onChange={e => setCommonInput({...commonInput, content: e.target.value})}
                        />
                    </div>
                </div>
                
                {/* DANH SÁCH BẢNG ĐIỂM */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white text-slate-500 uppercase text-xs font-bold border-b border-slate-100">
                            <tr>
                                <th className="p-4 w-10">#</th>
                                <th className="p-4">Học Viên</th>
                                <th className="p-4 w-32 text-center">Điểm số</th>
                                <th className="p-4 w-32 text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {students.map((st, index) => (
                                <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4 text-slate-400">{index + 1}</td>
                                    <td className="p-4">
                                        <div className="font-bold text-[#003366]">{st.name}</div>
                                        <div className="text-xs text-slate-400">{st.studentCode}</div>
                                    </td>
                                    <td className="p-4">
                                        <input 
                                            type="number" 
                                            className="w-full text-center p-2 border border-slate-300 rounded focus:border-[#003366] focus:ring-1 focus:ring-[#003366] outline-none font-bold text-lg"
                                            placeholder="0-10"
                                            value={studentScores[st.id] || ''}
                                            onChange={(e) => handleScoreChange(st.id, e.target.value)}
                                        />
                                    </td>
                                    <td className="p-4 text-center">
                                        <button 
                                            onClick={() => handleSave(st)}
                                            disabled={loading || !studentScores[st.id]}
                                            className={`px-4 py-2 rounded text-xs font-bold transition-all shadow-sm ${
                                                studentScores[st.id] 
                                                ? 'bg-[#003366] text-white hover:bg-[#002244]' 
                                                : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                            }`}
                                        >
                                            Lưu
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {students.length === 0 && (
                                <tr><td colSpan="4" className="p-8 text-center text-slate-400 italic">Lớp này chưa có học viên nào.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- KHU VỰC MỚI: TỔNG KẾT & LỊCH SỬ HỌC VIÊN --- */}
            <div className="bg-white p-5 md:p-6 rounded-xl border border-slate-200 shadow-sm mt-8">
                <h2 className="text-lg font-bold text-[#003366] mb-5 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
                    Tổng kết & Lịch sử học viên
                </h2>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-5 mb-6">
                    <div className="w-full md:w-1/3">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Lọc xem theo học viên</label>
                        <select 
                            className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:border-[#003366] font-medium bg-white"
                            value={selectedStudentForView}
                            onChange={e => setSelectedStudentForView(e.target.value)}
                        >
                            <option value="">-- Chọn học viên --</option>
                            {students.map(st => <option key={st.id} value={st.id}>{st.name} - {st.studentCode}</option>)}
                        </select>
                    </div>

                    {/* Hiển thị xếp hạng dựa trên tổng điểm trọng số */}
                    {selectedStudentForView && rankInfo && (
                        <div className="flex gap-4 md:gap-8 bg-white px-5 py-3 rounded-lg border border-slate-200 shadow-sm w-full md:w-auto">
                            <div className="text-center pr-4 md:pr-8 border-r border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1" title="Assignment(10%) + Formative(20%) + MMT(30%) + EOMT(40%)">Điểm Tổng Kết (Hệ số)</p>
                                <p className="text-2xl font-black text-[#003366]">{rankInfo.totalScore}</p>
                            </div>
                            <div className="text-center pr-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Xếp hạng trong lớp</p>
                                <p className="text-2xl font-black text-emerald-600">#{rankInfo.rank} <span className="text-sm font-bold text-slate-400">/ {rankInfo.totalStudents}</span></p>
                            </div>
                        </div>
                    )}
                </div>

                {selectedStudentForView ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        {renderHistoryColumn('bonus', '1. Điểm Bonus', 'bg-yellow-50 border-yellow-200 text-yellow-900')}
                        {renderHistoryColumn('assignment', '2. Assignment', 'bg-green-50 border-green-200 text-green-900')}
                        {renderHistoryColumn('formative', '3. Formative', 'bg-blue-50 border-blue-200 text-blue-900')}
                        {renderHistoryColumn('summative', '4. Summative', 'bg-purple-50 border-purple-200 text-purple-900')}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-300">
                        <p className="text-slate-400 font-medium">Vui lòng chọn học viên ở mục trên để xem chi tiết lịch sử và xếp hạng.</p>
                    </div>
                )}
            </div>
        </>
      )}
    </div>
  );
};

export default ScoreInput;