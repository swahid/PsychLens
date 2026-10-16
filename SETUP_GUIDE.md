# PsychLens (EmotiSight) — External Services & API Keys Setup Guide

**Product Ownership**: Licensed product of [TechFiyr](https://techfiyr.com). All rights reserved.

This comprehensive guide walks you step-by-step through setting up, generating, and configuring all API keys, service credentials, and licenses for **PsychLens**.

---

## Quick Reference Summary Table

| Environment Variable           | Service                          |   Required?   |         Free Tier Available?         | Where to Obtain                                          |
| :----------------------------- | :------------------------------- | :-----------: | :----------------------------------: | :------------------------------------------------------- |
| `admin_key`                  | **Admin Dashboard PIN**    | **Yes** |             N/A (Local)             | Set your custom secret PIN                               |
| `apikey_gemini`              | **Google Gemini API**      | **Yes** |         **Yes (Free)**         | [Google AI Studio](https://aistudio.google.com/)          |
| `apikey_gemini_backup_1`     | **Gemini Failover Pool**   | *Optional* |         **Yes (Free)**         | [Google AI Studio](https://aistudio.google.com/)          |
| `VITE_IMGBB_API_KEY`         | **ImgBB Image Hosting**    | *Optional* |         **Yes (Free)**         | [ImgBB API](https://api.imgbb.com/)                       |
| `VITE_REVENUECAT_PUBLIC_KEY` | **RevenueCat Billing**     | *Optional* | **Yes (Free up to $2.5k MTR)** | [RevenueCat](https://app.revenuecat.com/)                 |
| `VITE_GA_MEASUREMENT_ID`     | **Google Analytics (GA4)** | *Optional* |         **Yes (Free)**         | [Google Analytics](https://analytics.google.com/)         |
| `VITE_GOOGLE_CLIENT_ID`      | **Google Photos Sync**     | *Optional* |         **Yes (Free)**         | [Google Cloud Console](https://console.cloud.google.com/) |

---

## 1. Admin Dashboard PIN (`admin_key`)

The Admin Dashboard provides live monitoring of the Gemini API key pool, dynamic pricing adjustments, promo code generation, UGC moderation queues, and user session management.

### How to Configure:

1. Open your `.env` file in the project root.
2. Set `admin_key` to any secure code or PIN of your choice:
   ```env
   admin_key="YOUR_CUSTOM_ADMIN_PIN"
   ```
3. Save the file.

### How to Access the Admin Page:

* **Option 1**: Click the **Admin** button (shield icon) in the top-right navbar of the app.
* **Option 2**: In your browser address bar, visit:
  ```text
  http://localhost:5173/#admin
  ```
* Enter the secret PIN you configured in your `.env` and click **Unlock Dashboard**.

---

## 2. Google Gemini API (`apikey_gemini`)

**Purpose**: Powers multimodal visual psychology, micro-expression decoding, mood detection, body language analysis, and natural human narration.

### Step-by-Step Instructions:

1. Visit **Google AI Studio**: [https://aistudio.google.com/](https://aistudio.google.com/).
2. Sign in with your Google account.
3. Click on the blue **"Get API key"** button on the left navigation menu.
4. Click **"Create API key"** (select an existing Google Cloud project or create a quick new project).
5. Copy the generated key.
6. Open `.env` and paste:
   ```env
   apikey_gemini="YOUR_COPIED_GEMINI_KEY"
   ```

### (Optional) Backup Multi-Key Failover Pool:

To guarantee 100% uptime when rate limits (HTTP 429) occur, you can generate 1 or 2 additional free keys from another Google account or project:

```env
apikey_gemini_backup_1="AIzaSy...backup1"
apikey_gemini_backup_2="AIzaSy...backup2"
# Or a comma-separated pool:
# apikey_gemini_pool="key1,key2,key3"
```

*PsychLens will automatically rotate keys with an internal cooldown timer whenever Google returns HTTP 429 or quota exhaustion.*

---

## 3. Public Temporary Image Hosting (`VITE_IMGBB_API_KEY`)

**Purpose**: Allows users to upload and share images to the public community feed. Uploads are strictly ephemeral and set to **auto-delete in 7 days or less** to protect privacy and eliminate ongoing cloud storage costs.

> **Note**: PsychLens already has a default free client token and automatic failover to **Litterbox (72-hour auto-purge)** built in. Setting your own ImgBB key is optional if you want dedicated upload quotas.

### Step-by-Step Instructions:

1. Go to [https://imgbb.com/](https://imgbb.com/) and register for a free account.
2. Visit the ImgBB API developer portal: [https://api.imgbb.com/](https://api.imgbb.com/).
3. Click **"Get API Key"**.
4. Copy the 32-character API key.
5. In `.env`, uncomment and set:
   ```env
   VITE_IMGBB_API_KEY="your_imgbb_api_key_here"
   ```

---

## 4. RevenueCat In-App Billing & Subscriptions (`VITE_REVENUECAT_PUBLIC_KEY`)

**Purpose**: Manages monetization, credit packs ($1.00 for 100 credits), and subscriptions ($1.00/month or $9.99/year) across Web, Google Play Billing (Android), and Apple StoreKit (iOS).

### Step-by-Step Instructions:

1. Go to [https://app.revenuecat.com/](https://app.revenuecat.com/) and sign up for a free account.
2. Create a new Project named **"PsychLens"**.
3. In the left sidebar, navigate to **Project Settings** > **API Keys**.
4. Under **Public API Keys**, copy your **Public App Key** (usually begins with `appl_` or `goog_`).
5. In `.env`, uncomment and set:
   ```env
   VITE_REVENUECAT_PUBLIC_KEY="appl_xxxxxxxxxxxxxxxxxxxxxx"
   ```

### Products to Configure in RevenueCat (Optional):

If activating production checkout, register these matching product IDs in your RevenueCat Dashboard:

* `psychlens_100_credits` — Consumable ($1.00)
* `psychlens_monthly_100` — Subscription ($1.00 / month)
* `psychlens_yearly_1000` — Subscription ($9.99 / year)

---

## 5. Google Analytics 4 Telemetry (`VITE_GA_MEASUREMENT_ID`)

**Purpose**: Monitors active user counts, camera vs. file upload trends, conversion rates, and session interactions.

### Step-by-Step Instructions:

1. Go to [https://analytics.google.com/](https://analytics.google.com/) and sign in.
2. Click **Admin** (gear icon in the bottom left).
3. Create an **Account** and a **Property** named **"PsychLens"**.
4. Under Data Collection, click **Data Streams** > **Web**.
5. Enter your website URL (e.g., `https://psychlens.techfiyr.com` or `http://localhost:5173`) and Stream Name.
6. Copy the **Measurement ID** (formatted as `G-XXXXXXXXXX`).
7. In `.env`, uncomment and set:
   ```env
   VITE_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
   ```

---

## 6. Google Photos Private Vault Sync (`VITE_GOOGLE_CLIENT_ID`)

**Purpose**: For paid subscribers who want their private and public analyses automatically backed up to a dedicated `"PsychLens Private Vault"` album in their personal Google Photos library.

> **Privacy & Compliance**: Uses strictly minimal, append-only scope (`https://www.googleapis.com/auth/photoslibrary.appendonly`), ensuring the app can **never read, delete, or access any of the user's existing private photos**.

### Step-by-Step Instructions:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g., `PsychLens-App`).
3. In the sidebar, navigate to **APIs & Services** > **Library**.
4. Search for **"Photos Library API"** and click **Enable**.
5. Go to **APIs & Services** > **OAuth consent screen**:
   * User Type: **External**.
   * App name: **PsychLens**.
   * Add Scope: `https://www.googleapis.com/auth/photoslibrary.appendonly`.
6. Go to **APIs & Services** > **Credentials**:
   * Click **Create Credentials** > **OAuth Client ID**.
   * Application type: **Web application**.
   * Authorized JavaScript origins: Add `http://localhost:5173` (and your production domain).
7. Copy the generated **Client ID** (ends with `.apps.googleusercontent.com`).
8. In `.env`, uncomment and set:
   ```env
   VITE_GOOGLE_CLIENT_ID="xxxxxxxxxxxx-xxxxxxxxxxxxxxxx.apps.googleusercontent.com"
   ```

---

## 7. Applying Your Changes

Whenever you update or add any keys in `.env`:

1. Save the `.env` file.
2. Vite automatically reloads environment variables. If you wish to restart the dev server manually:
   ```bash
   npm run dev
   ```
3. Test the app in your browser at [http://localhost:5173/](http://localhost:5173/).

---

## Support & Commercial Inquiries

* **Product**: PsychLens (EmotiSight)
* **Parent Company**: [TechFiyr](https://techfiyr.com)
* **Commercial Inquiries**: licensing@techfiyr.com
* **General Support**: contact@techfiyr.com
