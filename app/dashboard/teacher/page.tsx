"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faColumns, faUserCircle, faSignOutAlt, faClock, 
  faChevronRight, faCamera, faCheckDouble, faCheckCircle, 
  faSpinner, faExclamationTriangle, faArrowLeft, faFileDownload, faPaperPlane,
  faBell,
  faUsers
} from "@fortawesome/free-solid-svg-icons";

export default function TeacherLobby() {
  const [activeTab, setActiveTab] = useState<"home" | "tasks" | "profile">("home");
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [teacherData, setTeacherData] = useState<any>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error" | "warning", text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // GRADING STATES
  const [gradingAssignmentId, setGradingAssignmentId] = useState<number | null>(null);
  const [gradingData, setGradingData] = useState<any>(null);
  const [scores, setScores] = useState<Record<number, string>>({});

  // PROFILE STATES
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/login");
      return;
    }
    setAuthToken(token);

    fetch("/api-proxy/Auth/GetUserInfo", {
  headers: { "accept": "*/*", "Authorization": `Bearer ${token}` }
})
    .then(async (res) => {
      const textResponse = await res.text();
      if (!res.ok) throw new Error(`Failed to load profile: ${textResponse}`);
      return JSON.parse(textResponse);
    })
    .then(data => {
      if (data.role !== "Teacher") throw new Error("Unauthorized: Account is not a Teacher.");
      setTeacherData({
        id: data.id,             
        code: data.code,         
        name: data.fullName || data.name,
        dept: data.department,
        courses: data.subjects || [],
        // Fallback to mock if API gives empty list for UI testing
        reviews: data.pendingAssignmentReviews?.length > 0 ? data.pendingAssignmentReviews : [
          { id: 1, assignmentName: "Midterm Project", subjectName: "Microwave Engineering", count: 12 }
        ],
        email: data.email
      });
      // Load real image from API if it exists
      setProfileImage(data.imagePath || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.userName}`);
    })
    .catch(err => {
      console.error(err);
      setError(err.message);
    });
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  // --- GRADING API ---
  const fetchSubmissions = async (assignmentId: number) => {
    setGradingAssignmentId(assignmentId);
    setIsLoading(true);
    setActionMessage(null);
    setScores({});
    
    try {
      const res = await fetch(`/api-proxy/Assignment/GetPendingById/${assignmentId}`, {
  headers: { "accept": "*/*", "Authorization": `Bearer ${authToken}` }
});
      
      const textResponse = await res.text();
      if (!res.ok) throw new Error(textResponse);
      const data = JSON.parse(textResponse);
      setGradingData(data[0] || null); 
    } catch (err: any) {
      console.warn("Backend Error Caught:", err.message);
      setActionMessage({ type: "warning", text: "Backend LINQ error caught. Displaying mock submissions for UI testing." });
      setGradingData({
        AssignmentName: "Midterm Project",
        AssignmentScore: 100, 
        PendingAssignments: [
          { StudentAssignment: 101, StudentName: "Sara Khaled", StudentCode: "32021124", Attachment: "http://example.com/file1.pdf" },
          { StudentAssignment: 102, StudentName: "Ali Mohamed", StudentCode: "32021147", Attachment: "http://example.com/file2.pdf" }
        ]
      });
    } finally { setIsLoading(false); }
  };

  const handleScoreChange = (studentAssignmentId: number, val: string) => { setScores(prev => ({ ...prev, [studentAssignmentId]: val })); };

  const submitGrades = async () => {
    setIsLoading(true); setActionMessage(null);
    try {
      const payload = Object.keys(scores).map(id => ({ studentAssignmentId: Number(id), score: Number(scores[Number(id)]) })).filter(sub => sub.score >= 0); 
      if (payload.length === 0) throw new Error("Please enter at least one score before submitting.");
      const response = await fetch("/api-proxy/Assignment/Review", {
  method: "POST", 
  headers: { "Content-Type": "application/json", "accept": "*/*", "Authorization": `Bearer ${authToken}` }, 
  body: JSON.stringify(payload)
});
      if (!response.ok) throw new Error(await response.text());
      setActionMessage({ type: "success", text: `Successfully submitted ${payload.length} grades!` });
      setGradingAssignmentId(null); 
    } catch (error: any) { setActionMessage({ type: "error", text: error.message }); } finally { setIsLoading(false); }
  };

  // --- PROFILE API: UPLOAD IMAGE ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsLoading(true); setActionMessage(null);
    try {
      const formData = new FormData();
      formData.append("File", file); // Swagger requires key "File"

      const response = await fetch("/api-proxy/Auth/UploadUserImage", {
        method: "POST",
        headers: { "accept": "*/*", "Authorization": `Bearer ${authToken}` },
        // Notice: We do NOT set "Content-Type". The browser sets it automatically with the multipart boundary!
        body: formData
      });

      const text = await response.text();
      if (!response.ok) throw new Error(`Upload Failed: ${text}`);
      
      const data = JSON.parse(text);
      setProfileImage(data.filePath); // Update UI immediately with the new URL
      setActionMessage({ type: "success", text: "Profile picture updated successfully!" });
    } catch (err: any) {
      setActionMessage({ type: "error", text: err.message });
    } finally { setIsLoading(false); }
  };

  // --- PROFILE API: CHANGE PASSWORD ---
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setActionMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    setIsLoading(true); setActionMessage(null);
    try {
      const response = await fetch("/api-proxy/Auth/ChangePassword", {
        method: "POST",
        headers: { "Content-Type": "application/json", "accept": "*/*", "Authorization": `Bearer ${authToken}` },
        body: JSON.stringify(passwordForm)
      });

      const text = await response.text();
      if (!response.ok) {
        // Attempt to parse ASP.NET validation error schema
        try {
          const errData = JSON.parse(text);
          if (errData.errors) throw new Error(Object.values(errData.errors).flat().join(" | "));
          throw new Error(errData.title || text);
        } catch { throw new Error(text); }
      }
      
      setActionMessage({ type: "success", text: "Password changed successfully!" });
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" }); // Reset form
    } catch (err: any) {
      setActionMessage({ type: "error", text: err.message });
    } finally { setIsLoading(false); }
  };

  if (error) return (
     <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center"><FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 text-4xl mb-4" /><h2 className="text-xl font-black text-gray-900 uppercase">Authentication Error</h2><p className="text-sm text-gray-500 mt-2">{error}</p><button onClick={handleLogout} className="mt-6 bg-blue-900 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px]">Return to Login</button></div>
  );

  if (!teacherData) return (
     <div className="min-h-screen flex flex-col gap-4 items-center justify-center bg-gray-50 uppercase font-black text-blue-900 tracking-widest animate-pulse"><FontAwesomeIcon icon={faSpinner} className="animate-spin text-3xl" /><p className="text-xs">Loading Faculty Portal...</p></div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-blue-900 text-white shadow-2xl h-20">
        <div className="w-full h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white text-blue-900 rounded-xl flex items-center justify-center font-black italic shadow-lg shrink-0">HTI</div>
            <div className="hidden sm:block">
              <h1 className="font-black text-[10px] uppercase tracking-tighter leading-none truncate max-w-[150px]">{teacherData.name}</h1>
              <p className="text-[7px] text-blue-300 font-bold uppercase mt-1 tracking-widest italic">{teacherData.dept} Faculty</p>
            </div>
          </div>

          <div className="flex bg-black/20 p-1 rounded-2xl border border-white/5 backdrop-blur-md">
            {[
              { id: "home", label: "Home", icon: faColumns },
              { id: "tasks", label: "Actions", icon: faBell },
              { id: "profile", label: "Profile", icon: faUserCircle }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => { setActiveTab(t.id as any); setGradingAssignmentId(null); setActionMessage(null); }}
                className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                  activeTab === t.id ? "bg-white text-blue-900 shadow-lg" : "text-blue-100 hover:bg-white/10"
                }`}
              >
                <FontAwesomeIcon icon={t.icon} className="text-[10px]" />
                <span className="hidden xs:block">{t.label}</span>
                {t.id === "tasks" && teacherData.reviews.length > 0 && (
                  <span className="bg-orange-500 text-white w-4 h-4 flex items-center justify-center rounded-full text-[8px] ml-1">{teacherData.reviews.length}</span>
                )}
              </button>
            ))}
          </div>

          <button onClick={handleLogout} className="text-red-400 p-3 hover:bg-red-500/10 rounded-xl transition-all"><FontAwesomeIcon icon={faSignOutAlt} /></button>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-7xl mx-auto p-6 pt-24 md:p-10 md:pt-32 animate-in fade-in duration-500">
        
        {/* GLOBAL ALERTS */}
        {actionMessage && (
          <div className={`p-4 mb-6 rounded-2xl flex items-start gap-3 border ${actionMessage.type === "error" ? "bg-red-50 border-red-200 text-red-600" : actionMessage.type === "warning" ? "bg-yellow-50 border-yellow-200 text-yellow-700" : "bg-green-50 border-green-200 text-green-600"}`}>
            <FontAwesomeIcon icon={actionMessage.type === "error" ? faExclamationTriangle : faCheckCircle} className="mt-1 shrink-0" />
            <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed break-all">{actionMessage.text}</p>
          </div>
        )}

        {/* --- TAB 1: HOME (Assigned Courses) --- */}
        {activeTab === "home" && (
          <div className="space-y-10">
            <header className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
               <div className="relative z-10">
                  <h2 className="text-3xl font-black text-gray-900 uppercase italic leading-none">Teaching Load</h2>
                  <p className="text-gray-500 font-medium mt-3 uppercase text-[10px] tracking-widest">Active Academic Period</p>
               </div>
               <div className="relative z-10 bg-blue-900 text-white p-6 rounded-[2rem] shadow-xl text-center min-w-[150px]">
                  <p className="text-[9px] font-black uppercase text-blue-300 mb-1">Total Subjects</p>
                  <p className="text-4xl font-black italic">{teacherData.courses.length}</p>
               </div>
            </header>

            {teacherData.courses.length === 0 ? (
               <div className="p-12 border-2 border-dashed border-gray-200 rounded-[3rem] text-center">
                 <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">You are not currently assigned to any subjects.</p>
               </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teacherData.courses.map((sub: any) => (
                  <div key={sub.id} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                    <div className="flex justify-between items-start mb-6">
                       <div className="p-4 bg-blue-50 text-blue-900 rounded-2xl flex items-center gap-2">
                          <FontAwesomeIcon icon={faUsers} />
                          <span className="text-xs font-black">{sub.groups?.length || 0} Groups</span>
                       </div>
                       <button onClick={() => router.push(`/dashboard/teacher/subject/${sub.id}`)} className="w-12 h-12 bg-blue-900 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><FontAwesomeIcon icon={faChevronRight} /></button>
                    </div>
                    <h3 className="text-lg font-black text-gray-900 uppercase italic leading-tight mb-4 h-12 overflow-hidden" title={sub.name}>{sub.name}</h3>
                    <div className="space-y-3 pt-4 border-t border-gray-50">
                       <div className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-2"><FontAwesomeIcon icon={faClock} className="text-blue-900" /> Database ID: {sub.id}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- TAB 2: ACTIONS (Tasks & GRADING) --- */}
        {activeTab === "tasks" && !gradingAssignmentId && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end">
              <div><h2 className="text-3xl font-black text-gray-900 uppercase italic">Pending Reviews</h2><p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-2">Assignments awaiting your grade</p></div>
            </div>

            <div className="grid gap-6">
              {teacherData.reviews.map((rev: any, idx: number) => (
                <div key={idx} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-blue-50 text-blue-900 rounded-[2rem] flex items-center justify-center text-xl group-hover:bg-blue-900 group-hover:text-white transition-colors duration-300"><FontAwesomeIcon icon={faCheckDouble} /></div>
                    <div>
                      <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span><p className="font-black text-gray-900 text-lg uppercase italic">{rev.assignmentName || `Assignment ${rev.id}`}</p></div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{rev.subjectName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="text-right px-4 hidden sm:block"><p className="text-2xl font-black text-gray-900 leading-none">{rev.count}</p><p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter mt-1">Pending</p></div>
                    <button onClick={() => fetchSubmissions(rev.id)} className="w-full sm:w-auto bg-blue-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-blue-800 active:scale-95 transition-all flex items-center justify-center gap-3">
                      {isLoading ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : "Handle Now"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- GRADING INTERFACE --- */}
        {activeTab === "tasks" && gradingAssignmentId && gradingData && (
          <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-right-4 duration-500">
            <button onClick={() => setGradingAssignmentId(null)} className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-blue-900 transition-colors"><FontAwesomeIcon icon={faArrowLeft} /> Back to Pending List</button>

            <div className="bg-white p-8 md:p-10 rounded-[3rem] border border-gray-100 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-gray-100 pb-8">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 uppercase italic">{gradingData.AssignmentName}</h2>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Maximum Score: {gradingData.AssignmentScore} Points</p>
                </div>
                <button onClick={submitGrades} disabled={isLoading} className="bg-green-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-green-600 active:scale-95 transition-all w-full sm:w-auto flex items-center justify-center gap-2">
                  {isLoading ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : <><FontAwesomeIcon icon={faPaperPlane} /> Submit Grades</>}
                </button>
              </div>

              <div className="space-y-4">
                {gradingData.PendingAssignments.map((student: any) => (
                  <div key={student.StudentAssignment} className="flex flex-col sm:flex-row items-center justify-between p-6 bg-gray-50 rounded-3xl gap-4">
                    <div className="flex-1 w-full">
                      <p className="font-black text-gray-900 uppercase text-sm">{student.StudentName}</p>
                      <p className="text-[10px] font-bold text-gray-500 tracking-widest mt-1">Code: {student.StudentCode}</p>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <a href={student.Attachment} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-blue-50 text-blue-900 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-colors"><FontAwesomeIcon icon={faFileDownload} /> View Work</a>
                      <div className="relative">
                        <input type="number" min="0" max={gradingData.AssignmentScore} placeholder="Grade" value={scores[student.StudentAssignment] || ""} onChange={(e) => handleScoreChange(student.StudentAssignment, e.target.value)} className="w-24 p-3 bg-white border-2 border-transparent focus:border-blue-900 outline-none rounded-xl text-sm font-black text-center text-blue-900 shadow-sm" />
                        <span className="absolute -top-2 -right-2 text-[8px] font-black text-gray-400 bg-gray-100 px-1 rounded">/{gradingData.AssignmentScore}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 3: PROFILE (UPDATED) --- */}
        {activeTab === "profile" && (
          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in zoom-in-95 duration-500">
            
            <div className="bg-blue-900 text-white rounded-[3rem] p-10 shadow-2xl flex flex-col items-center sm:items-start text-center sm:text-left gap-8">
              <div className="relative group">
                <div className="w-32 h-32 bg-white/10 rounded-[2.5rem] border-4 border-white/20 overflow-hidden flex items-center justify-center relative">
                  <img src={profileImage || ""} alt="Profile" className="w-full h-full object-cover" />
                  {isLoading && <div className="absolute inset-0 bg-blue-900/50 flex items-center justify-center"><FontAwesomeIcon icon={faSpinner} className="animate-spin text-white text-2xl" /></div>}
                </div>
                {/* Hidden File Input & Trigger */}
                <input type="file" accept="image/jpeg, image/png, image/webp" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 w-10 h-10 bg-white text-blue-900 rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform group-hover:bg-blue-50">
                  <FontAwesomeIcon icon={faCamera} size="sm" />
                </button>
              </div>

              <div className="space-y-6 w-full">
                <div>
                  <p className="text-[8px] font-black text-blue-300 uppercase tracking-widest mb-1">Academic Designation</p>
                  <p className="text-xl font-black uppercase tracking-tight">{teacherData.name}</p>
                </div>
                <div className="pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[8px] font-black text-blue-300 uppercase tracking-widest mb-1">College Code</p>
                    <p className="font-mono font-bold text-sm tracking-widest">{teacherData.code}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-blue-300 uppercase tracking-widest mb-1">Department</p>
                    <p className="font-bold text-[11px] uppercase truncate" title={teacherData.dept}>{teacherData.dept}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col justify-center">
              <h4 className="font-black text-gray-900 uppercase text-xs mb-6 text-center">Faculty Settings</h4>
              <form className="space-y-4" onSubmit={handleChangePassword}>
                <input required type="password" placeholder="Current Password" value={passwordForm.oldPassword} onChange={e => setPasswordForm({...passwordForm, oldPassword: e.target.value})} className="w-full p-4 bg-gray-50 border border-transparent focus:border-blue-900 outline-none rounded-2xl text-sm font-bold" />
                <input required type="password" placeholder="New Password" value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} className="w-full p-4 bg-gray-50 border border-transparent focus:border-blue-900 outline-none rounded-2xl text-sm font-bold" />
                <input required type="password" placeholder="Confirm New Password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} className="w-full p-4 bg-gray-50 border border-transparent focus:border-blue-900 outline-none rounded-2xl text-sm font-bold" />
                <button type="submit" disabled={isLoading} className="w-full bg-blue-900 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex justify-center items-center gap-2">
                  {isLoading ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : "Update Password"}
                </button>
              </form>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}