/**
 * Natural, Human-Centric Speech Synthesis Service
 * Tuned specifically for organic emotional warmth, contemplative pauses,
 * and high-fidelity neural/natural voice selection (avoids rigid robot tone).
 */

class SpeechService {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.currentUtterance = null;
    this.voices = [];
    this.initVoices();
  }

  initVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => {
        this.voices = this.synth.getVoices();
      };
    }
  }

  getVoices() {
    if (this.voices.length === 0 && this.synth) {
      this.voices = this.synth.getVoices();
    }
    return this.voices;
  }

  /**
   * Find the most natural, authentic FEMALE SOFT voice for the target language.
   * Prioritizes native language female neural/natural/soft voices.
   */
  findBestFemaleSoftVoice(langCode = 'en-US') {
    const allVoices = this.getVoices();
    if (!allVoices || allVoices.length === 0) return null;

    const basePrefix = langCode.split(/[-_]/)[0].toLowerCase();

    // 1. Candidate voices for the selected language
    const langCandidates = allVoices.filter((v) => {
      const vLang = (v.lang || '').toLowerCase().replace('_', '-');
      return vLang.startsWith(basePrefix);
    });

    const FEMALE_IDENTIFIERS = [
      'female', 'woman', 'girl', 'soft', 'natural female', 'neural female',
      // Bengali
      'piya', 'tanishaa', 'rupali', 'mitu', 'shobhana', 'google বাংলা', 'bangla', 'bengali',
      // Hindi
      'lekha', 'swara', 'kalpana', 'aditi', 'ananya', 'neha', 'shreya', 'kavya', 'heera', 'google हिन्दी', 'hindi',
      // English
      'samantha', 'victoria', 'karen', 'moira', 'fiona', 'tessa', 'zira', 'jenny', 'aria',
      'hazel', 'susan', 'allison', 'ava', 'serena', 'kathy', 'veena', 'sangeeta', 'google uk english female', 'google us english',
      // Spanish & Romance
      'monica', 'paulina', 'paloma', 'helena', 'laura', 'elena', 'sofia', 'lucia', 'google español',
      // French
      'amelie', 'charlotte', 'celine', 'virginie', 'marie', 'hortense', 'audrey', 'google français',
      // German
      'anna', 'katja', 'marlene', 'hedda', 'petra', 'google deutsch',
      // Japanese
      'kyoko', 'nanami', 'ayumi', 'haruka', 'google 日本語',
      // Chinese
      'ting-ting', 'ya-ling', 'mei-jia', 'xiaoxiao', 'xiaoyi', 'google 中文',
      // Arabic
      'laila', 'salma', 'zeina', 'google العربية'
    ];

    const MALE_IDENTIFIERS = [
      'male', 'man', 'boy', 'guy', 'daniel', 'david', 'alex', 'fred', 'george', 'albert',
      'mark', 'paul', 'tom', 'ralph', 'bruce', 'madhav', 'hemant', 'pradeep', 'bashkar',
      'eddy', 'grandpa', 'jester', 'junior', 'bad news', 'bahh', 'bells', 'boing', 'bubbles',
      'cellos', 'wobble', 'organ', 'superstar'
    ];

    const scoreVoice = (voice, isTargetLang) => {
      const name = (voice.name || '').toLowerCase();
      let score = isTargetLang ? 100 : 0;

      // Penalize known male voices heavily
      if (MALE_IDENTIFIERS.some((m) => name.includes(m))) {
        score -= 90;
      }

      // Bonus for recognized female voices
      if (FEMALE_IDENTIFIERS.some((f) => name.includes(f))) {
        score += 60;
      }

      // Bonus for high-quality natural/neural/Google/Microsoft/Apple engines
      if (/natural|neural|premium|enhanced|google|microsoft|siri/i.test(name)) {
        score += 35;
      }

      // Bonus if dialect matches exact country code (e.g. bn-BD or hi-IN)
      if ((voice.lang || '').toLowerCase().replace('_', '-') === langCode.toLowerCase().replace('_', '-')) {
        score += 20;
      }

      return score;
    };

    if (langCandidates.length > 0) {
      // Sort candidates by soft female score descending
      langCandidates.sort((a, b) => scoreVoice(b, true) - scoreVoice(a, true));
      return langCandidates[0];
    }

    // Fallback: If device lacks installed voices for this language,
    // find the best soft female voice on the system
    const allSorted = [...allVoices].sort((a, b) => scoreVoice(b, false) - scoreVoice(a, false));
    return allSorted[0] || allVoices[0];
  }

  /**
   * Speak text with serene, empathetic human warmth using native female soft voice.
   */
  speak(text, options = {}) {
    if (!this.synth) {
      console.warn('Speech synthesis not supported in this browser.');
      return;
    }

    // Cancel ongoing speech
    this.stop();

    if (!text || text.trim() === '') return;

    // Clean markdown, brackets, and code syntax so it sounds completely conversational
    const cleanSpokenText = text
      .replace(/[*_#`~[\]]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanSpokenText);
    
    // Soft female acoustic parameters:
    // Rate of 0.88 gives a thoughtful, unhurried, empathetic human delivery
    utterance.rate = options.rate || 0.88;
    // Pitch of 1.08 gives a warm, gentle feminine soft resonance
    utterance.pitch = options.pitch || 1.08;
    utterance.lang = options.lang || 'en-US';

    const softFemaleVoice = this.findBestFemaleSoftVoice(utterance.lang);
    if (softFemaleVoice) {
      utterance.voice = softFemaleVoice;
    }

    if (options.onStart) utterance.onstart = options.onStart;
    if (options.onEnd) utterance.onend = options.onEnd;
    if (options.onError) utterance.onerror = options.onError;

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  pause() {
    if (this.synth && this.synth.speaking) {
      this.synth.pause();
    }
  }

  resume() {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }
}

export const speechService = new SpeechService();
