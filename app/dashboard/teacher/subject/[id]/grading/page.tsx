"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faSave, faUserGraduate, faCheckCircle, 
  faExclamationTriangle, faSearch, faSpinner, faArrowLeft
} from "@fortawesome/free-solid-svg-icons";

export default function GradingPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) { router.push("/login"); return; }
    setAuthToken(token);
    fetchGrades(token);
  }, [id, router]);

  const fetchGrades = async (token: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api-proxy/Subject/GetStudentGradesForTeacherById/${id}`, {
        headers: { "accept": "*/*", "Authorization": `Bearer ${token}` }
      });
      const text = await response.text();
      if (!response.ok) throw new Error(text);

      if (text && text.length > 2) {
        setStudents(JSON.parse(text));
      } else {
        setStudents([]);
      }
    } catch (err) {
      setErrorMsg("Failed to load grades. Check your connection or server status.");
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Dynamically update the specific score and auto-calculate the total
  const handleGradeChange = (studentGradeId: number, field: string, value: string) => {
    // Basic validation to prevent NaN and negative numbers
    const numValue = Math.max(parseFloat(value) || 0, 0); 
    
    setStudents(prev => prev.map(s => {
      if (s.studentGradeId === studentGradeId) {
        const updated = { ...s, [field]: numValue };
        
        // Auto-calculate the total score based on the backend API schema
        updated.totalScore = 
          (updated.lecAttendanceScore || 0) + 
          (updated.secAttendanceScore || 0) + 
          (updated.quizAssessmentScore || 0) + 
          (updated.assignmentScore || 0) + 
          (updated.midAssessmentScore || 0) + 
          (updated.finalAssessmentScore || 0);
          
        return updated;
      }
      return s;
    }));
  };

  const saveGrades = async () => {
    setIsSaving(true);
    setShowSuccess(false);
    setErrorMsg(null);

    try {
      // Map the current state to the exact payload structure the backend requires
      const payload = students.map(s => ({
        studentGradeId: s.studentGradeId,
        finalAssessmentScore: s.finalAssessmentScore || 0,
        midAssessmentScore: s.midAssessmentScore || 0,
        quizAssessmentScore: s.quizAssessmentScore || 0,
        assignmentScore: s.assignmentScore || 0,
        lecAttendanceScore: s.lecAttendanceScore || 0,
        secAttendanceScore: s.secAttendanceScore || 0,
        totalScore: s.totalScore || 0
      }));

      const response = await fetch(`/api-proxy/Subject/PostStudentGrades`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "accept": "*/*", "Authorization": `Bearer ${authToken}` },
        body: JSON.stringify(payload)
      });

      const text = await response.text();
      if (!response.ok) throw new Error(text);

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      // Strict re-fetch to ensure what is on screen perfectly matches the database
      await fetchGrades(authToken!);
      
    } catch (err: any) {
      setErrorMsg(`Save failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.studentCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col gap-4 items-center justify-center text-blue-900 uppercase font-black tracking-widest animate-pulse bg-gray-50">
        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl" />
        <p className="text-xs">Loading Gradebook...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 max-w-7xl mx-auto px-4">
      
      <button onClick={() => router.push(`/dashboard/teacher/subject/${id}`)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-900 mt-6 transition-colors">
        <FontAwesomeIcon icon={faArrowLeft} /> Back to Subject Hub
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase italic flex items-center gap-3">
            <FontAwesomeIcon icon={faUserGraduate} className="text-blue-900" />
            Grading Center
          </h1>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">
            Subject ID: <span className="text-blue-900">{id}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
            <input 
              type="text" 
              placeholder="Search Student..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-900 w-full md:w-64"
            />
          </div>
          <button 
            onClick={saveGrades}
            disabled={isSaving || students.length === 0}
            className="bg-blue-900 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-blue-800 disabled:opacity-50 transition-all shadow-md"
          >
            {isSaving ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
            {isSaving ? "Saving..." : "Save All"}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-600 border border-red-200 p-4 rounded-2xl flex items-center gap-3 font-black text-[10px] uppercase tracking-widest">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          {errorMsg}
        </div>
      )}

      {showSuccess && (
        <div className="bg-green-500 text-white p-4 rounded-2xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest animate-bounce shadow-lg">
          <FontAwesomeIcon icon={faCheckCircle} />
          Data Synchronized with Academic Records
        </div>
      )}

      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
        {students.length === 0 ? (
          <div className="text-center p-16">
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No data to display</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="p-6 text-[9px] font-black text-gray-400 uppercase tracking-widest">Student</th>
                  <th className="p-4 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center" title="Lecture Attendance">Lec</th>
                  <th className="p-4 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center" title="Section Attendance">Sec</th>
                  <th className="p-4 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center" title="Quizzes">Quiz</th>
                  <th className="p-4 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center" title="Assignments">Assign</th>
                  <th className="p-4 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center" title="Midterm">Mid</th>
                  <th className="p-4 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center" title="Final Exam">Final</th>
                  <th className="p-6 text-[9px] font-black text-blue-900 uppercase tracking-widest text-center">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {filteredStudents.map((student) => (
                  <tr key={student.studentGradeId} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-6">
                      <p className="font-black text-gray-900">{student.studentName}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Code: {student.studentCode} • Group {student.groupNumber}</p>
                    </td>
                    
                    {/* Input Mapping based exactly on the API Payload Schema */}
                    {[
                      { key: "lecAttendanceScore", val: student.lecAttendanceScore },
                      { key: "secAttendanceScore", val: student.secAttendanceScore },
                      { key: "quizAssessmentScore", val: student.quizAssessmentScore },
                      { key: "assignmentScore", val: student.assignmentScore },
                      { key: "midAssessmentScore", val: student.midAssessmentScore },
                      { key: "finalAssessmentScore", val: student.finalAssessmentScore }
                    ].map((field) => (
                      <td key={field.key} className="p-2 text-center">
                        <input 
                          type="number" 
                          min="0"
                          value={field.val || 0}
                          onChange={(e) => handleGradeChange(student.studentGradeId, field.key, e.target.value)}
                          className="w-16 p-2 bg-gray-50 border border-transparent rounded-lg text-center font-bold text-xs focus:border-blue-900 outline-none transition-colors"
                        />
                      </td>
                    ))}
                    
                    <td className="p-6 text-center font-black text-blue-900 text-lg">
                      {student.totalScore || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}