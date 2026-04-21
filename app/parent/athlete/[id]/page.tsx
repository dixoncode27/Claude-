import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import type { Athlete, CoachNote, Attendance, Pathway, Skill, AthleteSkill, ProgressReport } from "@/types";
import { formatDate, calculateAge } from "@/lib/utils";
import { PATHWAY_LABELS, PATHWAY_DESCRIPTIONS } from "@/lib/routing/logic";

export const dynamic = "force-dynamic";

export default async function ParentAthletePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/parent/login");

  // Verify parent has access to this athlete via RLS
  const { data: athleteData, error } = await supabase
    .from("athletes")
    .select("*, coach:coaches(first_name, last_name)")
    .eq("id", id)
    .single();

  if (error || !athleteData) notFound();

  const athlete = athleteData as Athlete & { coach: { first_name: string; last_name: string } | null };

  const [notesRes, attendanceRes, skillsRes, athleteSkillsRes, reportsRes] = await Promise.all([
    supabase.from("coach_notes").select("*").eq("athlete_id", id).eq("is_visible_to_parent", true).order("created_at", { ascending: false }),
    supabase.from("attendance").select("*, session:sessions(session_date, session_type, duration_min)").eq("athlete_id", id).order("created_at", { ascending: false }).limit(20),
    supabase.from("skills").select("*").order("category").order("sort_order"),
    supabase.from("athlete_skills").select("*").eq("athlete_id", id),
    supabase.from("progress_reports").select("*").eq("athlete_id", id).eq("is_shared_with_parent", true).order("created_at", { ascending: false }),
  ]);

  const notes = (notesRes.data ?? []) as CoachNote[];
  const attendance = (attendanceRes.data ?? []) as Attendance[];
  const skills = (skillsRes.data ?? []) as Skill[];
  const athleteSkills = (athleteSkillsRes.data ?? []) as AthleteSkill[];
  const reports = (reportsRes.data ?? []) as ProgressReport[];
  const present = attendance.filter((a) => a.status === "present" || a.status === "late").length;
  const rate = attendance.length > 0 ? Math.round((present / attendance.length) * 100) : 0;

  return (
    <div>
      <div className="flex items-center gap-2 mb-8">
        <Link href="/parent" className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-tbwr-gold transition-colors">
          Dashboard
        </Link>
        <span className="text-gray-600">→</span>
        <span className="text-xs font-bold uppercase tracking-widest text-tbwr-white">
          {athlete.first_name} {athlete.last_name}
        </span>
      </div>

      <div className="flex items-start justify-between gap-6 mb-8 flex-wrap">
        <div>
          <h1 className="tbwr-heading-lg text-tbwr-white mb-1">
            {athlete.first_name}{" "}
            <span className="text-tbwr-gold">{athlete.last_name}</span>
          </h1>
          <p className="text-gray-500">
            {calculateAge(athlete.date_of_birth)} years old ·{" "}
            {athlete.gender}
          </p>
        </div>
        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 ${
          athlete.status === "active" ? "bg-green-900 text-green-300" : "bg-gray-800 text-gray-500"
        }`}>
          {athlete.status}
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Pathway */}
        <div className="border border-tbwr-gold/30 bg-[#0a0800] p-6">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-2">Current Pathway</div>
          <h2 className="tbwr-heading-sm text-tbwr-gold mb-3">
            {PATHWAY_LABELS[athlete.pathway as Pathway]}
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            {PATHWAY_DESCRIPTIONS[athlete.pathway as Pathway]}
          </p>
        </div>

        {/* Coach + Attendance summary */}
        <div className="flex flex-col gap-4">
          {athlete.coach && (
            <div className="border border-[#2a2a2a] bg-[#0a0a0a] p-5">
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-2">Coach</div>
              <div className="font-black text-tbwr-white text-base">
                {athlete.coach.first_name} {athlete.coach.last_name}
              </div>
            </div>
          )}
          <div className="border border-[#2a2a2a] bg-[#0a0a0a] p-5">
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-3">Attendance Rate</div>
            <div className="flex items-end gap-2 mb-2">
              <span className={`text-3xl font-black ${rate >= 80 ? "text-green-400" : rate >= 60 ? "text-yellow-400" : "text-red-400"}`}>
                {rate}%
              </span>
              <span className="text-gray-500 text-sm mb-1">{present}/{attendance.length} sessions</span>
            </div>
            <div className="h-1.5 bg-[#1a1a1a]">
              <div
                className={`h-full transition-all ${rate >= 80 ? "bg-green-500" : rate >= 60 ? "bg-yellow-500" : "bg-red-500"}`}
                style={{ width: `${rate}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Attendance */}
      {attendance.length > 0 && (
        <div className="border border-[#2a2a2a] bg-[#0a0a0a] mb-6">
          <div className="px-6 py-4 border-b border-[#2a2a2a]">
            <span className="text-xs font-bold uppercase tracking-widest text-tbwr-gold">Recent Sessions</span>
          </div>
          <div className="divide-y divide-[#1a1a1a]">
            {attendance.slice(0, 8).map((record) => (
              <div key={record.id} className="px-6 py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-300">
                    {record.session ? formatDate((record.session as { session_date: string }).session_date) : "Session"}
                  </div>
                  {record.session && (
                    <div className="text-xs text-gray-600 capitalize">
                      {(record.session as { session_type: string }).session_type} ·{" "}
                      {(record.session as { duration_min: number }).duration_min} min
                    </div>
                  )}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest border px-2 py-1 ${
                  record.status === "present"
                    ? "bg-green-900 text-green-300 border-green-700"
                    : record.status === "late"
                    ? "bg-orange-900 text-orange-300 border-orange-700"
                    : record.status === "excused"
                    ? "bg-yellow-900 text-yellow-300 border-yellow-700"
                    : "bg-red-900 text-red-300 border-red-700"
                }`}>
                  {record.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skill Progression (read-only) */}
      {skills.length > 0 && (
        <ParentSkillView skills={skills} athleteSkills={athleteSkills} />
      )}

      {/* Progress Reports (shared only) */}
      {reports.length > 0 && (
        <div className="border border-[#2a2a2a] bg-[#0a0a0a] mb-6">
          <div className="px-6 py-4 border-b border-[#2a2a2a]">
            <span className="text-xs font-bold uppercase tracking-widest text-tbwr-gold">Progress Reports</span>
          </div>
          <div className="divide-y divide-[#1a1a1a]">
            {reports.map((report) => (
              <div key={report.id} className="px-6 py-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-black uppercase tracking-widest text-tbwr-white text-sm">{report.period_label}</span>
                  <span className="text-[10px] text-gray-600">{formatDate(report.created_at)}</span>
                </div>
                {report.coach_name && (
                  <div className="text-xs text-gray-600 mb-3">{report.coach_name}</div>
                )}
                <p className="text-gray-300 text-sm leading-relaxed mb-3">{report.summary}</p>
                {(report.strengths || report.areas_to_improve) && (
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    {report.strengths && (
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-green-600 mb-1">Strengths</div>
                        <p className="text-gray-400 text-xs leading-relaxed">{report.strengths}</p>
                      </div>
                    )}
                    {report.areas_to_improve && (
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-yellow-700 mb-1">Focus Areas</div>
                        <p className="text-gray-400 text-xs leading-relaxed">{report.areas_to_improve}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Coach Notes (parent-visible only) */}
      <div className="border border-[#2a2a2a] bg-[#0a0a0a]">
        <div className="px-6 py-4 border-b border-[#2a2a2a]">
          <span className="text-xs font-bold uppercase tracking-widest text-tbwr-gold">
            Coach Updates
          </span>
        </div>
        {notes.length === 0 ? (
          <div className="px-6 py-10 text-center text-gray-600 text-sm">
            No updates from coaches yet
          </div>
        ) : (
          <div className="divide-y divide-[#1a1a1a]">
            {notes.map((note) => (
              <div key={note.id} className="px-6 py-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-tbwr-gold border border-yellow-800 px-2 py-0.5">
                    {note.note_type}
                  </span>
                  {note.coach_name && (
                    <span className="text-xs text-gray-600">{note.coach_name}</span>
                  )}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">{note.content}</p>
                <div className="text-[10px] text-gray-600 mt-2">{formatDate(note.created_at)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const DIFFICULTY_DOT: Record<string, string> = {
  beginner: "bg-blue-500",
  intermediate: "bg-yellow-500",
  advanced: "bg-red-500",
};

function ParentSkillView({ skills, athleteSkills }: { skills: Skill[]; athleteSkills: AthleteSkill[] }) {
  const skillMap = new Map(athleteSkills.map((as) => [as.skill_id, as.status]));
  const categories = Array.from(new Set(skills.map((s) => s.category)));
  const achieved = athleteSkills.filter((as) => as.status === "achieved").length;
  const inProgress = athleteSkills.filter((as) => as.status === "in_progress").length;

  return (
    <div className="border border-[#2a2a2a] bg-[#0a0a0a] mb-6">
      <div className="px-6 py-4 border-b border-[#2a2a2a] flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-widest text-tbwr-gold">Skill Progression</span>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span><span className="text-green-400 font-bold">{achieved}</span> achieved</span>
          <span><span className="text-tbwr-gold font-bold">{inProgress}</span> in progress</span>
        </div>
      </div>

      <div className="h-1 bg-[#1a1a1a]">
        <div
          className="h-full bg-green-500 transition-all"
          style={{ width: `${skills.length > 0 ? (achieved / skills.length) * 100 : 0}%` }}
        />
      </div>

      <div className="px-6 py-5 flex flex-col gap-5">
        {categories.map((category) => {
          const catSkills = skills.filter((s) => s.category === category);
          const catAchieved = catSkills.filter((s) => skillMap.get(s.id) === "achieved").length;
          return (
            <div key={category}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{category}</span>
                <span className="text-[10px] text-gray-700">{catAchieved}/{catSkills.length}</span>
              </div>
              <div className="flex flex-col gap-1">
                {catSkills.map((skill) => {
                  const status = skillMap.get(skill.id) ?? "not_started";
                  return (
                    <div key={skill.id} className={`flex items-center justify-between px-4 py-2 border text-sm ${
                      status === "achieved"    ? "border-green-800 bg-green-900/10 text-green-300" :
                      status === "in_progress" ? "border-yellow-800 bg-[#0d0900] text-tbwr-gold"  :
                                                 "border-[#1a1a1a] text-gray-600"
                    }`}>
                      <div className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${DIFFICULTY_DOT[skill.difficulty]}`} />
                        {skill.name}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        {status === "achieved" ? "✓ Achieved" : status === "in_progress" ? "In Progress" : ""}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
