"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faQrcode, faCamera, faTimes, faCheckCircle, 
  faExclamationCircle, faSpinner, faArrowLeft,
  faHistory, faChartPie, faCalendarCheck, faCalendarTimes,
  faMinusCircle, faSyncAlt, faUserShield
} from "@fortawesome/free-solid-svg-icons";

import { useTranslation } from "@/src/context/TranslationContext";
import { MOCK_USERS } from "@/lib/mockUsers";

interface LogRecord {
  date: string;
  type: string;
  week: string | number;
  status: string;
}

export default function StudentSubjectAttendance() {
  const params = useParams();
  const router = useRouter();
  const { t, lang } = useTranslation();

  // --- USER STATES ---
  const [studentId, setStudentId] = useState<string | null>(null);
  const [studentName, setStudentName] = useState<string>("");
  const [weeklyLog, setWeeklyLog] = useState<any[]>([]);
  const [stats, setStats] = useState({ attended: 0, missed: 0, percentage: 0 });
  
  // --- SCANNER STATES ---
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  // NEW: Split the scanning state into "face" and "qr"
  const [scanState, setScanState] = useState<"idle" | "face" | "qr" | "processing" | "success" | "error">("idle");
  const [capturedFace, setCapturedFace] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  
  // REFS
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // --- INITIALIZATION & DATA FETCHING ---
  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    const user = MOCK_USERS.find(u => u.email.toLowerCase() === email?.toLowerCase());
    
    if (user) {
      setStudentId(user.id);
      setStudentName(user.name);
      
      const allHistory = JSON.parse(localStorage.getItem("attendanceHistory") || "[]");
      const subjectHistory = allHistory.filter((session: any) => session.subjectId === params.id);
      
      let attendedCount = 0;
      let missedCount = 0;

      const personalLog: LogRecord[] = subjectHistory.map((session: any) => {
        const studentRecord = session.roster?.find((s: any) => s.id === user.id);
        const status = studentRecord?.status || "absent";
        if (status === "present") attendedCount++;
        else missedCount++;

        return {
          date: session.date,
          type: session.type,
          week: session.week,
          status: status
        };
      });

      const weeksArray = Array.from({ length: 14 }, (_, i) => i + 1);
      const structuredGrid = weeksArray.map(w => {
        const weekRecords = personalLog.filter((r) => String(r.week) === String(w) || r.week === `Week ${w}`);
        return {
          weekNumber: w,
          lecture: weekRecords.find((r) => r.type.toLowerCase() === "lecture") || null,
          section: weekRecords.find((r) => r.type.toLowerCase() === "section") || null
        };
      });

      setWeeklyLog(structuredGrid);
      setStats({
        attended: attendedCount,
        missed: missedCount,
        percentage: personalLog.length > 0 ? Math.round((attendedCount / personalLog.length) * 100) : 0
      });

    } else {
      router.push("/login");
    }

    return () => stopCamera();
  }, [params.id, router, isScannerOpen]);

  // --- CAMERA CONTROLS ---
  const startCamera = async (mode: "user" | "environment") => {
    try {
      // Stop existing stream if switching
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: mode } 
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      
    } catch (err) {
      alert("Camera access denied or unavailable.");
      setScanState("error");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const closeScanner = () => {
    stopCamera();
    setScanState("idle");
    setCapturedFace(null);
    setIsScannerOpen(false);
  };

  const toggleCamera = () => {
    const newMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(newMode);
    startCamera(newMode);
  };

  // --- TWO-STEP SCANNING LOGIC ---
  
  // STEP 1: Capture Face
  const handleFaceCapture = () => {
    if (!videoRef.current) return;
    
    // Capture the frame
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
    setCapturedFace(canvas.toDataURL("image/jpeg"));
    
    // Switch to QR Mode (Auto-flip to back camera)
    setScanState("qr");
    setFacingMode("environment");
    startCamera("environment");
  };

  // STEP 2: Detect QR & Submit
  const handleQRDetected = async (scannedToken: string) => {
    if (scanState === "processing" || !studentId || !capturedFace) return;
    setScanState("processing");
    stopCamera();

    try {
      // PROD: Send the full payload to the backend
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      /*
      const res = await fetch(`${API_URL}/attendance/scan`, { 
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: params.id,
          studentId: studentId,
          studentName: studentName,
          qrToken: scannedToken,
          faceImage: capturedFace, // <--- Base64 image payload
          timestamp: new Date().toISOString()
        })
      });
      if (!res.ok) throw new Error();
      */
      
      throw new Error("Simulating Offline Mode"); // Force fallback for local testing
    } catch (error) {
      // OFFLINE FALLBACK: Write to localStorage for teacher polling
      setTimeout(() => {
        try {
          const storageKey = `recent_scans_${params.id}`;
          const recentScans = JSON.parse(localStorage.getItem(storageKey) || "[]");
          if (!recentScans.includes(studentId)) {
            recentScans.push(studentId);
            localStorage.setItem(storageKey, JSON.stringify(recentScans));
          }
          setScanState("success");
        } catch (e) {
          setScanState("error");
        }
      }, 1000);
    }
  };

  // --- REUSABLE UI COMPONENT FOR A SESSION SLOT ---
  const SessionSlotCard = ({ title, data }: { title: string, data: any }) => {
    if (!data) {
      return (
        <div className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 opacity-60 transition-colors">
          <p className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500">{title}</p>
          <div className="flex items-center gap-2 mt-2">
            <FontAwesomeIcon icon={faMinusCircle} className="text-gray-300 dark:text-gray-600" size="sm" />
            <span className="text-[8px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{ "Pending"}</span>
          </div>
        </div>
      );
    }
    if (data.status === "present") {
      return (
        <div className="flex flex-col items-center justify-center p-4 rounded-2xl border border-green-100 dark:border-green-900/30 bg-green-50 dark:bg-green-900/10 transition-colors shadow-sm">
          <p className="text-[10px] font-black uppercase text-green-900 dark:text-green-400">{title}</p>
          <div className="flex items-center gap-2 mt-2">
            <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 dark:text-green-400" size="sm" />
            <span className="text-[8px] font-bold text-green-700 dark:text-green-500 uppercase tracking-widest">{data.date}</span>
          </div>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center p-4 rounded-2xl border border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 transition-colors shadow-sm">
        <p className="text-[10px] font-black uppercase text-red-900 dark:text-red-400">{title}</p>
        <div className="flex items-center gap-2 mt-2">
          <FontAwesomeIcon icon={faTimes} className="text-red-500 dark:text-red-400" size="sm" />
          <span className="text-[8px] font-bold text-red-700 dark:text-red-500 uppercase tracking-widest">{data.date}</span>
        </div>
      </div>
    );
  };

  // ==========================================
  // VIEW 1: THE TWO-STEP QR SCANNER
  // ==========================================
  if (isScannerOpen) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300 pt-24 pb-10 px-6">
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
          <button onClick={closeScanner} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-900 dark:hover:text-blue-400 transition-colors">
            <FontAwesomeIcon icon={faArrowLeft} className="rtl:rotate-180" /> { "Back to Log"}
          </button>
          
          <div className="bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
            
            <div className="p-10 text-center border-b border-gray-50 dark:border-gray-800">
              <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-400 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
                <FontAwesomeIcon icon={scanState === "face" ? faUserShield : faQrcode} />
              </div>
              <h1 className="text-2xl font-black uppercase italic text-gray-900 dark:text-white">
                {scanState === "face" ? ( "Face Verification") : (t("student.qr.qrScanTitle") || "Scan Session QR")}
              </h1>
              <p className="text-xs font-bold text-gray-400 mt-2">
                {scanState === "face" ? ( "Position your face in the frame.") : ( "Point camera at the board.")}
              </p>
            </div>

            <div className="p-10 flex flex-col items-center justify-center min-h-[400px]">
              
              {scanState === "idle" && (
                <button 
                  onClick={() => { setScanState("face"); setFacingMode("user"); startCamera("user"); }} 
                  className="w-48 h-48 rounded-full bg-blue-900 dark:bg-blue-600 text-white shadow-xl flex flex-col items-center justify-center gap-4 hover:scale-105 active:scale-95 transition-all"
                >
                  <FontAwesomeIcon icon={faUserShield} className="text-4xl" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{ "Begin Verification"}</span>
                </button>
              )}

              {/* PHASE 1: FACE CAPTURE */}
              {scanState === "face" && (
                <div className="w-full max-w-sm space-y-6 flex flex-col items-center animate-in zoom-in-95">
                  <div className="relative w-full aspect-square bg-black rounded-full overflow-hidden border-8 border-blue-900 dark:border-blue-500 shadow-2xl">
                    <video ref={videoRef} autoPlay playsInline className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`} />
                    <div className="absolute inset-0 border-4 border-dashed border-white/30 rounded-full m-8 animate-spin-slow"></div>
                  </div>
                  
                  <div className="flex gap-4 w-full">
                    <button onClick={toggleCamera} className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                      <FontAwesomeIcon icon={faSyncAlt} className="mr-2" /> { "Flip"}
                    </button>
                    <button onClick={handleFaceCapture} className="flex-[2] py-4 bg-blue-900 dark:bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-blue-800 transition-colors">
                      <FontAwesomeIcon icon={faCamera} className="mr-2" /> { "Capture"}
                    </button>
                  </div>
                </div>
              )}

              {/* PHASE 2: QR SCAN */}
              {scanState === "qr" && (
                <div className="w-full max-w-sm space-y-6 flex flex-col items-center animate-in zoom-in-95">
                  <div className="relative w-full aspect-square bg-black rounded-[2rem] overflow-hidden border-4 border-blue-900 dark:border-blue-500 shadow-2xl">
                    <video ref={videoRef} autoPlay playsInline className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`} />
                    <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_20px_bg-blue-500] animate-[scan_2s_ease-in-out_infinite]"></div>
                  </div>
                  
                  <div className="flex gap-4 w-full">
                    <button onClick={toggleCamera} className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                      <FontAwesomeIcon icon={faSyncAlt} className="mr-2" /> { "Flip"}
                    </button>
                    <button onClick={() => handleQRDetected("simulated-qr-token-123")} className="flex-[2] py-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-900/50">
                      { "Simulate Scan"}
                    </button>
                  </div>
                </div>
              )}

              {scanState === "processing" && (
                <div className="flex flex-col items-center gap-6 animate-in fade-in">
                  <FontAwesomeIcon icon={faSpinner} className="text-5xl text-blue-900 dark:text-blue-500 animate-spin" />
                </div>
              )}

              {scanState === "success" && (
                <div className="flex flex-col items-center text-center gap-4 animate-in zoom-in">
                  <div className="w-32 h-32 bg-green-50 dark:bg-green-900/20 text-green-500 dark:text-green-400 rounded-full flex items-center justify-center text-6xl mb-4">
                    <FontAwesomeIcon icon={faCheckCircle} />
                  </div>
                  <h2 className="text-2xl font-black uppercase text-green-600 dark:text-green-400">{ "Success"}</h2>
                  <button onClick={closeScanner} className="mt-8 px-10 py-4 bg-gray-900 dark:bg-gray-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">
                    Return to Log
                  </button>
                </div>
              )}

              {scanState === "error" && (
                <div className="flex flex-col items-center text-center gap-4 animate-in zoom-in">
                  <div className="w-32 h-32 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-full flex items-center justify-center text-6xl mb-4">
                    <FontAwesomeIcon icon={faExclamationCircle} />
                  </div>
                  <h2 className="text-2xl font-black uppercase text-red-600 dark:text-red-400">Scan Failed</h2>
                  <button onClick={closeScanner} className="mt-8 px-10 py-4 bg-gray-900 dark:bg-gray-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">
                    Try Again
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: THE 14-WEEK GRID LOG (DEFAULT)
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300 pt-24 pb-20 px-6">
      <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500">
        
        {/* HEADER & ACTION BAR */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <button onClick={() => router.back()} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-900 dark:hover:text-blue-400 mb-4 transition-colors">
              <FontAwesomeIcon icon={faArrowLeft} className="rtl:rotate-180" /> { "Back"}
            </button>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase italic">{ "Attendance Log"}</h1>
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1">{params.id}</p>
          </div>
          <button onClick={() => setIsScannerOpen(true)} className="w-full md:w-auto px-8 py-5 bg-blue-900 dark:bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-3">
            <FontAwesomeIcon icon={faQrcode} className="text-lg" />
            { "Scan QR Code"}
          </button>
        </div>

        {/* STATS WIDGETS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-6 transition-colors">
             <div className="w-14 h-14 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-xl"><FontAwesomeIcon icon={faCalendarCheck} /></div>
             <div>
               <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{ "Attended"}</p>
               <p className="text-3xl font-black text-gray-900 dark:text-white italic">{stats.attended}</p>
             </div>
          </div>
          <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-6 transition-colors">
             <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center text-xl"><FontAwesomeIcon icon={faCalendarTimes} /></div>
             <div>
               <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{ "Missed"}</p>
               <p className="text-3xl font-black text-gray-900 dark:text-white italic">{stats.missed}</p>
             </div>
          </div>
          <div className="bg-blue-900 dark:bg-blue-800 p-8 rounded-[2.5rem] shadow-xl flex items-center justify-between text-white transition-colors">
             <div>
               <p className="text-[10px] font-black uppercase text-blue-300 tracking-widest">{ "Percentage"}</p>
               <p className="text-4xl font-black italic">{stats.percentage}%</p>
             </div>
             <FontAwesomeIcon icon={faChartPie} className="text-5xl opacity-20" />
          </div>
        </div>

        {/* 14-WEEK GRID DISPLAY */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {weeklyLog.map((weekData) => (
            <div key={weekData.weekNumber} className="bg-white dark:bg-gray-900 p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm transition-colors flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-400 flex items-center justify-center font-black text-xs">
                  {weekData.weekNumber}
                </div>
                <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">
                  {"Week"} {weekData.weekNumber}
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4 flex-1">
                <SessionSlotCard title={ "Lecture"} data={weekData.lecture} />
                <SessionSlotCard title={ "Section"} data={weekData.section} />
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}