"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Athlete, Attendance, AttendanceStatus } from "@/types";

const STATUS_STYLES: Record<AttendanceStatus, string> = {
  present: "bg-green-900 text-green-300 border-green-700",
  absent: "bg-red-900 text-red-300 border-red-700",
  excused: "bg-yellow-900 text-yellow-300 border-yellow-700",
  late: "bg-orange-900 text-orange-300 border-orange-700",
};

export default function SessionAttendance({
  sessionId,
  attendance,
  allAthletes,
}: {
  sessionId: string;
  attendance: (Attendance & { athlete: Pick<Athlete, "id" | "first_name" | "last_name"> })[];
  allAthletes: Pick<Athlete, "id" | "first_name" | "last_name">[];
}) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [selectedAthleteId, setSelectedAthleteId] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const presentIds = new Set(attendance.map((a) => a.athlete?.id));
  const available = allAthletes.filter((a) => !presentIds.has(a.id));

  async function addAthlete() {
    if (!selectedAthleteId) return;
    setIsSaving(true);
    try {
      await fetch("/api/admin/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, athlete_id: selectedAthleteId, status: "present" }),
      });
      setSelectedAthleteId("");
      setIsAdding(false);
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }

  async function updateStatus(attendanceId: string, status: AttendanceStatus) {
    await fetch(`/api/admin/attendance/${attendanceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.refresh();
  }

  async function removeAttendance(attendanceId: string) {
    await fetch(`/api/admin/attendance/${attendanceId}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="border border-[#2a2a2a] bg-[#0a0a0a]">
      <div className="px-6 py-4 border-b border-[#2a2a2a] flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-widest text-tbwr-gold">Attendance</span>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-tbwr-gold transition-colors"
        >
          {isAdding ? "Cancel" : "+ Add Athlete"}
        </button>
      </div>

      {isAdding && available.length > 0 && (
        <div className="px-6 py-4 border-b border-[#1a1a1a] flex gap-3">
          <select
            value={selectedAthleteId}
            onChange={(e) => setSelectedAthleteId(e.target.value)}
            className="flex-1 bg-[#111] border border-[#444] text-tbwr-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tbwr-gold"
          >
            <option value="" className="bg-tbwr-charcoal">Select Athlete</option>
            {available.map((a) => (
              <option key={a.id} value={a.id} className="bg-tbwr-charcoal">
                {a.first_name} {a.last_name}
              </option>
            ))}
          </select>
          <button
            onClick={addAthlete}
            disabled={!selectedAthleteId || isSaving}
            className="text-xs font-black uppercase tracking-widest bg-tbwr-gold text-tbwr-black px-4 py-2 hover:bg-yellow-400 disabled:opacity-50"
          >
            Add
          </button>
        </div>
      )}

      <div className="divide-y divide-[#1a1a1a]">
        {attendance.length === 0 && (
          <div className="px-6 py-10 text-center text-gray-600 text-sm">No attendance recorded</div>
        )}
        {attendance.map((record) => (
          <div key={record.id} className="px-6 py-4 flex items-center justify-between gap-4">
            <span className="text-sm font-bold text-tbwr-white">
              {record.athlete?.first_name} {record.athlete?.last_name}
            </span>
            <div className="flex items-center gap-3">
              <select
                value={record.status}
                onChange={(e) => updateStatus(record.id, e.target.value as AttendanceStatus)}
                className={`text-[10px] font-black uppercase tracking-widest border px-2 py-1 bg-transparent cursor-pointer ${STATUS_STYLES[record.status as AttendanceStatus]}`}
              >
                {(["present", "absent", "excused", "late"] as AttendanceStatus[]).map((s) => (
                  <option key={s} value={s} className="bg-tbwr-charcoal text-white">{s}</option>
                ))}
              </select>
              <button
                onClick={() => removeAttendance(record.id)}
                className="text-[10px] text-gray-700 hover:text-red-400 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
