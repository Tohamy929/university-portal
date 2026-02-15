"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useParams, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faColumns, faGraduationCap, faClock, faBook, 
  faBars, faTimes, faSignOutAlt, faUser, faClipboardCheck, 
  faFileUpload, faArrowLeft, faBullhorn 
} from "@fortawesome/free-solid-svg-icons";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  
  const [role, setRole] = useState("");
  const [userName, setUserName] = useState("");
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    setRole(localStorage.getItem("userRole") || "student");
    setUserName(localStorage.getItem("userName") || "User");
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  // ARCHITECTURE DETAIL: Sidebar only shows if we are inside a subject [id]
  const showSidebar = !!params.id;

  const navLinks: any = {
    student: [
      { name: "Subject Home", icon: faColumns, href: `/dashboard/student/subject/${params.id}` },
      { name: "Attendance", icon: faClipboardCheck, href: `/dashboard/student/subject/${params.id}/attendance` },
      { name: "Assignments", icon: faClock, href: `/dashboard/student/subject/${params.id}/assignments` },
      { name: "Material", icon: faBook, href: `/dashboard/student/subject/${params.id}/materials` },
      { name: "Grades", icon: faGraduationCap, href: `/dashboard/student/subject/${params.id}/grades` },
    ],
    teacher: [
      { name: "Subject Home", icon: faColumns, href: `/dashboard/teacher/subject/${params.id}` },
      { name: "Announcements", icon: faBullhorn, href: `/dashboard/teacher/subject/${params.id}/announcements` },
      { name: "Take Attendance", icon: faClipboardCheck, href: `/dashboard/teacher/subject/${params.id}/attendance` },
      { name: "Grading Center", icon: faGraduationCap, href: `/dashboard/teacher/subject/${params.id}/grading` },
      { name: "Upload Material", icon: faFileUpload, href: `/dashboard/teacher/subject/${params.id}/materials` },
    ]
  };

  const currentLinks = navLinks[role] || [];

 return (
  <div className="min-h-screen bg-gray-50 flex">
    {/* SIDEBAR: Only rendered if params.id exists */}
    {showSidebar && (
      <aside 
        className={`bg-blue-900 text-white fixed h-full z-50 transition-all duration-300 overflow-hidden shadow-2xl ${
          isSidebarOpen ? 'w-72' : 'w-0'
        }`}
      >
        <div className="w-72"> {/* Forced width container to prevent text squishing */}
          <div className="p-8 border-b border-blue-800/50">
            <Link href={`/dashboard/${role}`} className="flex items-center gap-2 text-[10px] font-black text-blue-300 hover:text-white mb-6 uppercase tracking-widest">
              <FontAwesomeIcon icon={faArrowLeft} /> Back to All Subjects
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-900 font-bold text-xl">HTI</div>
              <span className="font-bold text-lg uppercase tracking-tight">{role}</span>
            </div>
          </div>
          <nav className="p-4 mt-4 space-y-1">
            {currentLinks.map((link: any) => (
              <Link 
                key={link.name} 
                href={link.href} 
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                  pathname === link.href ? 'bg-white text-blue-900 font-bold shadow-lg' : 'text-blue-100 hover:bg-blue-800'
                }`}
              >
                <FontAwesomeIcon icon={link.icon} className="w-5" />
                <span>{link.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </aside>
    )}

    {/* MAIN CONTENT: Margin-left MUST be 0 if showSidebar is false */}
    <main 
      className={`flex-1 transition-all duration-300 min-h-screen ${
        showSidebar && isSidebarOpen ? 'ml-72' : 'ml-0'
      }`}
    >
      <header className="bg-white/80 backdrop-blur-md h-20 border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          {/* Only show hamburger if sidebar is active */}
          {showSidebar && (
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-blue-900 p-2">
              <FontAwesomeIcon icon={isSidebarOpen ? faTimes : faBars} size="lg" />
            </button>
          )}
        </div>
        
        {/* User Info & Logout */}
        <div className="flex items-center gap-4">
          <span className="font-bold text-gray-900 text-sm">{userName}</span>
          <button onClick={handleLogout} className="text-red-500 font-bold text-sm bg-red-50 px-4 py-2 rounded-xl">Logout</button>
        </div>
      </header>

      <div className="p-6 md:p-10">
        {children}
      </div>
    </main>
  </div>
);
}