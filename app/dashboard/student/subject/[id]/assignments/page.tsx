"use client";
import { useState, useRef } from "react";
import { useParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCloudUploadAlt, faFilePdf, faCheckCircle, 
  faClock, faExclamationCircle, faTimes 
} from "@fortawesome/free-solid-svg-icons";

export default function StudentAssignments() {
  const { id } = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [assignments, setAssignments] = useState([
    { id: "asm-1", title: "Assignment 1: Circuit Analysis", status: "graded", grade: 18, max: 20, deadline: "Closed" },
    { id: "asm-2", title: "Assignment 2: Signal Processing", status: "pending", grade: null, max: 20, deadline: "Tomorrow" },
    { id: "asm-3", title: "Lab Report 1: Oscilloscopes", status: "not-submitted", grade: null, max: 20, deadline: "In 3 days" },
  ]);

  const handleFileUpload = (asmId: string) => {
    // Simulate an upload action
    setAssignments(prev => prev.map(asm => 
      asm.id === asmId ? { ...asm, status: "pending" } : asm
    ));
    alert("Assignment submitted successfully! Status: Not Reviewed.");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-700">
      <header>
        <h1 className="text-3xl font-black text-gray-900 uppercase italic">Assignments: {id}</h1>
        <p className="text-gray-500 font-medium">Track your deadlines and submit your laboratory sheets.</p>
      </header>

      <div className="grid gap-6">
        {assignments.map((asm) => (
          <div key={asm.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 group hover:shadow-md transition-all">
            <div className="flex items-center gap-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${
                asm.status === 'graded' ? 'bg-green-50 text-green-600' : 
                asm.status === 'pending' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-900'
              }`}>
                <FontAwesomeIcon icon={asm.status === 'graded' ? faCheckCircle : faFilePdf} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{asm.title}</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Deadline: {asm.deadline} • Max Grade: {asm.max}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              {asm.status === "graded" ? (
                <div className="text-right">
                  <p className="text-2xl font-black text-blue-900">{asm.grade}<span className="text-sm text-gray-300">/{asm.max}</span></p>
                  <span className="text-[10px] font-black uppercase text-green-600">Reviewed</span>
                </div>
              ) : asm.status === "pending" ? (
                <div className="flex flex-col items-center md:items-end">
                  <span className="px-4 py-2 bg-orange-50 text-orange-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <FontAwesomeIcon icon={faClock} /> Not Reviewed
                  </span>
                  <p className="text-[9px] text-gray-400 font-bold mt-2 italic text-center">Waiting for instructor feedback</p>
                </div>
              ) : (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full md:w-auto bg-blue-900 text-white px-8 py-3 rounded-2xl font-black shadow-lg hover:bg-blue-800 transition flex items-center justify-center gap-3"
                >
                  <FontAwesomeIcon icon={faCloudUploadAlt} />
                  Submit Sheet
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={() => handleFileUpload("asm-3")} 
        accept=".pdf"
      />
    </div>
  );
}