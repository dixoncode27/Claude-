import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Athlete, Pathway } from "@/types";
import { calculateAge } from "@/lib/utils";
import { PATHWAY_LABELS, PATHWAY_DESCRIPTIONS } from "@/lib/routing/logic";

export const dynamic = "force-dynamic";

export default async function ParentDashboard() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/parent/login");

  // Load parent profile and linked athletes
  const { data: profile } = await supabase
    .from("parent_profiles")
    .select("*, parent_athletes(athlete:athletes(*, coach:coaches(first_name, last_name)))")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-1 bg-tbwr-gold mx-auto mb-6" />
        <h1 className="tbwr-heading-md text-tbwr-white mb-4">Profile Not Set Up</h1>
        <p className="text-gray-500 text-sm max-w-sm mx-auto">
          Your parent profile hasn&apos;t been configured yet. Please contact TBWR staff to complete your setup.
        </p>
      </div>
    );
  }

  const athletes: Athlete[] = (profile.parent_athletes ?? [])
    .map((pa: { athlete: Athlete }) => pa.athlete)
    .filter(Boolean);

  return (
    <div>
      <div className="mb-10">
        <div className="w-10 h-1 bg-tbwr-gold mb-6" />
        <span className="tbwr-label block mb-3">Parent Portal</span>
        <h1 className="tbwr-heading-lg text-tbwr-white">
          Welcome,{" "}
          <span className="text-tbwr-gold">{profile.first_name}</span>
        </h1>
      </div>

      {athletes.length === 0 ? (
        <div className="border border-[#2a2a2a] bg-[#0a0a0a] py-16 text-center">
          <p className="text-gray-600 text-sm">No athletes linked to your account yet.</p>
        </div>
      ) : (
        <>
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-5">
            Your {athletes.length === 1 ? "Athlete" : "Athletes"}
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            {athletes.map((athlete) => (
              <Link
                key={athlete.id}
                href={`/parent/athlete/${athlete.id}`}
                className="border border-[#2a2a2a] bg-[#0a0a0a] p-6 hover:border-tbwr-gold transition-colors group block"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-black text-tbwr-white text-lg group-hover:text-tbwr-gold transition-colors">
                      {athlete.first_name} {athlete.last_name}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {calculateAge(athlete.date_of_birth)} years old
                    </p>
                  </div>
                  <span className={`flex-shrink-0 text-[10px] font-black uppercase tracking-widest px-2 py-1 ${
                    athlete.status === "active"
                      ? "bg-green-900 text-green-300"
                      : "bg-gray-800 text-gray-500"
                  }`}>
                    {athlete.status}
                  </span>
                </div>

                <div className="border border-tbwr-gold/20 bg-[#0a0800] p-4 mb-4">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1">Pathway</div>
                  <div className="font-black text-sm uppercase tracking-wide text-tbwr-gold">
                    {PATHWAY_LABELS[athlete.pathway as Pathway]}
                  </div>
                </div>

                {athlete.coach && (
                  <div className="text-sm text-gray-400">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600 block mb-1">Coach</span>
                    {(athlete.coach as unknown as { first_name: string; last_name: string }).first_name}{" "}
                    {(athlete.coach as unknown as { first_name: string; last_name: string }).last_name}
                  </div>
                )}

                <div className="pt-4 mt-4 border-t border-[#1a1a1a]">
                  <span className="text-xs font-bold uppercase tracking-widest text-tbwr-gold">
                    View Profile →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
