"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Coach } from "@/types";
import Button from "@/components/ui/Button";

const SPECIALTY_OPTIONS = [
  "Folkstyle", "Freestyle", "Greco-Roman", "Conditioning",
  "Mental Training", "Nutrition", "Youth Development",
];

export default function CoachForm({ coach }: { coach?: Coach }) {
  const router = useRouter();
  const [firstName, setFirstName] = useState(coach?.first_name ?? "");
  const [lastName, setLastName] = useState(coach?.last_name ?? "");
  const [email, setEmail] = useState(coach?.email ?? "");
  const [phone, setPhone] = useState(coach?.phone ?? "");
  const [bio, setBio] = useState(coach?.bio ?? "");
  const [specialties, setSpecialties] = useState<string[]>(coach?.specialties ?? []);
  const [isActive, setIsActive] = useState(coach?.is_active ?? true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function toggleSpecialty(s: string) {
    setSpecialties((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = "Required";
    if (!lastName.trim()) e.lastName = "Required";
    if (!email.trim()) e.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Invalid email";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setIsSaving(true);
    try {
      const url = coach ? `/api/admin/coaches/${coach.id}` : "/api/admin/coaches";
      const method = coach ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.toLowerCase().trim(),
          phone: phone.trim(),
          bio: bio.trim(),
          specialties,
          is_active: isActive,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/admin/coaches/${data.coach.id}`);
    } catch (err) {
      alert("Failed to save coach. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4">
        <Field label="First Name" error={errors.firstName}>
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full bg-[#111] border border-[#444] text-tbwr-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-tbwr-gold focus:border-transparent"
          />
        </Field>
        <Field label="Last Name" error={errors.lastName}>
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full bg-[#111] border border-[#444] text-tbwr-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-tbwr-gold focus:border-transparent"
          />
        </Field>
      </div>

      <Field label="Email" error={errors.email}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-[#111] border border-[#444] text-tbwr-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-tbwr-gold focus:border-transparent"
        />
      </Field>

      <Field label="Phone">
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full bg-[#111] border border-[#444] text-tbwr-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-tbwr-gold focus:border-transparent"
        />
      </Field>

      <Field label="Bio">
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          className="w-full bg-[#111] border border-[#444] text-tbwr-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-tbwr-gold focus:border-transparent resize-none"
        />
      </Field>

      <div>
        <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 block mb-3">
          Specialties
        </label>
        <div className="flex flex-wrap gap-2">
          {SPECIALTY_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleSpecialty(s)}
              className={`text-xs font-bold uppercase tracking-widest border px-3 py-1.5 transition-colors ${
                specialties.includes(s)
                  ? "border-tbwr-gold bg-tbwr-gold text-tbwr-black"
                  : "border-[#444] text-gray-500 hover:border-[#666]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="accent-tbwr-gold"
        />
        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Active Coach</span>
      </label>

      <Button variant="primary" size="md" loading={isSaving} onClick={handleSubmit}>
        {coach ? "Save Changes" : "Create Coach"}
      </Button>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-black uppercase tracking-widest text-gray-600">{label}</label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
