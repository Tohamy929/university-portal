"use client";
import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faBullhorn, faPaperPlane, faPaperclip, faImage, 
  faTrash, faClock, faFilePdf, faTimes, faArrowLeft, faSpinner, faExclamationTriangle, faCheckCircle
} from "@fortawesome/free-solid-svg-icons";

export default function TeacherAnnouncements() {
  const { id } = useParams();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error" | "warning", text: string } | null>(null);

  const [message, setMessage] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  // ✨ NEW: Auto-hide the action message after 5 seconds ✨
  useEffect(() => {
    if (actionMessage) {
      const timer = setTimeout(() => {
        setActionMessage(null);
      }, 3000);
      return () => clearTimeout(timer); // Cleanup if component unmounts
    }
  }, [actionMessage]);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) { router.push("/login"); return; }
    setAuthToken(token);
    fetchAnnouncements(token);
  }, [id, router]);

  const fetchAnnouncements = async (token: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api-proxy/Notification/GetBySubjectId/${id}`, {
  headers: { "accept": "*/*", "Authorization": `Bearer ${token}` }
});
      const text = await res.text();
      if (!res.ok) throw new Error(text);
      
      if (text && text.length > 2) {
        setAnnouncements(JSON.parse(text));
      } else {
        setAnnouncements([]);
      }
    } catch (err: any) {
      console.warn("Failed to fetch announcements:", err.message);
      setAnnouncements([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAttachedFile(file);
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && !attachedFile) return;
    
    setIsPosting(true);
    setActionMessage(null);

    try {
      const formData = new FormData();
      formData.append("Message", message);
      formData.append("SubjectId", id as string);
      if (attachedFile) formData.append("Files", attachedFile);

      const response = await fetch("/api-proxy/Notification/Create", {
        method: "POST",
        headers: { "accept": "*/*", "Authorization": `Bearer ${authToken}` },
        body: formData 
      });

      const text = await response.text();
      if (!response.ok) throw new Error(text);

      setActionMessage({ type: "success", text: "Announcement broadcasted successfully!" });
      
      const tempId = Math.floor(Math.random() * 100000);
      const newAnn = {
        id: tempId,
        message: message,
        creationDate: new Date().toISOString(),
        attachments: attachedFile ? [{ fileName: attachedFile.name, filePath: URL.createObjectURL(attachedFile) }] : []
      };
      
      setAnnouncements(prev => [newAnn, ...prev]);
      
      setMessage("");
      setAttachedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      
      fetchAnnouncements(authToken!);

    } catch (err: any) {
      setActionMessage({ type: "error", text: `Post failed: ${err.message}` });
    } finally {
      setIsPosting(false);
    }
  };

  const deleteAnnouncement = async (annId: number) => {
    if (!confirm("Delete this broadcast from the student feed?")) return;
    try {
      const response = await fetch(`/api-proxy/Notification/Delete/${annId}`, {
        method: "DELETE",
        headers: { "accept": "*/*", "Authorization": `Bearer ${authToken}` }
      });
      const text = await response.text();
      if (!response.ok) throw new Error(text);
      
      setAnnouncements(prev => prev.filter(ann => ann.id !== annId));
      
      // ✨ NEW: Added success feedback for deletion ✨
      setActionMessage({ type: "success", text: "Broadcast deleted successfully!" });
      
    } catch (err: any) {
      console.warn("Delete Error:", err.message);
      // Replaced the ugly alert() with our sleek UI error message
      setActionMessage({ type: "error", text: `Failed to delete: ${err.message}` }); 
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col gap-4 items-center justify-center text-blue-900 uppercase font-black tracking-widest animate-pulse">
        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl" />
        <p className="text-xs">Loading Broadcast Hub...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500">
      
      {/* GLOBAL ALERTS - Will auto-hide after 5 seconds! */}
      {actionMessage && (
        <div className={`p-4 rounded-2xl flex items-start gap-3 border transition-opacity duration-300 ${actionMessage.type === "error" ? "bg-red-50 border-red-200 text-red-600" : "bg-green-50 border-green-200 text-green-600"}`}>
          <FontAwesomeIcon icon={actionMessage.type === "error" ? faExclamationTriangle : faCheckCircle} className="mt-1 shrink-0" />
          <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed break-all">{actionMessage.text}</p>
        </div>
      )}

      <header>
        <button onClick={() => router.push(`/dashboard/teacher/subject/${id}`)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-900 mb-2 transition-colors">
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Hub
        </button>
        <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Broadcast Center</h1>
        <p className="text-gray-500 font-medium mt-1">Send updates and documents to all students in this course.</p>
      </header>

      <form onSubmit={handlePost} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl space-y-4 relative">
        <textarea 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What's the update for today?"
          className="w-full p-6 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-2 focus:ring-blue-900 min-h-[120px] transition-all font-medium text-gray-800"
          disabled={isPosting}
        />

        {attachedFile && (
          <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-2xl w-fit animate-in slide-in-from-left-2">
            <FontAwesomeIcon icon={attachedFile.type.startsWith("image/") ? faImage : faFilePdf} className="text-blue-900" />
            <span className="text-xs font-bold text-blue-900 truncate max-w-[200px]">{attachedFile.name}</span>
            <button type="button" onClick={() => setAttachedFile(null)} disabled={isPosting} className="w-6 h-6 bg-blue-200 text-blue-900 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors">
              <FontAwesomeIcon icon={faTimes} size="xs" />
            </button>
          </div>
        )}

        <div className="flex justify-between items-center pt-2">
          <div className="flex gap-2">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,.pdf,.doc,.docx" />
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isPosting} className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-500 hover:bg-blue-50 hover:text-blue-900 transition-all flex items-center justify-center disabled:opacity-50">
              <FontAwesomeIcon icon={faPaperclip} />
            </button>
          </div>
          <button type="submit" disabled={isPosting || (!message.trim() && !attachedFile)} className="bg-blue-900 text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:bg-blue-800 transition flex items-center gap-2 disabled:opacity-50 active:scale-95">
            {isPosting ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faPaperPlane} />} 
            Post Announcement
          </button>
        </div>
      </form>

      <div className="space-y-6">
        <h3 className="font-black text-gray-400 text-[10px] uppercase tracking-[0.2em] ml-4">Sent History</h3>
        
        {announcements.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-[3rem] border border-gray-100 border-dashed">
            <FontAwesomeIcon icon={faBullhorn} className="text-4xl text-gray-200 mb-3" />
            <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">No broadcasts sent yet.</p>
          </div>
        ) : (
          announcements.map((ann) => (
            <div key={ann.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm hover:shadow-md transition-all group">
              <div className="flex gap-6">
                <div className="w-12 h-12 bg-blue-50 text-blue-900 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon icon={faBullhorn} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className="text-gray-800 font-medium leading-relaxed mb-4 whitespace-pre-wrap">{ann.message}</p>
                    <button onClick={() => deleteAnnouncement(ann.id)} className="text-gray-200 hover:text-red-500 transition-colors p-2 shrink-0">
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                  
                  {ann.attachments && ann.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {ann.attachments.map((file: any, idx: number) => (
                        <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 inline-flex items-center gap-3">
                          <FontAwesomeIcon icon={file.fileName?.toLowerCase().endsWith(".pdf") ? faFilePdf : faImage} className="text-gray-400" />
                          <span className="text-xs font-bold text-gray-600 truncate max-w-[150px]">{file.fileName}</span>
                          <a href={file.filePath} target="_blank" rel="noopener noreferrer" className="ml-2 text-[10px] font-black uppercase text-blue-900 hover:underline">
                            View
                          </a>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-2 mt-6">
                    <FontAwesomeIcon icon={faClock} /> 
                    {new Date(ann.creationDate).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}