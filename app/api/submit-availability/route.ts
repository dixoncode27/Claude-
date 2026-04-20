import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// ─── Phase 2: Trigger scheduling notification here ───────────────────────────
// import { notifyCoach } from "@/lib/email/resend";

interface AvailabilityPayload {
  leadId: string;
  days: string[];
  preferredTime: string;
  notes: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: AvailabilityPayload = await request.json();
    const { leadId, days, preferredTime, notes } = body;

    if (!leadId || !days?.length) {
      return NextResponse.json(
        { error: "Lead ID and at least one preferred day are required" },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();

    const { error } = await supabase
      .from("leads")
      .update({
        preferred_days: days,
        preferred_time: preferredTime,
        availability_notes: notes,
        status: "contacted",
      })
      .eq("id", leadId);

    if (error) {
      console.error("Availability update error:", error);
      return NextResponse.json(
        { error: "Failed to save availability" },
        { status: 500 }
      );
    }

    // ── Phase 2: Notify coach of new lead with availability ───────────────────
    // await notifyCoach({ leadId, days, preferredTime });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Availability submission error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
