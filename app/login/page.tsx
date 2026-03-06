"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faLock, faSpinner, faArrowLeft, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

// Import your mock users to validate credentials locally
import { MOCK_USERS } from "@/lib/mockUsers";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate a network delay for realism
    setTimeout(() => {
      // 1. Find the user in our local mock data
      const user = MOCK_USERS.find(
        (u) => u.email.toLowerCase() === username.toLowerCase() && u.password === password
      );

      if (user) {
        // 2. Clear old data and save new session info
        localStorage.clear();
        localStorage.setItem("userEmail", user.email);
        localStorage.setItem("userRole", user.role);
        localStorage.setItem("userDept", user.department);
        localStorage.setItem("userName", user.name);

        // 3. Redirect based on role
        router.push(`/dashboard/${user.role}`);
      } else {
        setError("Invalid email or password. Please try again.");
        setIsLoading(false);
      }
    }, 1000); 
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-500">
        
        <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-blue-900 transition mb-6 group">
          <FontAwesomeIcon icon={faArrowLeft} className="group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        <header className="text-center space-y-2">
          <div className="w-20 h-20 bg-blue-900 text-white rounded-[2rem] flex items-center justify-center mx-auto text-3xl shadow-lg mb-4">
            <span className="font-black italic text-2xl">HTI</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Welcome back!</h1>
          <p className="text-gray-400 text-xs font-medium">Enter your academic credentials</p>
        </header>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold animate-shake">
                <FontAwesomeIcon icon={faExclamationCircle} />
                {error}
              </div>
            )}

            <div className="relative group">
              <FontAwesomeIcon icon={faUser} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-900 transition-colors" />
              <input 
                type="text" 
                required
                placeholder="Email (e.g., student1@hti.edu.eg)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-14 pr-6 py-5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-900 transition-all font-medium"
              />
            </div>

            <div className="relative group">
              <FontAwesomeIcon icon={faLock} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-900 transition-colors" />
              <input 
                type="password" 
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-14 pr-6 py-5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-900 transition-all font-medium"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-5 bg-blue-900 text-white rounded-2xl font-black shadow-lg hover:bg-blue-800 transition-all flex items-center justify-center gap-3 disabled:opacity-70 active:scale-95"
          >
            {isLoading ? (
              <FontAwesomeIcon icon={faSpinner} spin />
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <footer className="text-center pt-4 border-t border-gray-50 mt-4">
          <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] leading-relaxed">
            HTI Academic Portal • v2.0
          </p>
        </footer>
      </div>
    </div>
  );
}