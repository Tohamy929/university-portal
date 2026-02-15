"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudUploadAlt, faCheckCircle, faFilePdf, faClock } from "@fortawesome/free-solid-svg-icons";

export default function StudentAssignments() {
  const { id } = useParams();
  const [assignments, setAssignments] = useState([
    { id: 1, title: "Assignment #1: Circuit Analysis", deadline: "Oct 20, 2025", status: "pending" },
    { id: 2, title: "Assignment #2: Nodal Theory", deadline: "Oct 28, 2025", status: "delivered", uploadDate: "Oct 25" },
  ]);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Assignments: {id}</h1>
        <p className="text-gray-500">Track your submissions and upload new work.</p>
      </div>

      <div className="grid gap-6">
        {assignments.map((asm) => (
          <div key={asm.id} className={`bg-white p-6 rounded-3xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all ${asm.status === 'delivered' ? 'border-green-100 opacity-80' : 'border-gray-100 shadow-md'}`}>
            <div className="flex items-center gap-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl ${asm.status === 'delivered' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-900'}`}>
                <FontAwesomeIcon icon={asm.status === 'delivered' ? faCheckCircle : faClock} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{asm.title}</h3>
                <p className="text-sm text-gray-500">
                  {asm.status === 'delivered' ? `Delivered on ${asm.uploadDate}` : `Deadline: ${asm.deadline}`}
                </p>
              </div>
            </div>

            <div className="flex items-center">
              {asm.status === 'pending' ? (
                <label className="cursor-pointer bg-blue-900 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-blue-800 transition flex items-center gap-2">
                  <FontAwesomeIcon icon={faCloudUploadAlt} />
                  Upload PDF
                  <input type="file" className="hidden" accept=".pdf" />
                </label>
              ) : (
                <div className="flex items-center gap-2 text-green-600 font-bold text-sm">
                  <FontAwesomeIcon icon={faFilePdf} />
                  View Submission
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}