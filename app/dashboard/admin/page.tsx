"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUserShield, faCheckCircle, faTimesCircle, faUserPlus, 
  faGraduationCap, faSignOutAlt, faSpinner, faUsersCog,
  faExclamationTriangle, faBuilding, faBookOpen, faUserEdit, faArrowLeft, faIdCard, faBan, faLock
} from "@fortawesome/free-solid-svg-icons";

type AdminTab = "approvals" | "createUser" | "departments" | "subjects" | "academic" | "profile";
type SubjectAction = "menu" | "createSubject" | "createGroup" | "assignTeacher" | "assignStudent" | "closeSubject" | "closeGroup" | "removeRestrict";

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>("approvals");
  const [authToken, setAuthToken] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error" | "warning", text: string } | null>(null);

  // UPDATED: Added "code" to the dropdown structure to capture college IDs
  const [dropdowns, setDropdowns] = useState({
    departments: [] as {id: number, name: string, code?: string}[],
    subjects: [] as {id: number, name: string, code?: string}[],
    teachers: [] as {id: number, name: string, code?: string}[],
    students: [] as {id: number, name: string, code?: string}[]
  });

  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [isPendingLoading, setIsPendingLoading] = useState(false);

  const [formData, setFormData] = useState({ fullName: "", username: "", email: "", phoneNumber: "", password: "", code: "", departmentId: "", role: "Student" });
  const [deptForm, setDeptForm] = useState({ name: "" });

  const [subjectAction, setSubjectAction] = useState<SubjectAction>("menu");
  const [subjectForm, setSubjectForm] = useState({ code: "", name: "", sectionCount: 1, lectureCount: 1, weeksCount: 14, departmentId: "" });
  const [groupForm, setGroupForm] = useState({ number: 1, year: new Date().getFullYear(), term: "Fall", lectureDay: 0, lecturePeriod: 1, sectionDay: 0, sectionPeriod: 1, subjectId: "", teacherId: "" });
  
  const [assignSubjectId, setAssignSubjectId] = useState(""); 
  const [groupsDropdown, setGroupsDropdown] = useState<{id: number, number: number}[]>([]); 
  const [isGroupsLoading, setIsGroupsLoading] = useState(false);
  const [assignTeacherForm, setAssignTeacherForm] = useState({ groupId: "", teacherId: "" });
  const [assignStudentForm, setAssignStudentForm] = useState({ groupId: "", studentsIds: "" }); 

  const [closeSubjectForm, setCloseSubjectForm] = useState({ subjectId: "", teacherId: "" });
  const [closeGroupId, setCloseGroupId] = useState("");
  const [restrictForm, setRestrictForm] = useState({ studentId: "", subjectId: "" });

  const [selectedStudent, setSelectedStudent] = useState("");
  const [newGpa, setNewGpa] = useState("");
  const [profileData, setProfileData] = useState({ email: "", role: "" });

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) router.push("/login");
    else {
      setAuthToken(token);
      setProfileData({ email: localStorage.getItem("userEmail") || "Unknown", role: localStorage.getItem("userRole") || "Admin" });
    }
  }, [router]);

  // UPDATED: Now silently extracts and saves the "code" from the backend response
  const fetchDropdown = async (endpoint: string, key: keyof typeof dropdowns, mockData: any[]) => {
    try {
      const res = await fetch(`/api-proxy/${endpoint}`, { headers: { "accept": "*/*", "Authorization": `Bearer ${authToken}` } });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setDropdowns(prev => ({ 
        ...prev, 
        [key]: data.map((item: any) => ({ 
          id: item.id || item.departmentId || item.subjectId, 
          name: item.name || item.fullName || item.username,
          code: item.code?.toString() || "" 
        })) 
      }));
    } catch { setDropdowns(prev => ({ ...prev, [key]: mockData })); }
  };

  useEffect(() => {
    if (!authToken) return;
    if (activeTab === "departments" || activeTab === "createUser") fetchDropdown("Department/GetDropdown", "departments", [{ id: 1, name: "Electrical" }]);
    if (activeTab === "subjects") {
      fetchDropdown("Department/GetDropdown", "departments", [{ id: 1, name: "Electrical" }]);
      fetchDropdown("Subject/GetSubjects", "subjects", [{ id: 1, name: "CS101: Intro to CS" }]);
      fetchDropdown("Teacher/GetDropdown", "teachers", [{ id: 1, name: "Teacher Ahmed" }]);
    }
    if (activeTab === "academic" || activeTab === "subjects") {
      fetchDropdown("Student/GetDropdown", "students", [{ id: 101, name: "Sara Khaled", code: "32021124" }]);
    }
  }, [activeTab, subjectAction, authToken]);

  useEffect(() => {
    if (assignSubjectId && authToken) {
      setIsGroupsLoading(true);
      fetch(`/api-proxy/Subject/GetGroupsBySubjectId/${assignSubjectId}`, { headers: { "accept": "*/*", "Authorization": `Bearer ${authToken}` } })
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(data => setGroupsDropdown(data.map((g: any) => ({ id: g.id || g.groupId, number: g.number || g.groupNumber }))))
      .catch(() => setGroupsDropdown([]))
      .finally(() => setIsGroupsLoading(false));
    } else { setGroupsDropdown([]); }
  }, [assignSubjectId, authToken]);

  useEffect(() => {
    if (activeTab === "approvals" && authToken) {
      setIsPendingLoading(true);
      fetch("/api-proxy/Auth/GetNotApprovedUsers", { headers: { "accept": "*/*", "Authorization": `Bearer ${authToken}` } })
        .then(res => res.ok ? res.json() : []).then(data => setPendingUsers(data)).catch(() => setPendingUsers([]))
        .finally(() => setIsPendingLoading(false));
    }
  }, [activeTab, authToken]);

const handleApprove = async (username: string) => {
    setActionMessage(null);
    try {
      // THE FIX: Append the username directly to the URL as a query parameter
      const response = await fetch(`/api-proxy/Auth/ApproveUser?username=${encodeURIComponent(username)}`, { 
        method: "POST", 
        cache: "no-store", 
        headers: { 
          "accept": "*/*", 
          "Authorization": `Bearer ${authToken}` 
        }
        // Notice we completely removed the 'body: JSON.stringify(...)' line!
      });

      // 1. Read the stream exactly once
      const text = await response.text();

      // 2. Safely parse the backend failure
      if (!response.ok) {
        let cleanError = text;
        try {
          const errObj = JSON.parse(text);
          if (errObj.errors) {
            cleanError = Object.values(errObj.errors).flat().join(" | ");
          } else if (errObj.title) {
            cleanError = errObj.title;
          }
        } catch { /* If it's not JSON, stick to the raw text */ }
        throw new Error(cleanError || "Failed to approve user.");
      }

      // 3. Success state
      setActionMessage({ type: "success", text: `User ${username} approved!` });
      setPendingUsers(pendingUsers.filter(u => u.username !== username));
      
    } catch (error: any) { 
      setActionMessage({ type: "error", text: error.message }); 
    }
  };
 const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault(); setIsLoading(true); setActionMessage(null);
    try {
      const payload = { ...formData, departmentId: parseInt(formData.departmentId) || 0, name: formData.fullName.split(' ')[0] };
      const response = await fetch("/api-proxy/Auth/CreateStudentOrTeacher", { 
        method: "POST", 
        cache: "no-store", // <--- ADDS CACHE BYPASS
        headers: { "Content-Type": "application/json", "accept": "*/*", "Authorization": `Bearer ${authToken}` }, 
        body: JSON.stringify(payload) 
      });
      if (!response.ok) throw new Error(await response.text());
      setActionMessage({ type: "success", text: `User created successfully!` });
      setFormData({ fullName: "", username: "", email: "", phoneNumber: "", password: "", code: "", departmentId: "", role: "Student" });
    } catch (error: any) { setActionMessage({ type: "error", text: error.message }); } finally { setIsLoading(false); }
  };

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault(); setIsLoading(true); setActionMessage(null);
    try {
      const response = await fetch("/api-proxy/Department/Create", { 
        method: "POST", 
        cache: "no-store", // <--- ADDS CACHE BYPASS
        headers: { "Content-Type": "application/json", "accept": "*/*", "Authorization": `Bearer ${authToken}` }, 
        body: JSON.stringify({ name: deptForm.name }) 
      });
      if (!response.ok) throw new Error(await response.text());
      setActionMessage({ type: "success", text: `Department ${deptForm.name} created!` });
      setDeptForm({ name: "" }); fetchDropdown("Department/GetDropdown", "departments", []); 
    } catch (error: any) { setActionMessage({ type: "error", text: error.message }); } finally { setIsLoading(false); }
  };

 const executeSubjectPost = async (endpoint: string, payload: any, successMsg: string) => {
    setIsLoading(true); setActionMessage(null);
    try {
      const response = await fetch(`/api-proxy/${endpoint}`, { 
        method: "POST", 
        cache: "no-store", // <--- ADDS CACHE BYPASS
        headers: { "Content-Type": "application/json", "accept": "*/*", "Authorization": `Bearer ${authToken}` }, 
        body: JSON.stringify(payload) 
      });
      if (!response.ok) throw new Error(await response.text());
      setActionMessage({ type: "success", text: successMsg });
      setSubjectAction("menu");
    } catch (error: any) { setActionMessage({ type: "error", text: error.message }); } finally { setIsLoading(false); }
  };

  const handleCreateSubject = (e: React.FormEvent) => { e.preventDefault(); executeSubjectPost("Subject/Create", { ...subjectForm, sectionCount: Number(subjectForm.sectionCount), lectureCount: Number(subjectForm.lectureCount), weeksCount: Number(subjectForm.weeksCount), departmentId: Number(subjectForm.departmentId) }, `Subject created!`); };
  const handleCreateGroup = (e: React.FormEvent) => { e.preventDefault(); executeSubjectPost("Subject/CreateGroup", { ...groupForm, number: Number(groupForm.number), year: Number(groupForm.year), lectureDay: Number(groupForm.lectureDay), lecturePeriod: Number(groupForm.lecturePeriod), sectionDay: Number(groupForm.sectionDay), sectionPeriod: Number(groupForm.sectionPeriod), subjectId: Number(groupForm.subjectId), teacherId: Number(groupForm.teacherId) }, `Group created!`); };
  const handleAssignTeacher = (e: React.FormEvent) => { e.preventDefault(); executeSubjectPost("Subject/AssignTeacherToGroup", { groupId: Number(assignTeacherForm.groupId), teacherId: Number(assignTeacherForm.teacherId) }, "Teacher assigned!"); };
  
  // UPDATED: Translates entered College Codes back to Internal DB IDs
  const handleAssignStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const inputCodes = assignStudentForm.studentsIds.split(',').map(code => code.trim()).filter(code => code !== "");
    
    // Find the Internal Server ID for each College Code provided
    const internalIdsArray = inputCodes.map(code => {
       const foundStudent = dropdowns.students.find(s => s.code === code || s.id.toString() === code);
       return foundStudent ? foundStudent.id : null;
    }).filter(id => id !== null);

    if (internalIdsArray.length === 0) {
      setActionMessage({ type: "error", text: "Could not find matching students. Ensure the College Codes are correct and exist." });
      return;
    }

    executeSubjectPost("Subject/AssignStudentsToGroup", { groupId: Number(assignStudentForm.groupId), studentsId: internalIdsArray }, `Assigned ${internalIdsArray.length} students successfully!`);
  };

  const handleCloseSubject = (e: React.FormEvent) => { e.preventDefault(); executeSubjectPost("Subject/CloseSubject", { subjectId: Number(closeSubjectForm.subjectId), teacherId: Number(closeSubjectForm.teacherId) }, "Subject closed."); };
  const handleCloseGroup = (e: React.FormEvent) => { e.preventDefault(); executeSubjectPost("Subject/CloseGroup", { groupId: Number(closeGroupId) }, "Group closed."); };
  const handleRemoveRestrict = (e: React.FormEvent) => { e.preventDefault(); executeSubjectPost("Subject/RemoveRestrict", { studentId: Number(restrictForm.studentId), subjectId: Number(restrictForm.subjectId) }, "Exam restriction lifted for student."); };

 const handleUpdateGPA = async (e: React.FormEvent) => {
    e.preventDefault(); setIsLoading(true); setActionMessage(null);
    try {
      const response = await fetch("/api-proxy/Student/UpdateGPA", { 
        method: "POST", 
        cache: "no-store", // <--- ADDS CACHE BYPASS
        headers: { "Content-Type": "application/json", "accept": "*/*", "Authorization": `Bearer ${authToken}` }, 
        body: JSON.stringify([{ studentId: parseInt(selectedStudent), gpa: parseFloat(newGpa) }]) 
      });
      if (!response.ok) throw new Error(await response.text());
      setActionMessage({ type: "success", text: "GPA updated!" }); setNewGpa("");
    } catch (error: any) { setActionMessage({ type: "error", text: error.message }); } finally { setIsLoading(false); }
  };
  const switchTab = (tab: AdminTab) => { setActiveTab(tab); setActionMessage(null); setSubjectAction("menu"); };
  const handleLogout = () => { localStorage.clear(); router.push("/login"); };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col md:flex-row transition-colors duration-300">
      
      {/* MOBILE-OPTIMIZED SIDEBAR */}
      <aside className="w-full md:w-80 bg-white dark:bg-gray-900 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 p-6 md:p-8 flex flex-col gap-6 shrink-0 z-10 transition-colors">
        <div className="flex items-center justify-between md:justify-start gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-900 dark:bg-blue-600 text-white rounded-xl flex items-center justify-center text-lg md:text-xl shadow-lg shrink-0"><FontAwesomeIcon icon={faUserShield} /></div>
            <div><h1 className="text-lg md:text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Admin Panel</h1><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Master Control</p></div>
          </div>
          <button onClick={handleLogout} className="md:hidden text-red-500 p-2"><FontAwesomeIcon icon={faSignOutAlt} className="text-xl rtl:rotate-180" /></button>
        </div>

        <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 hide-scrollbar">
          <button onClick={() => switchTab("approvals")} className={`shrink-0 flex items-center gap-3 p-3 md:p-4 rounded-xl md:rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "approvals" ? "bg-blue-50 text-blue-900 dark:bg-blue-900/30" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"}`}><FontAwesomeIcon icon={faUsersCog} className="text-lg w-5" /> Approvals</button>
          <button onClick={() => switchTab("createUser")} className={`shrink-0 flex items-center gap-3 p-3 md:p-4 rounded-xl md:rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "createUser" ? "bg-blue-50 text-blue-900 dark:bg-blue-900/30" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"}`}><FontAwesomeIcon icon={faUserPlus} className="text-lg w-5" /> Add User</button>
          <button onClick={() => switchTab("departments")} className={`shrink-0 flex items-center gap-3 p-3 md:p-4 rounded-xl md:rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "departments" ? "bg-blue-50 text-blue-900 dark:bg-blue-900/30" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"}`}><FontAwesomeIcon icon={faBuilding} className="text-lg w-5" /> Departments</button>
          <button onClick={() => switchTab("subjects")} className={`shrink-0 flex items-center gap-3 p-3 md:p-4 rounded-xl md:rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "subjects" ? "bg-blue-50 text-blue-900 dark:bg-blue-900/30" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"}`}><FontAwesomeIcon icon={faBookOpen} className="text-lg w-5" /> Subjects</button>
          <button onClick={() => switchTab("academic")} className={`shrink-0 flex items-center gap-3 p-3 md:p-4 rounded-xl md:rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "academic" ? "bg-blue-50 text-blue-900 dark:bg-blue-900/30" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"}`}><FontAwesomeIcon icon={faGraduationCap} className="text-lg w-5" /> Academic</button>
          <button onClick={() => switchTab("profile")} className={`shrink-0 flex items-center gap-3 p-3 md:p-4 rounded-xl md:rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "profile" ? "bg-blue-50 text-blue-900 dark:bg-blue-900/30" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"}`}><FontAwesomeIcon icon={faUserEdit} className="text-lg w-5" /> Profile</button>
        </nav>
        <button onClick={handleLogout} className="hidden md:flex items-center gap-4 p-4 rounded-2xl text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all mt-auto"><FontAwesomeIcon icon={faSignOutAlt} className="text-lg rtl:rotate-180 w-5" /> Log Out</button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500">
          
          {actionMessage && (
            <div className={`p-4 rounded-2xl flex items-start gap-3 border ${actionMessage.type === "error" ? "bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20" : actionMessage.type === "warning" ? "bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-900/20" : "bg-green-50 border-green-200 text-green-600 dark:bg-green-900/20"}`}>
              <FontAwesomeIcon icon={actionMessage.type === "error" ? faExclamationTriangle : faCheckCircle} className="mt-1 shrink-0" />
              <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed break-all">{actionMessage.text}</p>
            </div>
          )}

          {activeTab === "approvals" && (
            <div className="space-y-6">
              <div><h2 className="text-2xl md:text-3xl font-black uppercase italic text-gray-900 dark:text-white">Account Approvals</h2><p className="text-xs md:text-sm font-bold text-gray-500">Review and approve new registrations.</p></div>
              {isPendingLoading ? <div className="p-12 text-center text-gray-400"><FontAwesomeIcon icon={faSpinner} className="animate-spin text-3xl" /></div> : 
               pendingUsers.length === 0 ? <div className="bg-white dark:bg-gray-900 p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] border border-gray-100 dark:border-gray-800 text-center"><p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No pending approvals.</p></div> : 
               <div className="grid gap-4">
                  {pendingUsers.map((user, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-900 p-5 md:p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6">
                      <div className="flex items-center gap-4 w-full sm:w-auto"><div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-50 text-blue-900 flex items-center justify-center text-lg md:text-xl font-black">{(user.fullName || user.name || "U").charAt(0)}</div><div><p className="font-black uppercase text-xs md:text-sm text-gray-900 dark:text-white">{user.fullName || user.name} <span className="text-gray-400 font-normal">(@{user.username})</span></p><p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{user.role || "User"}</p></div></div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button onClick={() => alert("No Reject API provided by backend yet.")} className="flex-1 sm:flex-none px-4 md:px-6 py-3 bg-red-50 text-red-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-100 transition-colors">Reject</button>
                        <button onClick={() => handleApprove(user.username)} className="flex-1 sm:flex-none px-4 md:px-6 py-3 bg-green-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md hover:bg-green-600 transition-colors"><FontAwesomeIcon icon={faCheckCircle} className="mr-2" /> Approve</button>
                      </div>
                    </div>
                  ))}
                </div>}
            </div>
          )}

          {activeTab === "createUser" && ( 
            <div className="bg-white dark:bg-gray-900 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-xl space-y-6 md:space-y-8">
              <div><h2 className="text-xl md:text-2xl font-black uppercase italic text-gray-900 dark:text-white">Direct User Creation</h2><p className="text-[10px] md:text-xs font-bold text-gray-500 mt-1 md:mt-2">Bypass registration and create an approved account instantly.</p></div>
              <form onSubmit={handleCreateUser} className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  {["fullName", "username", "email"].map(field => (<div key={field} className="space-y-1 md:space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{field}</label><input required name={field} value={(formData as any)[field]} onChange={e => setFormData({...formData, [e.target.name]: e.target.value})} type={field==="email"?"email":"text"} className="w-full p-3 md:p-4 bg-gray-50 dark:bg-gray-800 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold outline-none border border-transparent focus:border-blue-900 dark:text-white" /></div>))}
                  <div className="space-y-1 md:space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Phone</label><input required name="phoneNumber" value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} type="tel" pattern="^01([0-9]{9})" className="w-full p-3 md:p-4 bg-gray-50 dark:bg-gray-800 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold outline-none border border-transparent focus:border-blue-900 dark:text-white" /></div>
                  <div className="space-y-1 md:space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Role</label><select name="role" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full p-3 md:p-4 bg-gray-50 dark:bg-gray-800 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold outline-none border border-transparent focus:border-blue-900 dark:text-white"><option value="Student">Student</option><option value="Teacher">Teacher</option></select></div>
                  <div className="space-y-1 md:space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Department</label><select required name="departmentId" value={formData.departmentId} onChange={e => setFormData({...formData, departmentId: e.target.value})} className="w-full p-3 md:p-4 bg-gray-50 dark:bg-gray-800 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold outline-none border border-transparent focus:border-blue-900 dark:text-white"><option value="" disabled>Select Dept</option>{dropdowns.departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
                  <div className="space-y-1 md:space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{formData.role === "Student" ? "Student ID" : "Teacher Code"}</label><input required name="code" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} type="text" className="w-full p-3 md:p-4 bg-gray-50 dark:bg-gray-800 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold outline-none border border-transparent focus:border-blue-900 dark:text-white" /></div>
                  <div className="space-y-1 md:space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Password</label><input required name="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} type="password" className="w-full p-3 md:p-4 bg-gray-50 dark:bg-gray-800 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold outline-none border border-transparent focus:border-blue-900 dark:text-white" /></div>
                </div>
                <button type="submit" disabled={isLoading} className="w-full py-4 md:py-5 bg-blue-900 text-white rounded-2xl md:rounded-[2rem] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95">{isLoading ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : "Create User"}</button>
              </form>
            </div>
          )}

          {activeTab === "departments" && ( 
            <div className="space-y-6 md:space-y-8">
              <div className="bg-white dark:bg-gray-900 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-xl space-y-6 md:space-y-8">
                <div><h2 className="text-xl md:text-2xl font-black uppercase italic text-gray-900 dark:text-white">Create Department</h2><p className="text-[10px] md:text-xs font-bold text-gray-500 mt-1 md:mt-2">Add a new department.</p></div>
                <form onSubmit={handleCreateDepartment} className="flex flex-col sm:flex-row gap-3 md:gap-4">
                  <input required value={deptForm.name} onChange={e => setDeptForm({name: e.target.value})} placeholder="Department Name" className="flex-1 p-3 md:p-4 bg-gray-50 dark:bg-gray-800 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold outline-none border border-transparent focus:border-blue-900 dark:text-white" />
                  <button type="submit" disabled={isLoading} className="px-6 md:px-8 py-3 md:py-4 bg-blue-900 text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95">{isLoading ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : "Save"}</button>
                </form>
              </div>
              <div className="bg-white dark:bg-gray-900 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-400 mb-4 md:mb-6 ms-2">Existing Departments</h3>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {dropdowns.departments.length === 0 ? <p className="text-xs text-gray-400">No departments found.</p> : dropdowns.departments.map(d => <span key={d.id} className="px-3 md:px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold">{d.name} (ID: {d.id})</span>)}
                </div>
              </div>
            </div>
          )}

          {activeTab === "subjects" && (
            <div className="bg-white dark:bg-gray-900 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-xl space-y-6 md:space-y-8">
              
              <div className="flex items-center gap-3 md:gap-4">
                {subjectAction !== "menu" && <button onClick={() => setSubjectAction("menu")} className="w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"><FontAwesomeIcon icon={faArrowLeft} className="text-sm md:text-base" /></button>}
                <div>
                  <h2 className="text-xl md:text-2xl font-black uppercase italic text-gray-900 dark:text-white">
                    {subjectAction === "menu" ? "Subjects & Groups" : 
                     subjectAction === "createSubject" ? "New Subject" : subjectAction === "createGroup" ? "New Group" : 
                     subjectAction === "assignTeacher" ? "Assign Teacher" : subjectAction === "assignStudent" ? "Assign Students" :
                     subjectAction === "closeSubject" ? "Close Subject" : subjectAction === "closeGroup" ? "Close Group" : "Remove Exam Restriction"}
                  </h2>
                  <p className="text-[10px] md:text-xs font-bold text-gray-500 mt-1">Manage courses, groups, and academic administration.</p>
                </div>
              </div>

              {subjectAction === "menu" && (
                <div className="space-y-6 animate-in fade-in zoom-in-95">
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 ms-2">Creation</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                      <button onClick={() => setSubjectAction("createSubject")} className="p-5 md:p-6 bg-blue-50 text-blue-900 rounded-2xl md:rounded-3xl font-black uppercase tracking-widest text-[10px] md:text-xs text-left hover:scale-[1.02] shadow-sm">+ Subject</button>
                      <button onClick={() => setSubjectAction("createGroup")} className="p-5 md:p-6 bg-blue-50 text-blue-900 rounded-2xl md:rounded-3xl font-black uppercase tracking-widest text-[10px] md:text-xs text-left hover:scale-[1.02] shadow-sm">+ Group</button>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 ms-2">Assignments</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                      <button onClick={() => setSubjectAction("assignTeacher")} className="p-5 md:p-6 bg-gray-50 text-gray-600 rounded-2xl md:rounded-3xl font-black uppercase tracking-widest text-[10px] md:text-xs text-left hover:scale-[1.02]">Assign Teacher to Group</button>
                      <button onClick={() => setSubjectAction("assignStudent")} className="p-5 md:p-6 bg-gray-50 text-gray-600 rounded-2xl md:rounded-3xl font-black uppercase tracking-widest text-[10px] md:text-xs text-left hover:scale-[1.02]">Assign Students to Group</button>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 ms-2">Management & Overrides</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                      <button onClick={() => setSubjectAction("closeSubject")} className="p-5 bg-red-50 text-red-700 rounded-2xl font-black uppercase tracking-widest text-[10px] text-left hover:scale-[1.02] border border-red-100"><FontAwesomeIcon icon={faLock} className="mr-2" /> Close Subject</button>
                      <button onClick={() => setSubjectAction("closeGroup")} className="p-5 bg-red-50 text-red-700 rounded-2xl font-black uppercase tracking-widest text-[10px] text-left hover:scale-[1.02] border border-red-100"><FontAwesomeIcon icon={faLock} className="mr-2" /> Close Group</button>
                      <button onClick={() => setSubjectAction("removeRestrict")} className="p-5 bg-yellow-50 text-yellow-700 rounded-2xl font-black uppercase tracking-widest text-[10px] text-left hover:scale-[1.02] border border-yellow-200"><FontAwesomeIcon icon={faBan} className="mr-2" /> Remove Restriction</button>
                    </div>
                  </div>
                </div>
              )}

              {subjectAction === "createSubject" && (
                <form onSubmit={handleCreateSubject} className="space-y-4 md:space-y-6 animate-in slide-in-from-right-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-gray-400">Code</label><input required value={subjectForm.code} onChange={e => setSubjectForm({...subjectForm, code: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl text-xs font-bold" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-gray-400">Name</label><input required value={subjectForm.name} onChange={e => setSubjectForm({...subjectForm, name: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl text-xs font-bold" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-gray-400">Dept</label><select required value={subjectForm.departmentId} onChange={e => setSubjectForm({...subjectForm, departmentId: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl text-xs font-bold"><option value="" disabled>Select</option>{dropdowns.departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-gray-400">Weeks</label><input required type="number" min="1" value={subjectForm.weeksCount} onChange={e => setSubjectForm({...subjectForm, weeksCount: Number(e.target.value)})} className="w-full p-3 bg-gray-50 rounded-xl text-xs font-bold" /></div>
                  </div>
                  <button type="submit" disabled={isLoading} className="w-full py-4 bg-blue-900 text-white rounded-2xl font-black uppercase shadow-xl">Save</button>
                </form>
              )}

              {subjectAction === "createGroup" && (
                 <form onSubmit={handleCreateGroup} className="space-y-4 md:space-y-6 animate-in slide-in-from-right-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-gray-400">Number</label><input required type="number" min="1" value={groupForm.number} onChange={e => setGroupForm({...groupForm, number: Number(e.target.value)})} className="w-full p-3 bg-gray-50 rounded-xl text-xs font-bold" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-gray-400">Subject</label><select required value={groupForm.subjectId} onChange={e => setGroupForm({...groupForm, subjectId: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl text-xs font-bold"><option value="" disabled>Select Subject</option>{dropdowns.subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-gray-400">Teacher</label><select required value={groupForm.teacherId} onChange={e => setGroupForm({...groupForm, teacherId: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl text-xs font-bold"><option value="" disabled>Select Teacher</option>{dropdowns.teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
                  </div>
                  <button type="submit" disabled={isLoading} className="w-full py-4 bg-blue-900 text-white rounded-2xl font-black uppercase shadow-xl">Save Group</button>
                 </form>
              )}

              {subjectAction === "assignTeacher" && (
                <form onSubmit={handleAssignTeacher} className="space-y-4 md:space-y-6 animate-in slide-in-from-right-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                    <div className="space-y-1 md:space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-gray-400">1. Subject</label><select required value={assignSubjectId} onChange={e => { setAssignSubjectId(e.target.value); setAssignTeacherForm({...assignTeacherForm, groupId: ""}); }} className="w-full p-3 md:p-4 bg-gray-50 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold"><option value="" disabled>Select...</option>{dropdowns.subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                    <div className="space-y-1 md:space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-gray-400">2. Group</label><select required disabled={!assignSubjectId || isGroupsLoading} value={assignTeacherForm.groupId} onChange={e => setAssignTeacherForm({...assignTeacherForm, groupId: e.target.value})} className="w-full p-3 md:p-4 bg-gray-50 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold disabled:opacity-50"><option value="" disabled>{isGroupsLoading ? "Loading..." : "Select..."}</option>{groupsDropdown.map(g => <option key={g.id} value={g.id}>Group {g.number} (ID: {g.id})</option>)}</select></div>
                    <div className="space-y-1 md:space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-gray-400">3. Teacher</label><select required value={assignTeacherForm.teacherId} onChange={e => setAssignTeacherForm({...assignTeacherForm, teacherId: e.target.value})} className="w-full p-3 md:p-4 bg-gray-50 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold"><option value="" disabled>Select...</option>{dropdowns.teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
                  </div>
                  <button type="submit" disabled={isLoading} className="w-full py-4 md:py-5 bg-blue-900 text-white rounded-2xl md:rounded-[2rem] font-black uppercase tracking-widest shadow-xl hover:scale-105">{isLoading ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : "Assign Teacher"}</button>
                </form>
              )}

              {/* UPDATED: Assign Students Form now asks for College Codes */}
              {subjectAction === "assignStudent" && (
                <form onSubmit={handleAssignStudent} className="space-y-4 md:space-y-6 animate-in slide-in-from-right-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                    <div className="space-y-1 md:space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-gray-400">1. Subject</label><select required value={assignSubjectId} onChange={e => { setAssignSubjectId(e.target.value); setAssignStudentForm({...assignStudentForm, groupId: ""}); }} className="w-full p-3 md:p-4 bg-gray-50 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold"><option value="" disabled>Select...</option>{dropdowns.subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                    <div className="space-y-1 md:space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-gray-400">2. Group</label><select required disabled={!assignSubjectId || isGroupsLoading} value={assignStudentForm.groupId} onChange={e => setAssignStudentForm({...assignStudentForm, groupId: e.target.value})} className="w-full p-3 md:p-4 bg-gray-50 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold disabled:opacity-50"><option value="" disabled>{isGroupsLoading ? "Loading..." : "Select..."}</option>{groupsDropdown.map(g => <option key={g.id} value={g.id}>Group {g.number} (ID: {g.id})</option>)}</select></div>
                    <div className="space-y-1 md:space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-gray-400">3. College Codes (Comma Separated)</label><input required type="text" value={assignStudentForm.studentsIds} onChange={e => setAssignStudentForm({...assignStudentForm, studentsIds: e.target.value})} placeholder="e.g. 32021147, 32021124" className="w-full p-3 md:p-4 bg-gray-50 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold" /></div>
                  </div>
                  <button type="submit" disabled={isLoading} className="w-full py-4 md:py-5 bg-blue-900 text-white rounded-2xl md:rounded-[2rem] font-black uppercase tracking-widest shadow-xl hover:scale-105">{isLoading ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : "Assign Students"}</button>
                </form>
              )}

              {subjectAction === "closeSubject" && (
                <form onSubmit={handleCloseSubject} className="space-y-4 md:space-y-6 animate-in slide-in-from-right-4 border-2 border-red-100 rounded-3xl p-6">
                  <p className="text-xs text-red-600 font-bold mb-4"><FontAwesomeIcon icon={faExclamationTriangle} className="mr-2"/> Warning: This action closes the subject for the assigned teacher.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-1 md:space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Subject</label><select required value={closeSubjectForm.subjectId} onChange={e => setCloseSubjectForm({...closeSubjectForm, subjectId: e.target.value})} className="w-full p-3 md:p-4 bg-gray-50 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold"><option value="" disabled>Select...</option>{dropdowns.subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                    <div className="space-y-1 md:space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Teacher</label><select required value={closeSubjectForm.teacherId} onChange={e => setCloseSubjectForm({...closeSubjectForm, teacherId: e.target.value})} className="w-full p-3 md:p-4 bg-gray-50 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold"><option value="" disabled>Select...</option>{dropdowns.teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
                  </div>
                  <button type="submit" disabled={isLoading} className="w-full py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-105">Execute Close</button>
                </form>
              )}

              {subjectAction === "closeGroup" && (
                <form onSubmit={handleCloseGroup} className="space-y-4 md:space-y-6 animate-in slide-in-from-right-4 border-2 border-red-100 rounded-3xl p-6">
                   <p className="text-xs text-red-600 font-bold mb-4"><FontAwesomeIcon icon={faExclamationTriangle} className="mr-2"/> Warning: This action closes the specific group.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-1 md:space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-gray-400">1. Filter by Subject</label><select required value={assignSubjectId} onChange={e => { setAssignSubjectId(e.target.value); setCloseGroupId(""); }} className="w-full p-3 md:p-4 bg-gray-50 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold"><option value="" disabled>Select...</option>{dropdowns.subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                    <div className="space-y-1 md:space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-gray-400">2. Select Group to Close</label><select required disabled={!assignSubjectId || isGroupsLoading} value={closeGroupId} onChange={e => setCloseGroupId(e.target.value)} className="w-full p-3 md:p-4 bg-gray-50 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold disabled:opacity-50"><option value="" disabled>{isGroupsLoading ? "Loading..." : "Select..."}</option>{groupsDropdown.map(g => <option key={g.id} value={g.id}>Group {g.number} (ID: {g.id})</option>)}</select></div>
                  </div>
                  <button type="submit" disabled={isLoading} className="w-full py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-105">Execute Close</button>
                </form>
              )}

              {/* UPDATED: Remove Restrict Form now displays the College Code */}
              {subjectAction === "removeRestrict" && (
                <form onSubmit={handleRemoveRestrict} className="space-y-4 md:space-y-6 animate-in slide-in-from-right-4 bg-yellow-50/50 border-2 border-yellow-200 rounded-3xl p-6">
                  <div className="flex items-start gap-4 mb-4">
                     <FontAwesomeIcon icon={faBan} className="text-yellow-600 text-2xl mt-1" />
                     <div>
                       <h3 className="text-yellow-800 font-black uppercase text-sm">HTI Exam Restriction Protocol</h3>
                       <p className="text-xs text-yellow-700 font-bold mt-1">If a student misses 4 lectures in a term, they are restricted from the final exam. Use this tool to manually lift that ban.</p>
                     </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-1 md:space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-yellow-700">Restricted Student</label><select required value={restrictForm.studentId} onChange={e => setRestrictForm({...restrictForm, studentId: e.target.value})} className="w-full p-3 md:p-4 bg-white rounded-xl md:rounded-2xl text-xs md:text-sm font-bold border border-yellow-200"><option value="" disabled>Select Student...</option>{dropdowns.students.map(s => <option key={s.id} value={s.id}>{s.name} (Code: {s.code || "N/A"})</option>)}</select></div>
                    <div className="space-y-1 md:space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-yellow-700">Subject</label><select required value={restrictForm.subjectId} onChange={e => setRestrictForm({...restrictForm, subjectId: e.target.value})} className="w-full p-3 md:p-4 bg-white rounded-xl md:rounded-2xl text-xs md:text-sm font-bold border border-yellow-200"><option value="" disabled>Select Subject...</option>{dropdowns.subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                  </div>
                  <button type="submit" disabled={isLoading} className="w-full py-4 bg-yellow-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-105">Lift Exam Restriction</button>
                </form>
              )}
            </div>
          )}

          {/* UPDATED: Academic Update Form now displays the College Code */}
          {activeTab === "academic" && ( 
            <div className="bg-white dark:bg-gray-900 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-xl space-y-6 md:space-y-8">
              <div><h2 className="text-xl md:text-2xl font-black uppercase italic text-gray-900 dark:text-white">Update GPA</h2></div>
              <form onSubmit={handleUpdateGPA} className="space-y-4 md:space-y-6">
                <div className="space-y-1 md:space-y-2"><label className="text-[10px] font-black uppercase text-gray-400">Student</label><select required value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} className="w-full p-3 md:p-4 bg-gray-50 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold"><option value="" disabled>Select...</option>{dropdowns.students.map((s) => (<option key={s.id} value={s.id}>{s.name} (Code: {s.code || "N/A"})</option>))}</select></div>
                <div className="space-y-1 md:space-y-2"><label className="text-[10px] font-black uppercase text-gray-400">GPA (0-4)</label><input required type="number" step="0.01" min="0" max="4" value={newGpa} onChange={(e) => setNewGpa(e.target.value)} className="w-full p-3 md:p-4 bg-gray-50 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold" /></div>
                <button type="submit" disabled={isLoading || !selectedStudent} className="w-full py-4 md:py-5 bg-blue-900 text-white rounded-2xl md:rounded-[2rem] font-black uppercase shadow-xl disabled:opacity-50">Update Record</button>
              </form>
            </div>
          )}

          {activeTab === "profile" && ( 
            <div className="bg-white dark:bg-gray-900 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-xl space-y-6 md:space-y-8">
               <div><h2 className="text-xl md:text-2xl font-black uppercase italic text-gray-900 dark:text-white">My Profile</h2></div>
               <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 p-6 md:p-8 bg-blue-50 dark:bg-blue-900/20 rounded-2xl md:rounded-3xl border border-blue-100 text-center sm:text-left">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-900 text-white rounded-2xl flex items-center justify-center text-2xl md:text-3xl shadow-lg shrink-0"><FontAwesomeIcon icon={faIdCard} /></div>
                  <div>
                    <h3 className="text-lg md:text-xl font-black uppercase text-gray-900 dark:text-white mb-1">Super Administrator</h3>
                    <p className="text-xs md:text-sm font-bold text-gray-500 mb-3">{profileData.email}</p>
                    <span className="px-3 py-1 bg-blue-200 text-blue-900 text-[10px] font-black uppercase tracking-widest rounded-full">Role: {profileData.role}</span>
                  </div>
               </div>
               <p className="text-[10px] md:text-xs text-gray-400 italic text-center mt-4">Note: Profile modification API is currently unhandled by the backend.</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}