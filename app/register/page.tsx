"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faSpinner, faExclamationTriangle, faArrowLeft, 
  faUserGraduate, faChalkboardTeacher, faCheckCircle, faHome
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

// Notice: "admin" is officially removed from the acceptable roles!
type Role = "student" | "teacher";

export default function RegisterPage() {
  const router = useRouter();

  const [role, setRole] = useState<Role>("student");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: "", username: "", email: "", phoneNumber: "",
    password: "", code: "", departmentId: "" 
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); setErrorMessage(null);

    try {
      const roleDbMapping: Record<Role, string> = { student: "Student", teacher: "Teacher" };
      const payload = {
        name: formData.fullName.split(' ')[0], 
        fullName: formData.fullName, username: formData.username,
        code: formData.code, email: formData.email,
        departmentId: parseInt(formData.departmentId) || 0, 
        phoneNumber: formData.phoneNumber, password: formData.password,
        role: roleDbMapping[role] 
      };

      const response = await fetch("http://smartattend456-001-site1.qtempurl.com/api/Auth/Register", {
        method: "POST", headers: { "Content-Type": "application/json", "accept": "*/*" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        let errorMsg = "Registration failed.";
        try {
          const errorData = await response.json();
          if (errorData.errors) errorMsg = Object.values(errorData.errors).flat().join(" | ");
          else if (errorData.title) errorMsg = errorData.title;
        } catch (e) { errorMsg = await response.text(); }
        throw new Error(errorMsg);
      }

      setSuccessMessage("Account created successfully! Redirecting...");
      setTimeout(() => router.push("/login"), 2000);
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-6 transition-colors duration-300">
      <div className="absolute top-8 left-8 rtl:left-auto rtl:right-8 z-10">
        <Link href="/" className="flex items-center gap-3 px-5 py-3 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:text-blue-900 dark:hover:text-blue-400 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-800 text-[10px] font-black uppercase tracking-widest transition-all">
          <FontAwesomeIcon icon={faHome} className="text-sm" />
          <span className="hidden sm:inline">Back to Home</span>
        </Link>
      </div>

      <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl p-8 md:p-12 border border-gray-100 dark:border-gray-800 transition-colors animate-in fade-in zoom-in-95 duration-500 mt-12 md:mt-0">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-blue-900 dark:bg-blue-600 text-white rounded-[1.5rem] flex items-center justify-center font-black italic text-xl shadow-xl mb-4">HTI</div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Create an Account</h1>
        </div>

        {/* ADMIN TAB COMPLETELY REMOVED */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl mb-8">
          {[
            { id: "student", icon: faUserGraduate, label: "Student" },
            { id: "teacher", icon: faChalkboardTeacher, label: "Teacher" }
          ].map((tab) => (
            <button
              key={tab.id} onClick={() => { setRole(tab.id as Role); setErrorMessage(null); }}
              className={`flex-1 flex flex-col items-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                role === tab.id ? "bg-white dark:bg-gray-900 text-blue-900 dark:text-blue-400 shadow-md" : "text-gray-400 dark:text-gray-500"
              }`}
            >
              <FontAwesomeIcon icon={tab.icon} className="text-lg" /> {tab.label}
            </button>
          ))}
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400">
            <FontAwesomeIcon icon={faExclamationTriangle} className="shrink-0" />
            <p className="text-[10px] font-bold uppercase tracking-widest">{errorMessage}</p>
          </div>
        )}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50 rounded-2xl flex items-center gap-3 text-green-600 dark:text-green-400">
            <FontAwesomeIcon icon={faCheckCircle} className="shrink-0" />
            <p className="text-[10px] font-bold uppercase tracking-widest">{successMessage}</p>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="ms-2 text-[10px] font-black uppercase tracking-widest text-gray-400">Full Name</label>
              <input required name="fullName" value={formData.fullName} onChange={handleChange} type="text" className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl text-sm font-bold outline-none text-gray-900 dark:text-white" />
            </div>
            <div className="space-y-1">
              <label className="ms-2 text-[10px] font-black uppercase tracking-widest text-gray-400">Username</label>
              <input required name="username" value={formData.username} onChange={handleChange} type="text" className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl text-sm font-bold outline-none text-gray-900 dark:text-white" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="ms-2 text-[10px] font-black uppercase tracking-widest text-gray-400">Email Address</label>
              <input required name="email" value={formData.email} onChange={handleChange} type="email" className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl text-sm font-bold outline-none text-gray-900 dark:text-white" />
            </div>
            <div className="space-y-1">
              <label className="ms-2 text-[10px] font-black uppercase tracking-widest text-gray-400">Phone Number</label>
              <input required name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} type="tel" pattern="^01([0-9]{9})" maxLength={11} className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl text-sm font-bold outline-none text-gray-900 dark:text-white" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="ms-2 text-[10px] font-black uppercase tracking-widest text-gray-400">{role === "student" ? "Student ID" : "Teacher Code"}</label>
            <input required name="code" value={formData.code} onChange={handleChange} type="text" className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl text-sm font-bold outline-none text-gray-900 dark:text-white" />
          </div>
          <div className="space-y-1">
            <label className="ms-2 text-[10px] font-black uppercase tracking-widest text-gray-400">Department</label>
            <select required name="departmentId" value={formData.departmentId} onChange={handleChange} className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl text-sm font-bold outline-none text-gray-900 dark:text-white">
              <option value="" disabled>Select Department</option>
              <option value="1">Electrical Engineering</option>
              <option value="2">Mechanical Engineering</option>
              <option value="3">Civil Engineering</option>
              <option value="4">Computer Science</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="ms-2 text-[10px] font-black uppercase tracking-widest text-gray-400">Password</label>
            <input required name="password" value={formData.password} onChange={handleChange} type="password" className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl text-sm font-bold outline-none text-gray-900 dark:text-white" />
          </div>
          <button type="submit" disabled={isLoading} className="w-full py-5 mt-6 bg-blue-900 dark:bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all">
            {isLoading ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : "Create Account"}
          </button>
        </form>
        <div className="mt-8 text-center">
          <Link href="/login" className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-blue-900 dark:hover:text-blue-400 transition-colors">
            <FontAwesomeIcon icon={faArrowLeft} className="me-2 rtl:rotate-180" /> Already have an account? Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}