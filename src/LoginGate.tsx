import React, { useEffect, useState } from "react";
import { Lock, LogIn } from "lucide-react";
import { auth, login as loginRequest, AuthUser } from "./lib/auth";

interface Props {
  children: React.ReactNode;
}

export default function LoginGate({ children }: Props) {
  const [user, setUser] = useState<AuthUser | null>(() => auth.getUser());

  useEffect(() => {
    const handler = () => setUser(null);
    window.addEventListener("auth:expired", handler);
    return () => window.removeEventListener("auth:expired", handler);
  }, []);

  if (!user) {
    return <LoginForm onLoggedIn={setUser} />;
  }

  return <>{children}</>;
}

function LoginForm({ onLoggedIn }: { onLoggedIn: (u: AuthUser) => void }) {
  const [username, setUsername] = useState("admin@example.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await loginRequest(username, password);
      onLoggedIn(user);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      <div className="absolute inset-0 -z-10 opacity-40 [background:radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.25),transparent_60%),radial-gradient(circle_at_70%_80%,rgba(236,72,153,0.2),transparent_60%)]" />
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">NexusDash</h1>
            <p className="text-sm text-slate-400">QA automation dashboard</p>
          </div>
        </div>

        <label className="block mb-4">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Email / username</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            required
            className="mt-2 w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-white/10 outline-none focus:border-indigo-400 transition-colors"
          />
        </label>

        <label className="block mb-6">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-2 w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-white/10 outline-none focus:border-indigo-400 transition-colors"
          />
        </label>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 hover:from-indigo-400 hover:to-fuchsia-400 font-bold uppercase tracking-widest text-sm shadow-lg shadow-indigo-500/30 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <LogIn className="w-4 h-4" />
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <p className="text-xs text-slate-500 mt-6 text-center">
          Default admin: <span className="text-slate-300 font-mono">admin@example.com / admin123</span>
        </p>
      </form>
    </div>
  );
}
