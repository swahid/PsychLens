import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Languages,
  Download,
  Lock,
  Globe,
  ArrowLeft,
  Flame,
  Brain,
  Palette,
  Eye,
  CheckCircle2,
  RefreshCw,
  HelpCircle,
  Share2,
  ShieldAlert,
  Compass,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { speechService } from '../services/speechService';
import { askPsychologicalDeepDive, translateAnalysis } from '../services/geminiService';
import { generateAndDownloadCard } from '../services/cardGenerator';
import { adminService } from '../services/adminService';
import { geoLanguageService, SUPPORTED_LANGUAGES } from '../services/geoLanguageService';

export default function AnalysisView({
  imageObject,
  analysis,
  onReset,
  onSaveToVault,
  onShareToFeed,
  isSavedToVault,
  isSharedToFeed,
}) {
  const initialDetected = geoLanguageService.getDetectedLanguage();
  const detectedCountry = geoLanguageService.getDetectedCountry();

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(initialDetected.shortName);
  const [selectedLangCode, setSelectedLangCode] = useState(initialDetected.code);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState(null);

  // Deep dive interactive inquiries
  const [activeDeepDiveQuestion, setActiveDeepDiveQuestion] = useState(null);
  const [deepDiveAnswer, setDeepDiveAnswer] = useState(null);
  const [isDeepDiveLoading, setIsDeepDiveLoading] = useState(false);
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);

  const fullNarrationText = `${analysis.mood?.primary || ''}. Atmosphere: ${analysis.mood?.atmosphere || ''}. Psychological subtext: ${analysis.psychologicalSubtext || ''} Artistic and color psychology: ${analysis.artisticPsychology || ''} Reflection question: ${analysis.reflectionPrompt || ''}`;

  // Automatically translate if detected country natural language is not English
  useEffect(() => {
    if (initialDetected.shortName !== 'English') {
      performAutoTranslation(initialDetected.shortName);
    }
  }, []);

  const performAutoTranslation = async (langName) => {
    setIsTranslating(true);
    try {
      const translated = await translateAnalysis(fullNarrationText, langName);
      setTranslatedText(translated);
    } catch (err) {
      console.warn('Auto translation fallback:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  // Stop speech on unmount
  useEffect(() => {
    return () => {
      speechService.stop();
    };
  }, []);

  const toggleSpeech = () => {
    if (isPlayingAudio) {
      speechService.stop();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      const textToSpeak = translatedText || fullNarrationText;
      speechService.speak(textToSpeak, {
        lang: selectedLangCode,
        rate: 0.92,
        pitch: 1.0,
        onEnd: () => setIsPlayingAudio(false),
        onError: () => setIsPlayingAudio(false),
      });
    }
  };

  const handleLanguageChange = async (e) => {
    const langShortName = e.target.value;
    const targetObj = SUPPORTED_LANGUAGES.find((l) => l.shortName === langShortName) || SUPPORTED_LANGUAGES[0];
    setSelectedLanguage(targetObj.shortName);
    setSelectedLangCode(targetObj.code);
    geoLanguageService.setPreferredLanguage(targetObj.shortName);

    if (targetObj.shortName === 'English') {
      setTranslatedText(null);
      return;
    }
    setIsTranslating(true);
    try {
      const translated = await translateAnalysis(fullNarrationText, targetObj.shortName);
      setTranslatedText(translated);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleDeepDiveClick = async (question) => {
    setActiveDeepDiveQuestion(question);
    setIsDeepDiveLoading(true);
    try {
      const answer = await askPsychologicalDeepDive(imageObject.base64, analysis, question);
      setDeepDiveAnswer(answer);
    } catch (err) {
      setDeepDiveAnswer('Unable to generate deep dive: ' + err.message);
    } finally {
      setIsDeepDiveLoading(false);
    }
  };

  const handleDownloadCard = async () => {
    setIsGeneratingCard(true);
    try {
      await generateAndDownloadCard(imageObject.dataUrl, analysis);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch (err) {
      alert('Card generation failed: ' + err.message);
    } finally {
      setIsGeneratingCard(false);
    }
  };

  const tensionPercent = Math.min(100, Math.max(10, (analysis.mood?.tensionScore || 5) * 10));

  return (
    <div className="analysis-container">
      {/* Top action bar */}
      <div className="analysis-nav">
        <button className="btn-secondary" onClick={onReset}>
          <ArrowLeft size={16} />
          <span>Analyze Another</span>
        </button>

        <div className="right-tools">
          {/* TTS Audio Narration Toggle */}
          <button
            id="btn-voice-narration"
            className={`btn-secondary ${isPlayingAudio ? 'active-audio' : ''}`}
            onClick={toggleSpeech}
            title="Listen to psychological reading"
          >
            {isPlayingAudio ? <VolumeX size={16} /> : <Volume2 size={16} />}
            <span>{isPlayingAudio ? 'Mute Voice' : 'Voice Play'}</span>
            {isPlayingAudio && <span className="sound-wave" />}
          </button>

          {/* Multilingual Selector with Country Flag & Auto-Detection */}
          <div className="language-selector-wrap" title={`Detected country: ${detectedCountry}`}>
            <Languages size={15} className="lang-icon" />
            <select
              value={selectedLanguage}
              onChange={handleLanguageChange}
              disabled={isTranslating}
              className="lang-select"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.shortName}>
                  {l.flag} {l.name}
                </option>
              ))}
            </select>
            {isTranslating && <span className="mini-spinner" />}
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="analysis-layout">
        {/* Left Column: Image Card & Storage Stats */}
        <div className="left-column">
          <div className="image-card glass-panel">
            <img src={imageObject.dataUrl} alt="Analyzed subject" className="analyzed-preview" />
            <div className="image-meta-bar">
              <span className="badge badge-cyan">WebP Optimized</span>
              <span className="meta-stat">{imageObject.sizeKb} KB</span>
              <span className="meta-stat">Zero-Server Leak</span>
            </div>
          </div>

          {/* Action Hub */}
          <div className="actions-card glass-card">
            <h4 className="actions-title font-display">Preserve & Share</h4>

            <button
              id="btn-download-card"
              className="btn-primary full-width"
              onClick={handleDownloadCard}
              disabled={isGeneratingCard}
            >
              <Download size={16} />
              <span>{isGeneratingCard ? 'Rendering Card...' : 'Download Infographic Card'}</span>
            </button>

            <div className="action-row">
              <button
                id="btn-save-vault"
                className={`btn-secondary flex-1 ${isSavedToVault ? 'btn-saved' : ''}`}
                onClick={onSaveToVault}
                disabled={isSavedToVault}
              >
                {isSavedToVault ? <CheckCircle2 size={16} color="#059669" /> : <Lock size={16} />}
                <span>{isSavedToVault ? 'Vault Secured' : 'Save Private'}</span>
              </button>

              <button
                id="btn-post-community"
                className={`btn-secondary flex-1 ${isSharedToFeed ? 'btn-saved' : ''}`}
                onClick={onShareToFeed}
                disabled={isSharedToFeed}
              >
                {isSharedToFeed ? <CheckCircle2 size={16} color="#0284c7" /> : <Globe size={16} />}
                <span>{isSharedToFeed ? 'Posted (7d)' : 'Post to Feed'}</span>
              </button>
            </div>
            <p className="privacy-note">
              🔒 Private saves stored locally in IndexedDB & paid users auto-sync to Google Photos. Public posts auto-deleted in 7 days or less.
            </p>

            <button
              onClick={() => {
                const reason = prompt('Please describe why you are reporting this content (PG-13 / Safety policy):');
                if (reason) {
                  adminService.reportPublicItem(analysis?.id || 'post_' + Date.now(), reason, 'Community User');
                  alert('Thank you. Your report has been submitted to the moderation team.');
                }
              }}
              style={{
                fontSize: '0.74rem',
                color: '#94a3b8',
                background: 'none',
                border: 'none',
                textAlign: 'center',
                textDecoration: 'underline',
                cursor: 'pointer',
                marginTop: '4px'
              }}
            >
              Report / Flag Content
            </button>
          </div>
        </div>

        {/* Right Column: Deep Psychological Interpretations */}
        <div className="right-column">
          {/* Notice banner if simulated or notice attached */}
          {analysis._notice && (
            <div className="notice-banner">
              <span>{analysis._notice}</span>
            </div>
          )}

          {/* Translation Preview (if active) */}
          {translatedText && (
            <div className="translated-box glass-card">
              <div className="translated-header">
                <Languages size={16} color="#67e8f9" />
                <span className="font-display">Translation ({selectedLanguage})</span>
              </div>
              <p className="translated-text">{translatedText}</p>
            </div>
          )}

          {/* Mood & Atmosphere Card */}
          <div className="glass-card section-card">
            <div className="section-header">
              <div className="section-icon-badge badge-purple-glow">
                <Sparkles size={20} color="#c4b5fd" />
              </div>
              <div>
                <span className="section-eyebrow">DOMINANT EMOTIONAL CORE</span>
                <h3 className="section-title font-display gradient-text">
                  {analysis.mood?.primary || 'Introspective Contemplation'}
                </h3>
              </div>
            </div>

            <p className="overview-text">{analysis.overview}</p>

            <div className="mood-meters-grid">
              <div className="meter-card">
                <div className="meter-label-row">
                  <span className="meter-label">
                    <Flame size={14} color="#f43f5e" /> Psychological Tension
                  </span>
                  <span className="meter-val">{analysis.mood?.tensionScore || 5}/10</span>
                </div>
                <div className="meter-track">
                  <div
                    className="meter-fill"
                    style={{
                      width: `${tensionPercent}%`,
                      background:
                        tensionPercent > 70
                          ? 'var(--accent-rose)'
                          : tensionPercent > 40
                            ? 'var(--accent-purple)'
                            : 'var(--accent-cyan)',
                    }}
                  />
                </div>
              </div>

              <div className="meter-card">
                <div className="meter-label-row">
                  <span className="meter-label">Atmosphere</span>
                  <span className="badge badge-pink">{analysis.mood?.atmosphere || 'Reflective'}</span>
                </div>
                <div className="meter-label-row mt-2">
                  <span className="meter-label">Energy Level</span>
                  <span className="badge badge-cyan">{analysis.mood?.energyLevel || 'Moderate'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Body Language & Micro-Expressions Card */}
          <div className="glass-card section-card">
            <div className="section-header">
              <div className="section-icon-badge badge-indigo-glow">
                <Brain size={20} color="#818cf8" />
              </div>
              <div>
                <span className="section-eyebrow">BEHAVIORAL DYNAMICS</span>
                <h3 className="section-title font-display">Body Language & Subconscious Cues</h3>
              </div>
            </div>
            <p className="subtext-content">{analysis.psychologicalSubtext}</p>
          </div>

          {/* Artistic & Color Psychology Card */}
          <div className="glass-card section-card">
            <div className="section-header">
              <div className="section-icon-badge badge-cyan-glow">
                <Palette size={20} color="#67e8f9" />
              </div>
              <div>
                <span className="section-eyebrow">CHROMATIC & SPATIAL VIBE</span>
                <h3 className="section-title font-display">Color & Composition Psychology</h3>
              </div>
            </div>
            <p className="subtext-content">{analysis.artisticPsychology}</p>
          </div>

          {/* Reflection Prompt */}
          {analysis.reflectionPrompt && (
            <div className="reflection-card glass-card">
              <span className="reflection-label font-display">Introspective Query</span>
              <p className="reflection-quote">"{analysis.reflectionPrompt}"</p>
            </div>
          )}

          {/* Interactive Deep-Dive Exploration Chips */}
          <div className="deep-dive-card glass-card">
            <div className="deep-dive-header">
              <Eye size={18} color="#ec4899" />
              <h4 className="font-display">Explore Psychological Nuances:</h4>
            </div>
            <div className="chips-cloud">
              {(analysis.deepDiveChips || []).map((chip, idx) => (
                <button
                  key={idx}
                  className={`chip-btn ${activeDeepDiveQuestion === chip ? 'active' : ''}`}
                  onClick={() => handleDeepDiveClick(chip)}
                  disabled={isDeepDiveLoading}
                >
                  <Sparkles size={13} />
                  <span>{chip}</span>
                </button>
              ))}
            </div>

            {/* Inline Deep Dive Answer */}
            {isDeepDiveLoading && (
              <div className="deep-dive-loading shimmer-loading">
                <RefreshCw size={16} className="spin-icon" />
                <span>Decoding psychological layer...</span>
              </div>
            )}

            {deepDiveAnswer && !isDeepDiveLoading && (
              <div className="deep-dive-response">
                <div className="response-title font-display">
                  <span>Insight: {activeDeepDiveQuestion}</span>
                </div>
                <p className="response-body">{deepDiveAnswer}</p>
              </div>
            )}
          </div>

          {/* Standard Behavioral Insight & Non-Harm Safe Harbor Disclaimer */}
          <div className="disclaimer-safe-harbor-card">
            <div className="disclaimer-header">
              <ShieldAlert size={18} color="#b45309" />
              <span className="disclaimer-title font-display">Behavioral Insight & Non-Harm Safe Harbor Disclaimer</span>
            </div>
            <p className="disclaimer-text">
              This interpretation is generated by artificial intelligence solely for educational exploration, artistic visual nuance, and understanding human behavioural patterns.
              <strong> AI models may make perceptual mistakes</strong> or misread visual context.
              This analysis is <strong>strictly non-diagnostic</strong> and does not constitute medical, psychiatric, forensic, security, or legal advice.
              It is <strong>strictly prohibited to use this output to judge, evaluate security/threat risks, or cause harm, distress, harassment, or defamation</strong> to any individual.
              Neither PsychLens nor <a href="https://techfiyr.com" target="_blank" rel="noopener noreferrer" style={{ color: '#92400e', fontWeight: 700, textDecoration: 'underline' }}>TechFiyr</a> assumes any liability for actions or conclusions drawn from this interpretive tool.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .analysis-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .analysis-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .right-tools {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .active-audio {
          background: #0f172a !important;
          color: #ffffff !important;
          border-color: #0f172a !important;
        }
        .sound-wave {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          animation: pulseGlow 1.2s infinite;
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.3); }
        }
        .language-selector-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          padding: 6px 12px;
          border-radius: var(--radius-full);
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
        }
        .lang-icon {
          color: #64748b;
        }
        .lang-select {
          background: transparent;
          border: none;
          color: #0f172a;
          font-size: 0.88rem;
          font-weight: 500;
          outline: none;
          cursor: pointer;
        }
        .lang-select option {
          background: #ffffff;
          color: #0f172a;
        }
        .analysis-layout {
          display: grid;
          grid-template-columns: 380px 1fr;
          gap: 28px;
          align-items: start;
        }
        .left-column {
          position: sticky;
          top: 85px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .image-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-card);
          overflow: hidden;
          padding: 8px;
        }
        .analyzed-preview {
          width: 100%;
          height: 280px;
          object-fit: cover;
          border-radius: var(--radius-md);
        }
        .image-meta-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 6px 4px 6px;
          font-size: 0.78rem;
          color: #64748b;
        }
        .actions-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-card);
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .actions-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: #0f172a;
        }
        .full-width {
          width: 100%;
        }
        .action-row {
          display: flex;
          gap: 10px;
        }
        .flex-1 {
          flex: 1;
        }
        .btn-saved {
          border-color: #a7f3d0 !important;
          background: #ecfdf5 !important;
          color: #065f46 !important;
        }
        .privacy-note {
          font-size: 0.74rem;
          color: #64748b;
          line-height: 1.4;
          text-align: center;
        }
        .right-column {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .section-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-card);
          padding: 24px;
        }
        .section-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 14px;
        }
        .section-icon-badge {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .badge-purple-glow {
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          color: #0f172a;
        }
        .badge-indigo-glow {
          background: #eef2ff;
          border: 1px solid #e0e7ff;
          color: #4338ca;
        }
        .badge-cyan-glow {
          background: #f0fdf4;
          border: 1px solid #dcfce7;
          color: #15803d;
        }
        .section-eyebrow {
          font-size: 0.72rem;
          font-weight: 700;
          color: #64748b;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .section-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f172a;
        }
        .overview-text {
          font-size: 0.96rem;
          color: #334155;
          line-height: 1.6;
          margin-bottom: 18px;
        }
        .subtext-content {
          font-size: 0.94rem;
          color: #334155;
          line-height: 1.65;
        }
        .mood-meters-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        .meter-card {
          background: #f8fafc;
          padding: 12px 14px;
          border-radius: var(--radius-md);
          border: 1px solid #e2e8f0;
        }
        .meter-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.82rem;
          color: #475569;
        }
        .mt-2 {
          margin-top: 8px;
        }
        .meter-label {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .meter-val {
          font-weight: 700;
          color: #0f172a;
        }
        .meter-track {
          width: 100%;
          height: 6px;
          background: #e2e8f0;
          border-radius: 4px;
          margin-top: 8px;
          overflow: hidden;
        }
        .meter-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.6s ease;
        }
        .reflection-card {
          padding: 18px 24px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: var(--radius-lg);
        }
        .reflection-label {
          font-size: 0.74rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #166534;
          letter-spacing: 0.06em;
        }
        .reflection-quote {
          font-size: 1.05rem;
          font-style: italic;
          color: #14532d;
          margin-top: 4px;
        }
        .deep-dive-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-card);
          padding: 20px 24px;
        }
        .deep-dive-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.94rem;
          margin-bottom: 12px;
          color: #0f172a;
          font-weight: 700;
        }
        .chips-cloud {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .chip-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: var(--radius-full);
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          font-size: 0.82rem;
          font-weight: 500;
          color: #334155;
          transition: var(--transition);
        }
        .chip-btn:hover {
          color: #0f172a;
          background: #e2e8f0;
          transform: translateY(-1px);
        }
        .chip-btn.active {
          background: #0f172a;
          border-color: #0f172a;
          color: #ffffff;
        }
        .deep-dive-loading {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px;
          margin-top: 14px;
          color: #64748b;
          font-size: 0.86rem;
        }
        .spin-icon {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
        .deep-dive-response {
          margin-top: 16px;
          padding: 16px;
          background: #f8fafc;
          border-radius: var(--radius-md);
          border-left: 3px solid #0f172a;
        }
        .response-title {
          font-size: 0.88rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 6px;
        }
        .response-body {
          font-size: 0.9rem;
          color: #334155;
          line-height: 1.55;
        }
        .notice-banner {
          background: #fffbeb;
          border: 1px solid #fde68a;
          color: #92400e;
          padding: 10px 14px;
          border-radius: var(--radius-md);
          font-size: 0.84rem;
        }
        .translated-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: var(--radius-md);
          padding: 16px;
          border-left: 3px solid #0284c7;
        }
        .translated-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.86rem;
          font-weight: 700;
          color: #0369a1;
          margin-bottom: 6px;
        }
        .translated-text {
          font-size: 0.9rem;
          color: #1e293b;
          line-height: 1.55;
          white-space: pre-wrap;
        }
        .disclaimer-safe-harbor-card {
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-radius: var(--radius-md);
          padding: 16px 18px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-top: 8px;
        }
        .disclaimer-header {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .disclaimer-title {
          font-size: 0.88rem;
          font-weight: 700;
          color: #92400e;
        }
        .disclaimer-text {
          font-size: 0.80rem;
          color: #78350f;
          line-height: 1.55;
          margin: 0;
        }
        .mini-spinner {
          width: 12px;
          height: 12px;
          border: 2px solid #cbd5e1;
          border-top-color: #0f172a;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 900px) {
          .analysis-layout {
            grid-template-columns: 1fr;
          }
          .left-column {
            position: static;
          }
          .mood-meters-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
