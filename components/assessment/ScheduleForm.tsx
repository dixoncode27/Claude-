"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const TIME_OPTIONS = [
  { value: "morning", label: "Morning (Before Noon)" },
  { value: "afternoon", label: "Afternoon (12pm–5pm)" },
  { value: "evening", label: "Evening (After 5pm)" },
  { value: "flexible", label: "Flexible — Any Time" },
];

export default function ScheduleForm() {
  const router = useRouter();
  const [leadId, setLeadId] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [preferredTime, setPreferredTime] = useState("flexible");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const id = sessionStorage.getItem("tbwr_lead_id");
    if (!id) {
      router.replace("/assessment");
    } else {
      setLeadId(id);
    }
  }, [router]);

  function toggleDay(day: string) {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  async function handleSubmit() {
    if (selectedDays.length === 0) {
      setError("Please select at least one preferred day.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/submit-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId,
          days: selectedDays,
          preferredTime,
          notes,
        }),
      });

      if (!res.ok) {
        throw new Error("Submission failed");
      }

      router.push("/confirmation");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-tbwr-black pt-24 pb-16 px-4">
      <div className="max-w-xl mx-auto">
        <div className="mb-10">
          <div className="w-10 h-1 bg-tbwr-gold mb-6" />
          <span className="text-xs font-bold uppercase tracking-widest text-tbwr-gold block mb-3">
            Availability
          </span>
          <h1 className="tbwr-heading-lg text-tbwr-white mb-4">
            Select Your Preferred Days
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            Let us know when your athlete is available. A TBWR coach will follow up
            within one business day to confirm your session.
          </p>
        </div>

        {/* Day Selection */}
        <div className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
            Preferred Days
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {DAYS.map((day) => {
              const selected = selectedDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`py-3 px-4 text-sm font-bold uppercase tracking-widest border transition-all duration-150 text-left ${
                    selected
                      ? "border-tbwr-gold bg-[#0d0900] text-tbwr-white"
                      : "border-[#333] bg-[#0a0a0a] text-gray-400 hover:border-[#555]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 border flex-shrink-0 flex items-center justify-center transition-colors ${
                        selected
                          ? "border-tbwr-gold bg-tbwr-gold"
                          : "border-[#555]"
                      }`}
                    >
                      {selected && (
                        <svg className="w-2.5 h-2.5 text-tbwr-black" viewBox="0 0 10 10" fill="none">
                          <path
                            d="M2 5l2.5 2.5 4-4"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                    {day}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Preference */}
        <div className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
            Preferred Time of Day
          </h2>
          <div className="flex flex-col gap-2">
            {TIME_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPreferredTime(opt.value)}
                className={`py-3 px-4 text-sm font-bold border transition-all duration-150 text-left ${
                  preferredTime === opt.value
                    ? "border-tbwr-gold bg-[#0d0900] text-tbwr-white"
                    : "border-[#333] bg-[#0a0a0a] text-gray-400 hover:border-[#555]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Additional Notes */}
        <div className="mb-8">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-3">
            Additional Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full bg-[#111] border border-[#444] text-tbwr-white px-4 py-3 text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-tbwr-gold focus:border-transparent resize-none"
            placeholder="Any scheduling constraints, questions, or context for the coach..."
          />
        </div>

        {error && (
          <div className="border border-red-500 bg-red-900/20 p-4 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <Button
          variant="primary"
          size="lg"
          fullWidth
          loading={isSubmitting}
          onClick={handleSubmit}
        >
          Confirm Availability →
        </Button>
      </div>
    </div>
  );
}
