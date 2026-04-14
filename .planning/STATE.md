# Project State

## Project Reference
See: .planning/PROJECT.md (updated 2026-04-13)

**Core value:** Help the owners fill their monthly booking slots and grow their customer base

**Current focus:** Phase 2 — Bookings + CRM + Revenue

## Current Phase
Phase 1: Scaffold + Auth
Status: Complete

## Phase Summary
| Phase | Name | Status |
|-------|------|--------|
| 1 | Scaffold + Auth | Complete |
| 2 | Bookings + CRM + Revenue | Not started |
| 3 | Social Planner + AI Content | Not started |
| 4 | Demographics Feed | Not started |

## Last Activity
Phase 1 completed 2026-04-14. All 3 plans executed, code reviewed, fixes applied, UAT passed (6/7 — middleware path bug fixed inline).

## Key Decisions
- Next.js 15 App Router, Tailwind v4, shadcn/ui
- Supabase for auth + database
- Resend for password reset email (SMTP configured via Supabase dashboard)
- America/Chicago timezone for booking window logic
- middleware.ts must live at src/middleware.ts (src/ layout convention)

## Notes
- Vercel deployment pending (human action — requires GitHub repo connect + env vars in Vercel dashboard)
- Resend SMTP setup pending (human action — requires domain verification in Supabase dashboard)
- Owner accounts seeded: owner1@littleroyaltyspa.com, owner2@littleroyaltyspa.com (temp passwords set)
