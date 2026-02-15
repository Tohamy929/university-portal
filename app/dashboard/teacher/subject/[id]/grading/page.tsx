"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faSave, faTimes, faCalculator, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

export default function TeacherGrading() {
  const { id } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<"quizzes" | "midterm" | "final" | "attendance">("quizzes");

  // Direct array - No complex state fetching for now to ensure it renders
  const students = [
    { id: "20210101", name: "Ahmed Ali", missed: 2, quizzes: 15, midterm: 14, final: 30 },
    { id: "20210502", name: "Sheriff Mahmoud", missed: 4, quizzes: 10, midterm: 8, final: 0 },
    { id: "20210903", name: "Youssef Sedik", missed: 0, quizzes: 19, midterm: 18, final: 35 },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Category Tabs */}
      <div className="flex bg-white p-2 rounded-2xl shadow-sm border border-gray-100 w-fit gap-2">
        {["attendance", "quizzes", "midterm", "final"].map((cat) => (
          <button
            key={cat}
            onClick={() => { setCurrentCategory(cat as any); setIsEditing(false); }}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              currentCategory === cat ? "bg-blue-900 text-white" : "text-gray-400 hover:bg-gray-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Action Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 uppercase">Grading: {currentCategory}</h2>
        <div className="flex gap-2">
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="bg-blue-900 text-white px-6 py-2 rounded-xl font-bold text-sm">
              <FontAwesomeIcon icon={faEdit} className="mr-2"/> Edit
            </button>
          ) : (
            <>
              <button onClick={() => setIsEditing(false)} className="bg-gray-100 px-6 py-2 rounded-xl font-bold text-sm">Cancel</button>
              <button onClick={() => setIsEditing(false)} className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold text-sm">Save</button>
            </>
          )}
        </div>
      </div>

      {/* The Table */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase border-b">
            <tr>
              <th className="p-6">Student</th>
              <th className="p-6">Grade / Value</th>
              <th className="p-6 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => {
              const isProhibited = student.missed >= 4;
              return (
                <tr key={student.id} className={`border-b border-gray-50 ${isProhibited ? 'bg-red-50/50' : ''}`}>
                  <td className="p-6">
                    <p className="font-bold text-gray-800">{student.name}</p>
                    <p className="text-[10px] text-gray-400 font-bold">{student.id}</p>
                  </td>
                  <td className="p-6">
                    {currentCategory === "attendance" ? (
                      <span className="font-black text-blue-900">{isProhibited ? "0 / 10" : "10 / 10"}</span>
                    ) : (
                      <input 
                        type="number" 
                        disabled={!isEditing || (isProhibited && currentCategory === "final")}
                        defaultValue={student[currentCategory]} 
                        className="w-20 p-2 border rounded-lg font-bold disabled:bg-transparent disabled:border-transparent"
                      />
                    )}
                  </td>
                  <td className="p-6 text-right">
                    {isProhibited ? (
                      <span className="text-red-600 font-black text-[10px] uppercase">Prohibited</span>
                    ) : (
                      <span className="text-green-600 font-black text-[10px] uppercase">Active</span>
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