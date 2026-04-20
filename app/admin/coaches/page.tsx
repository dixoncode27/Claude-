import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Coach } from "@/types";

export const dynamic = "force-dynamic";

export default async function CoachesPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("coaches")
    .select("*, athlete_count:athletes(count)")
    .order("created_at", { ascending: false });

  const coaches = (data ?? []) as (Coach & { athlete_count: { count: number }[] })[];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="tbwr-heading-md text-tbwr-white mb-1">Coaches</h1>
          <p className="text-gray-500 text-sm">{coaches.length} coaches</p>
        </div>
        <Link
          href="/admin/coaches/new"
          className="text-xs font-black uppercase tracking-widest bg-tbwr-gold text-tbwr-black px-4 py-2.5 hover:bg-yellow-400 transition-colors"
        >
          + Add Coach
        </Link>
      </div>

      {coaches.length === 0 ? (
        <div className="border border-[#2a2a2a] bg-[#0a0a0a] py-20 text-center">
          <p className="text-gray-600 text-sm mb-4">No coaches added yet</p>
          <Link href="/admin/coaches/new" className="text-xs font-bold uppercase tracking-widest text-tbwr-gold hover:underline">
            Add First Coach →
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {coaches.map((coach) => {
            const athleteCount = coach.athlete_count?.[0]?.count ?? 0;
            return (
              <Link
                key={coach.id}
                href={`/admin/coaches/${coach.id}`}
                className="border border-[#2a2a2a] bg-[#0a0a0a] p-6 hover:border-tbwr-gold transition-colors group block"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-black text-tbwr-white text-base group-hover:text-tbwr-gold transition-colors">
                      {coach.first_name} {coach.last_name}
                    </h3>
                    <p className="text-gray-500 text-xs">{coach.email}</p>
                  </div>
                  <span className={`flex-shrink-0 text-[10px] font-black uppercase tracking-widest px-2 py-1 ${
                    coach.is_active ? "bg-green-900 text-green-300" : "bg-gray-800 text-gray-500"
                  }`}>
                    {coach.is_active ? "Active" : "Inactive"}
                  </span>
                </div>

                {coach.bio && (
                  <p className="text-gray-500 text-xs leading-relaxed mb-4 line-clamp-2">{coach.bio}</p>
                )}

                {coach.specialties?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {coach.specialties.map((s) => (
                      <span key={s} className="text-[10px] font-bold uppercase tracking-widest text-gray-600 border border-[#333] px-2 py-0.5">
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                <div className="pt-4 border-t border-[#1a1a1a] flex items-center justify-between">
                  <span className="text-[10px] text-gray-600">{athleteCount} athlete{athleteCount !== 1 ? "s" : ""}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">View Profile →</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
