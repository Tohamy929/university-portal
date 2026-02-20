"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faRobot, faKeyboard, faCheck, faTimes, faSave, 
  faUserPlus, faSpinner, faPlayCircle, faUserCheck, faArrowLeft 
} from "@fortawesome/free-solid-svg-icons";

interface AttendanceStudent {
  id: string;
  name: string;
  status: "present" | "absent";
  confidence?: number;
}

export default function TeacherAttendance() {
  const { id } = useParams();
  const [step, setStep] = useState<"setup" | "scanning" | "report" | "success">("setup");
  const [method, setMethod] = useState<"AI" | "Manual" | null>(null);
  const [selectedSession, setSelectedSession] = useState("");
  const [showMissingPool, setShowMissingPool] = useState(false);
  const [students, setStudents] = useState<AttendanceStudent[]>([]);

  const fullGroupList = [
    { id: "20210101", name: "Ahmed Ali" },
    { id: "20210502", name: "Sherrif Mahmoud" },
    { id: "20210903", name: "Youssef Sedik" },
    { id: "20210888", name: "Sara Hassan" },
    { id: "20210777", name: "Karim Walid" },
  ];

  const startSession = () => {
    if (!selectedSession || !method) return alert("Please select a session and method.");
    if (method === "Manual") {
      setStudents(fullGroupList.map(s => ({ ...s, status: "absent" })));
      setStep("report");
    } else {
      setStep("scanning");
      setTimeout(() => {
        setStudents(fullGroupList.map((s, idx) => ({
          ...s,
          status: idx < 2 ? "present" : "absent",
          confidence: idx < 2 ? 0.95 : 0,
        })));
        setStep("report");
      }, 2500);
    }
  };

  const handleUpload = () => {
    // In a real app, you'd send 'students' to your database here
    setStep("success");
  };

  const resetSession = () => {
    setStep("setup");
    setMethod(null);
    setSelectedSession("");
    setShowMissingPool(false);
    setStudents([]);
  };

  const toggleStatus = (studentId: string) => {
    setStudents(prev => prev.map(s => 
      s.id === studentId ? { ...s, status: s.status === "present" ? "absent" : "present" } : s
    ));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Attendance Session</h1>
          <p className="text-gray-500 font-bold uppercase text-xs tracking-widest mt-1">
            {id} • {selectedSession || "Select Session"}
          </p>
        </div>
        {step === "report" && (
          <button onClick={handleUpload} className="bg-green-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg flex items-center gap-2 hover:bg-green-700 transition-all">
            <FontAwesomeIcon icon={faSave} /> Upload Report
          </button>
        )}
      </header>

      {/* STEP 1: SETUP */}
      {step === "setup" && (
        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button onClick={() => setMethod("AI")} className={`p-10 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-4 ${method === 'AI' ? 'border-blue-900 bg-blue-50 shadow-inner' : 'border-gray-50 hover:border-blue-100 bg-white'}`}>
              <FontAwesomeIcon icon={faRobot} className={`text-4xl ${method === 'AI' ? 'text-blue-900' : 'text-gray-200'}`} />
              <p className={`font-black uppercase text-xs tracking-widest ${method === 'AI' ? 'text-blue-900' : 'text-gray-400'}`}>AI Recognition</p>
            </button>
            <button onClick={() => setMethod("Manual")} className={`p-10 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-4 ${method === 'Manual' ? 'border-blue-900 bg-blue-50 shadow-inner' : 'border-gray-50 hover:border-blue-100 bg-white'}`}>
              <FontAwesomeIcon icon={faKeyboard} className={`text-4xl ${method === 'Manual' ? 'text-blue-900' : 'text-gray-200'}`} />
              <p className={`font-black uppercase text-xs tracking-widest ${method === 'Manual' ? 'text-blue-900' : 'text-gray-400'}`}>Manual List</p>
            </button>
          </div>

          <div className="max-w-md mx-auto space-y-4">
            <select className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-gray-700" onChange={(e) => setSelectedSession(e.target.value)} value={selectedSession}>
              <option value="">Select Group & Type...</option>
              <optgroup label="Group 1"><option value="G1-Lecture">Group 1 - Lecture</option><option value="G1-Section">Group 1 - Section</option></optgroup>
              <optgroup label="Group 2"><option value="G2-Lecture">Group 2 - Lecture</option><option value="G2-Section">Group 2 - Section</option></optgroup>
            </select>
            <button onClick={startSession} className="w-full py-4 bg-blue-900 text-white rounded-2xl font-black shadow-lg hover:bg-blue-800 transition flex items-center justify-center gap-3">
              <FontAwesomeIcon icon={faPlayCircle} /> Launch Session
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: SCANNING */}
      {step === "scanning" && (
        <div className="bg-blue-900 p-20 rounded-[3rem] text-white text-center shadow-2xl">
          <FontAwesomeIcon icon={faSpinner} spin className="text-6xl text-blue-300 mb-6" />
          <h2 className="text-3xl font-black">AI Analyzing...</h2>
        </div>
      )}

      {/* STEP 3: REPORT */}
      {step === "report" && (
        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] border-b">
                <tr><th className="p-6">Student</th><th className="p-6 text-center">Status</th><th className="p-6 text-right">Action</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {students.filter(s => (method === "AI" && !showMissingPool ? s.status === "present" : true)).map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50/50">
                    <td className="p-6"><p className="font-bold text-gray-800">{student.name}</p><p className="text-[10px] text-gray-400 font-bold">{student.id}</p></td>
                    <td className="p-6 text-center">
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase ${student.status === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <button onClick={() => toggleStatus(student.id)} className={`w-10 h-10 rounded-full ${student.status === 'present' ? 'text-red-400 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}>
                        <FontAwesomeIcon icon={student.status === 'present' ? faTimes : faCheck} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {method === "AI" && !showMissingPool && (
            <button onClick={() => setShowMissingPool(true)} className="w-full py-5 border-2 border-dashed border-blue-200 rounded-3xl text-blue-900 font-bold hover:bg-blue-50 transition-all flex items-center justify-center gap-3">
              <FontAwesomeIcon icon={faUserPlus} /> Review Missing Students
            </button>
          )}
        </div>
      )}

      {/* STEP 4: SUCCESS / RETURN */}
      {step === "success" && (
        <div className="bg-white p-20 rounded-[3rem] border border-gray-100 shadow-xl text-center space-y-6">
          <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto text-3xl">
            <FontAwesomeIcon icon={faUserCheck} />
          </div>
          <h2 className="text-3xl font-black text-gray-900">Attendance Recorded!</h2>
          <p className="text-gray-500 max-w-sm mx-auto font-medium">The session data for {selectedSession} has been successfully uploaded to the HTI server.</p>
          <button 
            onClick={resetSession}
            className="mt-8 bg-blue-900 text-white px-10 py-4 rounded-2xl font-black shadow-lg hover:scale-105 transition-all flex items-center gap-3 mx-auto"
          >
            <FontAwesomeIcon icon={faArrowLeft} /> Finish & Return
          </button>
        </div>
      )}
    </div>
  );
}