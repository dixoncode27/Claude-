import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Lead, LeadStatus, RouteResult, Pathway } from "@/types";
import { formatDateTime } from "@/lib/utils";
import { ROUTE_LABELS, PATHWAY_LABELS } from "@/lib/routing/logic";

export const dynamic = "force-dynamic";

async function getDashboardData(supabase: Awaited<ReturnType<typeof createClient>>) {
  const [leadsResult, recentResult, athletesResult, coachesResult] = await Promise.all([
    supabase.from("leads").select("id, status, route_result, pathway, created_at"),
    supabase
      .from("leads")
      .select("id, parent_first_name, parent_last_name, athlete_first_name, athlete_last_name, route_result, pathway, status, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase.from("athletes").select("id, status", { count: "exact" }),
    supabase.from("coaches").select("id", { count: "exact" }).eq("is_active", true),
  ]);

  return {
    all: leadsResult.data as Pick<Lead, "id" | "status" | "route_result" | "pathway" | "created_at">[] | null,
    recent: recentResult.data as Partial<Lead>[] | null,
    athleteCount: athletesResult.count ?? 0,
    coachCount: coachesResult.count ?? 0,
  };
}

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { all, recent, athleteCount, coachCount } = await getDashboardData(supabase);

  const total = all?.length ?? 0;
  const byStatus = (status: LeadStatus) => all?.filter((l) => l.status === status).length ?? 0;
  const byRoute = (route: RouteResult) => all?.filter((l) => l.route_result === route).length ?? 0;
  const byPathway = (p: Pathway) => all?.filter((l) => l.pathway === p).length ?? 0;

  const stats = [
    { label: "Total Leads", value: total },
    { label: "Active Athletes", value: athleteCount },
    { label: "Active Coaches", value: coachCount },
    { label: "Enrolled", value: byStatus("enrolled") },
  ];

  const routeBreakdown = [
    { label: "Premium Entry", value: byRoute("premium-entry") },
    { label: "Standard Entry", value: byRoute("standard-entry") },
    { label: "Nurture Track", value: byRoute("not-ready") },
  ];

  const pathwayBreakdown = [
    { label: "Little Champs", value: byPathway("little-champs") },
    { label: "World Team", value: byPathway("world-team") },
    { label: "Future Olympians", value: byPathway("future-olympians") },
  ];

  return (
    <div className="p-8">
      <div className="mb-10">
        <h1 className="tbwr-heading-md text-tbwr-white mb-1">Dashboard</h1>
        <p className="text-gray-500 text-sm">TBWR Athlete Onboarding System</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => (
          <div key={s.label} className="border border-[#2a2a2a] bg-[#0a0a0a] p-5">
            <div className="text-3xl font-black text-tbwr-gold mb-1">{s.value}</div>
            <div className="text-xs font-bold uppercase tracking-widest text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-10">
        {/* Route Breakdown */}
        <div className="border border-[#2a2a2a] bg-[#0a0a0a]">
          <div className="px-6 py-4 border-b border-[#2a2a2a]">
            <span className="text-xs font-bold uppercase tracking-widest text-tbwr-gold">
              Entry Route Breakdown
            </span>
          </div>
          <div className="px-6 py-4 flex flex-col gap-4">
            {routeBreakdown.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm text-gray-300">{item.label}</span>
                <span className="text-lg font-black text-tbwr-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pathway Breakdown */}
        <div className="border border-[#2a2a2a] bg-[#0a0a0a]">
          <div className="px-6 py-4 border-b border-[#2a2a2a]">
            <span className="text-xs font-bold uppercase tracking-widest text-tbwr-gold">
              Pathway Breakdown
            </span>
          </div>
          <div className="px-6 py-4 flex flex-col gap-4">
            {pathwayBreakdown.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm text-gray-300">{item.label}</span>
                <span className="text-lg font-black text-tbwr-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Leads */}
      <div className="border border-[#2a2a2a] bg-[#0a0a0a]">
        <div className="px-6 py-4 border-b border-[#2a2a2a] flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-tbwr-gold">
            Recent Submissions
          </span>
          <Link
            href="/admin/leads"
            className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-tbwr-gold transition-colors"
          >
            View All →
          </Link>
        </div>
        <div className="divide-y divide-[#1a1a1a]">
          {recent?.map((lead) => (
            <Link
              key={lead.id}
              href={`/admin/leads/${lead.id}`}
              className="flex items-center justify-between px-6 py-4 hover:bg-[#111] transition-colors group"
            >
              <div>
                <div className="text-sm font-bold text-tbwr-white group-hover:text-tbwr-gold transition-colors">
                  {lead.athlete_first_name} {lead.athlete_last_name}
                </div>
                <div className="text-xs text-gray-500">
                  {lead.parent_first_name} {lead.parent_last_name} ·{" "}
                  {PATHWAY_LABELS[lead.pathway as Pathway]}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  {ROUTE_LABELS[lead.route_result as RouteResult]}
                </div>
                <div className="text-xs text-gray-600 mt-0.5">
                  {formatDateTime(lead.created_at as string)}
                </div>
              </div>
            </Link>
          ))}
          {(!recent || recent.length === 0) && (
            <div className="px-6 py-10 text-center text-gray-600 text-sm">
              No submissions yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
