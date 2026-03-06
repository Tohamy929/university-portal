"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faBook, faHistory, faUserCog, faSignOutAlt, faClock, 
  faCalendarAlt, faLock, faCheckCircle, faChevronRight, 
  faCamera, faPhone, faUserCircle, faStar, faGraduationCap
} from "@fortawesome/free-solid-svg-icons";

// IMPORT CENTRAL DATA
import { getStudentDataByDepartment, StudentData } from "@/src/data/studentdata";
import { MOCK_USERS } from "@/lib/mockUsers";

export default function StudentLobby() {
  const [activeTab, setActiveTab] = useState<"current" | "history" | "profile">("current");
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    // 1. Get the email of the person who just logged in
    const loggedInEmail = localStorage.getItem("userEmail");
    
    // 2. Find that specific person in your MOCK_USERS list
    const currentUser = MOCK_USERS.find(user => 
      user.email.toLowerCase() === loggedInEmail?.toLowerCase()
    );

    if (currentUser) {
      // 3. Fetch the base department data (Electrical, Mechanical, or Vehicle)
      const deptData = getStudentDataByDepartment(currentUser.department);
      
      // 4. Inject THEIR specific identity into the department-wide academic data
      setStudentData({
        ...deptData,
        profile: {
          ...deptData.profile,
          fullName: currentUser.name,
          studentId: currentUser.id.toUpperCase(),
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`
        }
      });
      setProfileImage(deptData.profile.avatar);
    } else {
      // Fallback/Safety: If no session, go back to login
      console.warn("No active session found. Redirecting...");
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Prevent rendering errors before useEffect completes
  if (!studentData) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-black text-blue-900 text-[10px] uppercase tracking-widest">Loading Academic Record...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* --- FIXED NAVBAR --- */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-blue-900 text-white shadow-2xl h-20">
        <div className="w-full h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white text-blue-900 rounded-xl flex items-center justify-center font-black italic shadow-lg shrink-0">HTI</div>
            <div className="hidden sm:block">
              <h1 className="font-black text-[10px] uppercase tracking-tighter leading-none">{studentData.profile.fullName}</h1>
              <p className="text-[7px] text-blue-300 font-bold uppercase mt-1 tracking-widest italic">{localStorage.getItem("userDept")} Student</p>
            </div>
          </div>

          <div className="flex bg-black/20 p-1 rounded-2xl border border-white/5 backdrop-blur-md">
            {["current", "history", "profile"].map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t as any)}
                className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                  activeTab === t ? "bg-white text-blue-900 shadow-lg" : "text-blue-100 hover:bg-white/10"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button onClick={handleLogout} className="text-red-400 p-3 hover:bg-red-500/10 rounded-xl transition-all">
            <FontAwesomeIcon icon={faSignOutAlt} />
          </button>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-7xl mx-auto p-6 pt-24 md:p-10 md:pt-32 animate-in fade-in duration-500">
        
        {/* --- TAB 1: CURRENT SEMESTER --- */}
        {activeTab === "current" && (
          <div className="space-y-10">
            <header className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
               <div className="relative z-10 text-center md:text-left">
                  <h2 className="text-3xl font-black text-gray-900 uppercase italic">Current Courses</h2>
                  <p className="text-gray-500 font-medium mt-2">Welcome back, {studentData.profile.fullName.split(' ')[0]}</p>
               </div>
               <div className="relative z-10 bg-blue-900 text-white p-6 rounded-[2rem] shadow-xl text-center min-w-[150px]">
                  <p className="text-[9px] font-black uppercase text-blue-300">GPA Status</p>
                  <p className="text-4xl font-black italic tracking-tighter">{studentData.profile.totalGpa}</p>
               </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {studentData.currentSemester.map(sub => (
                <div key={sub.id} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                  <div className="flex justify-between items-start mb-8">
                     <h3 className="text-lg font-black text-gray-900 uppercase italic leading-tight">{sub.title}</h3>
                     <button 
                        onClick={() => router.push(`/dashboard/student/subject/${sub.id}`)}
                        className="w-12 h-12 bg-blue-900 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
                     >
                        <FontAwesomeIcon icon={faChevronRight} />
                     </button>
                  </div>
                  <div className="flex flex-col gap-3">
                     <div className="bg-gray-50 px-4 py-2 rounded-xl text-[10px] font-bold text-gray-500 flex items-center gap-3">
                        <FontAwesomeIcon icon={faClock} className="text-blue-900" /> {sub.time}
                     </div>
                     <div className="bg-gray-50 px-4 py-2 rounded-xl text-[10px] font-bold text-gray-500 flex items-center gap-3">
                        <FontAwesomeIcon icon={faCalendarAlt} className="text-blue-900" /> {sub.room}
                     </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB 2: HISTORY --- */}
        {activeTab === "history" && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-black text-gray-900 uppercase italic">Academic Progress</h2>
            <div className="space-y-6">
              {studentData.history.map((sem) => (
                <div key={sem.semester} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="font-black text-blue-900 uppercase tracking-widest text-xs">{sem.semester}</h4>
                    <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-xl font-black text-[9px]">GPA: {sem.gpa}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sem.subjects.map((s) => (
                      <span key={s} className="px-4 py-2 bg-gray-50 rounded-xl text-[9px] font-bold text-gray-500 border border-gray-100 flex items-center gap-2">
                        <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" /> {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB 3: PROFILE --- */}
        {activeTab === "profile" && (
          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in zoom-in-95 duration-500">
            <div className="bg-blue-900 text-white rounded-[3rem] p-10 shadow-2xl flex flex-col items-center sm:items-start text-center sm:text-left gap-8">
              <div className="relative group">
                <div className="w-32 h-32 bg-white/10 rounded-[2.5rem] border-4 border-white/20 overflow-hidden flex items-center justify-center">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <FontAwesomeIcon icon={faUserCircle} className="text-6xl text-white/10" />
                  )}
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 w-10 h-10 bg-white text-blue-900 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform active:scale-90"
                >
                  <FontAwesomeIcon icon={faCamera} size="sm" />
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
              </div>

              <div className="space-y-6 w-full">
                <div>
                  <p className="text-[8px] font-black text-blue-300 uppercase tracking-widest mb-1">Full Academic Name</p>
                  <p className="text-xl font-black uppercase tracking-tight">{studentData.profile.fullName}</p>
                </div>
                <div className="pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[8px] font-black text-blue-300 uppercase tracking-widest mb-1">System ID</p>
                    <p className="font-mono font-bold text-sm tracking-widest">{studentData.profile.studentId}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-blue-300 uppercase tracking-widest mb-1">Phone Record</p>
                    <p className="font-bold text-[11px]">{studentData.profile.phoneNumber}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col justify-center">
              <h4 className="font-black text-gray-900 uppercase text-xs mb-6">Account Security</h4>
              <div className="space-y-4">
                <input type="password" placeholder="Current Password" className="w-full p-4 bg-gray-50 border rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-900 transition-all" />
                <input type="password" placeholder="New Password" className="w-full p-4 bg-gray-50 border rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-900 transition-all" />
                <button className="w-full bg-blue-900 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:shadow-2xl transition-all">Update Credentials</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}