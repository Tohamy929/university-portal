"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle, faCheckCircle, faLock, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { DEPARTMENT_DATA } from "@/src/data/studentdata";

export default function StudentGrades() {
  const { id } = useParams();
  const [courseName, setCourseName] = useState<string>("Course");
  
  // Get course data from centralized source
  useEffect(() => {
    const userDept = localStorage.getItem("userDept") || "Electrical";
    const departmentData = DEPARTMENT_DATA[userDept];
    const course = departmentData?.courses.find(c => c.id === id);
    if (course) {
      setCourseName(course.name);
    }
  }, [id]);
  
  const attendanceStats = { missed: 4, limit: 4 }; 
  const isProhibited = attendanceStats.missed >= attendanceStats.limit;

  const assessments = [
    { name: "Attendance Grade", score: isProhibited ? 0 : 10, max: 10, status: "Auto-calculated" },
    { name: "Quiz 1", score: 18, max: 20, status: "Graded" },
    { name: "Midterm Exam", score: null, max: 20, status: "To be reviewed" },
    { name: "Final Exam", score: null, max: 40, status: isProhibited ? "Prohibited" : "Upcoming" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {isProhibited && (
        <div className="bg-red-600 text-white p-6 rounded-[2rem] shadow-xl flex items-center gap-6 border-4 border-red-500 animate-pulse">
          <div className="text-4xl"><FontAwesomeIcon icon={faExclamationTriangle} /></div>
          <div>
            <h2 className="text-xl font-black uppercase italic">Academic Restriction</h2>
            <p className="text-sm font-medium opacity-90">You have exceeded the absence limit (4 sessions). You are barred from the final exam and attendance marks are forfeited.</p>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {assessments.map((item, idx) => (
          <div key={idx} className={`bg-white p-8 rounded-3xl border flex items-center justify-between shadow-sm ${item.status === 'Prohibited' ? 'border-red-200 grayscale' : 'border-gray-50'}`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${
                item.status === 'Prohibited' ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-900'
              }`}>
                <FontAwesomeIcon icon={item.status === 'Prohibited' ? faLock : faCheckCircle} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.status}</p>
              </div>
            </div>

            <div className="text-right">
              {item.score !== null ? (
                <p className="text-3xl font-black text-blue-900">{item.score}<span className="text-sm text-gray-300">/{item.max}</span></p>
              ) : (
                <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase ${
                  item.status === 'Prohibited' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-400'
                }`}>
                  {item.status}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex gap-4">
        <FontAwesomeIcon icon={faInfoCircle} className="text-blue-900 mt-1" />
        <p className="text-xs text-blue-900 leading-relaxed italic">
          Final grades are subject to review by the department head. Attendance grades are calculated based on the 14-week session reports.
        </p>
      </div>
    </div>
  );
}