# TBWR Platform — Phase 1

**The Best Wrestler** — Athlete Entry & Onboarding System

Built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

---

## Product Summary

TBWR Phase 1 is a purpose-built athlete onboarding system for a premium youth wrestling club. It replaces generic gym software with a structured, brand-correct entry experience that routes every athlete to the right program from day one.

**Public Flow:**
1. Landing page → Assessment (5 questions) → Routing result → Availability form → Confirmation

**Admin System:**
- Dashboard with live stats
- Full leads list with filtering
- Individual lead detail + status management
- Athletes view (enrolled/scheduled)

**Routing Logic:**
- Score-based (experience + goal + availability + activity)
- Premium Entry (score ≥7 or elite goal) → 1-on-1 evaluation
- Standard Entry (score 4–6) → Free trial session
- Not Ready (score ≤3) → Nurture track

**Pathways:**
- Little Champs (ages 5–8)
- World Team (ages 9–13)
- Future Olympians (ages 14+)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Deployment | Vercel |

---

## Quick Start

### 1. Clone and Install

```bash
git clone <repo>
cd tbwr-platform
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the schema:

```bash
# Copy the contents of supabase/schema.sql into the Supabase SQL editor and run it
```

3. Create an admin user:
   - Go to **Authentication → Users → Invite User**
   - Enter your admin email
   - Or use the Supabase dashboard to create a user directly

### 3. Configure Environment

```bash
cp .env.local.example .env.local
```

Fill in your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Find these values in your Supabase project under **Settings → API**.

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

Admin panel: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "TBWR Phase 1 — initial build"
git push origin main
```

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repository
3. Framework preset: **Next.js** (auto-detected)

### 3. Set Environment Variables

In Vercel project settings → Environment Variables, add:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_APP_URL  (set to your Vercel URL)
```

### 4. Deploy

Click **Deploy**. Vercel handles the build automatically.

### 5. Supabase Auth Redirect URLs

In Supabase → Authentication → URL Configuration:
- Site URL: `https://your-vercel-url.vercel.app`
- Redirect URLs: `https://your-vercel-url.vercel.app/**`

---

## File Structure

```
├── app/
│   ├── page.tsx                    # Landing page
│   ├── assessment/page.tsx         # Assessment flow
│   ├── result/page.tsx             # Routing result
│   ├── schedule/page.tsx           # Availability form
│   ├── confirmation/page.tsx       # Confirmation
│   ├── admin/
│   │   ├── layout.tsx              # Auth-protected layout
│   │   ├── page.tsx                # Dashboard
│   │   ├── login/page.tsx          # Admin login
│   │   ├── leads/
│   │   │   ├── page.tsx            # Leads list
│   │   │   └── [id]/page.tsx       # Lead detail
│   │   └── athletes/page.tsx       # Athletes view
│   └── api/
│       ├── submit-assessment/      # Assessment submission
│       ├── submit-availability/    # Availability submission
│       └── admin/leads/            # Admin CRUD
├── components/
│   ├── ui/                         # Button, Card, Badge, Input, Select
│   ├── layout/                     # Header, Footer
│   ├── assessment/                 # AssessmentFlow, ResultPage, ScheduleForm
│   └── admin/                      # AdminNav, LeadDetailClient
├── lib/
│   ├── supabase/                   # client.ts, server.ts
│   ├── routing/logic.ts            # Scoring + routing algorithm
│   └── utils.ts                    # Formatters, helpers
├── types/index.ts                  # All TypeScript types
├── supabase/schema.sql             # Database schema
└── middleware.ts                   # Auth protection
```

---

## Phase 2 Extension Points

The codebase is structured to support future phases without rebuilds.

**Parent Dashboard**
- Add `parents` table with auth login
- Extend `leads` with `athlete_id` FK
- Build `/parent/*` routes with athlete visibility

**Coach System**
- Add `coaches` table
- Replace text `assigned_coach` field with FK
- Build `/admin/coaches` management

**Attendance Tracking**
- Add `sessions` and `attendance` tables
- Extend athlete detail with session history

**Athlete Progression (Phase 3)**
- Add `milestones` and `skill_progressions` tables
- Build progression ladder UI under athlete profile

**Email Integration (ready now)**
- Install Resend: `npm install resend`
- Uncomment email calls in `/api/submit-assessment/route.ts`
- Uncomment email calls in `/api/submit-availability/route.ts`
- Create `/lib/email/resend.ts` with your templates

---

## Admin Access

1. Navigate to `/admin/login`
2. Use the email/password of your Supabase admin user
3. Full access to: Dashboard, Leads, Athletes

---

## Brand Reference

| Token | Value |
|-------|-------|
| Black | `#000000` |
| Gold | `#CEAA45` |
| White | `#FFFFFF` |
| Charcoal | `#333333` |

Tailwind classes: `text-tbwr-gold`, `bg-tbwr-gold`, `text-tbwr-black`, `bg-tbwr-charcoal`
