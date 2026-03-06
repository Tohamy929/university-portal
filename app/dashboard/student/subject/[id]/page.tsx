"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faExclamationTriangle, faBan, faChevronRight, 
  faClock, faBookOpen, faBullhorn, faImage, faFilePdf 
} from "@fortawesome/free-solid-svg-icons";
import { DEPARTMENT_DATA } from "@/src/data/studentdata";

export default function StudentSubjectHome() {
  const { id } = useParams();
  const [courseInfo, setCourseInfo] = useState<any>(null);
  const missedCount = 3;

  // Get course info from centralized data
  useEffect(() => {
    const userDept = localStorage.getItem("userDept") || "Electrical";
    const departmentData = DEPARTMENT_DATA[userDept];
    const course = departmentData?.courses.find(c => c.id === id);
    setCourseInfo(course);
  }, [id]);

  const announcements = [
    { 
      id: 1, 
      text: "Please find the attached syllabus for the Microwave Engineering lab. We will begin experiments next week.", 
      date: "2 days ago",
      file: { name: "Lab_Syllabus.pdf", type: "pdf", url: "#" }
    },
    { 
      id: 2, 
      text: "The lecture scheduled for tomorrow has been moved to Room 402.", 
      date: "5 hours ago",
      file: null
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700">
      
     
      {missedCount >= 4 ? (
        <div className="bg-red-600 text-white p-6 rounded-[2rem] shadow-xl flex items-center gap-6 animate-pulse">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">
            <FontAwesomeIcon icon={faBan} />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">Academic Restriction</h2>
            <p className="text-red-100 font-medium">You have exceeded 4 absences. You are prohibited from the {id} final exam.</p>
          </div>
        </div>
      ) : missedCount === 3 ? (
        <div className="bg-orange-500 text-white p-6 rounded-[2rem] shadow-xl flex items-center gap-6">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">
            <FontAwesomeIcon icon={faExclamationTriangle} />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">Attendance Warning</h2>
            <p className="text-orange-100 font-medium">You have 3 absences. One more will result in a final exam prohibition.</p>
          </div>
        </div>
      ) : null}

      <header>
        <h1 className="text-4xl font-black text-gray-900 uppercase italic leading-none">{id}</h1>
        <p className="text-gray-500 font-medium mt-2">Latest updates and your current academic standing.</p>
      </header>

     
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Absences</p>
            <p className={`text-5xl font-black ${missedCount >= 4 ? 'text-red-600' : 'text-gray-900'}`}>{missedCount}</p>
          </div>
          <Link href={`/dashboard/student/subject/${id}/attendance`} className="text-[10px] font-black uppercase text-blue-900 hover:underline mt-6 flex items-center gap-2">
            View Attendance Log <FontAwesomeIcon icon={faChevronRight} />
          </Link>
        </div>
        
        <Link href={`/dashboard/student/subject/${id}/materials`} className="bg-blue-900 p-8 rounded-[2.5rem] text-white shadow-lg flex flex-col justify-between group hover:scale-[1.02] transition-all">
          <div className="flex justify-between items-start">
            <FontAwesomeIcon icon={faBookOpen} className="text-2xl text-blue-300 group-hover:rotate-12 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-300">Materials</span>
          </div>
          <div className="mt-8">
            <p className="text-2xl font-bold mb-2">Lecture Slides & Sheets</p>
            <p className="text-xs font-black uppercase text-blue-300 group-hover:text-white transition-colors flex items-center gap-2">
              Browse Files <FontAwesomeIcon icon={faChevronRight} />
            </p>
          </div>
        </Link>
      </div>

      
      <section className="space-y-6">
        <h3 className="font-black text-gray-400 text-[10px] uppercase tracking-[0.2em] ml-4">Recent Broadcasts</h3>
        <div className="space-y-4">
          {announcements.map((ann) => (
            <div key={ann.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex gap-6">
                <div className="w-12 h-12 bg-blue-50 text-blue-900 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl">
                  <FontAwesomeIcon icon={faBullhorn} />
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 font-medium leading-relaxed mb-4">{ann.text}</p>
                  
                 
                  {ann.file && (
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 inline-flex items-center gap-3">
                      <FontAwesomeIcon icon={ann.file.type === "image" ? faImage : faFilePdf} className="text-gray-400" />
                      <span className="text-xs font-bold text-gray-600">{ann.file.name}</span>
                      <a 
                        href={ann.file.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="ml-4 text-[10px] font-black uppercase text-blue-900 hover:underline"
                      >
                        Download
                      </a>
                    </div>
                  )}

                  <p className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-2 mt-6">
                    <FontAwesomeIcon icon={faClock} /> {ann.date}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}