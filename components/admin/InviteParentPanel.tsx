"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

export default function InviteParentPanel({ athleteId }: { athleteId: string }) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  async function handleInvite() {
    if (!email.trim()) return;
    setIsSending(true);
    setResult(null);

    try {
      const res = await fetch("/api/admin/invite-parent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          athleteId,
          parentEmail: email,
          parentFirstName: firstName,
          parentLastName: lastName,
          parentPhone: phone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResult({ success: false, message: data.error });
      } else {
        setResult({ success: true, message: data.message });
        setEmail("");
        setFirstName("");
        setLastName("");
        setPhone("");
      }
    } catch {
      setResult({ success: false, message: "Something went wrong. Please try again." });
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="border border-[#2a2a2a] bg-[#0a0a0a]">
      <div className="px-6 py-4 border-b border-[#2a2a2a]">
        <span className="text-xs font-bold uppercase tracking-widest text-tbwr-gold">
          Invite Parent
        </span>
      </div>
      <div className="px-6 py-5 flex flex-col gap-4">
        <p className="text-xs text-gray-500 leading-relaxed">
          Send the parent an invitation email. They will set their own password
          and get immediate access to their athlete&apos;s portal.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-600">
              First Name
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Jane"
              className="w-full bg-[#111] border border-[#444] text-tbwr-white px-3 py-2 text-sm placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-tbwr-gold"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-600">
              Last Name
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Smith"
              className="w-full bg-[#111] border border-[#444] text-tbwr-white px-3 py-2 text-sm placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-tbwr-gold"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-600">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="parent@email.com"
            className="w-full bg-[#111] border border-[#444] text-tbwr-white px-3 py-2 text-sm placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-tbwr-gold"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-600">
            Phone
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(775) 000-0000"
            className="w-full bg-[#111] border border-[#444] text-tbwr-white px-3 py-2 text-sm placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-tbwr-gold"
          />
        </div>

        {result && (
          <div className={`border px-4 py-3 text-sm ${
            result.success
              ? "border-green-700 bg-green-900/20 text-green-400"
              : "border-red-500 bg-red-900/20 text-red-400"
          }`}>
            {result.message}
          </div>
        )}

        <Button
          variant="primary"
          size="sm"
          fullWidth
          loading={isSending}
          onClick={handleInvite}
          disabled={!email.trim()}
        >
          Send Invitation
        </Button>
      </div>
    </div>
  );
}
