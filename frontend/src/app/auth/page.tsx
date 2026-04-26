"use client";
import { API_URL } from "@/lib/config";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";

const ParticleBackground = dynamic(() => import("@/components/ParticleBackground"), { ssr: false });
import { AlertCircle, Lock } from "lucide-react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  
  // Secure Form State Mapping
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [college_org, setCollegeOrg] = useState("");
  
  // UX Interaction State
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastLogin, setLastLogin] = useState<string | null>(null);

  useEffect(() => {
    localStorage.removeItem("dataset_active");
    localStorage.removeItem("user_token"); 
    
    const ll = localStorage.getItem("last_login_timestamp");
    if (ll) setLastLogin(ll);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Invalid login credentials received from database.");
      }

      const data = await res.json();
      localStorage.setItem("user_token", data.access_token);
      localStorage.setItem("last_login_timestamp", new Date().toLocaleString());
      
      window.location.href = "/dashboard";
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const passPolicy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passPolicy.test(password)) {
         throw new Error("Security Error: Passwords must be 8+ characters, including at least 1 uppercase letter, 1 number, and 1 special symbol (@$!%*?&).");
      }

      const payload = {
        name,
        email,
        password,
        college_org: college_org || null
      };

      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Underlying architectural registration node strictly failed.");
      }

      setIsLogin(true);
      setErrorMsg("");
      setPassword("");
      
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <main className="relative min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
          <ParticleBackground />
      </div>

      {/* Premium Centered Card Authentication Gate */}
      <div className="relative z-10 w-full max-w-md glass-panel-cyber rounded-2xl overflow-hidden shadow-2xl border border-blue-500/20 flex flex-col p-8 bg-black/60 backdrop-blur-xl">
        
        {/* Branding Node */}
        <div className="flex flex-col items-center justify-center mb-8 relative">
           <div className="absolute -top-10 bg-blue-500/10 w-32 h-32 rounded-full blur-3xl pointer-events-none"></div>
           <Lock className="w-8 h-8 text-slate-300 mb-3" />
           <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-200 to-blue-400 mb-2 z-10 text-center tracking-tight">AutoAnalytica</h1>
           <p className="text-slate-400 text-sm text-center z-10 max-w-[250px]">
             Secure Enterprise Intelligence Gateway.
           </p>

           {lastLogin && (
             <div className="mt-4 px-3 py-1.5 border border-blue-500/20 rounded-md bg-white/5 flex text-center opacity-80 mt-4">
                <span className="text-xs font-mono text-blue-400 truncate tracking-tighter">Last Login: {lastLogin}</span>
             </div>
           )}
        </div>

        {/* Form Toggle Tabs */}
        <div className="flex w-full mb-6 p-1 bg-black/40 rounded-lg border border-white/5">
          <button 
            className={`flex-1 py-2 text-center transition text-sm font-semibold rounded-md uppercase tracking-wider ${isLogin ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            onClick={() => { setIsLogin(true); setErrorMsg(""); }}
          >
            Access Node
          </button>
          <button 
            className={`flex-1 py-2 text-center transition text-sm font-semibold rounded-md uppercase tracking-wider ${!isLogin ? 'bg-slate-700 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            onClick={() => { setIsLogin(false); setErrorMsg(""); }}
          >
            Register
          </button>
        </div>

        {/* Form Engine */}
        <div className="flex-1">
          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 flex gap-3 items-center bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-medium p-3 rounded-lg"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p>{errorMsg}</p>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.form 
                key="login"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col gap-4"
                onSubmit={handleLogin}
              >
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-blue-400 font-bold uppercase tracking-widest pl-1">Authorized Email</label>
                  <input type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} className="bg-black/40 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500 transition shadow-inner" placeholder="scientist@enterprise.com"/>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-end pl-1 pr-1">
                     <label className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Secure Pass-Key</label>
                     <a href="#" className="text-[10px] text-slate-400 hover:text-blue-400 transition">Forgot Key?</a>
                  </div>
                  <input type="password" required value={password} onChange={(e)=>setPassword(e.target.value)} className="bg-black/40 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500 transition shadow-inner" placeholder="••••••••"/>
                </div>

                <button type="submit" disabled={loading} className="mt-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-blue-500/25 transition-all text-sm tracking-wide disabled:opacity-50">
                  {loading ? "Authenticating Token..." : "Initialize Session"}
                </button>
              </motion.form>
            ) : (
              <motion.form 
                key="register"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col gap-4"
                onSubmit={handleRegister}
              >
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pl-1">Identity Alias</label>
                  <input type="text" required value={name} onChange={(e)=>setName(e.target.value)} className="bg-black/40 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-slate-400 transition shadow-inner" placeholder="Alan Turing"/>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pl-1">Email Address</label>
                  <input type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} className="bg-black/40 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-slate-400 transition shadow-inner" placeholder="alan@cambridge.edu"/>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pl-1">Enterprise / Cluster</label>
                  <input type="text" value={college_org} onChange={(e)=>setCollegeOrg(e.target.value)} className="bg-black/40 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-slate-400 transition shadow-inner" placeholder="Optional Organization"/>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pl-1">Secure Pass-Key</label>
                  <input type="password" required value={password} onChange={(e)=>setPassword(e.target.value)} className="bg-black/40 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-slate-400 transition shadow-inner" placeholder="Strong password"/>
                </div>

                <button type="submit" disabled={loading} className="mt-4 bg-slate-700 text-white font-bold py-3 rounded-lg shadow-md hover:bg-slate-600 transition-all text-sm tracking-wide disabled:opacity-50">
                   {loading ? "Allocating Framework..." : "Establish Pipeline"}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

      </div>
    </main>
  );
}
