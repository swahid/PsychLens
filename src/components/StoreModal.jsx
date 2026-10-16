import React, { useState } from 'react';
import { X, Coins, Sparkles, Check, Gift, Film, Shield, Tag } from 'lucide-react';
import { REVENUECAT_OFFERINGS, revenueCat } from '../services/revenueCatService';
import { adminService } from '../services/adminService';
import confetti from 'canvas-confetti';

export default function StoreModal({ isOpen, onClose, onCreditPurchased, onWatchAdClicked, onOpenBYOK }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoMessage, setPromoMessage] = useState(null);

  if (!isOpen) return null;

  const handlePurchase = async (pkgKey) => {
    setIsProcessing(true);
    try {
      await revenueCat.purchasePackage(pkgKey);
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      onCreditPurchased();
      setTimeout(() => {
        setIsProcessing(false);
        onClose();
      }, 600);
    } catch (err) {
      setIsProcessing(false);
      alert('Transaction info: ' + err.message);
    }
  };

  const handleRedeemPromo = () => {
    if (!promoCodeInput.trim()) return;
    try {
      const credits = adminService.redeemPromoCode(promoCodeInput);
      setPromoMessage({ success: true, text: `Success! Granted +${credits} free credits to your wallet.` });
      setPromoCodeInput('');
      confetti({ particleCount: 50, spread: 60 });
      onCreditPurchased();
    } catch (err) {
      setPromoMessage({ success: false, text: err.message });
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="store-modal white-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="store-header">
          <div>
            <div className="flex-row gap-2 mb-1">
              <span className="badge badge-amber">
                <Coins size={12} /> RevenueCat Billing Hub
              </span>
              <span className="badge badge-sage">Unified Store</span>
            </div>
            <h2 className="store-title font-display">Credits & Memberships</h2>
            <p className="store-subtitle">1 credit = 1 psychological image analysis. Daily free quota consumed first.</p>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        {/* BYOK Incentive Callout */}
        <div className="byok-banner" onClick={() => { onClose(); onOpenBYOK(); }}>
          <div className="byok-icon-wrap">
            <Gift size={20} color="#059669" />
          </div>
          <div className="byok-info">
            <strong>Bring Your Own Key (BYOK) Bonus</strong>
            <p>Connect your personal Gemini API key and get an instant one-time gift of <strong>+500 Credits</strong>!</p>
          </div>
          <button className="btn-secondary byok-btn">Claim +500</button>
        </div>

        {/* Pricing Offerings Grid */}
        <div className="offerings-grid">
          {/* 100 Credits Top Up */}
          <div className="offering-card">
            <div className="card-top">
              <span className="badge badge-slate">Top-Up Pack</span>
              <div className="price-tag font-display">{REVENUECAT_OFFERINGS.CREDIT_PACK_100.priceString}</div>
            </div>
            <h3 className="offering-title font-display">{REVENUECAT_OFFERINGS.CREDIT_PACK_100.title}</h3>
            <p className="offering-desc">{REVENUECAT_OFFERINGS.CREDIT_PACK_100.description}</p>
            <button
              className="btn-primary full-width"
              onClick={() => handlePurchase('CREDIT_PACK_100')}
              disabled={isProcessing}
            >
              Recharge 100 Credits
            </button>
          </div>

          {/* Monthly Subscription */}
          <div className="offering-card highlight-card">
            <div className="card-top">
              <span className="badge badge-indigo">Auto-Renews</span>
              <div className="price-tag font-display">{REVENUECAT_OFFERINGS.MONTHLY_SUBSCRIPTION.priceString}</div>
            </div>
            <h3 className="offering-title font-display">{REVENUECAT_OFFERINGS.MONTHLY_SUBSCRIPTION.title}</h3>
            <p className="offering-desc">{REVENUECAT_OFFERINGS.MONTHLY_SUBSCRIPTION.description}</p>
            <button
              className="btn-primary full-width"
              onClick={() => handlePurchase('MONTHLY_SUBSCRIPTION')}
              disabled={isProcessing}
            >
              Subscribe Monthly
            </button>
          </div>

          {/* Yearly Subscription */}
          <div className="offering-card">
            <div className="card-top">
              <span className="badge badge-sage">{REVENUECAT_OFFERINGS.YEARLY_SUBSCRIPTION.badge}</span>
              <div className="price-tag font-display">{REVENUECAT_OFFERINGS.YEARLY_SUBSCRIPTION.priceString}</div>
            </div>
            <h3 className="offering-title font-display">{REVENUECAT_OFFERINGS.YEARLY_SUBSCRIPTION.title}</h3>
            <p className="offering-desc">{REVENUECAT_OFFERINGS.YEARLY_SUBSCRIPTION.description}</p>
            <button
              className="btn-secondary full-width"
              onClick={() => handlePurchase('YEARLY_SUBSCRIPTION')}
              disabled={isProcessing}
            >
              Subscribe Yearly
            </button>
          </div>
        </div>

        {/* Free Option: Rewarded Ad */}
        <div className="rewarded-ad-row">
          <div className="rewarded-ad-info">
            <Film size={18} color="#d97706" />
            <div>
              <strong>Watch Sponsor Clip (+1 Credit Free)</strong>
              <p>Strictly opt-in. Watch a brief 15s clip to recharge your balance for free.</p>
            </div>
          </div>
          <button className="btn-secondary" onClick={() => { onClose(); onWatchAdClicked(); }}>
            Watch Ad (+1)
          </button>
        </div>

        {/* Promo Code Box */}
        <div className="promo-box">
          <div className="promo-input-row">
            <Tag size={16} color="#64748b" />
            <input
              type="text"
              placeholder="Have a promo code? (e.g. TECHFIYR50)"
              value={promoCodeInput}
              onChange={(e) => setPromoCodeInput(e.target.value)}
              className="promo-input"
            />
            <button className="btn-secondary btn-redeem" onClick={handleRedeemPromo}>
              Redeem
            </button>
          </div>
          {promoMessage && (
            <div className={`promo-alert ${promoMessage.success ? 'alert-success' : 'alert-error'}`}>
              {promoMessage.text}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.55);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 16px;
        }
        .store-modal {
          width: 100%;
          max-width: 680px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 28px;
        }
        .store-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .store-title {
          font-size: 1.45rem;
          font-weight: 800;
          letter-spacing: -0.02em;
        }
        .store-subtitle {
          font-size: 0.86rem;
          color: var(--text-muted);
          margin-top: 2px;
        }
        .byok-banner {
          display: flex;
          align-items: center;
          gap: 14px;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          border-radius: var(--radius-md);
          padding: 14px 18px;
          margin-bottom: 20px;
          cursor: pointer;
          transition: var(--transition);
        }
        .byok-banner:hover {
          background: #d1fae5;
          transform: translateY(-1px);
        }
        .byok-icon-wrap {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .byok-info {
          flex: 1;
        }
        .byok-info strong {
          font-size: 0.88rem;
          color: #065f46;
        }
        .byok-info p {
          font-size: 0.8rem;
          color: #047857;
          margin-top: 2px;
        }
        .byok-btn {
          background: #ffffff;
          border-color: #6ee7b7;
          font-weight: 700;
          color: #047857;
          font-size: 0.8rem;
        }
        .offerings-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          margin-bottom: 20px;
        }
        .offering-card {
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 18px 16px;
          display: flex;
          flex-direction: column;
          background: #ffffff;
          transition: var(--transition);
        }
        .offering-card:hover {
          border-color: var(--border-accent);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        .highlight-card {
          border-color: #c7d2fe;
          background: #fdfefe;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.08);
        }
        .card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .price-tag {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--text-primary);
        }
        .offering-title {
          font-size: 0.96rem;
          font-weight: 700;
          margin-bottom: 4px;
        }
        .offering-desc {
          font-size: 0.78rem;
          color: var(--text-muted);
          line-height: 1.4;
          margin-bottom: 16px;
          flex: 1;
        }
        .full-width {
          width: 100%;
        }
        .rewarded-ad-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-radius: var(--radius-md);
          padding: 14px 18px;
          margin-bottom: 16px;
        }
        .rewarded-ad-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .rewarded-ad-info strong {
          font-size: 0.88rem;
          color: #92400e;
        }
        .rewarded-ad-info p {
          font-size: 0.78rem;
          color: #b45309;
        }
        .promo-box {
          border-top: 1px solid var(--border-subtle);
          padding-top: 16px;
        }
        .promo-input-row {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #f8fafc;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-full);
          padding: 4px 6px 4px 14px;
        }
        .promo-input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 0.86rem;
          outline: none;
          color: var(--text-primary);
        }
        .btn-redeem {
          padding: 6px 14px;
          font-size: 0.8rem;
        }
        .promo-alert {
          margin-top: 10px;
          font-size: 0.82rem;
          padding: 8px 12px;
          border-radius: var(--radius-sm);
        }
        .alert-success {
          background: #ecfdf5;
          color: #047857;
          border: 1px solid #a7f3d0;
        }
        .alert-error {
          background: #fff1f2;
          color: #be123c;
          border: 1px solid #fecdd3;
        }
        @media (max-width: 680px) {
          .offerings-grid {
            grid-template-columns: 1fr;
          }
          .rewarded-ad-row {
            flex-direction: column;
            gap: 12px;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}
