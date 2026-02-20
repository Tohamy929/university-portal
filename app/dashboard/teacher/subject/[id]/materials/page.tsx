"use client";
import { useState, useRef } from "react";
import { useParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faFileUpload, faFilePdf, faFlask, faBook, faListAlt, 
  faTrash, faPlus, faCheckCircle, faSpinner 
} from "@fortawesome/free-solid-svg-icons";

type Category = "lectures" | "sheets" | "labs";

interface Material {
  id: number;
  name: string;
  category: Category;
  date: string;
  size: string;
}

export default function TeacherMaterials() {
  const { id } = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<Category>("lectures");
  const [isUploading, setIsUploading] = useState(false);

  const [materials, setMaterials] = useState<Material[]>([
    { id: 1, name: "Lecture 01 - Introduction.pdf", category: "lectures", date: "Feb 01", size: "1.5 MB" },
    { id: 2, name: "Sheet 01 - Problem Set.pdf", category: "sheets", date: "Feb 05", size: "800 KB" },
    { id: 3, name: "Lab 01 - Safety & Equipment.pdf", category: "labs", date: "Feb 03", size: "2.1 MB" },
  ]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      // Simulate upload delay
      setTimeout(() => {
        const newFile: Material = {
          id: Date.now(),
          name: file.name,
          category: activeTab,
          date: "Just now",
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        };
        setMaterials([newFile, ...materials]);
        setIsUploading(false);
      }, 1500);
    }
  };

  const deleteFile = (fileId: number) => {
    setMaterials(materials.filter(m => m.id !== fileId));
  };

  const filteredMaterials = materials.filter(m => m.category === activeTab);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Materials: {id}</h1>
          <p className="text-gray-500 font-medium">Manage course content and student resources.</p>
        </div>
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="bg-blue-900 text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:bg-blue-800 transition flex items-center gap-3 disabled:opacity-50"
        >
          {isUploading ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faPlus} />}
          Upload to {activeTab}
        </button>
        <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept=".pdf,.doc,.docx" />
      </header>

      {/* Category Tabs */}
      <div className="flex bg-white p-2 rounded-2xl shadow-sm border border-gray-100 w-fit gap-2">
        <TabButton active={activeTab === "lectures"} label="Lectures" icon={faBook} onClick={() => setActiveTab("lectures")} />
        <TabButton active={activeTab === "sheets"} label="Sheets / Assignments" icon={faListAlt} onClick={() => setActiveTab("sheets")} />
        <TabButton active={activeTab === "labs"} label="Labs / Sections" icon={faFlask} onClick={() => setActiveTab("labs")} />
      </div>

      {/* File List */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
        {filteredMaterials.length > 0 ? (
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">
              <tr>
                <th className="p-6">Document Name</th>
                <th className="p-6">Upload Date</th>
                <th className="p-6">Size</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredMaterials.map((file) => (
                <tr key={file.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <FontAwesomeIcon icon={faFilePdf} className="text-red-500 text-lg" />
                      <span className="font-bold text-gray-800">{file.name}</span>
                    </div>
                  </td>
                  <td className="p-6 text-sm text-gray-500 font-medium">{file.date}</td>
                  <td className="p-6 text-xs text-gray-400 font-black uppercase">{file.size}</td>
                  <td className="p-6 text-right">
                    <button 
                      onClick={() => deleteFile(file.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors p-2"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-20 text-center space-y-4">
            <div className="w-20 h-20 bg-gray-50 text-gray-200 rounded-full flex items-center justify-center mx-auto text-3xl">
              <FontAwesomeIcon icon={faFileUpload} />
            </div>
            <p className="text-gray-400 font-medium italic">No files uploaded in this category yet.</p>
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
      className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-3 ${
        active ? "bg-blue-900 text-white shadow-md" : "text-gray-400 hover:bg-gray-50"
      }`}
    >
      <FontAwesomeIcon icon={icon} />
      {label}
    </button>
  );
}