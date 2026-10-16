import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CameraViewfinder from './components/CameraViewfinder';
import AnalysisView from './components/AnalysisView';
import PrivateGallery from './components/PrivateGallery';
import PublicFeed from './components/PublicFeed';
import ApiKeyModal from './components/ApiKeyModal';
import LegalModal from './components/LegalModal';
import StoreModal from './components/StoreModal';
import AdminDashboard from './components/AdminDashboard';
import RewardedAdModal from './components/RewardedAdModal';
import ConsentModal from './components/ConsentModal';
import BannerAd from './components/BannerAd';
import PsychLensLogo from './components/PsychLensLogo';

import { analyzeImagePsychology, getStoredApiKey } from './services/geminiService';
import { creditService } from './services/creditService';
import { publicImageHostService } from './services/publicImageHostService';
import { googlePhotosService } from './services/googlePhotosService';
import { analyticsService } from './services/analyticsService';
import {
  getPrivateVaultItems,
  saveToPrivateVault,
  deleteFromPrivateVault,
  getPublicFeedItems,
  saveToPublicFeed,
  toggleLikePublicItem,
} from './services/storageService';
import { Sparkles, Brain, Shield, Clock, Gift, Camera, ShieldCheck, Globe, Coins } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('lens'); // 'lens' | 'vault' | 'feed'
  const [capturedImage, setCapturedImage] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  // Gallery and Feed Data
  const [vaultItems, setVaultItems] = useState([]);
  const [feedItems, setFeedItems] = useState([]);
  const [isSavedToVault, setIsSavedToVault] = useState(false);
  const [isSharedToFeed, setIsSharedToFeed] = useState(false);

  // Wallet and Quota State
  const [walletStatus, setWalletStatus] = useState(creditService.getAccountStatus());

  // Modals
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isRewardedAdModalOpen, setIsRewardedAdModalOpen] = useState(false);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalInitialTab, setLegalInitialTab] = useState('privacy');

  const openLegalPolicy = (tab = 'privacy') => {
    setLegalInitialTab(tab);
    setIsLegalModalOpen(true);
  };

  // Load initial data
  useEffect(() => {
    refreshWallet();
    loadVault();
    loadFeed();
    analyticsService.trackEvent('app_opened');

    // Auto-open Admin Dashboard if URL contains #admin or ?admin=true
    const checkAdminRoute = () => {
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (hash === '#admin' || search.includes('admin=true') || window.location.pathname === '/admin') {
        setIsAdminModalOpen(true);
      }
    };
    checkAdminRoute();
    window.addEventListener('hashchange', checkAdminRoute);
    return () => window.removeEventListener('hashchange', checkAdminRoute);
  }, []);

  const refreshWallet = () => {
    setWalletStatus(creditService.getAccountStatus());
  };

  const loadVault = async () => {
    try {
      const items = await getPrivateVaultItems();
      setVaultItems(items);
    } catch (err) {
      console.error('Failed to load private vault:', err);
    }
  };

  const loadFeed = () => {
    try {
      const items = getPublicFeedItems();
      setFeedItems(items);
    } catch (err) {
      console.error('Failed to load public feed:', err);
    }
  };

  // Image submission pipeline with quota verification
  const handleImageReady = async (optimizedImg) => {
    // Check if user has daily free quota or purchased credits
    if (!creditService.hasQuotaOrCredits()) {
      const openStore = window.confirm(
        'Daily Free Allowance (3/3) & Credits Exhausted!\n\nWould you like to open the Store to top-up credits or watch a quick sponsor clip for a free credit?'
      );
      if (openStore) {
        setIsStoreModalOpen(true);
      }
      return;
    }

    setCapturedImage(optimizedImg);
    setIsAnalyzing(true);
    setAnalysisError(null);
    setIsSavedToVault(false);
    setIsSharedToFeed(false);

    try {
      // Analyze with Gemini Multimodal
      const result = await analyzeImagePsychology(optimizedImg.base64, optimizedImg.mimeType);

      // Deduct credit (Free allowance consumed first)
      creditService.consumeCredit('Visual Psychology Analysis');
      refreshWallet();

      setAnalysisResult(result);
      analyticsService.trackEvent('analysis_completed', { mood: result.mood?.primary });
    } catch (err) {
      console.error('Analysis failed:', err);
      setAnalysisError(err.message || 'Unable to complete visual analysis.');
      analyticsService.trackEvent('analysis_error', { error: err.message });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Save to private IndexedDB & Google Photos (for paid users)
  const handleSaveToVault = async () => {
    if (!capturedImage || !analysisResult) return;
    try {
      await saveToPrivateVault({
        dataUrl: capturedImage.dataUrl,
        analysis: analysisResult,
        title: analysisResult.mood?.primary || 'Moment of Reflection',
      });

      // If user has connected Google Photos or is subscribed, sync to Google Photos
      if (googlePhotosService.isConnected() || walletStatus.isSubscribed) {
        await googlePhotosService.uploadToPsychLensAlbum(
          capturedImage.dataUrl,
          analysisResult.mood?.primary || 'PsychLens Vault'
        );
      }

      setIsSavedToVault(true);
      await loadVault();
    } catch (err) {
      alert('Failed to save to private vault: ' + err.message);
    }
  };

  // Request Consent before posting to community feed
  const handleRequestPostToFeed = () => {
    setIsConsentModalOpen(true);
  };

  // Publish to ephemeral public host & local community stream upon consent
  const handlePublishConfirmed = async () => {
    if (!capturedImage || !analysisResult) return;

    try {
      let finalPublicUrl = capturedImage.dataUrl;
      // Attempt ephemeral multi-host upload (ImgBB 7d auto-expire -> Litterbox 72h)
      try {
        const hosted = await publicImageHostService.uploadImageTemporary(capturedImage.dataUrl);
        finalPublicUrl = hosted.url;
      } catch (hostErr) {
        console.warn('Temporary host fallback to dataUrl:', hostErr);
      }

      saveToPublicFeed({
        imageUrl: finalPublicUrl,
        analysis: analysisResult,
        title: analysisResult.mood?.primary || 'Visual Reflection',
        author: 'Anonymous',
      });

      setIsSharedToFeed(true);
      loadFeed();
      analyticsService.trackEvent('public_feed_posted');
    } catch (err) {
      alert('Failed to publish to community feed: ' + err.message);
    }
  };

  // Delete from private vault
  const handleDeleteVaultItem = async (id) => {
    try {
      await deleteFromPrivateVault(id);
      await loadVault();
    } catch (err) {
      alert('Error deleting item: ' + err.message);
    }
  };

  // Toggle like in public feed
  const handleToggleLike = (id) => {
    const updated = toggleLikePublicItem(id);
    setFeedItems(updated);
  };

  // Reset to viewfinder
  const handleReset = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
    setAnalysisError(null);
    setIsSavedToVault(false);
    setIsSharedToFeed(false);
  };

  return (
    <div className="app-root">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'vault') loadVault();
          if (tab === 'feed') loadFeed();
        }}
        onOpenStore={() => setIsStoreModalOpen(true)}
        onOpenApiKey={() => setIsApiKeyModalOpen(true)}
        onOpenLegal={() => setIsLegalModalOpen(true)}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        vaultCount={vaultItems.length}
        walletStatus={walletStatus}
      />

      {/* Main View Area */}
      <main className="main-content container">
        {activeTab === 'lens' && (
          <div className="tab-pane">
            {/* Google Images-Style Clean Brand Header when not analyzing */}
            {!capturedImage && !isAnalyzing && (
              <div className="google-hero text-center">
                <div className="google-brand-title">
                  <PsychLensLogo size={48} showWordmark={true} wordmarkSize="2.3rem" />
                </div>
                <p className="google-brand-sub">
                  Visual Emotion & Micro-Expression Intelligence
                </p>
                <div className="google-badge-row">
                  <span className="google-pill-badge">
                    <Sparkles size={13} color="#4f46e5" /> Multimodal Perception
                  </span>
                  <button
                    onClick={() => setIsRewardedAdModalOpen(true)}
                    className="google-pill-btn"
                  >
                    🎁 Free Credit (+1)
                  </button>
                </div>
              </div>
            )}

            {/* Analyzing Loading Shimmer View */}
            {isAnalyzing && (
              <div className="analyzing-state white-card">
                <div className="pulse-orb" />
                <div className="analyzing-text-wrap">
                  <h2 className="editorial-title" style={{ fontSize: '1.4rem', marginBottom: '8px' }}>
                    Analyzing Visual Psychology...
                  </h2>
                  <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '18px' }}>
                    Screening PG-13 safety, decoding gaze, posture, and subconscious composition cues
                  </p>
                  <div className="loading-steps">
                    <span className="step-tag">📷 EXIF Cleaned</span>
                    <span className="step-tag">⚡ WebP Downsampled</span>
                    <span className="step-tag">🛡️ Safety Verified</span>
                    <span className="step-tag">🧠 Decoding Emotion</span>
                  </div>
                </div>
              </div>
            )}

            {/* Results or Viewfinder */}
            {!isAnalyzing && analysisResult && capturedImage ? (
              <AnalysisView
                imageObject={capturedImage}
                analysis={analysisResult}
                onReset={handleReset}
                onSaveToVault={handleSaveToVault}
                onShareToFeed={handleRequestPostToFeed}
                isSavedToVault={isSavedToVault}
                isSharedToFeed={isSharedToFeed}
              />
            ) : !isAnalyzing ? (
              <CameraViewfinder onImageReady={handleImageReady} isProcessing={isAnalyzing} />
            ) : null}

            {/* Error Message if any */}
            {analysisError && (
              <div className="error-card white-card">
                <p style={{ fontSize: '0.9rem', color: '#b91c1c', fontWeight: 500 }}>{analysisError}</p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button className="btn-outline" onClick={handleReset}>
                    Try Another Photo
                  </button>
                  <button className="btn-primary" onClick={() => setIsStoreModalOpen(true)}>
                    Check Credits
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'vault' && (
          <div className="tab-pane">
            <PrivateGallery
              items={vaultItems}
              onDeleteItem={handleDeleteVaultItem}
              onSelectForView={(item) => {
                setCapturedImage({ dataUrl: item.imageUrl || item.dataUrl, sizeKb: 'Local' });
                setAnalysisResult(item.analysis);
                setIsSavedToVault(true);
                setActiveTab('lens');
              }}
            />
          </div>
        )}

        {activeTab === 'feed' && (
          <div className="tab-pane">
            <PublicFeed items={feedItems} onToggleLike={handleToggleLike} />
          </div>
        )}

        {/* Persistent Banner Ad for Free Tier Users (Hidden for PRO subscribers) */}
        <BannerAd
          isSubscribed={walletStatus.isSubscribed}
          onUpgradeClick={() => setIsStoreModalOpen(true)}
        />
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="container footer-inner">
          <div className="footer-left">
            <PsychLensLogo size={20} showWordmark={true} wordmarkSize="0.94rem" />
            <span className="footer-sep">•</span>
            <span>Licensed product of <a href="https://techfiyr.com" target="_blank" rel="noopener noreferrer" style={{ color: '#0f172a', fontWeight: 600, textDecoration: 'underline' }}>TechFiyr</a></span>
          </div>
          <div className="footer-right">
            <button className="footer-link" onClick={() => openLegalPolicy('privacy')}>
              Privacy Policy
            </button>
            <span className="footer-sep">•</span>
            <button className="footer-link" onClick={() => openLegalPolicy('content')}>
              Content Policy
            </button>
            <span className="footer-sep">•</span>
            <button className="footer-link" onClick={() => openLegalPolicy('license')}>
              License
            </button>
            <span className="footer-sep">•</span>
            <button className="footer-link" onClick={() => openLegalPolicy('content-use')}>
              Content Use Policy
            </button>
            <span className="footer-sep">•</span>
            <button className="footer-link" onClick={() => openLegalPolicy('safety-usage')}>
              Safety & Usage Policy
            </button>
            <span className="footer-sep">•</span>
            <button className="footer-link" onClick={() => openLegalPolicy('ai-disclaimer')}>
              AI Disclaimer & Guidelines
            </button>
          </div>
        </div>
      </footer>

      {/* Mobile PWA Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
        <button
          className={`mobile-nav-item ${activeTab === 'lens' ? 'active' : ''}`}
          onClick={() => setActiveTab('lens')}
        >
          <Camera size={20} />
          <span>Lens</span>
        </button>

        <button
          className={`mobile-nav-item ${activeTab === 'vault' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('vault');
            loadVault();
          }}
        >
          <ShieldCheck size={20} />
          <span>Vault</span>
          {vaultItems.length > 0 && <span className="mobile-nav-badge">{vaultItems.length}</span>}
        </button>

        <button
          className={`mobile-nav-item ${activeTab === 'feed' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('feed');
            loadFeed();
          }}
        >
          <Globe size={20} />
          <span>Feed</span>
        </button>

        <button
          className="mobile-nav-item"
          onClick={() => setIsStoreModalOpen(true)}
        >
          <Coins size={20} color="#d97706" />
          <span>Store</span>
        </button>
      </nav>

      {/* Modals & Dialogs */}
      <StoreModal
        isOpen={isStoreModalOpen}
        onClose={() => {
          setIsStoreModalOpen(false);
          refreshWallet();
        }}
        onWalletUpdated={refreshWallet}
        onOpenBYOK={() => {
          setIsStoreModalOpen(false);
          setIsApiKeyModalOpen(true);
        }}
      />

      <AdminDashboard
        isOpen={isAdminModalOpen}
        onClose={() => {
          setIsAdminModalOpen(false);
          refreshWallet();
        }}
      />

      <RewardedAdModal
        isOpen={isRewardedAdModalOpen}
        onClose={() => setIsRewardedAdModalOpen(false)}
        onRewardClaimed={() => refreshWallet()}
      />

      <ConsentModal
        isOpen={isConsentModalOpen}
        onClose={() => setIsConsentModalOpen(false)}
        onConfirm={handlePublishConfirmed}
        isPaidUser={walletStatus.isSubscribed}
      />

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => {
          setIsApiKeyModalOpen(false);
          refreshWallet();
        }}
        onKeySaved={refreshWallet}
      />

      <LegalModal
        isOpen={isLegalModalOpen}
        initialTab={legalInitialTab}
        onClose={() => setIsLegalModalOpen(false)}
      />

      <style>{`
        .app-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background-color: var(--bg-app);
          color: var(--text-primary);
        }
        .main-content {
          flex: 1;
          padding-top: 24px;
          padding-bottom: 40px;
        }
        .text-center {
          text-align: center;
        }
        .google-hero {
          margin: 12px auto 28px auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }
        .google-brand-title {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-family: var(--font-display);
          font-size: 2.3rem;
          font-weight: 800;
          letter-spacing: -0.035em;
          color: #0f172a;
        }
        .brand-icon {
          font-size: 2.1rem;
        }
        .google-brand-sub {
          font-size: 0.94rem;
          color: #64748b;
          font-weight: 500;
          margin: 0;
        }
        .google-badge-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 6px;
        }
        .google-pill-badge {
          font-size: 0.74rem;
          font-weight: 600;
          background: #f1f5f9;
          color: #334155;
          padding: 4px 12px;
          border-radius: 999px;
          border: 1px solid #e2e8f0;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .google-pill-btn {
          font-size: 0.74rem;
          font-weight: 600;
          background: #ecfdf5;
          color: #047857;
          padding: 4px 12px;
          border-radius: 999px;
          border: 1px solid #a7f3d0;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .google-pill-btn:hover {
          background: #d1fae5;
          transform: translateY(-1px);
        }
        .analyzing-state {
          padding: 50px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          max-width: 540px;
          margin: 40px auto;
        }
        .pulse-orb {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #0f172a;
          box-shadow: 0 0 0 rgba(15, 23, 42, 0.4);
          animation: pulseShadow 1.5s infinite;
          margin-bottom: 20px;
        }
        @keyframes pulseShadow {
          0% { box-shadow: 0 0 0 0 rgba(15, 23, 42, 0.3); }
          70% { box-shadow: 0 0 0 20px rgba(15, 23, 42, 0); }
          100% { box-shadow: 0 0 0 0 rgba(15, 23, 42, 0); }
        }
        .loading-steps {
          display: flex;
          gap: 8px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .step-tag {
          font-size: 0.76rem;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          padding: 4px 10px;
          border-radius: var(--radius-full);
          color: #334155;
          font-weight: 500;
        }
        .error-card {
          margin: 20px auto 0 auto;
          max-width: 500px;
          padding: 20px;
          border-color: #fecdd3;
          background: #fff1f2;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .app-footer {
          border-top: 1px solid #e2e8f0;
          background: #ffffff;
          padding: 16px 0;
          font-size: 0.82rem;
          color: #64748b;
        }
        .footer-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .footer-left, .footer-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .footer-sep {
          color: #cbd5e1;
        }
        .footer-link {
          color: #64748b;
          font-size: 0.82rem;
          transition: var(--transition);
        }
        .footer-link:hover {
          color: #0f172a;
          text-decoration: underline;
        }
        @media (max-width: 640px) {
          .google-brand-title {
            font-size: 1.8rem;
          }
          .footer-inner {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}
