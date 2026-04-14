# Little Royalty Spa Dashboard — Pitfalls & Risk Register

> Research date: 2026-04-13
> Project: Little Royalty Spa LLC — Business Dashboard
> Audience: Developer building a small-business dashboard for two non-technical owners

---

## How to Read This Document

Each pitfall entry follows this structure:

- **What it is** — plain description of the failure mode
- **Warning signs** — detectable signals that you are heading toward this pitfall
- **Prevention strategy** — specific actions that avoid or recover from it
- **Phase / feature** — which part of the project is most at risk

Pitfalls are grouped by domain. Severity ratings: **Critical** (will kill adoption or blow budget), **High** (serious rework), **Medium** (friction and frustration), **Low** (minor but worth noting).

---

## Domain 1: Demographics Data Sources

### PITFALL D-1 — Assuming "New Resident" Data Is Free and Real-Time
**Severity: Critical**

The project goal is to surface new homeowners and move-ins in Rockwall County ZIP codes. There is no single free, real-time, structured API that delivers this. Free sources are either lagged by months, require manual retrieval, or cover only part of the picture. Paid sources are real but cost $200–$2,000+/month at the tier that gives useful lead counts.

**The specific failure:** A developer builds the "New Residents Feed" UI before confirming data actually flows into it. The feature ships empty or populated with data that is 90 days stale.

**Common source categories and their actual limitations:**

| Source | What it provides | Lag | Cost | Gotcha |
|--------|-----------------|-----|------|--------|
| USPS National Change of Address (NCOA) | Forwarding address changes | 4–8 weeks | Requires licensed reseller access; not directly accessible | Cannot be queried ad hoc; must go through approved data vendors |
| County Appraisal District records (Rockwall CAD) | Property sales, new ownership | 30–90 days | Free (public records) | Structured scraping/download only; no official API; deed recording lag varies |
| MLS / real estate listing feeds (RESO/IDX) | Active and closed home sales | Near real-time for listings; 1–2 week lag for closes | Requires MLS membership or broker partnership; $50–$500/month via aggregators | Closed-sale buyer contact info is almost never included |
| ATTOM Data / CoreLogic / First American | Property + ownership + demographics | 1–4 weeks | $300–$2,000+/month at useful tier | High-quality but priced for enterprises; trial tiers are very restricted |
| Smarty (formerly SmartyStreets) | Address verification only | Real-time | Free tier exists | Does NOT provide new-resident data; often confused with NCOA |
| Data Axle / Acxiom new mover lists | Consumer new-mover lists with contact info | 2–4 weeks | $0.10–$0.50 per record; minimum orders common | Privacy regulations (CAN-SPAM, CCPA, Texas TDPSA) constrain how contact info can be used |
| Melissa Data | New movers, NCOA processing | 2–4 weeks | Per-record pricing; API access adds cost | Similar to Data Axle; contact use governed by terms of service |

**Warning signs:**
- Sprint planning mentions "pull from USPS API" without confirming that API exists in a usable form
- The demographic feature is mocked with static data "for now" and that state persists past two sprints
- Budget discussions assume $0 for demographic data

**Prevention strategy:**
1. Before writing a single line of demographic UI code, prototype the data pipeline. Fetch one month of Rockwall CAD transfer records manually and confirm the format, lag, and useful fields.
2. Set a data budget line item. Even $50–$150/month for a targeted new-mover API is reasonable for this use case; surface this cost to the owners before building the feature.
3. Treat Rockwall CAD public records as the baseline free source. Downloads are available; build a parser for their format. Accept the lag (~60 days) as a known constraint and document it in the UI ("Data reflects deeds recorded through [date]").
4. Do not promise real-time new-resident alerts. The realistic product is a refreshed list (weekly or biweekly) of recent property transfers.
5. Evaluate one paid API (ATTOM or Melissa) with a trial before committing to architecture. The free tier will not tell you what the paid tier actually returns.

**Phase / feature:** Area Demographics — New Residents Feed, Market Insights

---

### PITFALL D-2 — Confusing Property Transfer Data with "Family with Young Children" Data
**Severity: High**

The owners' real target is families with girls ages 3–10. A property transfer record tells you that someone bought a house. It does not tell you whether they have children, what ages, or whether they fit the spa-party customer profile.

**The specific failure:** The app surfaces 200 new homeowners per month. The owners spend time outreaching all 200. Half are retirees, single professionals, or investors. Trust in the tool erodes.

**Warning signs:**
- The feature is described as "new residents" without any filter or qualification layer
- No discussion of what a "qualified prospect" actually looks like vs. a raw property record

**Prevention strategy:**
1. Clearly label the feed as "Recent Property Transfers" — set expectations that it is a prospecting starting point, not a pre-qualified lead list.
2. Explore demographic overlay fields available from ATTOM or similar (estimated household size, presence of children) as a filter — but treat this as a Phase 2 enhancement, not a v1 requirement.
3. Help the owners develop a simple qualification habit: cross-reference the neighborhood against known family-friendly areas (new subdivision vs. 55+ community).
4. Consider that the owners' existing social following and word-of-mouth referrals likely outperform cold outreach to strangers. Position demographics as supplemental, not primary.

**Phase / feature:** Area Demographics — New Residents Feed, Market Insights

---

### PITFALL D-3 — Building a Scraper Against County Records Without Monitoring It
**Severity: Medium**

If the architecture uses county appraisal district records (a reasonable free source), these are typically downloaded as CSV exports or scraped from public portals. County websites change formats without notice. A broken scraper silently returns zero records, and the owners don't know whether the feed stopped because there are no new transfers or because the pipeline broke.

**Warning signs:**
- No alerting when a data fetch returns empty results
- No last-fetched timestamp displayed in the UI
- County data format changes go unnoticed for weeks

**Prevention strategy:**
1. Store and display a "Last updated" timestamp prominently on the demographics feed.
2. Add a simple sanity check: if a weekly fetch returns zero records (which is statistically near-impossible in Rockwall County), fire an alert to the developer/admin email.
3. Treat county portal changes as maintenance events, not bugs. Schedule a quarterly review of the scraper.

**Phase / feature:** Area Demographics — New Residents Feed

---

## Domain 2: AI Content Generation

### PITFALL C-1 — Brand Voice Drift Over Repeated AI Generations
**Severity: High**

Little Royalty Spa has a distinct brand voice: playful, magical, princess/royalty-themed, warm for parents, exciting for kids, pink-and-girly aesthetic. AI language models will default toward generic small-business social media language unless the prompt is precisely engineered and consistently applied. After 20–30 generations, the copy sounds like every other children's party vendor.

**The specific failure:** The generated captions start using phrases like "Book now and save!" or "Quality service for your little one!" instead of on-brand language. The owners start editing every output heavily, decide it "doesn't sound like us," and stop using the tool.

**Warning signs:**
- Generated output uses generic service-business language without royalty/princess/magical vocabulary
- Captions feel interchangeable with competitors' content
- The owners say "It's close but not quite right" every time
- No documented brand voice guide exists in the system prompt

**Prevention strategy:**
1. Write a brand voice document before building the content generator. Include:
   - Vocabulary to use: magical, royal, princess, sparkle, pamper, enchanted, little royalty, fairy tale, crowned, glow-up (kid version)
   - Vocabulary to avoid: book now, quality service, professional, affordable, limited time offer
   - Tone descriptors: warm and inviting for moms; wonder and excitement for girls; never clinical, never salesy
   - 5–8 real example posts the owners have written or approved (gold-standard references)
2. Embed this brand voice context directly into every AI system prompt — not as an afterthought but as the first section.
3. Use few-shot examples in the prompt (show the model 2–3 good posts before asking it to generate a new one).
4. Create a feedback loop: when the owners mark a generated post as "good" or "bad," log what made it good/bad. Refine the prompt quarterly.
5. Never let the owners see only the AI output — show them 3 variations and let them pick and edit. This keeps them engaged rather than frustrated.

**Phase / feature:** Social Media Marketing — Content Generator

---

### PITFALL C-2 — Ignoring Platform-Specific Content Norms
**Severity: High**

Facebook, Instagram, and TikTok have completely different content conventions. A caption that works on Facebook (longer, conversational, can include a link) will perform poorly on TikTok (short, trend-aware, hashtag-heavy, conversational/raw). Generating one post and copying it to all three platforms is a common mistake that non-technical owners may not catch.

**Warning signs:**
- The content generator produces a single output without platform selection
- Generated TikTok content looks like a Facebook ad
- Hashtag sets are identical across platforms
- No word count or format guidance per platform is in the UI

**Prevention strategy:**
1. Force platform selection before generation. Do not generate a generic "social media post." Generate a Facebook post, an Instagram caption, or a TikTok hook — as separate outputs.
2. Encode platform rules in the prompt:
   - **Facebook:** 1–3 sentences, can mention the phone number or how to book, community-oriented language, 3–5 hashtags max
   - **Instagram:** 3–5 punchy lines + line break + 10–20 relevant hashtags; emojis encouraged; no clickable links in caption
   - **TikTok:** Hook in first 3 words, casual/energetic, 3–5 trending niche hashtags, 1–2 sentences max if text appears on-screen
3. For v1 (copy/paste workflow), make the platform difference visible in the UI — label outputs clearly so the owners aren't confused about what goes where.

**Phase / feature:** Social Media Marketing — Content Generator, Campaign Planner

---

### PITFALL C-3 — Prompt Injection via User Input Fields
**Severity: Medium**

If the content generator accepts free-text inputs from the owners (e.g., "describe this party," "any special notes"), and those inputs are passed directly into the AI prompt, a malformed or unusually formatted input can break the generation or produce unexpected results. While not a security threat from external users (only two users exist), it is a reliability issue.

**Warning signs:**
- Free-text fields in the generator UI have no validation or character limits
- Unusual inputs (quotes, colons, formatting characters) cause generation failures
- No error handling when the AI returns an unusable response

**Prevention strategy:**
1. Sanitize user inputs before injecting them into prompts — strip markdown formatting, limit to 500 characters for description fields.
2. Wrap all user-provided content in clearly delimited sections in the prompt (e.g., `[USER INPUT START] ... [USER INPUT END]`).
3. Validate AI output before displaying it: if the response is empty, shorter than 20 characters, or contains obvious error language, show a "Try regenerating" UI state rather than blank content.

**Phase / feature:** Social Media Marketing — Content Generator

---

### PITFALL C-4 — Over-Automating the Content Workflow
**Severity: Medium**

The PROJECT.md correctly scopes v1 as copy/paste (no auto-posting). This is the right call. The pitfall is scope creep pressure after launch: "Can it just post automatically?" The moment auto-posting is added, you inherit OAuth complexity, token refresh management, platform policy review requirements, and the risk of a mis-scheduled post going live during a family tragedy or national crisis.

**Warning signs:**
- Auto-posting is added to the roadmap informally after a few weeks
- The owners ask for it and it gets treated as a small add-on
- No discussion of platform review processes or inappropriate-timing risk

**Prevention strategy:**
1. Keep auto-posting explicitly out of scope for v1 AND v2. Document the rationale in PROJECT.md.
2. If scheduling is eventually desired, use a platform like Buffer or Later as the posting layer — do not build it. The dashboard generates content; a dedicated scheduler tool posts it. This is a much safer and more maintainable architecture.
3. If the owners request it, explain the tradeoffs: API approval processes (especially Meta), token management, and the "posted at the wrong time" risk.

**Phase / feature:** Social Media Marketing — Campaign Planner (future scope creep risk)

---

## Domain 3: Social Media API Restrictions

### PITFALL S-1 — Misunderstanding Meta's Graph API Access Tiers
**Severity: Critical** (if any Meta API integration is planned)

Since v1 uses a copy/paste workflow, this pitfall is currently avoided. However, it becomes critical the moment any developer or owner asks "why don't we read our post analytics?" or "can we pull our follower count?"

Meta's Graph API has three access tiers:
- **Standard Access (default):** Can read only data the app itself created. Cannot read organic post performance, follower demographics, or historical data for most endpoints.
- **Advanced Access:** Requires app review by Meta. Review takes 1–4 weeks. Requires a privacy policy, business verification, and specific use-case justification. Many analytics endpoints require this tier.
- **Instagram Creator/Business account:** Required even to access basic Instagram Graph API endpoints. A personal account has no API access at all.

**Warning signs:**
- "Reading our Instagram analytics" is added to the roadmap without a note about API review
- The developer assumes API access works like it did in 2018–2020 (it does not — Meta tightened access significantly after Cambridge Analytica)
- No Meta Developer App exists yet, and a feature depending on it is scheduled for the next sprint

**Prevention strategy:**
1. Do not plan any Meta API integration without first reading the current Graph API changelog and access tier documentation.
2. For analytics/insight data: evaluate third-party tools (Metricool, Later Analytics, Hootsuite) as an alternative — they already have API access and present data in a dashboard. Do not rebuild what they do.
3. If Meta integration is ever scoped: create the developer app early, start the review process immediately, and assume 2–4 weeks of approval delay minimum.
4. For this project specifically: the copy/paste workflow is the right v1 architecture. Defend it.

**Phase / feature:** Social Media Marketing — any future API integration

---

### PITFALL S-2 — TikTok API Instability and Policy Risk
**Severity: High** (if TikTok integration ever planned)

TikTok's developer API has been in flux due to ongoing U.S. regulatory scrutiny. The Content Posting API (which allows third-party apps to post videos) has restricted access and requires approval. The Login Kit and Display API (for reading user data) have similarly restricted tiers. Additionally, TikTok for Business and TikTok Creator accounts have separate API surfaces.

The policy environment is volatile: TikTok has faced multiple near-bans in the U.S. as of 2025–2026. Any integration built on TikTok APIs carries platform-discontinuation risk.

**Warning signs:**
- TikTok posting or analytics integration is added to a sprint without checking current API availability
- The assumption is that TikTok API works like Instagram API (it does not)
- No contingency for "TikTok loses U.S. access"

**Prevention strategy:**
1. For v1 and v2: treat TikTok as copy/paste only. The content generator produces a TikTok-optimized caption and hashtag set; the owner opens TikTok and pastes it.
2. Do not build any TikTok API integration until the U.S. regulatory situation stabilizes. This is not defeatism — it is correct risk management.
3. If TikTok integration is eventually desired, use a scheduling tool (Buffer, Later) as the intermediary rather than direct API calls.

**Phase / feature:** Social Media Marketing — TikTok content (all phases)

---

### PITFALL S-3 — Hashtag Strategy Becoming Stale
**Severity: Low**

AI-generated hashtag sets will reflect training data that may be months to years old. Popular hashtags shift. On Instagram, overly large hashtag groups (20+) are now penalized by the algorithm compared to 2019–2021. On TikTok, trending hashtags change weekly.

**Warning signs:**
- The same hashtag set is used in every generated post
- No mechanism to update or refresh the hashtag library
- The owners never edit hashtags before posting

**Prevention strategy:**
1. Prompt the AI to generate 3 tiers of hashtags: brand-specific (always use: #littleroyaltyspa, #sparty, #kidsspa), niche (moderate rotation: #girlsparty, #princessparty, #mobilespa), and trending/seasonal (rotate: #valentinesday, #backtoschool, #mothersdaygift).
2. Review and update the hashtag library quarterly — make it a simple editable list in the app settings, not hardcoded in the prompt.
3. Keep Instagram hashtag count to 5–10 per post (current best practice for reach, as of 2025).

**Phase / feature:** Social Media Marketing — Content Generator

---

## Domain 4: CRM and Booking Tracker

### PITFALL B-1 — Building More CRM Than Two People Will Use
**Severity: Critical**

This is the most common reason small-business dashboards get abandoned. A developer sees a CRM feature and imagines all the useful data that could be captured: lead source, conversion stage, follow-up date, communication log, tags, custom fields, notes, last contact date. The owners open the app to log a booking, see 14 fields, and close the tab. They go back to their phone notes or a paper calendar.

The right CRM for two non-technical owners of a service business with ~30–60 parties/year is aggressively minimal.

**Warning signs:**
- The booking entry form has more than 8 fields
- "Pipeline stages" or "lead scoring" appear in the design
- The design requires multiple screens to log a single booking
- There is a separate "lead" vs. "customer" distinction before a booking is confirmed

**Prevention strategy:**
1. Define the minimum data the owners actually need to run their business. Based on PROJECT.md, that is: customer name, phone/email, party date, location, party size, services booked, add-ons (Spa in a Box), revenue, and referral source. That is 8–9 fields. That is the whole form.
2. Make logging a new booking completable in under 60 seconds on a phone. Test this with the actual owners before calling it done.
3. Defer every "nice to have" CRM field to a validated-need list. Add them only if the owners ask for them after using the app.
4. The repeat customer flag and referral source are genuinely useful for this business (knowing who refers, which clients book again). Keep those. Everything else is optional.
5. Use progressive disclosure: show the 5 most important fields by default; hide "advanced" fields behind an expand toggle.

**Phase / feature:** Sales & Customer Tracking — Booking Tracker, Customer Profiles

---

### PITFALL B-2 — The Waitlist Feature Becoming Confusing Without Clear State
**Severity: Medium**

The waitlist captures inquiries from families who missed the monthly booking window. This is genuinely valuable. The pitfall is that waitlist entries can exist in several ambiguous states: "expressed interest," "confirmed on waitlist," "contacted when slot opened," "booked," "no longer interested." Without clear state management, the list becomes a pile of names with no actionable meaning.

**Warning signs:**
- The waitlist is a simple list with no status field
- There is no way to mark a waitlist entry as "contacted" or "converted"
- The owners do not know whether people on the waitlist are current or stale

**Prevention strategy:**
1. Give each waitlist entry exactly 3 states: **Waiting** (active), **Contacted** (owner reached out when slot opened), **Converted** (became a booking) or **Removed** (no longer interested / became stale).
2. Include a "date added" field so the owners can see how long someone has been waiting and make judgment calls about staleness.
3. Make converting a waitlist entry to a booking a single button action, not a manual re-entry.

**Phase / feature:** Sales & Customer Tracking — Waitlist Tracking

---

### PITFALL B-3 — Revenue Dashboard That Requires Manual Reconciliation
**Severity: Medium**

The monthly revenue dashboard is straightforward if bookings are entered consistently. It becomes useless (and trust-destroying) if bookings are sometimes entered, sometimes not, or if the revenue field is sometimes blank. The owners will open the dashboard, see numbers that don't match what they know, and stop trusting it.

**Warning signs:**
- No "incomplete booking" validation — the form allows saving without a revenue amount
- There is no visual indicator of data completeness (e.g., "3 bookings this month have no revenue entered")
- The dashboard has no "last updated" context

**Prevention strategy:**
1. Make revenue a required field for the booking form. If the owner doesn't know the final number yet, provide a "pending" flag — but prompt them to resolve it.
2. Show a data completeness indicator on the dashboard: "2 bookings have no revenue — tap to complete."
3. The dashboard should surface its own data quality, not silently show incomplete numbers.

**Phase / feature:** Sales & Customer Tracking — Monthly Revenue Dashboard

---

### PITFALL B-4 — Not Designing for Phone-First Entry
**Severity: High**

The owners are a husband-and-wife team running a mobile spa party service. They will often log a booking or customer note from their phone, not a desktop. If the booking form is designed desktop-first and then "made responsive," phone usability will be poor: tiny tap targets, horizontal scroll, keyboard covering inputs.

**Warning signs:**
- Design mockups are all desktop-width
- "Mobile responsive" is treated as a CSS afterthought, not a design constraint
- No one has tested form entry on an actual phone with a soft keyboard open

**Prevention strategy:**
1. Design forms mobile-first. Every interactive element (buttons, inputs, dropdowns) should be designed for a 375px viewport as the primary case.
2. Specifically test: opening a booking entry form, filling all fields with the soft keyboard active, and submitting — on an actual iOS or Android device.
3. Use large tap targets (minimum 44px height for inputs), avoid horizontal scroll in forms, and ensure the submit button is always visible or at the bottom of the scroll.

**Phase / feature:** All Sales & Customer Tracking features; also Social Media copy/paste workflow

---

## Domain 5: Over-Engineering for a Two-Person Team

### PITFALL O-1 — Authentication and Authorization Complexity for Two Users
**Severity: High**

With only two users (husband and wife), there is no meaningful role-based access requirement, no multi-tenant concern, no audit log requirement. A developer accustomed to building SaaS apps will instinctively add: user accounts, email verification, password reset flow, session management, role definitions, and possibly OAuth login. All of this is maintenance burden and friction for a two-person internal tool.

**Warning signs:**
- The auth system is designed before the core features are built
- "Role-based access control" appears in the design
- The owners are asked to create accounts and verify email addresses just to use their own tool
- Login friction causes either owner to stop using the app after a busy week away

**Prevention strategy:**
1. For v1: a single shared password (HTTP Basic Auth or a simple app-level passphrase) is acceptable security for an internal tool on a private domain. The owners are not adversaries.
2. If individual accounts are desired (e.g., to see "who added this booking"), use a single magic-link or passphrase-per-user approach — not a full auth framework.
3. Do not add email verification, password complexity requirements, or 2FA for v1. Add them only if the owners ask or if the app is exposed to a broader internet without rate limiting.
4. Keep the login experience to one step on mobile.

**Phase / feature:** All phases — infrastructure decision made at the start

---

### PITFALL O-2 — Infrastructure Sized for Scale That Will Never Come
**Severity: Medium**

Two users, ~30–60 bookings per year, ~200 demographics records per month. This is a small-data, low-traffic application. A developer who defaults to Kubernetes, microservices, Redis caching, or a full managed PostgreSQL cluster is over-engineering for a use case that a $5–$20/month VPS or a serverless platform handles trivially.

**Warning signs:**
- Infrastructure costs exceed $50/month before the app has its first real user
- The deployment pipeline has more components than the application itself
- "Horizontal scaling" appears in any planning document
- Database migrations require a specialist

**Prevention strategy:**
1. Start with the simplest possible infrastructure: a single server or serverless function + a managed SQLite or lightweight Postgres instance (e.g., Turso, Railway, Supabase free tier).
2. Set an infrastructure budget ceiling: $30/month maximum until the business validates the tool is genuinely valuable. Revisit after 6 months of real use.
3. Choose tools the developer can maintain alone without DevOps support — the owners cannot debug a broken Kubernetes cluster.

**Phase / feature:** All phases — infrastructure decision made at the start

---

### PITFALL O-3 — Feature Creep Driven by Developer Enthusiasm
**Severity: High**

Small business dashboards are rich with "wouldn't it be cool if..." opportunities. A developer working closely with owners will hear ideas in every conversation and feel pressure to add them. Each addition delays delivery of the core tool, increases complexity, and risks shipping a feature the owners don't actually use.

The owners' most valuable features are the ones that help fill the monthly booking slots. Everything else is a distraction until those features are validated.

**Warning signs:**
- The sprint includes features from PROJECT.md's Out of Scope section
- "While I'm in there I'll also add..." reasoning appears in pull requests
- The owners mention a feature once in conversation and it appears in the next sprint
- Demo sessions spend more time on secondary features than on the booking workflow

**Prevention strategy:**
1. Treat PROJECT.md's Active list as a hard constraint, not a suggestion. Build exactly those features; defer everything else.
2. Use a "parking lot" list for new ideas. Add them to a separate backlog; do not act on them until the Active features are shipped and validated.
3. At each milestone review, ask: "Which of these features has been used in the last 30 days?" Features that aren't being used shouldn't be maintained.
4. The owners will ask for more features. This is not a mandate to build them. It is data about what they value. Validate before building.

**Phase / feature:** All phases

---

### PITFALL O-4 — Building Reporting Before Accumulating Data
**Severity: Medium**

The Monthly Revenue Dashboard and Market Insights features are genuinely useful — once there is data. In the first 60–90 days of use, there will be too few bookings and too few demographics entries to make charts or trend comparisons meaningful. Showing a revenue dashboard with 2 data points and a flat "trend" line erodes confidence.

**Warning signs:**
- Revenue comparison charts are built before month 2 of real data
- "Prior period comparison" logic is written before the prior period has any bookings
- The demographics map shows 0–3 markers with no explanatory context

**Prevention strategy:**
1. Build the data entry forms first, completely, and let real data accumulate for 4–6 weeks before building the reporting layer.
2. Add empty-state UX: when there are fewer than 5 bookings, show a message like "Keep logging bookings — your revenue trends will appear here once you have a full month of data." Do not show a degenerate chart.
3. Design the reporting queries for correctness with small data sets: a prior-period comparison with 0 prior-period bookings should show "No prior data yet," not a division-by-zero error or a -100% trend.

**Phase / feature:** Sales & Customer Tracking — Monthly Revenue Dashboard; Area Demographics — Market Insights

---

### PITFALL O-5 — No Graceful Degradation When External Data Sources Fail
**Severity: Medium**

The demographics feature depends on external data sources (county records, possible paid APIs). The AI content generator depends on an LLM API. Both can fail — the LLM API can hit rate limits, the demographics pipeline can break when a county website changes. If these failures cause the whole dashboard to break or show blank screens with no explanation, the owners will lose trust in the entire app, even the parts that work.

**Warning signs:**
- API errors in the demographics or AI modules cause unhandled exceptions visible to users
- A broken demographics pipeline causes the bookings section to also be inaccessible
- Error states show raw error messages or stack traces

**Prevention strategy:**
1. The demographics and AI features should be independently deployable and independently failable. A demographics data outage should not affect the booking tracker.
2. Show friendly error states: "Demographic data couldn't be refreshed — last update was [date]. We'll try again tonight." Not a red error screen.
3. For the AI content generator: if the LLM call fails, show a "Generation failed — try again" button. Cache the last successful generation so the owner isn't left with nothing.
4. Set up a basic uptime monitor (free tier of Better Uptime, UptimeRobot, or similar) so the developer is alerted before the owners notice.

**Phase / feature:** Area Demographics; Social Media Marketing — Content Generator

---

## Summary Risk Matrix

| ID | Pitfall | Severity | Domain | Phase Risk |
|----|---------|----------|--------|------------|
| D-1 | No free real-time new-resident API exists | Critical | Demographics | Area Demographics |
| D-2 | Property data ≠ qualified family prospects | High | Demographics | Area Demographics |
| D-3 | County data scraper breaks silently | Medium | Demographics | Area Demographics |
| C-1 | Brand voice drift in AI outputs | High | AI Content | Social Media |
| C-2 | One post copied to all platforms unchanged | High | AI Content | Social Media |
| C-3 | Prompt injection via user input fields | Medium | AI Content | Social Media |
| C-4 | Scope creep into auto-posting | Medium | AI Content | Social Media (future) |
| S-1 | Meta Graph API access tier misunderstood | Critical | Social APIs | Any Meta integration |
| S-2 | TikTok API instability and policy risk | High | Social APIs | Any TikTok integration |
| S-3 | Hashtag sets becoming stale | Low | Social APIs | Social Media |
| B-1 | CRM over-built, owners abandon it | Critical | CRM | Sales & Customer Tracking |
| B-2 | Waitlist entries with no clear state | Medium | CRM | Waitlist |
| B-3 | Revenue dashboard with incomplete data | Medium | CRM | Revenue Dashboard |
| B-4 | Forms not designed for phone entry | High | CRM | All data entry |
| O-1 | Auth complexity for a 2-person tool | High | Over-engineering | Infrastructure |
| O-2 | Infrastructure oversized for scale | Medium | Over-engineering | Infrastructure |
| O-3 | Feature creep dilutes core value | High | Over-engineering | All phases |
| O-4 | Reporting built before data accumulates | Medium | Over-engineering | Dashboard/Reporting |
| O-5 | No graceful degradation on external failures | Medium | Over-engineering | Demographics + AI |

---

## Top 5 Priorities (Act on These First)

1. **D-1 — Confirm your demographics data source before writing UI.** Prototype the data pipeline with real Rockwall CAD records. Do not build the feed UI against mocked data.

2. **B-1 — Keep the booking form under 8 fields and test it on a real phone.** This is the most used feature. If it is slow or clunky, the whole app fails.

3. **C-1 — Write the brand voice document before building the content generator.** The quality of AI output is directly proportional to the quality of the brand voice context in the system prompt.

4. **O-1 — Choose the simplest viable auth for two users.** Do not let auth design delay core feature delivery.

5. **O-3 — Treat the Active requirements list as a contract.** Build exactly what is listed. Park everything else.

---

*Last updated: 2026-04-13*
