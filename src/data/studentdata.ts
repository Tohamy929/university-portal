// 1. ALL INTERFACES FIRST
export interface Course {
  id: string;
  name: string;
  attendanceRate: number;
  materialsCount: number;
  schedule: string;
  letterGrade?: string;
  percentage?: number;
}

export interface Announcement {
  id: number;
  title: string;
  sender: string;
  date: string;
  priority: 'high' | 'normal';
}

export interface Assignment {
  id: number;
  title: string;
  courseId: string;
  deadline: string;
  status: 'pending' | 'delivered';
}

export interface HistoryRecord {
  semester: string;
  gpa: number;
  subjects: string[];
}

export interface DepartmentContent {
  courses: Course[];
  assignments: Assignment[];
  teacherOverview: {
    weeklySchedule: {
      id: string;
      type: "Lecture" | "Section";
      day: string;
      time: string;
      location: string;
      status: "upcoming" | "missed";
    }[];
    pendingReviews: {
      subjectId: string;
      type: "Assignment" | "Quiz" | "Exam";
      count: number;
    }[];
  };
}

export interface StudentData {
  profile: {
    fullName: string;
    studentId: string;
    phoneNumber: string;
    totalGpa: number;
    avatar: string;
  };
  currentSemester: {
    id: string;
    title: string;
    time: string;
    room: string;
  }[];
  history: HistoryRecord[];
}
export interface RosterStudent {
  id: string;
  name: string;
  dept: string;
  email: string;
}
export const MOCK_ANNOUNCEMENTS = [
  { id: 1, title: "Midterm Exam Schedule - Spring 2026", sender: "Dean's Office", date: "1 hour ago", priority: "high" },
  { id: 2, title: "Registration for Summer Internships", sender: "Eng. Hassan", date: "Yesterday", priority: "normal" }
];

export const MOCK_OVERDUE = [
  { id: 1, task: "Lab Safety Certification", subject: "General Engineering", days: 2 }
];
// 2. RAW DATA SECOND (Define this before the function!)
export const MOCK_TERM_STATS = {
  gpa: 3.65,
  status: "Excellent",
  credits: 18
};

export const DEPARTMENT_DATA: Record<string, DepartmentContent> = {
  Electrical: {
    courses: [
      { id: "ELC301", name: "Microwave Engineering", attendanceRate: 68, materialsCount: 12, schedule: "Mon 10:00 AM", letterGrade: "A-", percentage: 91 },
      { id: "ELC302", name: "Communication Engineering 1", attendanceRate: 92, materialsCount: 8, schedule: "Wed 12:00 PM", letterGrade: "B+", percentage: 88 },
      { id: "ELC401", name: "Satellite Engineering", attendanceRate: 85, materialsCount: 15, schedule: "Thu 09:00 AM", letterGrade: "A", percentage: 94 }
    ],
    assignments: [
      { id: 101, title: "Antenna Design Report", courseId: "ELC301", deadline: "Feb 20, 2026", status: "pending" },
      { id: 102, title: "Link Budget Calculation", courseId: "ELC401", deadline: "Feb 28, 2026", status: "pending" }
    ],
    teacherOverview: {
      weeklySchedule: [
        { id: "ELC301", type: "Lecture", day: "Monday", time: "10:00 AM", location: "B102", status: "upcoming" },
        { id: "ELC302", type: "Section", day: "Wednesday", time: "12:00 PM", location: "Lab C", status: "upcoming" }
      ],
      pendingReviews: [
        { subjectId: "ELC301", type: "Assignment", count: 14 },
        { subjectId: "ELC401", type: "Exam", count: 1 }
      ]
    }
  },
  Mechanical: {
    courses: [
      { id: "MEC101", name: "Thermodynamics", attendanceRate: 88, materialsCount: 10, schedule: "Sun 08:00 AM", letterGrade: "B", percentage: 82 },
      { id: "MEC102", name: "Heat Transfer", attendanceRate: 72, materialsCount: 6, schedule: "Tue 11:00 AM", letterGrade: "C+", percentage: 78 },
      { id: "MEC201", name: "Fluid Mechanics", attendanceRate: 95, materialsCount: 14, schedule: "Thu 01:00 PM", letterGrade: "A", percentage: 96 }
    ],
    assignments: [
      { id: 201, title: "Heat Exchanger Project", courseId: "MEC102", deadline: "Feb 22, 2026", status: "pending" }
    ],
    teacherOverview: {
      weeklySchedule: [
        { id: "MEC101", type: "Lecture", day: "Sunday", time: "08:00 AM", location: "C01", status: "upcoming" },
        { id: "MEC102", type: "Lecture", day: "Tuesday", time: "11:00 AM", location: "B04", status: "missed" }
      ],
      pendingReviews: [
        { subjectId: "MEC102", type: "Assignment", count: 22 }
      ]
    }
  },
  Vehicle: {
    courses: [
      { id: "VEH201", name: "Vehicle Dynamics", attendanceRate: 90, materialsCount: 15, schedule: "Tue 10:00 AM", letterGrade: "A", percentage: 95 },
      { id: "VEH202", name: "Internal Combustion Engines", attendanceRate: 64, materialsCount: 11, schedule: "Wed 09:00 AM", letterGrade: "B-", percentage: 81 },
      { id: "VEH301", name: "Chassis Design", attendanceRate: 82, materialsCount: 7, schedule: "Thu 10:00 AM", letterGrade: "B+", percentage: 89 }
    ],
    assignments: [
      { id: 301, title: "Engine Efficiency Lab", courseId: "VEH202", deadline: "Feb 18, 2026", status: "pending" }
    ],
    teacherOverview: {
      weeklySchedule: [
        { id: "VEH201", type: "Lecture", day: "Tuesday", time: "10:00 AM", location: "Workshop 1", status: "upcoming" },
        { id: "VEH202", type: "Lecture", day: "Wednesday", time: "09:00 AM", location: "Workshop 2", status: "upcoming" }
      ],
      pendingReviews: [
        { subjectId: "VEH202", type: "Quiz", count: 40 }
      ]
    }
  }
};

// 3. FUNCTIONS THIRD
export function getStudentDataByDepartment(department: string): StudentData {
  const departmentContent = DEPARTMENT_DATA[department];

  return {
    profile: {
      fullName: "Student User",
      studentId: "32021567",
      phoneNumber: "+20 102 345 6789",
      totalGpa: MOCK_TERM_STATS.gpa,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${department}`
    },
    currentSemester: departmentContent?.courses.map(course => ({
      id: course.id,
      title: course.name,
      time: course.schedule,
      room: "TBD"
    })) || [],
    history: [
      { semester: "Fall 2025", gpa: 3.4, subjects: ["Mathematics 1", "Physics 1"] },
      { semester: "Spring 2025", gpa: 3.1, subjects: ["Mathematics 2", "Circuit 1"] },
    ]
  };
}

// 4. DEFAULT EXPORTS LAST
export const STUDENT_DATA: StudentData = getStudentDataByDepartment("Electrical");