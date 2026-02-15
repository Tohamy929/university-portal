export type Role = 'student' | 'teacher' | 'assistant';
export type Department = 'Electrical' | 'Mechanical' | 'Vehicle';
export interface User {
  id: string;
  email: string;
  password: string; 
  name: string;
  role: Role;
  department: Department;
}

export const MOCK_USERS: User[] = [
  // Students (One for each dept)
  { id: 's1', email: 'student1@hti.edu.eg', password: '123', name: 'Ahmed Ali', role: 'student', department: 'Electrical' },
  { id: 's2', email: 'student2@hti.edu.eg', password: '123', name: 'Sara Mohamed', role: 'student', department: 'Mechanical' },
  { id: 's3', email: 'student3@hti.edu.eg', password: '123', name: 'Omar Gad', role: 'student', department: 'Vehicle' },
  { id: 's4', email: 's4@hti.edu.eg', password: '123', name: 'Sheriff Mahmoud', role: 'student', department: 'Electrical' },
{ id: 's5', email: 's5@hti.edu.eg', password: '123', name: 'Youssef Sedik', role: 'student', department: 'Electrical' },
{ id: 's6', email: 's6@hti.edu.eg', password: '123', name: 'Hana El-Sayed', role: 'student', department: 'Mechanical' },

  // Teachers (Two for each dept)
  { id: 't1', email: 't1@hti.edu.eg', password: '123', name: 'Dr. Ibrahim', role: 'teacher', department: 'Electrical' },
  { id: 't2', email: 't2@hti.edu.eg', password: '123', name: 'Dr. Laila', role: 'teacher', department: 'Electrical' },
  { id: 't3', email: 't3@hti.edu.eg', password: '123', name: 'Dr. Mostafa', role: 'teacher', department: 'Mechanical' },
  { id: 'a4', email: 't4@hti.edu.eg', password: '123', name: 'Dr. Nadia', role: 'teacher', department: 'Mechanical' },
  { id: 'a5', email: 't5@hti.edu.eg', password: '123', name: 'Dr. Samy', role: 'teacher', department: 'Vehicle' },
  { id: 'a6', email: 't6@hti.edu.eg', password: '123', name: 'Dr. Fatma', role: 'teacher', department: 'Vehicle' },

 
];