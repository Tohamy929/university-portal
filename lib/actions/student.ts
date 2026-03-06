'use server';

// Only Import from the source of truth
import { MOCK_ANNOUNCEMENTS, MOCK_OVERDUE } from '@/src/data/studentdata';

export async function getStudentDashboard() {
  // Simulate database delay
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