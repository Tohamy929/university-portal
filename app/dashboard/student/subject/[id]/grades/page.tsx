"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle, faCheckCircle, faLock, faInfoCircle, faArrowLeft, faSpinner } from "@fortawesome/free-solid-svg-icons";

export default function StudentGrades() {
  const { id } = useParams();
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [grades, setGrades] = useState<any>(null);
  const [subjectDetails, setSubjectDetails] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) { router.push("/login"); return; }
    
    Promise.all([
      fetch(`http://smartattend456-001-site1.qtempurl.com/api/Subject/GetStudentGradesForStudentById/${id}`, { headers: { "Authorization": `Bearer ${token}` } }).then(r => r.ok ? r.json() : null),
      fetch(`http://smartattend456-001-site1.qtempurl.com/api/Subject/GetDetailsForStudentById/${id}`, { headers: { "Authorization": `Bearer ${token}` } }).then(r => r.ok ? r.json() : null)
    ])
    .then(([gradesData, detailsData]) => {
      setGrades(gradesData);
      setSubjectDetails(detailsData);
    })
    .catch(() => setErrorMsg("Check your connection or server status"))
    .finally(() => setIsLoading(false));
  }, [id, router]);

  if (isLoading) return <div className="min-h-[60vh] flex flex-col items-center justify-center text-blue-900 font-black animate-pulse"><FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl mb-2" /> Loading Grades...</div>;
  if (errorMsg) return <div className="min-h-[60vh] flex flex-col items-center justify-center text-red-500 font-black"><FontAwesomeIcon icon={faExclamationTriangle} className="text-4xl mb-2" /> {errorMsg}</div>;
  if (!grades) return <div className="min-h-[60vh] flex flex-col items-center justify-center text-gray-400 font-black uppercase"><p>No data to display</p><button onClick={() => router.push(`/dashboard/student/subject/${id}`)} className="mt-4 text-blue-900 text-xs">Return to Dashboard</button></div>;

  const totalAbsences = subjectDetails?.totalAbsences || 0;
  const isProhibited = totalAbsences >= 4;

  const assessments = [
    { name: "Attendance Grade", score: isProhibited ? 0 : (grades.lecAttendanceScore + grades.secAttendanceScore), max: "-", status: "Auto-calculated" },
    { name: "Quizzes", score: grades.quizAssessmentScore, max: "-", status: "Graded" },
    { name: "Assignments", score: grades.assignmentScore, max: "-", status: "Graded" },
    { name: "Midterm Exam", score: grades.midAssessmentScore, max: "-", status: "Graded" },
    { name: "Final Exam", score: grades.finalAssessmentScore, max: "-", status: isProhibited ? "Prohibited" : "Graded" },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
      
      <button onClick={() => router.push(`/dashboard/student/subject/${id}`)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-900 mb-2 transition-colors">
        <FontAwesomeIcon icon={faArrowLeft} /> Back to Hub
      </button>
      <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight italic">Academic Grades</h1>

      {isProhibited && (
        <div className="bg-red-600 text-white p-6 rounded-[2rem] shadow-xl flex items-center gap-6 border-4 border-red-500 animate-pulse">
          <div className="text-4xl"><FontAwesomeIcon icon={faExclamationTriangle} /></div>
          <div>
            <h2 className="text-xl font-black uppercase italic">Academic Restriction</h2>
            <p className="text-sm font-medium opacity-90">You have exceeded the absence limit ({totalAbsences} sessions). You are barred from the final exam and attendance marks are forfeited.</p>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {assessments.map((item, idx) => (
          <div key={idx} className={`bg-white p-8 rounded-3xl border flex items-center justify-between shadow-sm ${item.status === 'Prohibited' ? 'border-red-200 grayscale' : 'border-gray-50'}`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${item.status === 'Prohibited' ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-900'}`}>
                <FontAwesomeIcon icon={item.status === 'Prohibited' ? faLock : faCheckCircle} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.status}</p>
              </div>
            </div>
            <div className="text-right">
              {item.status !== 'Prohibited' ? (
                <p className="text-3xl font-black text-blue-900">{item.score || 0}<span className="text-sm text-gray-300"> Pts</span></p>
              ) : (
                <span className="px-4 py-2 rounded-xl text-xs font-black uppercase bg-red-100 text-red-700">{item.status}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex gap-4">
        <FontAwesomeIcon icon={faInfoCircle} className="text-blue-900 mt-1" />
        <p className="text-xs text-blue-900 leading-relaxed italic">
          Final grades are subject to review by the department head. Total Score: {grades.totalScore}
        </p>
      </div>
    </div>
  );
}