import React from 'react';
import { Sparkles, Camera, ShieldCheck, Globe, Key, AlertCircle, Coins, Shield, Gift } from 'lucide-react';
import PsychLensLogo from './PsychLensLogo';

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenStore,
  onOpenApiKey,
  onOpenLegal,
  onOpenAdmin,
  vaultCount,
  walletStatus,
}) {
  const dailyRemaining = walletStatus?.dailyRemaining ?? 3;
  const credits = walletStatus?.walletCredits ?? 10;
  const isSubscribed = walletStatus?.isSubscribed ?? false;
  const hasBYOKBonus = walletStatus?.byokBonusClaimed ?? false;

  return (
    <header className="navbar-wrapper">
      <div className="container navbar-inner">
        {/* Brand with Techfiyr Ownership */}
        <div className="brand-group" onClick={() => setActiveTab('lens')} role="button" tabIndex={0}>
          <PsychLensLogo size={34} />
          <div>
            <div className="brand-title font-display">
              Psych<span className="brand-accent">Lens</span>
            </div>
            <div className="brand-license">
              By <a
                href="https://techfiyr.com"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{ color: '#64748b', textDecoration: 'underline', fontWeight: 600 }}
              >
                TechFiyr
              </a>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="nav-tabs" aria-label="Main Navigation">
          <button
            id="tab-btn-lens"
            className={`nav-tab-btn ${activeTab === 'lens' ? 'active' : ''}`}
            onClick={() => setActiveTab('lens')}
          >
            <Camera size={16} />
            <span>Lens</span>
          </button>

          <button
            id="tab-btn-vault"
            className={`nav-tab-btn ${activeTab === 'vault' ? 'active' : ''}`}
            onClick={() => setActiveTab('vault')}
          >
            <ShieldCheck size={16} />
            <span>Private Vault</span>
            {vaultCount > 0 && <span className="vault-badge">{vaultCount}</span>}
          </button>

          <button
            id="tab-btn-feed"
            className={`nav-tab-btn ${activeTab === 'feed' ? 'active' : ''}`}
            onClick={() => setActiveTab('feed')}
          >
            <Globe size={16} />
            <span>Community</span>
            <span className="badge-ttl">7d TTL</span>
          </button>
        </nav>

        {/* Credits & Action Controls */}
        <div className="nav-actions">
          {/* Credit Wallet Pill (RevenueCat Store Trigger) */}
          <button
            id="btn-wallet-store"
            className="wallet-pill-btn"
            onClick={onOpenStore}
            title="Manage Credits & Subscriptions"
          >
            <Coins size={14} className="coin-icon" />
            <span className="daily-free-tag">{dailyRemaining} Daily Free</span>
            <span className="divider-dot">•</span>
            <span className="credits-val">{credits} Credits</span>
            {isSubscribed && <span className="pro-badge">PRO</span>}
          </button>

          {/* BYOK Incentive Callout */}
          <button
            id="btn-open-apikey"
            className="btn-secondary byok-pill"
            onClick={onOpenApiKey}
            title={hasBYOKBonus ? 'Gemini Key Connected' : 'Add your key & get +500 Credits!'}
          >
            <Key size={14} />
            <span className="hide-on-mobile">{hasBYOKBonus ? 'BYOK Active' : '+500 Bonus'}</span>
            {!hasBYOKBonus && <span className="bonus-sparkle">🎁</span>}
          </button>

          {/* Admin Dashboard */}
          <button
            id="btn-open-admin"
            className="btn-icon"
            onClick={onOpenAdmin}
            title="Techfiyr Admin Dashboard"
            aria-label="Admin Operations"
          >
            <Shield size={16} />
          </button>

          {/* Legal / Disclaimer */}
          <button
            id="btn-open-legal"
            className="btn-icon"
            onClick={onOpenLegal}
            title="Ethics, Privacy & Legal Policy"
            aria-label="Legal & Ethics"
          >
            <AlertCircle size={16} />
          </button>
        </div>
      </div>

      <style>{`
        .navbar-wrapper {
          position: sticky;
          top: 0;
          z-index: 50;
          background: #ffffff;
          border-bottom: 1px solid var(--border-subtle);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
        }
        .navbar-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 12px;
          padding-bottom: 12px;
          gap: 16px;
        }
        .brand-group {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          user-select: none;
        }
        .brand-icon-wrapper {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-md);
          background: #f1f5f9;
          border: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }
        .brand-title {
          font-weight: 800;
          font-size: 1.25rem;
          color: var(--text-primary);
          line-height: 1.1;
          letter-spacing: -0.03em;
        }
        .brand-accent {
          color: var(--accent-indigo);
        }
        .brand-license {
          font-size: 0.68rem;
          color: var(--text-muted);
          font-weight: 500;
          letter-spacing: 0.02em;
        }
        .nav-tabs {
          display: flex;
          align-items: center;
          gap: 4px;
          background: #f1f5f9;
          padding: 4px;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-subtle);
        }
        .nav-tab-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: var(--radius-full);
          font-size: 0.84rem;
          font-weight: 600;
          color: var(--text-secondary);
          transition: var(--transition);
        }
        .nav-tab-btn:hover {
          color: var(--text-primary);
        }
        .nav-tab-btn.active {
          background: #ffffff;
          color: var(--text-primary);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        }
        .vault-badge {
          background: #e2e8f0;
          font-size: 0.68rem;
          padding: 1px 6px;
          border-radius: 10px;
          font-weight: 700;
          color: #334155;
        }
        .badge-ttl {
          background: #fef3c7;
          color: #92400e;
          font-size: 0.65rem;
          padding: 1px 5px;
          border-radius: 6px;
          font-weight: 700;
        }
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .wallet-pill-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #f8fafc;
          border: 1px solid var(--border-subtle);
          padding: 6px 12px;
          border-radius: var(--radius-full);
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-primary);
          box-shadow: var(--shadow-sm);
          transition: var(--transition);
        }
        .wallet-pill-btn:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
          transform: translateY(-1px);
        }
        .coin-icon {
          color: var(--accent-amber);
        }
        .daily-free-tag {
          color: var(--accent-sage);
        }
        .divider-dot {
          color: var(--text-dim);
        }
        .credits-val {
          color: var(--text-secondary);
        }
        .pro-badge {
          background: var(--accent-primary);
          color: #fff;
          font-size: 0.62rem;
          padding: 1px 5px;
          border-radius: 4px;
          font-weight: 800;
          margin-left: 2px;
        }
        .byok-pill {
          padding: 6px 12px;
          font-size: 0.8rem;
        }
        .bonus-sparkle {
          font-size: 12px;
        }
        @media (max-width: 768px) {
          .nav-tabs {
            display: none;
          }
          .brand-license {
            display: none;
          }
          .hide-on-mobile {
            display: none;
          }
          .daily-free-tag,
          .divider-dot {
            display: none;
          }
          .navbar-inner {
            padding-top: 8px;
            padding-bottom: 8px;
            gap: 8px;
          }
          .btn-icon {
            width: 32px;
            height: 32px;
          }
          .wallet-pill-btn {
            padding: 4px 8px;
            font-size: 0.75rem;
          }
          .byok-pill {
            padding: 4px 8px;
            font-size: 0.75rem;
          }
        }
      `}</style>
    </header>
  );
}
