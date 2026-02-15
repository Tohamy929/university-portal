"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRobot, faCheck, faTimes, faSave, faUserPlus, faSpinner,faCheckCircle, faStopCircle, faPlayCircle } from "@fortawesome/free-solid-svg-icons";

export default function TeacherAttendance() {
  const { id } = useParams();
  const [step, setStep] = useState<"setup" | "scanning" | "report">("setup");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [students, setStudents] = useState([
    { id: "s1", name: "Ahmed Ali", status: "present", confidence: 0.98 },
    { id: "s4", name: "Sherrif Mahmoud", status: "absent", confidence: 0.00 },
    { id: "s5", name: "Youssef Sedik", status: "present", confidence: 0.92 },
  ]);

  const startScanning = () => {
    if (!selectedGroup) return alert("Please select a group first.");
    setStep("scanning");
   
    setTimeout(() => setStep("report"), 4000); 
  };

  const toggleStatus = (studentId: string) => {
    setStudents(prev => prev.map(s => 
      s.id === studentId ? { ...s, status: s.status === "present" ? "absent" : "present" } : s
    ));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <h1 className="text-3xl font-black text-gray-900">Attendance: {id}</h1>

      
      {step === "setup" && (
        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm text-center space-y-6">
          <div className="w-20 h-20 bg-blue-50 text-blue-900 rounded-3xl flex items-center justify-center mx-auto text-3xl">
            <FontAwesomeIcon icon={faRobot} />
          </div>
          <div className="max-w-xs mx-auto space-y-4">
            <h3 className="text-xl font-bold">New Session</h3>
            <select 
              className="w-full p-4 bg-gray-50 border rounded-2xl outline-none font-bold"
              onChange={(e) => setSelectedGroup(e.target.value)}
              value={selectedGroup}
            >
              <option value="">Select Group...</option>
              <option value="G1">Group 1 (Lecture)</option>
              <option value="G2">Group 2 (Section)</option>
            </select>
            <button 
              onClick={startScanning}
              className="w-full py-4 bg-blue-900 text-white rounded-2xl font-black shadow-lg hover:bg-blue-800 transition flex items-center justify-center gap-3"
            >
              <FontAwesomeIcon icon={faPlayCircle} />
              Begin AI Attendance
            </button>
          </div>
        </div>
      )}

     
      {step === "scanning" && (
        <div className="bg-blue-900 p-20 rounded-[3rem] text-white text-center space-y-8 shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <FontAwesomeIcon icon={faSpinner} spin className="text-6xl text-blue-300 mb-6" />
            <h2 className="text-3xl font-black tracking-tight">Attendance in Progress...</h2>
            <p className="text-blue-200">AI Algorithm is currently scanning and verifying student identities.</p>
            <button 
              onClick={() => setStep("report")}
              className="mt-10 px-8 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition flex items-center gap-2 mx-auto"
            >
              <FontAwesomeIcon icon={faStopCircle} /> Stop Scanning
            </button>
          </div>
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
        </div>
      )}

      
      {step === "report" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-green-50 p-6 rounded-3xl border border-green-100 text-green-800">
            <div className="flex items-center gap-4">
              <FontAwesomeIcon icon={faCheckCircle} className="text-2xl" />
              <p className="font-bold">Scan Complete. {students.filter(s => s.status === 'present').length} Students Found.</p>
            </div>
            <button className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold text-sm shadow-md" onClick={() => alert("Attendance Saved!")}>
              <FontAwesomeIcon icon={faSave} className="mr-2" /> Confirm & Save
            </button>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">
                <tr>
                  <th className="p-6">Student</th>
                  <th className="p-6 text-center">Status</th>
                  <th className="p-6 text-right">Manual Override</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-6">
                      <p className="font-bold text-gray-800">{student.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">{student.id}</p>
                    </td>
                    <td className="p-6 text-center">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${student.status === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <button onClick={() => toggleStatus(student.id)} className={`p-2 rounded-lg ${student.status === 'present' ? 'text-red-400' : 'text-green-400'}`}>
                        <FontAwesomeIcon icon={student.status === 'present' ? faTimes : faCheck} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-bold hover:border-blue-900 hover:text-blue-900 transition flex items-center justify-center gap-2">
            <FontAwesomeIcon icon={faUserPlus} /> Add Student Manually
          </button>
        </div>
      )}
    </div>
  );
}