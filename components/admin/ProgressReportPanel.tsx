"use client";

import { useState } from "react";
import type { ProgressReport } from "@/types";
import { formatDate } from "@/lib/utils";

interface Props {
  athleteId: string;
  initialReports: ProgressReport[];
}

const EMPTY_FORM = {
  coachName: "",
  periodLabel: "",
  summary: "",
  strengths: "",
  areasToImprove: "",
};

export default function ProgressReportPanel({ athleteId, initialReports }: Props) {
  const [reports, setReports] = useState<ProgressReport[]>(initialReports);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [error, setError] = useState("");

  function updateField(field: keyof typeof EMPTY_FORM, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleCreate() {
    if (!form.periodLabel.trim() || !form.summary.trim()) {
      setError("Period and summary are required.");
      return;
    }
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/admin/progress-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ athleteId, ...form }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error); return; }
      setReports((prev) => [json.data, ...prev]);
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleShare(report: ProgressReport) {
    setToggling(report.id);
    const next = !report.is_shared_with_parent;

    setReports((prev) =>
      prev.map((r) => r.id === report.id ? { ...r, is_shared_with_parent: next } : r)
    );

    try {
      await fetch(`/api/admin/progress-reports/${report.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_shared_with_parent: next }),
      });
    } catch {
      setReports((prev) =>
        prev.map((r) => r.id === report.id ? { ...r, is_shared_with_parent: report.is_shared_with_parent } : r)
      );
    } finally {
      setToggling(null);
    }
  }

  async function handleDelete(reportId: string) {
    setReports((prev) => prev.filter((r) => r.id !== reportId));
    await fetch(`/api/admin/progress-reports/${reportId}`, { method: "DELETE" });
  }

  return (
    <div className="border border-[#2a2a2a] bg-[#0a0a0a]">
      <div className="px-6 py-4 border-b border-[#2a2a2a] flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-widest text-tbwr-gold">
          Progress Reports
        </span>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-[10px] font-black uppercase tracking-widest text-tbwr-gold hover:text-yellow-300 transition-colors"
          >
            + New Report
          </button>
        )}
      </div>

      {showForm && (
        <div className="px-6 py-5 border-b border-[#2a2a2a] flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-600">Period <span className="text-red-500">*</span></label>
              <input
                type="text"
                placeholder="e.g. Spring 2025"
                value={form.periodLabel}
                onChange={(e) => updateField("periodLabel", e.target.value)}
                className="bg-[#111] border border-[#444] text-tbwr-white px-3 py-2 text-sm placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-tbwr-gold"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-600">Coach Name</label>
              <input
                type="text"
                placeholder="Your name"
                value={form.coachName}
                onChange={(e) => updateField("coachName", e.target.value)}
                className="bg-[#111] border border-[#444] text-tbwr-white px-3 py-2 text-sm placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-tbwr-gold"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-600">Summary <span className="text-red-500">*</span></label>
            <textarea
              rows={3}
              placeholder="Overall assessment of the athlete's progress this period..."
              value={form.summary}
              onChange={(e) => updateField("summary", e.target.value)}
              className="bg-[#111] border border-[#444] text-tbwr-white px-3 py-2 text-sm placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-tbwr-gold resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-600">Strengths</label>
              <textarea
                rows={2}
                placeholder="What the athlete does well..."
                value={form.strengths}
                onChange={(e) => updateField("strengths", e.target.value)}
                className="bg-[#111] border border-[#444] text-tbwr-white px-3 py-2 text-sm placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-tbwr-gold resize-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-600">Areas to Improve</label>
              <textarea
                rows={2}
                placeholder="Focus areas for next period..."
                value={form.areasToImprove}
                onChange={(e) => updateField("areasToImprove", e.target.value)}
                className="bg-[#111] border border-[#444] text-tbwr-white px-3 py-2 text-sm placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-tbwr-gold resize-none"
              />
            </div>
          </div>

          {error && (
            <div className="border border-red-500 bg-red-900/20 px-4 py-2 text-red-400 text-sm">{error}</div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleCreate}
              disabled={saving}
              className="bg-tbwr-gold text-tbwr-black font-black uppercase tracking-widest text-xs px-5 py-2.5 hover:bg-yellow-400 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Report"}
            </button>
            <button
              onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setError(""); }}
              className="border border-[#444] text-gray-400 font-bold uppercase tracking-widest text-xs px-5 py-2.5 hover:border-[#666] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {reports.length === 0 && !showForm ? (
        <div className="px-6 py-10 text-center text-gray-600 text-sm">
          No progress reports yet
        </div>
      ) : (
        <div className="divide-y divide-[#1a1a1a]">
          {reports.map((report) => (
            <div key={report.id} className="px-6 py-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="font-black uppercase tracking-widest text-tbwr-white text-sm">
                    {report.period_label}
                  </div>
                  {report.coach_name && (
                    <div className="text-xs text-gray-600 mt-0.5">{report.coach_name} · {formatDate(report.created_at)}</div>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <button
                    onClick={() => toggleShare(report)}
                    disabled={toggling === report.id}
                    className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 border transition-colors ${
                      report.is_shared_with_parent
                        ? "border-green-700 text-green-400 bg-green-900/20 hover:bg-green-900/40"
                        : "border-[#444] text-gray-500 hover:border-[#666]"
                    } disabled:opacity-40`}
                  >
                    {toggling === report.id ? "..." : report.is_shared_with_parent ? "Shared" : "Share"}
                  </button>
                  <button
                    onClick={() => handleDelete(report.id)}
                    className="text-[10px] font-black uppercase tracking-widest text-gray-700 hover:text-red-400 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <p className="text-gray-300 text-sm leading-relaxed mb-3">{report.summary}</p>

              {(report.strengths || report.areas_to_improve) && (
                <div className="grid grid-cols-2 gap-4 mt-3">
                  {report.strengths && (
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-green-600 mb-1">Strengths</div>
                      <p className="text-gray-400 text-xs leading-relaxed">{report.strengths}</p>
                    </div>
                  )}
                  {report.areas_to_improve && (
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-yellow-700 mb-1">Areas to Improve</div>
                      <p className="text-gray-400 text-xs leading-relaxed">{report.areas_to_improve}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
