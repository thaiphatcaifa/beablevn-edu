import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebase';
import { ref, onValue } from "firebase/database";

const CourseDetail = () => {
  const { id } = useParams(); // Lấy ID khóa học từ URL
  const [course, setCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hàm xử lý link Youtube để nhúng vào iframe
  const getEmbedUrl = (url) => {
    if (!url) return "";
    // Chuyển link watch?v= thành embed/
    const videoIdMatch = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/user\/\S+|\/ytscreeningroom\?v=))([\w\-]{10,12})\b/);
    return videoIdMatch ? `https://www.youtube.com/embed/${videoIdMatch[1]}?autoplay=1` : url;
  };

  useEffect(() => {
    const courseRef = ref(db, `courses/${id}`);
    
    const unsubscribe = onValue(courseRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCourse(data);
        // Nếu chưa chọn bài nào, mặc định chọn bài đầu tiên
        if (!activeLesson && data.lessons) {
          const firstLessonKey = Object.keys(data.lessons)[0];
          setActiveLesson(data.lessons[firstLessonKey]);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  if (loading) return <div className="h-screen flex items-center justify-center text-gray-500">Đang tải bài học...</div>;
  if (!course) return <div className="h-screen flex items-center justify-center text-red-500">Không tìm thấy khóa học!</div>;

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-white overflow-hidden">
      
      {/* --- KHUNG TRÁI: PLAYER & NỘI DUNG (Chiếm phần lớn màn hình) --- */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto bg-gray-50">
        {/* Nút Back Mobile */}
        <div className="lg:hidden p-4 bg-white border-b">
           <Link to="/learning" className="flex items-center text-gray-600 hover:text-blue-600">
             <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
             Quay lại
           </Link>
        </div>

        <div className="w-full max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
          {activeLesson ? (
            <div className="space-y-6">
              {/* Video Player Container */}
              <div className="relative pt-[56.25%] bg-black rounded-xl shadow-lg overflow-hidden border border-gray-800">
                {activeLesson.videoUrl ? (
                  <iframe 
                    className="absolute top-0 left-0 w-full h-full"
                    src={getEmbedUrl(activeLesson.videoUrl)} 
                    title={activeLesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-gray-400">
                    Bài học này không có video
                  </div>
                )}
              </div>

              {/* Lesson Info */}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{activeLesson.title}</h1>
                <p className="mt-4 text-gray-600 leading-relaxed whitespace-pre-line">
                  {activeLesson.content || course.description}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center mt-20 text-gray-400">
              Vui lòng chọn một bài học từ danh sách bên phải
            </div>
          )}
        </div>
      </div>

      {/* --- KHUNG PHẢI: DANH SÁCH BÀI HỌC (SIDEBAR) --- */}
      <div className="w-full lg:w-96 bg-white border-l border-gray-200 flex flex-col h-[40vh] lg:h-auto shadow-xl z-10">
        {/* Sidebar Header */}
        <div className="p-5 border-b border-gray-100 bg-white">
          <Link to="/learning" className="hidden lg:flex items-center text-sm text-gray-500 hover:text-blue-600 mb-3 transition-colors">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Danh sách khóa học
          </Link>
          <h2 className="font-bold text-gray-800 line-clamp-2">{course.title}</h2>
          <div className="flex items-center mt-2 text-xs text-gray-500">
            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded mr-2">
              {course.lessons ? Object.keys(course.lessons).length : 0} bài học
            </span>
            <span>{course.duration}</span>
          </div>
        </div>

        {/* Lesson List Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <ul className="divide-y divide-gray-50">
            {course.lessons && Object.entries(course.lessons).map(([key, lesson], index) => {
              const isActive = activeLesson?.title === lesson.title;
              return (
                <li 
                  key={key}
                  onClick={() => setActiveLesson(lesson)}
                  className={`group p-4 cursor-pointer transition-all duration-200 border-l-4 ${
                    isActive 
                      ? 'bg-blue-50 border-blue-600' 
                      : 'hover:bg-gray-50 border-transparent hover:border-gray-300'
                  }`}
                >
                  <div className="flex gap-3 items-start">
                    <div className={`flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-xs font-bold mt-0.5 ${
                      isActive ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <h4 className={`text-sm font-medium leading-snug ${
                        isActive ? 'text-blue-700' : 'text-gray-700 group-hover:text-gray-900'
                      }`}>
                        {lesson.title}
                      </h4>
                      <div className="flex items-center mt-1.5 text-xs text-gray-400">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>
                        Video Bài giảng
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

    </div>
  );
};

export default CourseDetail;