import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { autoInviteParentFromLead } from "@/lib/parent-invite";

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
      if (process.env.NODE_ENV === "development") console.error("Availability update error:", error);
      return NextResponse.json(
        { error: "Failed to save availability" },
        { status: 500 }
      );
    }

    // Auto-invite parent — fire and forget, don't block response
    autoInviteParentFromLead(leadId).catch(() => {});

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    if (process.env.NODE_ENV === "development") console.error("Availability submission error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
