"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Coach, SessionType, Pathway } from "@/types";
import Button from "@/components/ui/Button";

const SESSION_TYPES: SessionType[] = ["practice", "evaluation", "competition", "private"];
const PATHWAYS = [
  { value: "", label: "All Pathways" },
  { value: "little-champs", label: "Little Champs" },
  { value: "world-team", label: "World Team" },
  { value: "future-olympians", label: "Future Olympians" },
];

export default function SessionForm({
  coaches,
}: {
  coaches: Pick<Coach, "id" | "first_name" | "last_name">[];
}) {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("60");
  const [type, setType] = useState<SessionType>("practice");
  const [pathway, setPathway] = useState("");
  const [coachId, setCoachId] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!date) e.date = "Required";
    if (!time) e.time = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_date: date,
          start_time: time,
          duration_min: parseInt(duration),
          session_type: type,
          pathway: pathway || null,
          coach_id: coachId || null,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/admin/sessions/${data.session.id}`);
    } catch {
      alert("Failed to create session.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-600">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-[#111] border border-[#444] text-tbwr-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-tbwr-gold"
          />
          {errors.date && <p className="text-xs text-red-400">{errors.date}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-600">Start Time</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full bg-[#111] border border-[#444] text-tbwr-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-tbwr-gold"
          />
          {errors.time && <p className="text-xs text-red-400">{errors.time}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-600">Duration (min)</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full bg-[#111] border border-[#444] text-tbwr-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-tbwr-gold"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-600">Session Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as SessionType)}
            className="w-full bg-[#111] border border-[#444] text-tbwr-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-tbwr-gold"
          >
            {SESSION_TYPES.map((t) => (
              <option key={t} value={t} className="bg-tbwr-charcoal capitalize">{t}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-black uppercase tracking-widest text-gray-600">Coach</label>
        <select
          value={coachId}
          onChange={(e) => setCoachId(e.target.value)}
          className="w-full bg-[#111] border border-[#444] text-tbwr-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-tbwr-gold"
        >
          <option value="" className="bg-tbwr-charcoal">Select Coach</option>
          {coaches.map((c) => (
            <option key={c.id} value={c.id} className="bg-tbwr-charcoal">
              {c.first_name} {c.last_name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-black uppercase tracking-widest text-gray-600">Pathway</label>
        <select
          value={pathway}
          onChange={(e) => setPathway(e.target.value)}
          className="w-full bg-[#111] border border-[#444] text-tbwr-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-tbwr-gold"
        >
          {PATHWAYS.map((p) => (
            <option key={p.value} value={p.value} className="bg-tbwr-charcoal">{p.label}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-black uppercase tracking-widest text-gray-600">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full bg-[#111] border border-[#444] text-tbwr-white px-3 py-2.5 text-sm placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-tbwr-gold resize-none"
        />
      </div>

      <Button variant="primary" size="md" loading={isSaving} onClick={handleSubmit}>
        Create Session
      </Button>
    </div>
  );
}
