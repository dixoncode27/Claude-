"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { RoutingResult } from "@/types";
import {
  ROUTE_LABELS,
  ROUTE_DESCRIPTIONS,
  ROUTE_NEXT_STEPS,
  PATHWAY_LABELS,
  PATHWAY_DESCRIPTIONS,
} from "@/lib/routing/logic";

export default function ResultPage() {
  const router = useRouter();
  const [routingResult, setRoutingResult] = useState<RoutingResult | null>(null);
  const [athleteName, setAthleteName] = useState("");

  useEffect(() => {
    const stored = sessionStorage.getItem("tbwr_routing");
    const name = sessionStorage.getItem("tbwr_athlete_name");
    if (!stored) {
      router.replace("/assessment");
      return;
    }
    setRoutingResult(JSON.parse(stored));
    setAthleteName(name || "Your Athlete");
  }, [router]);

  if (!routingResult) {
    return (
      <div className="min-h-screen bg-tbwr-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-tbwr-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const routeLabel = ROUTE_LABELS[routingResult.route];
  const routeDesc = ROUTE_DESCRIPTIONS[routingResult.route];
  const nextSteps = ROUTE_NEXT_STEPS[routingResult.route];
  const pathwayLabel = PATHWAY_LABELS[routingResult.pathway];
  const pathwayDesc = PATHWAY_DESCRIPTIONS[routingResult.pathway];

  const isPremium = routingResult.route === "premium-entry";
  const isNurture = routingResult.route === "not-ready";

  return (
    <div className="min-h-screen bg-tbwr-black pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <div className="w-12 h-1 bg-tbwr-gold mb-6" />
          <p className="text-xs font-bold uppercase tracking-widest text-tbwr-gold mb-3">
            Assessment Complete
          </p>
          <h1 className="tbwr-heading-lg text-tbwr-white mb-4">
            {athleteName}&apos;s Result
          </h1>
          <p className="text-gray-400">
            Based on your assessment, here is the recommended entry point and program pathway.
          </p>
        </div>

        {/* Route Result Card */}
        <div
          className={`border-2 p-8 mb-6 ${
            isPremium
              ? "border-tbwr-gold bg-[#0d0900]"
              : isNurture
              ? "border-[#333] bg-[#080808]"
              : "border-[#444] bg-[#080808]"
          }`}
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-tbwr-gold block mb-2">
                Entry Route
              </span>
              <h2 className="tbwr-heading-md text-tbwr-white">{routeLabel}</h2>
            </div>
            {isPremium && (
              <span className="flex-shrink-0 bg-tbwr-gold text-tbwr-black text-xs font-black uppercase tracking-widest px-3 py-1">
                Recommended
              </span>
            )}
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">{routeDesc}</p>
        </div>

        {/* Pathway Card */}
        <div className="border border-[#2a2a2a] bg-[#060606] p-8 mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500 block mb-2">
            Program Pathway
          </span>
          <h3 className="tbwr-heading-sm text-tbwr-gold mb-3">{pathwayLabel}</h3>
          <p className="text-gray-400 text-sm leading-relaxed">{pathwayDesc}</p>
        </div>

        {/* Next Steps */}
        <div className="mb-10">
          <h3 className="text-xs font-bold uppercase tracking-widest text-tbwr-white mb-5">
            Your Next Steps
          </h3>
          <div className="flex flex-col gap-3">
            {nextSteps.map((step, i) => (
              <div key={i} className="flex items-start gap-4 p-4 border border-[#2a2a2a] bg-[#080808]">
                <span className="text-tbwr-gold font-black text-sm flex-shrink-0 w-6">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-gray-300 text-sm">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        {!isNurture ? (
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/schedule"
              className="flex-1 inline-flex items-center justify-center bg-tbwr-gold text-tbwr-black font-black uppercase tracking-widest text-sm px-6 py-4 hover:bg-yellow-400 transition-colors"
            >
              Select Availability →
            </Link>
          </div>
        ) : (
          <div className="border border-[#2a2a2a] p-6 text-center">
            <p className="text-gray-400 text-sm mb-4">
              We will send you development resources and follow up when your athlete
              is ready to begin the program.
            </p>
            <Link
              href="/"
              className="text-xs font-bold uppercase tracking-widest text-tbwr-gold hover:underline"
            >
              Return to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
