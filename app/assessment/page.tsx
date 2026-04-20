import type { Metadata } from "next";
import Link from "next/link";
import AssessmentFlow from "@/components/assessment/AssessmentFlow";

export const metadata: Metadata = {
  title: "Athlete Assessment — TBWR",
  description: "Complete your athlete assessment to receive a personalized pathway recommendation.",
};

export default function AssessmentPage() {
  return (
    <div className="bg-tbwr-black min-h-screen">
      {/* Minimal header for assessment focus */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#1a1a1a] bg-tbwr-black/95 backdrop-blur-sm">
        <div className="max-w-xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-7 h-7 bg-tbwr-gold flex items-center justify-center">
              <span className="text-tbwr-black font-black text-xs">TW</span>
            </div>
            <span className="font-black text-xs uppercase tracking-widest text-tbwr-white">
              TBWR
            </span>
          </Link>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-600">
            Athlete Assessment
          </span>
        </div>
      </header>

      <AssessmentFlow />
    </div>
  );
}
