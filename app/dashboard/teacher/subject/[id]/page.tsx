"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUsers, faFileSignature, faExclamationCircle, faArrowRight, 
  faChartPie, faTimes, faUserGraduate, faIdBadge, faChevronRight, faFileAlt, faSpinner
} from "@fortawesome/free-solid-svg-icons";

export default function TeacherSubjectHome() {
  const { id } = useParams();
  const router = useRouter();
  
  const [viewingList, setViewingList] = useState<"all" | "prohibited" | "ungraded" | null>(null);
  const [courseInfo, setCourseInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // REAL DATA STATES
  const [students, setStudents] = useState<any[]>([]);
  const [atRiskStudents, setAtRiskStudents] = useState<any[]>([]);
  const [ungradedAssignments, setUngradedAssignments] = useState<any[]>([]);
  const [groups, setGroups] = useState<string[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/login");
      return;
    }
    setAuthToken(token);
    setIsLoading(true);

    fetch(`/api-proxy/Subject/GetDetailsForTeacherById/${id}`, {
      headers: { "accept": "*/*", "Authorization": `Bearer ${token}` }
    })
    .then(async (res) => {
      const text = await res.text();
      if (!res.ok) throw new Error(text);
      if (!text) return null;
      return JSON.parse(text);
    })
    .then(data => {
      if (data) {
        setCourseInfo({ 
          name: data.name, 
          code: data.code,
          dept: data.department 
        });

        // 1. Flatten Enrolled Students
        const flatStudents: any[] = [];
        const parsedGroups: string[] = [];
        
        (data.enrolledStudents || []).forEach((g: any) => {
          const groupName = `Group ${g.number}`;
          if (!parsedGroups.includes(groupName)) parsedGroups.push(groupName);
          
          (g.students || []).forEach((s: any) => {
            flatStudents.push({ id: s.code, name: s.name, group: groupName });
          });
        });
        
        setStudents(flatStudents);
        setGroups(parsedGroups.sort());

        // 2. Flatten Restricted (Prohibited) Students
        const flatRestricted: any[] = [];
        (data.restrictionList || []).forEach((g: any) => {
          const groupName = `Group ${g.number}`;
          (g.students || []).forEach((s: any) => {
            flatRestricted.push({ id: s.code, name: s.name, group: groupName });
          });
        });
        
        setAtRiskStudents(flatRestricted);

        // 3. Map Pending Assignments
        // The API currently returns an empty array, but it's wired for when assignments drop!
        setUngradedAssignments(data.pendingAssignments || []);
      }
    })
    .catch(err => {
      console.warn("Backend error fetching subject details:", err.message);
      setCourseInfo({ name: "Error Loading Subject" });
    })
    .finally(() => {
      setIsLoading(false);
    });
  }, [id, router]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col gap-4 items-center justify-center text-blue-900 uppercase font-black tracking-widest animate-pulse">
        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl" />
        <p className="text-xs">Loading Subject Hub...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700">
      <header>
        <div className="flex items-center gap-3 mb-2">
          <span className="bg-blue-100 text-blue-900 px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase">{courseInfo?.code}</span>
          <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase">{courseInfo?.dept}</span>
        </div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase italic">
          {courseInfo?.name || `Subject ${id}`}
        </h1>
        <p className="text-gray-500 font-medium mt-2">Overview of subject performance and pending actions.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={faUsers} label="Enrolled Students" value={students.length} color="blue" 
          onClick={() => setViewingList("all")} 
        />
        <StatCard 
          icon={faFileSignature} label="Ungraded Assignments" value={ungradedAssignments.length} color="orange" 
          onClick={() => setViewingList("ungraded")} 
        />
        <StatCard 
          icon={faExclamationCircle} label="Prohibited Students" value={atRiskStudents.length} color="red" 
          onClick={() => setViewingList("prohibited")} isWarning={atRiskStudents.length > 0}
        />
      </div>

      {/* ATTENDANCE CONTROL */}
      <section className="bg-blue-900 rounded-[3rem] p-10 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold italic">Attendance Management</h2>
          <p className="text-blue-200 max-w-md">Launch AI recognition or manual tracking for your assigned groups.</p>
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
                            <p className="font-bold text-gray-800 text-sm leading-tight truncate max-w-[150px]" title={s.name}>{s.name}</p>
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

              {/* EMPTY STATE */}
              {viewingList === "all" && students.length === 0 && <p className="text-center text-gray-400 font-bold uppercase text-xs">No students enrolled.</p>}
              {viewingList === "prohibited" && atRiskStudents.length === 0 && <p className="text-center text-green-500 font-bold uppercase text-xs">No students are currently prohibited.</p>}

              {/* LIST FOR UNGRADED ASSIGNMENTS */}
              {viewingList === "ungraded" && (
                <div className="space-y-4">
                  {ungradedAssignments.length === 0 ? (
                    <p className="text-center text-gray-400 font-bold uppercase text-xs">No pending assignments.</p>
                  ) : (
                    ungradedAssignments.map((sub) => (
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
                            <p className="font-bold text-gray-900 text-lg leading-tight">{sub.title || sub.assignmentName}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-black text-orange-600 uppercase bg-orange-50 px-2 py-0.5 rounded">Not Reviewed</span>
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">• {sub.count || 0} Pending</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-blue-900 font-bold text-xs group-hover:translate-x-1 transition-transform">
                          Grade <FontAwesomeIcon icon={faChevronRight} />
                        </div>
                      </button>
                    ))
                  )}
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