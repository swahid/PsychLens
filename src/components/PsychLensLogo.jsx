import React from 'react';

/**
 * PsychLensLogo: Iconic Vector Brand Mark
 * Combines a camera aperture lens (photography/vision)
 * with a human eye iris and a glowing perception spark (subconscious psychology).
 */
export default function PsychLensLogo({ size = 32, className = '', showWordmark = false, wordmarkSize = '1.25rem' }) {
  return (
    <div className={`psychlens-brand-mark ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
        aria-label="PsychLens Logo"
      >
        <defs>
          {/* Subtle gradient for the perception iris core */}
          <linearGradient id="psychIrisGradient" x1="25" y1="25" x2="75" y2="75" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="50%" stopColor="#3730A3" />
            <stop offset="100%" stopColor="#1E1B4B" />
          </linearGradient>

          {/* Luminous spark glow */}
          <radialGradient id="psychSparkGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#818CF8" stopOpacity="1" />
            <stop offset="60%" stopColor="#6366F1" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#4338CA" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer Camera Lens Rim */}
        <circle cx="50" cy="50" r="46" stroke="#0F172A" strokeWidth="5.5" fill="#FFFFFF" />

        {/* Camera Aperture Blades (Forming the outer lens spiral) */}
        <path
          d="M50 4 C62 4, 73 10, 81 19 L64 36"
          stroke="#0F172A"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M81 19 C90 27, 96 38, 96 50 L73 54"
          stroke="#0F172A"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M96 50 C96 62, 90 73, 81 81 L60 67"
          stroke="#0F172A"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M81 81 C73 90, 62 96, 50 96 L46 73"
          stroke="#0F172A"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M50 96 C38 96, 27 90, 19 81 L36 64"
          stroke="#0F172A"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M19 81 C10 73, 4 62, 4 50 L27 46"
          stroke="#0F172A"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M4 50 C4 38, 10 27, 19 19 L40 33"
          stroke="#0F172A"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M19 19 C27 10, 38 4, 50 4 L54 27"
          stroke="#0F172A"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Eye Iris Frame (Introspective perception ring) */}
        <circle cx="50" cy="50" r="23" fill="url(#psychIrisGradient)" stroke="#0F172A" strokeWidth="3" />

        {/* Inner Lens Pupil Reflection Ring */}
        <circle cx="50" cy="50" r="16" fill="#0F172A" />

        {/* Mind & Emotional Spark of Perception (8-Point Star) */}
        <path
          d="M50 38 Q50 50 38 50 Q50 50 50 62 Q50 50 62 50 Q50 50 50 38 Z"
          fill="#A5B4FC"
        />
        <path
          d="M42 42 Q50 50 58 42 Q50 50 58 58 Q50 50 42 58 Q50 50 42 42 Z"
          fill="#C7D2FE"
          opacity="0.85"
        />

        {/* Tiny Optical Glint Reflection */}
        <circle cx="44" cy="44" r="2.2" fill="#FFFFFF" opacity="0.9" />
      </svg>

      {showWordmark && (
        <span
          className="brand-wordmark-text"
          style={{
            fontFamily: 'var(--font-display, "Plus Jakarta Sans", sans-serif)',
            fontWeight: 800,
            fontSize: wordmarkSize,
            letterSpacing: '-0.03em',
            color: '#0F172A',
            lineHeight: 1,
          }}
        >
          Psych<span style={{ color: '#4F46E5' }}>Lens</span>
        </span>
      )}
    </div>
  );
}
