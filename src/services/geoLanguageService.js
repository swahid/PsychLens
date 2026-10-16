/**
 * GeoLanguageService: Country-Based Natural Language Detection & Locale Engine
 * Automatically detects the user's country and default natural language based on
 * browser timezone, navigator locales, and asynchronous geo-intelligence.
 */

export const SUPPORTED_LANGUAGES = [
  { code: 'en-US', name: 'English', shortName: 'English', flag: '🇺🇸' },
  { code: 'bn-BD', name: 'Bengali (বাংলা)', shortName: 'Bengali', flag: '🇧🇩' },
  { code: 'hi-IN', name: 'Hindi (हिन्दी)', shortName: 'Hindi', flag: '🇮🇳' },
  { code: 'es-ES', name: 'Spanish (Español)', shortName: 'Spanish', flag: '🇪🇸' },
  { code: 'fr-FR', name: 'French (Français)', shortName: 'French', flag: '🇫🇷' },
  { code: 'de-DE', name: 'German (Deutsch)', shortName: 'German', flag: '🇩🇪' },
  { code: 'ja-JP', name: 'Japanese (日本語)', shortName: 'Japanese', flag: '🇯🇵' },
  { code: 'ar-SA', name: 'Arabic (العربية)', shortName: 'Arabic', flag: '🇸🇦' },
  { code: 'pt-BR', name: 'Portuguese (Português)', shortName: 'Portuguese', flag: '🇧🇷' },
  { code: 'it-IT', name: 'Italian (Italiano)', shortName: 'Italian', flag: '🇮🇹' },
  { code: 'ko-KR', name: 'Korean (한국어)', shortName: 'Korean', flag: '🇰🇷' },
  { code: 'zh-CN', name: 'Chinese (中文)', shortName: 'Chinese', flag: '🇨🇳' },
  { code: 'tr-TR', name: 'Turkish (Türkçe)', shortName: 'Turkish', flag: '🇹🇷' },
  { code: 'ru-RU', name: 'Russian (Русский)', shortName: 'Russian', flag: '🇷🇺' },
  { code: 'nl-NL', name: 'Dutch (Nederlands)', shortName: 'Dutch', flag: '🇳🇱' },
];

const TIMEZONE_TO_COUNTRY_LANG = {
  // South Asia
  'Asia/Dhaka': { country: 'Bangladesh', langCode: 'bn-BD' },
  'Asia/Kolkata': { country: 'India', langCode: 'hi-IN' },
  'Asia/Calcutta': { country: 'India', langCode: 'hi-IN' },
  'Asia/Colombo': { country: 'Sri Lanka', langCode: 'en-US' },
  'Asia/Karachi': { country: 'Pakistan', langCode: 'en-US' },

  // East Asia
  'Asia/Tokyo': { country: 'Japan', langCode: 'ja-JP' },
  'Asia/Seoul': { country: 'South Korea', langCode: 'ko-KR' },
  'Asia/Shanghai': { country: 'China', langCode: 'zh-CN' },
  'Asia/Hong_Kong': { country: 'Hong Kong', langCode: 'zh-CN' },
  'Asia/Taipei': { country: 'Taiwan', langCode: 'zh-CN' },

  // Middle East
  'Asia/Riyadh': { country: 'Saudi Arabia', langCode: 'ar-SA' },
  'Asia/Dubai': { country: 'UAE', langCode: 'ar-SA' },
  'Africa/Cairo': { country: 'Egypt', langCode: 'ar-SA' },
  'Asia/Kuwait': { country: 'Kuwait', langCode: 'ar-SA' },
  'Asia/Qatar': { country: 'Qatar', langCode: 'ar-SA' },
  'Europe/Istanbul': { country: 'Turkey', langCode: 'tr-TR' },

  // Europe
  'Europe/Madrid': { country: 'Spain', langCode: 'es-ES' },
  'Europe/Paris': { country: 'France', langCode: 'fr-FR' },
  'Europe/Berlin': { country: 'Germany', langCode: 'de-DE' },
  'Europe/Rome': { country: 'Italy', langCode: 'it-IT' },
  'Europe/Lisbon': { country: 'Portugal', langCode: 'pt-BR' },
  'Europe/Amsterdam': { country: 'Netherlands', langCode: 'nl-NL' },
  'Europe/Moscow': { country: 'Russia', langCode: 'ru-RU' },
  'Europe/London': { country: 'United Kingdom', langCode: 'en-US' },

  // Americas
  'America/New_York': { country: 'United States', langCode: 'en-US' },
  'America/Los_Angeles': { country: 'United States', langCode: 'en-US' },
  'America/Chicago': { country: 'United States', langCode: 'en-US' },
  'America/Denver': { country: 'United States', langCode: 'en-US' },
  'America/Toronto': { country: 'Canada', langCode: 'en-US' },
  'America/Sao_Paulo': { country: 'Brazil', langCode: 'pt-BR' },
  'America/Mexico_City': { country: 'Mexico', langCode: 'es-ES' },
  'America/Bogota': { country: 'Colombia', langCode: 'es-ES' },
  'America/Buenos_Aires': { country: 'Argentina', langCode: 'es-ES' },
  'America/Santiago': { country: 'Chile', langCode: 'es-ES' },
};

class GeoLanguageService {
  constructor() {
    this.detectedInfo = this.detectFromBrowser();
    this.tryAsyncGeo();
  }

  detectFromBrowser() {
    // 1. Check user override in localStorage
    const saved = localStorage.getItem('psychlens_preferred_lang');
    if (saved) {
      const match = SUPPORTED_LANGUAGES.find((l) => l.shortName === saved || l.code === saved);
      if (match) {
        return {
          country: localStorage.getItem('psychlens_user_country') || 'User Preference',
          language: match,
          isUserSelected: true,
        };
      }
    }

    // 2. Detect from Timezone
    let tz = '';
    try {
      tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    } catch (e) {
      tz = '';
    }

    if (tz && TIMEZONE_TO_COUNTRY_LANG[tz]) {
      const mapping = TIMEZONE_TO_COUNTRY_LANG[tz];
      const lang = SUPPORTED_LANGUAGES.find((l) => l.code === mapping.langCode) || SUPPORTED_LANGUAGES[0];
      return {
        country: mapping.country,
        language: lang,
        isUserSelected: false,
      };
    }

    // 3. Fallback to navigator.language (e.g. "es-MX", "bn-BD", "fr-FR")
    const navLang = typeof navigator !== 'undefined' ? (navigator.language || navigator.userLanguage || '') : '';
    const prefix = navLang.split('-')[0].toLowerCase();

    const matchedLang = SUPPORTED_LANGUAGES.find((l) => l.code.toLowerCase().startsWith(prefix));
    if (matchedLang) {
      return {
        country: 'Detected from Browser',
        language: matchedLang,
        isUserSelected: false,
      };
    }

    // Default to English
    return {
      country: 'Global',
      language: SUPPORTED_LANGUAGES[0],
      isUserSelected: false,
    };
  }

  async tryAsyncGeo() {
    // Only attempt if not already explicitly overridden by user
    if (this.detectedInfo.isUserSelected) return;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);

      // Lightweight non-blocking IP detection
      const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) return;

      const data = await res.json();
      const countryCode = data.country_code; // e.g. "BD", "IN", "ES", "FR"
      const countryName = data.country_name;

      if (countryCode) {
        const countryLangMap = {
          BD: 'bn-BD',
          IN: 'hi-IN',
          ES: 'es-ES',
          MX: 'es-ES',
          AR: 'es-ES',
          CO: 'es-ES',
          CL: 'es-ES',
          PE: 'es-ES',
          FR: 'fr-FR',
          DE: 'de-DE',
          AT: 'de-DE',
          CH: 'de-DE',
          IT: 'it-IT',
          BR: 'pt-BR',
          PT: 'pt-BR',
          JP: 'ja-JP',
          KR: 'ko-KR',
          CN: 'zh-CN',
          SA: 'ar-SA',
          AE: 'ar-SA',
          EG: 'ar-SA',
          TR: 'tr-TR',
          RU: 'ru-RU',
          NL: 'nl-NL',
        };

        const targetCode = countryLangMap[countryCode];
        if (targetCode) {
          const matched = SUPPORTED_LANGUAGES.find((l) => l.code === targetCode);
          if (matched) {
            this.detectedInfo = {
              country: countryName || this.detectedInfo.country,
              language: matched,
              isUserSelected: false,
            };
          }
        }
      }
    } catch (e) {
      // Gracefully silent on offline or adblock
    }
  }

  getDetectedLanguage() {
    // If user has explicitly saved a preference, honor it; otherwise default strictly to English
    if (this.detectedInfo && this.detectedInfo.isUserSelected) {
      return this.detectedInfo.language;
    }
    return SUPPORTED_LANGUAGES[0];
  }

  getDetectedCountry() {
    return this.detectedInfo.country;
  }

  setPreferredLanguage(shortName) {
    const lang = SUPPORTED_LANGUAGES.find((l) => l.shortName === shortName || l.code === shortName);
    if (lang) {
      this.detectedInfo = {
        country: this.detectedInfo.country,
        language: lang,
        isUserSelected: true,
      };
      localStorage.setItem('psychlens_preferred_lang', lang.shortName);
    }
  }
}

export const geoLanguageService = new GeoLanguageService();
