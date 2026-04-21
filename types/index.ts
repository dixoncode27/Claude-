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

  parent_first_name: string;
  parent_last_name: string;
  parent_email: string;
  parent_phone: string;
  parent_city: string;

  athlete_first_name: string;
  athlete_last_name: string;
  athlete_dob: string;
  athlete_gender: string;

  assessment_answers: AssessmentAnswers;
  route_result: RouteResult;
  pathway: Pathway;
  assessment_score: number;

  preferred_days: string[];
  preferred_time: string;
  availability_notes: string;

  status: LeadStatus;
  admin_notes: string;
  assigned_coach: string | null;
  converted_to_athlete: boolean;
  athlete_id: string | null;
}

// ─── Phase 2 Types ────────────────────────────────────────────────────────────

export type AthleteStatus = "active" | "inactive" | "on-hold";
export type NoteType = "general" | "technique" | "behavior" | "progress" | "goal";
export type AttendanceStatus = "present" | "absent" | "excused" | "late";
export type SessionType = "practice" | "evaluation" | "competition" | "private";

export interface Coach {
  id: string;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  bio: string;
  specialties: string[];
  is_active: boolean;
}

export interface Athlete {
  id: string;
  created_at: string;
  updated_at: string;
  lead_id: string | null;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  pathway: Pathway;
  status: AthleteStatus;
  weight_class: string;
  coach_id: string | null;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  // Joined fields
  coach?: Coach;
  tags?: string[];
}

export interface ParentProfile {
  id: string;
  created_at: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  athletes?: Athlete[];
}

export interface Session {
  id: string;
  created_at: string;
  session_date: string;
  start_time: string;
  duration_min: number;
  coach_id: string | null;
  pathway: string | null;
  session_type: SessionType;
  notes: string;
  coach?: Coach;
}

export interface Attendance {
  id: string;
  created_at: string;
  session_id: string;
  athlete_id: string;
  status: AttendanceStatus;
  notes: string;
  session?: Session;
}

export interface CoachNote {
  id: string;
  created_at: string;
  updated_at: string;
  athlete_id: string;
  coach_id: string | null;
  coach_name: string;
  note_type: NoteType;
  content: string;
  is_visible_to_parent: boolean;
}

// ─── Phase 3 Types ────────────────────────────────────────────────────────────

export type SkillDifficulty = "beginner" | "intermediate" | "advanced";
export type SkillStatus = "not_started" | "in_progress" | "achieved";

export interface Skill {
  id: string;
  category: string;
  name: string;
  description: string;
  difficulty: SkillDifficulty;
  sort_order: number;
}

export interface AthleteSkill {
  id: string;
  created_at: string;
  updated_at: string;
  athlete_id: string;
  skill_id: string;
  status: SkillStatus;
  coach_notes: string;
  achieved_at: string | null;
}

export interface ProgressReport {
  id: string;
  created_at: string;
  updated_at: string;
  athlete_id: string;
  coach_id: string | null;
  coach_name: string;
  period_label: string;
  summary: string;
  strengths: string;
  areas_to_improve: string;
  is_shared_with_parent: boolean;
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  email: string;
  role: "admin" | "coach" | "parent";
}

// ─── Assessment Step State ────────────────────────────────────────────────────

export interface AssessmentState {
  step: number;
  answers: Partial<AssessmentAnswers>;
  parentInfo: Partial<ParentInfo>;
  athleteInfo: Partial<AthleteInfo>;
  routingResult: RoutingResult | null;
}
