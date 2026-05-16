"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faFilePdf, faFileAlt, faDownload, faFolderOpen, 
  faSpinner, faExclamationTriangle, faArrowLeft 
} from "@fortawesome/free-solid-svg-icons";

export default function StudentMaterials() {
  const { id } = useParams();
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [subjectDetails, setSubjectDetails] = useState<any>(null);
  const [materials, setMaterials] = useState<any[]>([]);

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
        // Extract the courseMaterials array which contains lectures/sections
        setMaterials(data.courseMaterials || []);
      } else {
        setSubjectDetails({ name: `Subject ${id}`, courseMaterials: [] });
      }
    })
    .catch(() => setErrorMsg("Check your connection or server status"))
    .finally(() => setIsLoading(false));
  }, [id, router]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col gap-4 items-center justify-center text-blue-900 uppercase font-black tracking-widest animate-pulse">
        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl" />
        <p className="text-xs">Loading Course Materials...</p>
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
    <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
      
      <header>
        <button onClick={() => router.push(`/dashboard/student/subject/${id}`)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-900 mb-4 transition-colors">
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Hub
        </button>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight italic">Course Materials</h1>
            <p className="text-gray-500 font-medium text-sm mt-1">Download lectures, slides, and references for {subjectDetails?.name || `Subject ${id}`}.</p>
          </div>
          <div className="bg-blue-50 text-blue-900 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 border border-blue-100 shadow-sm">
            <FontAwesomeIcon icon={faFolderOpen} className="text-lg" />
            {materials.length} Files Available
          </div>
        </div>
      </header>

      {materials.length === 0 ? (
        <div className="text-center p-16 bg-white rounded-[3rem] border border-gray-100 border-dashed shadow-sm">
          <FontAwesomeIcon icon={faFolderOpen} className="text-5xl text-gray-200 mb-4" />
          <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No data to display</p>
          <p className="text-gray-400 text-xs mt-2 font-medium">No resources have been uploaded for this course yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((file: any, idx: number) => {
            const isPdf = file.fileName?.toLowerCase().endsWith('.pdf');
            return (
              <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all group flex flex-col justify-between min-h-[200px]">
                <div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isPdf ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-900'}`}>
                    <FontAwesomeIcon icon={isPdf ? faFilePdf : faFileAlt} size="lg" />
                  </div>
                  <h3 className="font-bold text-gray-800 text-sm mb-1 leading-tight break-words" title={file.fileName || file.name}>
                    {file.fileName || file.name}
                  </h3>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">
                    ID: {file.id || "Resource"}
                  </p>
                </div>
                
                <a 
                  href={file.filePath || "#"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full mt-6 py-4 bg-gray-50 text-gray-700 rounded-2xl font-black uppercase tracking-widest text-[10px] group-hover:bg-blue-900 group-hover:text-white transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <FontAwesomeIcon icon={faDownload} />
                  Download File
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}