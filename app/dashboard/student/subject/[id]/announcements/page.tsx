"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faBullhorn, faClock, faSpinner, faExclamationTriangle, faArrowLeft 
} from "@fortawesome/free-solid-svg-icons";

export default function StudentAnnouncements() {
  const { id } = useParams();
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [subjectDetails, setSubjectDetails] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) { router.push("/login"); return; }
    
    fetch(`http://smartattend456-001-site1.qtempurl.com/api/Subject/GetDetailsForStudentById/${id}`, {
      headers: { "accept": "*/*", "Authorization": `Bearer ${token}` }
    })
    .then(async (res) => {
      const text = await res.text();
      if (!res.ok) throw new Error(text);
      if (text && text.length > 2) return JSON.parse(text);
      return null;
    })
    .then(data => {
      if (data) {
        setSubjectDetails(data);
        // Extract the notifications array sent by the teacher
        setAnnouncements(data.notifications || []);
      } else {
        setSubjectDetails({ name: `Subject ${id}`, notifications: [] });
      }
    })
    .catch(() => setErrorMsg("Check your connection or server status"))
    .finally(() => setIsLoading(false));
  }, [id, router]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col gap-4 items-center justify-center text-blue-900 uppercase font-black tracking-widest animate-pulse">
        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl" />
        <p className="text-xs">Loading Broadcasts...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-red-500 font-black">
        <FontAwesomeIcon icon={faExclamationTriangle} className="text-4xl mb-2" /> 
        {errorMsg}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
      
      <header>
        <button onClick={() => router.push(`/dashboard/student/subject/${id}`)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-900 mb-4 transition-colors">
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Hub
        </button>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight italic">Broadcasts</h1>
            <p className="text-gray-500 font-medium text-sm mt-1">Official updates and notices for {subjectDetails?.name || `Subject ${id}`}.</p>
          </div>
          <div className="bg-orange-50 text-orange-600 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 border border-orange-100 shadow-sm">
            <FontAwesomeIcon icon={faBullhorn} className="text-lg" />
            {announcements.length} Updates
          </div>
        </div>
      </header>

      <div className="space-y-6">
        {announcements.length === 0 ? (
          <div className="text-center p-16 bg-white rounded-[3rem] border border-gray-100 border-dashed shadow-sm">
            <FontAwesomeIcon icon={faBullhorn} className="text-5xl text-gray-200 mb-4" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No data to display</p>
            <p className="text-gray-400 text-xs mt-2 font-medium">The instructor has not posted any broadcasts yet.</p>
          </div>
        ) : (
          announcements.map((ann: any, idx: number) => (
            <div key={idx} className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex gap-6">
                <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                  <FontAwesomeIcon icon={faBullhorn} className="text-xl" />
                </div>
                <div className="w-full">
                  <p className="text-gray-800 font-medium text-lg leading-relaxed whitespace-pre-wrap">{ann.message}</p>
                  
                  <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
                    <p className="text-[10px] text-gray-400 font-black uppercase flex items-center gap-2">
                      <FontAwesomeIcon icon={faClock} /> 
                      Posted: {new Date(ann.creationDate).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}