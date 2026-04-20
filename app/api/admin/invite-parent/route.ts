import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { ensureParentProfile } from "@/lib/parent-invite";

export async function POST(request: NextRequest) {
  try {
    const adminSupabase = await createAdminClient();

    // Verify the requesting user is authenticated admin
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { athleteId, parentEmail, parentFirstName, parentLastName, parentPhone } =
      await request.json();

    if (!athleteId || !parentEmail) {
      return NextResponse.json({ error: "athleteId and parentEmail required" }, { status: 400 });
    }

    const parentProfileId = await ensureParentProfile({
      email: parentEmail,
      firstName: parentFirstName ?? "",
      lastName: parentLastName ?? "",
      phone: parentPhone,
    });

    if (!parentProfileId) {
      return NextResponse.json({ error: "Failed to invite parent" }, { status: 500 });
    }

    // Check if this was an existing profile (for message differentiation)
    const { data: existingCheck } = await adminSupabase
      .from("parent_profiles")
      .select("created_at")
      .eq("id", parentProfileId)
      .single();

    const wasExisting = existingCheck
      ? new Date(existingCheck.created_at).getTime() < Date.now() - 5000
      : false;

    // Link parent to athlete (upsert — safe to run multiple times)
    const { error: linkError } = await adminSupabase
      .from("parent_athletes")
      .upsert({ parent_id: parentProfileId, athlete_id: athleteId });

    if (linkError) {
      return NextResponse.json({ error: linkError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: wasExisting
        ? "Parent linked to athlete successfully"
        : "Invitation sent — parent will receive an email to set their password",
    });
  } catch (err) {
    if (process.env.NODE_ENV === "development") console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
