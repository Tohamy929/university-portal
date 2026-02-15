"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGraduationCap, faExclamationTriangle, faBookOpen } from "@fortawesome/free-solid-svg-icons";
import { DEPARTMENT_DATA, MOCK_TERM_STATS } from "@/lib/studentData";

export default function StudentLaunchpad() {
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    const dept = localStorage.getItem("userDept") || "Electrical";
   
    setCourses(DEPARTMENT_DATA[dept]?.courses || []);
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-10">
     

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <FontAwesomeIcon icon={faBookOpen} className="text-blue-900" />
          My Subjects
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
           
            const isAtRisk = course.attendanceRate && course.attendanceRate < 75;

            return (
              <div 
                key={course.id}
                onClick={() => router.push(`/dashboard/student/subject/${course.id}`)}
                className={`bg-white p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer group relative overflow-hidden ${
                  isAtRisk ? 'border-red-100 hover:border-red-500 shadow-red-50' : 'border-gray-50 hover:border-blue-900 shadow-sm'
                }`}
              >
               
                {isAtRisk && (
                  <div className="absolute top-0 right-0 bg-red-600 text-white px-4 py-1 rounded-bl-2xl flex items-center gap-2 animate-pulse">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-[10px]" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Attendance Warning</span>
                  </div>
                )}

                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-colors ${
                  isAtRisk ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-900 group-hover:bg-blue-900 group-hover:text-white'
                }`}>
                  <FontAwesomeIcon icon={faGraduationCap} size="lg" />
                </div>

                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{course.id}</span>
                <h3 className={`text-xl font-bold mt-1 mb-4 ${isAtRisk ? 'text-red-900' : 'text-gray-900'}`}>
                  {course.name}
                </h3>
                
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-50">
                  <span className="text-xs font-bold text-gray-400">Attendance</span>
                  <span className={`text-sm font-black ${isAtRisk ? 'text-red-600' : 'text-blue-900'}`}>
                    {course.attendanceRate || 100}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}