import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Confirmed — TBWR",
  description: "Your assessment is complete. A coach will follow up within one business day.",
};

export default function ConfirmationPage() {
  return (
    <div className="bg-tbwr-black min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#1a1a1a] bg-tbwr-black/95 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-7 h-7 bg-tbwr-gold flex items-center justify-center">
              <span className="text-tbwr-black font-black text-xs">TW</span>
            </div>
            <span className="font-black text-xs uppercase tracking-widest text-tbwr-white">
              TBWR
            </span>
          </Link>
        </div>
      </header>

      <div className="min-h-screen pt-24 pb-16 px-4 flex items-center">
        <div className="max-w-xl mx-auto w-full">

          {/* Success Icon */}
          <div className="w-16 h-16 border-2 border-tbwr-gold flex items-center justify-center mb-8">
            <svg
              className="w-8 h-8 text-tbwr-gold"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div className="w-10 h-[2px] bg-tbwr-gold mb-6" />
          <span className="tbwr-label block mb-3">Submission Complete</span>
          <h1 className="tbwr-heading-lg text-tbwr-white mb-6">
            You&apos;re In<br />
            <span className="text-tbwr-gold">The System</span>
          </h1>
          <p className="text-gray-400 leading-relaxed mb-10">
            Your assessment has been received and your athlete&apos;s pathway has been
            assigned. A TBWR coach will follow up within one business day to
            confirm your session details.
          </p>

          {/* What Happens Next */}
          <div className="border border-[#2a2a2a] bg-[#080808] mb-10">
            <div className="px-6 py-4 border-b border-[#2a2a2a]">
              <span className="text-xs font-bold uppercase tracking-widest text-tbwr-gold">
                What Happens Next
              </span>
            </div>
            <div className="px-6 py-5 flex flex-col gap-5">
              {[
                {
                  step: "01",
                  title: "Coach Review",
                  body: "A TBWR coach will review your assessment and availability within 24 hours.",
                },
                {
                  step: "02",
                  title: "Confirmation Call or Message",
                  body: "We will reach out to confirm your first session date and any questions you have.",
                },
                {
                  step: "03",
                  title: "Day One",
                  body: "Your athlete arrives, meets the coaches, and begins their TBWR development.",
                },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-4">
                  <span className="text-tbwr-gold font-black text-sm flex-shrink-0">
                    {item.step}
                  </span>
                  <div>
                    <p className="font-bold text-sm uppercase tracking-wide text-tbwr-white mb-1">
                      {item.title}
                    </p>
                    <p className="text-gray-400 text-sm">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/"
            className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-tbwr-gold transition-colors"
          >
            ← Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
