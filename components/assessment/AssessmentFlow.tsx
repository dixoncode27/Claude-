"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type {
  AssessmentAnswers,
  ParentInfo,
  AthleteInfo,
  AgeGroup,
  ExperienceLevel,
  ActivityLevel,
  PrimaryGoal,
  WeeklyAvailability,
} from "@/types";
import { runRoutingLogic } from "@/lib/routing/logic";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

// ─── Step definitions ─────────────────────────────────────────────────────────

type Step =
  | "parent-info"
  | "athlete-info"
  | "age-group"
  | "experience"
  | "activity"
  | "goal"
  | "availability"
  | "review";

const STEPS: Step[] = [
  "parent-info",
  "athlete-info",
  "age-group",
  "experience",
  "activity",
  "goal",
  "availability",
  "review",
];

const STEP_LABELS: Record<Step, string> = {
  "parent-info": "Your Information",
  "athlete-info": "Athlete Information",
  "age-group": "Age Group",
  "experience": "Wrestling Experience",
  "activity": "Current Activity",
  "goal": "Primary Goal",
  "availability": "Weekly Availability",
  "review": "Review & Submit",
};

// ─── Option Card ──────────────────────────────────────────────────────────────

function OptionCard({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left border p-5 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-tbwr-gold ${
        selected
          ? "border-tbwr-gold bg-[#0d0900] text-tbwr-white"
          : "border-[#333] bg-[#0a0a0a] text-gray-300 hover:border-[#555] hover:text-tbwr-white"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-5 h-5 border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
            selected ? "border-tbwr-gold bg-tbwr-gold" : "border-[#444]"
          }`}
        >
          {selected && (
            <svg className="w-3 h-3 text-tbwr-black" viewBox="0 0 12 12" fill="currentColor">
              <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        {children}
      </div>
    </button>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
  const percent = Math.round((current / total) * 100);
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
          Step {current} of {total}
        </span>
        <span className="text-xs font-bold text-tbwr-gold">{percent}%</span>
      </div>
      <div className="h-1 bg-[#1a1a1a] w-full">
        <div
          className="h-full bg-tbwr-gold transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AssessmentFlow() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>("parent-info");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [parentInfo, setParentInfo] = useState<Partial<ParentInfo>>({});
  const [athleteInfo, setAthleteInfo] = useState<Partial<AthleteInfo>>({});
  const [answers, setAnswers] = useState<Partial<AssessmentAnswers>>({});

  const stepIndex = STEPS.indexOf(currentStep);
  const totalSteps = STEPS.length;

  function validateParentInfo(): boolean {
    const e: Record<string, string> = {};
    if (!parentInfo.firstName?.trim()) e.firstName = "First name is required";
    if (!parentInfo.lastName?.trim()) e.lastName = "Last name is required";
    if (!parentInfo.email?.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parentInfo.email))
      e.email = "Enter a valid email address";
    if (!parentInfo.phone?.trim()) e.phone = "Phone number is required";
    if (!parentInfo.city?.trim()) e.city = "City is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateAthleteInfo(): boolean {
    const e: Record<string, string> = {};
    if (!athleteInfo.firstName?.trim()) e.athleteFirstName = "First name is required";
    if (!athleteInfo.lastName?.trim()) e.athleteLastName = "Last name is required";
    if (!athleteInfo.dateOfBirth) e.dateOfBirth = "Date of birth is required";
    if (!athleteInfo.gender) e.gender = "Please select a gender";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    setErrors({});
    if (currentStep === "parent-info" && !validateParentInfo()) return;
    if (currentStep === "athlete-info" && !validateAthleteInfo()) return;

    const nextIndex = stepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex]);
      window.scrollTo(0, 0);
    }
  }

  function back() {
    const prevIndex = stepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex]);
      window.scrollTo(0, 0);
    }
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      const fullAnswers = answers as AssessmentAnswers;
      const routingResult = runRoutingLogic(fullAnswers);

      const payload = {
        parentInfo,
        athleteInfo,
        answers: fullAnswers,
        routingResult,
      };

      const res = await fetch("/api/submit-assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Submission failed");
      }

      // Store result for the result page
      sessionStorage.setItem("tbwr_lead_id", data.leadId);
      sessionStorage.setItem("tbwr_routing", JSON.stringify(routingResult));
      sessionStorage.setItem("tbwr_athlete_name", athleteInfo.firstName || "");

      router.push("/result");
    } catch (err) {
      console.error(err);
      setErrors({ submit: "Something went wrong. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  }

  const canProceedAssessment = (step: Step) => {
    switch (step) {
      case "age-group": return !!answers.ageGroup;
      case "experience": return !!answers.experience;
      case "activity": return !!answers.activityLevel;
      case "goal": return !!answers.primaryGoal;
      case "availability": return !!answers.weeklyAvailability;
      default: return true;
    }
  };

  return (
    <div className="min-h-screen bg-tbwr-black pt-24 pb-16 px-4">
      <div className="max-w-xl mx-auto">
        <ProgressBar current={stepIndex + 1} total={totalSteps} />

        <div className="mb-2">
          <span className="tbwr-label">{STEP_LABELS[currentStep]}</span>
        </div>

        {/* ── Parent Info ── */}
        {currentStep === "parent-info" && (
          <div>
            <h1 className="tbwr-heading-md text-tbwr-white mb-2">Your Information</h1>
            <p className="text-gray-400 text-sm mb-8">
              We use this to follow up with your assessment results and next steps.
            </p>
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={parentInfo.firstName || ""}
                  onChange={(e) => setParentInfo({ ...parentInfo, firstName: e.target.value })}
                  error={errors.firstName}
                  autoComplete="given-name"
                />
                <Input
                  label="Last Name"
                  value={parentInfo.lastName || ""}
                  onChange={(e) => setParentInfo({ ...parentInfo, lastName: e.target.value })}
                  error={errors.lastName}
                  autoComplete="family-name"
                />
              </div>
              <Input
                label="Email Address"
                type="email"
                value={parentInfo.email || ""}
                onChange={(e) => setParentInfo({ ...parentInfo, email: e.target.value })}
                error={errors.email}
                autoComplete="email"
                hint="We will send your assessment results here"
              />
              <Input
                label="Phone Number"
                type="tel"
                value={parentInfo.phone || ""}
                onChange={(e) => setParentInfo({ ...parentInfo, phone: e.target.value })}
                error={errors.phone}
                autoComplete="tel"
              />
              <Input
                label="City"
                value={parentInfo.city || ""}
                onChange={(e) => setParentInfo({ ...parentInfo, city: e.target.value })}
                error={errors.city}
                placeholder="Reno, Sparks, etc."
              />
            </div>
          </div>
        )}

        {/* ── Athlete Info ── */}
        {currentStep === "athlete-info" && (
          <div>
            <h1 className="tbwr-heading-md text-tbwr-white mb-2">Athlete Information</h1>
            <p className="text-gray-400 text-sm mb-8">
              Tell us about the athlete you are registering.
            </p>
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Athlete First Name"
                  value={athleteInfo.firstName || ""}
                  onChange={(e) => setAthleteInfo({ ...athleteInfo, firstName: e.target.value })}
                  error={errors.athleteFirstName}
                />
                <Input
                  label="Athlete Last Name"
                  value={athleteInfo.lastName || ""}
                  onChange={(e) => setAthleteInfo({ ...athleteInfo, lastName: e.target.value })}
                  error={errors.athleteLastName}
                />
              </div>
              <Input
                label="Date of Birth"
                type="date"
                value={athleteInfo.dateOfBirth || ""}
                onChange={(e) => setAthleteInfo({ ...athleteInfo, dateOfBirth: e.target.value })}
                error={errors.dateOfBirth}
                hint="Used to place your athlete in the correct age group"
              />
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Gender
                </span>
                <div className="flex gap-3">
                  {(["male", "female", "other"] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setAthleteInfo({ ...athleteInfo, gender: g })}
                      className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest border transition-colors ${
                        athleteInfo.gender === g
                          ? "border-tbwr-gold bg-tbwr-gold text-tbwr-black"
                          : "border-[#444] text-gray-400 hover:border-[#666]"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
                {errors.gender && <p className="text-xs text-red-400">{errors.gender}</p>}
              </div>
            </div>
          </div>
        )}

        {/* ── Age Group ── */}
        {currentStep === "age-group" && (
          <div>
            <h1 className="tbwr-heading-md text-tbwr-white mb-2">How Old Is Your Athlete?</h1>
            <p className="text-gray-400 text-sm mb-8">
              Age determines which program pathway your athlete will enter.
            </p>
            <div className="flex flex-col gap-3">
              {([
                { value: "5-8", label: "5–8 Years Old", sub: "Little Champs pathway" },
                { value: "9-13", label: "9–13 Years Old", sub: "World Team pathway" },
                { value: "14+", label: "14 and Older", sub: "Future Olympians pathway" },
              ] as const).map((opt) => (
                <OptionCard
                  key={opt.value}
                  selected={answers.ageGroup === opt.value}
                  onClick={() => setAnswers({ ...answers, ageGroup: opt.value as AgeGroup })}
                >
                  <div>
                    <div className="font-bold text-sm">{opt.label}</div>
                    <div className="text-xs text-tbwr-gold mt-0.5">{opt.sub}</div>
                  </div>
                </OptionCard>
              ))}
            </div>
          </div>
        )}

        {/* ── Experience ── */}
        {currentStep === "experience" && (
          <div>
            <h1 className="tbwr-heading-md text-tbwr-white mb-2">Wrestling Experience</h1>
            <p className="text-gray-400 text-sm mb-8">
              How much wrestling experience does your athlete have?
            </p>
            <div className="flex flex-col gap-3">
              {([
                { value: "none", label: "No Experience", sub: "First time considering wrestling" },
                { value: "tried", label: "Tried It Once or Twice", sub: "A few practices or a short exposure" },
                { value: "one-season", label: "One Season or Less", sub: "Completed one youth season" },
                { value: "one-two-seasons", label: "1–2 Full Seasons", sub: "Some competitive experience" },
                { value: "three-plus-seasons", label: "3+ Seasons", sub: "Experienced competitor" },
              ] as const).map((opt) => (
                <OptionCard
                  key={opt.value}
                  selected={answers.experience === opt.value}
                  onClick={() => setAnswers({ ...answers, experience: opt.value as ExperienceLevel })}
                >
                  <div>
                    <div className="font-bold text-sm">{opt.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{opt.sub}</div>
                  </div>
                </OptionCard>
              ))}
            </div>
          </div>
        )}

        {/* ── Activity Level ── */}
        {currentStep === "activity" && (
          <div>
            <h1 className="tbwr-heading-md text-tbwr-white mb-2">Current Activity Level</h1>
            <p className="text-gray-400 text-sm mb-8">
              How active is your athlete right now, outside of wrestling?
            </p>
            <div className="flex flex-col gap-3">
              {([
                { value: "not-active", label: "Not Currently Active", sub: "Not participating in sports or structured activity" },
                { value: "recreational", label: "Recreational Activity", sub: "Plays casually, no structured training" },
                { value: "active-sport", label: "Active in Another Sport", sub: "Participating in at least one team or individual sport" },
                { value: "competitive-sport", label: "Competitive in Another Sport", sub: "Training and competing at a regional or travel level" },
              ] as const).map((opt) => (
                <OptionCard
                  key={opt.value}
                  selected={answers.activityLevel === opt.value}
                  onClick={() => setAnswers({ ...answers, activityLevel: opt.value as ActivityLevel })}
                >
                  <div>
                    <div className="font-bold text-sm">{opt.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{opt.sub}</div>
                  </div>
                </OptionCard>
              ))}
            </div>
          </div>
        )}

        {/* ── Goal ── */}
        {currentStep === "goal" && (
          <div>
            <h1 className="tbwr-heading-md text-tbwr-white mb-2">Primary Goal</h1>
            <p className="text-gray-400 text-sm mb-8">
              What is the primary reason you are considering TBWR for your athlete?
            </p>
            <div className="flex flex-col gap-3">
              {([
                { value: "active-healthy", label: "Keep My Child Active and Healthy", sub: "Physical fitness and healthy habits are the priority" },
                { value: "confidence-discipline", label: "Build Confidence and Discipline", sub: "Character development through structured sport" },
                { value: "compete-local", label: "Compete at Local and Regional Tournaments", sub: "Develop real competitive skills and win matches" },
                { value: "compete-elite", label: "Compete at a High or National Level", sub: "Serious development with elite ambitions" },
              ] as const).map((opt) => (
                <OptionCard
                  key={opt.value}
                  selected={answers.primaryGoal === opt.value}
                  onClick={() => setAnswers({ ...answers, primaryGoal: opt.value as PrimaryGoal })}
                >
                  <div>
                    <div className="font-bold text-sm">{opt.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{opt.sub}</div>
                  </div>
                </OptionCard>
              ))}
            </div>
          </div>
        )}

        {/* ── Availability ── */}
        {currentStep === "availability" && (
          <div>
            <h1 className="tbwr-heading-md text-tbwr-white mb-2">Weekly Availability</h1>
            <p className="text-gray-400 text-sm mb-8">
              How many days per week can your athlete commit to practice?
            </p>
            <div className="flex flex-col gap-3">
              {([
                { value: "1-day", label: "1 Day Per Week", sub: "One session per week" },
                { value: "2-days", label: "2 Days Per Week", sub: "Standard program commitment" },
                { value: "3-plus-days", label: "3 or More Days Per Week", sub: "Full development schedule" },
              ] as const).map((opt) => (
                <OptionCard
                  key={opt.value}
                  selected={answers.weeklyAvailability === opt.value}
                  onClick={() =>
                    setAnswers({ ...answers, weeklyAvailability: opt.value as WeeklyAvailability })
                  }
                >
                  <div>
                    <div className="font-bold text-sm">{opt.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{opt.sub}</div>
                  </div>
                </OptionCard>
              ))}
            </div>
          </div>
        )}

        {/* ── Review ── */}
        {currentStep === "review" && (
          <div>
            <h1 className="tbwr-heading-md text-tbwr-white mb-2">Review & Submit</h1>
            <p className="text-gray-400 text-sm mb-8">
              Confirm your information before submitting. Your pathway recommendation
              will be generated immediately.
            </p>

            <div className="flex flex-col gap-4 mb-8">
              <ReviewSection title="Your Information">
                <ReviewRow label="Name" value={`${parentInfo.firstName} ${parentInfo.lastName}`} />
                <ReviewRow label="Email" value={parentInfo.email || ""} />
                <ReviewRow label="Phone" value={parentInfo.phone || ""} />
                <ReviewRow label="City" value={parentInfo.city || ""} />
              </ReviewSection>

              <ReviewSection title="Athlete">
                <ReviewRow
                  label="Name"
                  value={`${athleteInfo.firstName} ${athleteInfo.lastName}`}
                />
                <ReviewRow label="Date of Birth" value={athleteInfo.dateOfBirth || ""} />
                <ReviewRow label="Gender" value={athleteInfo.gender || ""} />
              </ReviewSection>

              <ReviewSection title="Assessment">
                <ReviewRow label="Age Group" value={answers.ageGroup || ""} />
                <ReviewRow label="Experience" value={answers.experience || ""} />
                <ReviewRow label="Activity Level" value={answers.activityLevel || ""} />
                <ReviewRow label="Primary Goal" value={answers.primaryGoal || ""} />
                <ReviewRow label="Weekly Availability" value={answers.weeklyAvailability || ""} />
              </ReviewSection>
            </div>

            {errors.submit && (
              <div className="border border-red-500 bg-red-900/20 p-4 mb-6">
                <p className="text-red-400 text-sm">{errors.submit}</p>
              </div>
            )}
          </div>
        )}

        {/* ── Navigation ── */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-[#1a1a1a]">
          {stepIndex > 0 ? (
            <button
              type="button"
              onClick={back}
              className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-tbwr-white transition-colors"
            >
              ← Back
            </button>
          ) : (
            <div />
          )}

          {currentStep === "review" ? (
            <Button
              variant="primary"
              size="lg"
              loading={isSubmitting}
              onClick={handleSubmit}
            >
              Submit Assessment
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={next}
              disabled={
                currentStep !== "parent-info" &&
                currentStep !== "athlete-info" &&
                !canProceedAssessment(currentStep)
              }
            >
              Continue →
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ReviewSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-[#2a2a2a] bg-[#080808]">
      <div className="px-5 py-3 border-b border-[#2a2a2a]">
        <span className="text-xs font-bold uppercase tracking-widest text-tbwr-gold">
          {title}
        </span>
      </div>
      <div className="px-5 py-4 flex flex-col gap-3">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs font-bold uppercase tracking-widest text-gray-500 flex-shrink-0">
        {label}
      </span>
      <span className="text-sm text-tbwr-white text-right capitalize">
        {value.replace(/-/g, " ")}
      </span>
    </div>
  );
}
