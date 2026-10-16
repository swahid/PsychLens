import React, { useState, useEffect } from 'react';
import { Globe, Heart, Clock, Download, Eye, Sparkles, Volume2, ShieldAlert, UserX, Search } from 'lucide-react';
import { getDaysRemaining } from '../services/storageService';
import { generateAndDownloadCard } from '../services/cardGenerator';
import { speechService } from '../services/speechService';
import { adminService } from '../services/adminService';

const STORAGE_BLOCKED_AUTHORS = 'psychlens_blocked_authors';
const STORAGE_IMPRESSIONS = 'psychlens_view_impressions';

export default function PublicFeed({ items = [], onToggleLike }) {
  const [modalItem, setModalItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [blockedAuthors, setBlockedAuthors] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_BLOCKED_AUTHORS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [impressions, setImpressions] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_IMPRESSIONS);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const recordImpression = (itemId) => {
    setImpressions((prev) => {
      const current = prev[itemId] || 24; // realistic starter count
      const updated = { ...prev, [itemId]: current + 1 };
      localStorage.setItem(STORAGE_IMPRESSIONS, JSON.stringify(updated));
      return updated;
    });
  };

  const handleOpenItem = (item) => {
    recordImpression(item.id);
    setModalItem(item);
  };

  const handleDownload = (e, item) => {
    e.stopPropagation();
    generateAndDownloadCard(item.imageUrl, item.analysis, item.title);
  };

  const handleLike = (e, id) => {
    e.stopPropagation();
    onToggleLike(id);
    if (modalItem?.id === id) {
      setModalItem((prev) => ({
        ...prev,
        userLiked: !prev.userLiked,
        likes: !prev.userLiked ? prev.likes + 1 : prev.likes - 1,
      }));
    }
  };

  const handleBlockAuthor = (e, authorName = 'Anonymous') => {
    e.stopPropagation();
    const confirmed = window.confirm(
      `Block all posts from "${authorName}"? You will no longer see content from this user.`
    );
    if (!confirmed) return;

    const updated = [...blockedAuthors, authorName];
    setBlockedAuthors(updated);
    localStorage.setItem(STORAGE_BLOCKED_AUTHORS, JSON.stringify(updated));
    if (modalItem?.author === authorName) {
      setModalItem(null);
    }
  };

  const handleReport = (e, item) => {
    e.stopPropagation();
    const reason = prompt('Please specify reason for reporting (PG-13 / Safety policy):');
    if (reason && reason.trim()) {
      adminService.reportPublicItem(item.id, reason.trim(), item.author || 'Anonymous');
      alert('Thank you. Content reported to Techfiyr moderation team for immediate review.');
    }
  };

  const handleSpeak = (text) => {
    speechService.speak(text);
  };

  // Filter items by blocked authors & search query
  const filteredItems = items.filter((item) => {
    const author = item.author || 'Anonymous';
    if (blockedAuthors.includes(author)) return false;

    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const moodPrimary = item.analysis?.mood?.primary?.toLowerCase() || '';
    const overview = item.analysis?.overview?.toLowerCase() || '';
    const subtext = item.analysis?.psychologicalSubtext?.toLowerCase() || '';
    const title = item.title?.toLowerCase() || '';

    return (
      moodPrimary.includes(query) ||
      overview.includes(query) ||
      subtext.includes(query) ||
      title.includes(query)
    );
  });

  return (
    <div className="feed-container">
      {/* Header Banner */}
      <div className="feed-header white-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
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
                Community Stream
              </span>
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
                7-Day Ephemeral Node
              </span>
            </div>
            <h2 className="editorial-title" style={{ fontSize: '1.5rem', marginBottom: '4px' }}>
              Public Visual Psychology Stream
            </h2>
            <p style={{ fontSize: '0.86rem', color: '#64748b', maxWidth: '640px', lineHeight: 1.5 }}>
              Opt-in shared moments decoded through emotional, micro-expression, and chromatic lenses.
              Ephemeral public host deletes images within 7 days or less.
            </p>
          </div>

          {/* Search Box */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '999px',
              padding: '8px 16px',
              minWidth: '260px'
            }}
          >
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder="Search moods, emotions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '0.85rem',
                color: '#0f172a',
                width: '100%'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ fontSize: '0.75rem', color: '#94a3b8' }}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="feed-grid">
        {filteredItems.map((item) => {
          const daysLeft = getDaysRemaining(item.expiresAt);
          const viewCount = impressions[item.id] || 24;

          return (
            <div
              key={item.id}
              className="feed-card white-card"
              onClick={() => handleOpenItem(item)}
            >
              <div className="card-media-wrap">
                <img src={item.imageUrl} alt={item.title} className="card-media" />
                <div className="badge-expiry-overlay">
                  <Clock size={11} />
                  <span>{daysLeft}</span>
                </div>

                <div className="badge-views-overlay">
                  <Eye size={11} />
                  <span>{viewCount} views</span>
                </div>

                <button
                  className={`btn-like ${item.userLiked ? 'liked' : ''}`}
                  onClick={(e) => handleLike(e, item.id)}
                  title="Resonate with this reflection"
                >
                  <Heart
                    size={15}
                    fill={item.userLiked ? '#e11d48' : 'none'}
                    color={item.userLiked ? '#e11d48' : '#fff'}
                  />
                  <span>{item.likes}</span>
                </button>
              </div>

              <div className="card-content">
                <div className="mood-pill-row">
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: '#f1f5f9',
                      color: '#0f172a',
                      padding: '2px 8px',
                      borderRadius: '6px'
                    }}
                  >
                    {item.analysis?.mood?.primary}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Tension: {item.analysis?.mood?.tensionScore}/10
                  </span>
                </div>

                <h3 className="card-title">{item.title || 'Visual Introspection'}</h3>
                <p className="card-overview">{item.analysis?.overview}</p>

                <div className="card-actions-bar">
                  <button className="action-btn-text" onClick={() => handleOpenItem(item)}>
                    <Eye size={13} /> Full Reading
                  </button>
                  <button className="action-btn-text" onClick={(e) => handleDownload(e, item)}>
                    <Download size={13} /> Card
                  </button>

                  <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                    <button
                      className="action-btn-icon"
                      onClick={(e) => handleReport(e, item)}
                      title="Report content (PG-13 / Safety)"
                    >
                      <ShieldAlert size={14} color="#94a3b8" />
                    </button>
                    <button
                      className="action-btn-icon"
                      onClick={(e) => handleBlockAuthor(e, item.author)}
                      title="Block author"
                    >
                      <UserX size={14} color="#94a3b8" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {modalItem && (
        <div className="modal-overlay" onClick={() => setModalItem(null)}>
          <div
            className="modal-container"
            style={{ maxWidth: '820px', padding: 0, overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 1.2fr' }}>
              <div style={{ position: 'relative', background: '#090d16', minHeight: '340px' }}>
                <img
                  src={modalItem.imageUrl}
                  alt={modalItem.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              <div style={{ padding: '24px', overflowY: 'auto', maxHeight: '80vh' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: '#f1f5f9',
                        color: '#0f172a',
                        padding: '2px 8px',
                        borderRadius: '6px'
                      }}
                    >
                      {modalItem.analysis?.mood?.primary}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      👁️ {impressions[modalItem.id] || 25} impressions
                    </span>
                  </div>

                  <button
                    onClick={() => setModalItem(null)}
                    style={{ color: '#94a3b8', fontSize: '1.2rem', padding: '4px' }}
                  >
                    ✕
                  </button>
                </div>

                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  {modalItem.title}
                </h2>
                <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5, marginBottom: '16px' }}>
                  {modalItem.analysis?.overview}
                </p>

                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                  Behavioral Subtext & Body Language
                </h4>
                <p style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.55, marginBottom: '14px' }}>
                  {modalItem.analysis?.psychologicalSubtext}
                </p>

                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                  Artistic & Chromatic Expression
                </h4>
                <p style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.55, marginBottom: '16px' }}>
                  {modalItem.analysis?.artisticPsychology}
                </p>

                {modalItem.analysis?.reflectionPrompt && (
                  <div
                    style={{
                      background: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      borderRadius: '8px',
                      padding: '12px 14px',
                      marginBottom: '18px',
                      fontSize: '0.85rem',
                      fontStyle: 'italic',
                      color: '#166534'
                    }}
                  >
                    💭 "{modalItem.analysis.reflectionPrompt}"
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button
                    className="btn-outline"
                    onClick={() =>
                      handleSpeak(
                        `${modalItem.analysis?.mood?.primary}. ${modalItem.analysis?.psychologicalSubtext}`
                      )
                    }
                  >
                    <Volume2 size={15} /> Listen
                  </button>
                  <button
                    className="btn-primary"
                    onClick={(e) => handleDownload(e, modalItem)}
                  >
                    <Download size={15} /> Download Card
                  </button>

                  <button
                    onClick={(e) => handleReport(e, modalItem)}
                    style={{
                      marginLeft: 'auto',
                      fontSize: '0.76rem',
                      color: '#94a3b8',
                      background: 'none',
                      border: 'none',
                      textDecoration: 'underline'
                    }}
                  >
                    Report / Block
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .feed-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .feed-header {
          padding: 24px;
        }
        .feed-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 24px;
        }
        .feed-card {
          overflow: hidden;
          cursor: pointer;
          display: flex;
          flex-direction: column;
        }
        .card-media-wrap {
          position: relative;
          height: 230px;
          overflow: hidden;
          background: #090d16;
        }
        .card-media {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        .feed-card:hover .card-media {
          transform: scale(1.03);
        }
        .badge-expiry-overlay {
          position: absolute;
          top: 12px;
          left: 12px;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(6px);
          color: #ffffff;
          padding: 3px 8px;
          border-radius: 999px;
          font-size: 0.72rem;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .badge-views-overlay {
          position: absolute;
          bottom: 12px;
          left: 12px;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(6px);
          color: #ffffff;
          padding: 3px 8px;
          border-radius: 999px;
          font-size: 0.72rem;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .btn-like {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(6px);
          color: #ffffff;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 0.78rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: transform 0.15s ease;
        }
        .btn-like:hover {
          transform: scale(1.08);
        }
        .card-content {
          padding: 16px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .mood-pill-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        .card-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 6px;
        }
        .card-overview {
          font-size: 0.85rem;
          color: #475569;
          line-height: 1.5;
          margin-bottom: 14px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .card-actions-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: auto;
          padding-top: 10px;
          border-top: 1px solid #f1f5f9;
        }
        .action-btn-text {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.8rem;
          font-weight: 600;
          color: #0f172a;
          transition: var(--transition);
        }
        .action-btn-text:hover {
          color: #4f46e5;
        }
        .action-btn-icon {
          padding: 4px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition);
        }
        .action-btn-icon:hover {
          background: #f1f5f9;
        }
      `}</style>
    </div>
  );
}
