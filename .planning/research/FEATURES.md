# Features Research — Little Royalty Spa Business Dashboard

**Research question:** What features do small business management dashboards typically have?
For a mobile spa party service (Little Royalty Spa LLC, Rockwall County TX), what is table
stakes vs differentiating vs anti-features?

**Focus areas:** Social media campaign planning, customer/booking CRM, local area demographics,
AI-generated marketing content.

**Business context:** Two-person owner-operated mobile spa party service for girls ages 3–10.
Demand exceeds supply — booking spots fill within hours of the 1st-of-month open window.
Core goal: fill monthly slots and grow the customer base in Rockwall County, TX.

---

## How to Read This Document

Each feature section is organized as:

- **Table stakes** — the baseline. Without these the tool is useless or embarrassing.
- **Differentiators** — features that create real competitive advantage or meaningful daily value for this specific business. Not just "nice to have" — these move the needle.
- **Anti-features** — things that look useful but should be deliberately excluded. Scope creep, over-engineering, or features that belong to a different product category entirely.

Complexity notes (L/M/H) indicate build complexity relative to this project's scale.
Dependency notes flag where one feature's value depends on another being built first.

---

## 1. Social Media Campaign Planning

### What the category typically includes (industry baseline)

Tools like Buffer, Hootsuite, Later, and Meta Business Suite provide: content calendars, post
scheduling, platform-specific preview, hashtag libraries, post performance analytics, competitor
benchmarking, team approval workflows, and AI caption suggestions. Most of this is overkill for
a two-person business with three handles and one product.

### Table Stakes

| Feature | Why It's Table Stakes | Complexity |
|---|---|---|
| **Content calendar view** | Visual monthly grid showing planned posts vs. booking openings. Without this, planning is done in a notes app or spreadsheet — the dashboard adds no value to this workflow. | L |
| **Post idea / caption storage** | A simple list or card view of drafted captions, copy snippets, and hashtag sets per platform. Enables reuse without starting from scratch each week. | L |
| **Platform tagging** (FB / IG / TikTok) | Posts behave differently on each platform (length, hashtag norms, video vs. image). Content should be tagged by target platform so the owner knows what to copy where. | L |
| **Campaign grouping** | Ability to group a set of posts under a named campaign (e.g., "Valentine's Day Push," "Back-to-School September"). Without grouping, the calendar is just a pile of unrelated posts. | L–M |

### Differentiators

| Feature | Why It Differentiates | Complexity | Dependencies |
|---|---|---|---|
| **Booking-linked campaign triggers** | The calendar is pre-seeded with the monthly booking open date (1st of each month, 9am CST) and auto-suggests a campaign window (e.g., 10-day countdown, day-of reminder, follow-up post). This ties marketing directly to the revenue cycle — unique to this business model. | M | Booking tracker must exist |
| **Holiday and local event prompt library** | Pre-loaded list of relevant dates: Valentine's Day, Mother's Day, Easter, back-to-school season, summer, Christmas, Rockwall County Fair, local school start dates. Prompts the owner: "Mother's Day is in 3 weeks — want to plan a campaign?" | M | None |
| **Brand voice saved context** | Stored one-time profile: brand name, tone (playful, girly, magical), audience (moms of girls 3–10), service area, handles. Used as seed context for every AI content generation call. Without this, AI output is generic; with it, it feels on-brand without editing. | M | AI content generator |
| **Post performance notes** (manual) | Simple field: after a campaign, owner logs what worked ("this one got 12 DMs") or didn't. Not analytics — just a free-text annotation. Builds institutional knowledge over time. | L | None |

### Anti-Features

| Feature | Why to Exclude |
|---|---|
| **Auto-posting / social API integration** | OAuth flows for FB/IG/TikTok are complex, fragile, and subject to API policy changes. For a two-person team copying from a dashboard to their phone, the friction savings do not justify the build and maintenance cost. Copy-paste is the right v1 workflow. Explicitly excluded in PROJECT.md. |
| **Post performance analytics** (impressions, reach, likes) | Requires social API read access — same OAuth problem. Also, the business goal is bookings filled, not vanity metrics. Analytics dashboards breed metric obsession without changing behavior. |
| **Competitor tracking / benchmarking** | Not a competitive intelligence business. The owners know their local competitors. This is a distraction. |
| **Multi-account or team approval workflow** | One brand, two owners, no approval chain needed. This is an enterprise feature. |
| **Story / Reel templates with image editing** | Canva already exists and does this extremely well. Do not rebuild a design tool. Generate the copy; let Canva handle the visuals. |

---

## 2. Customer and Booking CRM

### What the category typically includes (industry baseline)

Service business CRMs (HoneyBook, Jobber, Acuity, Mindbody, Vagaro) typically offer: client
profiles, booking/appointment scheduling, online payment processing, automated reminders, invoicing,
contract e-signatures, intake forms, and staff calendars. Again, most of this is either already
handled manually (booking via phone/DM on the 1st) or is explicitly out of scope.

### Table Stakes

| Feature | Why It's Table Stakes | Complexity |
|---|---|---|
| **Booking log** | Core record: date, customer name, location, party size, services selected, add-ons (Spa in a Box), revenue. Without this there is no business data to act on. | L |
| **Customer profile** | Name, phone, email, referral source, booking history. The minimum needed to recognize a returning customer and thank a referrer. | L |
| **Repeat customer flag** | Simple boolean or count. Returning customers are the highest-value segment — they rebook and refer. Must be instantly visible. | L |
| **Monthly revenue summary** | Total bookings and revenue by month, with prior-period comparison. The owners need to know at a glance: "Are we growing?" | L–M | Depends on booking log |
| **Waitlist / inquiry log** | Captures families who contacted after booking closed. Proves demand, enables follow-up when a cancellation opens, and informs decisions about adding dates. | L |

### Differentiators

| Feature | Why It Differentiates | Complexity | Dependencies |
|---|---|---|---|
| **Booking capacity view** | Visual indicator: how many slots remain this month. The business has fixed capacity (mobile, owner-operated). Showing "3 of 8 slots filled" creates urgency awareness and informs social post timing. | L | Booking log |
| **Referral source tracking + leaderboard** | Which customers referred the most new bookings? Which channels (Instagram, Facebook, word of mouth, Nextdoor) drive the most referrals? This directly answers "where should I spend marketing time?" | M | Customer profiles |
| **Waitlist-to-booking conversion** | When a waitlisted family eventually books, link the records. Over time this shows how long families wait and whether they stay loyal — informs whether to open additional dates. | M | Both waitlist and booking log |
| **Revenue per booking type** | Average revenue broken down by package (mani only, mani+pedi, full package) and add-on (Spa in a Box). Shows which upsells actually move and which to promote more. | M | Booking log with line-item detail |
| **"Upcoming party" prep view** | Simple checklist view: bookings in the next 7 days, with party details. Reduces mental load — the owners don't have to hunt through their log before each party. | L | Booking log |

### Anti-Features

| Feature | Why to Exclude |
|---|---|
| **Online customer-facing booking portal** | Explicitly out of scope in PROJECT.md. The manual 1st-of-month window is intentional — it creates urgency, demand signal, and community (families follow on social specifically to catch the window). Automating this destroys the mechanism. |
| **Payment processing / invoicing** | The business likely already uses Venmo, Zelle, or Square. Replacing that workflow is high friction, requires PCI compliance awareness, and adds no value vs. what exists. |
| **Automated SMS/email reminders to customers** | Requires integrating a messaging service (Twilio, SendGrid), managing opt-ins, and writing reminder flows. The owners currently handle this manually and it works fine at this volume. |
| **Contract / e-signature management** | Over-engineered for a mobile spa party. The business model does not carry the legal risk profile that makes this necessary. |
| **Staff / resource scheduling** | Owner-operated. Single resource. No scheduling system needed. Explicitly out of scope. |
| **Inventory management** | Spa in a Box is tracked as a booking add-on, not a SKU with stock levels. Adding inventory management creates complexity for zero return. |

---

## 3. Local Area Demographics Tools

### What the category typically includes (industry baseline)

Tools in this space fall into several buckets:
- **Real estate data aggregators** (ATTOM Data, PropStream, Redfin API, Zillow feeds) — property sales, buyer names, purchase prices, move-in dates.
- **New resident marketing lists** (Melissa Data, Experian New Mover, USPS NCOA-derived lists) — names and addresses of households that recently changed address.
- **Census / ACS data tools** (Census Reporter, Esri Community Analyst) — ZIP-level demographic profiles: household income, presence of children, age distributions.
- **Local government data** — county appraisal district records (public in Texas), deed filings, permit data.

For a Rockwall County business, the most actionable combination is: new home purchase records (who just moved to the area) + neighborhood family demographics (which ZIPs have the most households with children ages 3–10).

### Table Stakes

| Feature | Why It's Table Stakes | Complexity |
|---|---|---|
| **New resident / recent home purchase feed** | The core use case: identify families who just moved into the service area. These are warm prospects — new to the area, actively building their social life and looking for kid-friendly experiences. Without this the demographics module has no purpose. | M–H (data source dependent) |
| **Service area ZIP filter** | Heath (75032), Rockwall (75032/75087), Fate (75087/75189), Royse City (75189), Caddo Mills (75135). The feed must be filterable to only show records within the service area. Out-of-area results are noise. | L (filter logic) | Depends on data feed |
| **Staleness indicator** | Each record must show when the move/purchase was recorded. A 6-month-old "new mover" is not a warm lead. Records older than 90 days should be visually de-emphasized. | L | Data feed |

### Differentiators

| Feature | Why It Differentiates | Complexity | Dependencies |
|---|---|---|---|
| **Neighborhood family density heatmap** | ZIP-level (or tract-level) view showing estimated concentration of households with children under 12. Sourced from ACS 5-year estimates (free, public). Helps owners decide which neighborhoods to focus Instagram geo-targeting and Nextdoor posts on. | M | Census/ACS data integration |
| **New resident contact export for outreach** | One-click export of recent movers (name + address) as a CSV for a targeted direct mail or postcard campaign. Physical mail to new homeowners is a proven local marketing channel and differentiates from purely digital tactics. | L (export logic) | Data feed |
| **"Hot ZIP" alert** | If a particular ZIP shows a spike in new move-ins (e.g., a new subdivision opening in Fate), surface a notification: "15 new families in 75189 this month — consider a targeted post." Connects demographics data directly to marketing action. | M | Data feed + campaign planner |
| **Saved prospect notes** | When an owner sees a new resident record and reaches out (postcard, Nextdoor post), they can mark it as "contacted" and add a note. Prevents duplicate outreach and creates a lightweight prospecting log. | L | Data feed |

### Anti-Features

| Feature | Why to Exclude |
|---|---|
| **Individual household income / net worth scoring** | Crosses into data privacy territory that could create legal and reputational risk. Rockwall County skews affluent; targeting by neighborhood is sufficient without individual financial profiling. |
| **Predictive lead scoring** | Machine learning on a dataset of ~100 bookings/year is statistically meaningless. Do not build a lead scoring model that will produce false confidence. |
| **Automated outreach / cold email / cold SMS to new residents** | Requires opt-in compliance (CAN-SPAM, TCPA). Physical postcards are the right channel for new movers — not automated digital outreach from this app. |
| **Competitor location mapping** | Knowing where other mobile spa services operate is marginally useful and the data would require manual maintenance. Not worth the surface area. |
| **Real-time MLS / active listing data** | Active listings = people who haven't moved yet. The value is in recent purchase / recent move-in data — people who are already in the area and settling in. |

### Data Source Notes (Complexity Drivers)

This is the highest-complexity module in the product. Key considerations:

- **Texas county appraisal district records** (e.g., Rockwall CAD) are public and updated regularly. Deed transfers are filed with the county clerk. These can be scraped or accessed via bulk download — but require parsing and normalization. Free but high effort.
- **USPS NCOA / new mover lists** are accurate but require a paid data license. Vendors like Melissa Data charge per record or per monthly pull.
- **Redfin / Zillow APIs** have been progressively restricted. Redfin has a public data page but no official API. Zillow's Bridge API requires partnership approval.
- **ATTOM Data** provides a well-structured real estate and demographics API with new mover endpoints — pricing is per-call or subscription. Best fit for this use case but has a cost.
- **Census ACS** (American Community Survey) 5-year estimates are free via the Census Bureau API. Household-with-children-under-18 data is available at the ZIP/tract level. Best source for the neighborhood heatmap.

**Recommendation:** Phase the module. Start with Census ACS for the neighborhood heatmap (free, no legal complexity). Add a manual "paste a new mover list" CSV import as a quick win before committing to a live data API. Evaluate ATTOM or a county records scraper after validating that owners actually use the demographics tab.

---

## 4. AI-Generated Marketing Content

### What the category typically includes (industry baseline)

Tools like Jasper, Copy.ai, Lately, and ChatGPT plugins for social media offer: brand voice
profiles, platform-specific content generation (caption length, tone, hashtags), image prompt
generation, A/B variant generation, and content repurposing (turn a blog post into 5 tweets).
Most small business owners use ChatGPT directly in a browser tab and paste results manually —
this is the baseline behavior to beat.

### Table Stakes

| Feature | Why It's Table Stakes | Complexity |
|---|---|---|
| **Caption generator with platform context** | Given a campaign purpose (e.g., "booking opens Monday, 3 spots left") and platform (Instagram), generate a ready-to-use caption in the Little Royalty Spa brand voice. This is the core utility — if this doesn't work well, nothing else in this module matters. | M (LLM integration + prompt engineering) |
| **Hashtag suggestions** | Platform-relevant hashtag sets for FB/IG/TikTok. Must include both broad (reach) and niche (community) tags. Pre-populated defaults for the brand: #littleroyaltyspa, #sparty, #kidsspa, #rockwalltx, etc. | L | Caption generator |
| **Copy one-click to clipboard** | The workflow is: generate → review → copy → paste into FB/IG/TikTok. The copy step must be frictionless. If the owner has to select text manually every time, they'll go back to ChatGPT. | L | None |

### Differentiators

| Feature | Why It Differentiates | Complexity | Dependencies |
|---|---|---|---|
| **Saved brand voice profile as system context** | Business name, tone descriptors, target audience, service area, handles — stored once and injected into every generation prompt automatically. The owner never has to re-explain the brand. This is the gap ChatGPT alone doesn't fill without a persistent system prompt. | M | One-time setup UX |
| **Campaign-aware generation** | When generating content, the tool knows which campaign it's for (e.g., "Mother's Day — May 11") and the booking open date. The generated post naturally references the right date, urgency, and CTA without the owner providing that context manually. | M | Campaign planner + booking tracker |
| **Multiple variants in one call** | Generate 3 caption variants (playful/urgent/soft) for the same campaign moment. The owner picks the one that feels right that day. More useful than a single output, less overwhelming than 10. | L–M | Caption generator |
| **Post idea prompts** (blank-page relief) | Structured prompts the owner can tap to kick off generation: "Countdown to booking opening," "Customer birthday shoutout," "Behind-the-scenes," "Testimonial highlight," "Holiday special." Reduces creative friction to near zero. | L | None |
| **Seasonal content calendar pre-fill** | At the start of each month, offer to auto-populate the content calendar with suggested post types based on the month's key dates (from the holiday library) and booking window. Owner reviews and keeps/edits/deletes suggestions. | M | Campaign planner + holiday library |

### Anti-Features

| Feature | Why to Exclude |
|---|---|
| **AI image generation** | Prompt-to-image generation (DALL-E, Stability AI) produces generic output that won't match the brand's existing photo assets, styling, or real children's faces. It adds API cost and creates a design uncanny valley. The brand already has real party photos — use those. |
| **Auto-post scheduling via AI** | See Social Media anti-features above. AI deciding when to post is a feature for social media managers with hundreds of clients, not a two-person team posting 3x/week. |
| **SEO content generation** (blog posts, web copy) | Not a web-traffic-driven business. Booking fills via social and word of mouth. Blog content would be written into the void. |
| **Email newsletter generation** | The owners do not have an email list workflow in place. Building a generator for a channel they don't use creates a feature that will never be touched. |
| **Sentiment analysis of comments/DMs** | Requires social API access. Also: at this volume, the owners read every comment and DM personally. Sentiment analysis is a tool for brands with thousands of mentions. |
| **Fine-tuned / custom model training** | Training a custom model on Little Royalty Spa content is wildly disproportionate. Prompt engineering against a general-purpose LLM with a good brand voice system prompt is 95% as good at 1% of the cost and complexity. |

---

## 5. Cross-Cutting Feature Observations

### The Dashboard Home Screen

A feature in its own right. The home screen of a small business dashboard is table stakes — it must answer "what do I need to do today?" at a glance. For this business:

- How many bookings are filled this month vs. capacity
- Next party: date, customer name, party size (7-day lookahead)
- Waitlist count (demand signal)
- Upcoming campaign: what's planned for this week's social posts
- Any new demographics alerts (new movers in service area)

A home screen that forces the owner to navigate to five separate tabs to get this information has failed.

### Complexity and Dependency Map

```
Booking log
  └── Monthly revenue summary
  └── Booking capacity view
  └── Upcoming party prep view
  └── Campaign-linked triggers (social)
  └── Revenue per booking type

Customer profiles
  └── Repeat customer flag
  └── Referral source tracking
  └── Waitlist-to-booking conversion

Brand voice profile
  └── AI caption generator
  └── Campaign-aware generation
  └── Seasonal pre-fill

Campaign planner / content calendar
  └── Booking-linked triggers
  └── Campaign-aware AI generation
  └── Seasonal pre-fill
  └── Holiday prompt library

Demographics data feed
  └── New resident feed
  └── ZIP filter
  └── Staleness indicator
  └── Heatmap (Census ACS, separate source)
  └── Hot ZIP alert
  └── Export for outreach
```

**Build order implication:** Booking log and customer profiles should be built first — they are the root of the dependency tree and also provide the business data that makes every other feature more useful. The demographics module has the most external dependencies and highest uncertainty; it should be phased and validated before committing to a live API integration.

### Features That Sound Good but Aren't

The following appear in competing small business tools and are worth explicitly flagging as traps for this product:

- **NPS / review request automation** — The owners get genuine 5-star results organically because of the experience quality. Automating review requests risks cheapening the relationship and adds compliance surface area (FTC guidelines on incentivized reviews).
- **Loyalty points / rewards program** — Adds a bookkeeping overhead that a two-person team doesn't need. Repeat customer recognition should be a personal touch (owner remembers returning families), not a gamification layer.
- **Subscription / membership tiers** — The business model is event-based, not recurring subscription. Forcing a membership model onto this service changes what the product is.
- **Public-facing customer portal** — Explicitly out of scope. The manual booking window is a feature of the business model, not a gap to fix.

---

## 6. Summary Table

| Feature | Category | Complexity | Phase |
|---|---|---|---|
| Content calendar view | Table stakes | L | v1 |
| Post idea / caption storage | Table stakes | L | v1 |
| Platform tagging (FB/IG/TikTok) | Table stakes | L | v1 |
| Campaign grouping | Table stakes | L–M | v1 |
| Booking log | Table stakes | L | v1 |
| Customer profiles | Table stakes | L | v1 |
| Repeat customer flag | Table stakes | L | v1 |
| Monthly revenue summary | Table stakes | L–M | v1 |
| Waitlist / inquiry log | Table stakes | L | v1 |
| New resident / home purchase feed | Table stakes (demographics) | M–H | v1–v2 |
| Service area ZIP filter | Table stakes (demographics) | L | v1–v2 |
| Caption generator + platform context | Table stakes (AI) | M | v1 |
| Hashtag suggestions | Table stakes (AI) | L | v1 |
| Copy to clipboard | Table stakes (AI) | L | v1 |
| Dashboard home screen (today view) | Table stakes | L–M | v1 |
| Booking-linked campaign triggers | Differentiator | M | v1 |
| Holiday/local event prompt library | Differentiator | M | v1 |
| Brand voice saved context | Differentiator | M | v1 |
| Booking capacity view | Differentiator | L | v1 |
| Referral source tracking | Differentiator | M | v1 |
| Upcoming party prep view | Differentiator | L | v1 |
| Multiple AI caption variants | Differentiator | L–M | v1 |
| Post idea prompts (blank-page) | Differentiator | L | v1 |
| Campaign-aware AI generation | Differentiator | M | v2 |
| Seasonal calendar pre-fill | Differentiator | M | v2 |
| Neighborhood family density heatmap | Differentiator | M | v2 |
| New resident contact export (CSV) | Differentiator | L | v2 |
| Hot ZIP alert | Differentiator | M | v2 |
| Revenue per booking type | Differentiator | M | v2 |
| Waitlist-to-booking conversion tracking | Differentiator | M | v2 |
| Auto-posting / social API | Anti-feature | — | Never |
| Post performance analytics | Anti-feature | — | Never |
| Online booking portal | Anti-feature | — | Never |
| Payment processing / invoicing | Anti-feature | — | Never |
| AI image generation | Anti-feature | — | Never |
| Inventory management | Anti-feature | — | Never |
| Staff scheduling | Anti-feature | — | Never |
| Fine-tuned/custom model training | Anti-feature | — | Never |
| Individual income/net worth scoring | Anti-feature | — | Never |
| Automated cold outreach (email/SMS) | Anti-feature | — | Never |

---

*Research completed: 2026-04-13. Based on domain knowledge of small business SaaS, service business CRM patterns, social media tooling, real estate/demographics data landscape, and LLM-powered content generation — applied to the specific context of Little Royalty Spa LLC as described in PROJECT.md.*
