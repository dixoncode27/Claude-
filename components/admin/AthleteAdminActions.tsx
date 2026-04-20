"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Athlete, AthleteStatus, Coach, Pathway } from "@/types";
import { PATHWAY_LABELS } from "@/lib/routing/logic";
import Button from "@/components/ui/Button";

const STATUS_OPTIONS: AthleteStatus[] = ["active", "inactive", "on-hold"];
const PATHWAY_OPTIONS: Pathway[] = ["little-champs", "world-team", "future-olympians"];

export default function AthleteAdminActions({
  athlete,
  coaches,
}: {
  athlete: Athlete;
  coaches: Pick<Coach, "id" | "first_name" | "last_name">[];
}) {
  const router = useRouter();
  const [status, setStatus] = useState<AthleteStatus>(athlete.status);
  const [pathway, setPathway] = useState<Pathway>(athlete.pathway);
  const [coachId, setCoachId] = useState(athlete.coach_id ?? "");
  const [weightClass, setWeightClass] = useState(athlete.weight_class ?? "");
  const [emergencyName, setEmergencyName] = useState(athlete.emergency_contact_name ?? "");
  const [emergencyPhone, setEmergencyPhone] = useState(athlete.emergency_contact_phone ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    setSaved(false);
    try {
      const res = await fetch(`/api/admin/athletes/${athlete.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          pathway,
          coach_id: coachId || null,
          weight_class: weightClass,
          emergency_contact_name: emergencyName,
          emergency_contact_phone: emergencyPhone,
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
          Manage Athlete
        </span>
      </div>
      <div className="px-6 py-5 flex flex-col gap-4">
        <Field label="Status">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as AthleteStatus)}
            className="w-full bg-[#111] border border-[#444] text-tbwr-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-tbwr-gold"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s} className="bg-tbwr-charcoal capitalize">{s}</option>
            ))}
          </select>
        </Field>

        <Field label="Pathway">
          <select
            value={pathway}
            onChange={(e) => setPathway(e.target.value as Pathway)}
            className="w-full bg-[#111] border border-[#444] text-tbwr-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-tbwr-gold"
          >
            {PATHWAY_OPTIONS.map((p) => (
              <option key={p} value={p} className="bg-tbwr-charcoal">
                {PATHWAY_LABELS[p]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Assigned Coach">
          <select
            value={coachId}
            onChange={(e) => setCoachId(e.target.value)}
            className="w-full bg-[#111] border border-[#444] text-tbwr-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-tbwr-gold"
          >
            <option value="" className="bg-tbwr-charcoal">Unassigned</option>
            {coaches.map((c) => (
              <option key={c.id} value={c.id} className="bg-tbwr-charcoal">
                {c.first_name} {c.last_name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Weight Class">
          <input
            type="text"
            value={weightClass}
            onChange={(e) => setWeightClass(e.target.value)}
            placeholder="e.g. 85 lbs"
            className="w-full bg-[#111] border border-[#444] text-tbwr-white px-3 py-2.5 text-sm placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-tbwr-gold"
          />
        </Field>

        <div className="border-t border-[#1a1a1a] pt-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-3">
            Emergency Contact
          </p>
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={emergencyName}
              onChange={(e) => setEmergencyName(e.target.value)}
              placeholder="Contact name"
              className="w-full bg-[#111] border border-[#444] text-tbwr-white px-3 py-2.5 text-sm placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-tbwr-gold"
            />
            <input
              type="text"
              value={emergencyPhone}
              onChange={(e) => setEmergencyPhone(e.target.value)}
              placeholder="Contact phone"
              className="w-full bg-[#111] border border-[#444] text-tbwr-white px-3 py-2.5 text-sm placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-tbwr-gold"
            />
          </div>
        </div>

        <Button variant="primary" size="sm" fullWidth loading={isSaving} onClick={handleSave}>
          {saved ? "Saved ✓" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-black uppercase tracking-widest text-gray-600">{label}</label>
      {children}
    </div>
  );
}
