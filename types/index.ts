// ─── Assessment & Routing ───────────────────────────────────────────────────

export type AgeGroup = "5-8" | "9-13" | "14+";
export type ExperienceLevel = "none" | "tried" | "one-season" | "one-two-seasons" | "three-plus-seasons";
export type ActivityLevel = "not-active" | "recreational" | "active-sport" | "competitive-sport";
export type PrimaryGoal = "active-healthy" | "confidence-discipline" | "compete-local" | "compete-elite";
export type WeeklyAvailability = "1-day" | "2-days" | "3-plus-days";

export interface AssessmentAnswers {
  ageGroup: AgeGroup;
  experience: ExperienceLevel;
  activityLevel: ActivityLevel;
  primaryGoal: PrimaryGoal;
  weeklyAvailability: WeeklyAvailability;
}

export type RouteResult = "premium-entry" | "standard-entry" | "not-ready";
export type Pathway = "little-champs" | "world-team" | "future-olympians";

export interface RoutingResult {
  route: RouteResult;
  pathway: Pathway;
  score: number;
}

// ─── Form Data ───────────────────────────────────────────────────────────────

export interface ParentInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
}

export interface AthleteInfo {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other";
}

export interface AvailabilityPreference {
  days: string[];
  preferredTime: "morning" | "afternoon" | "evening" | "flexible";
  additionalNotes: string;
}

// ─── Supabase DB Records ──────────────────────────────────────────────────────

export type LeadStatus =
  | "new"
  | "contacted"
  | "scheduled"
  | "enrolled"
  | "nurture"
  | "inactive";

export interface Lead {
  id: string;
  created_at: string;
  updated_at: string;

  // Parent
  parent_first_name: string;
  parent_last_name: string;
  parent_email: string;
  parent_phone: string;
  parent_city: string;

  // Athlete
  athlete_first_name: string;
  athlete_last_name: string;
  athlete_dob: string;
  athlete_gender: string;

  // Assessment
  assessment_answers: AssessmentAnswers;
  route_result: RouteResult;
  pathway: Pathway;
  assessment_score: number;

  // Availability
  preferred_days: string[];
  preferred_time: string;
  availability_notes: string;

  // Admin
  status: LeadStatus;
  admin_notes: string;
  assigned_coach: string | null;
  converted_to_athlete: boolean;
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  email: string;
  role: "admin" | "coach";
}

// ─── Assessment Step State ────────────────────────────────────────────────────

export interface AssessmentState {
  step: number;
  answers: Partial<AssessmentAnswers>;
  parentInfo: Partial<ParentInfo>;
  athleteInfo: Partial<AthleteInfo>;
  routingResult: RoutingResult | null;
}
