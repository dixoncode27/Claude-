import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { athleteId, coachName, periodLabel, summary, strengths, areasToImprove } =
      await request.json();

    if (!athleteId || !periodLabel || !summary) {
      return NextResponse.json(
        { error: "athleteId, periodLabel, and summary are required" },
        { status: 400 }
      );
    }

    const adminClient = await createAdminClient();

    const { data, error } = await adminClient
      .from("progress_reports")
      .insert({
        athlete_id: athleteId,
        coach_name: coachName?.trim() ?? "",
        period_label: periodLabel.trim(),
        summary: summary.trim(),
        strengths: strengths?.trim() ?? "",
        areas_to_improve: areasToImprove?.trim() ?? "",
        is_shared_with_parent: false,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
