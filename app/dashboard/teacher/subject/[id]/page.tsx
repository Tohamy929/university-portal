"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUsers, faFileSignature, faExclamationCircle, faArrowRight, 
  faChartPie, faTimes, faUserGraduate, faIdBadge, faChevronRight, faFileAlt
} from "@fortawesome/free-solid-svg-icons";

export default function TeacherSubjectHome() {
  const { id } = useParams();
  const router = useRouter();

  // State to handle which list we are viewing: all, prohibited, or ungraded
  const [viewingList, setViewingList] = useState<"all" | "prohibited" | "ungraded" | null>(null);

  // Mock Student Database
  const students = [
    { id: "20210101", name: "Ahmed Ali", group: "Group 1", missed: 1 },
    { id: "20210502", name: "Mona Zaki", group: "Group 1", missed: 4 },
    { id: "20210903", name: "Youssef Sedik", group: "Group 2", missed: 0 },
    { id: "20210888", name: "Sara Hassan", group: "Group 2", missed: 5 },
    { id: "20210777", name: "Karim Walid", group: "Group 1", missed: 2 },
  ];

  // Logic: Focus on Assignments (Sheets) as requested
  const ungradedAssignments = [
    { title: "Assignment 1", count: 15, id: "asm-1" },
    { title: "Assignment 2", count: 42, id: "asm-2" },
    { title: "Lab Report 1", count: 8, id: "asm-3" },
  ];

  const atRiskStudents = students.filter(s => s.missed >= 4);
  const groups = ["Group 1", "Group 2"];

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700">
      <header>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2 uppercase italic">{id} Dashboard</h1>
        <p className="text-gray-500 font-medium">Overview of subject performance and pending actions.</p>
      </header>

     
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={faUsers} 
          label="Enrolled Students" 
          value={students.length} 
          color="blue" 
          onClick={() => setViewingList("all")} 
        />

        <StatCard 
          icon={faFileSignature} 
          label="Ungraded Assignments" 
          value={ungradedAssignments.length} 
          color="orange" 
          onClick={() => setViewingList("ungraded")} 
        />

        <StatCard 
          icon={faExclamationCircle} 
          label="Prohibited Students" 
          value={atRiskStudents.length} 
          color="red" 
          onClick={() => setViewingList("prohibited")} 
          isWarning={atRiskStudents.length > 0}
        />
      </div>

      {/* ATTENDANCE CONTROL */}
      <section className="bg-blue-900 rounded-[3rem] p-10 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold italic">Attendance managment</h2>
          <p className="text-blue-200 max-w-md">Launch AI recognition or manual tracking for Group 1 and Group 2 lectures or sessions.</p>
          <button 
            onClick={() => router.push(`/dashboard/teacher/subject/${id}/attendance`)}
            className="bg-white text-blue-900 px-8 py-4 rounded-2xl font-black shadow-lg hover:bg-blue-50 transition-all flex items-center gap-3"
          >
            Launch Attendance <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>
        <FontAwesomeIcon icon={faChartPie} className="text-8xl opacity-10 rotate-12 hidden lg:block" />
      </section>

      {/* DRILL-DOWN OVERLAY */}
      {viewingList && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-md" onClick={() => setViewingList(null)}></div>
          
          <div className="relative bg-white w-full max-w-3xl max-h-[85vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95">
            <header className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-2xl font-black text-gray-900 uppercase">
                {viewingList === "all" ? "Subject Roster" : viewingList === "prohibited" ? "Restriction List" : "Ungraded Assignments"}
              </h3>
              <button onClick={() => setViewingList(null)} className="w-10 h-10 rounded-full bg-white text-gray-400 hover:text-red-500 shadow-sm border border-gray-100 transition-all">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-8">
              {/* LIST FOR ALL/PROHIBITED STUDENTS */}
              {(viewingList === "all" || viewingList === "prohibited") && groups.map(groupName => {
                const list = (viewingList === "all" ? students : atRiskStudents).filter(s => s.group === groupName);
                if (list.length === 0) return null;
                return (
                  <div key={groupName} className="mb-8 last:mb-0">
                    <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-[0.2em] mb-4 bg-blue-50 w-fit px-3 py-1 rounded-md">{groupName}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {list.map(s => (
                        <div key={s.id} className="p-4 border border-gray-100 rounded-2xl flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${viewingList === 'prohibited' ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400'}`}>
                            <FontAwesomeIcon icon={faUserGraduate} />
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 text-sm leading-tight">{s.name}</p>
                            <p className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-1">
                                <FontAwesomeIcon icon={faIdBadge} size="xs" /> {s.id}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

{viewingList === "ungraded" && (
  <div className="space-y-4">
    {ungradedAssignments.map((sub) => (
      <button 
        key={sub.id}
        onClick={() => router.push(`/dashboard/teacher/subject/${id}/grading`)}
        className="w-full p-6 border border-gray-100 rounded-3xl flex items-center justify-between hover:border-blue-900 hover:shadow-md transition-all group bg-white"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center">
            <FontAwesomeIcon icon={faFileAlt} />
          </div>
          <div className="text-left">
           
            <p className="font-bold text-gray-900 text-lg leading-tight">{sub.title}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-black text-orange-600 uppercase bg-orange-50 px-2 py-0.5 rounded">
                Not Reviewed
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                • {sub.count} Students Pending
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-blue-900 font-bold text-xs group-hover:translate-x-1 transition-transform">
          Grade <FontAwesomeIcon icon={faChevronRight} />
        </div>
      </button>
    ))}
  </div>
)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable Stat Card Component
function StatCard({ icon, label, value, color, onClick, isWarning }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-900 hover:border-blue-900",
    orange: "bg-orange-50 text-orange-600 hover:border-orange-600",
    red: "bg-red-50 text-red-600 hover:border-red-600"
  };

  return (
    <button 
      onClick={onClick}
      className={`bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm text-left transition-all group hover:shadow-xl ${colors[color]}`}
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 text-xl transition-all ${colors[color].split(' ')[0]} ${colors[color].split(' ')[1]}`}>
        <FontAwesomeIcon icon={icon} />
      </div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
      <p className="text-4xl font-black text-gray-900">{value}</p>
      <div className="mt-4 flex items-center gap-1 text-[10px] font-black uppercase text-blue-900 opacity-0 group-hover:opacity-100 transition-opacity">
        View Details <FontAwesomeIcon icon={faChevronRight} size="xs" />
      </div>
    </button>
  );
}