import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const route = searchParams.get("route");
    const pathway = searchParams.get("pathway");
    const search = searchParams.get("search");

    let query = supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (status) query = query.eq("status", status);
    if (route) query = query.eq("route_result", route);
    if (pathway) query = query.eq("pathway", pathway);
    if (search) {
      query = query.or(
        `parent_email.ilike.%${search}%,parent_last_name.ilike.%${search}%,athlete_first_name.ilike.%${search}%,athlete_last_name.ilike.%${search}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ leads: data });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
