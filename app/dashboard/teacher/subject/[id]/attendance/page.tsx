"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUserCheck, faCloudUploadAlt, faRobot, faCamera, 
  faCheck, faUserTimes, faSearch, faTimes, faVideo,
  faSync, faCalendarWeek, faLayerGroup, faBookOpen
} from "@fortawesome/free-solid-svg-icons";

import { MOCK_USERS, User } from "@/lib/mockUsers";

export default function AttendancePage() {
  const params = useParams();
  const router = useRouter();
  
  
  const [students, setStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [setup, setSetup] = useState({ group: "", type: "", week: "" });
  
  
  const [isStarted, setIsStarted] = useState(false);
  const [activeModal, setActiveModal] = useState<"live" | "capture" | null>(null);
  const [scanStatus, setScanStatus] = useState("Standing by for face scan...");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

 
  const videoRef = useRef<HTMLVideoElement>(null);
  const captureRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const teacherDept = localStorage.getItem("userDept") || "Electrical";
    const deptStudents = MOCK_USERS.filter((u: User) => u.role === "student" && u.department === teacherDept);
    const sorted = deptStudents.sort((a, b) => a.name.localeCompare(b.name));
    setStudents(sorted.map(s => ({ ...s, present: false })));
  }, []);

  
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- CAMERA UTILITIES ---
  const startStream = async (videoElement: HTMLVideoElement | null) => {
    if (!videoElement) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      videoElement.srcObject = stream;
    } catch (err) {
      alert("Camera access denied. Please check browser permissions.");
      setActiveModal(null);
    }
  };

  const stopStream = (videoElement: HTMLVideoElement | null) => {
    if (videoElement?.srcObject) {
      (videoElement.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      videoElement.srcObject = null;
    }
  };

  const takePhoto = () => {
    if (captureRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = captureRef.current.videoWidth;
      canvas.height = captureRef.current.videoHeight;
      canvas.getContext("2d")?.drawImage(captureRef.current, 0, 0);
      setCapturedImage(canvas.toDataURL("image/png"));
      stopStream(captureRef.current);
    }
  };

  // --- ATTENDANCE LOGIC ---
  const toggleAttendance = (id: string) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, present: !s.present } : s));
  };

 const submitAttendance = () => {
  setIsSubmitting(true);
  

  const subjectId = String(params.id); 

  const sessionRecord = {
    id: Date.now().toString(),
    subjectId: subjectId,
    week: setup.week, // e.g., "1"
    group: setup.group,
    type: setup.type,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    presentCount: students.filter(s => s.present).length,
    total: students.length,
    taken: true,
    roster: students.map(s => ({ 
      id: s.id, 
      name: s.name, 
      status: s.present ? 'present' : 'absent' 
    }))
  };

  const existingHistory = JSON.parse(localStorage.getItem("attendanceHistory") || "[]");
  localStorage.setItem("attendanceHistory", JSON.stringify([sessionRecord, ...existingHistory]));

  setTimeout(() => {
   
    router.push(`/dashboard/teacher/subject/${subjectId}/attendance/manage`);
  }, 1500);
};

  return (
    <div className="space-y-10 pb-40">
      
      {!isStarted ? (
        /* --- 1. SETUP VIEW --- */
        <div className="bg-white p-12 rounded-[4rem] shadow-2xl max-w-2xl mx-auto space-y-10 border border-gray-100 animate-in fade-in zoom-in-95">
           <div className="text-center space-y-2">
              <h2 className="text-3xl font-black uppercase italic text-blue-900">Session Setup</h2>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Select Logistics</p>
           </div>
           <div className="grid grid-cols-1 gap-6">
              <select onChange={(e) => setSetup({...setup, week: e.target.value})} className="p-5 bg-gray-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-900 appearance-none">
                 <option value="">Select Week</option>
                 {[1,2,3,4,5,6,7,8,9,10,11,12,13,14].map(w => <option key={w} value={w}>Week {w}</option>)}
              </select>
              <select onChange={(e) => setSetup({...setup, group: e.target.value})} className="p-5 bg-gray-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-900 appearance-none">
                 <option value="">Select Group</option>
                 <option value="G1">Group 1</option><option value="G2">Group 2</option>
              </select>
              <select onChange={(e) => setSetup({...setup, type: e.target.value})} className="p-5 bg-gray-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-900 appearance-none">
                 <option value="">Select Type</option>
                 <option value="Lecture">Lecture</option><option value="Section">Section</option>
              </select>
           </div>
           <button 
             disabled={!setup.week || !setup.group || !setup.type}
             onClick={() => setIsStarted(true)}
             className="w-full py-6 bg-blue-900 text-white rounded-[2rem] font-black uppercase tracking-widest disabled:opacity-20 transition-all hover:bg-blue-800"
           >
             Open Attendance Log
           </button>
        </div>
      ) : (
        /* --- 2. ACTIVE ATTENDANCE VIEW --- */
        <div className="space-y-10 animate-in fade-in duration-500">
           {/* TOP ACTION BAR WITH SEARCH */}
           <div className="bg-white p-8 rounded-[3.5rem] shadow-sm flex flex-col lg:flex-row justify-between items-center gap-6 border border-gray-100">
              <div className="flex items-center gap-4">
                 <div className="p-4 bg-blue-900 text-white rounded-2xl shadow-lg"><FontAwesomeIcon icon={faUserCheck} /></div>
                 <div>
                    <h1 className="font-black text-xl uppercase italic">{setup.type}: {params.id}</h1>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Week {setup.week} • {setup.group}</p>
                 </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                 {/* SEARCH BAR */}
                 <div className="relative">
                    <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
                    <input 
                      type="text" 
                      placeholder="Find Student..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl text-[10px] font-black uppercase outline-none focus:border-blue-900 w-48 transition-all"
                    />
                 </div>
                 <button 
                    onClick={() => { setActiveModal("live"); setTimeout(() => startStream(videoRef.current), 100); }} 
                    className="px-6 py-3 bg-blue-900 text-white rounded-xl font-black text-[10px] uppercase flex items-center gap-2 hover:bg-blue-800 transition-all shadow-md"
                 >
                    <FontAwesomeIcon icon={faRobot} /> AI Scan
                 </button>
                 <button 
                    onClick={() => { setActiveModal("capture"); setTimeout(() => startStream(captureRef.current), 100); }} 
                    className="px-6 py-3 bg-gray-900 text-white rounded-xl font-black text-[10px] uppercase flex items-center gap-2 hover:bg-black transition-all shadow-md"
                 >
                    <FontAwesomeIcon icon={faCamera} /> Snap
                 </button>
              </div>
           </div>

           {/* POLISHED STUDENT GRID */}
           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredStudents.map(s => (
                <button 
                  key={s.id} 
                  onClick={() => toggleAttendance(s.id)}
                  className={`p-6 rounded-[2.5rem] border-2 transition-all flex flex-col items-center justify-center gap-2 group ${s.present ? 'bg-green-50 border-green-200 shadow-inner' : 'bg-white border-gray-100 hover:border-blue-200'}`}
                >
                  <p className={`font-black text-[10px] uppercase truncate w-full ${s.present ? 'text-green-900' : 'text-gray-900'}`}>{s.name}</p>
                  <p className="text-[8px] font-bold text-gray-400">{s.id}</p>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${s.present ? 'bg-green-600 text-white shadow-lg' : 'bg-gray-100 text-gray-300'}`}>
                     <FontAwesomeIcon icon={s.present ? faCheck : faUserTimes} />
                  </div>
                </button>
              ))}
           </div>

           {/* FINAL SUBMIT BAR */}
           <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-3xl z-50">
              <div className="bg-gray-900 text-white p-6 rounded-[2.5rem] flex items-center justify-between shadow-2xl border border-white/10 backdrop-blur-md bg-opacity-95">
                 <div className="px-4">
                    <p className="text-[9px] font-black text-blue-300 uppercase tracking-widest">Marked Present</p>
                    <p className="text-2xl font-black italic">{students.filter(s => s.present).length} / {students.length}</p>
                 </div>
                 <button onClick={submitAttendance} disabled={isSubmitting} className="bg-blue-600 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-500 active:scale-95 transition-all shadow-xl">
                    {isSubmitting ? "Syncing..." : "Finalize Session"}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* --- MODAL 1: LIVE AI SCANNER --- */}
      {activeModal === "live" && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-2xl bg-black/60 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[4rem] overflow-hidden shadow-2xl border-8 border-white">
            <div className="relative aspect-video bg-black">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
              <div className="absolute top-6 left-6 flex items-center gap-3 bg-red-600 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase shadow-lg">
                <div className="w-2 h-2 bg-white rounded-full animate-ping"></div> AI Active
              </div>
            </div>
            <div className="p-10 text-center space-y-6">
              <div>
                <p className="text-blue-900 font-black text-xl uppercase italic tracking-tight">{scanStatus}</p>
                <p className="text-gray-400 text-[10px] font-bold uppercase mt-1">Stand still for 2-3 seconds</p>
              </div>
              <button 
                onClick={() => { stopStream(videoRef.current); setActiveModal(null); }}
                className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all"
              >
                Stop AI Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: PHOTO CAPTURE --- */}
      {activeModal === "capture" && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-2xl bg-black/60 animate-in zoom-in-95 duration-300">
          <div className="bg-white w-full max-w-xl rounded-[4rem] overflow-hidden shadow-2xl border-8 border-white text-center">
            {!capturedImage ? (
              <>
                <div className="relative aspect-square bg-black">
                  <video ref={captureRef} autoPlay playsInline className="w-full h-full object-cover" />
                </div>
                <div className="p-10">
                  <button onClick={takePhoto} className="w-20 h-20 bg-blue-900 text-white rounded-full shadow-2xl border-8 border-blue-100 flex items-center justify-center text-2xl mx-auto hover:scale-110 active:scale-95 transition-transform">
                    <FontAwesomeIcon icon={faCamera} />
                  </button>
                  <button onClick={() => { stopStream(captureRef.current); setActiveModal(null); }} className="mt-6 text-gray-400 font-black text-[10px] uppercase tracking-widest">Cancel</button>
                </div>
              </>
            ) : (
              <>
                <img src={capturedImage} alt="Capture" className="w-full aspect-square object-cover" />
                <div className="p-10 grid grid-cols-2 gap-4">
                  <button onClick={() => setCapturedImage(null)} className="py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-[10px] uppercase tracking-widest">Discard</button>
                  <button onClick={() => { setActiveModal(null); stopStream(captureRef.current); }} className="py-4 bg-blue-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg">Process Photo</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}