"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCalendarAlt, faCheckCircle, faTimesCircle, faChevronRight, 
  faUsers, faSave, faArrowLeft, faHistory, faTrashAlt 
} from "@fortawesome/free-solid-svg-icons";

export default function ManageAttendance() {
  const { id } = useParams();
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [historyByWeek, setHistoryByWeek] = useState<any[]>([]);
  const [reportData, setReportData] = useState<any[]>([]);

  // --- LOAD & ORGANIZE DATA ---
  const loadHistory = () => {
    const savedData = JSON.parse(localStorage.getItem("attendanceHistory") || "[]");
    const subjectData = savedData.filter((s: any) => s.subjectId === id);

    const weeks = Array.from({ length: 14 }, (_, i) => i + 1);
    const organized = weeks.map(w => ({
      week: w,
      sessions: subjectData.filter((s: any) => String(s.week) === String(w) || s.week === `Week ${w}`)
    }));
    setHistoryByWeek(organized);
  };

  useEffect(() => {
    loadHistory();
  }, [id]);

  useEffect(() => {
    if (selectedReport) setReportData(selectedReport.roster || []);
  }, [selectedReport]);

  // --- DELETE SESSION LOGIC ---
  const deleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevents opening the edit modal
    if (confirm("Are you sure you want to delete this session record? This cannot be undone.")) {
      const savedData = JSON.parse(localStorage.getItem("attendanceHistory") || "[]");
      const filteredData = savedData.filter((s: any) => s.id !== sessionId);
      localStorage.setItem("attendanceHistory", JSON.stringify(filteredData));
      loadHistory(); // Refresh the list
    }
  };

  const toggleStatus = (studentId: string) => {
    setReportData(prev => prev.map(s => 
      s.id === studentId ? { ...s, status: s.status === 'present' ? 'absent' : 'present' } : s
    ));
  };

  const updateGlobalHistory = () => {
    const savedData = JSON.parse(localStorage.getItem("attendanceHistory") || "[]");
    const updatedData = savedData.map((s: any) => 
      s.id === selectedReport.id ? { ...s, roster: reportData, presentCount: reportData.filter(r => r.status === 'present').length } : s
    );
    localStorage.setItem("attendanceHistory", JSON.stringify(updatedData));
    alert("Record Updated Successfully");
    setSelectedReport(null);
    loadHistory();
  };

  if (selectedReport) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-right duration-300 pb-20">
        <button onClick={() => setSelectedReport(null)} className="text-blue-900 font-black uppercase text-[10px] tracking-widest flex items-center gap-2 mb-4">
          <FontAwesomeIcon icon={faArrowLeft} /> Back to History
        </button>
        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl overflow-hidden">
          <div className="p-10 bg-gray-50 border-b flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-black text-gray-900 uppercase italic">Edit: {selectedReport.type}</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">{selectedReport.date} • Week {selectedReport.week}</p>
            </div>
            <button onClick={updateGlobalHistory} className="bg-green-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase shadow-lg">
              <FontAwesomeIcon icon={faSave} className="mr-2" /> Save Changes
            </button>
          </div>
          <table className="w-full text-left">
            <tbody className="divide-y divide-gray-50">
              {reportData.map(s => (
                <tr key={s.id}>
                  <td className="p-8"><p className="font-black text-gray-800 text-sm">{s.name}</p></td>
                  <td className="p-8 text-center">
                    <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase ${s.status === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{s.status}</span>
                  </td>
                  <td className="p-8 text-right">
                    <button onClick={() => toggleStatus(s.id)} className="text-gray-400 hover:text-blue-900"><FontAwesomeIcon icon={s.status === 'present' ? faTimesCircle : faCheckCircle} /></button>
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
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20">
      <h1 className="text-3xl font-black text-gray-900 uppercase italic">Attendance Ledger</h1>
      <div className="space-y-12">
        {historyByWeek.map((week) => (
          <div key={week.week} className="space-y-4">
            <h3 className="text-[10px] font-black text-blue-900 uppercase tracking-[0.4em] ml-4">Week {week.week}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {week.sessions.length > 0 ? (
                week.sessions.map((session: any) => (
                  <div key={session.id} className="relative group">
                    <button 
                      onClick={() => setSelectedReport(session)}
                      className="w-full bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm text-left transition-all flex justify-between items-center group-hover:border-blue-900 group-hover:shadow-2xl"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-blue-50 text-blue-900 rounded-[2rem] flex items-center justify-center text-xl"><FontAwesomeIcon icon={faCalendarAlt} /></div>
                        <div>
                          <p className="text-lg font-black text-gray-900 uppercase italic">{session.type}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">{session.date} • {session.group}</p>
                        </div>
                      </div>
                      <FontAwesomeIcon icon={faChevronRight} className="text-gray-200" />
                    </button>
                    {/* THE DELETE BUTTON */}
                    <button 
                      onClick={(e) => deleteSession(session.id, e)}
                      className="absolute top-4 right-4 w-8 h-8 bg-red-50 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white flex items-center justify-center"
                    >
                      <FontAwesomeIcon icon={faTrashAlt} size="xs" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="md:col-span-2 p-10 bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100 text-center opacity-30 text-[9px] font-black uppercase">No Records</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}