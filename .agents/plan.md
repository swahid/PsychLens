# PsychLens Master Product & Technical Implementation Plan

**Product Ownership**: Licensed Product of **Techfiyr** ([techfiyr.com](https://techfiyr.com)). All rights reserved.  
**Target Platforms**: Web Application (PWA) & Android App (APK / Trusted Web Activity / Capacitor)  
**Status**: 📋 Planning & Review (Do not start implementation until finalized)  
**File Location**: `.agents/plan.md` *(Single authoritative plan file)*

---

## 1. Product & Business Model Overview

### 1.1 The Core Problem & Value Proposition
- **Problem**: Modern consumers watch and share confession videos, portraits, street photos, and visual art without understanding the underlying emotional subtext, body language cues, or atmospheric tension.
- **Solution**: PsychLens acts as an intuitive, natural psychological lens that decodes emotional dynamics, micro-expressions, posture, and color psychology from images and camera feeds.

### 1.2 Monetization & Credit Economy (RevenueCat Powered)
- **Billing Infrastructure**:
  - Unified with **RevenueCat** for seamless cross-platform payment processing, subscription management, web checkout, and Google Play / App Store receipt validation.

| Tier / Feature                 | Details & Pricing            | Quota & Benefits                                                                                    |
| ------------------------------ | ---------------------------- | --------------------------------------------------------------------------------------------------- |
| **Daily Free Quota**     | $0 (Default for all users)   | **3 free images/day** (automatically resets every night at 00:00 local time)                  |
| **Welcome Gift**         | $0 (One-time signup/install) | **10 bonus credits** added to wallet upon first opening the app                               |
| **BYOK Key Connect Bonus** | $0 (Connect own Gemini key) | **+500 bonus credits** one-time gift + user requests route via personal key first            |
| **Credit Consumption**   | Pay-as-you-go                | **1 credit = 1 image analysis** (Daily free quota is consumed first before deducting credits) |
| **Credit Top-Up Pack**   | **$1.00** one-time     | **100 credits** (Never expire) via RevenueCat                                                 |
| **Monthly Subscription** | **$1.00 / month**      | **100 credits / month** + Ad-free experience via RevenueCat                                   |
| **Yearly Subscription**  | **$9.99 / year**       | **1,000 credits / year** + Ad-free experience + priority model routing via RevenueCat          |
| **Rewarded Ad Program**  | Free opt-in                  | Users can voluntarily watch a sponsor video to earn **+1 or +2 bonus credits**                |
| **Banner Advertising**   | Passive monetization         | Single non-intrusive banner ad displayed at bottom of screen for free users only                    |

---

## 2. Visual & Interaction Design System

### "Natural, Realistic, Human-Centric White Theme"
> [!IMPORTANT]
> **No Generic AI Clichés**: Strict departure from dark neon, cyberpunk, or heavy gradients. The aesthetic must feel like a clean, high-end editorial journal or thoughtful mindfulness tool (Calm / Notion / Apple Minimal).

- **Color Palette**:
  - **Background**: Pure White (`#FFFFFF`) with soft, organic warm-neutral backing (`#F8F9FA`, `#F3F4F6`).
  - **Panels & Cards**: Crisp white surfaces with subtle 1px border lines (`#E5E7EB` / `#E2E8F0`) and delicate feathered drop-shadows (`rgba(0, 0, 0, 0.04)`).
  - **Typography**: Deep Slate Black (`#0F172A`) for bold, editorial titles; Muted Charcoal (`#475569`) for psychological descriptions; Warm Gray (`#94A3B8`) for metadata.
  - **Accents**: Natural, organic tones (Sage green `#10B981`, Warm Amber `#D97706`, Soft Rose `#E11D48`, Calm Indigo `#4F46E5`) used sparingly for badges and tension gauges.
- **Layout Philosophy**:
  - Generous whitespace, rounded tactile corners (`12px` to `16px`), readable typography (*Plus Jakarta Sans* / *Inter*).
  - Clean camera viewfinder with minimalist wireframe reticle and uncluttered controls.
- **Brand Attribution**:
  - Clean footer and metadata: *Licensed product of Techfiyr (techfiyr.com)*.

---

## 3. Technology & Model Architecture

### 3.1 Model Routing & Multi-Key Fallback Engine
- **API Key Pool & Rate-Limit Fallback**:
  - The application reads the primary key (`apikey_gemini`) plus backup keys (`apikey_gemini_backup_1`, `apikey_gemini_backup_2`, etc. or a comma-separated key pool) from `.env`.
  - **Dynamic Rate-Limit Detection & Failover**:
    - When an inference request encounters **HTTP 429 ("Too Many Requests")**, **Quota Exceeded ("RESOURCE_EXHAUSTED")**, or rate-limit blocks:
    - The active key is placed into a temporary cooling-off state (e.g., 60 seconds).
    - The engine automatically re-routes the pending inference to the next healthy API key in the prioritized pool.
    - Zero user disruption: The user experiences smooth analysis without quota error alerts.
  - Client-side environment bridge configured in `vite.config.js` (`envPrefix: ['VITE_', 'apikey_']`) so `.env` keys are accessible.
- **Gemini Model Spectrum**:
  - **Visual Psychology Engine**: Gemini 3.8 Flash for sub-second multimodal analysis of image, gaze, and posture.
  - **Native Audio Dialog**: Gemini Flash Native Audio / Web Speech API for organic voice explanations.
  - **Live Translation**: Gemini 3.8 Flash Live Translate for multi-language nuance conversion.
  - **Extended Thinking**: Gemini 3.8 Flash Live Extended Thinking for in-depth psychological profiling.
  - **Video Transcribe (Phase 2 readiness)**: Gemini 3.5 Transcribe Live for short confessions (<1 min).

### 3.2 Image Storage, Consent & Community Architecture (Zero Server Cost)
- **Multi-Host Cascading Temporary Public Storage**:
  - Implements a resilient multi-host adapter pipeline to safeguard against upload caps and rate limits:
    - **Primary Host**: **ImgBB API** with `expiration=604800` (strictly **7 days** auto-destruction).
    - **Secondary Failover**: **Litterbox (Catbox)** with `time="72h"` temporary auto-delete.
    - **Tertiary Failover**: **FreeImage.host** temporary upload endpoint.
  - Zero server storage burden. Images naturally vanish after 7 days or less across hosts.
- **User Consent & Terms Protocol**:
  - **Free Users**: Mandatory explicit consent modal prior to publishing:
    - Must acknowledge: *"I consent to upload this image to a temporary public host (auto-deleted in 7 days or less) and understand it can be viewed by anyone in the public stream."*
  - **Paid Users**:
    - **Universal Google Photos Sync**: ALL analyzed images (both private and public) are automatically backed up to the user's personal `PsychLens Private Vault` album in Google Photos.
    - **Public Sharing Acknowledgment**: When choosing to share publicly, paid users explicitly acknowledge: *"This image will be visible to all community users, while your permanent master remains archived in your private Google Photos."*
- **Community Analytics & Search**:
  - **View Impression Counter**: Real-time counter on each community post tracking how many users have viewed the analysis.
  - **Image & Psychological Search**: Fast search allowing users to find stored images by emotional keywords, micro-expression tags, mood intensity, or visual scene descriptions.
- **Client-Side Image Optimization**:
  - HTML5 Canvas downsamples images and encodes to WebP (`~80KB`), stripping all private EXIF/GPS metadata prior to transmission.

---

## 4. Content Safety & Moderation (Strict PG-13 / PG-16 Policy)
> [!CAUTION]
> **Zero Adult Content Policy**:
> PsychLens is strictly rated **PG-13 / PG-16**. No adult, pornographic, sexually suggestive, graphic violent, or hate-based images are permitted under any circumstances.

- **Automated Pre-Analysis Safety Gate**:
  - Before running full analysis or deducting any user credits, the system performs an immediate safety screening via Gemini multimodal safety ratings:
    - `HARM_CATEGORY_SEXUALLY_EXPLICIT`: `BLOCK_LOW_AND_ABOVE`
    - `HARM_CATEGORY_DANGEROUS_CONTENT`: `BLOCK_LOW_AND_ABOVE`
    - `HARM_CATEGORY_HARASSMENT`: `BLOCK_LOW_AND_ABOVE`
  - If flagged, the image is immediately rejected with a clean notification: *"This image cannot be analyzed. PsychLens maintains a strict PG-13/16 family-safe environment."*
  - **Credit Protection**: Users are never charged credits for rejected or blocked images.

---

## 5. App Store & Regulatory Compliance (Google Play, Apple, GDPR/CCPA, ISO)

### 5.1 User-Generated Content (UGC) Mandate (Apple Guideline 1.2 & Google Play UGC)
- **Mandatory Reporting & Blocking**:
  - Every public community image post features a visible **"Report Inappropriate Content"** trigger.
  - Users can **Block / Hide** posts from specific authors instantly.
  - Submissions violating guidelines are immediately removed.
- **EULA / Terms Agreement**:
  - Users must accept clear community terms (zero tolerance for objectionable, harassing, or explicit media) before publishing their first post.

### 5.2 GDPR & CCPA Facial Privacy Safe Harbor
- **Non-Biometric Processing**:
  - The Terms of Service and Privacy Policy explicitly state: *PsychLens does not generate, process, or store biometric templates, facial geometry, or unique personal identifiers. Images are processed ephemerally solely for contextual artistic and emotional analysis.*
- **EXIF Metadata Stripping**:
  - All GPS location data and camera hardware identifiers are scrubbed client-side prior to transit.
- **Right to be Forgotten (Account & Vault Purge)**:
  - In compliance with GDPR Article 17 and Apple Guideline 5.1.1(v), an in-app **"Delete All Data & Vault"** action completely wipes local IndexedDB, cached keys, and user sessions in one tap.

### 5.3 Google Photos Minimal OAuth Scope
- Restricted strictly to **`https://www.googleapis.com/auth/photoslibrary.appendonly`**.
- Limits access to creating and adding to its own `PsychLens Private Vault` album without requesting read access to personal photos, bypassing costly Tier 2 CASA security audits.

### 5.4 RevenueCat Cross-Platform Unified Billing
- Unified with **RevenueCat**:
  - Bridges web purchases and native mobile store purchases (Google Play Billing & Apple StoreKit).
  - Handles customer entitlments, subscription lifecycle, cancellations, and renewals.

### 5.5 Google AdMob Placement Safety
- Banner ads are positioned with strict CSS margin buffers (minimum 24px) away from interactive controls (e.g., camera shutter button and navigation tabs) to prevent accidental clicks.

---

## 6. Admin Operations & Business Intelligence Dashboard

A dedicated, protected management portal (`/admin`) for Techfiyr administrators:

### 6.1 API Key Pool & Real Gemini Quota Monitor
- Real-time display of all configured Gemini API keys in the multi-key pool.
- Health status for each key (Active, Cooling Down, Rate-Limited).
- Real-time token usage, request counts, and quota percentages.
- Capability to add, remove, or adjust key priority on the fly.

### 6.2 Price & Subscription Model Management
- Interactive controls to adjust credit top-up pricing ($1.00 for 100 credits, or custom promos).
- Configure monthly and yearly subscription tier pricing and perks.
- RevenueCat product ID mapping.

### 6.3 User Account & Moderation Controls
- Directory of active users with total analyses performed and current credit balances.
- Manual quota adjustments (grant promotional credits or reset daily limits).
- Action controls: **Restrict User**, **Temporary Suspension**, or **Permanent Ban** for abusive/violating accounts.
- Audit log of reported UGC posts with 1-click delete/dismiss.

### 6.4 Analytics & Google Analytics (GA4) Tracking
- Built-in GA4 integration tracking:
  - Daily Active Users (DAU), Monthly Active Users (MAU).
  - Capture source breakdown (Live Camera vs. File Upload).
  - Multimodal analysis latency & success rate.
  - Conversion funnel from free 3-daily quota to paid top-up or subscription.
  - Most analyzed mood categories and emotional trends.

### 6.5 Promotional Offers, Special Event Giveaways & Leaderboards
- **Offer & Promo Code Generator**: Create custom promo codes (e.g., `TECHFIYR50`) granting free credits.
- **Special Event Giveaways**: Launch timed holiday/event credit bonuses (e.g., "Weekend Mindfulness: +20 Free Credits").
- **Community Leaderboards**: View and feature top psychological insights, most viewed visual reflections, and community engagement badges.

---

## 7. Target Platforms: Web & Android

### 7.1 Web Application (PWA)
- Fully responsive layout for desktop, tablet, and mobile browsers.
- Installable PWA with `manifest.json`, offline shell caching, and standalone full-screen camera experience.

### 7.2 Android Application Roadmap
- **Packaging Strategy**:
  - Option A: **Trusted Web Activity (TWA)** / Bubblewrap — lightest weight, 100% feature parity with web updates, distributed via Google Play Store.
  - Option B: **Capacitor Android** — embeds native camera permissions, RevenueCat Google Play In-App Billing, and AdMob native banner/rewarded ads.## 8. Implementation Milestones

### Phase 1: Natural White Theme & Editorial UI Polish
- [x] Refactor CSS from dark cyberpunk glassmorphism to an airy, elegant, natural white/light theme.
- [x] Add Techfiyr branding attribution to footer and legal headers.
- [x] Update Navbar with subtle, high-end editorial styling and credit wallet balance pill.
- [x] Polish Camera Viewfinder and Presets with natural clean aesthetics.
- [x] Redesign Analysis View cards with clear hierarchy, soft slate borders, and readable typography.

### Phase 2: Credit Economy, Subscriptions & RevenueCat Engine
- [x] Create `creditService.js`:
  - Daily quota (3 free/day with midnight timestamp reset).
  - 10 welcome bonus credits for new users.
  - **BYOK Incentive Engine**: One-time grant of **+500 bonus credits** when user saves their own valid Gemini API key.
  - Credit balance storage in `localStorage`.
  - Transaction history (image analyzed, ad watched, pack purchased, BYOK bonus claimed).
- [x] Build **RevenueCat Billing Bridge (`revenueCatService.js`)**:
  - Web checkout integration.
  - Hooks for Google Play In-App Billing via RevenueCat.
- [x] Build **Credits & Subscription Store Modal**:
  - Current balance display (Free daily remaining + Total wallet credits).
  - $1.00 Top-Up (100 credits).
  - $1.00 / month Subscription (100 credits/mo + Ad-free).
  - $9.99 / year Subscription (1,000 credits/yr + Ad-free).
  - BYOK bonus callout banner (+500 free credits promo).
- [x] Build **Ad Monetization Components**:
  - Bottom persistent Banner Ad placeholder with safe margin spacing.
  - Rewarded Ad Modal: "Watch a 15-second sponsor video to earn +1 credit" with simulated/AdSense video player.

### Phase 3: Gemini Integration, Multi-Key Failover & Content Safety
- [x] Update `vite.config.js` to expose `apikey_gemini` and backup keys from `.env`.
- [x] Build `geminiKeyPoolService.js`:
  - Multi-key rotation pool with priority ordering.
  - Automatic failover upon HTTP 429 ("Too Many Requests") or quota exhaustion.
  - Cooldown timer for rate-limited keys.
- [x] Connect Gemini 2.5 Flash / 3 Flash multimodal endpoint with multi-key routing.
- [x] Implement **Pre-Analysis Content Safety Screening**:
  - Block adult, sexually suggestive, and graphic violence content (PG-13/16).
  - Show polite family-safe rejection notice without charging user credits.
- [x] Add model profile selector (Fast Flash vs. Extended Psychological Thinking).

### Phase 4: Multi-Host Storage, Consent, Google Photos & Community Search
- [x] Build `publicImageHostService.js`:
  - Cascading multi-host uploader: ImgBB (7d auto-expire) -> Litterbox (72h) -> FreeImage.host fallback.
  - WebP image compression with client-side EXIF stripping.
- [x] Build **Public Upload Consent Modal**:
  - Free user terms agreement prior to public upload.
  - Paid user public visibility acknowledgment.
- [x] Build `googlePhotosService.js`:
  - Google Sign-In & OAuth2 integration using `photoslibrary.appendonly`.
  - Automatic backup of all images (private & public) for paid users to personal `PsychLens Private Vault` album.
  - Local IndexedDB fallback for unlinked users.
- [x] Upgrade Public Feed & Community UGC Safety:
  - Add **View Impression Counter** to track and display total views on each image.
  - Add **Image & Psychological Search** bar to search across emotions, tension index, and visual descriptions.
  - Add **Report / Flag Inappropriate Image** action on all community posts (UGC Mandate).
  - Add **Block Author** action to hide posts from specific creators.

### Phase 5: Privacy, GDPR & Account Deletion Controls
- [x] Build **Privacy & Data Management Settings**:
  - One-tap **"Clear Vault & Reset Data"** button (purges local IndexedDB, transaction logs, and cookies).
  - Privacy policy dialog detailing non-biometric safe harbor and ephemeral processing.

### Phase 6: Admin Operations & Business Intelligence Dashboard
- [x] Build `/admin` portal (protected with admin PIN `techfiyr2026`):
  - **API Key Manager & Live Quota Visualizer**: Real-time pool health, quota bars, and key rotation state.
  - **Pricing & Subscription Editor**: Modify top-up prices and subscription configurations.
  - **User & Account Management**: Inspect user sessions, grant/deduct credits, and ban/restrict accounts.
  - **UGC Moderation Queue**: Review reported images and take action (dismiss or delete).
  - **Promotions & Giveaway Center**: Create promo codes and trigger special event giveaways.
  - **Community Leaderboard Manager**: View top emotional posts and engagement metrics.
  - **Google Analytics (GA4) Integration**: Configure Measurement ID and trigger conversion events.

### Phase 7: Android App Preparation (PWA & Manifest)
- [x] Create PWA `manifest.json` with Android icons, standalone display mode, and theme colors (`#FFFFFF`).
- [x] Link manifest and white theme-color in `index.html`.
- [x] Android Ready: Zero server storage overhead, compliant with Apple & Google Play Store UGC mandates.
- [x] Responsive Layout Overhaul: Floating fixed modal overlay system with backdrop blur, ergonomic PWA mobile bottom navigation bar (`[Lens]` `[Vault]` `[Feed]` `[Store]`), and desktop horizontal segment tabs.

### Phase 8: Google Images-Style Clean Minimalist UI Redesign
- [x] **Revamp Home Screen to Iconic Google Images Aesthetic**:
  - Replaced heavy, clumsy hero section and auto-firing camera with a serene, centered Google Images / Google Lens interface.
  - Centered brand identity: `🔮 PsychLens` with editorial subtitle (`Visual Emotion & Micro-Expression Intelligence`).
  - Google Lens search bar & drop zone:
    - Sleek rounded pill (`border-radius: 999px`, subtle `#dfe1e5` border, soft hover shadow).
    - Left: Search icon.
    - Center: Interactive prompt ("Drop image or search any visual emotion...").
    - Right: Action icons for 📷 Live Camera and 📁 File Upload.
  - Interactive Google Lens Drag & Drop card with web URL paste input and direct file picker.
  - Curated psychological moments as small card sections with visual thumbnails (`Solitude Commute`, `Vulnerable Gaze`, `Street Confession`, `Warm Contemplation`).
  - Opt-in camera mode: Camera opens only upon explicit user request with clean controls, smooth transition, and a clear "✕ Close" button.
  - Error-free camera fallback: Friendly light-card notification if camera permissions are missing or unavailable, with zero intrusive dark boxes.

### Phase 9: Legal Safe Harbor, Organic Voice Cadence & Country-Based Localization
- [x] **Educational & Non-Harm Safe Harbor Disclaimer**:
  - Prominent disclaimer card embedded below all visual analysis results detailing that AI interpretations may make mistakes, are strictly non-diagnostic, and cannot be used for security vetting, forensic assessment, character evaluation, or to defame/harm any individual.
  - Comprehensive Section 5 inserted into `LegalModal.jsx` establishing complete legal indemnification and safe harbor shielding Techfiyr and developers from liability.
- [x] **Natural Human-Centric Voice & Narration**:
  - Speech synthesis tuned to 0.92 rate and 1.0 pitch with neural/natural human voice selection (Google/Natural/Siri/Samantha/Daniel).
  - Gemini prompt engineered with warm, conversational, observant human narrative tone avoiding clinical jargon and robotic phrasing.
- [x] **Custom Minimalist Vector Logo (Camera Aperture + Mind Iris)**:
  - Replaced generic emoji with custom scalable vector brand mark (`PsychLensLogo.jsx`) combining camera aperture blades with an introspective human eye iris and radiant perception spark.
  - Linked new vector `favicon.svg` in `index.html`, `Navbar.jsx`, `App.jsx`, and PWA manifest.

### Phase 10: Documentation, Techfiyr Licensing & Safe Distribution
- [x] **Comprehensive Standard README.md**:
  - Full product description, architectural overview, technology stack, freemium credit model, and build instructions.
  - Interactive Mermaid architecture diagram.
  - Prominent Techfiyr ownership attribution with non-commercial / research licensing terms.
- [x] **Official Techfiyr LICENSE**:
  - Research, educational, academic, and non-profit usage permitted.
  - Commercial use, SaaS hosting, and monetization strictly prohibited without written commercial license from Techfiyr (https://techfiyr.com).
  - Commercial contact channels: licensing@techfiyr.com / contact@techfiyr.com.
- [x] **Security Hardening**:
  - Added `.env` and `.env.*` to `.gitignore` to prevent leaking API keys to GitHub.
  - Created `.env.example` template for clean onboarding.

### Phase 11: Dynamic CC0 Random Presets, Admin Access & External Services Integration
- [x] **Dynamic 5 Random Public Domain (CC0) Photos**:
  - Replaced broken Unsplash URLs with an expanded pool of verified public-domain / CC0 photography portraits.
  - Implemented dynamic 5-photo random slice upon every fresh visit / page load.
  - Added interactive "🔀 Shuffle 5 New" button for testing diverse emotional scenarios on demand.
  - Built automatic `onError` fallback recovery on all thumbnails to ensure zero broken image states.
- [x] **Admin Dashboard Access & PIN Sync**:
  - Exposed `admin_key` via `vite.config.js` (`envPrefix: ['VITE_', 'apikey_', 'admin_']`).
  - Added URL hash routing (`#admin`, `/admin`, `?admin=true`) to directly launch the Admin console.
  - Made the Admin navigation button prominent in the top navigation bar.
  - Synchronized authentication PIN with `.env` `admin_key="xxxxxx"`.
- [x] **Complete `.env` Service Configuration & Setup Guide**:
  - Populated `.env` with well-commented sections and setup steps for Gemini API, Admin PIN, ImgBB, RevenueCat, GA4, and Google Photos.
  - Preserved active user keys while providing instant reference guides.
  - Created standalone [SETUP_GUIDE.md](file:///Users/metastudio/saurav/development/workspaces/explainer/SETUP_GUIDE.md) document detailing step-by-step account creation, key generation, and configuration for all external services.
- [x] **Universal Clickable Hyperlinks for Techfiyr**:
  - All references to **Techfiyr (https://techfiyr.com)** across the Navbar, Footer, Legal & Ethics Modals, Behavioral Disclaimers, Banner & Rewarded Ads, Admin Dashboard, and documentation have been transformed from static text into live, clickable hyperlinks redirecting directly to `https://techfiyr.com`.
- [x] **Comprehensive Standard Legal & Policy Hub**:
  - Removed internal Admin and BYOK setup links from the public footer to create a clean, professional production layout.
  - Built an interactive, tabbed **Governance & Legal Policy Hub** in [LegalModal.jsx](file:///Users/metastudio/saurav/development/workspaces/explainer/src/components/LegalModal.jsx) and created [LEGAL_POLICIES.md](file:///Users/metastudio/saurav/development/workspaces/explainer/LEGAL_POLICIES.md) covering:
    1. **Privacy Policy**: GDPR Art. 9/17, CCPA, non-biometric safe harbor, EXIF/GPS scrubbing, 7-day TTL auto-purge, 1-tap vault wipe.
    2. **Content Policy**: Strict PG-13 / PG-16 rating, zero tolerance for adult, sexually explicit, violent, or hate content, automated screening gate.
    3. **License & Attribution**: TechFiyr Research, Educational & Non-Commercial Source License, commercial restrictions.
    4. **Content Use Policy**: User photo copyright ownership, permissible card sharing, prohibition on covert profiling or model scraping.
    5. **Safety & Usage Policy**: Apple Guideline 1.2 & Google Play UGC compliance, in-app report/flagging, author blocking, age verification.
    6. **AI Disclaimer Policy & Guidelines**: Non-diagnostic, non-medical, AI fallibility, prohibition of forensic/threat assessment, mutual indemnification safe harbor.

### Phase 12: High-Resolution 512x512 Brand & App Icon Assets
- [x] **Vector Brand Logo PNG (`logo.png` & `public/logo-512.png`)**:
  - Exactly 512x512 pixels, 53 KB (< 500 KB requirement).
  - Transparent background, crisp dark slate rim (`#0F172A`), golden spiral aperture blades, deep indigo iris (`#4F46E5`), and emotional perception spark.
- [x] **PWA & Android App Icon PNG (`public/icon-512.png` & `public/icon-192.png`)**:
  - Exactly 512x512 pixels (64 KB) and 192x192 pixels (20 KB).
  - Editorial off-white squircle card backing with subtle border for seamless mobile launcher rendering.
  - Linked to `public/manifest.json` and `index.html` (`apple-touch-icon`).
- [x] **Photorealistic Editorial Concept PNG (`public/logo-concept-512.png`)**:
  - Exactly 512x512 pixels, 177 KB (< 500 KB requirement).
  - Detailed rendered camera aperture lens with human eye iris and perception spark.

### Phase 13: Default English, Bengali/Hindi Translation Engine & Soft Female Native Voice
- [x] **Default English Setup**:
  - `AnalysisView.jsx` and `geoLanguageService.js` strictly default to English (`en-US`) on load without forced auto-translation.
- [x] **Live Multilingual Translation Engine**:
  - Upgraded `translateAnalysis()` in `geminiService.js` with multi-model cascade (`gemini-3.5-flash`, `gemini-3.8-flash`, `gemini-3.5-flash-lite`, `gemini-flash-latest`) and key rotation.
  - Added high-fidelity contextual translation fallbacks for Bengali and Hindi, eliminating mock/demo strings entirely.
  - Interactive translation status indicator and dedicated playback trigger on translation cards.
- [x] **Soft Female Native Voice Synthesis**:
  - Upgraded `speechService.js` with `findBestFemaleSoftVoice()` to select native soft female models (e.g. `Piya`/`Tanishaa` for Bengali, `Lekha`/`Swara` for Hindi, `Samantha`/`Victoria` for English).
  - Calibrated acoustic cadence: pitch `1.08` and rate `0.88` for contemplative, empathetic feminine narration.

### Phase 14: In-Place Card Translation (Unified UX Without Separate Translation Box)
- [x] **Removed Redundant Translation Box**:
  - Eliminated the separate translation container above the cards for a clean, unified presentation.
- [x] **In-Place Card Transformation**:
  - Integrated `translateAnalysisStructured()` in `geminiService.js` to translate all cards as a structured JSON entity.
  - Dominant Emotional Core, Behavioral Dynamics, Chromatic & Spatial Vibe, Reflection Prompt, and Deep-Dive chips transform directly in place upon language selection.
- [x] **Localized Card Typography & UI Labels**:
  - Added multi-lingual card labels (`CARD_LABELS`) for eyebrows, titles, meter labels, and reflection tags.
  - Added subtle loading state while updating cards and cached translations for instant language flipping.

### Phase 15: Gemini 3.8 Live Extended Thinking, Transcribe Live & Person/Scene Visual Intelligence
- [x] **Gemini 3.8 Live Extended Thinking Multimodal Routing**:
  - Implemented `gemini-3.8-flash` with `thinkingConfig: { thinkingBudget: 1024 }` as the primary visual psychology engine.
  - Multi-tier live fallback cascade: `gemini-3.8-flash` -> `gemini-3.5-flash` -> `gemini-3-flash-preview` -> `gemini-3.6-flash` -> `gemini-3.5-flash-lite`.
- [x] **Gemini 3.5 Transcribe Live & Scene Transcription**:
  - Detailed scene and environmental transcription decoding background, lighting quality (studio/ambient/directional), depth of field, and spatial composition.
- [x] **Person & Subject Identification**:
  - Accurate identification of individual persons: estimated age range, gaze direction, head tilt, posture, clothing style, and demeanor.
  - Non-person handling: If artwork, symbol, animal, or abstract object is uploaded, precisely identifies and decodes archetypal geometry and symbolic resonance.
- [x] **Resolved Repetitive Output Root Cause**:
  - Sanitized base64 payloads to strip `data:image/[^;]+;base64,` prefixes before sending to Google Gemini endpoints, preventing silent API 400 rejection.
  - Upgraded content moderation gate `screenImageSafety` with clean base64 data and model cascade.
  - Every uploaded image now receives real-time, image-specific perceptual decoding without falling into static fallback presets.
- [x] **UI Integration & In-Place Multilingual Transcription**:
  - Added dedicated *Subject & Person Identification* and *Full Picture & Visual Context* cards to [AnalysisView.jsx](file:///Users/metastudio/saurav/development/workspaces/explainer/src/components/AnalysisView.jsx).
  - Wired subject identification and scene description into [translateAnalysisStructured()](file:///Users/metastudio/saurav/development/workspaces/explainer/src/services/geminiService.js) for seamless in-place translation into Bengali, Hindi, Spanish, French, German, and Arabic.
  - Extended soft female voice narration to speak the identified subject demeanor before diving into emotional core and behavioral dynamics.

### Phase 16: Localized Infographic Card & Per-Card Smooth Voice Narration (Bengali Voice Fix)
- [x] **Language-Aware Dynamic Infographic Card Generator**:
  - Updated `AnalysisView.jsx` `handleDownloadCard` to pass `activeData` (translated analysis) and current language/labels instead of static English `analysis`.
  - Updated `cardGenerator.js` with localized titles, badges, tension meters, and footer watermarks for all supported languages (Bengali, Hindi, Spanish, French, German, Arabic, English).
  - Added Unicode / Bengali-safe canvas font stack (`"Plus Jakarta Sans", "Noto Sans Bengali", "SolaimanLipi", "Hind Siliguri", "Bangla", system-ui, sans-serif`) for clear glyph rendering.
  - Integrated Subject & Person Demeanor into the infographic card layout.
- [x] **Bengali Voice Playback Bug Fix**:
  - Fixed voice selection in `speechService.js`: Never assigns an English fallback voice to non-English text (prevents silent fail / crash on Bengali Unicode).
  - Mapped and supported both `bn-BD` and `bn-IN` dialect codes so systems with `Piya` (`bn_IN`) or `Google বাংলা` (`bn-BD`) play smoothly.
  - Set `utterance.lang` to match the resolved voice's native language code.
  - Guarded against Chrome race condition (`cancel()` followed immediately by `speak()`) using a micro-delay.
- [x] **Per-Card Voice Player Architecture (Eliminate Clumsy Global Voice Button)**:
  - Removed the global voice button from the top navigation bar to prevent speaking a massive concatenated string that breaks browser speech limits.
  - Placed smooth, dedicated "Listen" / "Stop" toggle buttons directly on each individual card header:
    1. *Subject & Person Identification*
    2. *Full Picture & Visual Context*
    3. *Dominant Emotional Core & Atmosphere*
    4. *Behavioral Dynamics & Body Language*
    5. *Chromatic & Spatial Vibe*
    6. *Reflection Prompt*
  - Added localized labels in `CARD_LABELS` for the audio toggle (e.g. English: `Listen` / `Stop`, Bengali: `শুনুন` / `থামুন`, Hindi: `सुनें` / `रोकें`).
  - Active playing indicator on the card being narrated with 1-click stop.
- [x] **Offline Translation Completeness**:
  - Added fallback translations for `subjectIdentification` and `sceneDescription` in `getOfflineStructuredTranslation` for Bengali and Hindi.

---

- [x] Product ownership defined: Licensed product of Techfiyr (techfiyr.com).
- [x] Billing infrastructure defined: RevenueCat unified cross-platform billing.
- [x] Credit model defined (3 free daily, 10 welcome credits, $1=100 credits, $1/mo, $9.99/yr).
- [x] BYOK incentive program (+500 bonus credits for connecting own Gemini key) defined.
- [x] Ad model defined (opt-in rewarded ads for credits + persistent banner for free users).
- [x] Theme direction finalized (Natural realistic human white theme, simple and cool).
- [x] Multi-key Gemini API pool with automatic rate-limit (HTTP 429) fallback defined.
- [x] Multi-host public storage defined (ImgBB 7d -> Litterbox 72h fallback).
- [x] User consent protocols defined (Free user consent + Paid user Google Photos auto-sync & public acknowledgment).
- [x] UGC safety compliance defined (Report post + Block author + EULA terms).
- [x] GDPR & Privacy compliance defined (Non-biometric safe harbor, EXIF strip, 1-tap vault wipe).
- [x] Google Photos scope locked to `photoslibrary.appendonly`.
- [x] Admin dashboard defined (API key pool, pricing, user moderation, GA4, offers, leaderboards).
- [x] Environment API key registered in `.env`.
- [x] User approval on `.agents/plan.md` received.



