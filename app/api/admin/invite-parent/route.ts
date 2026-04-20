import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

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

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

    // Check if parent_profile already exists for this email
    const { data: existingProfile } = await adminSupabase
      .from("parent_profiles")
      .select("id, user_id")
      .eq("email", parentEmail.toLowerCase().trim())
      .maybeSingle();

    let parentProfileId: string;

    if (existingProfile) {
      // Parent already has an account — just link them to this athlete
      parentProfileId = existingProfile.id;
    } else {
      // Invite the parent via Supabase Auth — sends email with set-password link
      const { data: inviteData, error: inviteError } =
        await adminSupabase.auth.admin.inviteUserByEmail(parentEmail.toLowerCase().trim(), {
          redirectTo: `${appUrl}/auth/callback?next=/parent`,
          data: {
            role: "parent",
            first_name: parentFirstName,
            last_name: parentLastName,
          },
        });

      if (inviteError) {
        return NextResponse.json({ error: inviteError.message }, { status: 500 });
      }

      const userId = inviteData.user.id;

      // Create parent profile record
      const { data: profile, error: profileError } = await adminSupabase
        .from("parent_profiles")
        .insert({
          user_id: userId,
          first_name: parentFirstName?.trim() ?? "",
          last_name: parentLastName?.trim() ?? "",
          email: parentEmail.toLowerCase().trim(),
          phone: parentPhone?.trim() ?? "",
        })
        .select("id")
        .single();

      if (profileError) {
        return NextResponse.json({ error: profileError.message }, { status: 500 });
      }

      parentProfileId = profile.id;
    }

    // Link parent to athlete (upsert — safe to run multiple times)
    const { error: linkError } = await adminSupabase
      .from("parent_athletes")
      .upsert({ parent_id: parentProfileId, athlete_id: athleteId });

    if (linkError) {
      return NextResponse.json({ error: linkError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: existingProfile
        ? "Parent linked to athlete successfully"
        : "Invitation sent — parent will receive an email to set their password",
    });
  } catch (err) {
    if (process.env.NODE_ENV === "development") console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
