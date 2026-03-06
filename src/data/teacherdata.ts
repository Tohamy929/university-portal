import { Department } from '@/lib/mockUsers';
import { DEPARTMENT_DATA } from './studentdata';

export interface Teacher {
  id: string;
  name: string;
  email: string;
  department: Department;
  subjects: string[]; // courseIds
}

export interface TeacherDepartmentOverview {
  teachers: Teacher[];
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
}

// Teacher data mapped from mockUsers with department assignment
export const TEACHERS_BY_DEPARTMENT: Record<Department, TeacherDepartmentOverview> = {
  Electrical: {
    teachers: [
      { id: 't1', name: 'Dr. Ibrahim', email: 't1@hti.edu.eg', department: 'Electrical', subjects: ['ELC301', 'ELC302', 'ELC401'] },
      { id: 't2', name: 'Dr. Laila', email: 't2@hti.edu.eg', department: 'Electrical', subjects: ['ELC301', 'ELC302', 'ELC401'] }
    ],
    weeklySchedule: DEPARTMENT_DATA.Electrical.teacherOverview.weeklySchedule,
    pendingReviews: DEPARTMENT_DATA.Electrical.teacherOverview.pendingReviews
  },
  Mechanical: {
    teachers: [
      { id: 't3', name: 'Dr. Mostafa', email: 't3@hti.edu.eg', department: 'Mechanical', subjects: ['MEC101', 'MEC102', 'MEC201'] },
      { id: 'a4', name: 'Dr. Nadia', email: 't4@hti.edu.eg', department: 'Mechanical', subjects: ['MEC101', 'MEC102', 'MEC201'] }
    ],
    weeklySchedule: DEPARTMENT_DATA.Mechanical.teacherOverview.weeklySchedule,
    pendingReviews: DEPARTMENT_DATA.Mechanical.teacherOverview.pendingReviews
  },
  Vehicle: {
    teachers: [
      { id: 'a5', name: 'Dr. Samy', email: 't5@hti.edu.eg', department: 'Vehicle', subjects: ['VEH201', 'VEH202', 'VEH301'] },
      { id: 'a6', name: 'Dr. Fatma', email: 't6@hti.edu.eg', department: 'Vehicle', subjects: ['VEH201', 'VEH202', 'VEH301'] }
    ],
    weeklySchedule: DEPARTMENT_DATA.Vehicle.teacherOverview.weeklySchedule,
    pendingReviews: DEPARTMENT_DATA.Vehicle.teacherOverview.pendingReviews
  }
};

// Helper function to get teacher by ID
export function getTeacherById(teacherId: string): Teacher | undefined {
  for (const dept of Object.values(TEACHERS_BY_DEPARTMENT)) {
    const teacher = dept.teachers.find(t => t.id === teacherId);
    if (teacher) return teacher;
  }
  return undefined;
}

// Helper function to get all teachers in a department
export function getTeachersByDepartment(department: Department): Teacher[] {
  return TEACHERS_BY_DEPARTMENT[department]?.teachers || [];
}
