# Hyperlocal Home-Services Marketplace — Business & Features Plan

## 1. Positioning

A two-sided, location-based marketplace connecting independent skilled workers (electricians, plumbers, mechanics, carpenters, etc.) with nearby users who need them. The app's job ends at the introduction: it does not process payment, does not manage bookings, and does not arbitrate the job itself — it is the discovery and first-contact layer. Everything after "let's talk" happens directly between worker and user, off-app, exactly like it already does informally today — just easier to start.

**Core differentiation vs. incumbents (e.g. FilKhedma):** open self-listing instead of gatekept/vetted-only supply, direct pricing transparency per worker instead of platform-set pricing, and zero platform fee on the actual job. The trade-off: lower trust-per-listing at launch, offset by volume, ratings, and self-declared verification that can be tightened later.

## 2. Business Model

**Revenue at launch:**
1. **Worker-paid featured placement** — workers pay the platform (not tied to any specific job) to rank higher or get a "featured" badge within their category/region. This is the launch revenue lever, since it grows with worker demand for leads, not with how often users open the app.

**Deferred to a future phase:** in-app advertising (banner/native ads) — not part of the MVP build; can be added later once there's real traffic to monetize with ads.

**Explicitly out of scope for now:** in-app payments, booking/reservation system, commission on jobs, escrow, or dispute resolution over money. The app is a connector, not a transaction processor.

## 3. The Two Gates

### Gate A — Skill Worker

**Design principle:** this gate must work for someone who has never used an app like this before. Every step should ask for one thing, use large touch targets, minimal typing, and prefer selection over free text wherever possible.

**Onboarding (stepper form, one screen per step):**
1. Phone number (entered, not OTP-verified — see Section 5 on why)
2. Personal info: name, photo (camera or gallery), short bio (optional)
3. Skill/category selection (from the fixed category list — multi-select allowed, a worker can offer more than one trade)
4. Starting price per selected category (e.g. "Electrical — from 150 EGP")
5. Location: pin on map or auto-detect (e.g. Smouha, Alexandria) + service radius selector (e.g. 5 km)
6. Available hours: simple day/time-range picker with sensible defaults (e.g. "9 AM–6 PM, Sat–Thu") rather than a full calendar UI
7. Review & submit → profile goes live immediately (self-declared verification, no manual review at launch)

**Worker home / dashboard (post-onboarding):**
- Incoming chat requests / messages list (this is their "leads")
- Profile summary with current rating and edit access
- Toggle: "Available now" / "Not available" — lets a worker pause visibility without deleting the profile (important for real-world flexibility)
- Simple stats: profile views, chats started this week (gives workers a reason to open the app even with no new message — feeds retention)
- Option to boost/feature their listing (entry point to the paid placement revenue stream)

**Chat:** direct 1:1 messaging with any user who opens a conversation. No forced structure — this is where negotiation and job details happen, deliberately kept simple (text + photo attachment, e.g. user can send a photo of the broken pipe).

### Gate B — User

**Onboarding:**
1. Phone number (entered, not OTP-verified)
2. Personal info: name, location (default address/area, can be adjusted per search)
3. Done — straight to homepage (keep this gate lighter than the worker gate; users should get to value in under a minute)

**Homepage:**
- Category grid (electrician, plumber, mechanic, carpenter, painter, AC technician, etc. — full fixed list, see Section 4)
- Search bar for anyone who wants to type instead of browse
- Optional: recently used categories / recently contacted workers surfaced at the top (retention hook — see Section 6)

**Category → Worker list:**
- List of workers offering that category near the user's location, sorted by distance by default (with sort options: distance / rating / price)
- Each worker card shows: photo, name, starting price for that category, star rating (+ review count), distance, "Featured" badge if applicable
- **No-coverage fallback:** if no worker is within the user's radius, show the nearest available workers anyway with their distance clearly displayed, rather than a dead end — this keeps the app useful even in lower-supply areas, which matters a lot during early rollout.

**Worker profile screen:**
- Full bio, all categories/prices offered, available hours, service radius, rating breakdown, written reviews
- Primary CTA: "Chat" (opens direct message)

**Post-interaction:**
- After a chat has been active for some period (or user manually triggers it), prompt: "Rate your experience with [Worker]" → star rating + written review. This is the only mechanism the app has for signal on real-world outcomes, so it needs to be easy to trigger without being pushy (e.g. a light in-chat prompt after a few days of inactivity in that thread, dismissible, not blocking).

## 4. Service Categories (fixed list at launch)

Electricians · Plumbers · Mechanics (auto) · Carpenters · Painters · AC & Refrigeration Technicians · Appliance Repair (washing machines, ovens, etc.) · Satellite/TV Technicians · General Handyman · Locksmiths · Movers/Furniture Transport · House Cleaning · Pest Control · Gardening/Landscaping · Tiling/Flooring · Welding/Metalwork · Glass & Aluminum Work · Water Heater Specialists · Solar Panel Installers · Home Renovation/Contractors

*(This list can be trimmed or reordered based on which trades you expect the most early supply in — worth revisiting once you have real worker sign-ups.)*

## 5. Trust & Quality Layer (launch version)

- No paid verification services (OTP SMS, ID-check APIs, etc. all cost money per user at volume, which conflicts with the zero-cost constraint) — phone numbers and all profile info are entered but not independently verified at launch
- Star rating + written review, visible on every worker profile — this becomes the *primary* trust signal in the absence of verification, so it matters even more than usual
- "Featured" badge for workers who pay for placement (should be visually distinct from any future *verified* badge, so users don't confuse "paid for visibility" with "vetted for quality")

**Trade-off to be aware of:** without OTP, nothing stops someone from registering with a fake or someone else's phone number, and duplicate/fake accounts become easier. This is a reasonable trade at launch (it's genuinely how these markets often start), but it's worth revisiting once you have revenue — a free-tier verification option (e.g. WhatsApp Business API has a limited free conversation tier, or a simple "confirm via a call-back" flow you run manually early on) could be added later without needing to charge users anything directly.

## 6. Retention & Engagement (open items — flagged for your input)

Home-service needs aren't daily by nature, so the app's engagement design matters as much as its core flow. Ideas worth deciding on in the next round, once the core flow above is confirmed:
- Push notifications for worker chat replies (essential, not optional)
- "Save/favorite a worker" for repeat use (e.g. the same plumber next time)
- Light maintenance reminders (seasonal AC service, etc.) as a reason to reopen the app outside of emergencies
- Referral mechanism (user invites → both get something, TBD given no in-app payments to reward with)

## 8. Backend & Data Approach (for the implementation phase)

**Chosen for now: Firebase (Spark, free plan)** — chosen specifically because it stays at $0 indefinitely within generous daily quotas (50,000 reads / 20,000 writes per day, 1 GiB database, 5 GB file storage, unlimited email/phone-less auth up to 50,000 MAU) and, unlike some free-tier alternatives, doesn't auto-pause the project during quiet periods — important for an app that needs to stay live and trustworthy from day one, even before it has steady traffic.

**The one trade-off:** Firestore (Firebase's database) has no native "find everything within X km" query. At this scale, the fix costs nothing but a bit of extra app-side code: fetch workers in a category filtered by a broad area (e.g. city/region field), then compute and sort by exact distance on the device using the worker's and user's coordinates. This avoids any paid geospatial add-on and keeps the whole stack free.

This can be revisited later (e.g. moving to a Postgres/PostGIS-based backend like Supabase) once there's real usage and revenue to justify it — nothing in the feature set below depends on which backend is used.

## 9. Features by Gate

### Skill Worker Gate

- Stepper onboarding: phone number → personal info + photo → skill/category selection (multi-select) → starting price per category → location pin + service radius → available hours → review & submit, live immediately
- Multiple skills/categories per worker profile, each with its own starting price
- Availability toggle ("Available now" / "Not available") to pause visibility without deleting the profile
- Worker dashboard: list of active chats, profile view/chat-count stats, edit-profile access
- Direct 1:1 chat with any user who reaches out, supporting text and photo attachments (e.g. photo of the issue)
- Received ratings and written reviews displayed on their own profile
- Option to pay for boosted/featured placement within their category and region
- Push notifications for new chat messages (essential — this is how leads reach them)

### User Gate

- Lightweight onboarding: phone number → name + location → straight to homepage
- Homepage: category grid (fixed list) plus a search bar
- Category → worker list: sorted by distance by default (options to sort by rating or price), each card showing photo, starting price, rating, review count, distance, and featured badge if applicable
- No-coverage fallback: if nobody is within the user's radius, nearest available workers are shown anyway with distance displayed
- Full worker profile view: bio, all categories/prices offered, available hours, service radius, rating breakdown, written reviews
- Direct chat with any worker, same text + photo support
- Post-interaction prompt: star rating + written review
- Push notifications for chat replies

*(Retention features flagged earlier — saved/favorite workers, maintenance reminders, referral — are intentionally left out of this first feature set to keep the MVP tight, per your note that more UX ideas can be layered on later.)*
## 10. What's Deliberately Deferred

- In-app advertising — skipped from this build entirely, to be added in a future phase once there's real traffic to monetize
- Payments, escrow, cancellation/refund logic — not needed since the app doesn't process the job
- Manual worker vetting / background checks — can be added as a paid "verified" tier later without breaking the model
- Job-posting/bid model (user posts a request, workers respond) — could complement the current browse-first model later, but adds real complexity (matching, notifications to many workers, bid comparison UI) and isn't needed for MVP

---

# Part 2 — Implementation Plan (Task-by-Task)

## Instructions for the Implementing Agent (read this before starting)

- Work through the tasks below **in order** — later tasks depend on earlier ones (e.g. the theming/localization system must exist before any screen is built, since every screen consumes it).
- **After completing each task**, report to the founder exactly what was built/changed, then **stop and explicitly ask whether to proceed to the next task.** Do not chain multiple tasks together without that check-in, even if the next task seems obvious.
- If a task is ambiguous or a decision isn't covered by this plan, stop and ask rather than guessing — this is a solo-founder project with no team to catch mistakes downstream.
- Every screen's visible text must go through the localization system (Task 3) from the very first screen built — never hardcode Arabic or English strings directly in a component.

## Tech Stack (locked)

- **Framework:** React Native via **Expo** (managed workflow) — chosen over bare React Native CLI because it gives a solo founder built-in camera/image-picker/location/push-notification modules without native build configuration, plus EAS Build for generating store-ready binaries without owning a Mac/Xcode setup.
- **Backend:** Firebase — Firestore (database), Firebase Storage (photos), Firebase Cloud Messaging (push notifications), Firebase Anonymous Authentication (identity — see Task 2 for why).
- **Navigation:** React Navigation (stack + nested stacks per gate).
- **State:** React Context + hooks only — no Redux. This is a small enough app that Redux would add complexity without benefit for a solo builder.
- **Localization:** `i18next` + `react-i18next`, with `ar.json` and `en.json` translation files.
- **Ads:** `react-native-google-mobile-ads` (Google AdMob) — free to integrate, revenue-share model, no upfront cost.

## Firestore Data Model (reference for every task below)

```
users/{uid}
  - uid, name, phone, defaultLocation: { lat, lng, address }, createdAt

workers/{uid}
  - uid, name, phone, photoURL, bio
  - categories: [ { categoryId, startingPrice } ]
  - location: { lat, lng, city, region }, radiusKm
  - availableHours: { day: { start, end } }
  - isAvailable: boolean
  - isFeatured: boolean, featuredUntil: timestamp
  - ratingAvg: number, ratingCount: number
  - createdAt

chats/{chatId}
  - participantIds: [userId, workerId], lastMessage, lastMessageAt, createdAt
  chats/{chatId}/messages/{messageId}
    - senderId, text, imageURL, createdAt

workers/{workerId}/reviews/{reviewId}
  - userId, rating, text, createdAt
```

**Categories are NOT stored in Firestore** — they're a static bundled list (see Task 4) since they never change and storing them in Firestore would waste free-tier reads on data that's identical for every user.

---

### Phase 0 — Project Foundation

**Task 1 — Initialize the project**
- Create a new Expo project (TypeScript template).
- Set up the folder structure: `/src/screens`, `/src/components`, `/src/navigation`, `/src/context`, `/src/localization`, `/src/services` (Firebase calls live here, never inline in screens), `/src/theme`.
- Install: `@react-navigation/native`, `@react-navigation/native-stack`, `firebase`, `i18next`, `react-i18next`, `expo-location`, `expo-image-picker`, `expo-notifications`, `react-native-google-mobile-ads`.
- Definition of done: app boots to a blank screen with no errors, folder structure exists.

**Task 2 — Firebase project setup**
- Create a Firebase project (free Spark plan). Enable: Firestore, Storage, Cloud Messaging, and **Anonymous Authentication**.
- Anonymous Auth is the identity mechanism for this app: since there's no OTP/phone verification (per the business plan), every device signs in anonymously on first launch, producing a stable `uid`. That `uid` becomes the document ID for that person's `users/{uid}` or `workers/{uid}` profile. This gives us Firestore security rules (only the owner can write their own profile) without needing to verify a real phone number.
- Write Firestore security rules: public read access to `workers` and `users` (needed for browsing), write access to a document restricted to `request.auth.uid == resource.id` (or the new doc's ID on create). Chat messages restricted to participants only.
- Store Firebase config in environment variables, not committed to source control.
- Definition of done: app can sign in anonymously on launch and read/write a test Firestore document successfully.

**Task 3 — Localization system**
- Create `/src/localization/ar.json` and `/src/localization/en.json` with a flat, namespaced key structure (e.g. `onboarding.worker.step1.title`).
- Set up `i18next` with these two files, default language **Arabic**.
- Build a `LanguageContext` that exposes current language and a `toggleLanguage()` function, persisted to `AsyncStorage` so the choice survives app restarts. This is **independent from the theme setting** (see Task 4) — the two are separate controls, not linked.
- UI control: a segmented toggle showing both options at once (e.g. "AR | EN"), not a dropdown or radio buttons — one tap to switch, both states visible, better contrast on a dark background than small radio circles or a hidden dropdown menu.
- **RTL handling (important, do not skip):** Arabic requires right-to-left layout. Use `I18nManager.forceRTL(true)` when Arabic is active and `I18nManager.forceRTL(false)` for English. React Native does **not** apply RTL layout changes live — the app must reload after this call (use `Updates.reloadAsync()` from `expo-updates`, or prompt the user that the app will restart). Build this reload behavior into `toggleLanguage()` now so no screen built later has to special-case it.
- Definition of done: a test screen shows a string that changes between Arabic and English on toggle, layout mirrors correctly (test with a row of two elements — order should visibly flip), and the setting persists after force-closing the app.

**Task 4 — Theming system**
- Build a `ThemeContext` with two token sets: `dark` (default) and `light`/white, as a **separate, independent setting from language** (Task 3) — a user can be on Arabic+Light or English+Dark, any combination. Tokens should cover: background, surface, text-primary, text-secondary, accent/brand color, border, error, success — as placeholder values for now.
- UI control: same pattern as the language toggle — a segmented toggle ("🌙 Dark | ☀️ Light"), not a dropdown or radio buttons.
- **Do not finalize exact colors here** — the founder is getting a UI design from Claude Design separately. This task only builds the *system* (Context + token structure + a `useTheme()` hook every component will use). Once the design is ready, only the token values need to change, not every component.
- Persist the theme choice to `AsyncStorage` separately from the language choice, and default to `dark` on first launch.
- Definition of done: a test screen renders differently (background/text color) when the theme toggle fires, independently of the language setting — toggling one must never change the other — using only the `useTheme()` hook, no hardcoded colors anywhere in the test screen.

**Task 5 — Static category list**
- Create `/src/data/categories.ts` — the fixed list of ~20 categories from the business plan (Section 4), each with an `id`, `name_ar` key, and `name_en` key referencing the localization files, plus an icon identifier.
- Add corresponding entries to `ar.json`/`en.json` for every category name.
- Definition of done: categories can be imported and rendered as a localized list on a test screen.

---

### Phase 1 — Entry Flow

**Task 6 — Role-selection (gate) screen**
- First screen after splash/app load (if no saved role/profile exists locally).
- Two large, equal-sized tappable cards side by side (not radio buttons, not a dropdown — see rationale above): "I need help" (user) / "I offer a service" (worker), each fully localized, using theme tokens from Task 4.
- On selection, save the chosen role to `AsyncStorage` and route to the corresponding onboarding stack (Task 7 or Task 12).
- On subsequent app opens, skip this screen if a role + profile already exists locally, and route straight to that gate's home screen. Add a low-priority "switch role" option in settings for someone who wants to use both.
- Definition of done: tapping each card navigates to the correct onboarding stack; returning users skip this screen automatically.

---

### Phase 2 — Skill Worker Gate

**Task 7 — Worker onboarding stepper (screens only, no submission yet)**
- Build the 7-step flow as separate screens inside a stepper/wizard navigator, each step showing progress (e.g. "Step 2 of 7"):
  1. Phone number entry (plain text field, no verification)
  2. Name + photo (camera or gallery via `expo-image-picker`) + optional short bio
  3. Category multi-select (from Task 5's list)
  4. Starting price per selected category (a price input per category chosen in step 3)
  5. Location: map pin or `expo-location` auto-detect, + radius selector (slider or preset options like 3/5/10/15 km)
  6. Available hours: simple day/time-range picker with sensible defaults pre-filled
  7. Review screen — summary of everything entered, editable by tapping any section, "Submit" button
- Each step must be independently back-navigable without losing data already entered (hold state in a single onboarding Context, not per-screen local state).
- Definition of done: a worker can move forward and backward through all 7 steps, all fields persist across navigation, nothing is submitted yet.

**Task 8 — Worker profile submission + Firestore write**
- On "Submit" from Task 7's review screen: upload the photo to Firebase Storage, then write the full profile object to `workers/{uid}` per the schema above.
- Handle upload/write failure gracefully (retry option, don't lose entered data on failure).
- On success, navigate to the worker home/dashboard (Task 9) and mark onboarding complete in `AsyncStorage`.
- Definition of done: a real worker profile document appears in Firestore with all fields correctly populated, and the photo is retrievable from Storage.

**Task 9 — Worker dashboard**
- Home screen for the worker gate showing: list of active chats (placeholder until Task 16), profile summary card with current rating (placeholder until Task 19), "Available now / Not available" toggle (Task 10), edit-profile entry point (reuses Task 7's steps pre-filled), and a "Boost my listing" entry point (Task 22).
- Definition of done: dashboard renders with live data from the worker's own `workers/{uid}` document.

**Task 10 — Availability toggle**
- A single switch on the dashboard that updates `isAvailable` on the worker's Firestore document immediately on toggle (optimistic UI, rollback on write failure).
- When `isAvailable` is false, the worker must not appear in any user-facing search results (enforced in Task 14's query).
- Definition of done: toggling updates Firestore in real time and is reflected instantly in the UI.

**Task 11 — Edit profile**
- Reuse the Task 7 stepper, pre-filled with existing data, writing updates to the same `workers/{uid}` document instead of creating a new one.
- Definition of done: changes made here are reflected on the worker's public profile (Task 15) after save.

---

### Phase 3 — User Gate

**Task 12 — User onboarding**
- Two short screens: phone number entry, then name + location (auto-detect via `expo-location` or manual pin).
- On submit, write to `users/{uid}`, mark onboarding complete, navigate to homepage (Task 13).
- Definition of done: a user profile document appears in Firestore, onboarding takes under a minute to complete end-to-end.

**Task 13 — Homepage**
- Category grid using the Task 5 list (icon + localized name per category), plus a search bar that filters the grid by typed text (client-side filter, no backend query needed since the list is static and small).
- Tapping a category navigates to Task 14's worker list screen for that category.
- Definition of done: grid renders all categories correctly in both languages/RTL states, search filters correctly.

**Task 14 — Category → worker list**
- Query Firestore for `workers` where `categories` array contains the selected category **and** `isAvailable == true`, scoped by a broad location field (e.g. `city`) to avoid pulling every worker nationwide into memory.
- Compute exact distance client-side from the user's location to each worker's location (haversine formula, no external geo service needed — this is the free workaround for Firestore's lack of native geo-radius queries).
- Filter/sort: default sort by distance; if zero workers fall within the worker's own stated radius of the user, fall back to showing the nearest available workers regardless of radius, with distance displayed on each card (per the business plan's no-coverage fallback).
- Each worker card: photo, name, starting price for this category, rating average + count (placeholder until Task 19), distance, "Featured" badge if `isFeatured` is true and not expired.
- Add sort toggle: distance / rating / price.
- Definition of done: list renders correctly for a category with workers nearby, and correctly falls back to nearest-available when none are in range.

**Task 15 — Worker profile screen (public view)**
- Full read-only view of a worker's `workers/{uid}` document: bio, all categories + prices, available hours, service radius, rating breakdown, and paginated reviews list (Task 19 dependency).
- Primary button: "Chat" → opens/creates a conversation (Task 16).
- Definition of done: screen renders correctly for any worker document, chat button correctly opens an existing thread if one exists or creates a new one if not.

---

### Phase 4 — Chat

**Task 16 — Chat data layer**
- On first message between a user and a worker, create a `chats/{chatId}` document (deterministic ID, e.g. `${userId}_${workerId}`, so re-opening never creates duplicates) with both participant IDs.
- Messages write to the `messages` subcollection with `senderId`, `text` or `imageURL`, and `createdAt`.
- Update `lastMessage`/`lastMessageAt` on the parent chat doc on every new message (for the conversation list preview).
- Definition of done: two test accounts (one user, one worker) can exchange messages that persist and appear in the correct order for both.

**Task 17 — Chat UI**
- Conversation list screen (per gate — worker sees their chats, user sees theirs) sorted by `lastMessageAt` descending.
- Message thread screen: text input, send button, photo-attachment button (`expo-image-picker` → upload to Storage → send as `imageURL`), messages rendered in bubbles aligned by sender, correctly mirrored in RTL.
- Definition of done: full conversation flow works end-to-end between a real worker and user account, including photo attachments.

**Task 18 — Push notifications**
- Register each device for push via `expo-notifications` + Firebase Cloud Messaging on app launch (after onboarding, once we have a `uid` to attach the push token to). Store the token on the user's/worker's Firestore document.
- Trigger a notification on new message received (this requires a small Cloud Function — the one exception to "no backend logic," since client-side apps can't reliably push to another user's device on their own). This function stays within Firebase's free Cloud Functions quota (2 million invocations/month) at this app's scale.
- Definition of done: a message sent by one account produces a push notification on the other account's device when the app is backgrounded/closed.

---

### Phase 5 — Ratings & Reviews

**Task 19 — Review submission**
- Trigger point: a light, dismissible in-chat prompt shown after a few days of inactivity in a thread ("Rate your experience with [Worker]"), per the business plan — not blocking, not forced.
- Review screen: star rating (1–5) + written review text, writes to `workers/{workerId}/reviews/{reviewId}` with the reviewing user's ID.
- On write, update the worker's `ratingAvg` and `ratingCount` via a Firestore transaction (read current values, recompute average, write back) — done client-side to avoid needing a Cloud Function for this.
- Definition of done: submitting a review updates both the reviews subcollection and the worker's aggregate rating correctly, and a user cannot review the same worker twice in the same thread inappropriately (add a simple check).

**Task 20 — Rating display**
- Wire the placeholder rating displays from Tasks 9, 14, and 15 to real `ratingAvg`/`ratingCount` data, and render the paginated review list on the worker profile screen.
- Definition of done: ratings shown across the app reflect real Firestore data, no more placeholders remain.

---

### Phase 6 — Monetization

*(Ad integration is deferred to a future phase — see the note below and Section 10 — so this phase now covers featured placement only.)*

**Task 21 — Featured placement**
- "Boost my listing" screen on the worker dashboard (Task 9) — since there's no in-app payment, this starts as a **manual process**: the worker requests a boost, the app records the request (a Firestore field like `boostRequested: true`), and the founder manually confirms payment off-app (bank transfer/Instapay/cash) and flips `isFeatured`/`featuredUntil` themselves via the Firebase console. No payment gateway integration needed at this stage.
- Definition of done: a worker can submit a boost request, and manually toggling `isFeatured` in Firebase console correctly surfaces the badge and re-sorts them higher in Task 14's results.

---

### Phase 7 — Solo-Founder Operations

**Task 22 — Manual moderation workflow (no separate admin app)**
- Rather than building a dedicated admin panel (extra build time for a solo founder with no team), document a simple manual process: profiles/reviews can be hidden by adding a `isHidden: true` field via the Firebase console directly, and all screens querying `workers` or `reviews` must filter out documents where `isHidden == true`.
- Add a simple in-app "Report" button on worker profiles and chat threads that writes a `reports/{reportId}` document (reporterId, targetId, reason, createdAt) the founder can review directly in the Firebase console.
- Definition of done: hiding a document via Firebase console correctly removes it from all app views without needing an app update; report submissions appear correctly in Firestore.

---

### Phase 8 — Polish & Launch

**Task 23 — Empty, loading, and error states**
- Every screen that reads from Firestore needs a loading state, an empty state (e.g. "No workers found nearby yet" with correct localized copy), and an error state (network failure, etc.) — audit every screen built in Phases 1–6 against this checklist.
- Definition of done: no screen shows a blank white/dark flash or crashes when data is empty or a network call fails.

**Task 24 — App icons, splash screen, and build config**
- Add app icon and splash screen assets (can use placeholders until Claude Design output is ready, then swap).
- Configure `app.json`/EAS build profiles for iOS and Android.
- Definition of done: a build can be generated via `eas build` for both platforms without errors.

**Task 25 — Pre-submission checklist**
- Manual end-to-end test of both gates on a real device: full worker onboarding → full user onboarding → category browse → chat → review → language/theme toggle at every screen.
- Definition of done: checklist completed with no blocking issues found; app is ready for store submission.

