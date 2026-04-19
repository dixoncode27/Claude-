import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Lead, LeadStatus, RouteResult, Pathway } from "@/types";
import { formatDate, STATUS_LABELS, STATUS_COLORS } from "@/lib/utils";
import { ROUTE_LABELS, PATHWAY_LABELS } from "@/lib/routing/logic";

export const dynamic = "force-dynamic";

interface SearchParams {
  status?: string;
  route?: string;
  pathway?: string;
  search?: string;
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await createClient();

  let query = supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (searchParams.status) query = query.eq("status", searchParams.status);
  if (searchParams.route) query = query.eq("route_result", searchParams.route);
  if (searchParams.pathway) query = query.eq("pathway", searchParams.pathway);
  if (searchParams.search) {
    const s = searchParams.search;
    query = query.or(
      `parent_email.ilike.%${s}%,parent_last_name.ilike.%${s}%,athlete_first_name.ilike.%${s}%,athlete_last_name.ilike.%${s}%`
    );
  }

  const { data: leads } = await query;
  const typedLeads = (leads ?? []) as Lead[];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="tbwr-heading-md text-tbwr-white mb-1">Leads</h1>
          <p className="text-gray-500 text-sm">{typedLeads.length} records</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        <FilterLink label="All" href="/admin/leads" active={!searchParams.status && !searchParams.route && !searchParams.pathway} />
        <FilterLink label="New" href="/admin/leads?status=new" active={searchParams.status === "new"} />
        <FilterLink label="Contacted" href="/admin/leads?status=contacted" active={searchParams.status === "contacted"} />
        <FilterLink label="Scheduled" href="/admin/leads?status=scheduled" active={searchParams.status === "scheduled"} />
        <FilterLink label="Enrolled" href="/admin/leads?status=enrolled" active={searchParams.status === "enrolled"} />
        <FilterLink label="Nurture" href="/admin/leads?status=nurture" active={searchParams.status === "nurture"} />

        <div className="w-px bg-[#333] mx-1" />

        <FilterLink label="Premium" href="/admin/leads?route=premium-entry" active={searchParams.route === "premium-entry"} gold />
        <FilterLink label="Standard" href="/admin/leads?route=standard-entry" active={searchParams.route === "standard-entry"} />
        <FilterLink label="Nurture Track" href="/admin/leads?route=not-ready" active={searchParams.route === "not-ready"} />

        <div className="w-px bg-[#333] mx-1" />

        <FilterLink label="Little Champs" href="/admin/leads?pathway=little-champs" active={searchParams.pathway === "little-champs"} />
        <FilterLink label="World Team" href="/admin/leads?pathway=world-team" active={searchParams.pathway === "world-team"} />
        <FilterLink label="Future Olympians" href="/admin/leads?pathway=future-olympians" active={searchParams.pathway === "future-olympians"} />
      </div>

      {/* Table */}
      <div className="border border-[#2a2a2a] bg-[#0a0a0a] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a2a2a]">
                <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">Athlete</th>
                <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">Parent</th>
                <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">Route</th>
                <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">Pathway</th>
                <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">Status</th>
                <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">Date</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a1a]">
              {typedLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-[#111] transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-bold text-sm text-tbwr-white">
                      {lead.athlete_first_name} {lead.athlete_last_name}
                    </div>
                    <div className="text-xs text-gray-500">{lead.athlete_gender} · {lead.athlete_dob}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-sm text-gray-300">
                      {lead.parent_first_name} {lead.parent_last_name}
                    </div>
                    <div className="text-xs text-gray-500">{lead.parent_email}</div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 ${
                      lead.route_result === "premium-entry"
                        ? "bg-tbwr-gold text-tbwr-black"
                        : lead.route_result === "not-ready"
                        ? "bg-[#222] text-gray-500"
                        : "bg-[#1a1a1a] text-gray-300"
                    }`}>
                      {ROUTE_LABELS[lead.route_result as RouteResult]}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                      {PATHWAY_LABELS[lead.pathway as Pathway]}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 ${STATUS_COLORS[lead.status as LeadStatus] || "bg-gray-800 text-gray-400"}`}>
                      {STATUS_LABELS[lead.status as LeadStatus] || lead.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs text-gray-600">{formatDate(lead.created_at)}</span>
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/leads/${lead.id}`}
                      className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-tbwr-gold transition-colors"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {typedLeads.length === 0 && (
            <div className="py-16 text-center text-gray-600 text-sm">
              No leads found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterLink({
  label,
  href,
  active,
  gold,
}: {
  label: string;
  href: string;
  active: boolean;
  gold?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 border transition-colors ${
        active
          ? gold
            ? "border-tbwr-gold bg-tbwr-gold text-tbwr-black"
            : "border-tbwr-white bg-tbwr-white text-tbwr-black"
          : "border-[#333] text-gray-500 hover:border-[#555] hover:text-gray-300"
      }`}
    >
      {label}
    </Link>
  );
}
