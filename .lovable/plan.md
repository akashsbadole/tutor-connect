

# TutorHub — Phase 2: Authentication & Database Setup

Your frontend (landing, search, tutor profile pages) is already built. The next step is connecting a backend so data is real and users can sign up/log in.

**Important note:** This project uses **React + Vite** (not Next.js). Backend features will use **Lovable Cloud** (Supabase-powered), not Next.js API routes or Prisma.

---

## Step 1: Enable Lovable Cloud

Connect the project to Lovable Cloud to get a Supabase database and auth system.

## Step 2: Database Schema

Create these tables via migrations:

- **profiles** — `id (FK to auth.users)`, `full_name`, `avatar_url`, `bio`, `location`, `role_type` (student/tutor), `created_at`
- **user_roles** — `id`, `user_id (FK)`, `role` (enum: admin/moderator/user) — for security, separate from profiles
- **tutor_profiles** — `id`, `user_id (FK)`, `subjects` (text[]), `hourly_rate`, `experience_years`, `qualifications` (text[]), `availability` (jsonb)
- **bookings** — `id`, `tutor_id`, `student_id`, `start_time`, `end_time`, `duration_minutes`, `status` (pending/confirmed/completed/canceled), `notes`
- **reviews** — `id`, `booking_id (FK)`, `tutor_id`, `student_id`, `rating` (1-5), `comment`, `created_at`
- **messages** — `id`, `sender_id`, `receiver_id`, `content`, `created_at`, `read_at`

RLS policies on all tables. Auto-create profile on signup via database trigger.

## Step 3: Authentication Pages

- **/auth** page — Sign up / Log in tabs with email+password
- Role selection (student or tutor) during sign-up
- Post-signup redirect to profile completion form
- Password reset flow with `/reset-password` page
- Auth context provider wrapping the app
- Protected route wrapper for dashboards

## Step 4: Profile Completion

- After first login, redirect to a profile completion form
- Tutors fill: subjects, hourly rate, experience, qualifications, bio
- Students fill: subjects of interest, learning level
- Photo upload via Supabase Storage

## Step 5: Wire Up Existing Pages

- Replace mock data in search/tutor profile pages with Supabase queries
- Show real tutor data from `tutor_profiles` joined with `profiles`
- Update `TutorCard` and `TutorProfile` to use live data

## Step 6: Student & Tutor Dashboards

- `/dashboard` route with role-based views
- **Student dashboard**: upcoming bookings, past sessions, favorites
- **Tutor dashboard**: pending requests, earnings summary, availability editor

---

## Summary of New Files

- `src/integrations/supabase/` — client, types, hooks
- `src/pages/Auth.tsx` — login/signup
- `src/pages/ResetPassword.tsx`
- `src/pages/ProfileSetup.tsx`
- `src/pages/Dashboard.tsx`
- `src/components/AuthProvider.tsx`
- `src/components/ProtectedRoute.tsx`
- Database migrations for all tables + RLS + triggers

This is a large phase. I recommend implementing it incrementally — starting with Lovable Cloud setup, then auth, then database, then wiring pages.

