"use client";
import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faFileUpload, faFilePdf, faFlask, faBook, faListAlt, 
  faTrash, faPlus, faSpinner, faArrowLeft, faExclamationTriangle, faCheckCircle, faDownload
} from "@fortawesome/free-solid-svg-icons";

// We map our UI tabs to the expected backend categories
type Category = "lectures" | "sheets" | "labs";

export default function TeacherMaterials() {
  const { id } = useParams();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState<Category>("lectures");
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error" | "warning", text: string } | null>(null);

  // REAL DATA STATES
  const [materialTypes, setMaterialTypes] = useState<any[]>([]);
  const [materials, setMaterials] = useState({ lectures: [], sheets: [], labs: [] });

  // UPLOAD FORM STATE (Used when the hidden file input is triggered)
  const [pendingUpload, setPendingUpload] = useState<File | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) { router.push("/login"); return; }
    setAuthToken(token);
    loadMaterials(token);
  }, [id, router]);

  const loadMaterials = async (token: string) => {
    setIsLoading(true);
    try {
      // 1. Fetch Types
      const typeRes = await fetch("http://smartattend456-001-site1.qtempurl.com/api/Subject/GetSubjectMaterialType", { 
        headers: { "Authorization": `Bearer ${token}` } 
      });
      if (typeRes.ok) setMaterialTypes(await typeRes.json());

      // 2. Fetch Existing Materials
      const matRes = await fetch(`http://smartattend456-001-site1.qtempurl.com/api/Subject/GetMaterialsById/${id}`, { 
        headers: { "Authorization": `Bearer ${token}` } 
      });
      
      if (matRes.ok) {
        const text = await matRes.text();
        // If it's a completely new subject, it might return empty text or []
        if (text && text.length > 2) { 
          const matData = JSON.parse(text);
          const categorized = matData[0] || {};
          
          setMaterials({
            lectures: categorized.lectureMaterials || [],
            labs: categorized.sectionMaterials || [],
            sheets: categorized.assigmnetMaterials || [] // Handling backend typo!
          });
        }
      }
    } catch (err) {
      console.error("Failed to load materials data", err);
    } finally {
      setIsLoading(false);
    }
  };

  // --- UPLOAD HANDLER ---
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Find the corresponding Type ID for the active tab from the backend list
    // Fallback guesses if the backend list is empty/unmatched
    let typeId = 1; 
    if (activeTab === "sheets") typeId = materialTypes.find(t => t.name.toLowerCase().includes("assign"))?.id || 3;
    if (activeTab === "labs") typeId = materialTypes.find(t => t.name.toLowerCase().includes("section") || t.name.toLowerCase().includes("lab"))?.id || 2;
    if (activeTab === "lectures") typeId = materialTypes.find(t => t.name.toLowerCase().includes("lecture"))?.id || 1;

    setIsUploading(true);
    setActionMessage(null);
    
    try {
      const formData = new FormData();
      formData.append("SubjectId", id as string);
      formData.append("MaterialType", typeId.toString());
      formData.append("Name", file.name);
      formData.append("File", file);
      
      // If it's an assignment/sheet, provide defaults for score/deadline
      if (activeTab === "sheets") {
        formData.append("Score", "10"); 
        
        // Add 7 days to current date for a default deadline
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        formData.append("Deadline", nextWeek.toISOString().split('T')[0]); 
      }

      const response = await fetch("http://smartattend456-001-site1.qtempurl.com/api/Subject/UploadMaterial", {
        method: "POST",
        headers: { "accept": "*/*", "Authorization": `Bearer ${authToken}` },
        body: formData 
      });

      const text = await response.text();
      if (!response.ok) throw new Error(text);

      setActionMessage({ type: "success", text: `${file.name} uploaded successfully to ${activeTab}!` });
      loadMaterials(authToken!); // Refresh list
    } catch (err: any) {
      setActionMessage({ type: "error", text: err.message });
    } finally { 
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = ""; // Reset input
    }
  };

  // --- DELETE HANDLER ---
  const deleteFile = async (materialId: number) => {
    if (!confirm("Are you sure you want to delete this material?")) return;
    try {
      const response = await fetch(`http://smartattend456-001-site1.qtempurl.com/api/Subject/DeleteMaterial/${materialId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      const text = await response.text();
      if (!response.ok) throw new Error(text);
      
      setActionMessage({ type: "success", text: "Material deleted successfully." });
      loadMaterials(authToken!);
    } catch (err: any) {
      console.warn("Delete Error:", err.message);
      setActionMessage({ type: "error", text: `Delete failed: ${err.message}` });
    }
  };

  const currentMaterialsList = materials[activeTab] || [];

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col gap-4 items-center justify-center text-blue-900 uppercase font-black tracking-widest animate-pulse">
        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl" />
        <p className="text-xs">Syncing Cloud Materials...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* GLOBAL ALERTS */}
      {actionMessage && (
        <div className={`p-4 rounded-2xl flex items-start gap-3 border ${actionMessage.type === "error" ? "bg-red-50 border-red-200 text-red-600" : "bg-green-50 border-green-200 text-green-600"}`}>
          <FontAwesomeIcon icon={actionMessage.type === "error" ? faExclamationTriangle : faCheckCircle} className="mt-1 shrink-0" />
          <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed break-all">{actionMessage.text}</p>
        </div>
      )}

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <button onClick={() => router.push(`/dashboard/teacher/subject/${id}`)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-900 mb-2 transition-colors">
            <FontAwesomeIcon icon={faArrowLeft} /> Back to Hub
          </button>
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Materials Manager</h1>
          <p className="text-gray-500 font-medium text-sm mt-1">Manage course content and student resources.</p>
        </div>
        
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="bg-blue-900 text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:bg-blue-800 transition flex items-center gap-3 disabled:opacity-50"
        >
          {isUploading ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faPlus} />}
          Upload to {activeTab}
        </button>
        {/* Hidden input, triggered by the button above */}
        <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.png" />
      </header>

      {/* Category Tabs */}
      <div className="flex bg-white p-2 rounded-2xl shadow-sm border border-gray-100 w-fit gap-2 overflow-x-auto max-w-full">
        <TabButton active={activeTab === "lectures"} label="Lectures" icon={faBook} onClick={() => setActiveTab("lectures")} />
        <TabButton active={activeTab === "sheets"} label="Sheets / Assignments" icon={faListAlt} onClick={() => setActiveTab("sheets")} />
        <TabButton active={activeTab === "labs"} label="Labs / Sections" icon={faFlask} onClick={() => setActiveTab("labs")} />
      </div>

      {/* File List */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
        {currentMaterialsList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                <tr>
                  <th className="p-6">Document Name</th>
                  {activeTab === "sheets" && <th className="p-6">Deadline</th>}
                  <th className="p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {currentMaterialsList.map((file: any) => (
                  <tr key={file.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 text-blue-900 rounded-xl flex items-center justify-center shadow-sm shrink-0">
                          <FontAwesomeIcon icon={faFilePdf} className="text-lg" />
                        </div>
                        <span className="font-bold text-gray-800 text-sm max-w-[300px] truncate block" title={file.name}>{file.name}</span>
                      </div>
                    </td>
                    
                    {activeTab === "sheets" && (
                      <td className="p-6">
                         {file.deadline ? (
                            <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                               Due: {new Date(file.deadline).toLocaleDateString()}
                            </span>
                         ) : <span className="text-gray-400 text-xs">-</span>}
                      </td>
                    )}

                    <td className="p-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a 
                          href={file.filePath} target="_blank" rel="noopener noreferrer"
                          className="w-10 h-10 flex items-center justify-center bg-blue-50 text-blue-900 rounded-xl hover:bg-blue-900 hover:text-white transition-colors"
                          title="Download"
                        >
                          <FontAwesomeIcon icon={faDownload} />
                        </a>
                        <button 
                          onClick={() => deleteFile(file.id)}
                          className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors"
                          title="Delete File"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-20 text-center space-y-4">
            <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto text-3xl shadow-inner">
              <FontAwesomeIcon icon={faFileUpload} />
            </div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Cloud directory empty.</p>
            <p className="text-gray-300 font-medium text-xs italic">Click the upload button to add {activeTab} materials.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, label, icon, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-3 whitespace-nowrap ${
        active ? "bg-blue-900 text-white shadow-md" : "text-gray-400 hover:bg-gray-50"
      }`}
    >
      <FontAwesomeIcon icon={icon} />
      {label}
    </button>
  );
}