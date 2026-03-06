"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useParams, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faColumns, faGraduationCap, faClock, faBook, 
  faBars, faTimes, faSignOutAlt, faClipboardCheck, 
  faFileUpload, faArrowLeft, faBullhorn, faChevronDown 
} from "@fortawesome/free-solid-svg-icons";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const SUBJECT_MAP: Record<string, string> = {
  "microwave-engineering": "Microwave Engineering",
  "control-systems": "Control Systems",
  "logic-design": "Logic Design",
  "communication-engineering-1": "Communication Engineering 1",
  "communication-engineering-2": "Communication Engineering 2",
  "digital-signal-processing": "Digital Signal Processing",
  "satellite-engineering": "Satellite Engineering"
};
  const [role, setRole] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  
 
 const rawId = params?.id as string;

const getSubjectDisplayName = (id: string) => {
  if (!id) return "Details";
  
  // 1. Try to find the clean name in our map (Best Method)
  if (SUBJECT_MAP[id]) return SUBJECT_MAP[id];

  // 2. If not found (like if the URL has %20), clean it manually one last time
  return decodeURIComponent(id)
    .replace(/%20/g, " ")
    .replace(/-/g, " ")
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const subjectName = getSubjectDisplayName(rawId);
  const isSubjectPage = pathname.includes("/subject/");

  useEffect(() => {
    setRole(localStorage.getItem("userRole") || "student");
    setIsMenuOpen(false); 
  }, [pathname]);

  const navLinks: any = {
    student: [
      { name: "Overview", icon: faColumns, href: `/dashboard/student/subject/${params.id}` },
      { name: "Attendance", icon: faClipboardCheck, href: `/dashboard/student/subject/${params.id}/attendance` },
      { name: "Assignments", icon: faClock, href: `/dashboard/student/subject/${params.id}/assignments` },
      { name: "Material", icon: faBook, href: `/dashboard/student/subject/${params.id}/materials` },
      { name: "Grades", icon: faGraduationCap, href: `/dashboard/student/subject/${params.id}/grades` },
    ],
    teacher: [
      { name: "Home", icon: faColumns, href: `/dashboard/teacher/subject/${params.id}` },
      { name: "Announcements", icon: faBullhorn, href: `/dashboard/teacher/subject/${params.id}/announcements` },
      { 
        name: "Attendance", 
        icon: faClipboardCheck, 
        subLinks: [
          { name: "Take New Session", href: `/dashboard/teacher/subject/${params.id}/attendance` },
          { name: "Manage History", href: `/dashboard/teacher/subject/${params.id}/attendance/manage` }
        ] 
      },
      { name: "Grading", icon: faGraduationCap, href: `/dashboard/teacher/subject/${params.id}/grading` },
      { name: "Materials", icon: faFileUpload, href: `/dashboard/teacher/subject/${params.id}/materials` },
    ]
  };

  const currentLinks = navLinks[role] || [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative overflow-x-hidden">
      
      {/* SUBJECT NAVBAR */}
      {isSubjectPage && (
        <nav className="fixed top-0 left-0 right-0 z-[200] bg-blue-900 text-white px-6 h-20 flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()} 
              className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition active:scale-90"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
            <div className="max-w-[200px] sm:max-w-none">
              <p className="text-[10px] font-black uppercase text-blue-300 tracking-widest leading-none mb-1">Subject</p>
              <h2 className="font-bold text-sm truncate uppercase tracking-tight italic">
                {subjectName}
              </h2>
            </div>
          </div>

          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition flex items-center gap-3 border border-white/10 active:scale-95"
          >
            <span className="text-[10px] font-black uppercase tracking-widest hidden xs:inline">
              {isMenuOpen ? "Close" : "Menu"}
            </span>
            <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} className="w-5 h-5" />
          </button>
        </nav>
      )}

      {/* Spacer */}
      {isSubjectPage && <div className="h-20 w-full shrink-0"></div>}

      {/* MENU OVERLAY */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[150] bg-blue-900 text-white flex flex-col p-8 overflow-y-auto pt-24 animate-in fade-in zoom-in-95 duration-200">
          <div className="space-y-4 max-w-lg mx-auto w-full pb-20">
            {currentLinks.map((link: any) => {
              if (link.subLinks) {
                return (
                  <div key={link.name} className="space-y-2">
                    <button 
                      onClick={() => setIsAttendanceOpen(!isAttendanceOpen)}
                      className={`w-full flex items-center justify-between p-6 rounded-[2rem] text-xl font-black transition-all ${isAttendanceOpen ? 'bg-white/10' : 'hover:bg-white/5'}`}
                    >
                      <div className="flex items-center gap-6">
                        <FontAwesomeIcon icon={link.icon} className="w-6 opacity-70" />
                        {link.name}
                      </div>
                      <FontAwesomeIcon icon={faChevronDown} className={`transition-transform ${isAttendanceOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isAttendanceOpen && (
                      <div className="space-y-2 pl-6">
                        {link.subLinks.map((sub: any) => (
                          <Link key={sub.name} href={sub.href} className="block p-4 rounded-3xl text-lg font-bold text-blue-300 hover:text-white transition-colors">
                             • {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className={`flex items-center gap-6 p-6 rounded-[2rem] text-xl font-black transition-all ${
                    pathname === link.href ? 'bg-white text-blue-900 shadow-xl' : 'hover:bg-white/10'
                  }`}
                >
                  <FontAwesomeIcon icon={link.icon} className="w-6 opacity-70" />
                  {link.name}
                </Link>
              );
            })}
          </div>
          
          <button 
            onClick={() => { localStorage.clear(); router.push("/login"); }}
            className="mt-auto flex items-center justify-center gap-4 w-full p-6 text-red-400 font-bold hover:bg-red-500/10 rounded-3xl transition border border-red-500/20"
          >
            <FontAwesomeIcon icon={faSignOutAlt} /> Log Out
          </button>
        </div>
      )}

      {/* CONTENT AREA */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-10">
        {children}
      </main>
    </div>
  );
}