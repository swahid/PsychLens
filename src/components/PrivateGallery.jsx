import React, { useState } from 'react';
import { ShieldCheck, Search, Trash2, Eye, Download, Lock, Volume2, Cloud, CheckCircle } from 'lucide-react';
import { generateAndDownloadCard } from '../services/cardGenerator';
import { speechService } from '../services/speechService';
import { googlePhotosService } from '../services/googlePhotosService';

export default function PrivateGallery({ items = [], onDeleteItem, onSelectForView }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMoodFilter, setSelectedMoodFilter] = useState('ALL');
  const [modalItem, setModalItem] = useState(null);
  const [googlePhotosSynced, setGooglePhotosSynced] = useState(googlePhotosService.isConnected());

  // Extract unique moods for filtering
  const allMoods = Array.from(
    new Set(items.map((it) => it.analysis?.mood?.primary).filter(Boolean))
  );

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      (item.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.analysis?.overview || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.analysis?.mood?.primary || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMood =
      selectedMoodFilter === 'ALL' || item.analysis?.mood?.primary === selectedMoodFilter;

    return matchesSearch && matchesMood;
  });

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (window.confirm('Delete this psychological analysis from your local device vault?')) {
      onDeleteItem(id);
      if (modalItem?.id === id) setModalItem(null);
    }
  };

  const handleDownload = (e, item) => {
    e.stopPropagation();
    generateAndDownloadCard(item.imageUrl || item.dataUrl, item.analysis);
  };

  const handleSpeak = (text) => {
    speechService.speak(text);
  };

  const handleToggleGooglePhotos = async () => {
    if (googlePhotosSynced) {
      googlePhotosService.disconnect();
      setGooglePhotosSynced(false);
    } else {
      await googlePhotosService.connectGooglePhotos();
      setGooglePhotosSynced(true);
    }
  };

  return (
    <div className="gallery-container">
      {/* Header Banner */}
      <div className="gallery-header white-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
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
                Local Private Vault
              </span>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  background: '#ecfdf5',
                  color: '#047857',
                  padding: '3px 8px',
                  borderRadius: '6px'
                }}
              >
                IndexedDB Encrypted • Zero Server Exposure
              </span>
            </div>
            <h2 className="editorial-title" style={{ fontSize: '1.5rem', marginBottom: '4px' }}>
              Your Private Psychological Vault
            </h2>
            <p style={{ fontSize: '0.86rem', color: '#64748b', maxWidth: '640px', lineHeight: 1.5 }}>
              All image analyses here are stored strictly inside your browser cache. Zero server upload.
            </p>
          </div>

          {/* Google Photos Cloud Backup Card */}
          <button
            onClick={handleToggleGooglePhotos}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              borderRadius: '10px',
              background: googlePhotosSynced ? '#f0fdf4' : '#f8fafc',
              border: googlePhotosSynced ? '1px solid #bbf7d0' : '1px solid #cbd5e1',
              color: googlePhotosSynced ? '#166534' : '#334155',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Cloud size={16} color={googlePhotosSynced ? '#166534' : '#64748b'} />
            <span>{googlePhotosSynced ? 'Google Photos Synced (Vault Album)' : 'Connect Google Photos'}</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="filter-bar">
          <div className="search-wrap">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search by emotion, thoughts, or vibe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="mood-pills">
            <button
              className={`pill-btn ${selectedMoodFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setSelectedMoodFilter('ALL')}
            >
              All Moods ({items.length})
            </button>
            {allMoods.map((m) => (
              <button
                key={m}
                className={`pill-btn ${selectedMoodFilter === m ? 'active' : ''}`}
                onClick={() => setSelectedMoodFilter(m)}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid List */}
      {filteredItems.length === 0 ? (
        <div className="empty-vault white-card">
          <div className="empty-icon-wrap">
            <ShieldCheck size={36} color="#0f172a" />
          </div>
          <h3 className="editorial-title" style={{ fontSize: '1.15rem', marginTop: '12px', marginBottom: '6px' }}>
            Vault is Empty
          </h3>
          <p>
            Capture moments using the camera viewfinder or upload an image to save your first private psychological
            decoding.
          </p>
        </div>
      ) : (
        <div className="vault-grid">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="vault-item-card white-card"
              onClick={() => setModalItem(item)}
            >
              <div className="item-thumb-wrapper">
                <img src={item.imageUrl || item.dataUrl} alt={item.title} className="item-thumb" />
                <div className="item-date-overlay">
                  <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                </div>
                <button
                  className="delete-card-btn"
                  onClick={(e) => handleDelete(e, item.id)}
                  title="Delete from local vault"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="item-body">
                <div className="item-mood-row">
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
                  <span className="tension-indicator">
                    Tension {item.analysis?.mood?.tensionScore}/10
                  </span>
                </div>

                <p className="item-overview">{item.analysis?.overview}</p>

                <div className="item-footer">
                  <button className="item-action-link" onClick={() => setModalItem(item)}>
                    <Eye size={13} /> View Reading
                  </button>
                  <button className="item-action-link" onClick={(e) => handleDownload(e, item)}>
                    <Download size={13} /> Card
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
                  src={modalItem.imageUrl || modalItem.dataUrl}
                  alt={modalItem.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              <div style={{ padding: '24px', overflowY: 'auto', maxHeight: '80vh' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
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

                  <button
                    onClick={() => setModalItem(null)}
                    style={{ color: '#94a3b8', fontSize: '1.2rem', padding: '4px' }}
                  >
                    ✕
                  </button>
                </div>

                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                  {modalItem.title || 'Private Reflection'}
                </h2>
                <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5, marginBottom: '16px' }}>
                  {modalItem.analysis?.overview}
                </p>

                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                  Behavioral Subtext & Micro-Expressions
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
                    onClick={(e) => handleDelete(e, modalItem.id)}
                    style={{
                      marginLeft: 'auto',
                      fontSize: '0.78rem',
                      color: '#e11d48',
                      background: 'none',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .gallery-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .gallery-header {
          padding: 24px;
        }
        .filter-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }
        .search-wrap {
          position: relative;
          min-width: 260px;
          flex: 1;
          max-width: 380px;
        }
        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }
        .search-input {
          width: 100%;
          padding: 8px 12px 8px 36px;
          border-radius: var(--radius-full);
          border: 1px solid #cbd5e1;
          background: #f8fafc;
          font-size: 0.85rem;
          color: #0f172a;
          outline: none;
        }
        .search-input:focus {
          border-color: #0f172a;
          background: #ffffff;
        }
        .mood-pills {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 4px;
        }
        .pill-btn {
          padding: 6px 14px;
          border-radius: var(--radius-full);
          font-size: 0.78rem;
          font-weight: 600;
          color: #475569;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          white-space: nowrap;
          transition: var(--transition);
        }
        .pill-btn:hover {
          color: #0f172a;
          border-color: #cbd5e1;
        }
        .pill-btn.active {
          background: #0f172a;
          border-color: #0f172a;
          color: #ffffff;
        }
        .empty-vault {
          padding: 60px 24px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .empty-icon-wrap {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .empty-vault p {
          max-width: 440px;
          font-size: 0.88rem;
          color: #64748b;
          line-height: 1.5;
        }
        .vault-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }
        .vault-item-card {
          overflow: hidden;
          cursor: pointer;
          display: flex;
          flex-direction: column;
        }
        .item-thumb-wrapper {
          position: relative;
          height: 200px;
          width: 100%;
          overflow: hidden;
          background: #090d16;
        }
        .item-thumb {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        .vault-item-card:hover .item-thumb {
          transform: scale(1.03);
        }
        .item-date-overlay {
          position: absolute;
          top: 10px;
          left: 10px;
          padding: 3px 8px;
          border-radius: var(--radius-full);
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(6px);
          font-size: 0.72rem;
          color: #ffffff;
        }
        .delete-card-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(6px);
          color: #fca5a5;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition);
        }
        .delete-card-btn:hover {
          background: #ef4444;
          color: #ffffff;
        }
        .item-body {
          padding: 16px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .item-mood-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .tension-indicator {
          font-size: 0.75rem;
          color: #e11d48;
          font-weight: 600;
        }
        .item-overview {
          font-size: 0.84rem;
          color: #475569;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin-bottom: 14px;
          flex: 1;
        }
        .item-footer {
          display: flex;
          justify-content: space-between;
          border-top: 1px solid #f1f5f9;
          padding-top: 10px;
        }
        .item-action-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.8rem;
          font-weight: 600;
          color: #0f172a;
          transition: var(--transition);
        }
        .item-action-link:hover {
          color: #4f46e5;
        }
      `}</style>
    </div>
  );
}
