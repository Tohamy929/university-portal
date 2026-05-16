"use client";
import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faFileAlt, faUpload, faTrash, faArrowLeft, faCheckCircle, 
  faExclamationTriangle, faSpinner, faClock, faFilePdf, faCheck
} from "@fortawesome/free-solid-svg-icons";

export default function StudentAssignments() {
  const { id } = useParams();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error" | "warning", text: string } | null>(null);
  
  const [assignments, setAssignments] = useState<any[]>([]);
  const [activeAssignmentId, setActiveAssignmentId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) { router.push("/login"); return; }
    setAuthToken(token);
    fetchAssignments(token);
  }, [id, router]);

  const fetchAssignments = async (token: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://smartattend456-001-site1.qtempurl.com/api/Assignment/GetBySubjectId/${id}`, {
        headers: { "accept": "*/*", "Authorization": `Bearer ${token}` }
      });
      const text = await response.text();
      if (!response.ok) throw new Error(text);
      if (text && text.length > 2) {
        setAssignments(JSON.parse(text));
      } else {
        setAssignments([]);
      }
    } catch (err) {
      setErrorMsg("Check your connection or server status");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeAssignmentId || !authToken) return;

    setIsSubmitting(true);
    setActionMessage(null);

    try {
      const base64String = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]); 
        reader.onerror = error => reject(error);
      });

      const payload = { assignmentId: activeAssignmentId, file: base64String };

      const response = await fetch("http://smartattend456-001-site1.qtempurl.com/api/Assignment/SubmitSheet", {
        method: "POST", headers: { "Content-Type": "application/json", "accept": "*/*", "Authorization": `Bearer ${authToken}` }, body: JSON.stringify(payload)
      });

      const text = await response.text();
      if (!response.ok) throw new Error(text);

      setActionMessage({ type: "success", text: "Assignment submitted successfully!" });
      await fetchAssignments(authToken); // Strict re-fetch

    } catch (err: any) {
      setActionMessage({ type: "error", text: `Submission failed: ${err.message}` });
    } finally {
      setIsSubmitting(false); setActiveAssignmentId(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const deleteSubmission = async (submissionId: number) => {
    if (!authToken || !confirm("Unsubmit this file?")) return;
    try {
      const response = await fetch(`http://smartattend456-001-site1.qtempurl.com/api/Assignment/DeleteAssignmentSubmission/${submissionId}`, {
        method: "DELETE", headers: { "accept": "*/*", "Authorization": `Bearer ${authToken}` }
      });
      const text = await response.text();
      if (!response.ok) throw new Error(text);

      setActionMessage({ type: "success", text: "Submission deleted." });
      await fetchAssignments(authToken); // Strict re-fetch
    } catch (err: any) {
      setActionMessage({ type: "error", text: `Failed to delete submission: ${err.message}` });
    }
  };

  if (isLoading) return <div className="min-h-screen flex flex-col items-center justify-center text-blue-900 font-black animate-pulse"><FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl mb-2" /> Loading Workspace...</div>;
  if (errorMsg) return <div className="min-h-screen flex flex-col items-center justify-center text-red-500 font-black"><FontAwesomeIcon icon={faExclamationTriangle} className="text-4xl mb-2" /> {errorMsg}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
      
      {actionMessage && (
        <div className={`p-4 rounded-2xl flex items-start gap-3 border ${actionMessage.type === "error" ? "bg-red-50 border-red-200 text-red-600" : "bg-green-50 border-green-200 text-green-600"}`}>
          <FontAwesomeIcon icon={actionMessage.type === "error" ? faExclamationTriangle : faCheckCircle} className="mt-1 shrink-0" />
          <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">{actionMessage.text}</p>
        </div>
      )}

      <header>
        <button onClick={() => router.push(`/dashboard/student/subject/${id}`)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-900 mb-4 transition-colors">
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Hub
        </button>
        <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight italic">Assignments</h1>
      </header>

      <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept=".pdf,.doc,.docx" />

      <div className="space-y-6">
        {assignments.length === 0 ? (
          <div className="text-center p-16 bg-gray-50 rounded-[3rem] border border-gray-200 border-dashed">
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No data to display</p>
          </div>
        ) : (
          assignments.map((assignment) => {
            const isPastDue = new Date(assignment.deadline) < new Date() && !assignment.submission;
            return (
              <div key={assignment.id} className={`p-8 rounded-[2.5rem] border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${assignment.submission ? 'bg-green-50/30 border-green-100' : 'bg-white border-gray-100'}`}>
                <div className="flex gap-5 items-start">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-inner ${assignment.submission ? 'bg-green-100 text-green-600' : isPastDue ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-900'}`}>
                    <FontAwesomeIcon icon={assignment.submission ? faCheck : faFileAlt} />
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 text-lg uppercase italic">{assignment.title}</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-2 flex items-center gap-2">
                      <FontAwesomeIcon icon={faClock} /> Due: {new Date(assignment.deadline).toLocaleString()} 
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg ml-2">{assignment.score} Pts</span>
                    </p>
                  </div>
                </div>

                <div className="w-full md:w-auto flex flex-col items-end gap-3">
                  {assignment.submission ? (
                    <div className="flex items-center gap-3 bg-white border border-green-200 px-5 py-4 rounded-2xl shadow-sm">
                      <FontAwesomeIcon icon={faFilePdf} className="text-green-600 text-lg" />
                      <span className="text-xs font-bold text-gray-700 truncate max-w-[150px]">{assignment.submission.fileName}</span>
                      <button onClick={() => deleteSubmission(assignment.submission.id)} className="w-8 h-8 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors ml-4" title="Unsubmit">
                        <FontAwesomeIcon icon={faTrash} size="sm" />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => { setActiveAssignmentId(assignment.id); fileInputRef.current?.click(); }}
                      disabled={isSubmitting || isPastDue}
                      className={`px-8 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center gap-3 ${isPastDue ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-900 text-white hover:bg-blue-800 active:scale-95'}`}
                    >
                      {isSubmitting && activeAssignmentId === assignment.id ? <FontAwesomeIcon icon={faSpinner} spin /> : isPastDue ? "Locked" : <><FontAwesomeIcon icon={faUpload} /> Upload Work</>}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}