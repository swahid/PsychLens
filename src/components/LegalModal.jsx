import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldAlert,
  Lock,
  Globe,
  Trash2,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Scale,
  Eye,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { storageService } from '../services/storageService';

export default function LegalModal({ isOpen, initialTab = 'privacy', onClose }) {
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  const handleResetData = async () => {
    const confirmed = window.confirm(
      'GDPR Right to be Forgotten: This will permanently purge your local IndexedDB vault, clear cached images, and reset your session identifiers. Proceed?'
    );
    if (!confirmed) return;

    try {
      await storageService.clearPrivateVault();
      localStorage.clear();
      alert('All local vault data and tokens successfully purged.');
      window.location.reload();
    } catch (err) {
      alert('Error clearing vault: ' + err.message);
    }
  };

  const tabs = [
    { id: 'privacy', label: 'Privacy Policy', icon: Lock },
    { id: 'content', label: 'Content Policy', icon: AlertTriangle },
    { id: 'license', label: 'License & Attribution', icon: Scale },
    { id: 'content-use', label: 'Content Use Policy', icon: Eye },
    { id: 'safety-usage', label: 'Safety & Usage Policy', icon: ShieldCheck },
    { id: 'ai-disclaimer', label: 'AI Disclaimer & Guidelines', icon: ShieldAlert },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container legal-modal-box"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="legal-modal-header">
          <div>
            <div className="legal-badge-row">
              <span className="legal-badge">
                Official TechFiyr Governance
              </span>
              <span className="legal-license-pill">
                Licensed Product of <a href="https://techfiyr.com" target="_blank" rel="noopener noreferrer" style={{ color: '#0f172a', fontWeight: 700, textDecoration: 'underline' }}>TechFiyr</a>
              </span>
            </div>
            <h2 className="editorial-title" style={{ fontSize: '1.35rem', marginTop: '6px', color: '#0f172a' }}>
              Governance, Safety & Legal Policy Hub
            </h2>
          </div>
          <button
            onClick={onClose}
            className="btn-modal-close"
            title="Close"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="legal-tabs-bar" role="tablist">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                className={`legal-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <IconComponent size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Policy Body */}
        <div className="legal-content-body">
          {/* TAB 1: PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div className="policy-section">
              <div className="policy-intro-box">
                <Lock size={20} color="#0f172a" />
                <div>
                  <h3 className="policy-heading">Standard Privacy Policy & Data Protection</h3>
                  <p className="policy-subtext">Last Updated: October 2026 • Effective Worldwide</p>
                </div>
              </div>

              <div className="policy-card">
                <h4>1. Non-Biometric Processing Safe Harbor (GDPR Art. 9 & CCPA)</h4>
                <p>
                  PsychLens is engineered on a strict <strong>non-biometric foundation</strong>. We do NOT generate, extract,
                  reconstruct, scan, or store unique facial geometry, mathematical biometric templates, facial vectors, or
                  personally identifiable facial measurements. Visual analyses are transient, ephemeral semantic evaluations
                  of overall emotional posture, lighting composition, and artistic mood.
                </p>
              </div>

              <div className="policy-card">
                <h4>2. Client-Side Data Minimization & EXIF GPS Scrubbing</h4>
                <p>
                  Before any photo leaves your device, it is downsampled and re-encoded locally via HTML5 Canvas.
                  All private metadata—including GPS coordinates, device serial numbers, camera hardware identifiers, and
                  timestamp metadata—is permanently stripped on the client.
                </p>
              </div>

              <div className="policy-card">
                <h4>3. Ephemeral Multi-Node Storage (Auto-Purged within 7 Days)</h4>
                <p>
                  When free users opt to share an analysis to the community stream, images are stored on temporary public
                  nodes with strict Time-To-Live (TTL) auto-destruction policies set to <strong>7 days or less</strong>.
                  Images naturally self-delete from external nodes with zero persistent footprint.
                </p>
              </div>

              <div className="policy-card">
                <h4>4. Minimal Google Photos Scope (Append-Only)</h4>
                <p>
                  For paid subscribers who link Google Photos, PsychLens requests strictly the minimal
                  <code>https://www.googleapis.com/auth/photoslibrary.appendonly</code> authorization. This scope allows the
                  application to create and upload exclusively into your personal <em>"PsychLens Private Vault"</em> album.
                  PsychLens has zero access to view, read, modify, or delete any of your other existing Google Photos.
                </p>
              </div>

              {/* GDPR Right to be Forgotten Wipe Card */}
              <div className="gdpr-purge-card">
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
                    GDPR Article 17 "Right to be Forgotten" (Apple Guideline 5.1.1v)
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                    Instantly wipe all local IndexedDB vault photos, cached session tokens, and local keys in 1 tap.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetData}
                  className="btn-purge-action"
                >
                  <Trash2 size={14} /> Clear Vault & Reset
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: CONTENT POLICY */}
          {activeTab === 'content' && (
            <div className="policy-section">
              <div className="policy-intro-box">
                <AlertTriangle size={20} color="#b45309" />
                <div>
                  <h3 className="policy-heading">Content Policy (Strict PG-13 / PG-16 Rating)</h3>
                  <p className="policy-subtext">Community Safety Standards & Family-Safe Integrity</p>
                </div>
              </div>

              <div className="policy-card warning-accent">
                <h4>1. Strict PG-13 / PG-16 Rating & Zero-Tolerance Items</h4>
                <p>
                  PsychLens maintains a zero-tolerance policy for objectionable or harmful media. Under no circumstances may
                  users capture, upload, transmit, or share:
                </p>
                <ul className="policy-list">
                  <li><strong>Adult & Explicit Imagery:</strong> Nudity, pornography, sexually suggestive poses, or adult content of any kind.</li>
                  <li><strong>Violence & Blood:</strong> Graphic violence, bodily mutilation, physical abuse, or gore.</li>
                  <li><strong>Harassment & Hate Speech:</strong> Content depicting, inciting, or promoting discrimination, racism, hatred, or intimidation.</li>
                  <li><strong>Self-Harm:</strong> Media depicting, encouraging, or discussing self-injury or suicide.</li>
                  <li><strong>Non-Consensual Imagery:</strong> Unconsented candid photography infringing on personal privacy.</li>
                </ul>
              </div>

              <div className="policy-card">
                <h4>2. Automated Pre-Inference Content Screening Gate</h4>
                <p>
                  Every uploaded or captured photograph passes through automated safety classifiers prior to analysis.
                  If an image is flagged for explicit content or harassment, the analysis is blocked immediately.
                  <strong> No credits are deducted for blocked or rejected images.</strong>
                </p>
              </div>

              <div className="policy-card">
                <h4>3. Enforcement & Account Actions</h4>
                <p>
                  Repeat attempts to upload prohibited content will result in immediate permanent account suspension,
                  IP restriction, and forfeiture of all remaining credits without refund.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: LICENSE & ATTRIBUTION */}
          {activeTab === 'license' && (
            <div className="policy-section">
              <div className="policy-intro-box">
                <Scale size={20} color="#0f172a" />
                <div>
                  <h3 className="policy-heading">TechFiyr Research & Non-Commercial Source License</h3>
                  <p className="policy-subtext">Product Ownership & Intellectual Property Guidelines</p>
                </div>
              </div>

              <div className="policy-card">
                <h4>1. Product Ownership</h4>
                <p>
                  PsychLens (EmotiSight) is an official proprietary licensed product of{' '}
                  <a href="https://techfiyr.com" target="_blank" rel="noopener noreferrer" style={{ color: '#0f172a', fontWeight: 700, textDecoration: 'underline' }}>
                    TechFiyr (https://techfiyr.com)
                  </a>. All rights reserved.
                </p>
              </div>

              <div className="policy-card">
                <h4>2. Permitted Non-Commercial, Academic & Research Usage</h4>
                <p>
                  TechFiyr grants a non-exclusive license to study, research, review, and evaluate the software and accompanying
                  documentation strictly for:
                </p>
                <ul className="policy-list">
                  <li>Academic, university, and scientific psychological research;</li>
                  <li>Non-profit educational demonstration and classroom pedagogy;</li>
                  <li>Personal, non-monetized self-awareness and visual art appreciation.</li>
                </ul>
              </div>

              <div className="policy-card warning-accent">
                <h4>3. Strict Prohibition on Commercial Exploitation</h4>
                <p>
                  Commercial use of PsychLens, its algorithms, or derivative works is <strong>strictly prohibited</strong> without
                  a formal written commercial license agreement executed directly with TechFiyr. You may not sell, lease,
                  sub-license, host as a commercial SaaS, bundle into paid applications, or use PsychLens output to generate
                  commercial revenue without licensing rights.
                </p>
                <p style={{ marginTop: '8px' }}>
                  <strong>Commercial Inquiries:</strong> <a href="mailto:licensing@techfiyr.com" style={{ color: '#0f172a', fontWeight: 600 }}>licensing@techfiyr.com</a> / <a href="mailto:contact@techfiyr.com" style={{ color: '#0f172a', fontWeight: 600 }}>contact@techfiyr.com</a>
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: CONTENT USE POLICY */}
          {activeTab === 'content-use' && (
            <div className="policy-section">
              <div className="policy-intro-box">
                <Eye size={20} color="#0f172a" />
                <div>
                  <h3 className="policy-heading">Content Use Policy</h3>
                  <p className="policy-subtext">Permissible Utilization of Generated Insights & Images</p>
                </div>
              </div>

              <div className="policy-card">
                <h4>1. Ownership of Input Media</h4>
                <p>
                  You retain all original copyright and ownership of any photographs you capture or upload to PsychLens.
                  PsychLens claims no ownership over your source photography.
                </p>
              </div>

              <div className="policy-card">
                <h4>2. Permissible Uses of Psychological Cards & Visual Analysis</h4>
                <p>
                  You may freely share your generated emotional reflection cards, tension gauges, and color psychology reports
                  on personal social media, portfolio websites, or in academic presentations, provided attribution to
                  <strong> PsychLens by TechFiyr</strong> is maintained.
                </p>
              </div>

              <div className="policy-card warning-accent">
                <h4>3. Prohibited Exploitative Uses</h4>
                <ul className="policy-list">
                  <li><strong>No Surveillance or Vetting:</strong> You may not use generated outputs to vet prospective employees, conduct covert surveillance, or create discriminatory psychological profiles.</li>
                  <li><strong>No Harassment or Defamation:</strong> You may not use generated insights to ridicule, publicly shame, or weaponize emotional interpretations against any human subject.</li>
                  <li><strong>No Model Scraping:</strong> Automated scraping of output datasets to train competing commercial vision models is strictly prohibited.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 5: SAFETY & USAGE POLICY */}
          {activeTab === 'safety-usage' && (
            <div className="policy-section">
              <div className="policy-intro-box">
                <ShieldCheck size={20} color="#059669" />
                <div>
                  <h3 className="policy-heading">Safety & Usage Policy (UGC Mandates)</h3>
                  <p className="policy-subtext">Apple Guideline 1.2 & Google Play Store Compliance</p>
                </div>
              </div>

              <div className="policy-card">
                <h4>1. User-Generated Content (UGC) Safety Architecture</h4>
                <p>
                  To ensure community safety in compliance with Apple App Store Review Guideline 1.2 and Google Play UGC policies:
                </p>
                <ul className="policy-list">
                  <li><strong>In-App Reporting:</strong> Every public community card provides an accessible <em>"Report Inappropriate Content"</em> button. Reported posts are immediately queued for human moderator inspection.</li>
                  <li><strong>User Blocking:</strong> Users can instantly block any creator using the <em>"Block Author"</em> feature, permanently hiding that creator's contributions from their feed.</li>
                  <li><strong>Terms Acceptance:</strong> Users must acknowledge these safety guidelines before publishing any media to the community stream.</li>
                </ul>
              </div>

              <div className="policy-card">
                <h4>2. Minimum Age Requirements</h4>
                <p>
                  PsychLens is intended strictly for individuals aged 13 and older (16 and older in jurisdictions where local
                  statutes require higher age gates for digital processing).
                </p>
              </div>
            </div>
          )}

          {/* TAB 6: AI DISCLAIMER & GUIDELINES */}
          {activeTab === 'ai-disclaimer' && (
            <div className="policy-section">
              <div className="policy-intro-box">
                <ShieldAlert size={20} color="#dc2626" />
                <div>
                  <h3 className="policy-heading">AI Disclaimer Policy & Ethical Guidelines</h3>
                  <p className="policy-subtext">Absolute Non-Harm Safe Harbor & Medical Disclaimer</p>
                </div>
              </div>

              <div className="policy-card critical-accent">
                <h4>1. Strictly Non-Diagnostic & Non-Medical Notice</h4>
                <p>
                  <strong>PSYCHLENS IS NOT A MEDICAL, PSYCHIATRIC, OR CLINICAL DIAGNOSTIC DEVICE.</strong> All interpretations,
                  mood scores, micro-expression notes, and tension indices are generated by artificial intelligence solely for
                  educational reflection, visual artistic appreciation, and philosophical inquiry. This software cannot diagnose,
                  treat, cure, or evaluate any psychological, psychiatric, neurological, or physical health condition.
                </p>
              </div>

              <div className="policy-card">
                <h4>2. AI Infallibility & Probabilistic Perceptual Nature</h4>
                <p>
                  Artificial intelligence models are probabilistic. They may make perceptual mistakes, misread lighting artifacts
                  as emotional expressions, or exhibit algorithmic bias. Observations should be interpreted as thought-provoking
                  artistic perspectives, not as objective factual truths about an individual's character or mental state.
                </p>
              </div>

              <div className="policy-card">
                <h4>3. Absolute Prohibition on Security & Legal Threat Assessment</h4>
                <p>
                  You expressly covenant NEVER to utilize PsychLens output for criminal investigations, security threat
                  determinations, forensic deception analysis, lie detection, or legal disputes.
                </p>
              </div>

              <div className="policy-card">
                <h4>4. Safe Harbor, Limitation of Liability & Mutual Indemnification</h4>
                <p>
                  By accessing or utilizing PsychLens, you irrevocably agree to hold harmless and indemnify{' '}
                  <a href="https://techfiyr.com" target="_blank" rel="noopener noreferrer" style={{ color: '#0f172a', fontWeight: 700, textDecoration: 'underline' }}>
                    TechFiyr
                  </a>, its founders, directors, employees, and software contributors from any claims, legal liabilities,
                  damages, or disputes resulting from interpretations, actions, or decisions derived from this application.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="legal-modal-footer">
          <div className="footer-meta-text">
            For legal inquiries or commercial licensing rights, contact{' '}
            <a href="https://techfiyr.com" target="_blank" rel="noopener noreferrer" style={{ color: '#0f172a', fontWeight: 600 }}>
              TechFiyr (techfiyr.com)
            </a>.
          </div>
          <button onClick={onClose} className="btn-primary" style={{ padding: '8px 24px' }}>
            Close & Agree
          </button>
        </div>
      </div>

      <style>{`
        .legal-modal-box {
          max-width: 720px;
          width: 95%;
          max-height: 88vh;
          padding: 24px;
          display: flex;
          flex-direction: column;
          background: #ffffff;
          border-radius: 18px;
          box-shadow: 0 20px 40px rgba(15, 23, 42, 0.15);
        }

        .legal-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .legal-badge-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .legal-badge {
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          background: #f1f5f9;
          color: #0f172a;
          padding: 3px 8px;
          border-radius: 6px;
        }

        .legal-license-pill {
          font-size: 0.75rem;
          color: #64748b;
        }

        .btn-modal-close {
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 1.25rem;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 6px;
          transition: all 0.15s ease;
        }

        .btn-modal-close:hover {
          color: #0f172a;
          background: #f1f5f9;
        }

        /* Tabs Bar */
        .legal-tabs-bar {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          padding-bottom: 10px;
          margin-bottom: 16px;
          border-bottom: 1px solid #e2e8f0;
          scrollbar-width: thin;
        }

        .legal-tab-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 12px;
          border-radius: 8px;
          border: 1px solid transparent;
          background: #f8fafc;
          color: #64748b;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s ease;
        }

        .legal-tab-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .legal-tab-btn.active {
          background: #0f172a;
          color: #ffffff;
          border-color: #0f172a;
        }

        /* Policy Body */
        .legal-content-body {
          overflow-y: auto;
          flex: 1;
          padding-right: 6px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .policy-section {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .policy-intro-box {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
        }

        .policy-heading {
          font-size: 1.05rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .policy-subtext {
          font-size: 0.78rem;
          color: #64748b;
          margin: 2px 0 0 0;
        }

        .policy-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 14px 16px;
          font-size: 0.84rem;
          color: #334155;
          line-height: 1.55;
        }

        .policy-card h4 {
          font-size: 0.9rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 6px 0;
        }

        .policy-card.warning-accent {
          background: #fffbeb;
          border-color: #fde68a;
        }

        .policy-card.warning-accent h4 {
          color: #92400e;
        }

        .policy-card.critical-accent {
          background: #fff1f2;
          border-color: #fecdd3;
          color: #881337;
        }

        .policy-card.critical-accent h4 {
          color: #9f1239;
        }

        .policy-list {
          margin: 6px 0 0 0;
          padding-left: 20px;
        }

        .policy-list li {
          margin-bottom: 4px;
        }

        .gdpr-purge-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        .btn-purge-action {
          background: #fee2e2;
          color: #b91c1c;
          font-size: 0.78rem;
          font-weight: 600;
          padding: 7px 14px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: background 0.15s ease;
        }

        .btn-purge-action:hover {
          background: #fecaca;
        }

        /* Footer */
        .legal-modal-footer {
          margin-top: 18px;
          padding-top: 14px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }

        .footer-meta-text {
          font-size: 0.78rem;
          color: #64748b;
        }
      `}</style>
    </div>
  );
}
