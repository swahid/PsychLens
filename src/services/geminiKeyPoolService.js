/**
 * Gemini Multi-Key Pool & Rate-Limit Fallback Service
 * Prioritizes user BYOK key, then cascades across platform keys with automatic
 * HTTP 429 failover, cooldown tracking, and live quota telemetry for Admin.
 */

const BYOK_STORAGE_KEY = 'psychlens_byok_key';

class GeminiKeyPoolService {
  constructor() {
    this.keyPool = [];
    this.initPool();
  }

  initPool() {
    // 1. Gather keys from environment variables
    const rawPrimary = import.meta.env.apikey_gemini || import.meta.env.VITE_GEMINI_API_KEY || '';
    const rawBackup1 = import.meta.env.apikey_gemini_backup_1 || '';
    const rawBackup2 = import.meta.env.apikey_gemini_backup_2 || '';
    const rawPoolString = import.meta.env.apikey_gemini_pool || '';

    const keys = new Set();
    if (rawPrimary) keys.add(rawPrimary.trim());
    if (rawBackup1) keys.add(rawBackup1.trim());
    if (rawBackup2) keys.add(rawBackup2.trim());

    if (rawPoolString) {
      rawPoolString.split(',').forEach((k) => {
        if (k.trim()) keys.add(k.trim());
      });
    }

    this.keyPool = Array.from(keys).map((key, index) => ({
      id: `platform_key_${index + 1}`,
      key,
      masked: this.maskKey(key),
      isBYOK: false,
      status: 'active', // 'active' | 'cooldown'
      cooldownUntil: 0,
      totalRequests: 0,
      totalSuccess: 0,
      totalFailures: 0,
    }));
  }

  maskKey(key) {
    if (!key || key.length < 8) return '****';
    return `${key.slice(0, 4)}...${key.slice(-4)}`;
  }

  getBYOKKey() {
    return localStorage.getItem(BYOK_STORAGE_KEY) || '';
  }

  setBYOKKey(key) {
    if (key && key.trim()) {
      localStorage.setItem(BYOK_STORAGE_KEY, key.trim());
    } else {
      localStorage.removeItem(BYOK_STORAGE_KEY);
    }
  }

  hasBYOKKey() {
    return Boolean(this.getBYOKKey());
  }

  /**
   * Get best available healthy key. Priority:
   * 1. User BYOK key (if present)
   * 2. Platform key pool (highest priority non-cooling key)
   */
  getActiveKey() {
    // User BYOK has highest priority
    const byok = this.getBYOKKey();
    if (byok) {
      return {
        key: byok,
        id: 'user_byok',
        isBYOK: true,
      };
    }

    const now = Date.now();
    // Check for platform keys whose cooldown has expired
    this.keyPool.forEach((item) => {
      if (item.status === 'cooldown' && now >= item.cooldownUntil) {
        item.status = 'active';
        item.cooldownUntil = 0;
      }
    });

    // Find first active healthy key
    const healthy = this.keyPool.find((item) => item.status === 'active');
    if (healthy) {
      return healthy;
    }

    // If all are in cooldown, pick the one with earliest cooldown expiry
    const earliest = [...this.keyPool].sort((a, b) => a.cooldownUntil - b.cooldownUntil)[0];
    return earliest || null;
  }

  /**
   * Mark a key as rate-limited (HTTP 429 / Quota) and put in cooldown
   */
  reportRateLimit(keyString, cooldownSeconds = 60) {
    const item = this.keyPool.find((k) => k.key === keyString);
    if (item) {
      item.status = 'cooldown';
      item.cooldownUntil = Date.now() + cooldownSeconds * 1000;
      item.totalFailures += 1;
      console.warn(`[GeminiKeyPool] Key ${item.masked} rate-limited. Cooling down for ${cooldownSeconds}s.`);
    }
  }

  recordSuccess(keyString) {
    const item = this.keyPool.find((k) => k.key === keyString);
    if (item) {
      item.totalRequests += 1;
      item.totalSuccess += 1;
    }
  }

  getAllKeysStatus() {
    const now = Date.now();
    return this.keyPool.map((k) => ({
      ...k,
      secondsRemaining: k.status === 'cooldown' ? Math.max(0, Math.ceil((k.cooldownUntil - now) / 1000)) : 0,
    }));
  }
}

export const geminiKeyPool = new GeminiKeyPoolService();
