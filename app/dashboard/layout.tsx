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
  
  const [role, setRole] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  
  const showNavbar = !!params.id; // Only show if inside a subject [id]

  useEffect(() => {
    setRole(localStorage.getItem("userRole") || "student");
    setIsMenuOpen(false); // Auto-close menu on navigation
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
    <div className="min-h-screen bg-gray-50 flex flex-col overflow-x-hidden">
      {/* 1. TOP NAVBAR */}
      {showNavbar && (
        <nav className="sticky top-0 z-[100] bg-blue-900 text-white px-6 h-20 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/${role}`} className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition text-sm">
              <FontAwesomeIcon icon={faArrowLeft} />
            </Link>
            <div>
              <p className="text-[10px] font-black uppercase text-blue-300 tracking-[0.2em] leading-none mb-1">Subject View</p>
              <h2 className="font-bold text-sm tracking-tight">{params.id}</h2>
            </div>
          </div>

          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition flex items-center gap-3 border border-white/5"
          >
            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">
              {isMenuOpen ? "Close" : "Menu"}
            </span>
            <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} className="w-4 h-4" />
          </button>
        </nav>
      )}

      {/* 2. FULL-SCREEN MENU OVERLAY (Fixes transparency/zoom) */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[90] bg-blue-900 text-white animate-in fade-in zoom-in-95 duration-200 flex flex-col p-8 overflow-y-auto">
          <div className="mt-24 space-y-4 max-w-lg mx-auto w-full">
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-4 text-center">Navigation Menu</p>
            
            {currentLinks.map((link: any) => {
              // DROPDOWN RENDER
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
                      <FontAwesomeIcon icon={faChevronDown} className={`text-sm transition-transform ${isAttendanceOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isAttendanceOpen && (
                      <div className="space-y-2 pl-4">
                        {link.subLinks.map((sub: any) => (
                          <Link 
                            key={sub.name} 
                            href={sub.href}
                            className={`block p-5 rounded-3xl text-lg font-bold transition-all ${pathname === sub.href ? 'text-white' : 'text-blue-300 hover:text-white'}`}
                          >
                            • {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              // REGULAR LINK RENDER
              return (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className={`flex items-center gap-6 p-6 rounded-[2rem] text-xl font-black transition-all ${
                    pathname === link.href ? 'bg-white text-blue-900 shadow-2xl scale-105' : 'hover:bg-white/10'
                  }`}
                >
                  <FontAwesomeIcon icon={link.icon} className="w-6 opacity-70" />
                  {link.name}
                </Link>
              );
            })}
          </div>
          
          <div className="mt-12 border-t border-white/10 pt-8 max-w-lg mx-auto w-full">
            <button 
              onClick={() => { localStorage.clear(); router.push("/login"); }}
              className="flex items-center justify-center gap-4 w-full p-6 text-red-400 font-bold hover:bg-red-500/10 rounded-3xl transition"
            >
              <FontAwesomeIcon icon={faSignOutAlt} /> Sign Out
            </button>
          </div>
        </div>
      )}

     
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 lg:p-10">
        {children}
      </main>
    </div>
  );
}