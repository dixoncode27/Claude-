import Link from "next/link";
import ParentNavClient from "@/components/parent/ParentNavClient";

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-tbwr-black">
      <header className="border-b border-[#1a1a1a] bg-tbwr-black/95 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/parent" className="flex items-center gap-3">
            <div className="w-7 h-7 bg-tbwr-gold flex items-center justify-center">
              <span className="text-tbwr-black font-black text-xs">TW</span>
            </div>
            <span className="font-black text-xs uppercase tracking-widest text-tbwr-white">TBWR</span>
          </Link>
          <ParentNavClient />
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-10">{children}</main>
    </div>
  );
}
