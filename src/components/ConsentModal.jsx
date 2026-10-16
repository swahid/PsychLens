import React, { useState } from 'react';

export default function ConsentModal({
  isOpen,
  onClose,
  onConfirm,
  isPaidUser = false,
  targetScope = 'public' // 'public' | 'google_photos'
}) {
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPG13, setAgreedPG13] = useState(false);

  if (!isOpen) return null;

  const canProceed = agreedTerms && agreedPG13;

  const handleConfirm = () => {
    if (!canProceed) return;
    onConfirm();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container"
        style={{ maxWidth: '480px', padding: '24px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                background: '#fef3c7',
                color: '#92400e',
                padding: '3px 8px',
                borderRadius: '6px'
              }}
            >
              Consent & Privacy Acknowledgment
            </span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginTop: '6px' }}>
              Publishing to Community Feed
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ color: '#94a3b8', fontSize: '1.2rem', padding: '4px 8px', borderRadius: '6px' }}
          >
            ✕
          </button>
        </div>

        {/* Informative Card */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px',
            fontSize: '0.86rem',
            color: '#334155',
            lineHeight: 1.55
          }}
        >
          {isPaidUser ? (
            <div>
              <p style={{ fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                ⭐ Paid Member Protocol (Google Photos Cloud Backup)
              </p>
              <p>
                As a paid subscriber, your original image is securely archived into your personal{' '}
                <strong>Google Photos</strong> private vault album. When publishing publicly, a temporary copy is made
                visible to the PsychLens community feed.
              </p>
            </div>
          ) : (
            <div>
              <p style={{ fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                🌐 Free Community Upload Protocol (7-Day Ephemeral Host)
              </p>
              <p>
                To provide free psychological visual analysis at zero server cost, public items are hosted on high-speed
                ephemeral public image nodes (ImgBB / Litterbox) and will automatically be deleted within{' '}
                <strong>7 days or less</strong>.
              </p>
            </div>
          )}
        </div>

        {/* Checkbox Acknowledgment Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              fontSize: '0.84rem',
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            <input
              type="checkbox"
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
              style={{ marginTop: '3px', cursor: 'pointer' }}
            />
            <span>
              I understand this image will be <strong>publicly visible</strong> to anyone in the community stream
              {isPaidUser ? ' while my master copy remains in Google Photos.' : ' and auto-deleted in 7 days or less.'}
            </span>
          </label>

          <label
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              fontSize: '0.84rem',
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            <input
              type="checkbox"
              checked={agreedPG13}
              onChange={(e) => setAgreedPG13(e.target.checked)}
              style={{ marginTop: '3px', cursor: 'pointer' }}
            />
            <span>
              I certify this content complies with our <strong>Strict PG-13 Safety Guidelines</strong> (No nudity, adult
              content, hate, or graphic violence).
            </span>
          </label>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onClose}
            className="btn-outline"
            style={{ flex: 1, padding: '10px', fontSize: '0.9rem' }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canProceed}
            className="btn-primary"
            style={{
              flex: 1.5,
              padding: '10px',
              fontSize: '0.9rem',
              opacity: canProceed ? 1 : 0.5,
              cursor: canProceed ? 'pointer' : 'not-allowed'
            }}
          >
            Confirm & Publish
          </button>
        </div>
      </div>
    </div>
  );
}
