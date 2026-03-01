"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faEdit, faSave, faUsers, faCheckCircle, 
  faUndo, faUserGraduate, faIdBadge 
} from "@fortawesome/free-solid-svg-icons";

export default function TeacherGrading() {
  const { id } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [category, setCategory] = useState<"lecture_att" | "section_att" | "quizzes" | "assignments" | "midterm">("assignments");

  // Mock data setup
  const [students, setStudents] = useState([
    { id: "20210101", name: "Ahmed Ali", lecture_att: 10, section_att: 10, quizzes: 15, assignments: null, midterm: 14 },
    { id: "20210502", name: "Mona Zaki", lecture_att: 6, section_att: 8, quizzes: 10, assignments: null, midterm: 8 },
  ]);

  const maxGrades: any = { 
    lecture_att: 10, 
    section_att: 10, 
    quizzes: 20, 
    assignments: 20, 
    midterm: 20 
  };

  // 1. Initial Group Selection View
  if (!selectedGroup) {
    return (
      <div className="max-w-md mx-auto mt-20 p-10 bg-white rounded-[3rem] border border-gray-100 shadow-xl text-center space-y-6 animate-in zoom-in-95">
        <div className="w-20 h-20 bg-blue-50 text-blue-900 rounded-3xl flex items-center justify-center mx-auto text-3xl">
          <FontAwesomeIcon icon={faUsers} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900">Select Academic Group</h2>
          <p className="text-gray-400 font-medium italic">Viewing data for {id}</p>
        </div>
        <div className="space-y-3">
          <button 
            onClick={() => setSelectedGroup("Group 1")}
            className="w-full p-5 bg-gray-50 border-2 border-transparent hover:border-blue-900 hover:bg-white rounded-2xl font-bold text-gray-700 transition-all text-left flex justify-between items-center"
          >
            Group 1 
          </button>
          <button 
            onClick={() => setSelectedGroup("Group 2")}
            className="w-full p-5 bg-gray-50 border-2 border-transparent hover:border-blue-900 hover:bg-white rounded-2xl font-bold text-gray-700 transition-all text-left flex justify-between items-center"
          >
            Group 2 
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in">
      <header className="flex flex-col xl:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setSelectedGroup("")} className="w-10 h-10 rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-blue-900 shadow-sm flex items-center justify-center transition-all">
            <FontAwesomeIcon icon={faUndo} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">{selectedGroup} Grades</h1>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{id}</p>
          </div>
        </div>
        
        {/* Category Selector - Now treats Lectures and Sections as Attendance Types */}
        <div className="flex flex-wrap justify-center gap-2 bg-white p-2 rounded-[2rem] border border-gray-100 shadow-sm">
          {[
            { id: "lecture_att", label: "Lec. Att" },
            { id: "section_att", label: "Sec. Att" },
            { id: "quizzes", label: "Quizzes" },
            { id: "assignments", label: "Assignments" },
            { id: "midterm", label: "Midterm" }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => { setCategory(cat.id as any); setIsEditing(false); }}
              className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${category === cat.id ? "bg-blue-900 text-white shadow-lg scale-105" : "text-gray-400 hover:bg-gray-50"}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </header>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
        <div className="p-8 bg-gray-50/50 border-b flex justify-between items-center">
          <div className="flex items-center gap-3 text-blue-900 font-black uppercase text-sm italic">
             Managing: {category.replace('_', ' ')}
          </div>
          <button 
            onClick={() => setIsEditing(!isEditing)} 
            className={`px-8 py-3 rounded-2xl font-bold shadow-md transition-all ${isEditing ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-blue-900 text-white hover:bg-blue-800'}`}
          >
            <FontAwesomeIcon icon={isEditing ? faSave : faEdit} className="mr-2" />
            {isEditing ? "Save Report" : "Modify Grades"}
          </button>
        </div>

        <table className="w-full text-left">
          <thead className="bg-white text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b">
            <tr>
              <th className="p-8">Student Detail</th>
              <th className="p-8">Current Grade</th>
              <th className="p-8 text-right">Review Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {students.map(s => (
              <tr key={s.id} className="hover:bg-gray-50/30 transition-colors group">
                <td className="p-8">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 text-gray-400 rounded-xl flex items-center justify-center group-hover:bg-blue-900 group-hover:text-white transition-all">
                      <FontAwesomeIcon icon={faUserGraduate} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 leading-tight">{s.name}</p>
                      <p className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-1">
                        <FontAwesomeIcon icon={faIdBadge} size="xs" /> {s.id}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-8">
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      disabled={!isEditing}
                      placeholder="--"
                      defaultValue={s[category] ?? ""} 
                      className="w-20 p-3 bg-gray-50 border border-gray-100 rounded-xl font-black outline-none focus:ring-2 focus:ring-blue-900 disabled:bg-transparent disabled:border-transparent transition-all"
                    />
                    <span className="text-xs font-bold text-gray-300">/ {maxGrades[category]}</span>
                  </div>
                </td>
                <td className="p-8 text-right">
                  {s[category] === null ? (
                    <span className="text-[10px] font-black uppercase text-orange-500 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100">Pending</span>
                  ) : (
                    <span className="text-[10px] font-black uppercase text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                      <FontAwesomeIcon icon={faCheckCircle} className="mr-1" /> Finalized
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}