"use client";

import { useRouter } from "next/navigation";
import type { Attendance, AttendanceStatus } from "@/types";
import { formatDate } from "@/lib/utils";

const STATUS_STYLES: Record<AttendanceStatus, string> = {
  present: "bg-green-900 text-green-300 border-green-700",
  absent: "bg-red-900 text-red-300 border-red-700",
  excused: "bg-yellow-900 text-yellow-300 border-yellow-700",
  late: "bg-orange-900 text-orange-300 border-orange-700",
};

export default function AttendanceTracker({
  athleteId,
  records,
}: {
  athleteId: string;
  records: Attendance[];
}) {
  const router = useRouter();
  const total = records.length;
  const present = records.filter((r) => r.status === "present" || r.status === "late").length;
  const rate = total > 0 ? Math.round((present / total) * 100) : 0;

  async function updateStatus(attendanceId: string, status: AttendanceStatus) {
    await fetch(`/api/admin/attendance/${attendanceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.refresh();
  }

  return (
    <div className="border border-[#2a2a2a] bg-[#0a0a0a]">
      <div className="px-6 py-4 border-b border-[#2a2a2a] flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-widest text-tbwr-gold">
          Attendance
        </span>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-500">
            {present}/{total} sessions
          </span>
          <span className={`text-sm font-black ${rate >= 80 ? "text-green-400" : rate >= 60 ? "text-yellow-400" : "text-red-400"}`}>
            {rate}%
          </span>
        </div>
      </div>

      {/* Rate bar */}
      <div className="px-6 py-3 border-b border-[#1a1a1a]">
        <div className="h-1.5 bg-[#1a1a1a] w-full">
          <div
            className={`h-full transition-all duration-500 ${rate >= 80 ? "bg-green-500" : rate >= 60 ? "bg-yellow-500" : "bg-red-500"}`}
            style={{ width: `${rate}%` }}
          />
        </div>
      </div>

      <div className="divide-y divide-[#1a1a1a] max-h-72 overflow-y-auto">
        {records.length === 0 && (
          <div className="px-6 py-8 text-center text-gray-600 text-sm">
            No sessions recorded yet
          </div>
        )}
        {records.map((record) => (
          <div key={record.id} className="px-6 py-3 flex items-center justify-between gap-4">
            <div>
              <div className="text-sm text-gray-300 font-medium">
                {record.session
                  ? formatDate(record.session.session_date)
                  : "Session"}
              </div>
              {record.session && (
                <div className="text-xs text-gray-600 capitalize">
                  {record.session.session_type}
                </div>
              )}
            </div>
            <select
              value={record.status}
              onChange={(e) => updateStatus(record.id, e.target.value as AttendanceStatus)}
              className={`text-[10px] font-black uppercase tracking-widest border px-2 py-1 bg-transparent cursor-pointer ${STATUS_STYLES[record.status as AttendanceStatus]}`}
            >
              {(["present", "absent", "excused", "late"] as AttendanceStatus[]).map((s) => (
                <option key={s} value={s} className="bg-tbwr-charcoal text-white">
                  {s}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
