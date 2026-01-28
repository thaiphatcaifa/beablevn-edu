import React from 'react';
import { Link } from 'react-router-dom';

const MyAttendance = () => {
  // Demo link check-out
  const checkOutLink = "https://forms.google.com/example-checkout"; 

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Thẻ Quá trình (Điểm danh)</h2>
      
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded mb-6">
        <h3 className="font-bold text-yellow-800 mb-2">Check-out cuối giờ</h3>
        <p className="text-sm mb-3">Vui lòng bấm vào link dưới đây để xác nhận hoàn thành buổi học:</p>
        <a href={checkOutLink} target="_blank" rel="noreferrer" className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 inline-block">
          🔗 Link Check-out
        </a>
      </div>

      <h3 className="font-bold mb-3">Lịch sử chuyên cần</h3>
      <div className="overflow-hidden rounded border">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Ngày</th>
              <th className="p-3">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="p-3">20/10/2023</td><td className="p-3 text-green-600 font-bold">Có mặt</td></tr>
            <tr className="border-b"><td className="p-3">22/10/2023</td><td className="p-3 text-green-600 font-bold">Có mặt</td></tr>
            <tr className="border-b"><td className="p-3">24/10/2023</td><td className="p-3 text-red-500 font-bold">Vắng (Có phép)</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default MyAttendance;