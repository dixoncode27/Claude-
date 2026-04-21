"use client";

import { useState } from "react";
import type { Skill, AthleteSkill, SkillStatus } from "@/types";

const STATUS_CONFIG: Record<SkillStatus, { label: string; color: string; next: SkillStatus }> = {
  not_started: { label: "Not Started", color: "text-gray-600 border-gray-700 bg-transparent", next: "in_progress" },
  in_progress:  { label: "In Progress", color: "text-tbwr-gold border-yellow-700 bg-[#0d0900]", next: "achieved" },
  achieved:     { label: "Achieved",    color: "text-green-400 border-green-700 bg-green-900/20", next: "not_started" },
};

const DIFFICULTY_DOT: Record<string, string> = {
  beginner:     "bg-blue-500",
  intermediate: "bg-yellow-500",
  advanced:     "bg-red-500",
};

interface Props {
  athleteId: string;
  skills: Skill[];
  athleteSkills: AthleteSkill[];
}

export default function SkillProgressionPanel({ athleteId, skills, athleteSkills }: Props) {
  const [skillMap, setSkillMap] = useState<Record<string, SkillStatus>>(() => {
    const map: Record<string, SkillStatus> = {};
    athleteSkills.forEach((as) => { map[as.skill_id] = as.status; });
    return map;
  });
  const [updating, setUpdating] = useState<string | null>(null);

  const categories = Array.from(new Set(skills.map((s) => s.category)));

  const totalSkills = skills.length;
  const achieved = Object.values(skillMap).filter((s) => s === "achieved").length;
  const inProgress = Object.values(skillMap).filter((s) => s === "in_progress").length;

  async function cycleStatus(skill: Skill) {
    const current = skillMap[skill.id] ?? "not_started";
    const next = STATUS_CONFIG[current].next;

    setUpdating(skill.id);
    setSkillMap((prev) => ({ ...prev, [skill.id]: next }));

    try {
      await fetch("/api/admin/athlete-skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ athleteId, skillId: skill.id, status: next }),
      });
    } catch {
      // Revert on error
      setSkillMap((prev) => ({ ...prev, [skill.id]: current }));
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="border border-[#2a2a2a] bg-[#0a0a0a]">
      <div className="px-6 py-4 border-b border-[#2a2a2a] flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-widest text-tbwr-gold">
          Skill Progression
        </span>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span><span className="text-green-400 font-bold">{achieved}</span> achieved</span>
          <span><span className="text-tbwr-gold font-bold">{inProgress}</span> in progress</span>
          <span className="text-gray-600">{totalSkills - achieved - inProgress} not started</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-[#1a1a1a]">
        <div
          className="h-full bg-green-500 transition-all duration-500"
          style={{ width: `${totalSkills > 0 ? (achieved / totalSkills) * 100 : 0}%` }}
        />
      </div>

      <div className="px-6 py-5 flex flex-col gap-6">
        {/* Legend */}
        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-600">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />Beginner</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" />Intermediate</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />Advanced</span>
        </div>

        {categories.map((category) => {
          const catSkills = skills.filter((s) => s.category === category);
          const catAchieved = catSkills.filter((s) => skillMap[s.id] === "achieved").length;

          return (
            <div key={category}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                  {category}
                </span>
                <span className="text-[10px] text-gray-700">
                  {catAchieved}/{catSkills.length}
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                {catSkills.map((skill) => {
                  const status = skillMap[skill.id] ?? "not_started";
                  const config = STATUS_CONFIG[status];
                  const isUpdating = updating === skill.id;

                  return (
                    <button
                      key={skill.id}
                      onClick={() => cycleStatus(skill)}
                      disabled={isUpdating}
                      className={`flex items-center justify-between px-4 py-2.5 border text-left transition-all duration-150 ${config.color} hover:opacity-80 disabled:opacity-40`}
                      title={skill.description}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${DIFFICULTY_DOT[skill.difficulty]}`} />
                        <span className="text-sm font-medium text-gray-200">{skill.name}</span>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest flex-shrink-0">
                        {isUpdating ? "..." : config.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        <p className="text-[10px] text-gray-700 text-center">
          Click any skill to cycle: Not Started → In Progress → Achieved
        </p>
      </div>
    </div>
  );
}
