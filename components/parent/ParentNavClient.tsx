"use client";

import { createClient } from "@/lib/supabase/client";

export default function ParentNavClient() {
  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/parent/login";
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-tbwr-gold transition-colors"
    >
      Sign Out
    </button>
  );
}
