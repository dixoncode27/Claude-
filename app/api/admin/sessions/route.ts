import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { session_date, start_time, duration_min, session_type, pathway, coach_id, notes } = body;

    if (!session_date || !start_time) {
      return NextResponse.json({ error: "session_date and start_time required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("sessions")
      .insert({ session_date, start_time, duration_min, session_type, pathway, coach_id, notes })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ session: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
