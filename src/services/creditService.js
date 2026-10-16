/**
 * Credit & Quota Economics Service
 * - 3 free daily images (resets at local midnight)
 * - 10 welcome bonus credits for new users
 * - +500 BYOK key connect bonus
 * - Subscriptions & credit purchases (via RevenueCat)
 * - Rewarded ad credits
 */

const STORAGE_DAILY = 'psychlens_daily_quota';
const STORAGE_CREDITS = 'psychlens_wallet_credits';
const STORAGE_SUB = 'psychlens_subscription';
const STORAGE_BYOK_BONUS = 'psychlens_byok_bonus_claimed';
const STORAGE_LOGS = 'psychlens_transaction_logs';

class CreditService {
  constructor() {
    this.initWallet();
  }

  getTodayDateString() {
    return new Date().toISOString().split('T')[0];
  }

  initWallet() {
    // If first time ever opening app, grant 10 welcome credits
    if (localStorage.getItem(STORAGE_CREDITS) === null) {
      localStorage.setItem(STORAGE_CREDITS, '10');
      this.logTransaction('Welcome Gift', 10, 'Initial onboarding allowance');
    }

    // Initialize daily quota if absent or new day
    const storedDaily = this.getStoredDailyQuota();
    const today = this.getTodayDateString();
    if (!storedDaily || storedDaily.date !== today) {
      this.resetDailyQuota(today);
    }
  }

  getStoredDailyQuota() {
    try {
      const raw = localStorage.getItem(STORAGE_DAILY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  resetDailyQuota(date = this.getTodayDateString()) {
    const quota = { date, remaining: 3, max: 3 };
    localStorage.setItem(STORAGE_DAILY, JSON.stringify(quota));
    return quota;
  }

  getDailyRemaining() {
    const stored = this.getStoredDailyQuota();
    const today = this.getTodayDateString();
    if (!stored || stored.date !== today) {
      return this.resetDailyQuota(today).remaining;
    }
    return stored.remaining;
  }

  getWalletCredits() {
    const raw = localStorage.getItem(STORAGE_CREDITS);
    return raw ? parseInt(raw, 10) || 0 : 0;
  }

  setWalletCredits(amount) {
    const safeAmount = Math.max(0, amount);
    localStorage.setItem(STORAGE_CREDITS, safeAmount.toString());
    return safeAmount;
  }

  isSubscribed() {
    try {
      const raw = localStorage.getItem(STORAGE_SUB);
      if (!raw) return false;
      const sub = JSON.parse(raw);
      return Boolean(sub.active && sub.expiresAt > Date.now());
    } catch {
      return false;
    }
  }

  getSubscriptionInfo() {
    try {
      const raw = localStorage.getItem(STORAGE_SUB);
      if (!raw) return { active: false };
      const sub = JSON.parse(raw);
      return {
        ...sub,
        active: Boolean(sub.active && sub.expiresAt > Date.now()),
      };
    } catch {
      return { active: false };
    }
  }

  setSubscription(planName, daysDuration = 30) {
    const sub = {
      active: true,
      plan: planName,
      startedAt: Date.now(),
      expiresAt: Date.now() + daysDuration * 24 * 60 * 60 * 1000,
    };
    localStorage.setItem(STORAGE_SUB, JSON.stringify(sub));
    this.logTransaction('Subscription Activated', 0, `${planName} plan (Banner ads removed)`);
    return sub;
  }

  hasClaimedBYOKBonus() {
    return localStorage.getItem(STORAGE_BYOK_BONUS) === 'true';
  }

  claimBYOKBonus() {
    if (this.hasClaimedBYOKBonus()) return 0;
    const current = this.getWalletCredits();
    this.setWalletCredits(current + 500);
    localStorage.setItem(STORAGE_BYOK_BONUS, 'true');
    this.logTransaction('BYOK Bonus', 500, 'Connected personal Gemini API key');
    return 500;
  }

  addCredits(amount, reason = 'Credit Purchase') {
    const current = this.getWalletCredits();
    const updated = this.setWalletCredits(current + amount);
    this.logTransaction(reason, amount, `Added ${amount} credits to balance`);
    return updated;
  }

  /**
   * Consume allowance for image analysis.
   * Priority:
   * 1. Daily Free Quota (3/day)
   * 2. Wallet Credits (1 credit = 1 analysis)
   * Throws Error if insufficient balance.
   */
  consumeAnalysisAllowance() {
    const dailyRem = this.getDailyRemaining();
    const today = this.getTodayDateString();

    if (dailyRem > 0) {
      // Consume daily free
      const updatedQuota = { date: today, remaining: dailyRem - 1, max: 3 };
      localStorage.setItem(STORAGE_DAILY, JSON.stringify(updatedQuota));
      this.logTransaction('Image Analysis', 0, 'Used Daily Free Quota (1 credit saved)');
      return { type: 'daily_free', remainingDaily: dailyRem - 1, walletRemaining: this.getWalletCredits() };
    }

    const wallet = this.getWalletCredits();
    if (wallet > 0) {
      // Consume 1 wallet credit
      const updatedWallet = this.setWalletCredits(wallet - 1);
      this.logTransaction('Image Analysis', -1, 'Consumed 1 wallet credit');
      return { type: 'wallet_credit', remainingDaily: 0, walletRemaining: updatedWallet };
    }

    throw new Error('QUOTA_EXHAUSTED');
  }

  rewardAdWatch(credits = 1) {
    return this.addCredits(credits, 'Rewarded Ad View');
  }

  logTransaction(title, amount, note = '') {
    try {
      const raw = localStorage.getItem(STORAGE_LOGS);
      const logs = raw ? JSON.parse(raw) : [];
      logs.unshift({
        id: 'tx_' + Date.now(),
        title,
        amount,
        note,
        timestamp: Date.now(),
      });
      // Keep last 40 logs
      localStorage.setItem(STORAGE_LOGS, JSON.stringify(logs.slice(0, 40)));
    } catch (e) {
      console.warn('Logging transaction failed:', e);
    }
  }

  getTransactionLogs() {
    try {
      const raw = localStorage.getItem(STORAGE_LOGS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  getWalletStatus() {
    return {
      dailyRemaining: this.getDailyRemaining(),
      walletCredits: this.getWalletCredits(),
      isSubscribed: this.isSubscribed(),
      subscription: this.getSubscriptionInfo(),
      byokBonusClaimed: this.hasClaimedBYOKBonus(),
      totalAvailable: this.getDailyRemaining() + this.getWalletCredits(),
    };
  }

  getAccountStatus() {
    return this.getWalletStatus();
  }

  hasQuotaOrCredits() {
    return (this.getDailyRemaining() + this.getWalletCredits()) > 0;
  }

  consumeCredit(description = 'Visual Analysis') {
    return this.consumeAnalysisAllowance();
  }

  grantBYOKBonus(key) {
    return this.claimBYOKBonus();
  }
}

export const creditService = new CreditService();
