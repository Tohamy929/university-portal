"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faArrowLeft, faExclamationTriangle, faSpinner, faClock, 
  faFileAlt, faChartBar, faFolderOpen, faBullhorn, faExclamation
} from "@fortawesome/free-solid-svg-icons";

export default function StudentSubjectOverview() {
  const { id } = useParams();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [subjectDetails, setSubjectDetails] = useState<any>(null);
  const [grades, setGrades] = useState<any>(null);
  const [pendingAssignments, setPendingAssignments] = useState<any[]>([]);

 useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) { router.push("/login"); return; }
    
    const fetchSubjectData = async () => {
      try {
        // Safe cache-busting headers that won't crash ASP.NET
       // Correctly casting 'no-store' for TypeScript
        const fetchOptions = {
          cache: "no-store" as RequestCache, 
          headers: { 
            "accept": "*/*",
            "Authorization": `Bearer ${token}`,
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache"
          }
        };

        // Fetch 1: Subject Details
        const detailsRes = await fetch(`/api-proxy/Subject/GetDetailsForStudentById/${id}`, fetchOptions);
        const details = detailsRes.ok ? await detailsRes.json() : null;

        // Fetch 2: Grades (Waits for Fetch 1 to finish so the backend DB doesn't choke)
        const gradesRes = await fetch(`/api-proxy/Subject/GetStudentGradesForStudentById/${id}`, fetchOptions);
        const gradesData = gradesRes.ok ? await gradesRes.json() : null;

        // Fetch 3: Assignments
        const assignRes = await fetch(`/api-proxy/Assignment/GetBySubjectId/${id}`, fetchOptions);
        const assignmentsData = assignRes.ok ? await assignRes.json() : [];

        setSubjectDetails(details);
        setGrades(gradesData);
        
        if (Array.isArray(assignmentsData)) {
          setPendingAssignments(assignmentsData.filter(a => !a.submission));
        }

      } catch (error) {
        console.error("Subject Fetch Error:", error);
        setErrorMsg("Check your connection or server status");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubjectData();
  }, [id, router]);
  
  if (isLoading) return <div className="min-h-[60vh] flex flex-col items-center justify-center text-blue-900 font-black animate-pulse"><FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl mb-2" /> Loading Overview...</div>;
  if (errorMsg) return <div className="min-h-[60vh] flex flex-col items-center justify-center text-red-500 font-black"><FontAwesomeIcon icon={faExclamationTriangle} className="text-4xl mb-2" /> {errorMsg}</div>;
  if (!subjectDetails) return <div className="min-h-[60vh] flex items-center justify-center text-gray-400 font-black uppercase">No data to display</div>;

  const isAtRisk = subjectDetails.totalAbsences >= 4;
  const hasAnnouncements = subjectDetails.notifications && subjectDetails.notifications.length > 0;

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-10 animate-in fade-in duration-500 bg-gray-50 min-h-screen">
      
      <header className="bg-blue-900 text-white rounded-[3rem] p-10 shadow-2xl">
        <button onClick={() => router.push(`/dashboard/student`)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-300 hover:text-white mb-6">
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Dashboard
        </button>
        <span className="bg-blue-800 px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase border border-blue-700">{subjectDetails.code}</span>
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight italic mt-3 mb-8">{subjectDetails.name}</h1>
        
        <div className="flex gap-4">
          <div onClick={() => router.push(`/dashboard/student/subject/${id}/attendance`)} className={`px-6 py-4 rounded-3xl border-2 flex items-center gap-4 cursor-pointer hover:scale-105 transition-transform ${isAtRisk ? 'bg-red-500/20 border-red-500 text-white' : 'bg-blue-800/50 border-blue-700 text-white'}`}>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Absences</p>
              <p className="text-2xl font-black">{subjectDetails.totalAbsences}</p>
            </div>
            {isAtRisk && <FontAwesomeIcon icon={faExclamationTriangle} className="text-2xl text-red-400 animate-pulse" />}
          </div>
          
          <div onClick={() => router.push(`/dashboard/student/subject/${id}/grades`)} className="px-6 py-4 rounded-3xl bg-green-500/20 border-2 border-green-500 text-white flex items-center gap-4 cursor-pointer hover:scale-105 transition-transform">
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Total Score</p>
              <p className="text-2xl font-black">{grades?.totalScore || 0}</p>
            </div>
            <FontAwesomeIcon icon={faChartBar} className="text-2xl text-green-400" />
          </div>
        </div>
      </header>

      {/* QUICK NAVIGATION */}
      <div className="grid grid-cols-3 gap-4">
        <button onClick={() => router.push(`/dashboard/student/subject/${id}/assignments`)} className="bg-white p-6 rounded-3xl border shadow-sm hover:shadow-md font-black text-blue-900 uppercase text-xs flex flex-col items-center justify-center gap-3">
          <FontAwesomeIcon icon={faFileAlt} className="text-2xl" /> Assignments
        </button>
        <button onClick={() => router.push(`/dashboard/student/subject/${id}/materials`)} className="bg-white p-6 rounded-3xl border shadow-sm hover:shadow-md font-black text-blue-900 uppercase text-xs flex flex-col items-center justify-center gap-3">
          <FontAwesomeIcon icon={faFolderOpen} className="text-2xl" /> Materials
        </button>
        
        {/* BROADCASTS BUTTON WITH NOTIFICATION BADGE */}
        <button onClick={() => router.push(`/dashboard/student/subject/${id}/announcements`)} className="bg-white p-6 rounded-3xl border shadow-sm hover:shadow-md font-black text-blue-900 uppercase text-xs flex flex-col items-center justify-center gap-3 relative overflow-hidden">
          {hasAnnouncements && (
            <div className="absolute top-4 right-4 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] animate-bounce shadow-md">
              <FontAwesomeIcon icon={faExclamation} />
            </div>
          )}
          <FontAwesomeIcon icon={faBullhorn} className={`text-2xl ${hasAnnouncements ? 'text-orange-500' : ''}`} /> 
          Broadcasts
        </button>
      </div>

      {/* BRIEF ASSIGNMENTS VIEW */}
      <div>
        <h3 className="font-black text-gray-400 text-[10px] uppercase tracking-[0.2em] ml-2 mb-4">Pending Tasks</h3>
        {pendingAssignments.length === 0 ? (
          <div className="text-center p-10 bg-white rounded-[2rem] border border-gray-100 shadow-sm"><p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No pending assignments</p></div>
        ) : (
          <div className="space-y-4">
            {pendingAssignments.slice(0, 3).map((assignment) => (
              <div key={assignment.id} className="bg-white p-6 rounded-[2rem] border shadow-sm flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 text-blue-900 rounded-xl flex items-center justify-center"><FontAwesomeIcon icon={faFileAlt} /></div>
                  <div>
                    <h4 className="font-bold text-gray-900 leading-tight">{assignment.title}</h4>
                    <p className="text-[10px] font-black uppercase text-gray-500 mt-1 flex items-center gap-1"><FontAwesomeIcon icon={faClock} /> Due: {new Date(assignment.deadline).toLocaleDateString()}</p>
                  </div>
                </div>
                <button onClick={() => router.push(`/dashboard/student/subject/${id}/assignments`)} className="px-4 py-2 bg-blue-900 text-white rounded-xl text-[10px] font-black uppercase">View</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}