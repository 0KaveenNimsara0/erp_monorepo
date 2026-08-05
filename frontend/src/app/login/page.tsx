"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  User,
  Lock,
  KeyRound,
  Delete,
  ArrowRight,
  Sparkles,
  Zap,
  AlertCircle,
  Keyboard
} from "lucide-react";
import { setAuthToken } from "@/lib/auth";
import { useToast } from "@/context/ToastContext";

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [role, setRole] = useState<'admin' | 'manager' | 'staff'>('staff');
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRoleChange = (r: 'admin' | 'manager' | 'staff') => {
    setRole(r)
    setError("")
    setPin("")
    setPassword("")
    toast.info(`Switched mode to ${r.toUpperCase()} login`)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (role === 'staff' && pin.length !== 6) {
      const msg = "Please enter a complete 6-digit staff PIN."
      setError(msg)
      toast.warning(msg)
      return
    }

    if ((role === 'admin' || role === 'manager') && (!username.trim() || !password)) {
      const msg = "Please enter your username and password."
      setError(msg)
      toast.warning(msg)
      return
    }

    setLoading(true);

    try {
      const loginType = role === 'staff' ? 'pin' : 'password';
      const payload = loginType === 'password' 
        ? { loginType, username, password }
        : { loginType, pin };

      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data: any = {}
      try {
        data = await res.json()
      } catch {
        data = {}
      }

      if (!res.ok) {
        let errMessage = data.error || data.messages?.error || data.message
        if (!errMessage || errMessage === '401' || res.status === 401) {
          errMessage = role === 'staff' 
            ? 'Invalid 6-digit staff PIN code. Please try again.' 
            : 'Invalid username or password. Please try again.'
        }
        toast.error(errMessage)
        return
      }

      setAuthToken(data.token);
      toast.success(`Welcome back! Authenticated as ${role.toUpperCase()}. Redirecting...`);
      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
    } catch (err: any) {
      const msg = err.message || "Failed to connect to authentication API";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handlePinClick = (num: string) => {
    if (pin.length < 6) {
      setPin(prev => prev + num);
    }
  };

  const handlePinDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  useEffect(() => {
    if (role !== 'staff') return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is focused on an input element elsewhere
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault()
        setPin((prev) => (prev.length < 6 ? prev + e.key : prev))
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault()
        setPin((prev) => prev.slice(0, -1))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [role])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-indigo-600/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-blue-600/20 rounded-full blur-[128px] pointer-events-none" />

      {/* Main Glass Login Card */}
      <div className="max-w-md w-full glass-panel p-8 rounded-3xl space-y-6 border border-slate-800/80 shadow-2xl relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/25">
              <Zap className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">NEXUS ERP</span>
          </Link>
          <p className="text-xs text-slate-400">Sign in to access your enterprise session</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800">
          {(['admin', 'manager', 'staff'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => handleRoleChange(r)}
              className={`py-2 text-xs font-bold rounded-xl transition capitalize ${
                role === r
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleLogin}>
          {(role === 'admin' || role === 'manager') && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400">Username</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Enter username..."
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="Enter password..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>
            </>
          )}

          {role === 'staff' && (
            <div className="space-y-3">
              <div className="text-center space-y-1">
                <label className="text-xs font-bold text-slate-300 block">
                  Enter 6-Digit Staff PIN
                </label>
                <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-medium">
                  <Keyboard className="w-3 h-3 text-indigo-400" />
                  <span>Physical Keyboard / Numpad Supported</span>
                </div>
              </div>
              
              {/* PIN Display */}
              <div className="flex justify-center">
                <div className="text-xl font-mono tracking-[0.6em] text-center border-b-2 border-indigo-500/50 w-48 py-1.5 text-indigo-400 font-bold">
                  {pin.padEnd(6, '•').substring(0, 6)}
                </div>
              </div>

              {/* Numeric Keypad */}
              <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto pt-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handlePinClick(num.toString())}
                    className="p-3.5 text-base font-bold bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-white transition active:scale-95"
                  >
                    {num}
                  </button>
                ))}
                <div className="col-start-2">
                  <button
                    type="button"
                    onClick={() => handlePinClick('0')}
                    className="w-full p-3.5 text-base font-bold bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-white transition active:scale-95"
                  >
                    0
                  </button>
                </div>
                <div className="col-start-3">
                  <button
                    type="button"
                    onClick={handlePinDelete}
                    className="w-full p-3.5 text-base font-bold bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 rounded-xl transition flex items-center justify-center active:scale-95"
                  >
                    ⌫
                  </button>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-extrabold text-xs tracking-wider uppercase transition shadow-lg flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-indigo-600/25 disabled:opacity-40 disabled:cursor-not-allowed mt-4"
          >
            <span>{loading ? "Authenticating..." : "Sign In to ERP"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 text-center">
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-300 transition">
            &larr; Back to Control Center
          </Link>
        </div>
      </div>
    </div>
  );
}
