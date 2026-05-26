"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faArrowLeft, faCheckCircle, faTimesCircle, faClock, 
  faSpinner, faCalendarAlt, faExclamationTriangle,
  faQrcode, faCamera, faSyncAlt, faCheck, faTimes
} from "@fortawesome/free-solid-svg-icons";

interface AttendanceRecord {
  isFinished: boolean;
  attendanceType: "Lecture" | "Section" | string;
  isAttend: boolean;
}

interface WeekData {
  weekNumber: number;
  attendances: AttendanceRecord[];
}

export default function StudentAttendanceLog() {
  const { id } = useParams();
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(true);
  const [weeks, setWeeks] = useState<WeekData[]>([]);

  // --- TWO-STEP SCANNER STATES ---
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scannerState, setScannerState] = useState<"closed" | "qr" | "selfie" | "processing" | "success" | "error">("closed");
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  
  // NEW TARGETING STATES
  const [scannedGroup, setScannedGroup] = useState<string>("");
  const [scannedWeek, setScannedWeek] = useState<string>("");
  const [scannedType, setScannedType] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const studentId = localStorage.getItem("studentDatabaseId");
    
    if (!token || !studentId) { router.push("/login"); return; }

    fetchLog(token, studentId);
  }, [id, router]);

  const fetchLog = (token: string, studentId: string) => {
    fetch(`/api-proxy/Attendance/GetAttendancesBySubjectAndStudent/${id}/${studentId}`, {
      headers: { "accept": "*/*", "Authorization": `Bearer ${token}` }
    })
    .then(async (res) => {
      const text = await res.text();
      if (!res.ok) throw new Error(text);
      if (text && text.length > 2) return JSON.parse(text);
      return [];
    })
    .then(data => {
      const mappedGrid: WeekData[] = Array.from({ length: 14 }, (_, i) => {
        const weekNum = i + 1;
        const existingWeek = data.find((w: any) => w.weekNumber === weekNum);
        
        return {
          weekNumber: weekNum,
          attendances: existingWeek ? existingWeek.attendances : [
             { isFinished: false, attendanceType: "Lecture", isAttend: false },
             { isFinished: false, attendanceType: "Section", isAttend: false }
          ]
        };
      });
      setWeeks(mappedGrid);
    })
    .catch(err => {
      console.warn("API Error:", err.message);
      setWeeks([]); 
    })
    .finally(() => setIsLoading(false));
  };

  const launchScanner = () => {
    setScannerState("qr");
    setFacingMode("environment"); 
    setTimeout(() => startStream("environment"), 100);
  };

  const startStream = async (mode: "user" | "environment") => {
    if (!videoRef.current) return;
    try {
      if (videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: mode } });
      videoRef.current.srcObject = stream;
    } catch (e) {
      alert("Camera Permission Error.");
      setScannerState("closed");
    }
  };

  const stopStream = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
  };

  const handleQrSuccess = () => {
    // 1. Simulate reading the teacher's QR code and extracting ALL parameters
    setScannedGroup("1"); // Group ID
    setScannedWeek("1");  // Week Number
    setScannedType("Lecture"); 
    
    // 2. Switch to Face ID mode
    setScannerState("selfie");
    setFacingMode("user");
    startStream("user");
  };

  const captureSelfieAndSend = async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (ctx && facingMode === 'user') {
       ctx.translate(canvas.width, 0); ctx.scale(-1, 1);
    }
    ctx?.drawImage(videoRef.current, 0, 0);
    
    stopStream();
    setScannerState("processing");

    try {
      const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg'));
      if (!blob) throw new Error("Failed to process image");

      const formData = new FormData();
      formData.append("file", blob, "selfie.jpg");
      
      // FULL TARGETING: We now append all data extracted from the QR code!
      formData.append("subjectId", String(id));
      formData.append("group", scannedGroup); 
      formData.append("week", scannedWeek);
      formData.append("type", scannedType);

      // Send to local Python Server
      const response = await fetch("http://127.0.0.1:8000/recognize", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Facial verification failed.");

      setScannerState("success");
      setTimeout(() => {
        setScannerState("closed");
        const token = localStorage.getItem("authToken");
        const studentId = localStorage.getItem("studentDatabaseId");
        if (token && studentId) fetchLog(token, studentId);
      }, 3000);

    } catch (err) {
      console.warn("AI Verification Error:", err);
      setScannerState("error");
      setTimeout(() => setScannerState("closed"), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col gap-4 items-center justify-center text-blue-900 uppercase font-black tracking-widest animate-pulse">
        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl" />
        <p className="text-xs">Fetching Attendance Logs...</p>
      </div>
    );
  }

  let totalFinished = 0;
  let totalAttended = 0;
  weeks.forEach(w => w.attendances.forEach(a => {
    if (a.isFinished) {
      totalFinished++;
      if (a.isAttend) totalAttended++;
    }
  }));

  const absenceCount = totalFinished - totalAttended;
  const isDanger = absenceCount >= 4;

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-10 animate-in fade-in pb-20">
      
      <header>
        <button onClick={() => router.push(`/dashboard/student/subject/${id}`)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-900 mb-4 transition-colors">
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Subject
        </button>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight italic">Attendance Log</h1>
            <p className="text-gray-500 font-medium text-sm mt-1">Track your presence throughout the semester.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <button 
              onClick={launchScanner}
              className="bg-blue-600 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg hover:bg-blue-500 animate-pulse"
            >
              <FontAwesomeIcon icon={faQrcode} className="text-lg" /> Log Active Session
            </button>

            <div className={`px-6 py-4 rounded-2xl border-2 flex items-center gap-4 ${isDanger ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white border-gray-100'}`}>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Absences</p>
                <p className={`text-2xl font-black ${isDanger ? 'text-red-700' : 'text-gray-900'}`}>{absenceCount}</p>
              </div>
              {isDanger && (
                 <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xl animate-pulse">
                   <FontAwesomeIcon icon={faExclamationTriangle} />
                 </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 14 WEEK GRID */}
      {weeks.length === 0 ? (
        <div className="text-center p-16 bg-white rounded-[3rem] border border-gray-100 border-dashed shadow-sm">
          <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No data to display</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {weeks.map((week) => (
            <div key={week.weekNumber} className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-black text-blue-900 uppercase italic mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faCalendarAlt} className="text-blue-200" /> Week {week.weekNumber}
              </h3>
              
              <div className="space-y-3">
                {week.attendances.map((record, idx) => {
                  let boxStyle = "bg-gray-50 border-gray-200 text-gray-400";
                  let icon = faClock;
                  let statusText = "Upcoming";

                  if (record.isFinished) {
                    if (record.isAttend) {
                      boxStyle = "bg-green-50 border-green-200 text-green-700";
                      icon = faCheckCircle;
                      statusText = "Present";
                    } else {
                      boxStyle = "bg-red-50 border-red-200 text-red-600";
                      icon = faTimesCircle;
                      statusText = "Absent";
                    }
                  }

                  return (
                    <div key={idx} className={`p-3 rounded-2xl border flex items-center justify-between transition-colors ${boxStyle}`}>
                      <span className="text-[10px] font-black uppercase tracking-widest">{record.attendanceType}</span>
                      <div className="flex items-center gap-2 text-xs font-bold uppercase">
                        {statusText} <FontAwesomeIcon icon={icon} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- TWO-STEP SCANNER OVERLAY --- */}
      {scannerState !== "closed" && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-8 text-center shadow-2xl relative overflow-hidden">
             
             {scannerState === "qr" && (
               <div className="animate-in slide-in-from-right">
                 <h3 className="text-2xl font-black uppercase text-gray-900 italic mb-2">Step 1: Scan Board</h3>
                 <p className="text-xs font-bold text-gray-500 mb-6">Point camera at the teacher's screen.</p>
                 <div className="relative aspect-square bg-black rounded-[2rem] overflow-hidden mb-6 border-4 border-blue-900/20">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    <div className="absolute inset-0 border-[6px] border-dashed border-white/50 m-8 rounded-3xl"></div>
                 </div>
                 <button onClick={handleQrSuccess} className="w-full py-4 bg-blue-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-800 mb-3">Simulate QR Read</button>
               </div>
             )}

             {scannerState === "selfie" && (
               <div className="animate-in slide-in-from-right">
                 <h3 className="text-2xl font-black uppercase text-gray-900 italic mb-2">Step 2: Face ID</h3>
                 <p className="text-xs font-bold text-gray-500 mb-6">Center your face to verify identity.</p>
                 <div className="relative aspect-square bg-black rounded-[2rem] overflow-hidden mb-6">
                    <video ref={videoRef} autoPlay playsInline className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`} />
                    <button onClick={() => {
                      const newMode = facingMode === "user" ? "environment" : "user";
                      setFacingMode(newMode); startStream(newMode);
                    }} className="absolute top-4 left-4 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/80">
                      <FontAwesomeIcon icon={faSyncAlt} />
                    </button>
                 </div>
                 <button onClick={captureSelfieAndSend} className="w-full py-4 bg-blue-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-800 mb-3 flex items-center justify-center gap-2">
                   <FontAwesomeIcon icon={faCamera} /> Verify Identity
                 </button>
               </div>
             )}

             {scannerState === "processing" && (
               <div className="py-20 flex flex-col items-center">
                 <FontAwesomeIcon icon={faSpinner} className="animate-spin text-5xl text-blue-900 mb-6" />
                 <h3 className="text-xl font-black uppercase text-gray-900 italic">Analyzing Biometrics...</h3>
                 <p className="text-xs font-bold text-gray-500 mt-2">Checking against database.</p>
               </div>
             )}

             {scannerState === "success" && (
               <div className="py-20 flex flex-col items-center animate-in zoom-in">
                 <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-5xl mb-6 shadow-inner">
                   <FontAwesomeIcon icon={faCheck} />
                 </div>
                 <h3 className="text-2xl font-black uppercase text-green-700 italic">Verified!</h3>
                 <p className="text-xs font-bold text-gray-500 mt-2">Attendance logged successfully.</p>
               </div>
             )}

             {scannerState === "error" && (
               <div className="py-20 flex flex-col items-center animate-in zoom-in">
                 <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-5xl mb-6 shadow-inner">
                   <FontAwesomeIcon icon={faTimes} />
                 </div>
                 <h3 className="text-2xl font-black uppercase text-red-700 italic">Failed</h3>
                 <p className="text-xs font-bold text-gray-500 mt-2">Could not verify biometrics.</p>
               </div>
             )}

             {(scannerState === "qr" || scannerState === "selfie") && (
                <button onClick={() => { stopStream(); setScannerState("closed"); }} className="w-full py-4 bg-gray-100 text-gray-900 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-200">Cancel</button>
             )}
          </div>
        </div>
      )}
    </div>
  );
}