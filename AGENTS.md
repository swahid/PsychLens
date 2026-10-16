# AGENTS.md — Workspace Guidelines & Operating Instructions

## 1. Project Overview, Ownership & Vision
- **Project Name**: PsychLens (EmotiSight)
- **Product Ownership**: Licensed product of **Techfiyr** ([techfiyr.com](https://techfiyr.com)). All rights reserved.
- **Primary Platforms**: Responsive Web Application & Android App (PWA / Mobile WebView / Capacitor ready)
- **Purpose**: Psychological, emotional, and artistic visual interpreter. Decodes hidden emotions, micro-expressions, body language, tension indices, and color psychology from images and camera feeds.

---

## 2. Planning & Task Execution Workflow (Mandatory Rules)
1. **Single Master Plan File**:
   - Always maintain and update the master plan at `.agents/plan.md`.
   - **DO NOT** create multiple or fragmented plan files. Keep all phases, roadmap updates, and progress tracking in `.agents/plan.md`.
   - Before executing tasks, review and update `.agents/plan.md`.
   - After implementing changes, update the status checkboxes and notes inside `.agents/plan.md`.
2. **Approval Before Execution**:
   - Do not write application code without explicit user alignment and approval on the plan.

---

## 3. UI/UX Design Philosophy: Clean, Natural, Realistic Light Theme
- **NO Generic "AI" Clichés**: Avoid glowing neon purple/cyan cyberpunk themes, heavy dark backgrounds, or excessive gradient cards.
- **Natural & Human-Centric**:
  - Crisp, serene, realistic **White/Light theme** with warm off-whites (`#FAFAFA`, `#F4F5F7`), slate grays (`#1E293B`, `#64748B`), and subtle border outlines (`#E2E8F0`).
  - Editorial, peaceful, and clean layout inspired by thoughtful publication design (Kinfolk, Notion, Apple Minimal).
  - High contrast, airy whitespace, clean typography (*Plus Jakarta Sans* / *Inter*), gentle soft shadows, and understated status badges.

---

## 4. Business & Monetization Architecture (RevenueCat Powered)
- **Billing Infrastructure**:
  - Uses **RevenueCat** for unified cross-platform billing, subscription management, web payments, and mobile store receipt validation.
- **API Model & Multi-Key Fallback Pool**:
  - The app bundles our platform Gemini API key (from environment variables) for out-of-the-box user access.
  - **Dynamic Multi-Key Pool & Fallback**: Maintains a prioritized pool of Gemini API keys. If the primary key encounters rate limits (HTTP 429), quota exhaustion, or temporary limits, requests automatically failover to the next healthy API key in the pool with automatic cooldown management.
- **Quota & Credit System**:
  - **Daily Free Quota**: 3 free image analyses per day. Quota automatically resets at local midnight.
  - **Welcome Bonus**: 10 bonus credits granted to every new user upon onboarding.
  - **BYOK (Bring Your Own Key) Incentive**: Any user who connects their own Google Gemini API key receives an instant one-time bonus of **+500 credits**! Requests route through their key first, saving platform infrastructure costs.
  - **Credit Consumption**: 1 image analysis = 1 credit. Free daily allowance is consumed first, then bonus/purchased credits.
- **Monetization & Subscriptions**:
  - **Credit Top-Up**: $1.00 for 100 credits.
  - **Monthly Subscription**: $1.00/month (auto-renews with 100 credits/month + removes banner ads).
  - **Yearly Subscription**: $9.99/year (auto-renews with 1,000 credits/year + removes banner ads).
- **Advertising Model**:
  - **Persistent Banner Ad**: Displayed discreetly to free-tier users at the bottom of the viewfinder/results.
  - **Rewarded Video Ad Program**: Strictly opt-in ("Watch a brief sponsor clip to earn +1 credit"). Users are never forced to watch ads.

---

## 5. Model Architecture & Live Capabilities
- Multi-model routing tailored for Gemini:
  - **Gemini Multimodal / 2.5 Flash / 3 Flash**: Rapid visual psychology, micro-expression decoding, and color analysis.
  - **Native Audio & Live API Readiness**: Real-time voice dialog and audio transcription.
  - **Extended Thinking**: Deep psychological profiling and philosophical inquiry.
  - **Live Translate**: High-accuracy multi-lingual interpretation.

---

## 6. Image Storage, Consent & Community Architecture
- **Multi-Host Temporary Public Storage**:
  - Cascading multi-host fallback (e.g. ImgBB with 7-day TTL -> Litterbox/Catbox 72h -> FreeImage.host) to guarantee continuous uptime against rate limits and upload quotas.
  - Automatically expires and deletes images within **7 days or less**.
- **User Consent & Terms Protocol**:
  - **Free Users**: Mandatory explicit consent modal prior to publishing: user must acknowledge the photo will be hosted temporarily on a public image host and viewable by any user.
  - **Paid Users**: Automatically syncs ALL images (both private and public) directly to their personal **Google Photos** album. When posting publicly, paid users acknowledge the image can be viewed publicly by anyone while their master remains in their Google Photos.
- **Community Analytics & Search**:
  - **View Impression Counter**: Real-time counter showing how many people have viewed the image.
  - **Image & Emotion Search**: Capability for users to search stored images across emotional tags, psychological terms, and visual context.
- **Private Gallery**:
  - Strictly restricted to the individual user (stored locally in IndexedDB and/or synced to Google Photos).

---

## 7. Content Moderation & Safety (PG-13 / PG-16)
- **Strict Content Policy**: Zero tolerance for adult, pornographic, sexually suggestive, graphic violent, or hate-based content. The app is strictly rated **PG-13 / PG-16**.
- **Automated Screening**: Every uploaded/captured photo must pass automated safety screening (Gemini safety ratings / pre-inference filter) before analysis or publishing.
- Violating content is rejected immediately with a clear, polite explanation, protecting community integrity and app store compliance.

---

## 8. Store & Regulatory Compliance (Play Store, App Store, GDPR, ISO)
- **User-Generated Content (UGC) Mandate (Apple 1.2 & Google Play UGC Policy)**:
  - Every public item MUST include an in-app **Report/Flag** mechanism.
  - Users MUST have the ability to **Block/Hide** authors.
  - Explicit EULA/Terms agreement required before posting.
- **GDPR & Privacy Safe Harbor**:
  - No biometric facial templates or identity identification is ever generated or retained.
  - EXIF GPS metadata stripped on client prior to upload.
  - In-app 1-tap **"Clear Vault & Reset Data"** for GDPR "Right to be Forgotten" and Apple Guideline 5.1.1(v).
- **Google Photos OAuth Scope**:
  - Restricted strictly to `photoslibrary.appendonly` (allows uploading to app album only, zero access to personal user photos) for instant Google verification.
- **In-App Billing Abstraction**:
  - Unified with **RevenueCat** SDK bridging Web, Google Play Billing, and Apple StoreKit.

---

## 9. Admin Operations & Business Intelligence Dashboard
- **API Key & Live Quota Hub**:
  - Manage and monitor the pool of Gemini API keys, live token usage, and quota limits.
- **Pricing & Tier Management**:
  - Dynamically configure credit pack prices and subscription tiers.
- **User Account & Moderation Controls**:
  - Search and inspect user accounts, manage credit quotas, and restrict/ban abusive users.
- **Analytics & Google Analytics (GA4)**:
  - Track user visits, conversion funnels, session durations, camera captures, and behavioural events via GA4.
- **Promotions, Special Event Giveaways & Leaderboards**:
  - Create promotional discount codes, launch special event credit giveaways, and view community leaderboards.

---

## 10. Codebase Standards
- Use vanilla CSS or modern component styling adhering to the natural white theme.
- Ensure mobile responsiveness for Android viewport sizes and touch gestures.



