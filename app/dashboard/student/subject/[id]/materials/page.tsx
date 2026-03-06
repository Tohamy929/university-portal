"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf, faImage, faDownload, faFolderOpen } from "@fortawesome/free-solid-svg-icons";
import { DEPARTMENT_DATA } from "@/src/data/studentdata";

export default function StudentMaterials() {
  const { id } = useParams();
  const [materialsCount, setMaterialsCount] = useState(0);
  
  // Get materials count from centralized source
  useEffect(() => {
    const userDept = localStorage.getItem("userDept") || "Electrical";
    const departmentData = DEPARTMENT_DATA[userDept];
    const course = departmentData?.courses.find(c => c.id === id);
    if (course) {
      setMaterialsCount(course.materialsCount);
    }
  }, [id]);
  
  // This mock data would eventually be filtered from DEPARTMENT_DATA
  const materials = [
    { name: "Lecture 01 - Intro to Subject.pdf", type: "pdf", size: "1.2 MB" },
    { name: "Week 2 - Circuit Diagram.png", type: "image", size: "800 KB" },
    { name: "Lab Manual 2025.pdf", type: "pdf", size: "3.5 MB" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Course Materials</h1>
          <p className="text-gray-500">Download lectures, slides, and references for {id}.</p>
        </div>
        <div className="bg-blue-50 text-blue-900 px-4 py-2 rounded-2xl font-bold text-sm flex items-center gap-2 border border-blue-100">
          <FontAwesomeIcon icon={faFolderOpen} />
          {materialsCount || materials.length} Files Available
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {materials.map((file, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all group">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${file.type === 'pdf' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
              <FontAwesomeIcon icon={file.type === 'pdf' ? faFilePdf : faImage} size="lg" />
            </div>
            <h3 className="font-bold text-gray-800 text-sm mb-1 truncate">{file.name}</h3>
            <p className="text-[10px] font-black text-gray-400 uppercase">{file.size}</p>
            
            <button className="w-full mt-6 py-3 bg-gray-50 text-gray-700 rounded-xl font-bold text-xs group-hover:bg-blue-900 group-hover:text-white transition-all flex items-center justify-center gap-2">
              <FontAwesomeIcon icon={faDownload} />
              Download
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}