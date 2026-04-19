import Link from "next/link";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#1a1a1a] bg-tbwr-black/95 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-tbwr-gold flex items-center justify-center">
            <span className="text-tbwr-black font-black text-xs leading-none">TW</span>
          </div>
          <span className="font-black text-sm uppercase tracking-widest text-tbwr-white group-hover:text-tbwr-gold transition-colors">
            TBWR
          </span>
        </Link>

        <Link
          href="/assessment"
          className="text-xs font-bold uppercase tracking-widest text-tbwr-black bg-tbwr-gold px-4 py-2 hover:bg-yellow-400 transition-colors"
        >
          Start Assessment
        </Link>
      </div>
    </header>
  );
}
