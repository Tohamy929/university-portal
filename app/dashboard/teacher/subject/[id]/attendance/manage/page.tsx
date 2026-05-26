"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCalendarAlt, faCheckCircle, faTimesCircle, faChevronRight, 
  faSave, faArrowLeft, faTrashAlt, faLayerGroup 
} from "@fortawesome/free-solid-svg-icons";

export default function ManageAttendance() {
  const { id } = useParams();
  
  // CORE DATA STATE
  const [allHistory, setAllHistory] = useState<any[]>([]);
  
  // NAVIGATION STATES
  const [selectedGroup, setSelectedGroup] = useState<string>("1");
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  
  // EDITOR STATES
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [reportData, setReportData] = useState<any[]>([]);

  // --- LOAD DATA ---
  const loadHistory = () => {
    const savedData = JSON.parse(localStorage.getItem("attendanceHistory") || "[]");
    setAllHistory(savedData);
  };

  useEffect(() => {
    loadHistory();
  }, [id]);

  useEffect(() => {
    if (selectedReport) setReportData(selectedReport.roster || []);
  }, [selectedReport]);

  // --- DERIVED DATA ---
 const cleanSubjectId = decodeURIComponent(String(id)); // Clean the Vercel URL!
  
  const subjectSessions = allHistory.filter(s => s.subjectId === cleanSubjectId && String(s.group) === selectedGroup);
  
  const activeWeekSessions = selectedWeek ? subjectSessions.filter(s => String(s.week) === String(selectedWeek)) : [];
  // --- ACTIONS ---
  const deleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this session record? This cannot be undone.")) {
      const updatedData = allHistory.filter((s: any) => s.id !== sessionId);
      localStorage.setItem("attendanceHistory", JSON.stringify(updatedData));
      setAllHistory(updatedData);
      if (selectedReport?.id === sessionId) setSelectedReport(null);
    }
  };

  const toggleStatus = (studentId: string) => {
    setReportData(prev => prev.map(s => 
      s.id.toString() === studentId.toString() ? { ...s, status: s.status === 'present' ? 'absent' : 'present' } : s
    ));
  };

  const updateGlobalHistory = () => {
    const updatedData = allHistory.map((s: any) => 
      s.id === selectedReport.id ? { ...s, roster: reportData, presentCount: reportData.filter(r => r.status === 'present').length } : s
    );
    localStorage.setItem("attendanceHistory", JSON.stringify(updatedData));
    setAllHistory(updatedData);
    alert("Record Updated Successfully");
    setSelectedReport(null);
  };

  // --- VIEW 3: EDITOR ---
  if (selectedReport) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-right duration-300 pb-20">
        <button onClick={() => setSelectedReport(null)} className="text-blue-900 font-black uppercase text-[10px] tracking-widest flex items-center gap-2 mb-4 hover:scale-105 transition-transform">
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Week {selectedWeek}
        </button>
        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl overflow-hidden">
          <div className="p-10 bg-gray-50 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-black text-gray-900 uppercase italic">Edit: {selectedReport.type}</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                {selectedReport.date} • Week {selectedReport.week} • Group {selectedReport.group}
              </p>
            </div>
            <button onClick={updateGlobalHistory} className="w-full md:w-auto bg-green-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase shadow-lg hover:bg-green-500 transition-colors">
              <FontAwesomeIcon icon={faSave} className="mr-2" /> Save Changes
            </button>
          </div>
          <table className="w-full text-left">
            <tbody className="divide-y divide-gray-50">
              {reportData.map(s => (
                <tr key={s.id}>
                  <td className="p-6 md:p-8">
                     <p className="font-black text-gray-800 text-xs md:text-sm uppercase">{s.name}</p>
                     <p className="text-[9px] font-bold text-gray-400">{s.code || s.id}</p>
                  </td>
                  <td className="p-6 md:p-8 text-center w-24">
                    <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase ${s.status === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{s.status}</span>
                  </td>
                  <td className="p-6 md:p-8 text-right w-20">
                    <button onClick={() => toggleStatus(s.id)} className="text-gray-300 hover:text-blue-900 text-xl transition-colors">
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

  // --- VIEW 1 & 2: DASHBOARD (GROUP -> WEEK -> SESSIONS) ---
  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 uppercase italic">Attendance Ledger</h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">Subject: {id}</p>
        </div>

        {/* GROUP TABS */}
        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 w-fit">
           {["1", "2"].map(g => (
             <button 
               key={g} 
               onClick={() => { setSelectedGroup(g); setSelectedWeek(null); }}
               className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${selectedGroup === g ? "bg-blue-900 text-white shadow-md" : "text-gray-400 hover:bg-gray-50"}`}
             >
               <FontAwesomeIcon icon={faLayerGroup} /> Group {g}
             </button>
           ))}
        </div>
      </div>

      {/* 14 WEEK GRID */}
      <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-xl space-y-6">
         <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Select a Week</h2>
         <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
           {Array.from({ length: 14 }, (_, i) => i + 1).map(w => {
              const weekCount = subjectSessions.filter(s => String(s.week) === String(w)).length;
              const isSelected = selectedWeek === w;
              
              return (
                <button 
                  key={w}
                  onClick={() => setSelectedWeek(w === selectedWeek ? null : w)}
                  className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 border-2 transition-all ${isSelected ? 'border-blue-900 bg-blue-50 text-blue-900 shadow-inner' : weekCount > 0 ? 'border-blue-100 bg-white text-gray-900 hover:border-blue-300' : 'border-transparent bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                >
                  <p className="font-black text-xs uppercase italic">Week {w}</p>
                  {weekCount > 0 && (
                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${isSelected ? 'bg-blue-900 text-white' : 'bg-blue-100 text-blue-800'}`}>
                      {weekCount} Record{weekCount > 1 ? 's' : ''}
                    </span>
                  )}
                </button>
              )
           })}
         </div>
      </div>

      {/* SESSIONS DETAIL VIEW (Slides in when a week is clicked) */}
      {selectedWeek && (
        <div className="animate-in slide-in-from-top-4 duration-300 space-y-4">
          <h3 className="text-[10px] font-black text-blue-900 uppercase tracking-[0.4em] ml-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faCalendarAlt} /> Sessions for Week {selectedWeek}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeWeekSessions.length > 0 ? (
              activeWeekSessions.map((session: any) => (
                <div key={session.id} className="relative group">
                  <button 
                    onClick={() => setSelectedReport(session)}
                    className="w-full bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm text-left transition-all flex justify-between items-center hover:border-blue-900 hover:shadow-2xl"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-blue-50 text-blue-900 rounded-[2rem] flex items-center justify-center text-xl"><FontAwesomeIcon icon={faCalendarAlt} /></div>
                      <div>
                        <p className="text-lg font-black text-gray-900 uppercase italic">{session.type}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">{session.date} • Group {session.group}</p>
                        <p className="text-[9px] font-black text-green-600 uppercase tracking-widest mt-2">{session.presentCount} Present</p>
                      </div>
                    </div>
                    <FontAwesomeIcon icon={faChevronRight} className="text-gray-200 group-hover:text-blue-900 transition-colors" />
                  </button>
                  
                  {/* DELETE BUTTON */}
                  <button 
                    onClick={(e) => deleteSession(session.id, e)}
                    className="absolute top-4 right-4 w-10 h-10 bg-red-50 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white flex items-center justify-center shadow-md hover:scale-110"
                  >
                    <FontAwesomeIcon icon={faTrashAlt} size="xs" />
                  </button>
                </div>
              ))
            ) : (
              <div className="md:col-span-2 p-12 bg-white rounded-[3rem] border-2 border-dashed border-gray-100 text-center">
                <p className="text-gray-300 font-black uppercase text-xs tracking-widest">No sessions recorded for Week {selectedWeek}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}