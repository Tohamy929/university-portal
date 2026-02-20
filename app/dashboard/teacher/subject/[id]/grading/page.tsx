"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faSave, faUsers, faCheckCircle, faExclamationTriangle, faUndo } from "@fortawesome/free-solid-svg-icons";

export default function TeacherGrading() {
  const { id } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [category, setCategory] = useState<"attendance" | "quizzes" | "assignments" | "midterm">("assignments");

  // Mock data - grades start as null (Not Reviewed)
  const [students, setStudents] = useState([
    { id: "20210101", name: "Ahmed Ali", missed: 2, quizzes: 15, assignments: null, midterm: 14 },
    { id: "20210502", name: "Mona Zaki", missed: 4, quizzes: 10, assignments: null, midterm: 8 },
  ]);

  const maxGrades = { attendance: 10, quizzes: 20, assignments: 20, midterm: 20 };

  if (!selectedGroup) {
    return (
      <div className="max-w-md mx-auto mt-20 p-10 bg-white rounded-[3rem] border border-gray-100 shadow-xl text-center space-y-6 animate-in zoom-in-95">
        <div className="w-20 h-20 bg-blue-50 text-blue-900 rounded-3xl flex items-center justify-center mx-auto text-3xl">
          <FontAwesomeIcon icon={faUsers} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900">Select Group</h2>
          <p className="text-gray-400 font-medium">Please choose a group to begin grading.</p>
        </div>
        <select 
          className="w-full p-4 bg-gray-50 border rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-900"
          onChange={(e) => setSelectedGroup(e.target.value)}
        >
          <option value="">Choose Group...</option>
          <option value="G1">Group 1 (Lecture)</option>
          <option value="G2">Group 2 (Section)</option>
        </select>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in">
      <header className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => setSelectedGroup("")} className="text-gray-400 hover:text-blue-900"><FontAwesomeIcon icon={faUndo} /></button>
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">{id} Grading: {selectedGroup}</h1>
        </div>
        
        <div className="flex gap-2 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
          {(["attendance", "quizzes", "assignments", "midterm"] as const).map(cat => (
            <button
              key={cat}
              onClick={() => { setCategory(cat); setIsEditing(false); }}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${category === cat ? "bg-blue-900 text-white shadow-md" : "text-gray-400 hover:bg-gray-50"}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
        <div className="p-8 bg-gray-50 border-b flex justify-between items-center">
          <h3 className="font-black text-gray-800 uppercase italic">Managing {category}</h3>
          <button onClick={() => setIsEditing(!isEditing)} className={`px-8 py-3 rounded-2xl font-bold transition-all ${isEditing ? 'bg-green-600 text-white' : 'bg-blue-900 text-white'}`}>
            <FontAwesomeIcon icon={isEditing ? faSave : faEdit} className="mr-2" />
            {isEditing ? "Save Changes" : "Edit Marks"}
          </button>
        </div>

        <table className="w-full text-left">
          <thead className="bg-white text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b">
            <tr><th className="p-8">Student</th><th className="p-8">Grade</th><th className="p-8 text-right">Status</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {students.map(s => {
              const isProhibited = s.missed >= 4;
              const currentGrade = [category];
              
              return (
                <tr key={s.id} className={`${isProhibited ? 'bg-red-50/30' : ''}`}>
                  <td className="p-8">
                    <p className="font-bold text-gray-900">{s.name}</p>
                    <p className="text-[10px] font-black text-gray-400">{s.id}</p>
                  </td>
                  <td className="p-8">
                    {category === "attendance" ? (
                      <span className="font-black text-lg text-blue-900">{isProhibited ? "0" : "10"} <small className="text-gray-300">/ 10</small></span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          disabled={!isEditing}
                          placeholder="--"
                          defaultValue={currentGrade ?? ""} 
                          className="w-20 p-3 bg-gray-50 border rounded-xl font-black outline-none focus:ring-2 focus:ring-blue-900 disabled:bg-transparent disabled:border-transparent placeholder:text-gray-300"
                        />
                        <span className="text-xs font-bold text-gray-300">/ {maxGrades[category]}</span>
                      </div>
                    )}
                  </td>
                  <td className="p-8 text-right">
                    {currentGrade === null ? (
                      <span className="text-[10px] font-black uppercase text-orange-500 bg-orange-50 px-3 py-1 rounded-lg tracking-widest">Not Reviewed</span>
                    ) : (
                      <span className="text-[10px] font-black uppercase text-green-600"><FontAwesomeIcon icon={faCheckCircle} /> Graded</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}