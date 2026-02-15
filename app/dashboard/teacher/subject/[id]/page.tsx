"use client";
import { useParams, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faFileSignature, faExclamationCircle, faArrowRight, faChartPie } from "@fortawesome/free-solid-svg-icons";

export default function TeacherSubjectHome() {
  const { id } = useParams();
  const router = useRouter();

  // Mocked analytics for this subject
  const stats = {
    totalStudents: 45,
    pendingAssignments: 12,
    atRiskStudents: 3, // Students with >= 4 absences
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Management: {id}</h1>
        <p className="text-gray-500 font-medium">Monitoring academic performance and session logs.</p>
      </header>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="w-12 h-12 bg-blue-50 text-blue-900 rounded-2xl flex items-center justify-center mb-6 text-xl">
            <FontAwesomeIcon icon={faUsers} />
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Enrolled Students</p>
          <p className="text-4xl font-black text-gray-900">{stats.totalStudents}</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6 text-xl">
            <FontAwesomeIcon icon={faFileSignature} />
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ungraded Submissions</p>
          <p className="text-4xl font-black text-gray-900">{stats.pendingAssignments}</p>
        </div>

        <div className={`p-8 rounded-[2.5rem] border flex flex-col justify-between ${stats.atRiskStudents > 0 ? 'bg-red-50 border-red-100 text-red-900' : 'bg-green-50 border-green-100 text-green-900'}`}>
          <div>
            <FontAwesomeIcon icon={faExclamationCircle} className="text-2xl mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Prohibited Students</p>
            <p className="text-4xl font-black">{stats.atRiskStudents}</p>
          </div>
          <p className="text-xs mt-4 font-bold italic">Students exceeding 4 absences</p>
        </div>
      </div>

      {/* Quick Action Area */}
      <section className="bg-blue-900 rounded-[3rem] p-10 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Ready for today's session?</h2>
          <p className="text-blue-200 max-w-md">Launch the AI Facial Recognition system to record attendance for Group 1 or Group 2.</p>
          <button 
            onClick={() => router.push(`/dashboard/teacher/subject/${id}/attendance`)}
            className="bg-white text-blue-900 px-8 py-4 rounded-2xl font-black shadow-lg hover:scale-105 transition-all flex items-center gap-3"
          >
            Start Attendance Session <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>
        <div className="text-8xl opacity-10 rotate-12 hidden lg:block">
          <FontAwesomeIcon icon={faChartPie} />
        </div>
      </section>
    </div>
  );
}