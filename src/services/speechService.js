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
   * Find the most natural, human-sounding voice available on the device for the given language code.
   */
  findBestNaturalVoice(langCode = 'en-US') {
    const allVoices = this.getVoices();
    if (!allVoices || allVoices.length === 0) return null;

    const basePrefix = langCode.split('-')[0].toLowerCase();
    const candidateVoices = allVoices.filter((v) =>
      v.lang.toLowerCase().startsWith(basePrefix)
    );

    if (candidateVoices.length === 0) return null;

    // Prioritize premium, neural, and natural voices over robotic legacy synthesizers
    const naturalKeywords = ['natural', 'neural', 'premium', 'enhanced', 'google', 'siri', 'samantha', 'karen', 'daniel', 'moira'];
    for (const kw of naturalKeywords) {
      const best = candidateVoices.find((v) => v.name.toLowerCase().includes(kw));
      if (best) return best;
    }

    // Default to the first localized voice
    return candidateVoices[0];
  }

  /**
   * Speak text with human-like warmth, organic pacing, and natural cadence.
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
    
    // Natural human conversation settings:
    // Rate of 0.92 gives an observant, thoughtful, empathetic human delivery
    utterance.rate = options.rate || 0.92;
    // Pitch 1.0 (neutral, warm resonance)
    utterance.pitch = options.pitch || 1.0;
    utterance.lang = options.lang || 'en-US';

    const naturalVoice = this.findBestNaturalVoice(utterance.lang);
    if (naturalVoice) {
      utterance.voice = naturalVoice;
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
