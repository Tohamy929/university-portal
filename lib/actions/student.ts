'use server';


import { MOCK_ANNOUNCEMENTS, MOCK_OVERDUE } from '@/lib/studentData';


export async function getStudentDashboard() {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return {
    announcements: MOCK_ANNOUNCEMENTS,
    overdue: MOCK_OVERDUE
  };
}


export async function getStudentGrades(studentId: string) {
  await new Promise((resolve) => setTimeout(resolve, 500));
 
  return [
    { 
      id: "cs101", 
      name: "Electrical Engineering", 
      midterm: 18, 
      final: 35, 
      quizzes: [9, 8], 
      assignments: [10, 10] 
    },
   
  ];
}