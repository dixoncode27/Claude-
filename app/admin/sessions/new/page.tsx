import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Coach } from "@/types";
import SessionForm from "@/components/admin/SessionForm";

export default async function NewSessionPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("coaches")
    .select("id, first_name, last_name")
    .eq("is_active", true)
    .order("first_name");

  const coaches = (data ?? []) as Pick<Coach, "id" | "first_name" | "last_name">[];

  return (
    <div className="p-8">
      <div className="flex items-center gap-2 mb-8">
        <Link href="/admin/sessions" className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-tbwr-gold transition-colors">
          Sessions
        </Link>
        <span className="text-gray-600">→</span>
        <span className="text-xs font-bold uppercase tracking-widest text-tbwr-white">New Session</span>
      </div>
      <div className="max-w-xl">
        <h1 className="tbwr-heading-md text-tbwr-white mb-8">Add Session</h1>
        <SessionForm coaches={coaches} />
      </div>
    </div>
  );
}
