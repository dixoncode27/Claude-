import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { first_name, last_name, email, phone, bio, specialties, is_active } = body;

    if (!first_name || !last_name || !email) {
      return NextResponse.json({ error: "first_name, last_name, and email required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("coaches")
      .insert({ first_name, last_name, email, phone, bio, specialties, is_active })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ coach: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
