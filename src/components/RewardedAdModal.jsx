import React, { useState, useEffect, useRef } from 'react';
import { creditService } from '../services/creditService';
import { analyticsService } from '../services/analyticsService';

export default function RewardedAdModal({ isOpen, onClose, onRewardClaimed }) {
  const [countdown, setCountdown] = useState(15);
  const [completed, setCompleted] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setCountdown(15);
      setCompleted(false);
      setClaimed(false);
      analyticsService.trackEvent('rewarded_ad_started');

      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClaim = () => {
    const updated = creditService.rewardAdWatch(1);
    setClaimed(true);
    analyticsService.trackEvent('rewarded_ad_completed', { reward_credits: 1 });
    if (onRewardClaimed) onRewardClaimed(updated);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleEarlyClose = () => {
    if (!completed) {
      const confirmExit = window.confirm(
        'Exit now? You will not receive your +1 bonus credit unless you watch until the end.'
      );
      if (!confirmExit) return;
    }
    onClose();
  };

  const progressPercent = ((15 - countdown) / 15) * 100;

  return (
    <div className="modal-overlay" onClick={handleEarlyClose}>
      <div
        className="modal-container"
        style={{ maxWidth: '440px', padding: '24px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                background: '#e0e7ff',
                color: '#4338ca',
                padding: '3px 8px',
                borderRadius: '6px'
              }}
            >
              Sponsor Message
            </span>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
              {completed ? 'Reward unlocked' : `Reward in ${countdown}s`}
            </span>
          </div>

          <button
            onClick={handleEarlyClose}
            style={{
              color: '#94a3b8',
              fontSize: '1.2rem',
              lineHeight: 1,
              padding: '4px 8px',
              borderRadius: '6px'
            }}
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Sponsor Content / Visual Clip */}
        <div
          style={{
            background: 'linear-gradient(145deg, #f8fafc 0%, #e2e8f0 100%)',
            border: '1px solid #cbd5e1',
            borderRadius: '12px',
            padding: '24px 20px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            minHeight: '220px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          {/* Progress Bar Header */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: '#e2e8f0'
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progressPercent}%`,
                background: completed ? '#10b981' : '#4f46e5',
                transition: 'width 1s linear'
              }}
            />
          </div>

          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
              marginBottom: '14px'
            }}
          >
            {completed ? '✨' : '🧘'}
          </div>

          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
            {completed ? 'Sponsor Clip Finished!' : (
              <>Mindful Perception by <a href="https://techfiyr.com" target="_blank" rel="noopener noreferrer" style={{ color: '#0f172a', textDecoration: 'underline' }}>TechFiyr</a></>
            )}
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.45, maxWidth: '280px' }}>
            {completed
              ? 'Thank you for supporting PsychLens. Click below to credit your account immediately.'
              : 'Discover how daily mindful visual reflection strengthens emotional clarity and empathy.'}
          </p>

          {!completed && (
            <div
              style={{
                marginTop: '16px',
                fontSize: '0.8rem',
                color: '#64748b',
                background: '#ffffff',
                padding: '4px 12px',
                borderRadius: '999px',
                border: '1px solid #e2e8f0'
              }}
            >
              ⏱️ Remaining: {countdown} seconds
            </div>
          )}
        </div>

        {/* Action Button */}
        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {completed ? (
            <button
              onClick={handleClaim}
              disabled={claimed}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '0.95rem',
                background: claimed ? '#10b981' : '#0f172a'
              }}
            >
              {claimed ? '✓ +1 Credit Added to Wallet!' : '🎁 Claim +1 Credit Now'}
            </button>
          ) : (
            <div style={{ textAlign: 'center', fontSize: '0.82rem', color: '#94a3b8' }}>
              Please finish the short clip to claim your free analysis credit.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
