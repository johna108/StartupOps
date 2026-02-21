# StartupOps - Product Requirements Document

## Original Problem Statement
Build "StartupOps" - a unified digital platform that acts as an operational workspace for early-stage founders. Part of IIT Jammu Techpreneur (Udyamotsav '26) competition.

## Architecture
- **Frontend**: React + Tailwind CSS + Shadcn UI + @supabase/supabase-js
- **Backend**: FastAPI + MongoDB + supabase-py (auth verification) + emergentintegrations (Gemini AI)
- **Auth**: Supabase Auth (Google OAuth + Email/Password)
- **Database**: MongoDB for app data, Supabase for auth
- **AI**: Google Gemini 2.5 Flash via emergentintegrations library

## User Personas
1. **Founder**: Full access - creates startup, manages team, views analytics, generates pitch
2. **Team Member**: Limited access - assigned tasks, milestones, feedback submission

## Core Requirements (Mandatory Modules)
1. Authentication & Authorization (Supabase Auth + role-based access)
2. Startup Profile & Workspace (CRUD, editable, scalable)
3. Task & Milestone Tracking (Kanban board, milestones, progress)
4. Feedback & Validation System (categories, ratings, internal/external)
5. Analytics Dashboard (task trends, milestone progress, charts)

## Bonus Features
1. AI-Based Insights (Gemini - general, tasks, milestones, growth)
2. Investor Pitch Generator (AI-powered pitch outlines)
3. Mock Payment Integration (Free/Pro/Scale plans)
4. Cloud Deployment (live hosted application)

## What's Been Implemented (Feb 7, 2026)
- [x] Landing page with hero, features, CTA sections
- [x] Auth page (email/password + Google OAuth via Supabase)
- [x] Onboarding with role selection (Founder vs Team Member)
- [x] Create workspace flow for Founders
- [x] Join workspace flow for Team Members (via invite code)
- [x] Dashboard layout with glassmorphism sidebar
- [x] Dashboard overview with stats and recent activity
- [x] Kanban task board (4 columns, create/edit/delete, priority, assignee)
- [x] Milestone tracking with progress bars and task linking
- [x] Feedback & Validation system (categories, ratings, filters)
- [x] Analytics dashboard (Recharts - bar, pie, line charts)
- [x] AI Insights page (4 insight types via Gemini)
- [x] Investor Pitch Generator (AI-powered)
- [x] Team management (invite codes, member list, remove)
- [x] Settings page (profile, startup, subscription)
- [x] Pricing page (3 tiers with mock subscription)
- [x] Dark/Light theme toggle
- [x] Role-based access (founder vs member)
- [x] Responsive design (mobile + desktop)
- [x] Demo mode with pre-populated sample data

## Bug Fixes (Feb 7, 2026)
- [x] Fixed "Invalid token" error on workspace creation after Google OAuth
  - Root cause: OnboardingPage used session.access_token directly without null check
  - Fix: Use getAuthHeaders() from AuthContext which handles null sessions gracefully
- [x] Fixed AuthCallbackPage to properly wait for session verification before redirect
- [x] Fixed HTML nesting issue in DashboardOverview (Badge inside p tag)
- [x] Fixed demo setup endpoint to handle duplicate invite codes

## Business Model
- Free: $0/mo - 1 startup, 5 members, basic features
- Pro: $19/mo - Unlimited members, AI insights, pitch generator
- Scale: $49/mo - Multiple startups, advanced analytics, API access

## Judging Criteria Coverage
- Problem Understanding (20%): Clear startup execution problem addressed
- Tech Implementation (30%): Clean FastAPI + React + Supabase + MongoDB + Gemini AI
- UI/UX (15%): Glassmorphism dark theme, orange accents, responsive, accessible
- Business Logic (20%): Role-based access, subscription tiers, realistic workflows
- Innovation & Scalability (15%): AI-powered insights, pitch generation, scalable architecture

## Prioritized Backlog
### P0 (Done)
- All mandatory modules implemented
- All bonus features implemented
- Auth bugs fixed

### P1 (Next)
- Real-time task updates via WebSockets
- File attachment support for tasks
- Email notifications for task assignments
- Export analytics as PDF

### P2 (Future)
- Integration with Slack/Discord
- Custom dashboard widgets
- Multi-language support
- Mobile app (React Native)
