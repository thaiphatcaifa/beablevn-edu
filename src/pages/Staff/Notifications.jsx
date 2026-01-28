import React, { useState } from 'react';
import { db } from '../../firebase';
import { ref, push } from "firebase/database";

const Notifications = () => {
  const [content, setContent] = useState('');

  const handlePost = () => {
    if(!content) return;
    push(ref(db, 'notifications'), {
      content,
      date: new Date().toLocaleDateString('vi-VN'),
      type: 'general'
    });
    setContent('');
    alert('Đã đăng thông báo!');
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Đăng Thông Báo Mới</h2>
      <textarea 
        className="w-full border p-3 rounded h-32 mb-4"
        placeholder="Nhập nội dung thông báo cho học viên..."
        value={content}
        onChange={e => setContent(e.target.value)}
      />
      <button onClick={handlePost} className="bg-blue-600 text-white px-6 py-2 rounded">Đăng bài</button>
    </div>
  );
};
export default Notifications;