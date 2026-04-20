"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function ParentLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    window.location.href = "/parent";
  }

  return (
    <div className="min-h-screen bg-tbwr-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center gap-3 mb-12 justify-center">
          <div className="w-9 h-9 bg-tbwr-gold flex items-center justify-center">
            <span className="text-tbwr-black font-black text-sm">TW</span>
          </div>
          <span className="font-black uppercase tracking-widest text-tbwr-white">TBWR</span>
        </Link>

        <div className="mb-8 text-center">
          <h1 className="tbwr-heading-md text-tbwr-white mb-2">Parent Portal</h1>
          <p className="text-gray-500 text-sm">
            Sign in to view your athlete&apos;s progress and schedule
          </p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#111] border border-[#444] text-tbwr-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-tbwr-gold focus:border-transparent"
              required
              autoComplete="email"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#111] border border-[#444] text-tbwr-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-tbwr-gold focus:border-transparent"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="border border-red-500 bg-red-900/20 px-4 py-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-tbwr-gold text-tbwr-black font-black uppercase tracking-widest text-sm py-4 hover:bg-yellow-400 transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-gray-600 text-xs mt-6">
          Access is provided by TBWR staff.{" "}
          <Link href="/assessment" className="text-tbwr-gold hover:underline">
            New? Start here.
          </Link>
        </p>
      </div>
    </div>
  );
}
