import React from 'react';

export default function BannerAd({ isSubscribed, onUpgradeClick }) {
  if (isSubscribed) return null;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '720px',
        margin: '16px auto 8px auto',
        padding: '0 16px'
      }}
    >
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <span
            style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: '#94a3b8',
              border: '1px solid #cbd5e1',
              padding: '1px 4px',
              borderRadius: '4px',
              lineHeight: 1
            }}
          >
            Ad
          </span>
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                fontSize: '0.82rem',
                fontWeight: 600,
                color: '#1e293b',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              Explore Conscious Perception with <a href="https://techfiyr.com" target="_blank" rel="noopener noreferrer" style={{ color: '#0f172a', fontWeight: 600, textDecoration: 'underline' }}>TechFiyr</a>
            </p>
            <p
              style={{
                fontSize: '0.74rem',
                color: '#64748b',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              Supporting free human-centric visual psychology
            </p>
          </div>
        </div>

        <button
          onClick={onUpgradeClick}
          style={{
            fontSize: '0.74rem',
            fontWeight: 600,
            color: '#4f46e5',
            background: '#eef2ff',
            padding: '4px 8px',
            borderRadius: '6px',
            border: 'none',
            whiteSpace: 'nowrap'
          }}
          title="Remove ads"
        >
          Remove Ads ($1)
        </button>
      </div>
    </div>
  );
}
