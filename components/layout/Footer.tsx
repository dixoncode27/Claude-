export default function Footer() {
  return (
    <footer className="border-t border-[#1a1a1a] bg-tbwr-black py-12">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-7 h-7 bg-tbwr-gold flex items-center justify-center">
                <span className="text-tbwr-black font-black text-xs leading-none">TW</span>
              </div>
              <span className="font-black text-sm uppercase tracking-widest">TBWR</span>
            </div>
            <p className="text-gray-500 text-sm max-w-xs">
              The Best Wrestler — premium youth wrestling development in Reno/Sparks, Nevada.
            </p>
          </div>

          <div className="flex flex-col gap-1 text-right">
            <span className="text-xs font-bold uppercase tracking-widest text-tbwr-gold">
              Reno / Sparks, Nevada
            </span>
            {/* Phase 2: Add contact info, social links */}
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#1a1a1a] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-xs">
            © {new Date().getFullYear()} TBWR. All rights reserved.
          </p>
          <p className="text-gray-700 text-xs uppercase tracking-widest font-bold">
            Where champions are developed
          </p>
        </div>
      </div>
    </footer>
  );
}
