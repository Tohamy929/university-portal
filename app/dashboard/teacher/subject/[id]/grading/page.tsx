"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faSave, faUserGraduate, faCheckCircle, 
  faExclamationTriangle, faFileExport, faSearch 
} from "@fortawesome/free-solid-svg-icons";

// IMPORT CENTRAL DATA
import { MOCK_USERS, User } from "@/lib/mockUsers"; 

export default function GradingPage() {
  const params = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // 1. Get Teacher Department from Storage
    const teacherDept = localStorage.getItem("userDept") || "Electrical";

    // 2. Filter MOCK_USERS to find only STUDENTS in this department
    const departmentStudents = MOCK_USERS.filter(
      (user: User) => user.role === "student" && user.department === teacherDept
    );

    // 3. Initialize the grading list
    const initialList = departmentStudents.map((s: User) => ({
      id: s.id.toUpperCase(),
      name: s.name,
      dept: s.department,
      lecture_att: 0,
      section_att: 0,
      quizzes: 0,
      assignments: 0,
      midterm: 0,
      total: 0
    }));

    setStudents(initialList);
  }, []);

  const handleGradeChange = (id: string, field: string, value: string) => {
    const numValue = Math.min(Math.max(parseFloat(value) || 0, 0), 100);
    setStudents(prev => prev.map(s => {
      if (s.id === id) {
        const updated = { ...s, [field]: numValue };
        // Auto-total
        updated.total = updated.lecture_att + updated.section_att + updated.quizzes + updated.assignments + updated.midterm;
        return updated;
      }
      return s;
    }));
  };

  const saveGrades = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase italic flex items-center gap-3">
            <FontAwesomeIcon icon={faUserGraduate} className="text-blue-900" />
            Grading Center
          </h1>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">
            Subject: <span className="text-blue-900">{params.id}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
            <input 
              type="text" 
              placeholder="Search Student..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-900 w-64"
            />
          </div>
          <button 
            onClick={saveGrades}
            disabled={isSaving}
            className="bg-blue-900 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-blue-800 disabled:opacity-50 transition-all"
          >
            <FontAwesomeIcon icon={isSaving ? faExclamationTriangle : faSave} spin={isSaving} />
            {isSaving ? "Saving..." : "Save All"}
          </button>
        </div>
      </div>

      {showSuccess && (
        <div className="bg-green-500 text-white p-4 rounded-2xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest animate-bounce">
          <FontAwesomeIcon icon={faCheckCircle} />
          Data Synchronized with Academic Records
        </div>
      )}

      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="p-6 text-[9px] font-black text-gray-400 uppercase tracking-widest">Student</th>
                <th className="p-4 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Lec</th>
                <th className="p-4 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Sec</th>
                <th className="p-4 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Quiz</th>
                <th className="p-4 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Assign</th>
                <th className="p-4 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Mid</th>
                <th className="p-6 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="p-6">
                    <p className="font-black text-gray-900">{student.name}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">{student.id}</p>
                  </td>
                  {["lecture_att", "section_att", "quizzes", "assignments", "midterm"].map((field) => (
                    <td key={field} className="p-2 text-center">
                      <input 
                        type="number" 
                        value={student[field]}
                        onChange={(e) => handleGradeChange(student.id, field, e.target.value)}
                        className="w-14 p-2 bg-gray-50 border border-transparent rounded-lg text-center font-bold text-xs focus:border-blue-900 outline-none"
                      />
                    </td>
                  ))}
                  <td className="p-6 text-center font-black text-blue-900">
                    {student.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}