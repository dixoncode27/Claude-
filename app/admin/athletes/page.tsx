import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Lead, Pathway } from "@/types";
import { formatDate, calculateAge } from "@/lib/utils";
import { PATHWAY_LABELS } from "@/lib/routing/logic";

export const dynamic = "force-dynamic";

export default async function AthletesPage() {
  const supabase = await createClient();

  // Athletes = leads that have been enrolled or converted
  const { data } = await supabase
    .from("leads")
    .select("*")
    .in("status", ["enrolled", "scheduled"])
    .order("created_at", { ascending: false });

  const athletes = (data ?? []) as Lead[];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="tbwr-heading-md text-tbwr-white mb-1">Athletes</h1>
        <p className="text-gray-500 text-sm">
          {athletes.length} enrolled or scheduled athletes
        </p>
      </div>

      {athletes.length === 0 ? (
        <div className="border border-[#2a2a2a] bg-[#0a0a0a] py-20 text-center">
          <p className="text-gray-600 text-sm mb-4">No athletes enrolled yet</p>
          <Link
            href="/admin/leads"
            className="text-xs font-bold uppercase tracking-widest text-tbwr-gold hover:underline"
          >
            View All Leads →
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {athletes.map((athlete) => (
            <Link
              key={athlete.id}
              href={`/admin/leads/${athlete.id}`}
              className="border border-[#2a2a2a] bg-[#0a0a0a] p-6 hover:border-tbwr-gold transition-colors group block"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-black text-tbwr-white text-base group-hover:text-tbwr-gold transition-colors">
                    {athlete.athlete_first_name} {athlete.athlete_last_name}
                  </h3>
                  <p className="text-gray-500 text-xs">
                    {calculateAge(athlete.athlete_dob)} years old · {athlete.athlete_gender}
                  </p>
                </div>
                <span className="flex-shrink-0 text-[10px] font-black uppercase tracking-widest bg-tbwr-gold text-tbwr-black px-2 py-1">
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
                  <span className="text-xs text-gray-300">
                    {athlete.assigned_coach || "Unassigned"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Parent</span>
                  <span className="text-xs text-gray-400">
                    {athlete.parent_first_name} {athlete.parent_last_name}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-[#1a1a1a] flex items-center justify-between">
                <span className="text-[10px] text-gray-600">
                  Joined {formatDate(athlete.created_at)}
                </span>
                {/* Phase 2: Show last session date, progression stage */}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Phase 2: Add full athlete profile pages with coach notes, attendance, progression */}
    </div>
  );
}
