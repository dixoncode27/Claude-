import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { athlete_id, note_type, content, coach_name, is_visible_to_parent } = body;

    if (!athlete_id || !content) {
      return NextResponse.json({ error: "athlete_id and content required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("coach_notes")
      .insert({ athlete_id, note_type, content, coach_name, is_visible_to_parent })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ note: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
