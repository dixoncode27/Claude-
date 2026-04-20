import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { leadId } = await request.json();
    if (!leadId) return NextResponse.json({ error: "leadId required" }, { status: 400 });

    const adminClient = await createAdminClient();

    const { data: lead, error: leadError } = await adminClient
      .from("leads")
      .select("*")
      .eq("id", leadId)
      .single();

    if (leadError || !lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    if (lead.converted_to_athlete && lead.athlete_id) {
      return NextResponse.json({ athleteId: lead.athlete_id });
    }

    const { data: athlete, error: athleteError } = await adminClient
      .from("athletes")
      .insert({
        lead_id: lead.id,
        first_name: lead.athlete_first_name,
        last_name: lead.athlete_last_name,
        date_of_birth: lead.athlete_dob,
        gender: lead.athlete_gender,
        pathway: lead.pathway,
        status: "active",
      })
      .select("id")
      .single();

    if (athleteError) {
      return NextResponse.json({ error: athleteError.message }, { status: 500 });
    }

    // Mark lead as converted
    await adminClient
      .from("leads")
      .update({
        converted_to_athlete: true,
        athlete_id: athlete.id,
        status: "enrolled",
      })
      .eq("id", leadId);

    return NextResponse.json({ athleteId: athlete.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
