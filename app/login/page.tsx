"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faEnvelope, faSpinner, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
// UPDATED IMPORT PATH
import { authenticateUser } from "@/lib/actions/auth"; 

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  const result = await authenticateUser(email, password);

  if (result.success) {
  
    localStorage.setItem("userRole", result.role as string);
    localStorage.setItem("userName", result.name as string);
    localStorage.setItem("userDept", (result as any).department);
    router.push(`/dashboard/${result.role}`);
  } else {
    
    setError(result.message || "An error occurred during login.");
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-blue-900 tracking-tight text-center">HTI Portal</h2>
          <p className="text-gray-500 mt-2">6th of October City Campus</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center gap-3">
            <FontAwesomeIcon icon={faExclamationCircle} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">University Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <FontAwesomeIcon icon={faEnvelope} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-900 outline-none transition"
                placeholder="name@hti.edu.eg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <FontAwesomeIcon icon={faLock} />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-900 outline-none transition"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-900 text-white py-3 rounded-xl font-bold text-lg hover:bg-blue-800 transition shadow-lg flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : "Login to Portal"}
          </button>
        </form>
      </div>
    </div>
  );
}