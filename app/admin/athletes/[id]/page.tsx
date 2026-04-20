import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Athlete, Coach, CoachNote, Attendance, Pathway } from "@/types";
import { formatDate, calculateAge } from "@/lib/utils";
import { PATHWAY_LABELS, PATHWAY_DESCRIPTIONS } from "@/lib/routing/logic";
import CoachNotes from "@/components/admin/CoachNotes";
import AttendanceTracker from "@/components/admin/AttendanceTracker";
import AthleteAdminActions from "@/components/admin/AthleteAdminActions";

export const dynamic = "force-dynamic";

export default async function AthleteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [athleteRes, notesRes, attendanceRes, coachesRes] = await Promise.all([
    supabase
      .from("athletes")
      .select("*, coach:coaches(*)")
      .eq("id", id)
      .single(),
    supabase
      .from("coach_notes")
      .select("*")
      .eq("athlete_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("attendance")
      .select("*, session:sessions(*)")
      .eq("athlete_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("coaches")
      .select("id, first_name, last_name")
      .eq("is_active", true),
  ]);

  if (athleteRes.error || !athleteRes.data) notFound();

  const athlete = athleteRes.data as Athlete;
  const notes = (notesRes.data ?? []) as CoachNote[];
  const attendance = (attendanceRes.data ?? []) as Attendance[];
  const coaches = (coachesRes.data ?? []) as Pick<Coach, "id" | "first_name" | "last_name">[];

  return (
    <div className="p-8">
      <div className="flex items-center gap-2 mb-8">
        <Link href="/admin/athletes" className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-tbwr-gold transition-colors">
          Athletes
        </Link>
        <span className="text-gray-600">→</span>
        <span className="text-xs font-bold uppercase tracking-widest text-tbwr-white">
          {athlete.first_name} {athlete.last_name}
        </span>
      </div>

      <div className="flex items-start justify-between gap-6 mb-8 flex-wrap">
        <div>
          <h1 className="tbwr-heading-md text-tbwr-white mb-1">
            {athlete.first_name} {athlete.last_name}
          </h1>
          <p className="text-gray-500 text-sm">
            {calculateAge(athlete.date_of_birth)} years old ·{" "}
            {athlete.gender} · Joined {formatDate(athlete.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black uppercase tracking-widest bg-tbwr-gold text-tbwr-black px-3 py-1.5">
            {PATHWAY_LABELS[athlete.pathway as Pathway]}
          </span>
          <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 border ${
            athlete.status === "active"
              ? "border-green-700 text-green-400"
              : athlete.status === "on-hold"
              ? "border-yellow-700 text-yellow-400"
              : "border-gray-700 text-gray-500"
          }`}>
            {athlete.status}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Pathway */}
          <div className="border border-tbwr-gold/30 bg-[#0a0800] p-6">
            <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Current Pathway</div>
            <h3 className="tbwr-heading-sm text-tbwr-gold mb-2">{PATHWAY_LABELS[athlete.pathway as Pathway]}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {PATHWAY_DESCRIPTIONS[athlete.pathway as Pathway]}
            </p>
            {/* Phase 3: Add skill progression ladder here */}
          </div>

          {/* Attendance */}
          <AttendanceTracker athleteId={athlete.id} records={attendance} />

          {/* Notes */}
          <CoachNotes athleteId={athlete.id} notes={notes} />
        </div>

        <div className="flex flex-col gap-6">
          {/* Profile */}
          <DetailCard title="Athlete Profile">
            <DataRow label="Full Name" value={`${athlete.first_name} ${athlete.last_name}`} />
            <DataRow label="Date of Birth" value={athlete.date_of_birth} />
            <DataRow label="Age" value={`${calculateAge(athlete.date_of_birth)} years old`} />
            <DataRow label="Gender" value={athlete.gender} />
            {athlete.weight_class && (
              <DataRow label="Weight Class" value={athlete.weight_class} />
            )}
          </DetailCard>

          {/* Coach */}
          <DetailCard title="Assigned Coach">
            {athlete.coach ? (
              <>
                <DataRow
                  label="Coach"
                  value={`${(athlete.coach as unknown as Coach).first_name} ${(athlete.coach as unknown as Coach).last_name}`}
                />
                <Link
                  href={`/admin/coaches/${athlete.coach_id}`}
                  className="text-xs font-bold uppercase tracking-widest text-tbwr-gold hover:underline"
                >
                  View Coach Profile →
                </Link>
              </>
            ) : (
              <p className="text-gray-600 text-sm">No coach assigned</p>
            )}
          </DetailCard>

          {/* Emergency Contact */}
          {athlete.emergency_contact_name && (
            <DetailCard title="Emergency Contact">
              <DataRow label="Name" value={athlete.emergency_contact_name} />
              <DataRow label="Phone" value={athlete.emergency_contact_phone} />
            </DetailCard>
          )}

          {/* Admin Actions */}
          <AthleteAdminActions athlete={athlete} coaches={coaches} />
        </div>
      </div>
    </div>
  );
}

function DetailCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-[#2a2a2a] bg-[#0a0a0a]">
      <div className="px-6 py-4 border-b border-[#2a2a2a]">
        <span className="text-xs font-bold uppercase tracking-widest text-tbwr-gold">{title}</span>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 mb-4 last:mb-0">
      <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">{label}</span>
      <span className="text-sm text-gray-200 capitalize">{value}</span>
    </div>
  );
}
