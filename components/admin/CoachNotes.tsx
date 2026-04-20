"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CoachNote, NoteType } from "@/types";
import { formatDateTime } from "@/lib/utils";

const NOTE_TYPE_LABELS: Record<NoteType, string> = {
  general: "General",
  technique: "Technique",
  behavior: "Behavior",
  progress: "Progress",
  goal: "Goal",
};

const NOTE_TYPE_COLORS: Record<NoteType, string> = {
  general: "text-gray-400 border-gray-700",
  technique: "text-blue-400 border-blue-800",
  behavior: "text-orange-400 border-orange-800",
  progress: "text-green-400 border-green-800",
  goal: "text-tbwr-gold border-yellow-800",
};

export default function CoachNotes({
  athleteId,
  notes,
}: {
  athleteId: string;
  notes: CoachNote[];
}) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [noteType, setNoteType] = useState<NoteType>("general");
  const [content, setContent] = useState("");
  const [coachName, setCoachName] = useState("");
  const [visibleToParent, setVisibleToParent] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function handleAdd() {
    if (!content.trim()) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          athlete_id: athleteId,
          note_type: noteType,
          content: content.trim(),
          coach_name: coachName.trim(),
          is_visible_to_parent: visibleToParent,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setContent("");
      setCoachName("");
      setNoteType("general");
      setVisibleToParent(false);
      setIsAdding(false);
      router.refresh();
    } catch {
      alert("Failed to save note. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(noteId: string) {
    if (!confirm("Delete this note?")) return;
    await fetch(`/api/admin/notes/${noteId}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="border border-[#2a2a2a] bg-[#0a0a0a]">
      <div className="px-6 py-4 border-b border-[#2a2a2a] flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-widest text-tbwr-gold">
          Coach Notes
        </span>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-tbwr-gold transition-colors"
        >
          {isAdding ? "Cancel" : "+ Add Note"}
        </button>
      </div>

      {isAdding && (
        <div className="px-6 py-5 border-b border-[#2a2a2a] flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-600">
                Note Type
              </label>
              <select
                value={noteType}
                onChange={(e) => setNoteType(e.target.value as NoteType)}
                className="bg-[#111] border border-[#444] text-tbwr-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tbwr-gold"
              >
                {Object.entries(NOTE_TYPE_LABELS).map(([val, label]) => (
                  <option key={val} value={val} className="bg-tbwr-charcoal">
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-600">
                Coach Name
              </label>
              <input
                type="text"
                value={coachName}
                onChange={(e) => setCoachName(e.target.value)}
                placeholder="Optional"
                className="bg-[#111] border border-[#444] text-tbwr-white px-3 py-2 text-sm placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-tbwr-gold"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-600">
              Note
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder="Enter note..."
              className="bg-[#111] border border-[#444] text-tbwr-white px-3 py-2.5 text-sm placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-tbwr-gold resize-none"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={visibleToParent}
                onChange={(e) => setVisibleToParent(e.target.checked)}
                className="accent-tbwr-gold"
              />
              <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                Visible to Parent
              </span>
            </label>
            <button
              onClick={handleAdd}
              disabled={isSaving || !content.trim()}
              className="text-xs font-black uppercase tracking-widest bg-tbwr-gold text-tbwr-black px-4 py-2 hover:bg-yellow-400 transition-colors disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Note"}
            </button>
          </div>
        </div>
      )}

      <div className="divide-y divide-[#1a1a1a]">
        {notes.length === 0 && (
          <div className="px-6 py-8 text-center text-gray-600 text-sm">
            No notes yet
          </div>
        )}
        {notes.map((note) => (
          <div key={note.id} className="px-6 py-4">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-black uppercase tracking-widest border px-2 py-0.5 ${
                    NOTE_TYPE_COLORS[note.note_type as NoteType]
                  }`}
                >
                  {NOTE_TYPE_LABELS[note.note_type as NoteType]}
                </span>
                {note.is_visible_to_parent && (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
                    Parent Visible
                  </span>
                )}
              </div>
              <button
                onClick={() => handleDelete(note.id)}
                className="text-[10px] text-gray-700 hover:text-red-400 transition-colors"
              >
                Delete
              </button>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed mb-2">{note.content}</p>
            <div className="text-[10px] text-gray-600">
              {note.coach_name && <span>{note.coach_name} · </span>}
              {formatDateTime(note.created_at)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
