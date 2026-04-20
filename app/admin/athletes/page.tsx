import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Athlete, Coach, Pathway } from "@/types";
import { formatDate, calculateAge } from "@/lib/utils";
import { PATHWAY_LABELS } from "@/lib/routing/logic";

export const dynamic = "force-dynamic";

export default async function AthletesPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("athletes")
    .select("*, coach:coaches(first_name, last_name)")
    .order("created_at", { ascending: false });

  const athletes = (data ?? []) as (Athlete & { coach: Pick<Coach, "first_name" | "last_name"> | null })[];

  const active = athletes.filter((a) => a.status === "active").length;
  const byPathway = (p: Pathway) => athletes.filter((a) => a.pathway === p).length;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="tbwr-heading-md text-tbwr-white mb-1">Athletes</h1>
          <p className="text-gray-500 text-sm">{athletes.length} total · {active} active</p>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {([
          ["little-champs", "Little Champs"],
          ["world-team", "World Team"],
          ["future-olympians", "Future Olympians"],
        ] as [Pathway, string][]).map(([p, label]) => (
          <div key={p} className="border border-[#2a2a2a] bg-[#0a0a0a] p-4 text-center">
            <div className="text-2xl font-black text-tbwr-gold mb-1">{byPathway(p)}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      {athletes.length === 0 ? (
        <div className="border border-[#2a2a2a] bg-[#0a0a0a] py-20 text-center">
          <p className="text-gray-600 text-sm mb-4">No athletes yet</p>
          <Link href="/admin/leads" className="text-xs font-bold uppercase tracking-widest text-tbwr-gold hover:underline">
            Convert a Lead to Athlete →
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {athletes.map((athlete) => (
            <Link
              key={athlete.id}
              href={`/admin/athletes/${athlete.id}`}
              className="border border-[#2a2a2a] bg-[#0a0a0a] p-6 hover:border-tbwr-gold transition-colors group block"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-black text-tbwr-white text-base group-hover:text-tbwr-gold transition-colors">
                    {athlete.first_name} {athlete.last_name}
                  </h3>
                  <p className="text-gray-500 text-xs">
                    {calculateAge(athlete.date_of_birth)} yrs · {athlete.gender}
                    {athlete.weight_class && ` · ${athlete.weight_class}`}
                  </p>
                </div>
                <span className={`flex-shrink-0 text-[10px] font-black uppercase tracking-widest px-2 py-1 ${
                  athlete.status === "active"
                    ? "bg-green-900 text-green-300"
                    : athlete.status === "on-hold"
                    ? "bg-yellow-900 text-yellow-300"
                    : "bg-gray-800 text-gray-500"
                }`}>
                  {athlete.status}
                </span>
              </div>

              <div className="flex flex-col gap-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Pathway</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-tbwr-gold">
                    {PATHWAY_LABELS[athlete.pathway as Pathway]}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Coach</span>
                  <span className="text-xs text-gray-400">
                    {athlete.coach
                      ? `${athlete.coach.first_name} ${athlete.coach.last_name}`
                      : "Unassigned"}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-[#1a1a1a]">
                <span className="text-[10px] text-gray-600">Since {formatDate(athlete.created_at)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
