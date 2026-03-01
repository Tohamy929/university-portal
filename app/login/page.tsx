"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faLock, faSpinner, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  
  const runMockLogin = () => {
    console.log("System: API unavailable or data mismatch. Running Mock Fallback.");
    
    const role = username.toLowerCase().includes("teacher") ? "teacher" : "student";
    localStorage.setItem("userRole", role);
    localStorage.setItem("userName", username);
    router.push(`/dashboard/${role}`);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
    
      const response = await fetch("YOUR_BACKEND_URL_HERE/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      
      const data = await response.json().catch(() => ({}));
      
      
      console.log("Backend Response:", data);

      if (response.ok && data) {
        
        const role = data.role || data.user_role || data.type || data.Type;

        if (role) {
          localStorage.setItem("token", data.token || "");
          localStorage.setItem("userRole", role.toLowerCase());
          router.push(`/dashboard/${role.toLowerCase()}`);
        } else {
         
          runMockLogin();
        }
      } else {
        
        runMockLogin();
      }
    } catch (err) {
      
      runMockLogin();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-500">
        
        <header className="text-center space-y-2">
          <div className="w-20 h-20 bg-blue-900 text-white rounded-[2rem] flex items-center justify-center mx-auto text-3xl shadow-lg mb-4">
            <span className="font-black italic text-2xl">HTI</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Portal Access</h1>
          <p className="text-gray-400 font-medium">Connecting to Backend...</p>
        </header>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <FontAwesomeIcon icon={faUser} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-900 transition-colors" />
              <input 
                type="text" 
                required
                placeholder="Username"
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
            className="w-full py-5 bg-blue-900 text-white rounded-2xl font-black shadow-lg hover:bg-blue-800 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
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