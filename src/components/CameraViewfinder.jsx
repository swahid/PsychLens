import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, RefreshCw, Grid, Sparkles, AlertTriangle, Image as ImageIcon, Search, Link as LinkIcon, X, ArrowRight } from 'lucide-react';
import { optimizeImage } from '../services/imageOptimizer';

// 15 Verified Public Domain / Creative Commons Zero (CC0) Psychological Portraits
const CURATED_PUBLIC_PHOTO_POOL = [
  {
    name: 'Vulnerable Gaze',
    tag: 'Direct / Raw',
    emoji: '👁️',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Street Confession',
    tag: 'Spontaneous / Tension',
    emoji: '🏙️',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Warm Contemplation',
    tag: 'Serene / Gentle',
    emoji: '☕',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Resilient Solitude',
    tag: 'Grounded / Calm',
    emoji: '🌿',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Electric Joy',
    tag: 'Vibrant / Radiant',
    emoji: '✨',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Stoic Reflection',
    tag: 'Guarded / Deep',
    emoji: '🗿',
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Subtle Enigma',
    tag: 'Elusive / Introspective',
    emoji: '🌙',
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Quiet Focus',
    tag: 'Focused / Pure',
    emoji: '🎯',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Thoughtful Wanderer',
    tag: 'Melancholic / Searching',
    emoji: '🧭',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Candid Warmth',
    tag: 'Open / Empathetic',
    emoji: '☀️',
    url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Gentle Pondering',
    tag: 'Hesitant / Reflective',
    emoji: '🍂',
    url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Internal Balance',
    tag: 'Peaceful / Settled',
    emoji: '🌊',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Subconscious Wonder',
    tag: 'Dreamy / Distant',
    emoji: '🌌',
    url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Executive Composure',
    tag: 'Sharp / Analytical',
    emoji: '💼',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Youthful Nostalgia',
    tag: 'Tender / Yearning',
    emoji: '🎞️',
    url: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=800&q=80',
  },
];

function getRandomPresets(count = 5) {
  const shuffled = [...CURATED_PUBLIC_PHOTO_POOL].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export default function CameraViewfinder({ onImageReady, isProcessing }) {
  // Default to Google Images search mode: never auto-start camera on load
  const [activeMode, setActiveMode] = useState('google'); // 'google' | 'camera'
  const [activePresets, setActivePresets] = useState(() => getRandomPresets(5));
  const [streamActive, setStreamActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [facingMode, setFacingMode] = useState('user'); // 'user' | 'environment'
  const [showGrid, setShowGrid] = useState(true);
  const [countdown, setCountdown] = useState(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Initialize camera ONLY when user explicitly switches to 'camera' mode
  useEffect(() => {
    if (activeMode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeMode, facingMode]);

  const startCamera = async () => {
    stopCamera();
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setStreamActive(true);
    } catch (err) {
      console.warn('Camera initiation failed:', err);
      setCameraError(err.message || 'Unable to access camera on this device.');
      setStreamActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStreamActive(false);
  };

  const flipCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Capture snapshot from live stream
  const captureSnapshot = async () => {
    if (!videoRef.current || !streamActive) return;

    // Trigger visual flash
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');

    // If facing user, mirror the snapshot so it feels natural
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const rawDataUrl = canvas.toDataURL('image/jpeg', 0.95);
    const optimized = await optimizeImage(rawDataUrl);
    stopCamera();
    setActiveMode('google');
    onImageReady(optimized);
  };

  const handleCaptureWithCountdown = () => {
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          captureSnapshot();
          return null;
        }
        return prev - 1;
      });
    }, 800);
  };

  // File Upload Handlers
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const processSelectedFile = async (fileOrUrl) => {
    try {
      const optimized = await optimizeImage(fileOrUrl);
      onImageReady(optimized);
    } catch (err) {
      alert('Error loading image: ' + err.message);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processSelectedFile(file);
    }
  };

  const handleUrlSubmit = async (e) => {
    e.preventDefault();
    if (!imageUrlInput.trim()) return;
    setIsLoadingUrl(true);
    try {
      await processSelectedFile(imageUrlInput.trim());
      setImageUrlInput('');
    } catch (err) {
      alert('Unable to load image from URL: ' + err.message);
    } finally {
      setIsLoadingUrl(false);
    }
  };

  return (
    <div className="google-lens-wrapper">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* CAMERA ACTIVE VIEW */}
      {activeMode === 'camera' ? (
        <div className="camera-frame-card">
          <div className="camera-header-bar">
            <div className="camera-status-pill">
              <span className="live-indicator" />
              <span>Live Psychological Viewfinder</span>
            </div>
            <button
              className="btn-close-camera"
              onClick={() => {
                stopCamera();
                setActiveMode('google');
              }}
              title="Close camera"
            >
              <X size={18} />
              <span>Close</span>
            </button>
          </div>

          <div className="camera-viewport-box">
            {cameraError ? (
              <div className="camera-error-clean">
                <AlertTriangle size={32} color="#f59e0b" />
                <h4>Camera Access Unavailable</h4>
                <p>{cameraError}</p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button
                    className="btn-primary"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={16} />
                    <span>Upload a Photo Instead</span>
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => setActiveMode('google')}
                  >
                    Return to Search
                  </button>
                </div>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  className={`video-stream ${facingMode === 'user' ? 'mirrored' : ''}`}
                />

                {/* Grid Overlay */}
                {showGrid && (
                  <div className="grid-overlay">
                    <div className="grid-line grid-v-1" />
                    <div className="grid-line grid-v-2" />
                    <div className="grid-line grid-h-1" />
                    <div className="grid-line grid-h-2" />
                    <div className="reticle-target" />
                  </div>
                )}

                {/* Countdown Overlay */}
                {countdown !== null && (
                  <div className="countdown-display font-display">{countdown}</div>
                )}

                {/* Flash */}
                {isFlashing && <div className="flash-screen" />}

                {/* Floating Top Actions */}
                <div className="camera-top-actions">
                  <button
                    className={`btn-camera-ctrl ${showGrid ? 'active' : ''}`}
                    onClick={() => setShowGrid(!showGrid)}
                    title="Toggle Grid"
                  >
                    <Grid size={16} />
                  </button>
                  <button
                    className="btn-camera-ctrl"
                    onClick={flipCamera}
                    title="Flip Camera"
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>

                {/* Bottom Shutter Controls */}
                <div className="camera-shutter-bar">
                  <button
                    className="btn-timer"
                    onClick={handleCaptureWithCountdown}
                    disabled={isProcessing}
                  >
                    ⏱️ 3s
                  </button>

                  <button
                    id="btn-capture-snapshot"
                    className="main-shutter-btn"
                    onClick={captureSnapshot}
                    disabled={isProcessing}
                    aria-label="Capture Snapshot"
                  >
                    <div className="shutter-core">
                      <Sparkles size={22} color="#ffffff" />
                    </div>
                  </button>

                  <button
                    className="btn-gallery-select"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon size={18} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        /* GOOGLE IMAGES CLEAN SEARCH INTERFACE */
        <div className="google-search-container">
          {/* Google Lens Interactive Search Pill */}
          <div
            className={`google-search-pill ${isDragOver ? 'drag-target' : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
          >
            <div className="search-pill-icon">
              <Search size={20} color="#94a3b8" />
            </div>

            <div
              className="search-pill-input-mock"
              onClick={() => fileInputRef.current?.click()}
            >
              <span>{isDragOver ? 'Drop image right here to analyze...' : 'Drop image or search any visual emotion...'}</span>
            </div>

            <div className="search-pill-actions">
              {/* Google Lens Camera Icon Button */}
              <button
                type="button"
                className="action-icon-btn camera-btn"
                onClick={() => setActiveMode('camera')}
                title="Search by Live Camera"
                aria-label="Open Camera"
              >
                <Camera size={19} color="#475569" />
              </button>

              {/* Upload Image Icon Button */}
              <button
                type="button"
                className="action-icon-btn upload-btn"
                onClick={() => fileInputRef.current?.click()}
                title="Upload Photo from Device"
                aria-label="Upload Image"
              >
                <Upload size={19} color="#475569" />
              </button>
            </div>
          </div>

          {/* Clean Google Lens Drop & Upload Card */}
          <div
            className={`google-lens-card ${isDragOver ? 'drag-over' : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
          >
            <div className="lens-card-inner">
              <div className="lens-drop-prompt">
                <div className="lens-icon-bubble">
                  <Sparkles size={24} color="#0f172a" />
                </div>
                <h3 className="lens-title">Drag an image here</h3>
                {/* <p className="lens-sub">
                  or <button type="button" className="lens-link-btn" onClick={() => fileInputRef.current?.click()}>upload a file</button> from your phone or computer
                </p> */}
              </div>

              {/* Direct Web Image URL Paste Input */}
              <form className="lens-url-form" onSubmit={handleUrlSubmit}>
                <div className="url-input-wrap">
                  <LinkIcon size={16} color="#94a3b8" />
                  <input
                    type="url"
                    placeholder="Paste image link (https://...)"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    className="url-input"
                  />
                  {imageUrlInput && (
                    <button
                      type="submit"
                      disabled={isLoadingUrl}
                      className="btn-url-submit"
                    >
                      {isLoadingUrl ? 'Loading...' : <ArrowRight size={15} />}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Curated Psychological Moments - Random 5 Public Commons Photos */}
          <div className="google-presets-bar">
            <div className="presets-header-row">
              <span className="presets-label">
                Or test instantly with curated psychological moments:
              </span>
              <button
                type="button"
                className="btn-shuffle-presets"
                onClick={() => setActivePresets(getRandomPresets(5))}
                title="Shuffle 5 random public domain photos"
              >
                <RefreshCw size={12} />
                <span>Shuffle 5 New</span>
              </button>
            </div>
            <div className="presets-cards-grid">
              {activePresets.map((preset, idx) => (
                <div
                  key={`${preset.name}-${idx}`}
                  className="preset-card-item"
                  onClick={() => processSelectedFile(preset.url)}
                  role="button"
                  tabIndex={0}
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="preset-thumb"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div className="preset-info">
                    <div className="preset-name">{preset.name}</div>
                    <div className="preset-tag">{preset.tag}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Scoped Clean Styling */}
      <style>{`
        .google-lens-wrapper {
          width: 100%;
          max-width: 780px;
          margin: 0 auto;
        }

        /* Google Images Search Container */
        .google-search-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          width: 100%;
        }

        /* Iconic Google Lens Search Pill */
        .google-search-pill {
          display: flex;
          align-items: center;
          width: 100%;
          background: #ffffff;
          border: 1px solid #dfe1e5;
          border-radius: 999px;
          padding: 8px 16px 8px 20px;
          box-shadow: 0 1px 6px rgba(32, 33, 36, 0.08);
          transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
          cursor: pointer;
        }

        .google-search-pill:hover, .google-search-pill.drag-target {
          border-color: #cbd5e1;
          box-shadow: 0 2px 14px rgba(32, 33, 36, 0.16);
          transform: translateY(-1px);
        }

        .google-search-pill.drag-target {
          border-color: #0f172a;
          background: #f8fafc;
        }

        .search-pill-icon {
          display: flex;
          align-items: center;
          margin-right: 14px;
        }

        .search-pill-input-mock {
          flex: 1;
          font-size: 0.96rem;
          color: #64748b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          user-select: none;
        }

        .search-pill-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .action-icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .action-icon-btn:hover {
          background: #f1f5f9;
          transform: scale(1.06);
        }

        .action-icon-btn.camera-btn:hover svg {
          color: #0f172a;
        }

        /* Clean Lens Card Dropzone */
        .google-lens-card {
          width: 100%;
          background: #ffffff;
          border: 1px dashed #cbd5e1;
          border-radius: 20px;
          padding: 32px 24px;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
        }

        .google-lens-card:hover, .google-lens-card.drag-over {
          border-color: #0f172a;
          background: #fcfcfd;
          box-shadow: 0 4px 16px rgba(15, 23, 42, 0.05);
        }

        .google-lens-card.drag-over {
          border-style: solid;
          border-color: #059669;
          background: #f0fdf4;
        }

        .lens-card-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 20px;
        }

        .lens-drop-prompt {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .lens-icon-bubble {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          margin-bottom: 4px;
        }

        .lens-title {
          font-family: var(--font-display);
          font-size: 1.15rem;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .lens-sub {
          font-size: 0.88rem;
          color: #64748b;
          margin: 0;
        }

        .lens-link-btn {
          background: none;
          border: none;
          padding: 0;
          color: #0f172a;
          font-weight: 600;
          text-decoration: underline;
          cursor: pointer;
        }

        .lens-link-btn:hover {
          color: #4338ca;
        }

        /* URL Paste Bar */
        .lens-url-form {
          width: 100%;
          max-width: 440px;
        }

        .url-input-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 999px;
          padding: 6px 14px;
          transition: border-color 0.2s ease;
        }

        .url-input-wrap:focus-within {
          border-color: #94a3b8;
          background: #ffffff;
        }

        .url-input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 0.84rem;
          color: #0f172a;
          outline: none;
        }

        .btn-url-submit {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #0f172a;
          color: #ffffff;
          border: none;
          cursor: pointer;
          transition: transform 0.15s ease;
        }

        .btn-url-submit:hover {
          transform: scale(1.08);
        }

        /* Preset Cards (Random 5 Curated Moments) */
        .google-presets-bar {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 10px;
          align-items: flex-start;
          margin-top: 6px;
        }

        .presets-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          gap: 8px;
        }

        .presets-label {
          font-size: 0.84rem;
          font-weight: 600;
          color: #475569;
        }

        .btn-shuffle-presets {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          color: #334155;
          font-size: 0.74rem;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
        }

        .btn-shuffle-presets:hover {
          background: #e2e8f0;
          color: #0f172a;
          transform: translateY(-1px);
        }

        .presets-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 10px;
          width: 100%;
        }

        .preset-card-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
          transition: all 0.16s ease;
          text-align: left;
        }

        .preset-card-item:hover {
          border-color: #cbd5e1;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.07);
        }

        .preset-thumb {
          width: 44px;
          height: 44px;
          border-radius: 8px;
          object-fit: cover;
          flex-shrink: 0;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
        }

        .preset-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow: hidden;
        }

        .preset-name {
          font-size: 0.82rem;
          font-weight: 600;
          color: #0f172a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .preset-tag {
          font-size: 0.72rem;
          color: #059669;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Camera Frame View (Opt-in) */
        .camera-frame-card {
          width: 100%;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(15, 23, 42, 0.08);
        }

        .camera-header-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 18px;
          border-bottom: 1px solid #e2e8f0;
          background: #ffffff;
        }

        .camera-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 0.84rem;
          font-weight: 600;
          color: #0f172a;
        }

        .btn-close-camera {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          padding: 5px 12px;
          border-radius: 999px;
          font-size: 0.82rem;
          font-weight: 600;
          color: #475569;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-close-camera:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .camera-viewport-box {
          position: relative;
          aspect-ratio: 16 / 10;
          min-height: 400px;
          background: #0f172a;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .camera-error-clean {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 12px;
          background: #ffffff;
          padding: 28px;
          border-radius: 16px;
          max-width: 440px;
          margin: 20px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }

        .camera-error-clean h4 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: #0f172a;
        }

        .camera-error-clean p {
          margin: 0;
          font-size: 0.85rem;
          color: #64748b;
        }

        .video-stream {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .video-stream.mirrored {
          transform: scaleX(-1);
        }

        .camera-top-actions {
          position: absolute;
          top: 14px;
          right: 14px;
          display: flex;
          gap: 8px;
          z-index: 10;
        }

        .btn-camera-ctrl {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #ffffff;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-camera-ctrl:hover {
          background: rgba(15, 23, 42, 0.9);
        }

        .btn-camera-ctrl.active {
          background: #ffffff;
          color: #0f172a;
        }

        .camera-shutter-bar {
          position: absolute;
          bottom: 20px;
          left: 0;
          right: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 24px;
          z-index: 10;
        }

        .main-shutter-btn {
          width: 68px;
          height: 68px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.35);
          border: 3px solid #ffffff;
          padding: 3px;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
          transition: transform 0.15s ease;
        }

        .main-shutter-btn:hover {
          transform: scale(1.05);
        }

        .shutter-core {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: #0f172a;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-timer, .btn-gallery-select {
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #ffffff;
          padding: 8px 14px;
          border-radius: 999px;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-timer:hover, .btn-gallery-select:hover {
          background: rgba(15, 23, 42, 0.95);
        }

        .grid-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .grid-line {
          position: absolute;
          background: rgba(255, 255, 255, 0.22);
        }

        .grid-v-1 { left: 33.33%; top: 0; bottom: 0; width: 1px; }
        .grid-v-2 { left: 66.66%; top: 0; bottom: 0; width: 1px; }
        .grid-h-1 { top: 33.33%; left: 0; right: 0; height: 1px; }
        .grid-h-2 { top: 66.66%; left: 0; right: 0; height: 1px; }

        .reticle-target {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 60px;
          height: 60px;
          border: 1.5px dashed rgba(255, 255, 255, 0.6);
          border-radius: 50%;
        }

        .countdown-display {
          position: absolute;
          font-size: 4.5rem;
          font-weight: 800;
          color: #ffffff;
          text-shadow: 0 2px 14px rgba(0, 0, 0, 0.6);
          z-index: 25;
        }

        .flash-screen {
          position: absolute;
          inset: 0;
          background: #ffffff;
          z-index: 20;
          animation: flashFade 0.2s ease-out forwards;
        }

        @keyframes flashFade {
          0% { opacity: 0.9; }
          100% { opacity: 0; }
        }

        @media (max-width: 640px) {
          .google-search-pill {
            padding: 8px 12px 8px 16px;
          }
          .google-lens-card {
            padding: 24px 16px;
          }
          .presets-cards-grid {
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }
          .preset-card-item {
            padding: 6px 8px;
            gap: 8px;
          }
          .preset-thumb {
            width: 38px;
            height: 38px;
          }
          .camera-viewport-box {
            aspect-ratio: 3 / 4;
            min-height: 320px;
          }
        }
      `}</style>
    </div>
  );
}
