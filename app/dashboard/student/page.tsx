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

// IMPORT TRANSLATION HOOK
import { useTranslation } from "@/src/context/TranslationContext";

export default function StudentLobby() {
  const [activeTab, setActiveTab] = useState<"current" | "history" | "profile">("current");
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  
  // INIT TRANSLATIONS
  const { t } = useTranslation();

  useEffect(() => {
    const loggedInEmail = localStorage.getItem("userEmail");
    const currentUser = MOCK_USERS.find(user => 
      user.email.toLowerCase() === loggedInEmail?.toLowerCase()
    );

    if (currentUser) {
      const deptData = getStudentDataByDepartment(currentUser.department);
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

  // --- LOADING SCREEN ---
  if (!studentData) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-900 dark:border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-black text-blue-900 dark:text-blue-400 text-[10px] uppercase tracking-widest">
          {t("student.loading")}
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300 flex flex-col">
      {/* --- FIXED NAVBAR --- */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-blue-900 dark:bg-black text-white shadow-2xl h-20 transition-colors duration-300">
        <div className="w-full h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white dark:bg-gray-800 text-blue-900 dark:text-white rounded-xl flex items-center justify-center font-black italic shadow-lg shrink-0 transition-colors">HTI</div>
            <div className="hidden sm:block">
              <h1 className="font-black text-[10px] uppercase tracking-tighter leading-none">{studentData.profile.fullName}</h1>
              <p className="text-[7px] text-blue-300 dark:text-blue-500 font-bold uppercase mt-1 tracking-widest italic">
                {localStorage.getItem("userDept")} {t("student.studentRole")}
              </p>
            </div>
          </div>

          <div className="flex bg-black/20 dark:bg-white/10 p-1 rounded-2xl border border-white/5 backdrop-blur-md">
            {["current", "history", "profile"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab 
                    ? "bg-white dark:bg-blue-600 text-blue-900 dark:text-white shadow-lg" 
                    : "text-blue-100 hover:bg-white/10 dark:hover:bg-white/5"
                }`}
              >
                {t(`student.tabs.${tab}`)}
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
            <header className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden transition-colors duration-300">
               <div className="relative z-10 text-center md:text-left rtl:md:text-right">
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase italic">{t("student.current.title")}</h2>
                  <p className="text-gray-500 dark:text-gray-400 font-medium mt-2">
                    {t("student.current.welcome")}, {studentData.profile.fullName.split(' ')[0]}
                  </p>
               </div>
               <div className="relative z-10 bg-blue-900 dark:bg-blue-800 text-white p-6 rounded-[2rem] shadow-xl text-center min-w-[150px] transition-colors">
                  <p className="text-[9px] font-black uppercase text-blue-300 dark:text-blue-200">{t("student.current.gpa")}</p>
                  <p className="text-4xl font-black italic tracking-tighter">{studentData.profile.totalGpa}</p>
               </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {studentData.currentSemester.map(sub => (
                <div key={sub.id} className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all group">
                  <div className="flex justify-between items-start mb-8">
                     <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase italic leading-tight">{sub.title}</h3>
                     <button 
                        onClick={() => router.push(`/dashboard/student/subject/${sub.id}`)}
                        className="w-12 h-12 bg-blue-900 dark:bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
                     >
                        <FontAwesomeIcon icon={faChevronRight} className="rtl:rotate-180" />
                     </button>
                  </div>
                  <div className="flex flex-col gap-3">
                     <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-xl text-[10px] font-bold text-gray-500 dark:text-gray-400 flex items-center gap-3 transition-colors">
                        <FontAwesomeIcon icon={faClock} className="text-blue-900 dark:text-blue-400" /> {sub.time}
                     </div>
                     <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-xl text-[10px] font-bold text-gray-500 dark:text-gray-400 flex items-center gap-3 transition-colors">
                        <FontAwesomeIcon icon={faCalendarAlt} className="text-blue-900 dark:text-blue-400" /> {sub.room}
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
            <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase italic">{t("student.history.title")}</h2>
            <div className="space-y-6">
              {studentData.history.map((sem) => (
                <div key={sem.semester} className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="font-black text-blue-900 dark:text-blue-400 uppercase tracking-widest text-xs">{sem.semester}</h4>
                    <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-4 py-1.5 rounded-xl font-black text-[9px]">
                      {t("student.history.gpa")}: {sem.gpa}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sem.subjects.map((s) => (
                      <span key={s} className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-[9px] font-bold text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-700 flex items-center gap-2 transition-colors">
                        <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 dark:text-green-400" /> {s}
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
            <div className="bg-blue-900 dark:bg-blue-950 text-white rounded-[3rem] p-10 shadow-2xl flex flex-col items-center sm:items-start text-center sm:text-left rtl:sm:text-right gap-8 transition-colors">
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
                  className="absolute -bottom-2 -right-2 rtl:-right-auto rtl:-left-2 w-10 h-10 bg-white dark:bg-gray-800 text-blue-900 dark:text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform active:scale-90"
                >
                  <FontAwesomeIcon icon={faCamera} size="sm" />
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
              </div>

              <div className="space-y-6 w-full">
                <div>
                  <p className="text-[8px] font-black text-blue-300 dark:text-blue-400 uppercase tracking-widest mb-1">{t("student.profile.name")}</p>
                  <p className="text-xl font-black uppercase tracking-tight">{studentData.profile.fullName}</p>
                </div>
                <div className="pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[8px] font-black text-blue-300 dark:text-blue-400 uppercase tracking-widest mb-1">{t("student.profile.id")}</p>
                    <p className="font-mono font-bold text-sm tracking-widest">{studentData.profile.studentId}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-blue-300 dark:text-blue-400 uppercase tracking-widest mb-1">{t("student.profile.phone")}</p>
                    <p className="font-bold text-[11px]">{studentData.profile.phoneNumber}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-center transition-colors">
              <h4 className="font-black text-gray-900 dark:text-white uppercase text-xs mb-6">{t("student.profile.security")}</h4>
              <div className="space-y-4">
                <input 
                  type="password" 
                  placeholder={t("student.profile.currentPass")} 
                  className="w-full p-4 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-900 dark:focus:ring-blue-500 text-gray-900 dark:text-white transition-all placeholder:text-gray-400" 
                />
                <input 
                  type="password" 
                  placeholder={t("student.profile.newPass")} 
                  className="w-full p-4 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-900 dark:focus:ring-blue-500 text-gray-900 dark:text-white transition-all placeholder:text-gray-400" 
                />
                <button className="w-full bg-blue-900 dark:bg-blue-600 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:shadow-2xl transition-all">
                  {t("student.profile.update")}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}