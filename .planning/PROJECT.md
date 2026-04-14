# Little Royalty Spa — Business Dashboard

## What This Is

A responsive web app for Little Royalty Spa LLC, a mobile spa party service for girls ages 3–10 in Rockwall County, Texas. The app helps the owners manage social media marketing campaigns, track bookings and customers, and discover new potential customers through area demographics (new residents, home purchases). Used daily by the husband-and-wife team running the business.

## Core Value

Help the owners fill their monthly booking slots and grow their customer base — everything else supports that goal.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

(None yet — ship to validate)

### Active

<!-- Current scope. Building toward these. -->

**Social Media Marketing**
- [ ] Campaign planner — plan multi-post campaigns around monthly booking openings, holidays (Valentine's Day, Mother's Day, Christmas), back-to-school, and local events
- [ ] Content generator — produce post ideas, captions, and hashtags tailored to Little Royalty Spa's brand for Facebook, Instagram, and TikTok (@littleroyaltyspa)

**Sales & Customer Tracking**
- [ ] Booking tracker — log party bookings with date, location, party size, services, and revenue
- [ ] Customer profiles — store contact info, booking history, repeat customer flags, and referral source
- [ ] Monthly revenue dashboard — summarize bookings and revenue by month; compare against prior periods
- [ ] Waitlist tracking — capture inquiries from families who missed the monthly booking window; gauge demand

**Area Demographics**
- [ ] New residents feed — surface new homeowners and recent move-ins in Heath, Rockwall, Fate, Royse City, Caddo Mills and surrounding ZIP codes
- [ ] Market insights — neighborhood-level data on family demographics, income ranges, and home purchase trends to inform where to focus marketing

### Out of Scope

- Online customer-facing booking portal — booking is managed manually (opens 1st of month at 9am); a public-facing booking flow is not needed for v1
- Inventory management — no products requiring stock tracking beyond Spa in a Box (tracked as a booking add-on, not a full inventory system)
- Staff scheduling — owner-operated; no multi-staff scheduling needed

## Context

- **Business model:** Mobile spa parties come to the customer's home. Booking opens the 1st of each month at 9am CST for the following month. Spots fill fast — demand exceeds supply.
- **Product:** Spa in a Box party favor kit ($65, regularly $75) sold as an add-on or standalone.
- **Services:** Mini manicure, mini pedicure, whipped cream cucumber facial. Entertainment only — no nail alterations.
- **Service area:** Heath, Rockwall, Fate, Royse City, Caddo Mills, TX and surrounding areas.
- **Brand:** Playful, girly, magical. Pink and rose tones, princess/royalty theme. Warm for parents, exciting for kids.
- **Social handles:** @littleroyaltyspa on Facebook, Instagram, TikTok.
- **Contact:** (972) 697-3003 · info@littleroyaltyspaparties.com
- **Users:** Husband and wife team. Responsive app — used on phone and desktop.
- **Demographics goal:** New families moving into Rockwall County are prime prospects. Identifying new residents and recent home purchases gives a warm outreach list.

## Constraints

- **Users:** Two owners (husband + wife) — no multi-tenant or role-based access needed for v1
- **Scale:** Small business; no need for enterprise-level infrastructure
- **Demographics data:** Will depend on available public data sources or affordable APIs (USPS, county records, real estate APIs)
- **Social posting:** App generates content and plans — it does not auto-post to social platforms in v1 (copy/paste workflow)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Responsive web app (not native mobile) | Works on both phone and desktop without app store friction | — Pending |
| Social content generation, not auto-posting | Simpler v1; avoids OAuth complexity with FB/IG/TikTok APIs | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-13 after initialization*
