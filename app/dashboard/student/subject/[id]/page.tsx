"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faBullhorn, faClock, faExclamationTriangle, faInfoCircle, 
  faArrowRight, faCalendarCheck, faUserGraduate 
} from "@fortawesome/free-solid-svg-icons";
import { DEPARTMENT_DATA } from "@/lib/studentData";

export default function StudentSubjectOverview() {
  const { id } = useParams();
  const [subjectData, setSubjectData] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);

  useEffect(() => {
    const dept = localStorage.getItem("userDept") || "Electrical";
    const currentDept = DEPARTMENT_DATA[dept];
    
  
    const course = currentDept?.courses.find((c: any) => c.id === id);
    setSubjectData(course);

    
    const subjectAssignments = currentDept?.assignments.filter(
      (a: any) => a.courseId === id && a.status === "pending"
    );
    setAssignments(subjectAssignments || []);
  }, [id]);

  if (!subjectData) return <div className="p-10 text-center animate-pulse">Loading Subject Data...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
     
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-900 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
              {subjectData.id}
            </span>
            <span className="text-gray-400 text-xs font-bold italic">Spring Term 2026</span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">{subjectData.name}</h1>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-50 text-blue-900 rounded-xl flex items-center justify-center">
            <FontAwesomeIcon icon={faCalendarCheck} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase">Next Lecture</p>
            <p className="text-sm font-bold text-gray-800">{subjectData.schedule}</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
       
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <FontAwesomeIcon icon={faBullhorn} className="text-blue-900" />
                Latest Announcements
              </h2>
            </div>
            
            <div className="bg-white p-8 rounded-[2.5rem] border-l-8 border-l-blue-900 border border-gray-100 shadow-sm relative group transition-all hover:shadow-md">
              <div className="relative z-10">
                <p className="text-gray-700 font-medium leading-relaxed italic text-lg">
                  "The lecture notes for Chapter 4 have been uploaded. Please review the antenna gain calculations before next Monday's session."
                </p>
                <div className="mt-6 flex items-center gap-3 border-t border-gray-50 pt-4">
                  <div className="w-8 h-8 bg-blue-100 text-blue-900 rounded-full flex items-center justify-center text-xs font-black">
                    <FontAwesomeIcon icon={faUserGraduate} />
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Posted by Course Instructor • Today at 09:45 AM
                  </span>
                </div>
              </div>
            </div>
          </section>

         
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex items-center gap-4">
              <FontAwesomeIcon icon={faInfoCircle} className="text-blue-900 text-xl" />
              <p className="text-xs text-blue-900 font-medium leading-relaxed">
                You have {subjectData.materialsCount} new files available in the <strong>Course Materials</strong> section.
              </p>
            </div>
          </div>
        </div>

        
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
            <FontAwesomeIcon icon={faClock} className="text-red-600" />
            Urgent Tasks
          </h2>

          <div className="space-y-4">
            {assignments.length > 0 ? (
              assignments.map((asm) => (
                <div key={asm.id} className="bg-white p-6 rounded-3xl border border-red-100 shadow-sm group">
                  <div className="flex items-start gap-3 mb-4">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 mt-1" />
                    <div>
                      <h4 className="font-bold text-gray-800 leading-tight">{asm.title}</h4>
                      <p className="text-[10px] font-black text-red-500 uppercase mt-1">Deadline: {asm.deadline}</p>
                    </div>
                  </div>
                  <button className="w-full py-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2">
                    Submit Now <FontAwesomeIcon icon={faArrowRight} />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-3xl">
                <p className="text-gray-400 text-sm italic">All assignments are up to date.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}