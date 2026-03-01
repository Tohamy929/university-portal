"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCalendarAlt, faCheckCircle, faTimesCircle, faEdit, 
  faChevronRight, faUsers, faSave, faArrowLeft 
} from "@fortawesome/free-solid-svg-icons";

export default function ManageAttendance() {
  const { id } = useParams();
  const [selectedReport, setSelectedReport] = useState<any>(null);

  // Mock Data: Weekly History
  const attendanceHistory = [
    { 
      week: 1, 
      sessions: [
        { id: "s1", type: "Lecture", date: "Feb 1st", taken: true, presentCount: 42, total: 45 },
        { id: "s2", type: "Section", date: "Feb 3rd", taken: true, presentCount: 20, total: 22 }
      ] 
    },
    { 
      week: 2, 
      sessions: [
        { id: "s3", type: "Lecture", date: "Feb 8th", taken: true, presentCount: 38, total: 45 },
        { id: "s4", type: "Section", date: "Feb 10th", taken: false, presentCount: 0, total: 22 }
      ] 
    },
     { 
      week: 3, 
      sessions: [
        { id: "s3", type: "Lecture", date: "Feb 8th", taken: true, presentCount: 38, total: 45 },
        { id: "s4", type: "Section", date: "Feb 10th", taken: false, presentCount: 0, total: 22 }
      ] 
    },
     { 
      week: 4, 
      sessions: [
        { id: "s3", type: "Lecture", date: "Feb 8th", taken: true, presentCount: 38, total: 45 },
        { id: "s4", type: "Section", date: "Feb 10th", taken: false, presentCount: 0, total: 22 }
      ] 
    },
     { 
      week: 5, 
      sessions: [
        { id: "s3", type: "Lecture", date: "Feb 8th", taken: true, presentCount: 38, total: 45 },
        { id: "s4", type: "Section", date: "Feb 10th", taken: false, presentCount: 0, total: 22 }
      ] 
    },
     { 
      week: 6, 
      sessions: [
        { id: "s3", type: "Lecture", date: "Feb 8th", taken: true, presentCount: 38, total: 45 },
        { id: "s4", type: "Section", date: "Feb 10th", taken: false, presentCount: 0, total: 22 }
      ] 
    },
     { 
      week: 7, 
      sessions: [
        { id: "s3", type: "Lecture", date: "Feb 8th", taken: true, presentCount: 38, total: 45 },
        { id: "s4", type: "Section", date: "Feb 10th", taken: false, presentCount: 0, total: 22 }
      ] 
    },
     { 
      week: 8, 
      sessions: [
        { id: "s3", type: "Lecture", date: "Feb 8th", taken: true, presentCount: 38, total: 45 },
        { id: "s4", type: "Section", date: "Feb 10th", taken: false, presentCount: 0, total: 22 }
      ] 
    },
     { 
      week: 9, 
      sessions: [
        { id: "s3", type: "Lecture", date: "Feb 8th", taken: true, presentCount: 38, total: 45 },
        { id: "s4", type: "Section", date: "Feb 10th", taken: false, presentCount: 0, total: 22 }
      ] 
    },
     { 
      week: 10, 
      sessions: [
        { id: "s3", type: "Lecture", date: "Feb 8th", taken: true, presentCount: 38, total: 45 },
        { id: "s4", type: "Section", date: "Feb 10th", taken: false, presentCount: 0, total: 22 }
      ] 
    },
     { 
      week: 11, 
      sessions: [
        { id: "s3", type: "Lecture", date: "Feb 8th", taken: true, presentCount: 38, total: 45 },
        { id: "s4", type: "Section", date: "Feb 10th", taken: false, presentCount: 0, total: 22 }
      ] 
    },
     { 
      week: 12, 
      sessions: [
        { id: "s3", type: "Lecture", date: "Feb 8th", taken: true, presentCount: 38, total: 45 },
        { id: "s4", type: "Section", date: "Feb 10th", taken: false, presentCount: 0, total: 22 }
      ] 
    },
     { 
      week: 13, 
      sessions: [
        { id: "s3", type: "Lecture", date: "Feb 8th", taken: true, presentCount: 38, total: 45 },
        { id: "s4", type: "Section", date: "Feb 10th", taken: false, presentCount: 0, total: 22 }
      ] 
    },
     { 
      week: 14, 
      sessions: [
        { id: "s3", type: "Lecture", date: "Feb 8th", taken: true, presentCount: 38, total: 45 },
        { id: "s4", type: "Section", date: "Feb 10th", taken: false, presentCount: 0, total: 22 }
      ] 
    },
     
    
  ];
  

  
  const [reportData, setReportData] = useState([
    { id: "20210101", name: "Ahmed Ali", status: "present" },
    { id: "20210502", name: "Mona Zaki", status: "absent" },
    { id: "20210903", name: "Youssef Sedik", status: "present" },
  ]);

  const toggleStatus = (studentId: string) => {
    setReportData(prev => prev.map(s => 
      s.id === studentId ? { ...s, status: s.status === 'present' ? 'absent' : 'present' } : s
    ));
  };

  if (selectedReport) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-right duration-300">
        <button onClick={() => setSelectedReport(null)} className="text-blue-900 font-bold flex items-center gap-2 mb-4">
          <FontAwesomeIcon icon={faArrowLeft} /> Back to History
        </button>
        
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
          <div className="p-8 bg-gray-50 border-b flex justify-between items-center">
            <div>
              <h2 className="text-xl font-black text-gray-900 uppercase italic">Editing Report: {selectedReport.type}</h2>
              <p className="text-xs text-gray-400 font-bold uppercase">{selectedReport.date} • {id}</p>
            </div>
            <button className="bg-green-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg flex items-center gap-2">
              <FontAwesomeIcon icon={faSave} /> Update Records
            </button>
          </div>

          <table className="w-full text-left">
            <thead className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">
              <tr><th className="p-6">Student</th><th className="p-6 text-center">Status</th><th className="p-6 text-right">Action</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {reportData.map(s => (
                <tr key={s.id}>
                  <td className="p-6">
                    <p className="font-bold text-gray-800">{s.name}</p>
                    <p className="text-[10px] text-gray-400 font-bold">{s.id}</p>
                  </td>
                  <td className="p-6 text-center">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase ${s.status === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <button onClick={() => toggleStatus(s.id)} className={`w-10 h-10 rounded-full ${s.status === 'present' ? 'text-red-400' : 'text-green-500'}`}>
                      <FontAwesomeIcon icon={s.status === 'present' ? faTimesCircle : faCheckCircle} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-black text-gray-900 uppercase italic">Attendance Ledger</h1>
        <p className="text-gray-500 font-medium">Click on any session to view or modify the student list.</p>
      </header>

      <div className="space-y-8">
        {attendanceHistory.map((week) => (
          <div key={week.week} className="space-y-4">
            <h3 className="text-[10px] font-black text-blue-900 uppercase tracking-[0.3em] ml-4">Week {week.week}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {week.sessions.map((session) => (
                <button 
                  key={session.id}
                  onClick={() => setSelectedReport(session)}
                  disabled={!session.taken}
                  className={`bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm text-left transition-all flex justify-between items-center group ${session.taken ? 'hover:border-blue-900 hover:shadow-xl' : 'opacity-50 grayscale cursor-not-allowed'}`}
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${session.taken ? 'bg-blue-50 text-blue-900' : 'bg-gray-50 text-gray-300'}`}>
                      <FontAwesomeIcon icon={faCalendarAlt} />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">{session.type}</p>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{session.date}</p>
                      {session.taken && (
                        <p className="text-[10px] font-bold text-green-600 uppercase mt-1">
                          <FontAwesomeIcon icon={faUsers} className="mr-1" /> {session.presentCount}/{session.total} Present
                        </p>
                      )}
                    </div>
                  </div>
                  {session.taken ? (
                    <div className="flex items-center gap-2 text-blue-900 font-bold text-xs group-hover:translate-x-1 transition-transform">
                      Edit Report <FontAwesomeIcon icon={faChevronRight} />
                    </div>
                  ) : (
                    <span className="text-[10px] font-black text-gray-300 uppercase italic">Not Taken</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}