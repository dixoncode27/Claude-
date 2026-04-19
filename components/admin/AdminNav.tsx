"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/athletes", label: "Athletes" },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="w-60 flex-shrink-0 bg-[#080808] border-r border-[#1a1a1a] flex flex-col min-h-screen">
      <div className="px-6 py-5 border-b border-[#1a1a1a] flex items-center gap-3">
        <div className="w-8 h-8 bg-tbwr-gold flex items-center justify-center flex-shrink-0">
          <span className="text-tbwr-black font-black text-xs">TW</span>
        </div>
        <div>
          <div className="font-black text-xs uppercase tracking-widest text-tbwr-white">
            TBWR
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
            Admin
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-3 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors",
                isActive
                  ? "bg-tbwr-gold text-tbwr-black"
                  : "text-gray-500 hover:text-tbwr-white hover:bg-[#111]"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-[#1a1a1a]">
        <button
          onClick={handleSignOut}
          className="w-full px-3 py-2.5 text-xs font-bold uppercase tracking-widest text-gray-600 hover:text-red-400 transition-colors text-left"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
