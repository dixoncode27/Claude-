import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Session, Athlete, Attendance, AttendanceStatus } from "@/types";
import { formatDate } from "@/lib/utils";
import SessionAttendance from "@/components/admin/SessionAttendance";

export const dynamic = "force-dynamic";

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [sessionRes, attendanceRes, allAthletesRes] = await Promise.all([
    supabase.from("sessions").select("*, coach:coaches(first_name, last_name)").eq("id", id).single(),
    supabase.from("attendance").select("*, athlete:athletes(id, first_name, last_name)").eq("session_id", id),
    supabase.from("athletes").select("id, first_name, last_name").eq("status", "active").order("first_name"),
  ]);

  if (sessionRes.error || !sessionRes.data) notFound();

  const session = sessionRes.data as Session & { coach: { first_name: string; last_name: string } | null };
  const attendance = (attendanceRes.data ?? []) as (Attendance & { athlete: Pick<Athlete, "id" | "first_name" | "last_name"> })[];
  const allAthletes = (allAthletesRes.data ?? []) as Pick<Athlete, "id" | "first_name" | "last_name">[];

  return (
    <div className="p-8">
      <div className="flex items-center gap-2 mb-8">
        <Link href="/admin/sessions" className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-tbwr-gold transition-colors">Sessions</Link>
        <span className="text-gray-600">→</span>
        <span className="text-xs font-bold uppercase tracking-widest text-tbwr-white">
          {formatDate(session.session_date)}
        </span>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="tbwr-heading-md text-tbwr-white mb-1">
            {formatDate(session.session_date)}
          </h1>
          <p className="text-gray-500 text-sm">
            {session.start_time?.slice(0, 5)} · {session.duration_min} min ·{" "}
            <span className="capitalize">{session.session_type}</span>
            {session.coach && ` · ${session.coach.first_name} ${session.coach.last_name}`}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-tbwr-gold">{attendance.length}</div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Athletes</div>
        </div>
      </div>

      {session.notes && (
        <div className="border border-[#2a2a2a] bg-[#0a0a0a] p-5 mb-6">
          <p className="text-gray-400 text-sm">{session.notes}</p>
        </div>
      )}

      <SessionAttendance
        sessionId={session.id}
        attendance={attendance}
        allAthletes={allAthletes}
      />
    </div>
  );
}
