import type {
  AssessmentAnswers,
  RouteResult,
  Pathway,
  RoutingResult,
  AgeGroup,
} from "@/types";

// ─── Scoring Weights ──────────────────────────────────────────────────────────
// Each dimension scored independently. Total max = 11.

const EXPERIENCE_SCORES: Record<string, number> = {
  none: 0,
  tried: 1,
  "one-season": 2,
  "one-two-seasons": 3,
  "three-plus-seasons": 4,
};

const GOAL_SCORES: Record<string, number> = {
  "active-healthy": 1,
  "confidence-discipline": 2,
  "compete-local": 3,
  "compete-elite": 4,
};

const AVAILABILITY_SCORES: Record<string, number> = {
  "1-day": 1,
  "2-days": 2,
  "3-plus-days": 3,
};

const ACTIVITY_SCORES: Record<string, number> = {
  "not-active": 0,
  recreational: 1,
  "active-sport": 2,
  "competitive-sport": 3,
};

// ─── Route Thresholds ─────────────────────────────────────────────────────────
// Premium Entry: score >= 7 OR elite goal
// Standard Entry: score 4–6
// Not Ready: score <= 3

export function scoreAssessment(answers: AssessmentAnswers): number {
  return (
    EXPERIENCE_SCORES[answers.experience] +
    GOAL_SCORES[answers.primaryGoal] +
    AVAILABILITY_SCORES[answers.weeklyAvailability] +
    ACTIVITY_SCORES[answers.activityLevel]
  );
}

export function determineRoute(
  answers: AssessmentAnswers,
  score: number
): RouteResult {
  if (answers.primaryGoal === "compete-elite" || score >= 7) {
    return "premium-entry";
  }
  if (score >= 4) {
    return "standard-entry";
  }
  return "not-ready";
}

export function determinePathway(ageGroup: AgeGroup): Pathway {
  switch (ageGroup) {
    case "5-8":
      return "little-champs";
    case "9-13":
      return "world-team";
    case "14+":
      return "future-olympians";
  }
}

export function runRoutingLogic(answers: AssessmentAnswers): RoutingResult {
  const score = scoreAssessment(answers);
  const route = determineRoute(answers, score);
  const pathway = determinePathway(answers.ageGroup);

  return { route, pathway, score };
}

// ─── Display Helpers ──────────────────────────────────────────────────────────

export const ROUTE_LABELS: Record<RouteResult, string> = {
  "premium-entry": "PREMIUM ENTRY",
  "standard-entry": "STANDARD ENTRY",
  "not-ready": "DEVELOPMENT TRACK",
};

export const ROUTE_DESCRIPTIONS: Record<RouteResult, string> = {
  "premium-entry":
    "Your athlete is ready for a private evaluation with a TBWR coach. We will assess their current ability and build a custom development plan.",
  "standard-entry":
    "Your athlete qualifies for a complimentary trial session. Come in, meet the coaches, and experience the TBWR program firsthand.",
  "not-ready":
    "Based on your responses, your athlete may benefit from foundational preparation before joining the program. We will stay in contact with development resources.",
};

export const ROUTE_NEXT_STEPS: Record<RouteResult, string[]> = {
  "premium-entry": [
    "Private 1-on-1 evaluation with a TBWR head coach",
    "Comprehensive skill and development assessment",
    "Custom training pathway recommendation",
    "Direct enrollment offer",
  ],
  "standard-entry": [
    "Complimentary trial session",
    "Introduction to TBWR coaches and program structure",
    "Group assessment observation",
    "Enrollment guidance based on fit",
  ],
  "not-ready": [
    "Receive our athlete readiness guide",
    "Monthly development check-ins",
    "Priority access when your athlete is ready",
    "Community resources and preparation tips",
  ],
};

export const PATHWAY_LABELS: Record<string, string> = {
  "little-champs": "LITTLE CHAMPS",
  "world-team": "WORLD TEAM",
  "future-olympians": "FUTURE OLYMPIANS",
};

export const PATHWAY_DESCRIPTIONS: Record<string, string> = {
  "little-champs":
    "Ages 5–8. Built on fundamentals, movement, and confidence. No prior experience required.",
  "world-team":
    "Ages 9–13. Competitive development, technique refinement, and tournament readiness.",
  "future-olympians":
    "Ages 14+. High-performance training for athletes with serious competitive ambitions.",
};
