"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUserCheck, faCloudUploadAlt, faRobot, faCamera, 
  faCheck, faUserTimes, faSearch, faTimes, faSync,
  faCalendarWeek, faLayerGroup, faBookOpen, faLink, faUnlink,
  faCircleNotch
} from "@fortawesome/free-solid-svg-icons";

import { MOCK_USERS, User } from "@/lib/mockUsers";

export default function AttendancePage() {
  const params = useParams();
  const router = useRouter();
  
  // DATA STATES
  const [students, setStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [setup, setSetup] = useState({ group: "", type: "", week: "" });
  
  // UI & AI STATES
  const [isStarted, setIsStarted] = useState(false);
  const [activeModal, setActiveModal] = useState<"live" | "capture" | null>(null);
  const [scanStatus, setScanStatus] = useState("Standing by...");
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastMatchedId, setLastMatchedId] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiServerOnline, setAiServerOnline] = useState<boolean | null>(null);

  // REFS FOR STALE CLOSURE PROTECTION
  const videoRef = useRef<HTMLVideoElement>(null);
  const captureRef = useRef<HTMLVideoElement>(null);
  const studentsRef = useRef<any[]>([]);
  const isAiProcessingRef = useRef(false);
  const activeModalRef = useRef<string | null>(null);

  // Sync refs with state
  useEffect(() => { studentsRef.current = students; }, [students]);
  useEffect(() => { isAiProcessingRef.current = isAiProcessing; }, [isAiProcessing]);
  useEffect(() => { activeModalRef.current = activeModal; }, [activeModal]);

  // --- HEARTBEAT ---
  useEffect(() => {
    const checkServer = async () => {
      try {
        await fetch("http://127.0.0.1:8000/", { method: "GET", mode: 'no-cors' });
        setAiServerOnline(true);
      } catch (e) {
        setAiServerOnline(false);
      }
    };
    checkServer();
    const interval = setInterval(checkServer, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const teacherDept = localStorage.getItem("userDept") || "Electrical";
    const deptStudents = MOCK_USERS.filter((u: User) => u.role === "student" && u.department === teacherDept);
    const sorted = deptStudents.sort((a, b) => a.name.localeCompare(b.name));
    setStudents(sorted.map(s => ({ ...s, present: false })));
  }, []);

  // --- SYNC TO DEVICE ---
  const syncToDevice = async (updatedStudents: any[]) => {
    if (!aiServerOnline) return;
    setIsSyncing(true);
    try {
      const payload = {
        subjectId: params.id,
        week: setup.week,
        group: setup.group,
        timestamp: new Date().toISOString(),
        students: updatedStudents.map(s => ({ id: s.id, name: s.name, present: s.present }))
      };
      await fetch("http://127.0.0.1:8000/sync_roster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.warn("Device sync failed.");
    } finally {
      setTimeout(() => setIsSyncing(false), 800);
    }
  };

  // --- AI LOGIC (FIXED FOR STALE CLOSURES) ---
  const markStudentPresent = (id: string) => {
    const currentStudents = studentsRef.current;
    const newStudents = currentStudents.map(s => 
      s.id.toLowerCase() === id.toLowerCase() ? { ...s, present: true } : s
    );
    setStudents(newStudents);
    setLastMatchedId(id);
    setScanStatus(`Match Confirmed: ${id.toUpperCase()}`);
    syncToDevice(newStudents);
  };

  const handleRescan = () => {
    if (lastMatchedId) {
      const currentStudents = studentsRef.current;
      const newStudents = currentStudents.map(s => 
        s.id.toLowerCase() === lastMatchedId.toLowerCase() ? { ...s, present: false } : s
      );
      setStudents(newStudents);
      setLastMatchedId(null);
      setScanStatus("Match cleared. Rescanning...");
      syncToDevice(newStudents);
    }
  };

  const processLiveFrame = async () => {
    // Check REFS instead of STATE to avoid stale closures
    if (!videoRef.current || activeModalRef.current !== "live" || isAiProcessingRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
    
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg'));
    if (!blob) return;

    const formData = new FormData();
    formData.append("file", blob, "frame.jpg");

    try {
      setIsAiProcessing(true); // This updates the ref via useEffect
      const response = await fetch("http://127.0.0.1:8000/recognize", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.student_id) markStudentPresent(data.student_id);
      }
    } catch (err) {
      setScanStatus("AI Connection Interrupted");
    } finally {
      setIsAiProcessing(false);
      if (activeModalRef.current === "live") setTimeout(processLiveFrame, 3000);
    }
  };

  const processCapturedPhoto = async () => {
    if (!capturedImage) return;
    try {
      setIsAiProcessing(true);
      const res = await fetch(capturedImage);
      const blob = await res.blob();
      const formData = new FormData();
      formData.append("file", blob, "batch.jpg");

      const response = await fetch("http://127.0.0.1:8000/recognize_batch", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.student_ids) {
          data.student_ids.forEach((id: string) => markStudentPresent(id));
          setActiveModal(null);
          setCapturedImage(null);
        }
      }
    } catch (err) {
      alert("AI Server Offline.");
    } finally {
      setIsAiProcessing(false);
    }
  };

  // --- CAMERA CONTROLS ---
  const startStream = async (el: HTMLVideoElement | null) => {
    if (!el) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      el.srcObject = stream;
      // Small delay to let the ref update before the first frame processes
      if (activeModalRef.current === "live") setTimeout(processLiveFrame, 2000);
    } catch (e) {
      alert("Camera Permission Error");
      setActiveModal(null);
    }
  };

  const stopStream = (el: HTMLVideoElement | null) => {
    if (el?.srcObject) {
      (el.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      el.srcObject = null;
    }
  };

  const submitAttendance = async () => {
    setIsSubmitting(true);
    await syncToDevice(students);
    const subjectId = String(params.id);
    const sessionRecord = {
      id: Date.now().toString(),
      subjectId,
      week: setup.week,
      group: setup.group,
      type: setup.type,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      presentCount: students.filter(s => s.present).length,
      total: students.length,
      taken: true,
      roster: students.map(s => ({ id: s.id, name: s.name, status: s.present ? 'present' : 'absent' }))
    };
    const existingHistory = JSON.parse(localStorage.getItem("attendanceHistory") || "[]");
    localStorage.setItem("attendanceHistory", JSON.stringify([sessionRecord, ...existingHistory]));
    setTimeout(() => {
      router.push(`/dashboard/teacher/subject/${subjectId}/attendance/manage`);
    }, 1000);
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 pb-40">
      {!isStarted ? (
        <div className="bg-white p-12 rounded-[4rem] shadow-2xl max-w-2xl mx-auto space-y-10 border border-gray-100 animate-in fade-in zoom-in-95">
           <h2 className="text-3xl font-black text-center uppercase italic text-blue-900">Session Setup</h2>
           <div className="grid grid-cols-1 gap-6">
              <select onChange={(e) => setSetup({...setup, week: e.target.value})} className="p-5 bg-gray-50 rounded-2xl font-bold border-2 border-transparent focus:border-blue-900 outline-none">
                 <option value="">Select Week</option>
                 {[1,2,3,4,5,6,7,8,9,10,11,12,13,14].map(w => <option key={w} value={w}>Week {w}</option>)}
              </select>
              <select onChange={(e) => setSetup({...setup, group: e.target.value})} className="p-5 bg-gray-50 rounded-2xl font-bold border-2 border-transparent focus:border-blue-900 outline-none">
                 <option value="">Select Group</option>
                 <option value="G1">Group 1</option><option value="G2">Group 2</option>
              </select>
              <select onChange={(e) => setSetup({...setup, type: e.target.value})} className="p-5 bg-gray-50 rounded-2xl font-bold border-2 border-transparent focus:border-blue-900 outline-none">
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
        <div className="space-y-10 animate-in fade-in duration-500">
           <div className="bg-white p-8 rounded-[3.5rem] shadow-sm flex flex-col lg:flex-row justify-between items-center gap-6 border border-gray-100">
              <div className="flex items-center gap-4">
                 <div className="p-4 bg-blue-900 text-white rounded-2xl shadow-lg"><FontAwesomeIcon icon={faUserCheck} /></div>
                 <div>
                    <h1 className="font-black text-xl uppercase italic">{setup.type}: {params.id}</h1>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Week {setup.week} • {setup.group}</p>
                      <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter ${aiServerOnline ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          <FontAwesomeIcon icon={aiServerOnline ? faLink : faUnlink} />
                          {aiServerOnline ? "AI Online" : "AI Offline"}
                        </div>
                        {isSyncing && (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[8px] font-black uppercase tracking-tighter animate-pulse">
                            <FontAwesomeIcon icon={faCircleNotch} className="animate-spin" />
                            Device Syncing
                          </div>
                        )}
                      </div>
                    </div>
                 </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                 <div className="relative">
                    <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
                    <input type="text" placeholder="Find Student..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl text-[10px] font-black uppercase outline-none focus:border-blue-900 w-48 transition-all" />
                 </div>
                 <button onClick={() => { setActiveModal("live"); setTimeout(() => startStream(videoRef.current), 100); }} className="px-6 py-3 bg-blue-900 text-white rounded-xl font-black text-[10px] uppercase flex items-center gap-2 hover:bg-blue-800 transition-all shadow-md"><FontAwesomeIcon icon={faRobot} /> AI Scan</button>
                 <button onClick={() => { setActiveModal("capture"); setTimeout(() => startStream(captureRef.current), 100); }} className="px-6 py-3 bg-gray-900 text-white rounded-xl font-black text-[10px] uppercase flex items-center gap-2 hover:bg-black transition-all shadow-md"><FontAwesomeIcon icon={faCamera} /> Snap</button>
              </div>
           </div>

           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredStudents.map(s => (
                <button 
                  key={s.id} 
                  onClick={() => {
                    const newStudents = students.map(item => item.id === s.id ? {...item, present: !item.present} : item);
                    setStudents(newStudents);
                    syncToDevice(newStudents);
                  }} 
                  className={`p-6 rounded-[2.5rem] border-2 transition-all flex flex-col items-center justify-center gap-2 ${s.present ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'}`}
                >
                  <p className={`font-black text-[10px] uppercase truncate w-full ${s.present ? 'text-green-900' : 'text-gray-900'}`}>{s.name}</p>
                  <p className="text-[8px] font-bold text-gray-400">{s.id}</p>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${s.present ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-300'}`}><FontAwesomeIcon icon={s.present ? faCheck : faTimes} size="xs" /></div>
                </button>
              ))}
           </div>

           <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-3xl z-50">
              <div className="bg-gray-900 text-white p-6 rounded-[2.5rem] flex items-center justify-between shadow-2xl border border-white/10 backdrop-blur-md">
                 <div className="px-4">
                    <p className="text-[9px] font-black text-blue-300 uppercase tracking-widest">Presence</p>
                    <p className="text-2xl font-black italic">{students.filter(s => s.present).length} / {students.length}</p>
                 </div>
                 <button onClick={submitAttendance} className="bg-blue-600 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-500 transition-all">Finalize Session</button>
              </div>
           </div>
        </div>
      )}

      {/* MODAL 1: LIVE AI SCANNER */}
      {activeModal === "live" && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-3xl bg-black/60">
          <div className="bg-white w-full max-w-2xl rounded-[4rem] overflow-hidden shadow-2xl border-8 border-white">
            <div className="relative aspect-video bg-black">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
              <div className="absolute top-6 left-6 flex items-center gap-3 bg-blue-600 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase">
                <div className={`w-2 h-2 rounded-full bg-white ${isAiProcessing ? 'animate-ping' : ''}`}></div> {scanStatus}
              </div>
            </div>
            <div className="p-10 text-center space-y-6">
              <div className="flex gap-4">
                <button onClick={handleRescan} disabled={!lastMatchedId} className="flex-1 py-4 bg-orange-50 text-orange-600 rounded-2xl font-black text-[10px] uppercase border border-orange-100 disabled:opacity-30"><FontAwesomeIcon icon={faSync} className="mr-2" /> Undo & Rescan</button>
                <button onClick={() => { stopStream(videoRef.current); setActiveModal(null); }} className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase">Stop Scanner</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: BATCH SNAP */}
      {activeModal === "capture" && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-3xl bg-black/60">
          <div className="bg-white w-full max-w-xl rounded-[4rem] overflow-hidden shadow-2xl text-center">
            {!capturedImage ? (
              <>
                <div className="relative aspect-square bg-black">
                  <video ref={captureRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <button onClick={() => { stopStream(captureRef.current); setActiveModal(null); }} className="absolute top-6 right-6 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"><FontAwesomeIcon icon={faTimes} /></button>
                </div>
                <div className="p-10">
                  <button onClick={() => {
                    const canvas = document.createElement("canvas");
                    canvas.width = captureRef.current!.videoWidth;
                    canvas.height = captureRef.current!.videoHeight;
                    canvas.getContext("2d")?.drawImage(captureRef.current!, 0, 0);
                    setCapturedImage(canvas.toDataURL("image/jpeg"));
                    stopStream(captureRef.current);
                  }} className="w-20 h-20 bg-blue-900 text-white rounded-full border-8 border-blue-50 flex items-center justify-center text-2xl mx-auto"><FontAwesomeIcon icon={faCamera} /></button>
                </div>
              </>
            ) : (
              <>
                <img src={capturedImage} className="w-full aspect-square object-cover" />
                <div className="p-8 grid grid-cols-2 gap-4">
                  <button onClick={() => setCapturedImage(null)} className="py-4 bg-gray-100 rounded-2xl font-black text-[10px] uppercase">Discard</button>
                  <button onClick={processCapturedPhoto} disabled={isAiProcessing} className="py-4 bg-blue-900 text-white rounded-2xl font-black text-[10px] uppercase">{isAiProcessing ? "AI Syncing..." : "Send to AI"}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}