"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faExclamationTriangle, faHome } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // 1. CALL LOGIN API
      const loginResponse = await fetch("/api-proxy/Auth/Login", {
  method: "POST",
  headers: { "Content-Type": "application/json", "accept": "*/*" },
  body: JSON.stringify({ username, password })
});

      if (!loginResponse.ok) {
        const errorText = await loginResponse.text(); 
        throw new Error(`Login Failed (${loginResponse.status}): ${errorText || "Invalid username or password."}`);
      }

      // Read the response from the server
      const responseText = await loginResponse.text();
      let data;
      try {
         data = JSON.parse(responseText);
      } catch (err) {
         // Sometimes ASP.NET backends return the token as a plain string, not JSON!
         data = { token: responseText }; 
      }

      // Check all common ways a backend might name the token variable
      const token = data.jwtToken || data.token || data.jwt || data.accessToken || data.data?.token || (typeof data === 'string' ? data : null);
      
      if (!token || token === "undefined") {
        console.error("Backend Response:", data);
        throw new Error("Login succeeded, but no Token was found in the response! Check the browser console.");
      }

      // Save token securely
      localStorage.setItem("authToken", token);

      // 2. GET USER INFO
      const userInfoResponse = await fetch("/api-proxy/Auth/GetUserInfo", {
        method: "GET",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "accept": "*/*" 
        }
      });

      if (!userInfoResponse.ok) {
        const errorText = await userInfoResponse.text();
        throw new Error(`GetUserInfo Failed (${userInfoResponse.status}): The server rejected the token. Details: ${errorText}`);
      }

      const userInfo = await userInfoResponse.json();
      
      // Attempt to extract the role safely
      const userRole = (userInfo.role || userInfo.roles?.[0] || "student").toLowerCase();
      
      localStorage.setItem("userEmail", userInfo.email || username); 
      localStorage.setItem("userRole", userRole);
      const realId = userInfo.id || userInfo.studentId || userInfo.userId || "";
      localStorage.setItem("userId", realId.toString());
      // 3. DYNAMIC ROUTING
      if (userRole === "admin" || userRole === "administrator") {
        router.push("/dashboard/admin");
      } else if (userRole === "teacher") {
        router.push("/dashboard/teacher");
      } else {
        router.push("/dashboard/student");
      }

    } catch (error: any) {
      setErrorMessage(error.message);
      // Clear out the token if we hit a wall so we don't get stuck in a bad state
      localStorage.removeItem("authToken"); 
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

      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl p-10 border border-gray-100 dark:border-gray-800 transition-colors animate-in fade-in zoom-in-95 duration-500">
        
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-20 h-20 bg-blue-900 dark:bg-blue-600 text-white rounded-[2rem] flex items-center justify-center font-black italic text-2xl shadow-xl mb-6">HTI</div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Welcome Back</h1>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-2">Sign in to the HTI Portal</p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-2xl flex items-start gap-3 text-red-600 dark:text-red-400">
            <FontAwesomeIcon icon={faExclamationTriangle} className="mt-1 shrink-0" />
            <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed break-words w-full">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleLogin}  autoComplete="off" className="space-y-6">
          <div className="space-y-2">
            <label className="ms-2 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Username</label>
            <input type="text" required value={username} autoComplete="new-password"  onChange={(e) => setUsername(e.target.value)} className="w-full p-5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-900 dark:focus:border-blue-500 rounded-2xl text-sm font-bold outline-none text-gray-900 dark:text-white transition-all" />
          </div>

          <div className="space-y-2">
            <label className="ms-2 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Password</label>
            <input type="password" required value={password} autoComplete="new-password" onChange={(e) => setPassword(e.target.value)} className="w-full p-5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-900 dark:focus:border-blue-500 rounded-2xl text-sm font-bold outline-none text-gray-900 dark:text-white transition-all" />
          </div>

          <button type="submit" disabled={isLoading} className="w-full py-5 mt-4 bg-blue-900 dark:bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 flex justify-center items-center gap-3">
            {isLoading ? <><FontAwesomeIcon icon={faSpinner} className="animate-spin" /> Authenticating...</> : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}