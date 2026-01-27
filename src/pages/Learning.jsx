import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; // Đảm bảo đường dẫn đúng tới file firebase.js
import { ref, onValue } from "firebase/database";
import { Link } from 'react-router-dom';

const Learning = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const coursesRef = ref(db, 'courses');
    
    // Lắng nghe dữ liệu thay đổi từ Firebase
    const unsubscribe = onValue(coursesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Chuyển đổi Object của Firebase thành Array để dùng map()
        const courseList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setCourses(courseList);
      } else {
        setCourses([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-blue-600 font-semibold animate-pulse">Đang tải danh sách khóa học...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-900">Trung tâm Đào tạo</h1>
          <p className="text-gray-500 mt-2">Nâng cao kỹ năng chuyên môn và văn hóa doanh nghiệp</p>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">Chưa có khóa học nào được đăng tải.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col h-full">
                {/* Thumbnail */}
                <div className="relative h-48 bg-gray-200 group">
                  <img 
                    src={course.thumbnail || 'https://via.placeholder.com/400x250?text=No+Image'} 
                    alt={course.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {e.target.src = 'https://via.placeholder.com/400x250?text=Error'}} 
                  />
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
                    {course.duration || 'N/A'}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2" title={course.title}>
                    {course.title}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-3 flex-1">
                    {course.description || "Không có mô tả"}
                  </p>
                  
                  <div className="mt-auto pt-4 border-t border-gray-100">
                    <Link 
                      to={`/learning/${course.id}`}
                      className="block w-full text-center bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium py-2.5 rounded-lg transition-colors"
                    >
                      Bắt đầu học ngay
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Learning;