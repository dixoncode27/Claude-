import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Lead, LeadStatus, RouteResult, Pathway } from "@/types";
import { formatDateTime, calculateAge, STATUS_LABELS, STATUS_COLORS } from "@/lib/utils";
import { ROUTE_LABELS, PATHWAY_LABELS, PATHWAY_DESCRIPTIONS, ROUTE_DESCRIPTIONS } from "@/lib/routing/logic";
import LeadDetailClient from "@/components/admin/LeadDetailClient";

export const dynamic = "force-dynamic";

export default async function LeadDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !data) {
    notFound();
  }

  const lead = data as Lead;

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-8">
        <Link
          href="/admin/leads"
          className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-tbwr-gold transition-colors"
        >
          Leads
        </Link>
        <span className="text-gray-600">→</span>
        <span className="text-xs font-bold uppercase tracking-widest text-tbwr-white">
          {lead.athlete_first_name} {lead.athlete_last_name}
        </span>
      </div>

      <div className="flex items-start justify-between gap-6 mb-8 flex-wrap">
        <div>
          <h1 className="tbwr-heading-md text-tbwr-white mb-1">
            {lead.athlete_first_name} {lead.athlete_last_name}
          </h1>
          <p className="text-gray-500 text-sm">
            Submitted {formatDateTime(lead.created_at)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 ${
              lead.route_result === "premium-entry"
                ? "bg-tbwr-gold text-tbwr-black"
                : "bg-[#1a1a1a] text-gray-300"
            }`}
          >
            {ROUTE_LABELS[lead.route_result as RouteResult]}
          </span>
          <span
            className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 ${
              STATUS_COLORS[lead.status as LeadStatus]
            }`}
          >
            {STATUS_LABELS[lead.status as LeadStatus]}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column — lead details */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Route & Pathway */}
          <DetailCard title="Assessment Result">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="border border-[#333] p-4">
                <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Entry Route</div>
                <div className="font-black text-sm uppercase tracking-wide text-tbwr-white mb-2">
                  {ROUTE_LABELS[lead.route_result as RouteResult]}
                </div>
                <div className="text-xs text-gray-500 leading-relaxed">
                  {ROUTE_DESCRIPTIONS[lead.route_result as RouteResult]}
                </div>
              </div>
              <div className="border border-tbwr-gold/30 p-4 bg-[#0a0800]">
                <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Pathway</div>
                <div className="font-black text-sm uppercase tracking-wide text-tbwr-gold mb-2">
                  {PATHWAY_LABELS[lead.pathway as Pathway]}
                </div>
                <div className="text-xs text-gray-500 leading-relaxed">
                  {PATHWAY_DESCRIPTIONS[lead.pathway as Pathway]}
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-gray-600 block mb-1">Score</span>
                <span className="text-2xl font-black text-tbwr-white">{lead.assessment_score}</span>
                <span className="text-gray-600 text-sm">/11</span>
              </div>
            </div>
          </DetailCard>

          {/* Assessment Answers */}
          <DetailCard title="Assessment Answers">
            <div className="grid sm:grid-cols-2 gap-y-5 gap-x-8">
              {lead.assessment_answers && Object.entries(lead.assessment_answers).map(([key, value]) => (
                <div key={key}>
                  <div className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-1">
                    {key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
                  </div>
                  <div className="text-sm text-tbwr-white capitalize">
                    {String(value).replace(/-/g, " ")}
                  </div>
                </div>
              ))}
            </div>
          </DetailCard>

          {/* Availability */}
          <DetailCard title="Availability">
            {lead.preferred_days?.length > 0 ? (
              <>
                <div className="flex flex-wrap gap-2 mb-4">
                  {lead.preferred_days.map((day) => (
                    <span
                      key={day}
                      className="text-xs font-bold uppercase tracking-widest text-tbwr-white bg-[#1a1a1a] border border-[#333] px-3 py-1"
                    >
                      {day}
                    </span>
                  ))}
                </div>
                <DataRow label="Preferred Time" value={lead.preferred_time?.replace(/-/g, " ") || "—"} />
                {lead.availability_notes && (
                  <DataRow label="Notes" value={lead.availability_notes} />
                )}
              </>
            ) : (
              <p className="text-gray-600 text-sm">No availability submitted yet</p>
            )}
          </DetailCard>
        </div>

        {/* Right column — contact + admin */}
        <div className="flex flex-col gap-6">
          {/* Parent */}
          <DetailCard title="Parent">
            <DataRow label="Name" value={`${lead.parent_first_name} ${lead.parent_last_name}`} />
            <DataRow label="Email" value={lead.parent_email} />
            <DataRow label="Phone" value={lead.parent_phone} />
            <DataRow label="City" value={lead.parent_city} />
          </DetailCard>

          {/* Athlete */}
          <DetailCard title="Athlete">
            <DataRow label="Name" value={`${lead.athlete_first_name} ${lead.athlete_last_name}`} />
            <DataRow label="Date of Birth" value={lead.athlete_dob} />
            <DataRow label="Age" value={`${calculateAge(lead.athlete_dob)} years old`} />
            <DataRow label="Gender" value={lead.athlete_gender} />
          </DetailCard>

          {/* Admin Actions — Client Component */}
          <LeadDetailClient lead={lead} />
        </div>
      </div>
    </div>
  );
}

function DetailCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
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
      <span className="text-sm text-gray-200">{value}</span>
    </div>
  );
}
