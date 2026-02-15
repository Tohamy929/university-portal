"use client";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCloudUploadAlt, faFilePdf, faImage, faTrash, 
  faLock, faShieldAlt, faCheckCircle ,faFileUpload
} from "@fortawesome/free-solid-svg-icons";

export default function SubjectMaterials() {
  const { id } = useParams();
  const [role, setRole] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setRole(localStorage.getItem("userRole") || "assistant");
  }, []);

  const handleUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      alert("File published to student portal.");
    }, 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Course Materials: {id}</h1>
          <p className="text-gray-500 font-medium">Manage PDFs, images, and official examinations.</p>
        </div>
        <div className="hidden md:block text-right">
          <span className="text-[10px] font-black text-blue-900 bg-blue-50 px-3 py-1 rounded-full uppercase">
            Access Level: {role}
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Standard Material Upload (Accessible to Both) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border-2 border-dashed border-gray-200 hover:border-blue-900 transition-all group relative">
            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleUpload} />
            <div className="text-center">
              <FontAwesomeIcon icon={faCloudUploadAlt} size="2xl" className="text-blue-900 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-bold text-gray-900">Upload General Material</h3>
              <p className="text-sm text-gray-400 mt-1">Drag and drop lecture notes or lab manuals</p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-gray-800 ml-2">Active Files</h3>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                <div className="flex items-center gap-4">
                  <FontAwesomeIcon icon={faFilePdf} className="text-red-500 text-xl" />
                  <div>
                    <p className="text-sm font-bold text-gray-800">Chapter_01_Basics.pdf</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Added by Dr. Ibrahim</p>
                  </div>
                </div>
                <button className="text-gray-300 hover:text-red-500 transition px-2"><FontAwesomeIcon icon={faTrash} /></button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: High-Stakes Exams (Teacher ONLY) */}
        <div className="space-y-6">
          <div className={`p-6 rounded-3xl border transition-all ${role === 'teacher' ? 'bg-blue-900 text-white shadow-xl' : 'bg-gray-100 border-gray-200 opacity-60'}`}>
            <div className="flex items-center gap-3 mb-6">
              <FontAwesomeIcon icon={role === 'teacher' ? faShieldAlt : faLock} className={role === 'teacher' ? 'text-blue-300' : 'text-gray-400'} />
              <h3 className="font-bold uppercase tracking-widest text-xs">Official Examinations</h3>
            </div>

            {role === 'teacher' ? (
              <div className="space-y-4">
                <p className="text-sm text-blue-100 mb-4">Upload the midterm or final exam files directly to the secure server.</p>
                <button onClick={handleUpload} className="w-full py-4 bg-white/10 border border-white/20 rounded-2xl font-bold hover:bg-white/20 transition flex items-center justify-center gap-3">
                  <FontAwesomeIcon icon={faFileUpload} /> Upload Midterm
                </button>
                <button onClick={handleUpload} className="w-full py-4 bg-white/10 border border-white/20 rounded-2xl font-bold hover:bg-white/20 transition flex items-center justify-center gap-3">
                  <FontAwesomeIcon icon={faFileUpload} /> Upload Final
                </button>
              </div>
            ) : (
              <div className="py-10 text-center">
                <p className="text-gray-500 text-sm font-bold uppercase">Restricted Access</p>
                <p className="text-gray-400 text-xs mt-2 italic px-4">Only Professors can manage exam files.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}