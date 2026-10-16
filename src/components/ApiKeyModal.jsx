import React, { useState, useEffect } from 'react';
import { X, Key, ExternalLink, CheckCircle, Trash2, Gift, Shield } from 'lucide-react';
import { getStoredApiKey, saveApiKey } from '../services/geminiService';
import { creditService } from '../services/creditService';
import { analyticsService } from '../services/analyticsService';

export default function ApiKeyModal({ isOpen, onClose, onKeySaved }) {
  const [keyInput, setKeyInput] = useState('');
  const [savedStatus, setSavedStatus] = useState(false);
  const [bonusAwarded, setBonusAwarded] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setKeyInput(getStoredApiKey());
      setSavedStatus(false);
      setBonusAwarded(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!keyInput.trim()) return;
    saveApiKey(keyInput.trim());
    const granted = creditService.grantBYOKBonus(keyInput.trim());
    setSavedStatus(true);
    setBonusAwarded(granted);
    analyticsService.trackEvent('byok_key_saved', { bonus_granted: granted });
    if (onKeySaved) onKeySaved();
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const handleClear = () => {
    saveApiKey('');
    setKeyInput('');
    setSavedStatus(false);
    setBonusAwarded(false);
    if (onKeySaved) onKeySaved();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container"
        style={{ maxWidth: '480px', padding: '24px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  background: '#f1f5f9',
                  color: '#0f172a',
                  padding: '3px 8px',
                  borderRadius: '6px'
                }}
              >
                BYOK Engine
              </span>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  background: '#dcfce7',
                  color: '#15803d',
                  padding: '3px 8px',
                  borderRadius: '6px'
                }}
              >
                +500 Bonus Credits
              </span>
            </div>
            <h2 className="editorial-title" style={{ fontSize: '1.25rem', marginTop: '6px' }}>
              Connect Personal Gemini Key
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ color: '#94a3b8', fontSize: '1.2rem', padding: '4px 8px', borderRadius: '6px' }}
          >
            ✕
          </button>
        </div>

        {/* Incentive Highlight Box */}
        <div
          style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
            border: '1px solid #bbf7d0',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}
        >
          <Gift size={22} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#166534', marginBottom: '2px' }}>
              Earn +500 Credits Instantly
            </h4>
            <p style={{ fontSize: '0.82rem', color: '#15803d', lineHeight: 1.45 }}>
              Connecting your own Google Gemini API key routes your requests through your key first and earns you a
              massive <strong>+500 credit bonus</strong> in your PsychLens wallet!
            </p>
          </div>
        </div>

        {/* Key Input Field */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a', display: 'block', marginBottom: '6px' }}>
            Google Gemini API Key
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 40px 10px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                color: '#0f172a',
                outline: 'none'
              }}
            />
            {keyInput && (
              <button
                onClick={handleClear}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8'
                }}
                title="Clear key"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.82rem',
              color: '#4f46e5',
              fontWeight: 500,
              textDecoration: 'none'
            }}
          >
            <span>Get a free Gemini API Key from Google AI Studio</span>
            <ExternalLink size={13} />
          </a>
        </div>

        {savedStatus && (
          <div
            style={{
              background: '#f0fdf4',
              border: '1px solid #86efac',
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#166534',
              fontSize: '0.85rem',
              fontWeight: 600
            }}
          >
            <CheckCircle size={16} />
            <span>
              {bonusAwarded
                ? '✓ Key saved & +500 Bonus Credits added to your wallet!'
                : '✓ Key saved securely to local browser storage.'}
            </span>
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onClose} className="btn-outline" style={{ flex: 1, padding: '10px' }}>
            Cancel
          </button>
          <button onClick={handleSave} className="btn-primary" style={{ flex: 1.5, padding: '10px' }}>
            Save Key & Claim Bonus
          </button>
        </div>
      </div>
    </div>
  );
}
