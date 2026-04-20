import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { session_id, athlete_id, status, notes } = await request.json();
    if (!session_id || !athlete_id) {
      return NextResponse.json({ error: "session_id and athlete_id required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("attendance")
      .upsert({ session_id, athlete_id, status: status ?? "present", notes: notes ?? "" }, {
        onConflict: "session_id,athlete_id",
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ attendance: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
