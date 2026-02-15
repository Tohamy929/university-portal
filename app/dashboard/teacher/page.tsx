"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DEPARTMENT_DATA } from "@/lib/studentData";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faMapMarkerAlt, faSpinner, faArrowRight } from "@fortawesome/free-solid-svg-icons";

export default function TeacherOverview() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const dept = localStorage.getItem("userDept") || "Electrical";
    setData(DEPARTMENT_DATA[dept]);
    setLoading(false);
  }, []);

  if (loading) return <div className="flex h-screen items-center justify-center"><FontAwesomeIcon icon={faSpinner} spin size="2xl" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
      {/* Weekly Schedule Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.teacherOverview?.weeklySchedule?.map((lec: any, idx: number) => (
          <div key={idx} className="p-6 rounded-3xl border border-gray-100 bg-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-blue-900 text-white flex items-center justify-center">
                 <FontAwesomeIcon icon={faClock} />
               </div>
               <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{lec.day} • {lec.type}</p>
                 <h3 className="font-bold text-gray-900">{lec.id} - {lec.time}</h3>
                 <p className="text-sm text-gray-500"><FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1"/> {lec.location}</p>
               </div>
            </div>
          </div>
        ))}
      </section>

      {/* Subject Cards (No Tags) */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">My Subjects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.courses.map((course: any) => (
            <div 
              key={course.id} 
              onClick={() => router.push(`/dashboard/teacher/subject/${course.id}/attendance`)}
              className="bg-white p-8 rounded-[2.5rem] border border-gray-100 cursor-pointer hover:border-blue-900 hover:shadow-xl transition-all group"
            >
              <span className="text-[10px] font-black text-blue-900 bg-blue-50 px-3 py-1 rounded-full uppercase">{course.id}</span>
              <h3 className="text-xl font-bold text-gray-900 mt-4 mb-2">{course.name}</h3>
              <p className="text-xs text-gray-400 font-bold italic mb-6">{course.schedule}</p>
              <div className="flex items-center gap-2 text-blue-900 font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                Manage Subject <FontAwesomeIcon icon={faArrowRight} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}