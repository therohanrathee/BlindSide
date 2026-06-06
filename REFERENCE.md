# BlindSide — Project Reference

> **Single source of truth.** This document describes every detail of how BlindSide works — product logic, user flows, database schema, API surface, design tokens, and business rules. Updated alongside code changes.

**Last updated:** 2026-06-06

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Core Concepts](#2-core-concepts)
3. [Tech Stack](#3-tech-stack)
4. [User Journey](#4-user-journey)
5. [Wallet & Ledger System](#5-wallet--ledger-system)
6. [Matching Algorithm](#6-matching-algorithm)
7. [Pricing](#7-pricing)
8. [Chat Rules](#8-chat-rules)
9. [Safety & Trust](#9-safety--trust)
10. [Design System](#10-design-system)
11. [Database Tables](#11-database-tables)
12. [API Routes](#12-api-routes)
13. [Background Jobs](#13-background-jobs)
14. [Pages](#14-pages)
15. [Business Rules](#15-business-rules)
16. [Current Project Status](#16-current-project-status)

---

## 1. Product Overview

**BlindSide** is a verified, university-scoped blind dating platform. Users are matched based on personality and preferences — never on photos. Photos are revealed via email 4 hours before the confirmed date, creating a "spy movie" experience.

### What Makes It Different

| Feature | BlindSide | Traditional Apps |
|---------|-----------|------------------|
| Photos | Never shown in-app. Sent 4 hours before date via email | Profile photos visible upfront |
| Matching | Algorithm-based, one match at a time | User swipes through profiles |
| Trust | Verified via university email OTP | Self-reported info |
| Payment | Pay per search (₹49–69) | Free / subscription |
| Intent | "Blind date" — designed for meeting | Endless swiping, rarely meeting |

### Current Scope

- **Geography**: India only (INR, Razorpay)
- **Organisations**: Universities only (verified via `.edu` / institutional email)
- **Platform**: Responsive web app (PWA) with push notifications
- **Theme**: Light + Dark mode (dark default)

### Future Expansion (Not in MVP)

- Workplace organisations (corporate email verification)
- Location/radius-based matching
- Native mobile app (React Native)
- Stripe for global payments
- Group/double blind dates

---

## 2. Core Concepts

### Blind Date Philosophy

Users **NEVER** see each other's photo inside the app. The photo is revealed via email exactly 4 hours before a confirmed date. This creates:

- Mystery and anticipation
- Focus on personality/compatibility over looks
- A unique "spy movie" experience at the reveal moment

### University-Only at Launch

- Every user must verify a university email via 6-digit OTP
- Modular architecture allows future expansion to workplaces and location-based groups
- University acts as the trust anchor — users belong to a known institution

### Pay Upfront, Wallet Credit If No Match

- Users pay before entering the matching queue
- If no match is found within 7 days → amount credited back to the BlindSide Wallet
- **No bank refunds, ever.** Money stays in the platform ecosystem

### Photos Never Shown In-App

- Photos are uploaded during onboarding and stored in a private Supabase Storage bucket
- They are **never rendered in the web app UI** — no profile pictures, no thumbnails
- Photos are sent exclusively via email (and WhatsApp) 4 hours before a confirmed date
- Accessed by the reveal job via signed URL, attached to the email

### Bidirectional Consent for Everything

Every filter and preference is checked in **BOTH** directions:

- If User A wants males aged 21-25, User A must also fall within User B's preferences
- If User A searches city-wide, User B must also have city-wide scope for a match
- Both users must independently toggle "I want to meet" before date planning unlocks

### India-First

- All payments in INR via Razorpay
- University database seeded with top 50 Indian universities
- Heights displayed in ft/in by default (Indian standard)

---

## 3. Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 15 (App Router) | Full-stack React framework |
| Language | TypeScript | Type safety |
| Styling | Vanilla CSS | Custom design system, light + dark mode |
| Database | Supabase (PostgreSQL) | DB + Auth + Realtime + Storage |
| Auth | Supabase Auth + custom OTP | Email/password + university verification |
| Payments | Razorpay | INR payments |
| Real-time Chat | Supabase Realtime | Live message delivery via WebSocket |
| Email | Resend | Transactional email (OTP, photo reveal, notifications) |
| WhatsApp | Meta Cloud API | T-4hr reveal notification (future) |
| Push | Web Push API (PWA) | Match alerts, chat notifications |
| Photo Storage | Supabase Storage | Private photo bucket (signed URLs) |
| Hosting | Vercel (Hobby plan) | Frontend + serverless API, 2 cron jobs |
| Calendar | .ics generation + Google Calendar link | "Add to Calendar" in reveal email |

### Key Packages

```
next 16.x                   — App framework
react / react-dom 19.x      — UI library
@supabase/supabase-js       — Supabase client
@supabase/ssr               — Supabase server-side helpers
razorpay                    — Payment gateway SDK
resend                      — Email API
web-push                    — PWA push notifications
```

---

## 4. User Journey

### 4.1 Unified User Journey: Initial Entry → First Date

```
1. Landing Page → Single Action Button ("Enter BlindSide")
     ↓
2. Enter Email or Phone Number
     ↓
3. Check if User Exists:
     ├─► Yes (Old User): Enter Password → Log In → Go to Dashboard (States 1–4)
     └─► No (New User) : Start Onboarding Flow (below)
```

#### New User Onboarding Flow:
```
1. Verify Initial Identifier (Email or Phone) via 6-digit OTP
     ↓
2. Enter & Verify Secondary Identifier (Phone or Email) via 6-digit OTP
     ↓
3. Secure Account: Choose Password → Create Supabase Auth Account (User is now logged in)
     ↓
4. Profile Details: First Name, Date of Birth (must be >= 18), Height (ft/in ↔ cm), Weight (kg)
     ↓
5. Hibe/Vibe Selector: Select exactly 3 Hobbies from visual grid
     ↓
6. University Autocomplete Search: Select campus → Enter university email → 6-digit OTP
     ↓
7. Proximity Verification: Authorize location access
     ↓
8. Go to Dashboard State 1 (Unpaid Match Request)
```

### 4.2 Onboarding (7 Steps)

Onboarding collects **who the user IS** and verifies their contact coordinates and university status.

| Step | Section | Description | Target Storage |
|------|---------|-------------|----------------|
| 1 | Initial ID Verification | Verify entered Email or Phone with a 6-digit OTP | `otp_verifications` |
| 2 | Secondary ID Verification | Ask for the other coordinate (Phone or Email) and verify via OTP | `otp_verifications` |
| 3 | Password & Account | Set password to create a Supabase authenticated session | `auth.users` + auto-trigger |
| 4 | About You | First Name, DOB (minimum 18 years old), Height (ft/in ↔ cm), Weight (kg) | `users` (`first_name`, `date_of_birth`, `height_cm`, `weight_kg`) |
| 5 | Your Vibe | Choose exactly 3 hobbies from a 20-item visual grid | `profiles.hobbies` |
| 6 | University Verification | Autocomplete select campus → enter campus email → verify with OTP | `users.university_id`, `users.university_email`, `users.is_university_verified` |
| 7 | Proximity Consent | Authorize browser geolocation coordinates | `users.latitude`, `users.longitude` |

#### Height & Weight Input
- **Height**: Defaults to feet/inches display, switchable to centimeters, stored as centimeters (`users.height_cm`).
- **Weight**: Numeric field, stored in kilograms (`users.weight_kg`).

#### Autocomplete University Search
The user types in an autocomplete input. As they type, client-side matching searches the list of 12 seeded Indian universities. Selecting a university locking the choice and prompts for their campus email matching that university's verified domain (e.g. `@du.ac.in` for Delhi University).


### 4.3 Search Preferences (Collected at Search Time)

Preferences are collected **each time** the user clicks "Find a Blind Date" — they can change per search.

| Preference | Options | Default |
|-----------|---------|---------|
| Looking for | Men / Women / Everyone | *(no default — must select)* |
| Age range | Min age – Max age | *(no default — must set)* |
| Height range | Min height – Max height, OR "No Preference" | **No Preference** |
| Dietary | Veg / Non-veg / Vegan / No Preference | **No Preference** |
| Drinking | Yes / No / No Preference | **No Preference** |
| Smoking | Yes / No / No Preference | **No Preference** |

All lifestyle filters default to **"No Preference"** to maximize match pool size and reduce friction.

### 4.4 No Match Found

```
7 days pass with no match
  ↓
Match request status → 'credited'
  ↓
Fee paid (₹49 or ₹69) credited to wallet
  ↓
User notified (push + email)
  ↓
User can search again using wallet balance
```

### 4.5 Chat Expires Without Meeting

```
Match found → Chat opens
  ↓
48 hours pass
  ↓
Neither or only one user toggled "I Want to Meet"
  ↓
Match status → 'expired'
  ↓
Feedback prompt sent
  ↓
Both users can search again (new payment required)
```

### 4.6 Date Planning Flow

Unlocked when **BOTH** users toggle "I Want to Meet" (bidirectional consent). Each toggle is private until both are ON.

1. **User A clicks "Plan Your Date"** → form opens: Date, Time, Location (text input)
2. **Location auto-generates** Google Maps search URL: `https://www.google.com/maps/search/?api=1&query=ENCODED_TEXT` (free, no API key)
3. **Proposal appears in chat** as a structured card
4. **User B responds**:
   - ✅ **Approve** — Date confirmed
   - ✏️ **Suggest Edit** — Form pre-filled, User B edits and re-proposes
5. **Back and forth** until both approve
6. **Date confirmed** → confirmation card in chat, both users notified

### 4.7 Photo Reveal (T-4 Hours)

4 hours before the confirmed date time, both users receive their match's photo and date details. This is the "spy movie" moment.

#### Channels

| Channel | Content |
|---------|---------|
| **Email** (Resend) | Match's photo, date time, location (Google Maps link), "Add to Calendar" button (.ics + Google Calendar) |
| **WhatsApp** (Meta Cloud API) | "🕵️ Your BlindSide date is in 4 hours! Check your email for your match's photo and date details." |
| **PWA Push** | "🎭 The reveal is here! Check your email to see your date." |

#### Calendar Integration

The reveal email includes:

- **.ics file attachment** — works with all calendar apps
- **Google Calendar link** — one-click add
- Both contain: date title ("BlindSide Date"), time, location text

### 4.8 Post-Date Feedback

Sent via push notification after the confirmed date time has passed (checked by hourly cron).

| Question | Options |
|----------|---------|
| Did you attend the date? | Yes / No |
| How was the vibe? | 1–5 stars |
| How was the conversation? | 1–5 stars |
| Would you meet again? | Yes / Maybe / No |
| Any feedback for us? | Optional free text |

**Privacy**: Feedback is **private** — users never see each other's ratings. Used to tune matching algorithm weights over time (Phase 2). Aggregate data used for platform health metrics.

---

## 5. Wallet & Ledger System

### Wallet

Every user gets a wallet on signup (auto-created via DB trigger). Balance starts at ₹0.

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Unique, linked to user |
| `balance` | Decimal | Cached sum of all ledger entries |
| `updated_at` | Timestamp | Last balance update |

### Wallet Top-Up

Users can add balance to their wallet via Razorpay:

- **Presets**: ₹100, ₹200, ₹500
- **Custom**: Any amount ≥ ₹49
- Payment processed via Razorpay → credited to wallet on success

### Transaction Types (Append-Only Ledger)

| Type | Direction | When |
|------|-----------|------|
| `wallet_topup` | CREDIT | User adds balance via Razorpay |
| `match_payment` | DEBIT | Match request paid from wallet |
| `razorpay_direct` | DEBIT | Match request paid directly via Razorpay (not from wallet) |
| `no_match_credit` | CREDIT | 7-day expiry, no match found |
| `promo_credit` | CREDIT | First-match discount, promotions |
| `admin_credit` | CREDIT | Manual credit (disputes, goodwill) |
| `admin_debit` | DEBIT | Manual debit (fraud correction) |

### Ledger Rules

- **Append-only** — entries are never updated or deleted
- **`balance_after`** — each entry stores the running balance at that point (audit trail)
- **`reference_id`** — links to the relevant `match_request` or `payment` record
- Wallet `balance` field is a cached sum, reconciled with ledger periodically

### Payment Flows

#### Flow 1: Pay from Wallet

```
User clicks "Pay Fee from Wallet"
  → Server checks wallet balance ≥ fee_paid (₹49 or ₹69)
  → Debit fee_paid from wallet (atomic DB transaction)
  → Create wallet_transaction (type: match_payment)
  → Create match_request (status: active)
  → User sees "Searching for your match..."
```

#### Flow 2: Pay via Razorpay (Direct)

```
User clicks "Pay Fee via Razorpay"
  → Server creates Razorpay order (₹49 or ₹69)
  → Razorpay checkout popup opens
  → User completes payment
  → Server verifies Razorpay signature
  → Create payment record (status: paid)
  → Create wallet_transaction (type: razorpay_direct)
  → Create match_request (status: active)
```

#### Flow 3: Wallet Top-Up

```
User clicks "Add Balance" → selects ₹200
  → Server creates Razorpay order (₹200)
  → Razorpay checkout popup
  → Payment verified
  → Create wallet_transaction (type: wallet_topup, +₹200)
  → Wallet balance updated
  → User can now pay from wallet for future searches
```

### No Refunds Policy

- Money is **NEVER** refunded to bank/Razorpay
- Unmatched requests get wallet credit
- Users are informed before payment: *"If no match is found within 7 days, your payment will be credited to your BlindSide Wallet"*

---

## 6. Matching Algorithm

### Overview

The algorithm runs via cron every 10 minutes. It processes active match requests in **FIFO order** (oldest first).

### Hard Filters (All Must Pass — Binary Pass/Fail)

All 7 must pass. If **ANY** fails, the candidate is eliminated instantly.

| # | Filter | Rule | Bidirectional? |
|---|--------|------|---------------|
| 1 | Gender Preference | A wants B's gender AND B wants A's gender | ✅ Yes |
| 2 | Age Range | A's age in B's range AND B's age in A's range | ✅ Yes |
| 3 | Height Range | A's height in B's range AND B's height in A's range (skipped if either said "No Preference") | ✅ Yes |
| 4 | Relationship Intent | Serious ✗ Casual = instant reject. "Open" matches with both | ✅ Yes |
| 5 | Scope Consent | Both users' scopes must "see" each other (bidirectional org/city check) | ✅ Yes |
| 6 | Not Previously Matched | Users have not been matched before | — |
| 7 | Not Blocked | Neither user has blocked the other | — |

Hard filters are implemented as **SQL WHERE clauses** for performance — the database eliminates 95%+ of candidates before app code runs.

### Soft Scoring (0–100 Points)

Only candidates passing all hard filters are scored.

| Component | Weight | Max Points | Method |
|-----------|--------|------------|--------|
| Hobby Overlap | 45% | 45 pts | Jaccard Similarity on hobby arrays |
| Lifestyle Match | 35% | 35 pts | Per-category comparison (~11.67 pts each for dietary, drinking, smoking) |
| Proximity Bonus | 20% | 20 pts | Distance-based tiers |

**Minimum threshold**: **55/100**

#### Hobby Scoring (Jaccard Similarity)

```
Jaccard = |A ∩ B| / |A ∪ B|
Score = Jaccard × 45

Example:
  A: {Hiking, Coffee, Photography}
  B: {Coffee, Travel, Photography}
  Intersection = 2, Union = 4
  Jaccard = 0.50 → Score = 22.5 pts
```

#### Lifestyle Scoring

Each of 3 categories (dietary, drinking, smoking) contributes ~11.67 pts.

- **"No Preference"** in search → automatic full score for that category
- **Match** (searcher's pref matches candidate's actual value) → full score
- **Mismatch** → 0 pts for that category

#### Proximity Bonus

| Distance | Points |
|----------|--------|
| Same university | 20 |
| < 5 km | 20 |
| 5–15 km | 15 |
| 15–30 km | 10 |
| 30–50 km | 5 |
| > 50 km | 0 |

### Implementation

1. Cron fires (`/api/cron/fast`) every 10 minutes
2. Fetches all `status = 'active'` requests, ordered by `created_at ASC`
3. For each request: runs SQL query with all hard filters as WHERE clauses
4. Returns small candidate set (typically 5–50 people)
5. App code calculates soft scores for each candidate
6. Best score ≥ 55 → match created atomically via Postgres function
7. Both requests marked `matched`, push notifications sent

### Race Condition Prevention

- PostgreSQL `SELECT FOR UPDATE SKIP LOCKED` ensures no double-matching
- Matching is executed inside a Postgres function as an atomic transaction
- If two cron runs overlap, SKIP LOCKED prevents both from grabbing the same request

### Scale Estimates

| Active Requests | Strategy |
|-----------------|----------|
| Up to 5,000 | < 10 seconds per cron run |
| 5,000–10,000 | Batch processing (chunks of 200) |
| 10,000+ | City-level partitioning in SQL |
| 100,000+ | Background workers with job queue |

Scales comfortably to ~5,000 active requests on Vercel Hobby plan.

---

## 7. Pricing

| Scope | Regular Price | First Match Price |
|-------|--------------|-------------------|
| 🎓 My Campus | ₹69 | ₹49 |

- **My Campus**: Match only within your verified university campus network.
- **First match discount**: Applied automatically for new users who have not made a prior paid search request. Regular rate is ₹69. First search is ₹49.

---

## 8. Chat Rules

### Technology

- **Supabase Realtime** — Postgres Changes for persistent messages
- Messages stored in `messages` table with `match_id` foreign key
- Real-time delivery via WebSocket subscription filtered by `match_id`

### Rules

- Chat opens when a match is created
- **48-hour countdown timer** starts from `matched_at`
- Text messages only (no media sharing)
- System messages for events (match created, "I want to meet" mutual, date proposal)
- Chat closes when timer expires or match is completed/declined

### Content Filtering (3 Layers)

**Layer 1: Social Platform Keywords**
```
instagram, insta, ig, snapchat, snap, sc, whatsapp, whats app, wa,
telegram, tg, twitter, tweet, x.com, facebook, fb,
add me, follow me, dm me, hit me up, hmu
```

**Layer 2: URL Detection**
```
Any http/https URL, domain patterns (*.com, *.in, *.org),
direct social media links (instagram.com/*, snapchat.com/add/*)
```

**Layer 3: Phone Numbers**
```
10-digit sequences, +91 format, formatted numbers (XXX-XXX-XXXX)
```

**Behavior**: Soft warning → *"🕵️ This message may contain contact info. BlindSide keeps things blind until your date! Send anyway?"* → If sent, message is flagged for review.

### Message Types

| Type | Description |
|------|-------------|
| `text` | Regular user message |
| `system` | System notification (match created, timer warning) |
| `meet_toggle` | "You both want to meet! 🎉" |
| `date_proposal` | Structured date proposal card |
| `date_confirmed` | Date confirmation card |

---

## 9. Safety & Trust

### Verification

| Method | How |
|--------|-----|
| University email OTP | Domain validated against registered university domains |
| OTP rate limiting | Max 3 attempts per code, 5-min cooldown between resends |

### Report Categories

| Category | Description |
|----------|-------------|
| Harassment | Inappropriate behavior in chat |
| Fake profile | Suspected non-genuine user |
| No-show | Didn't attend confirmed date |
| Inappropriate messages | Offensive content in chat |

### Moderation Rules

- **Block**: Blocked users permanently excluded from future matching
- **3-strike rule**: 3+ reports → auto-suspend pending manual review
- **Content filter**: Soft warning for social handles/phone numbers in chat
- **Photo privacy**: Photos in Supabase private bucket, signed URLs, never served to frontend

---

## 10. Design System

### Theme

- **Default**: Dark mode
- **System preference**: Auto-detected via `prefers-color-scheme`
- **Toggle**: Available in nav bar and settings
- **Implementation**: CSS variables on `:root` with `[data-theme="light"]` override

### Dark Mode Palette (Default)

| Token | HSL | Hex |
|-------|-----|-----|
| `--bg-primary` | `hsl(230, 25%, 7%)` | `#0e1117` |
| `--bg-surface` | `hsl(230, 20%, 12%)` | `#171c28` |
| `--bg-surface-hover` | `hsl(230, 20%, 16%)` | `#1f2533` |
| `--bg-elevated` | `hsl(230, 18%, 20%)` | `#282f3e` |
| `--text-primary` | `hsl(0, 0%, 95%)` | `#f2f2f2` |
| `--text-secondary` | `hsl(230, 10%, 62%)` | `#949aab` |
| `--text-muted` | `hsl(230, 8%, 42%)` | `#636877` |
| `--accent-primary` | `hsl(340, 82%, 55%)` | `#e83a72` |
| `--accent-secondary` | `hsl(255, 65%, 60%)` | `#7c5ce8` |
| `--accent-gradient` | `linear-gradient(135deg, #e83a72, #7c5ce8)` | — |
| `--success` | `hsl(150, 60%, 45%)` | `#2ebd6e` |
| `--warning` | `hsl(38, 92%, 55%)` | `#f0a030` |
| `--error` | `hsl(0, 72%, 55%)` | `#d94444` |
| `--border` | `hsl(230, 15%, 20%)` | `#2a2f3d` |

### Light Mode Palette

| Token | HSL | Hex |
|-------|-----|-----|
| `--bg-primary` | `hsl(220, 20%, 97%)` | `#f4f5f7` |
| `--bg-surface` | `hsl(0, 0%, 100%)` | `#ffffff` |
| `--bg-surface-hover` | `hsl(220, 15%, 94%)` | `#eceef2` |
| `--bg-elevated` | `hsl(0, 0%, 100%)` + shadow | `#ffffff` |
| `--text-primary` | `hsl(230, 25%, 12%)` | `#16192a` |
| `--text-secondary` | `hsl(230, 10%, 40%)` | `#5c6070` |
| `--text-muted` | `hsl(230, 8%, 58%)` | `#8b8f9e` |
| `--accent-primary` | `hsl(340, 80%, 48%)` | `#d42466` |
| `--accent-secondary` | `hsl(255, 60%, 52%)` | `#6040cc` |
| `--accent-gradient` | `linear-gradient(135deg, #d42466, #6040cc)` | — |
| `--success` | `hsl(150, 55%, 38%)` | `#2ba05c` |
| `--warning` | `hsl(30, 85%, 42%)` | `#c77312` |
| `--error` | `hsl(0, 68%, 48%)` | `#cc3333` |
| `--border` | `hsl(220, 15%, 88%)` | `#dcdee4` |

All contrast ratios meet WCAG AA compliance (≥ 4.5:1).

### Typography

- **Font**: Inter (Google Fonts)

### Shape

| Element | Border Radius |
|---------|---------------|
| Cards | `12px` |
| Buttons | `8px` |
| Pills / Tags | `999px` |

### Glassmorphism

- `backdrop-filter: blur(16px)` + semi-transparent backgrounds
- Used for modals and overlays

---

## 11. Database Tables

### `users`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Primary key, matches Supabase auth user |
| `email` | TEXT (UNIQUE) | User's login email |
| `phone` | TEXT (UNIQUE) | User's personal phone number |
| `is_phone_verified` | BOOLEAN | `true` if phone was verified via OTP |
| `first_name` | TEXT | First name only |
| `date_of_birth` | DATE | Used to calculate age |
| `height_cm` | DECIMAL | Height stored in centimetres |
| `height_unit_pref` | TEXT | `ft` or `cm` — display preference |
| `weight_kg` | DECIMAL | Weight stored in kilograms |
| `gender` | TEXT | `male`, `female`, or `nonbinary` |
| `university_id` | UUID (FK → universities) | Verified university |
| `university_email` | TEXT | University email used for OTP |
| `is_university_verified` | BOOLEAN | `true` after OTP verification |
| `is_first_match_used` | BOOLEAN | `false` until first match payment |
| `is_onboarding_complete` | BOOLEAN | `true` after all 7 steps |
| `latitude` | DECIMAL | Location lat (from browser API) |
| `longitude` | DECIMAL | Location lon (from browser API) |
| `is_suspended` | BOOLEAN | `true` if 3+ strikes |
| `created_at` | TIMESTAMPTZ | Account creation time |
| `updated_at` | TIMESTAMPTZ | Last profile update |

### `onboarding_leads`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Primary key |
| `user_id` | UUID (FK → users, ON DELETE SET NULL) | Reference to registered user |
| `full_name` | TEXT | Full name |
| `personal_email` | TEXT | Personal/signup email address |
| `mobile_no` | TEXT | Mobile/phone number |
| `hobbies` | TEXT[] | Hobbies list |
| `date_of_birth` | DATE | DOB |
| `height_cm` | DECIMAL | Height in cm |
| `weight_kg` | DECIMAL | Weight in kg |
| `gender` | TEXT | Gender |
| `university_email` | TEXT | Verified university email |
| `university_name` | TEXT | Selected university name |
| `latitude` | DECIMAL | Geolocation latitude |
| `longitude` | DECIMAL | Geolocation longitude |
| `ip_address` | TEXT | IP address of request client |
| `user_agent` | TEXT | Browser user agent of request client |
| `created_at` | TIMESTAMPTZ | Entry creation timestamp |

### `universities`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Primary key |
| `name` | TEXT | Display name (e.g., "Delhi University") |
| `email_domain` | TEXT | Verified domain (e.g., `du.ac.in`) |
| `city` | TEXT | City name |
| `state` | TEXT | State name |
| `created_at` | TIMESTAMPTZ | Seeded timestamp |

### `profiles`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Primary key |
| `user_id` | UUID (FK → users, UNIQUE) | One profile per user |
| `hobbies` | TEXT[] | Array of exactly 3 hobby strings |
| `relationship_intent` | TEXT | `casual`, `serious`, or `open` |
| `dietary` | TEXT | `veg`, `nonveg`, `vegan`, or `no_preference` |
| `drinking` | TEXT | `yes`, `sometimes`, or `no` |
| `smoking` | TEXT | `yes`, `sometimes`, or `no` |
| `photo_url` | TEXT | Path in Supabase Storage private bucket |
| `created_at` | TIMESTAMPTZ | Profile creation time |
| `updated_at` | TIMESTAMPTZ | Last update |

### `wallets`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Primary key |
| `user_id` | UUID (FK → users, UNIQUE) | One wallet per user |
| `balance` | DECIMAL | Cached sum of all ledger entries |
| `updated_at` | TIMESTAMPTZ | Last balance update |

### `wallet_transactions`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Primary key |
| `wallet_id` | UUID (FK → wallets) | Which wallet |
| `type` | TEXT | `wallet_topup`, `match_payment`, `razorpay_direct`, `no_match_credit`, `promo_credit`, `admin_credit`, `admin_debit` |
| `amount` | DECIMAL | Transaction amount (always positive) |
| `direction` | TEXT | `credit` or `debit` |
| `balance_after` | DECIMAL | Running balance after this entry |
| `reference_id` | UUID | Links to `match_requests.id` or `payments.id` |
| `description` | TEXT | Human-readable note |
| `created_at` | TIMESTAMPTZ | Transaction time (append-only, never updated) |

### `match_requests`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Primary key |
| `user_id` | UUID (FK → users) | Who submitted |
| `scope` | TEXT | `university` or `city` |
| `fee_paid` | DECIMAL | Amount paid (₹49/₹69) |
| `pref_gender` | TEXT | `male`, `female`, or `everyone` |
| `pref_age_min` | INTEGER | Minimum preferred age |
| `pref_age_max` | INTEGER | Maximum preferred age |
| `pref_height_min_cm` | DECIMAL | Min preferred height (NULL = no pref) |
| `pref_height_max_cm` | DECIMAL | Max preferred height (NULL = no pref) |
| `pref_dietary` | TEXT | `veg`, `nonveg`, `vegan`, or `no_preference` |
| `pref_drinking` | TEXT | `yes`, `no`, or `no_preference` |
| `pref_smoking` | TEXT | `yes`, `no`, or `no_preference` |
| `status` | TEXT | `unpaid`, `active`, `matched`, `expired`, `credited` |
| `matched_at` | TIMESTAMPTZ | When matched (NULL if not yet) |
| `expires_at` | TIMESTAMPTZ | `created_at + 7 days` |
| `created_at` | TIMESTAMPTZ | Request creation time |

### `matches`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Primary key |
| `user_a_id` | UUID (FK → users) | First matched user |
| `user_b_id` | UUID (FK → users) | Second matched user |
| `request_a_id` | UUID (FK → match_requests) | User A's request |
| `request_b_id` | UUID (FK → match_requests) | User B's request |
| `compatibility_score` | DECIMAL | Soft score (0–100) |
| `user_a_wants_meet` | BOOLEAN | User A's "I want to meet" toggle |
| `user_b_wants_meet` | BOOLEAN | User B's "I want to meet" toggle |
| `status` | TEXT | `active`, `date_planned`, `completed`, `expired`, `declined` |
| `chat_expires_at` | TIMESTAMPTZ | `matched_at + 48 hours` |
| `matched_at` | TIMESTAMPTZ | When the match was created |
| `created_at` | TIMESTAMPTZ | Record creation time |

### `date_proposals`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Primary key |
| `match_id` | UUID (FK → matches) | Which match |
| `proposed_by` | UUID (FK → users) | Who proposed |
| `proposed_date` | DATE | Selected date |
| `proposed_time` | TIME | Selected time |
| `location_text` | TEXT | Free text (e.g., "Café Dori, Hauz Khas") |
| `google_maps_url` | TEXT | Auto-generated search URL |
| `status` | TEXT | `pending`, `approved`, `edited`, `superseded` |
| `created_at` | TIMESTAMPTZ | Proposal time |

### `confirmed_dates`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Primary key |
| `match_id` | UUID (FK → matches, UNIQUE) | One confirmed date per match |
| `date_proposal_id` | UUID (FK → date_proposals) | Approved proposal |
| `date_time` | TIMESTAMPTZ | Confirmed date + time |
| `location_text` | TEXT | Confirmed location |
| `google_maps_url` | TEXT | Maps link |
| `photo_revealed` | BOOLEAN | `true` after T-4hr reveal sent |
| `reveal_sent_at` | TIMESTAMPTZ | When reveal was sent |
| `created_at` | TIMESTAMPTZ | Confirmation time |

### `messages`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Primary key |
| `match_id` | UUID (FK → matches) | Which chat |
| `sender_id` | UUID (FK → users) | Who sent (NULL for system) |
| `type` | TEXT | `text`, `system`, `meet_toggle`, `date_proposal`, `date_confirmed` |
| `content` | TEXT | Message body |
| `is_flagged` | BOOLEAN | `true` if sent despite content filter warning |
| `created_at` | TIMESTAMPTZ | Send time |

### `feedback`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Primary key |
| `match_id` | UUID (FK → matches) | Which match |
| `user_id` | UUID (FK → users) | Who submitted |
| `attended` | BOOLEAN | Did they attend? |
| `vibe_rating` | INTEGER | 1–5 |
| `conversation_rating` | INTEGER | 1–5 |
| `would_meet_again` | TEXT | `yes`, `maybe`, or `no` |
| `free_text` | TEXT | Optional feedback |
| `created_at` | TIMESTAMPTZ | Submission time |

### `payments`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Primary key |
| `user_id` | UUID (FK → users) | Who paid |
| `razorpay_order_id` | TEXT | Razorpay order ID |
| `razorpay_payment_id` | TEXT | Razorpay payment ID (after success) |
| `razorpay_signature` | TEXT | Verification signature |
| `amount` | DECIMAL | Amount in INR |
| `purpose` | TEXT | `match_payment`, `wallet_topup` |
| `status` | TEXT | `created`, `paid`, `failed` |
| `created_at` | TIMESTAMPTZ | Payment initiation time |

### `otp_verifications`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Primary key |
| `user_id` | UUID (FK → users) | Who requested |
| `email` | TEXT | University email |
| `otp_hash` | TEXT | Hashed 6-digit code |
| `attempts` | INTEGER | Number of verification attempts (max 3) |
| `expires_at` | TIMESTAMPTZ | `created_at + 10 minutes` |
| `is_used` | BOOLEAN | `true` after successful verification |
| `created_at` | TIMESTAMPTZ | OTP creation time |

### `user_blocks`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Primary key |
| `blocker_id` | UUID (FK → users) | Who blocked |
| `blocked_id` | UUID (FK → users) | Who was blocked |
| `created_at` | TIMESTAMPTZ | Block time |

### `reports`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Primary key |
| `reporter_id` | UUID (FK → users) | Who reported |
| `reported_id` | UUID (FK → users) | Who was reported |
| `match_id` | UUID (FK → matches) | Context match (optional) |
| `category` | TEXT | `harassment`, `fake_profile`, `no_show`, `inappropriate_messages` |
| `description` | TEXT | Optional details |
| `status` | TEXT | `pending`, `reviewed`, `action_taken`, `dismissed` |
| `created_at` | TIMESTAMPTZ | Report time |

### `push_subscriptions`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Primary key |
| `user_id` | UUID (FK → users) | Subscriber |
| `endpoint` | TEXT | Push service endpoint URL |
| `p256dh` | TEXT | Public key |
| `auth` | TEXT | Auth secret |
| `created_at` | TIMESTAMPTZ | Subscription time |

### Key Relationships

```
User → 1 Profile, 1 Wallet, 1 University
User → Many Match Requests, Payments, Messages, Feedback
Wallet → Many Wallet Transactions
Match Request → 0-1 Match
Match → Many Messages, Many Date Proposals, 0-1 Confirmed Date, 0-2 Feedback
```

---

## 12. API Routes

### Auth

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/auth/signup` | Create account (email + password) |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/callback` | Supabase auth callback |

### OTP

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/otp/send` | Send 6-digit OTP to university email via Resend |
| POST | `/api/otp/verify` | Verify OTP code, mark user as verified |

### Onboarding

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/onboarding/complete` | Save all onboarding data (about you, gender, hobbies, lifestyle) |

### Wallet

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/wallet/balance` | Get current wallet balance |
| GET | `/api/wallet/transactions` | Get transaction history (paginated) |
| POST | `/api/wallet/topup` | Initiate wallet top-up (creates Razorpay order) |
| POST | `/api/wallet/pay` | Pay from wallet (debit + create match request) |

### Payment (Razorpay)

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/payment/create-order` | Create Razorpay order for direct payment |
| POST | `/api/payment/verify` | Verify Razorpay payment signature |
| POST | `/api/payment/webhook` | Handle Razorpay webhook events (async confirmation) |

### Matching

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/match/request` | Create match request (after payment is confirmed) |
| POST | `/api/match/toggle-meet` | Toggle "I want to meet" for a match |

### Date

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/date/propose` | Submit date proposal (date, time, location) |
| POST | `/api/date/respond` | Approve proposal or suggest edit |
| POST | `/api/date/confirm` | Finalize confirmed date record |

### Chat

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/chat/send` | Send chat message (with content filtering) |

### Feedback & Reports

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/feedback/submit` | Submit post-date feedback |
| POST | `/api/report/submit` | Report a user (category + description) |

### Push Notifications

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/push/subscribe` | Save browser push subscription object |

### Cron Jobs

| Method | Route | Schedule | Purpose |
|--------|-------|----------|---------|
| GET | `/api/cron/fast` | Every 10 min | Match runner + Photo reveal |
| GET | `/api/cron/hourly` | Every hour | Request expiry + Chat expiry + Feedback prompt |

---

## 13. Background Jobs

### Cron 1: Fast Loop (Every 10 Minutes)

Route: `/api/cron/fast`

| Job | Action |
|-----|--------|
| **Match Runner** | Find matches for all `status = 'active'` requests using the matching algorithm (hard filters → soft scoring → atomic match creation) |
| **Photo Reveal** | Send T-4hr reveal for confirmed dates where `date_time - 4 hours <= now()` AND `photo_revealed = false`. Sends email + WhatsApp + push to both users. Sets `photo_revealed = true`. |

### Cron 2: Slow Loop (Every Hour)

Route: `/api/cron/hourly`

| Job | Action |
|-----|--------|
| **Request Expiry** | Expire requests > 7 days old (`status → 'expired' → 'credited'`), credit wallet with `no_match_credit` transaction |
| **Chat Expiry** | Expire matches where 48hr timer has passed without mutual "I want to meet" (`match.status → 'expired'`) |
| **Feedback Prompt** | Send push notification for dates where `date_time < now()` and no feedback submitted yet |

### Vercel Cron Configuration

```json
{
  "crons": [
    { "path": "/api/cron/fast", "schedule": "*/10 * * * *" },
    { "path": "/api/cron/hourly", "schedule": "0 * * * *" }
  ]
}
```

2 cron jobs — fits within Vercel Hobby plan limit.

---

## 14. Pages

| Route | Page | Auth Required | Description |
|-------|------|--------------|-------------|
| `/` | Landing Page | No | Hero, value proposition, CTA to sign up |
| `/signup` | Sign Up | No | Email + password registration |
| `/login` | Login | No | Email + password login |
| `/onboarding` | Onboarding | Yes | 5-step onboarding flow (about you → gender → hobbies → lifestyle → university verification) |
| `/dashboard` | Dashboard | Yes | Home screen after onboarding. Shows active match status, wallet balance, CTA to find a date |
| `/find` | Find a Blind Date | Yes | Set search preferences → select scope → pay |
| `/wallet` | Wallet | Yes | View balance, transaction history, top-up |
| `/match/[id]` | Match & Chat | Yes | Match card, icebreaker chat, "I want to meet" toggle, date planning |
| `/feedback/[matchId]` | Post-Date Feedback | Yes | Feedback form after date |
| `/settings` | Settings | Yes | Profile editing, theme toggle, push notification preferences |

---

## 15. Business Rules

| Rule | Value |
|------|-------|
| One active match request at a time | User cannot submit a new request while one is `active` |
| Match request expiry | 7 days → wallet credit |
| Chat timer | 48 hours from match creation |
| Photo reveal timing | 4 hours before confirmed date, via email only |
| Both must toggle "I want to meet" | Private until both ON → unlocks date planning |
| Bidirectional consent for cross-org matching | Both scopes must "see" each other |
| First match is discounted (not free) | ₹49 (~30% off, regular rate is ₹69) |
| All lifestyle filters default to "No Preference" | Maximizes match pool, reduces friction |
| Height stored as cm | Displayed as ft/in or cm per user preference |
| Minimum compatibility score | 55/100 |
| FIFO processing | Oldest requests matched first (fairness) |
| Max OTP attempts | 3 per code |
| OTP cooldown | 5 minutes between resends |
| OTP expiry | 10 minutes |
| Max hobbies selected | 3 |
| Report threshold for suspension | 3 reports → auto-suspend |
| Matching cron frequency | Every 10 minutes |
| Wallet top-up presets | ₹100, ₹200, ₹500 |
| Minimum custom top-up | ₹49 |
| Refund policy | No bank refunds — wallet credits only |
| Photo privacy | Never shown in-app — email only, Supabase private bucket, signed URLs |
| Content filtering | Soft warning, not hard block — message can still be sent but is flagged |
| Block behavior | Permanent exclusion from future matching |

---

## 16. Current Project Status

As of **June 6, 2026**, the following features are fully implemented, verified, and active in the project:

### 16.1 Completed Features

1. **User Auth & Signup Flow**
   - Completed with email/password signup and login.
   - Restructured onboarding so that no intermediary page is flashed between the Main onboarding entry and the OTP screen.

2. **Onboarding Details & University Verification**
   - Dynamic 7-step onboarding process saving Name, DOB, height/weight (with ft/in to cm converters), Gender, Hobbies selection (max 3), Lifestyle (relationship intent, dietary, drinking, smoking), and location.
   - University verification utilizing student email and 6-digit OTP code validation.

3. **Find a Date & Search Preferences**
   - Configurable preferences slider flow in dashboard.
   - Scope-based checkout options (My University for ₹49, My City for ₹99).

4. **Wallet, Ledger & Payments**
   - Active user wallet system with append-only ledger transaction tables (`wallet_transactions`).
   - Payment flows using wallet balances, integrated with Razorpay API (with direct fallback options).

5. **Matching Engine (Background Job)**
   - `/api/cron/fast` endpoint processing active requests.
   - Combines hard filters (age, gender preference, height range, intent matching, scope, blocks, past matches) with Jaccard-overlap soft scoring (hobbies, lifestyle match, proximity scoring).
   - Atomic SQL updates to guarantee race-condition-free match pairings.

6. **Expirations & Cleanup (Background Job)**
   - `/api/cron/hourly` running hourly.
   - Automatically expires search requests older than 7 days, refunds fees back to the user's wallet with ledger logs.
   - Automatically expires active matches that exceed the 48-hour deadline without both users mutual "I want to meet" consent.

7. **Date Planning Flow**
   - Icebreaker chat activation (48-hour countdown).
   - "I Want to Meet" mutual toggle confirmation.
   - Date proposal engine (propose date, time, Google Maps location search URL), editing, and final approval.
   - Confirmed date creation.

8. **Photo Reveal (T-4 Hours)**
   - Automatic checking of confirmed dates scheduled in $\le 4$ hours.
   - Generates signed Supabase storage URLs for photos and sends reveal email notifications via Resend (with console fallback in development).

9. **Real-time Synchronized Chat**
   - Real-time client subscription channels listening to `messages`, `matches`, and `date_proposals` table updates.
   - **Reconnection Bug Fix:** Wrapped browser client in React's `useMemo` hook to maintain a single, stable Supabase client instance across renders. This prevents the websocket connection from being torn down and rebuilt when countdown timers tick.
   - **RLS Subquery Resolution:** Replaced database SELECT policies for `public.messages` and `public.date_proposals` to be subquery-free (`using (auth.uid() is not null)`), making them 100% compatible with Supabase Realtime replication.

### 16.2 Developer Instructions for AI Coding Agents

If you are an AI agent developing, debugging, or extending this project, you **must** adhere to the following architectural constraints and patterns to avoid regressions:

1. **Client-Side Supabase Client Lifecycle:**
   - **Rule:** Never initialize the Supabase browser client with naked `const supabase = createClient()` inside React components that undergo high-frequency rendering (such as pages with ticking timers or dashboard state).
   - **Pattern:** Always memoize the client instance using `useMemo`:
     ```typescript
     const supabase = useMemo(() => createClient(), []);
     ```
   - **Why:** If the client instance changes on every render, all `useEffect` hooks subscribing to real-time events or fetching mount data will tear down their subscriptions/connections and trigger endless database query loops, hitting Supabase limits.

2. **Supabase Realtime RLS Limitations:**
   - **Rule:** Do not write `SELECT` policies for tables in the `supabase_realtime` publication (e.g., `messages`, `matches`, `date_proposals`) that contain subqueries, sub-selects (`exists (select 1 from...)`), or table joins.
   - **Pattern:** Keep `SELECT` policies simple and row-level only, using column comparisons on the table itself or standard authenticated checks (like `auth.uid() is not null` or `auth.uid() = user_a_id`).
   - **Why:** Supabase Realtime replication listens directly to the Postgres Write-Ahead Log (WAL) and does not evaluate joins or subqueries for events. If a replicated table has a subquery in its `SELECT` policy, Realtime will quietly fail to push events to client subscribers.

3. **Database Migrations Protocol:**
   - **Rule:** Do not edit existing migration files in `supabase/migrations/` (e.g., `001_...` to `008_...`) that have already been run.
   - **Pattern:** Always write a new sequential migration file (e.g., `009_...`) to define DDL changes, drops, updates, or new tables.

4. **Background Jobs / Cron Authentication:**
   - **Rule:** All cron jobs (`/api/cron/*`) must verify requests against the `CRON_SECRET` header to protect them from external unauthorized execution.
   - **Pattern:**
     ```typescript
     const authHeader = request.headers.get("Authorization");
     if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
       return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
     }
     ```

5. **Ledger Consistency:**
   - **Rule:** Never update a user's wallet balance directly without creating a matching transaction entry in `wallet_transactions` to maintain an append-only ledger history.
   - **Pattern:** Perform wallet balance changes and ledger additions within a database transaction or sequence.


