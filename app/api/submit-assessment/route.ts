import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import type { ParentInfo, AthleteInfo, AssessmentAnswers, RoutingResult } from "@/types";

// ─── Phase 2: Plug in email provider here ────────────────────────────────────
// import { sendAssessmentConfirmation } from "@/lib/email/resend";

interface SubmitPayload {
  parentInfo: ParentInfo;
  athleteInfo: AthleteInfo;
  answers: AssessmentAnswers;
  routingResult: RoutingResult;
}

export async function POST(request: NextRequest) {
  try {
    const body: SubmitPayload = await request.json();
    const { parentInfo, athleteInfo, answers, routingResult } = body;

    // Validate required fields
    if (!parentInfo?.email || !athleteInfo?.firstName || !answers?.ageGroup) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();

    const { data, error } = await supabase
      .from("leads")
      .insert({
        // Parent
        parent_first_name: parentInfo.firstName.trim(),
        parent_last_name: parentInfo.lastName.trim(),
        parent_email: parentInfo.email.toLowerCase().trim(),
        parent_phone: parentInfo.phone.trim(),
        parent_city: parentInfo.city.trim(),

        // Athlete
        athlete_first_name: athleteInfo.firstName.trim(),
        athlete_last_name: athleteInfo.lastName.trim(),
        athlete_dob: athleteInfo.dateOfBirth,
        athlete_gender: athleteInfo.gender,

        // Assessment
        assessment_answers: answers,
        route_result: routingResult.route,
        pathway: routingResult.pathway,
        assessment_score: routingResult.score,

        // Status
        status: "new",
      })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "Failed to save assessment" },
        { status: 500 }
      );
    }

    // ── Phase 2: Send confirmation email ─────────────────────────────────────
    // await sendAssessmentConfirmation({
    //   to: parentInfo.email,
    //   parentName: parentInfo.firstName,
    //   athleteName: athleteInfo.firstName,
    //   route: routingResult.route,
    //   pathway: routingResult.pathway,
    // });

    return NextResponse.json({ leadId: data.id }, { status: 201 });
  } catch (err) {
    console.error("Assessment submission error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
