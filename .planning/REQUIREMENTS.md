# Requirements: Little Royalty Spa — Business Dashboard

**Defined:** 2026-04-13
**Core Value:** Help the owners fill their monthly booking slots and grow their customer base — everything else supports that goal.

## v1 Requirements

### Authentication

- [ ] **AUTH-01**: User can log in with email/password and stay logged in across sessions
- [ ] **AUTH-02**: User can reset password via email link
- [ ] **AUTH-03**: Both owners have separate accounts (2 independent logins)

### Dashboard

- [ ] **DASH-01**: User sees upcoming bookings and next booking window date on home screen
- [ ] **DASH-02**: User sees quick stats (month revenue, booking count, waitlist size)
- [ ] **DASH-03**: User sees a contextual next-action prompt (e.g. "Booking opens in 3 days — plan your campaign")

### Bookings

- [ ] **BOOK-01**: User can log a party booking (≤8 fields: date, address, party size, services, revenue)
- [ ] **BOOK-02**: User can edit or cancel an existing booking
- [ ] **BOOK-03**: User can view all bookings for a month in a calendar view

### Customers

- [ ] **CUST-01**: User can view and edit customer profiles (name, contact info, child name/age, booking history)
- [ ] **CUST-02**: Repeat customers are automatically flagged after 2+ bookings
- [ ] **CUST-03**: User can record how a customer heard about the business (referral source)
- [ ] **CUST-04**: User can add families to a waitlist with states: Waiting, Contacted, Converted, Removed

### Revenue

- [ ] **REV-01**: User sees monthly revenue total and party count
- [ ] **REV-02**: User sees a month-over-month revenue chart
- [ ] **REV-03**: User sees bookings broken down by referral source

### Social Media

- [ ] **SOCL-01**: User can save a brand voice profile that is used as AI context on every generation
- [ ] **SOCL-02**: User can generate captions + hashtags for FB/IG/TikTok with one-click copy
- [ ] **SOCL-03**: User can create a campaign (name, posts with dates, platform, content notes)
- [ ] **SOCL-04**: App provides a pre-built booking window campaign template for the 1st-of-month opening

### Demographics

- [ ] **DEMO-01**: User can view a neighborhood heatmap (family density + income by ZIP code, Census ACS data)
- [ ] **DEMO-02**: User can browse a feed of recent home purchases/move-ins in the service area
- [ ] **DEMO-03**: User can import a new residents list via CSV upload

## v2 Requirements

### Bookings

- **BOOK-04**: User can flag whether a booking includes a Spa in a Box purchase ($65 add-on)

### Notifications

- **NOTF-01**: User receives an in-app reminder before the monthly booking window opens
- **NOTF-02**: User receives a reminder to follow up with waitlisted families

### Authentication

- **AUTH-04**: Email verification on account creation

## Out of Scope

| Feature | Reason |
|---------|--------|
| Auto-posting to social media | OAuth fragility + maintenance exceeds value of saving a paste step; v1 is copy/paste |
| Online customer-facing booking portal | The manual 1st-of-month window creates urgency and social following — automating it destroys the mechanism |
| Staff scheduling | Owner-operated; no staff |
| Inventory management | No meaningful stock to track in v1 |
| AI image generation | Generic output won't match real party photos; adds cost with no upside |
| Payment processing | Payments handled outside the app |
| Individual household income scoring | Legal/reputational risk; neighborhood-level data is sufficient |
| 2FA / magic links | Overkill for a 2-person internal tool |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | — | Pending |
| AUTH-02 | — | Pending |
| AUTH-03 | — | Pending |
| DASH-01 | — | Pending |
| DASH-02 | — | Pending |
| DASH-03 | — | Pending |
| BOOK-01 | — | Pending |
| BOOK-02 | — | Pending |
| BOOK-03 | — | Pending |
| CUST-01 | — | Pending |
| CUST-02 | — | Pending |
| CUST-03 | — | Pending |
| CUST-04 | — | Pending |
| REV-01 | — | Pending |
| REV-02 | — | Pending |
| REV-03 | — | Pending |
| SOCL-01 | — | Pending |
| SOCL-02 | — | Pending |
| SOCL-03 | — | Pending |
| SOCL-04 | — | Pending |
| DEMO-01 | — | Pending |
| DEMO-02 | — | Pending |
| DEMO-03 | — | Pending |

**Coverage:**
- v1 requirements: 23 total
- Mapped to phases: 0 (roadmap not yet created)
- Unmapped: 23 ⚠️

---
*Requirements defined: 2026-04-13*
*Last updated: 2026-04-13 after initial definition*
