"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Lead, LeadStatus } from "@/types";
import { STATUS_LABELS } from "@/lib/utils";
import Button from "@/components/ui/Button";

const STATUS_OPTIONS: LeadStatus[] = [
  "new",
  "contacted",
  "scheduled",
  "enrolled",
  "nurture",
  "inactive",
];

export default function LeadDetailClient({ lead }: { lead: Lead }) {
  const router = useRouter();
  const [status, setStatus] = useState<LeadStatus>(lead.status as LeadStatus);
  const [notes, setNotes] = useState(lead.admin_notes || "");
  const [assignedCoach, setAssignedCoach] = useState(lead.assigned_coach || "");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    setSaved(false);

    try {
      const res = await fetch(`/api/admin/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          admin_notes: notes,
          assigned_coach: assignedCoach || null,
        }),
      });

      if (!res.ok) throw new Error("Save failed");

      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert("Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="border border-[#2a2a2a] bg-[#0a0a0a]">
      <div className="px-6 py-4 border-b border-[#2a2a2a]">
        <span className="text-xs font-bold uppercase tracking-widest text-tbwr-gold">
          Admin Actions
        </span>
      </div>
      <div className="px-6 py-5 flex flex-col gap-5">

        {/* Status */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-600">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as LeadStatus)}
            className="w-full bg-[#111] border border-[#444] text-tbwr-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-tbwr-gold"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s} className="bg-tbwr-charcoal">
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>

        {/* Assigned Coach */}
        {/* Phase 2: Replace with coach dropdown from coaches table */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-600">
            Assigned Coach
          </label>
          <input
            type="text"
            value={assignedCoach}
            onChange={(e) => setAssignedCoach(e.target.value)}
            placeholder="Coach name..."
            className="w-full bg-[#111] border border-[#444] text-tbwr-white px-3 py-2.5 text-sm placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-tbwr-gold"
          />
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-600">
            Admin Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Internal notes — not visible to parents..."
            className="w-full bg-[#111] border border-[#444] text-tbwr-white px-3 py-2.5 text-sm placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-tbwr-gold resize-none"
          />
        </div>

        <Button
          variant="primary"
          size="sm"
          fullWidth
          loading={isSaving}
          onClick={handleSave}
        >
          {saved ? "Saved ✓" : "Save Changes"}
        </Button>

        {/* Phase 2: Add contact email button, schedule session, convert to athlete */}
      </div>
    </div>
  );
}
