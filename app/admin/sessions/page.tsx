import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Session, Coach } from "@/types";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SessionsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("sessions")
    .select("*, coach:coaches(first_name, last_name), attendance(count)")
    .order("session_date", { ascending: false })
    .limit(50);

  const sessions = (data ?? []) as (Session & {
    coach: Pick<Coach, "first_name" | "last_name"> | null;
    attendance: { count: number }[];
  })[];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="tbwr-heading-md text-tbwr-white mb-1">Sessions</h1>
          <p className="text-gray-500 text-sm">{sessions.length} recent sessions</p>
        </div>
        <Link
          href="/admin/sessions/new"
          className="text-xs font-black uppercase tracking-widest bg-tbwr-gold text-tbwr-black px-4 py-2.5 hover:bg-yellow-400 transition-colors"
        >
          + Add Session
        </Link>
      </div>

      <div className="border border-[#2a2a2a] bg-[#0a0a0a] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a2a2a]">
                <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">Date</th>
                <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">Time</th>
                <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">Type</th>
                <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">Coach</th>
                <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">Pathway</th>
                <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">Athletes</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a1a]">
              {sessions.map((session) => (
                <tr key={session.id} className="hover:bg-[#111] transition-colors">
                  <td className="px-5 py-4 text-sm font-bold text-tbwr-white">
                    {formatDate(session.session_date)}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-400">
                    {session.start_time?.slice(0, 5)} · {session.duration_min}min
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-300 border border-[#333] px-2 py-1 capitalize">
                      {session.session_type}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-400">
                    {session.coach
                      ? `${session.coach.first_name} ${session.coach.last_name}`
                      : "—"}
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-500 capitalize">
                    {session.pathway?.replace(/-/g, " ") ?? "All"}
                  </td>
                  <td className="px-5 py-4 text-sm text-tbwr-white font-bold">
                    {session.attendance?.[0]?.count ?? 0}
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/sessions/${session.id}`}
                      className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-tbwr-gold transition-colors"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sessions.length === 0 && (
            <div className="py-16 text-center text-gray-600 text-sm">No sessions yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
