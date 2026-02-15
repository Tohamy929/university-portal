'use server';

import { MOCK_USERS } from '@/lib/mockUsers';


export async function authenticateUser(email: string, pass: string) {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const user = MOCK_USERS.find(u => u.email === email && u.password === pass);

  if (user) {
    return { 
      success: true, 
      role: user.role, 
      name: user.name,
      department: user.department // Essential for the teacher to see their specific courses
    };
  }
  return { success: false, message: "Invalid Credentials" };
}