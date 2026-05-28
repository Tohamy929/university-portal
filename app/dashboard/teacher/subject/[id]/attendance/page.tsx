"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUserCheck, faRobot, faCamera, faCheck, faTimes, 
  faSearch, faSync, faLink, faUnlink, faCircleNotch,
  faQrcode, faPlay, faPause, faSyncAlt, faSpinner
} from "@fortawesome/free-solid-svg-icons";

export default function AttendancePage() {
  const params = useParams();
  const router = useRouter();
  
  // DATA STATES
  const [students, setStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [setup, setSetup] = useState({ group: "", type: "", week: "" });
  const [isSetupLoading, setIsSetupLoading] = useState(false);
  const [batchSummary, setBatchSummary] = useState<string | null>(null);
  
  // UI & AI STATES
  const [isStarted, setIsStarted] = useState(false);
  const [activeModal, setActiveModal] = useState<"live" | "capture" | null>(null);
  const [scanStatus, setScanStatus] = useState("Standing by...");
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastMatchedId, setLastMatchedId] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [aiServerOnline, setAiServerOnline] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // CAMERA SETTINGS
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

  // QR STATES
  const [showQrPanel, setShowQrPanel] = useState(false);
  const [isQrActive, setIsQrActive] = useState(false);
  const [qrToken, setQrToken] = useState("");
  const [qrTimer, setQrTimer] = useState(10);

  // REFS FOR STALE CLOSURE PROTECTION
  const videoRef = useRef<HTMLVideoElement>(null);
  const captureRef = useRef<HTMLVideoElement>(null);
  const studentsRef = useRef<any[]>([]);
  const isAiProcessingRef = useRef(false);
  const activeModalRef = useRef<string | null>(null);

  useEffect(() => { studentsRef.current = students; }, [students]);
  useEffect(() => { isAiProcessingRef.current = isAiProcessing; }, [isAiProcessing]);
  useEffect(() => { activeModalRef.current = activeModal; }, [activeModal]);

  // --- HEARTBEAT & SYNC ---
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

  // --- WEBSOCKET FOR LIVE UPDATES ---
  useEffect(() => {
    if (!isStarted || !setup.group) return;

    // TODO FOR BACKEND: Update this URL to match your real WebSocket / SignalR Hub URL
    const ws = new WebSocket(`wss://your-backend-url.com/ws/attendance?subjectId=${params.id}&group=${setup.group}`);

    ws.onopen = () => console.log("🟢 WebSocket Connected for Real-Time Updates");
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.studentId && data.status === "present") {
          markStudentPresent(data.studentId);
        }
      } catch (e) {
        console.error("WebSocket message error:", e);
      }
    };

    ws.onclose = () => console.log("🔴 WebSocket Disconnected");
    return () => ws.close();
  }, [isStarted, setup, params.id]);

  const syncToDevice = async (updatedStudents: any[]) => {
    if (!aiServerOnline) return;
    setIsSyncing(true);
    try {
      const payload = {
        subjectId: params.id,
        week: setup.week,
        group: setup.group,
        type: setup.type,
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

  // --- INITIALIZE SESSION FROM DB (THE GRADEBOOK BYPASS) ---
  const startSession = async () => {
    setIsSetupLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const cleanSubjectId = decodeURIComponent(String(params.id)); 
      
      const response = await fetch(`/api-proxy/Subject/GetStudentGradesForTeacherById/${cleanSubjectId}`, {
        method: "GET",
        cache: "no-store", 
        headers: { 
          "accept": "*/*", 
          "Authorization": `Bearer ${token}`,
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache"
        }
      });
      
      const text = await response.text();
      if (!response.ok) throw new Error(`Backend Error: ${text}`);
      
      const data = text ? JSON.parse(text) : [];
      const studentArray = Array.isArray(data) ? data : (data ? [data] : []);
      
      let mappedStudents = studentArray.map((s: any) => ({
        id: String(s.studentCode || s.studentGradeId || Math.random()), 
        name: s.studentName || "Unknown Student",
        code: s.studentCode || "No Code", 
        group: s.groupNumber, 
        present: false 
      }));

      mappedStudents = mappedStudents.filter(s => String(s.group) === String(setup.group));

      if (mappedStudents.length === 0) {
        alert(`Warning: No students found enrolled in Group ${setup.group} for this subject.`);
      }

      setStudents(mappedStudents);
      setIsStarted(true);
      
    } catch (error: any) {
      console.error("🚨 CRITICAL SESSION SETUP ERROR:", error.message || error);
      alert(`Setup Failed: ${error.message || "Check the console for details."}`);
    } finally {
      setIsSetupLoading(false);
    }
  };

  // --- QR ROTATION LOGIC ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showQrPanel && isQrActive) {
      const generatePayload = () => JSON.stringify({ s: params.id, g: setup.group, w: setup.week, t: setup.type, n: Math.random().toString(36).substr(2, 5) });
      
      if (!qrToken) setQrToken(generatePayload());
      interval = setInterval(() => {
        setQrTimer((prev) => {
          if (prev <= 1) {
            setQrToken(generatePayload());
            return 10;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showQrPanel, isQrActive, params.id, setup, qrToken]);

  // --- MAIN ACTIONS ---
  const markStudentPresent = (id: string) => {
    const newStudents = studentsRef.current.map(s => s.id.toString() === id.toString() ? { ...s, present: true } : s);
    setStudents(newStudents);
    setLastMatchedId(id);
    
    const student = newStudents.find(s => s.id.toString() === id.toString());
    setScanStatus(`Match: ${student?.name || id}`);
    syncToDevice(newStudents);
  };

  const handleRescan = () => {
    if (lastMatchedId) {
      const newStudents = studentsRef.current.map(s => s.id.toString() === lastMatchedId.toString() ? { ...s, present: false } : s);
      setStudents(newStudents);
      setLastMatchedId(null);
      setScanStatus("Cleared. Rescanning...");
      syncToDevice(newStudents);
    }
  };

  // --- AI LOGIC ---
  const processLiveFrame = async () => {
    if (!videoRef.current || activeModalRef.current !== "live" || isAiProcessingRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
    
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg'));
    if (!blob) return;

    const formData = new FormData();
    formData.append("file", blob, "frame.jpg");
    formData.append("subjectId", String(params.id));
    formData.append("group", setup.group);
    formData.append("week", setup.week);
    formData.append("type", setup.type);

    try {
      setIsAiProcessing(true);
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
      formData.append("subjectId", String(params.id));
      formData.append("group", setup.group);
      formData.append("week", setup.week);
      formData.append("type", setup.type);

      const response = await fetch("http://127.0.0.1:8000/recognize_batch", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.student_ids) {
          data.student_ids.forEach((id: string) => markStudentPresent(id));
        }

        const summary = data.message || `Successfully mapped ${data.student_ids?.length || 0} students.`;
        setBatchSummary(summary);

        setTimeout(() => {
          setActiveModal(null);
          setCapturedImage(null);
          setBatchSummary(null);
        }, 4000);
      }
    } catch (err) {
      alert("AI Server Offline.");
    } finally {
      setIsAiProcessing(false);
    }
  };

  const startStream = async (el: HTMLVideoElement | null, mode: "user" | "environment", isStartingLoop: boolean = false) => {
    if (!el) return;
    try {
      if (el.srcObject) {
        (el.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: mode } });
      el.srcObject = stream;
      
      if (isStartingLoop && activeModalRef.current === "live") {
        setTimeout(processLiveFrame, 2000);
      }
    } catch (e) {
      alert("Camera Permission Error. Please check your browser settings.");
      setActiveModal(null);
    }
  };

  const stopStream = (el: HTMLVideoElement | null) => {
    if (el?.srcObject) {
      (el.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      el.srcObject = null;
    }
  };

  const toggleCamera = () => {
    const newMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(newMode);
    const activeEl = activeModal === "live" ? videoRef.current : captureRef.current;
    startStream(activeEl, newMode, false);
  };

  const submitAttendance = async () => {
    try {
      setIsSubmitting(true);
      
      syncToDevice(studentsRef.current).catch(e => console.warn("AI Sync bypassed or blocked by Vercel HTTPS", e));
      
      const cleanSubjectId = decodeURIComponent(String(params.id));

      const sessionRecord = {
        id: Date.now().toString(), 
        subjectId: cleanSubjectId,
        week: setup.week, 
        group: setup.group, 
        type: setup.type,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        presentCount: studentsRef.current.filter(s => s.present).length,
        total: studentsRef.current.length,
        roster: studentsRef.current.map(s => ({ 
          id: s.id, 
          name: s.name, 
          code: s.code, 
          status: s.present ? 'present' : 'absent' 
        }))
      };

      const existing = JSON.parse(localStorage.getItem("attendanceHistory") || "[]");
      localStorage.setItem("attendanceHistory", JSON.stringify([sessionRecord, ...existing]));
      
      router.push(`/dashboard/teacher/subject/${cleanSubjectId}/attendance/manage`);
      
    } catch (error) {
      console.error("Critical Error saving attendance:", error);
      alert("Failed to save attendance. Check browser console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.code && s.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-10 pb-40 text-gray-900 dark:text-white transition-colors duration-300">
      {!isStarted ? (
        <div className="bg-white dark:bg-gray-900 p-12 rounded-[4rem] shadow-2xl max-w-2xl mx-auto space-y-10 border border-gray-100 dark:border-gray-800">
           <h2 className="text-3xl font-black text-center uppercase italic text-blue-900 dark:text-blue-400">Session Setup</h2>
           <div className="grid grid-cols-1 gap-6">
              <select onChange={(e) => setSetup({...setup, week: e.target.value})} className="p-5 bg-gray-50 dark:bg-gray-800 rounded-2xl font-bold border-2 border-transparent focus:border-blue-900 outline-none w-full dark:text-white">
                 <option value="">Select Week</option>
                 {[1,2,3,4,5,6,7,8,9,10,11,12,13,14].map(w => <option key={w} value={w}>Week {w}</option>)}
              </select>
              <select onChange={(e) => setSetup({...setup, group: e.target.value})} className="p-5 bg-gray-50 dark:bg-gray-800 rounded-2xl font-bold border-2 border-transparent focus:border-blue-900 outline-none w-full dark:text-white">
                 <option value="">Select Group</option>
                 <option value="1">Group 1</option>
                 <option value="2">Group 2</option>
              </select>
              <select onChange={(e) => setSetup({...setup, type: e.target.value})} className="p-5 bg-gray-50 dark:bg-gray-800 rounded-2xl font-bold border-2 border-transparent focus:border-blue-900 outline-none w-full dark:text-white">
                 <option value="">Select Type</option>
                 <option value="Lecture">Lecture</option>
                 <option value="Section">Section</option>
              </select>
           </div>
           <button 
             disabled={!setup.week || !setup.group || !setup.type || isSetupLoading}
             onClick={startSession}
             className="w-full py-6 bg-blue-900 dark:bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest disabled:opacity-50 transition-all hover:scale-[1.02]"
           >
             {isSetupLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : "Open Attendance Log"}
           </button>
        </div>
      ) : (
        <div className="space-y-10 animate-in fade-in duration-500">
           
           <div className="bg-white dark:bg-gray-900 p-8 rounded-[3.5rem] shadow-sm flex flex-col lg:flex-row justify-between items-center gap-6 border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-4">
                 <div className="p-4 bg-blue-900 dark:bg-blue-800 text-white rounded-2xl shadow-lg"><FontAwesomeIcon icon={faUserCheck} /></div>
                 <div>
                    <h1 className="font-black text-xl uppercase italic">{setup.type}: {params.id}</h1>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Week {setup.week} • Group {setup.group}</p>
                      <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter ${aiServerOnline ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                          <FontAwesomeIcon icon={aiServerOnline ? faLink : faUnlink} />
                          {aiServerOnline ? "AI Online" : "AI Offline"}
                        </div>
                        {isSyncing && (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 text-[8px] font-black uppercase tracking-tighter animate-pulse">
                            <FontAwesomeIcon icon={faCircleNotch} className="animate-spin" /> Syncing
                          </div>
                        )}
                      </div>
                    </div>
                 </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                 <div className="relative hidden md:block">
                    <FontAwesomeIcon icon={faSearch} className="absolute left-4 rtl:left-auto rtl:right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input type="text" placeholder={"Find..."} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-900 w-40 dark:text-white" />
                 </div>
                 
                 <button 
                  onClick={() => { setShowQrPanel(!showQrPanel); setIsQrActive(true); }} 
                  className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase flex items-center gap-2 transition-all shadow-md ${showQrPanel ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-300 border-2 border-blue-900 dark:border-blue-500' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                 >
                   <FontAwesomeIcon icon={faQrcode} /> {"QR Mode"}
                 </button>

                 <button onClick={() => { setActiveModal("live"); setTimeout(() => startStream(videoRef.current, facingMode, true), 100); }} className="px-6 py-3 bg-blue-900 dark:bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase flex items-center gap-2 shadow-md hover:scale-105 transition-transform"><FontAwesomeIcon icon={faRobot} /> AI Scan</button>
                 <button onClick={() => { setActiveModal("capture"); setTimeout(() => startStream(captureRef.current, facingMode, false), 100); }} className="px-6 py-3 bg-gray-900 dark:bg-gray-700 text-white rounded-xl font-black text-[10px] uppercase flex items-center gap-2 shadow-md hover:scale-105 transition-transform"><FontAwesomeIcon icon={faCamera} /> Snap</button>
              </div>
           </div>

           {showQrPanel && (
             <div className="bg-white dark:bg-gray-900 p-8 rounded-[3.5rem] shadow-xl border-4 border-blue-900/10 dark:border-blue-500/20 flex flex-col md:flex-row items-center gap-10 animate-in slide-in-from-top-4 duration-300">
                <div className="flex-1 space-y-6 text-center md:text-left rtl:md:text-right">
                  <div>
                    <h2 className="text-2xl font-black uppercase italic text-blue-900 dark:text-blue-400">Dynamic QR Attendance</h2>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-2">Instructions for Students:</p>
                  </div>
                  <div className="space-y-3 bg-gray-50 dark:bg-gray-800 p-6 rounded-[2rem] text-sm font-medium">
                    <p>1. Open your Student Portal.</p>
                    <p>2. Click 'Scan QR' to open camera.</p>
                    <p>3. Scan this code before timer resets.</p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                    <button onClick={() => setIsQrActive(!isQrActive)} className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-md transition-all ${isQrActive ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/50' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'}`}>
                      <FontAwesomeIcon icon={isQrActive ? faPause : faPlay} /> 
                      {isQrActive ? "Pause" : "Resume"}
                    </button>
                    <button onClick={() => { setShowQrPanel(false); setIsQrActive(false); }} className="px-8 py-4 bg-gray-100 dark:bg-gray-800 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                      Close Panel
                    </button>
                    <button onClick={() => { const absentStudents = studentsRef.current.filter(s => !s.present); if (absentStudents.length > 0) markStudentPresent(absentStudents[0].id); }} className="px-4 py-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl text-[10px] font-bold uppercase underline">
                      Simulate Scan
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-6 p-6 bg-white dark:bg-gray-800 rounded-[3rem] shadow-inner w-full md:w-auto">
                  <div className={`relative w-64 h-64 bg-white rounded-[2rem] p-4 flex items-center justify-center transition-opacity duration-300 ${isQrActive ? 'opacity-100' : 'opacity-30 blur-sm'}`}>
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrToken)}`} alt="Session QR" className="w-full h-full object-contain mix-blend-multiply" />
                    {!isQrActive && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <FontAwesomeIcon icon={faPause} className="text-4xl text-gray-900" />
                      </div>
                    )}
                  </div>
                  <div className="w-full text-center space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase text-gray-400">
                      <span>Refreshing in</span>
                      <span className={qrTimer <= 3 ? "text-red-500" : ""}>{qrTimer}s</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-1000 ease-linear ${qrTimer <= 3 ? 'bg-red-500' : 'bg-blue-600 dark:bg-blue-500'}`} style={{ width: `${(qrTimer / 10) * 100}%` }} />
                    </div>
                  </div>
                </div>
             </div>
           )}

           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredStudents.map(s => (
                <button 
                  key={s.id} 
                  onClick={() => {
                    const newStudents = students.map(item => item.id === s.id ? {...item, present: !item.present} : item);
                    setStudents(newStudents);
                    syncToDevice(newStudents);
                  }} 
                  className={`p-6 rounded-[2.5rem] border-2 transition-all flex flex-col items-center justify-center gap-2 ${s.present ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800'}`}
                >
                  <p className={`font-black text-[10px] uppercase truncate w-full ${s.present ? 'text-green-900 dark:text-green-400' : 'text-gray-900 dark:text-gray-300'}`}>{s.name}</p>
                  <p className="text-[8px] font-bold text-gray-400">{s.code || s.id}</p>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${s.present ? 'bg-green-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600'}`}>
                    <FontAwesomeIcon icon={s.present ? faCheck : faTimes} size="xs" />
                  </div>
                </button>
              ))}
           </div>

           <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-3xl z-50">
              <div className="bg-gray-900 dark:bg-black text-white p-6 rounded-[2.5rem] flex items-center justify-between shadow-2xl border border-white/10 backdrop-blur-md">
                 <div className="px-4">
                    <p className="text-[9px] font-black text-blue-300 uppercase tracking-widest">Presence</p>
                    <p className="text-2xl font-black italic">{students.filter(s => s.present).length} / {students.length}</p>
                 </div>
                 <button onClick={submitAttendance} disabled={isSubmitting} className="bg-blue-600 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-500 transition-all disabled:opacity-50">
                    Finalize Session
                 </button>
              </div>
           </div>
        </div>
      )}

      {activeModal === "live" && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-3xl bg-black/60">
          <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-[4rem] overflow-hidden shadow-2xl border-8 border-white dark:border-gray-800 transition-colors">
            <div className="relative aspect-video bg-black">
              <video ref={videoRef} autoPlay playsInline className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`} />
              
              <div className="absolute top-6 left-6 flex items-center gap-3 bg-blue-600 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase shadow-md">
                <div className={`w-2 h-2 rounded-full bg-white ${isAiProcessing ? 'animate-ping' : ''}`}></div> {scanStatus}
              </div>

              <div className="absolute top-6 right-6 rtl:right-auto rtl:left-6">
                <button 
                  onClick={toggleCamera} 
                  title="Flip Camera"
                  className="w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-md hover:bg-black/70 transition-colors"
                >
                  <FontAwesomeIcon icon={faSyncAlt} />
                </button>
              </div>
            </div>
            
            <div className="p-10 text-center space-y-6">
              <div className="flex gap-4">
                <button onClick={handleRescan} disabled={!lastMatchedId} className="flex-1 py-4 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-2xl font-black text-[10px] uppercase border border-orange-100 dark:border-orange-800 disabled:opacity-30 transition-colors">
                  <FontAwesomeIcon icon={faSync} className="mr-2" /> Undo & Rescan
                </button>
                <button onClick={() => { stopStream(videoRef.current); setActiveModal(null); }} className="flex-1 py-4 bg-gray-900 dark:bg-gray-700 text-white rounded-2xl font-black text-[10px] uppercase transition-colors">
                  Stop Scanner
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeModal === "capture" && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-3xl bg-black/60">
          <div className="bg-white dark:bg-gray-900 w-full max-w-xl rounded-[4rem] overflow-hidden shadow-2xl border-8 border-white dark:border-gray-800 text-center transition-colors">
            {!capturedImage ? (
              <>
                <div className="relative aspect-square bg-black">
                  <video ref={captureRef} autoPlay playsInline className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`} />
                  
                  <button 
                    onClick={toggleCamera} 
                    title="Flip Camera"
                    className="absolute top-6 left-6 rtl:left-auto rtl:right-6 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-md hover:bg-black/70 transition-colors"
                  >
                    <FontAwesomeIcon icon={faSyncAlt} />
                  </button>

                  <button onClick={() => { stopStream(captureRef.current); setActiveModal(null); }} className="absolute top-6 right-6 rtl:right-auto rtl:left-6 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-md hover:bg-red-600 transition-colors">
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
                <div className="p-10">
                  <button onClick={() => {
                    const canvas = document.createElement("canvas");
                    canvas.width = captureRef.current!.videoWidth;
                    canvas.height = captureRef.current!.videoHeight;
                    
                    const ctx = canvas.getContext("2d");
                    if (ctx && facingMode === 'user') {
                       ctx.translate(canvas.width, 0);
                       ctx.scale(-1, 1);
                    }
                    ctx?.drawImage(captureRef.current!, 0, 0);
                    
                    setCapturedImage(canvas.toDataURL("image/jpeg"));
                    stopStream(captureRef.current);
                  }} className="w-20 h-20 bg-blue-900 dark:bg-blue-600 text-white rounded-full border-8 border-blue-50 dark:border-blue-900/30 flex items-center justify-center text-2xl mx-auto transition-transform hover:scale-105 active:scale-95">
                    <FontAwesomeIcon icon={faCamera} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <img src={capturedImage} className="w-full aspect-square object-cover" alt="Captured class" />
                <div className="p-8 grid grid-cols-2 gap-4">
                  {batchSummary ? (
                    <div className="col-span-2 py-6 bg-green-50 rounded-2xl border border-green-200 text-center animate-in zoom-in">
                      <h3 className="text-xl font-black uppercase text-green-700 italic">Scan Complete</h3>
                      <p className="text-sm font-bold text-green-600 mt-2">{batchSummary}</p>
                    </div>
                  ) : (
                    <>
                      <button onClick={() => setCapturedImage(null)} className="py-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl font-black text-[10px] uppercase transition-colors">
                        Discard
                      </button>
                      <button onClick={processCapturedPhoto} disabled={isAiProcessing} className="py-4 bg-blue-900 dark:bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase transition-colors">
                        {isAiProcessing ? "AI Syncing..." : "Send to AI"}
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}