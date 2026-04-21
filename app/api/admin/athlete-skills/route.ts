import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { athleteId, skillId, status } = await request.json();

    if (!athleteId || !skillId || !status) {
      return NextResponse.json({ error: "athleteId, skillId, status required" }, { status: 400 });
    }

    const adminClient = await createAdminClient();

    const { data, error } = await adminClient
      .from("athlete_skills")
      .upsert(
        {
          athlete_id: athleteId,
          skill_id: skillId,
          status,
          achieved_at: status === "achieved" ? new Date().toISOString() : null,
        },
        { onConflict: "athlete_id,skill_id" }
      )
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ data }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
