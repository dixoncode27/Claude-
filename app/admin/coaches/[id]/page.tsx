import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Coach, Athlete, Pathway } from "@/types";
import { calculateAge } from "@/lib/utils";
import { PATHWAY_LABELS } from "@/lib/routing/logic";
import CoachForm from "@/components/admin/CoachForm";

export const dynamic = "force-dynamic";

export default async function CoachDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [coachRes, athletesRes] = await Promise.all([
    supabase.from("coaches").select("*").eq("id", id).single(),
    supabase
      .from("athletes")
      .select("id, first_name, last_name, date_of_birth, pathway, status")
      .eq("coach_id", id)
      .order("first_name"),
  ]);

  if (coachRes.error || !coachRes.data) notFound();

  const coach = coachRes.data as Coach;
  const athletes = (athletesRes.data ?? []) as Pick<Athlete, "id" | "first_name" | "last_name" | "date_of_birth" | "pathway" | "status">[];

  return (
    <div className="p-8">
      <div className="flex items-center gap-2 mb-8">
        <Link href="/admin/coaches" className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-tbwr-gold transition-colors">
          Coaches
        </Link>
        <span className="text-gray-600">→</span>
        <span className="text-xs font-bold uppercase tracking-widest text-tbwr-white">
          {coach.first_name} {coach.last_name}
        </span>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="tbwr-heading-md text-tbwr-white mb-1">
            {coach.first_name} {coach.last_name}
          </h1>
          <p className="text-gray-500 text-sm">{coach.email}</p>
        </div>
        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 ${
          coach.is_active ? "bg-green-900 text-green-300" : "bg-gray-800 text-gray-500"
        }`}>
          {coach.is_active ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Edit form */}
        <div className="border border-[#2a2a2a] bg-[#0a0a0a]">
          <div className="px-6 py-4 border-b border-[#2a2a2a]">
            <span className="text-xs font-bold uppercase tracking-widest text-tbwr-gold">Coach Profile</span>
          </div>
          <div className="px-6 py-5">
            <CoachForm coach={coach} />
          </div>
        </div>

        {/* Assigned athletes */}
        <div className="border border-[#2a2a2a] bg-[#0a0a0a]">
          <div className="px-6 py-4 border-b border-[#2a2a2a] flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-tbwr-gold">
              Assigned Athletes
            </span>
            <span className="text-xs text-gray-600">{athletes.length}</span>
          </div>
          <div className="divide-y divide-[#1a1a1a]">
            {athletes.length === 0 && (
              <div className="px-6 py-10 text-center text-gray-600 text-sm">
                No athletes assigned
              </div>
            )}
            {athletes.map((a) => (
              <Link
                key={a.id}
                href={`/admin/athletes/${a.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-[#111] transition-colors group"
              >
                <div>
                  <div className="text-sm font-bold text-tbwr-white group-hover:text-tbwr-gold transition-colors">
                    {a.first_name} {a.last_name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {calculateAge(a.date_of_birth)} yrs · {PATHWAY_LABELS[a.pathway as Pathway]}
                  </div>
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 ${
                  a.status === "active" ? "bg-green-900 text-green-300" : "bg-gray-800 text-gray-500"
                }`}>
                  {a.status}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
