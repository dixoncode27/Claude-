"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Lead } from "@/types";

export default function ConvertToAthleteButton({ lead }: { lead: Lead }) {
  const router = useRouter();
  const [isConverting, setIsConverting] = useState(false);

  if (lead.converted_to_athlete && lead.athlete_id) {
    return (
      <a
        href={`/admin/athletes/${lead.athlete_id}`}
        className="w-full inline-flex items-center justify-center border border-tbwr-gold text-tbwr-gold font-black uppercase tracking-widest text-xs px-4 py-2.5 hover:bg-tbwr-gold hover:text-tbwr-black transition-colors"
      >
        View Athlete Profile →
      </a>
    );
  }

  async function handleConvert() {
    if (!confirm("Convert this lead to a full athlete profile?")) return;
    setIsConverting(true);
    try {
      const res = await fetch("/api/admin/convert-to-athlete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: lead.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/admin/athletes/${data.athleteId}`);
    } catch (err) {
      alert("Conversion failed. Please try again.");
    } finally {
      setIsConverting(false);
    }
  }

  return (
    <button
      onClick={handleConvert}
      disabled={isConverting}
      className="w-full inline-flex items-center justify-center bg-tbwr-gold text-tbwr-black font-black uppercase tracking-widest text-xs px-4 py-2.5 hover:bg-yellow-400 transition-colors disabled:opacity-50"
    >
      {isConverting ? "Converting..." : "Convert to Athlete"}
    </button>
  );
}
