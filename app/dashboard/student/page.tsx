"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faGraduationCap, faQrcode, faBell, faUserCircle, 
  faCamera, faExclamationTriangle, faCheckCircle, 
  faTimes, faChevronRight, faStar, faSpinner, faPhone, faSignOutAlt, faSyncAlt, faCheck
} from "@fortawesome/free-solid-svg-icons";

export default function StudentDashboard() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState<"home" | "profile" | "schedule">("home");
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error" | "warning", text: string } | null>(null);
  
  // LIVE DATA STATES
  const [studentData, setStudentData] = useState<any>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // FORM STATES
  const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [isUpdating, setIsUpdating] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");

  // --- TWO-STEP SCANNER STATES ---
  const [scannerState, setScannerState] = useState<"closed" | "qr" | "selfie" | "processing" | "success" | "error">("closed");
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);
  const [scannedGroup, setScannedGroup] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);

 useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) { router.push("/login"); return; }
    setAuthToken(token);
    
    // 1. We delay the dashboard fetch by 800ms to give the backend database 
    // time to recover from the identical request made by the Login page.
    const fetchProfile = setTimeout(() => {
      fetch("/api-proxy/Auth/GetUserInfo", {
        method: "GET",
        headers: { 
          "accept": "*/*", 
          "Authorization": `Bearer ${token}` 
        }
      })
      .then(async (res) => {
        const text = await res.text();
        if (!res.ok) {
          // Identify if it's a security issue (401) or a server crash (500)
          if (res.status === 401) throw new Error("UNAUTHORIZED");
          throw new Error(`SERVER_ERROR`);
        }
        return JSON.parse(text);
      })
      .then(data => {
        if (data.role !== "Student") throw new Error("UNAUTHORIZED");
        
        localStorage.setItem("studentDatabaseId", data.id.toString());
        
        setStudentData({
          id: data.id,             
          code: data.code,         
          name: data.fullName || data.userName,
          username: data.userName,
          email: data.email,
          phone: data.phoneNumber,
          dept: data.department,
          gpa: data.gpa || 0,
          subjects: data.subjects || [],
          history: data.academicHistory || []
        });
        
        setPhoneInput(data.phoneNumber || "");
        setProfileImage(data.imagePath || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.userName}`);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Dashboard Fetch Error:", err);
        // 2. Smart Error Handling: Only kick out for 401s, not 500s!
        if (err.message.includes("UNAUTHORIZED")) {
          setActionMessage({ type: "error", text: "Session expired. Please log in again." });
          setTimeout(() => { localStorage.clear(); router.push("/login"); }, 2000);
        } else {
          setActionMessage({ type: "warning", text: "Server is busy. Please refresh the page." });
          setIsLoading(false); // Let them stay on the page so they can just hit refresh
        }
      });
    }, 800); // 800ms breathing room for the backend

    return () => clearTimeout(fetchProfile);
  }, [router]);
  // --- LOGOUT LOGIC ---
  const handleLogout = async () => {
    try {
      await fetch("/api-proxy/Auth/LogOff", { 
        headers: { "Authorization": `Bearer ${authToken}` } 
      });
    } catch (e) {
      console.warn("Logout ping failed, forcing local clear.");
    } finally {
      localStorage.clear();
      router.push("/login");
    }
  };

  // --- PROFILE API: UPLOAD IMAGE ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUpdating(true); setActionMessage(null);
    try {
      const formData = new FormData();
      formData.append("File", file);

      const response = await fetch("/api-proxy/Auth/UploadUserImage", {
        method: "POST", 
        headers: { "accept": "*/*", "Authorization": `Bearer ${authToken}` }, 
        body: formData 
      });

      const text = await response.text();
      if (!response.ok) throw new Error(`Upload Failed: ${text}`);
      
      const data = JSON.parse(text);
      setProfileImage(data.filePath || URL.createObjectURL(file)); 
      setActionMessage({ type: "success", text: "Profile picture updated successfully!" });
    } catch (err: any) {
      setActionMessage({ type: "error", text: err.message });
      setProfileImage(URL.createObjectURL(file)); 
    } finally { setIsUpdating(false); }
  };

  // --- PROFILE API: CHANGE PASSWORD ---
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setActionMessage({ type: "error", text: "New passwords do not match." }); return;
    }

    setIsUpdating(true); setActionMessage(null);
    try {
      const response = await fetch("/api-proxy/Auth/ChangePassword", {
        method: "POST", 
        headers: { "Content-Type": "application/json", "accept": "*/*", "Authorization": `Bearer ${authToken}` }, 
        body: JSON.stringify(passwordForm)
      });

      const text = await response.text();
      if (!response.ok) {
        try {
          const errData = JSON.parse(text);
          if (errData.errors) throw new Error(Object.values(errData.errors).flat().join(" | "));
          throw new Error(errData.title || text);
        } catch { throw new Error(text); }
      }
      
      setActionMessage({ type: "success", text: text || "Password changed successfully!" });
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      setActionMessage({ type: "error", text: err.message });
    } finally { setIsUpdating(false); }
  };

  const handleUpdatePhone = () => { setActionMessage({ type: "warning", text: "Phone update API is currently unhandled by the backend. Contact Admin." }); };

  // --- TWO STEP SCANNER LOGIC ---
  const launchScanner = (subjectId: string) => {
    setActiveSubjectId(subjectId);
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
    // Simulate extracting target info from the decoded QR
    setScannedGroup("G1");

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
      
      // Targeted AI matching
      formData.append("subjectId", String(activeSubjectId));
      formData.append("group", scannedGroup); 

      // Send to local Python Server
      const response = await fetch("http://127.0.0.1:8000/recognize", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Facial verification failed.");

      setScannerState("success");
      setTimeout(() => {
        setScannerState("closed");
        router.push(`/dashboard/student/subject/${activeSubjectId}/attendance`);
      }, 3000);

    } catch (err) {
      console.warn("AI Verification Error:", err);
      setScannerState("error");
      setTimeout(() => setScannerState("closed"), 3000);
    }
  };


  if (isLoading || !studentData) {
    return (
      <div className="min-h-screen flex flex-col gap-4 items-center justify-center bg-gray-50 uppercase font-black text-blue-900 tracking-widest animate-pulse">
        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl" />
        <p className="text-xs">Loading Student Portal...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col transition-colors duration-300">
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-blue-900 text-white shadow-2xl h-20">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white text-blue-900 rounded-[1rem] flex items-center justify-center text-xl font-black italic shadow-lg shrink-0">HTI</div>
            <div className="hidden sm:block">
              <h1 className="font-black text-xs uppercase tracking-widest truncate max-w-[150px]">{studentData.name}</h1>
              <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-blue-300 mt-1">{studentData.dept}</p>
            </div>
          </div>

          <div className="flex bg-black/20 p-1 rounded-2xl backdrop-blur-md">
            {[
              { id: "home", label: "Dashboard", icon: faGraduationCap },
              { id: "profile", label: "Profile", icon: faUserCircle }
            ].map((t) => (
              <button
                key={t.id} onClick={() => { setActiveTab(t.id as any); setActionMessage(null); }}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === t.id ? "bg-white text-blue-900 shadow-lg" : "text-blue-100 hover:bg-white/10"}`}
              >
                <FontAwesomeIcon icon={t.icon} /> <span className="hidden md:block">{t.label}</span>
              </button>
            ))}
          </div>

          <button onClick={handleLogout} className="text-red-400 p-4 hover:bg-red-500/10 rounded-xl transition-all"><FontAwesomeIcon icon={faSignOutAlt} /></button>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-7xl mx-auto p-6 pt-28 md:p-10 md:pt-36">
        
        {/* GLOBAL ALERTS */}
        {actionMessage && (
          <div className={`p-4 mb-8 rounded-2xl flex items-start gap-3 border transition-all ${actionMessage.type === "error" ? "bg-red-50 border-red-200 text-red-600" : actionMessage.type === "warning" ? "bg-yellow-50 border-yellow-200 text-yellow-700" : "bg-green-50 border-green-200 text-green-600"}`}>
            <FontAwesomeIcon icon={actionMessage.type === "error" ? faExclamationTriangle : faCheckCircle} className="mt-1 shrink-0" />
            <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed break-all">{actionMessage.text}</p>
          </div>
        )}

        {/* --- TAB 1: HOME --- */}
        {activeTab === "home" && (
          <div className="space-y-8 animate-in fade-in duration-500">
            
            {/* HERO BANNER & GPA */}
            <div className="bg-blue-900 text-white rounded-[3rem] p-10 md:p-14 shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="relative z-10 text-center md:text-left">
                <p className="text-blue-300 font-bold uppercase text-[10px] tracking-widest mb-2">Welcome Back,</p>
                <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-tight">{studentData.name}</h1>
                <p className="text-blue-200 mt-2 font-medium">Code: {studentData.code}</p>
              </div>
              <div className="relative z-10 bg-white text-blue-900 px-10 py-8 rounded-[2rem] text-center shadow-xl border-4 border-blue-800">
                <p className="text-[9px] font-black uppercase tracking-widest text-blue-400 mb-2">Cumulative GPA</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-black italic">{studentData.gpa.toFixed(2)}</span>
                  <span className="text-sm font-bold text-gray-400">/ 4.0</span>
                </div>
              </div>
            </div>

            {/* ENROLLED SUBJECTS GRID */}
            <div>
               <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4 mb-4">Current Semester</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {studentData.subjects.length === 0 ? (
                    <div className="col-span-full p-10 text-center border-2 border-dashed border-gray-200 rounded-[3rem]">
                       <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Not enrolled in any subjects.</p>
                    </div>
                 ) : (
                    studentData.subjects.map((sub: any) => (
                      <div key={sub.id} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-lg transition-all group flex flex-col justify-between min-h-[200px] relative overflow-hidden">
                        
                        <div className="flex justify-between items-start mb-4 relative z-10">
                          <div className="w-12 h-12 bg-blue-50 text-blue-900 rounded-2xl flex items-center justify-center text-sm font-black">{sub.id}</div>
                          <button onClick={() => router.push(`/dashboard/student/subject/${sub.id}`)} className="w-10 h-10 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center hover:bg-blue-900 hover:text-white transition-colors"><FontAwesomeIcon icon={faChevronRight} /></button>
                        </div>
                        <h4 className="text-lg font-black text-gray-900 uppercase italic leading-tight relative z-10">{sub.name}</h4>
                        
                        {sub.hasActiveSession && (
                          <div className="mt-6 relative z-10">
                            <button onClick={() => launchScanner(sub.id)} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg hover:bg-blue-500 animate-pulse">
                              <FontAwesomeIcon icon={faQrcode} /> Log Attendance Now
                            </button>
                          </div>
                        )}
                        
                        {!sub.hasActiveSession && (
                          <div className="mt-4 pt-4 border-t border-gray-50 relative z-10">
                            {sub.lectureDates && sub.lectureDates.map((date: string, idx: number) => (
                               <p key={idx} className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 truncate">{date}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                 )}
               </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: PROFILE --- */}
        {activeTab === "profile" && (
          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in zoom-in-95 duration-500">
            {/* Identity Card */}
            <div className="bg-blue-900 text-white rounded-[3rem] p-10 shadow-2xl flex flex-col items-center sm:items-start text-center sm:text-left gap-8">
              <div className="relative group">
                <div className="w-32 h-32 bg-white/10 rounded-[2.5rem] border-4 border-white/20 overflow-hidden flex items-center justify-center relative">
                  <img src={profileImage || ""} alt="Profile" className="w-full h-full object-cover" />
                  {isUpdating && <div className="absolute inset-0 bg-blue-900/50 flex items-center justify-center"><FontAwesomeIcon icon={faSpinner} className="animate-spin text-white text-2xl" /></div>}
                </div>
                <input type="file" accept="image/jpeg, image/png, image/webp" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 w-10 h-10 bg-white text-blue-900 rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform group-hover:bg-blue-50">
                  <FontAwesomeIcon icon={faCamera} size="sm" />
                </button>
              </div>

              <div className="space-y-6 w-full">
                <div><p className="text-[8px] font-black text-blue-300 uppercase tracking-widest mb-1">Student Identity</p><p className="text-xl font-black uppercase tracking-tight">{studentData.name}</p><p className="text-xs font-medium text-blue-200 mt-1">@{studentData.username}</p></div>
                <div className="pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
                  <div><p className="text-[8px] font-black text-blue-300 uppercase tracking-widest mb-1">College Code</p><p className="font-mono font-bold text-sm tracking-widest">{studentData.code}</p></div>
                  <div><p className="text-[8px] font-black text-blue-300 uppercase tracking-widest mb-1">Department</p><p className="font-bold text-[11px] uppercase truncate" title={studentData.dept}>{studentData.dept}</p></div>
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col justify-center">
                 <h4 className="font-black text-gray-900 uppercase text-xs mb-6 flex items-center gap-2"><FontAwesomeIcon icon={faPhone} className="text-blue-900" /> Contact Info</h4>
                 <div className="flex gap-2">
                    <input type="tel" value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)} placeholder="01XXXXXXXXX" className="flex-1 p-4 bg-gray-50 border border-transparent focus:border-blue-900 outline-none rounded-2xl text-sm font-bold" />
                    <button onClick={handleUpdatePhone} className="bg-blue-100 text-blue-900 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-200 transition-colors">Update</button>
                 </div>
              </div>

              <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col justify-center">
                <h4 className="font-black text-gray-900 uppercase text-xs mb-6">Security Settings</h4>
                <form className="space-y-4" onSubmit={handleChangePassword}>
                  <input required type="password" placeholder="Current Password" value={passwordForm.oldPassword} onChange={e => setPasswordForm({...passwordForm, oldPassword: e.target.value})} className="w-full p-4 bg-gray-50 border border-transparent focus:border-blue-900 outline-none rounded-2xl text-sm font-bold" />
                  <input required type="password" placeholder="New Password" value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} className="w-full p-4 bg-gray-50 border border-transparent focus:border-blue-900 outline-none rounded-2xl text-sm font-bold" />
                  <input required type="password" placeholder="Confirm New Password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} className="w-full p-4 bg-gray-50 border border-transparent focus:border-blue-900 outline-none rounded-2xl text-sm font-bold" />
                  <button type="submit" disabled={isUpdating} className="w-full bg-blue-900 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex justify-center items-center gap-2">
                    {isUpdating ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : "Update Password"}
                  </button>
                </form>
              </div>
            </div>

          </div>
        )}
      </main>

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
                 <p className="text-xs font-bold text-gray-500 mt-2">Checking against Group {scannedGroup} database.</p>
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