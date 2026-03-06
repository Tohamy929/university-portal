"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faTimesCircle, faMinusCircle } from "@fortawesome/free-solid-svg-icons";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DEPARTMENT_DATA } from "@/src/data/studentdata";

export default function StudentSubjectAttendance() {
  const { id } = useParams();
  const [courseInfo, setCourseInfo] = useState<any>(null);
  const weeks = Array.from({ length: 14 }, (_, i) => i + 1);

  // Get course info from centralized data
  useEffect(() => {
    const userDept = localStorage.getItem("userDept") || "Electrical";
    const departmentData = DEPARTMENT_DATA[userDept];
    const course = departmentData?.courses.find(c => c.id === id);
    setCourseInfo(course);
  }, [id]);

  // Mock data representing the 2 lectures per week
  // In a real app, this would come from the backend array
  const attendanceData: Record<number, { lec1: string; lec2: string }> = {
    1: { lec1: "present", lec2: "present" },
    2: { lec1: "present", lec2: "absent" },
    3: { lec1: "present", lec2: "present" },
    4: { lec1: "absent", lec2: "absent" },
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Attendance Record</h2>
          <p className="text-gray-500">Total: 14 Weeks • 2 Lectures/Week</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Attendance Rate</p>
          <p className="text-3xl font-black text-blue-900">{courseInfo?.attendanceRate || 75}%</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {weeks.map((week) => {
          const status = attendanceData[week] || { lec1: "pending", lec2: "pending" };
          return (
            <div key={week} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col gap-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-gray-900 text-lg">Week {week}</h4>
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Spring Term</span>
              </div>

              <div className="flex gap-3 mt-2">
                <AttendanceBadge label="Lec 1" status={status.lec1 as any} />
                <AttendanceBadge label="Lec 2" status={status.lec2 as any} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AttendanceBadge({ status, label }: { status: "present" | "absent" | "pending"; label: string }) {
  const config = {
    present: { icon: faCheckCircle, color: "text-green-600", bg: "bg-green-50", border: "border-green-100" },
    absent: { icon: faTimesCircle, color: "text-red-600", bg: "bg-red-50", border: "border-red-100" },
    pending: { icon: faMinusCircle, color: "text-gray-300", bg: "bg-gray-50", border: "border-gray-100" },
  };

  const { icon, color, bg, border } = config[status];

  return (
    <div className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-2xl border ${bg} ${border} transition-all`}>
      <span className={`text-[9px] font-black uppercase tracking-tighter ${color}`}>{label}</span>
      <FontAwesomeIcon icon={icon} className={`${color} text-xl`} />
    </div>
  );
}