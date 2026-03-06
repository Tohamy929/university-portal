"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faColumns, faUserCircle, faSignOutAlt, faClock, 
  faCalendarAlt, faChevronRight, faCamera, faClipboardCheck, 
  faGraduationCap, faUsers, faBell, faCheckDouble,faCheckCircle
} from "@fortawesome/free-solid-svg-icons";

// IMPORT CENTRAL DATA
import { DEPARTMENT_DATA } from "@/src/data/studentdata";
import { MOCK_USERS } from "@/lib/mockUsers";

export default function TeacherLobby() {
  const [activeTab, setActiveTab] = useState<"home" | "tasks" | "profile">("home");
  const [teacherData, setTeacherData] = useState<any>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    const currentUser = MOCK_USERS.find(u => u.email.toLowerCase() === userEmail?.toLowerCase());

    if (currentUser) {
      const deptData = DEPARTMENT_DATA[currentUser.department];
      
      setTeacherData({
        name: currentUser.name,
        id: currentUser.id.toUpperCase(),
        dept: currentUser.department,
        courses: deptData.courses,
        schedule: deptData.teacherOverview.weeklySchedule,
        reviews: deptData.teacherOverview.pendingReviews
      });
      setProfileImage(`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`);
    } else {
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  if (!teacherData) return <div className="min-h-screen flex items-center justify-center bg-gray-50 uppercase font-black text-blue-900 tracking-widest animate-pulse">Loading Faculty Portal...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-blue-900 text-white shadow-2xl h-20">
        <div className="w-full h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white text-blue-900 rounded-xl flex items-center justify-center font-black italic shadow-lg shrink-0">HTI</div>
            <div className="hidden sm:block">
              <h1 className="font-black text-[10px] uppercase tracking-tighter leading-none">{teacherData.name}</h1>
              <p className="text-[7px] text-blue-300 font-bold uppercase mt-1 tracking-widest italic">{teacherData.dept} Faculty</p>
            </div>
          </div>

          <div className="flex bg-black/20 p-1 rounded-2xl border border-white/5 backdrop-blur-md">
            {[
              { id: "home", label: "Home", icon: faColumns },
              { id: "tasks", label: "Actions", icon: faBell },
              { id: "profile", label: "Profile", icon: faUserCircle }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                  activeTab === t.id ? "bg-white text-blue-900 shadow-lg" : "text-blue-100 hover:bg-white/10"
                }`}
              >
                <FontAwesomeIcon icon={t.icon} className="text-[10px]" />
                <span className="hidden xs:block">{t.label}</span>
              </button>
            ))}
          </div>

          <button onClick={handleLogout} className="text-red-400 p-3 hover:bg-red-500/10 rounded-xl transition-all">
            <FontAwesomeIcon icon={faSignOutAlt} />
          </button>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-7xl mx-auto p-6 pt-24 md:p-10 md:pt-32 animate-in fade-in duration-500">
        
        {/* --- TAB 1: HOME (Assigned Courses) --- */}
        {activeTab === "home" && (
          <div className="space-y-10">
            <header className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
               <div className="relative z-10">
                  <h2 className="text-3xl font-black text-gray-900 uppercase italic leading-none">Teaching Load</h2>
                  <p className="text-gray-500 font-medium mt-3 uppercase text-[10px] tracking-widest">Active Academic Period</p>
               </div>
               <div className="relative z-10 bg-blue-900 text-white p-6 rounded-[2rem] shadow-xl text-center min-w-[150px]">
                  <p className="text-[9px] font-black uppercase text-blue-300 mb-1">Total Subjects</p>
                  <p className="text-4xl font-black italic">{teacherData.courses.length}</p>
               </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teacherData.courses.map((sub: any) => (
                <div key={sub.id} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                  <div className="flex justify-between items-start mb-6">
                     <div className="p-4 bg-blue-50 text-blue-900 rounded-2xl">
                        <FontAwesomeIcon icon={faUsers} />
                     </div>
                     <button 
                        onClick={() => router.push(`/dashboard/teacher/subject/${sub.id}`)}
                        className="w-12 h-12 bg-blue-900 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
                     >
                        <FontAwesomeIcon icon={faChevronRight} />
                     </button>
                  </div>
                  <h3 className="text-lg font-black text-gray-900 uppercase italic leading-tight mb-4 h-12 overflow-hidden">{sub.name}</h3>
                  <div className="space-y-3 pt-4 border-t border-gray-50">
                     <div className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-2">
                        <FontAwesomeIcon icon={faClock} className="text-blue-900" /> {sub.schedule}
                     </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB 2: ACTIONS (Administrative Tasks) --- */}
       {activeTab === "tasks" && (
  <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
    <div className="flex justify-between items-end">
      <div>
        <h2 className="text-3xl font-black text-gray-900 uppercase italic">Pending Reviews</h2>
        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-2">Items requiring immediate faculty action</p>
      </div>
      <div className="bg-orange-100 text-orange-700 px-4 py-2 rounded-2xl font-black text-[10px] uppercase">
        {teacherData.reviews.length} Subjects Flagged
      </div>
    </div>

    <div className="grid gap-6">
      {teacherData.reviews.map((rev: any) => (
        <div 
          key={rev.subjectId + rev.type} 
          className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group flex flex-col sm:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-50 text-blue-900 rounded-[2rem] flex items-center justify-center text-xl group-hover:bg-blue-900 group-hover:text-white transition-colors duration-300">
              <FontAwesomeIcon icon={rev.type === "Assignment" ? faCheckDouble : faGraduationCap} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                <p className="font-black text-gray-900 text-lg uppercase italic">{rev.subjectId}</p>
              </div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                Needs Review: <span className="text-blue-900">{rev.type}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="flex-1 sm:flex-none text-center sm:text-right px-6">
              <p className="text-2xl font-black text-gray-900 leading-none">{rev.count}</p>
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter mt-1">Submissions</p>
            </div>
            
            {/* THE DEEP LINK BUTTON */}
            <button 
              onClick={() => router.push(`/dashboard/teacher/subject/${rev.subjectId}/grading`)}
              className="flex-1 sm:flex-none bg-blue-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-blue-800 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              Handle Now
              <FontAwesomeIcon icon={faChevronRight} className="text-[8px] opacity-50" />
            </button>
          </div>
        </div>
      ))}

      {teacherData.reviews.length === 0 && (
        <div className="bg-green-50 border border-green-100 p-10 rounded-[3rem] text-center">
           <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-3xl mb-4" />
           <p className="font-black text-green-800 uppercase text-xs tracking-widest">All caught up! No pending reviews.</p>
        </div>
      )}
    </div>
  </div>
)}

        {/* --- TAB 3: PROFILE (Matches Student View) --- */}
        {activeTab === "profile" && (
          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in zoom-in-95 duration-500">
            <div className="bg-blue-900 text-white rounded-[3rem] p-10 shadow-2xl flex flex-col items-center sm:items-start text-center sm:text-left gap-8">
              <div className="relative">
                <div className="w-32 h-32 bg-white/10 rounded-[2.5rem] border-4 border-white/20 overflow-hidden flex items-center justify-center">
                  <img src={profileImage || ""} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-white text-blue-900 rounded-full shadow-lg flex items-center justify-center">
                  <FontAwesomeIcon icon={faCamera} size="sm" />
                </button>
              </div>

              <div className="space-y-6 w-full">
                <div>
                  <p className="text-[8px] font-black text-blue-300 uppercase tracking-widest mb-1">Academic Designation</p>
                  <p className="text-xl font-black uppercase tracking-tight">{teacherData.name}</p>
                </div>
                <div className="pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[8px] font-black text-blue-300 uppercase tracking-widest mb-1">Faculty ID</p>
                    <p className="font-mono font-bold text-sm tracking-widest">{teacherData.id}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-blue-300 uppercase tracking-widest mb-1">Department</p>
                    <p className="font-bold text-[11px] uppercase">{teacherData.dept}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col justify-center">
              <h4 className="font-black text-gray-900 uppercase text-xs mb-6 text-center">Faculty Settings</h4>
              <div className="space-y-4">
                <input type="password" placeholder="Current Password" className="w-full p-4 bg-gray-50 border rounded-2xl text-sm" />
                <input type="password" placeholder="New Password" className="w-full p-4 bg-gray-50 border rounded-2xl text-sm" />
                <button className="w-full bg-blue-900 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">Update Password</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}