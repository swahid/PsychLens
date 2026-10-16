import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { geminiKeyPool } from '../services/geminiKeyPoolService';
import { analyticsService } from '../services/analyticsService';
import { creditService } from '../services/creditService';

export default function AdminDashboard({ isOpen, onClose }) {
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('keys'); // 'keys' | 'pricing' | 'users' | 'ugc' | 'promos' | 'analytics'
  const [pinError, setPinError] = useState('');

  // Tab Data States
  const [keyStatuses, setKeyStatuses] = useState([]);
  const [newKeyInput, setNewKeyInput] = useState('');
  const [pricing, setPricing] = useState(adminService.getPricing());
  const [pricingSaved, setPricingSaved] = useState(false);
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [reports, setReports] = useState([]);
  const [promos, setPromos] = useState([]);
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoCredits, setNewPromoCredits] = useState(25);
  const [giveawayCredits, setGiveawayCredits] = useState(15);
  const [giveawaySuccess, setGiveawaySuccess] = useState(false);
  const [metrics, setMetrics] = useState(analyticsService.getSummaryMetrics());
  const [recentEvents, setRecentEvents] = useState([]);
  const [gaMeasurementId, setGaMeasurementId] = useState(analyticsService.getMeasurementId());

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    }
  }, [isAuthenticated, activeTab]);

  const refreshData = () => {
    setKeyStatuses(geminiKeyPool.getAllKeysStatus());
    setPricing(adminService.getPricing());
    setUsers(adminService.getUserAccounts());
    setReports(adminService.getUGCReports());
    setPromos(adminService.getPromos());
    setMetrics(analyticsService.getSummaryMetrics());
    setRecentEvents(analyticsService.getRecentEvents());
  };

  if (!isOpen) return null;

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (adminService.checkPin(pin)) {
      setIsAuthenticated(true);
      setPinError('');
    } else {
      setPinError('Invalid Admin PIN. (Check your admin_key in .env or enter xxxxxx)');
    }
  };

  const handleSavePricing = (e) => {
    e.preventDefault();
    adminService.savePricing(pricing);
    setPricingSaved(true);
    setTimeout(() => setPricingSaved(false), 2000);
  };

  const handleAdjustCredits = (userId, amount) => {
    const updated = adminService.adjustUserCredits(userId, amount);
    setUsers(updated);
  };

  const handleToggleUserBan = (userId, currentStatus) => {
    const nextStatus = currentStatus === 'banned' ? 'active' : 'banned';
    const updated = adminService.updateUserStatus(userId, nextStatus);
    setUsers(updated);
  };

  const handleResolveUGC = (reportId, action) => {
    const updated = adminService.resolveReport(reportId, action);
    setReports(updated);
  };

  const handleAddPromo = (e) => {
    e.preventDefault();
    if (!newPromoCode.trim()) return;
    const updated = adminService.addPromoCode(newPromoCode, newPromoCredits);
    setPromos(updated);
    setNewPromoCode('');
  };

  const handleCommunityGiveaway = () => {
    creditService.addCredits(giveawayCredits, 'Special Event Community Giveaway');
    setGiveawaySuccess(true);
    refreshData();
    setTimeout(() => setGiveawaySuccess(false), 2500);
  };

  const handleSaveGA = (e) => {
    e.preventDefault();
    analyticsService.setMeasurementId(gaMeasurementId);
    alert('Google Analytics Measurement ID updated.');
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal-container"
        style={{
          maxWidth: '920px',
          width: '95vw',
          maxHeight: '90vh',
          padding: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Admin Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #e2e8f0',
            background: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  background: '#0f172a',
                  color: '#ffffff',
                  padding: '2px 8px',
                  borderRadius: '6px'
                }}
              >
                <a href="https://techfiyr.com" target="_blank" rel="noopener noreferrer" style={{ color: '#ffffff', textDecoration: 'none' }}>
                  Techfiyr Console ↗
                </a>
              </span>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Operations & Telemetry</span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
              PsychLens Admin Operations Hub
            </h2>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '0.85rem',
              color: '#475569',
              background: '#f8fafc'
            }}
          >
            Exit Dashboard ✕
          </button>
        </div>

        {/* PIN Authentication Gate */}
        {!isAuthenticated ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', maxWidth: '400px', margin: '0 auto' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                fontSize: '1.5rem'
              }}
            >
              🔒
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
              <a href="https://techfiyr.com" target="_blank" rel="noopener noreferrer" style={{ color: '#0f172a', textDecoration: 'underline' }}>TechFiyr</a> Operator Access
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '24px' }}>
              Enter administrator PIN to manage API key pools, dynamic pricing, and UGC moderation.
            </p>

            <form onSubmit={handlePinSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="password"
                placeholder="Enter PIN (techfiyr2026)"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  textAlign: 'center',
                  fontSize: '1rem',
                  letterSpacing: '0.2em'
                }}
                autoFocus
              />
              {pinError && <p style={{ fontSize: '0.8rem', color: '#e11d48' }}>{pinError}</p>}
              <button type="submit" className="btn-primary" style={{ padding: '12px' }}>
                Unlock Dashboard
              </button>
            </form>
          </div>
        ) : (
          <div className="admin-layout-flex" style={{ display: 'flex', flex: 1, minHeight: 0 }}>
            {/* Sidebar Navigation */}
            <div
              className="admin-sidebar-nav"
              style={{
                width: '210px',
                borderRight: '1px solid #e2e8f0',
                background: '#f8fafc',
                padding: '16px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                flexShrink: 0
              }}
            >
              {[
                { id: 'keys', label: '🔑 API Key Pool', desc: 'Fallback & Quotas' },
                { id: 'pricing', label: '💳 Pricing & Tiers', desc: 'RevenueCat Models' },
                { id: 'users', label: '👥 User Accounts', desc: 'Credits & Bans' },
                { id: 'ugc', label: '🛡️ UGC Moderation', desc: 'Safety Reports' },
                { id: 'promos', label: '🎁 Promos & Events', desc: 'Giveaways' },
                { id: 'analytics', label: '📈 GA4 Telemetry', desc: 'Behavior & Funnels' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    textAlign: 'left',
                    background: activeTab === tab.id ? '#ffffff' : 'transparent',
                    border: activeTab === tab.id ? '1px solid #e2e8f0' : '1px solid transparent',
                    boxShadow: activeTab === tab.id ? '0 1px 3px rgba(0,0,0,0.05)' : 'none'
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: activeTab === tab.id ? 700 : 500,
                      color: activeTab === tab.id ? '#0f172a' : '#475569'
                    }}
                  >
                    {tab.label}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{tab.desc}</span>
                </button>
              ))}
            </div>

            {/* Main Content Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', background: '#ffffff' }}>
              {/* TAB 1: API KEYS */}
              {activeTab === 'keys' && (
                <div>
                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                      Gemini Multi-Key Fallback Pool
                    </h3>
                    <p style={{ fontSize: '0.84rem', color: '#64748b' }}>
                      Prioritized key rotation with automatic HTTP 429 cooldown and live quota failover.
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                    {keyStatuses.map((k, idx) => (
                      <div
                        key={k.id || idx}
                        style={{
                          border: '1px solid #e2e8f0',
                          borderRadius: '10px',
                          padding: '14px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: k.status === 'cooldown' ? '#fff1f2' : '#ffffff'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>
                              {k.id}
                            </span>
                            <span
                              style={{
                                fontSize: '0.72rem',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontWeight: 600,
                                background: k.status === 'active' ? '#ecfdf5' : '#fee2e2',
                                color: k.status === 'active' ? '#047857' : '#b91c1c'
                              }}
                            >
                              {k.status.toUpperCase()}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '3px' }}>
                            Mask: <code>{k.masked}</code> | Requests: {k.totalRequests} | Success:{' '}
                            {k.totalSuccess} | Fails: {k.totalFailures}
                          </p>
                        </div>

                        {k.status === 'cooldown' && (
                          <div style={{ fontSize: '0.8rem', color: '#e11d48', fontWeight: 600 }}>
                            Cooling: {k.secondsRemaining}s remaining
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '16px'
                    }}
                  >
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                      Multi-Key Failover Protocol Active
                    </h4>
                    <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>
                      When any key experiences rate limit blocks or quota exhaustion, it is placed into a 60-second
                      cooldown while the next healthy key in the pool automatically handles inference without disrupting
                      users. User BYOK keys are prioritized first when connected.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: PRICING */}
              {activeTab === 'pricing' && (
                <div>
                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                      RevenueCat Pricing & Credit Packs
                    </h3>
                    <p style={{ fontSize: '0.84rem', color: '#64748b' }}>
                      Manage credit pricing and subscription allocations synced to RevenueCat packages.
                    </p>
                  </div>

                  <form onSubmit={handleSavePricing} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div
                        style={{
                          border: '1px solid #e2e8f0',
                          borderRadius: '10px',
                          padding: '16px',
                          background: '#ffffff'
                        }}
                      >
                        <h4 style={{ fontSize: '0.92rem', fontWeight: 600, color: '#0f172a', marginBottom: '12px' }}>
                          Credit Top-Up Pack
                        </h4>
                        <div style={{ marginBottom: '12px' }}>
                          <label style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                            Price (USD)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={pricing.topUpPrice}
                            onChange={(e) => setPricing({ ...pricing, topUpPrice: parseFloat(e.target.value) || 0 })}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                            Credits Included
                          </label>
                          <input
                            type="number"
                            value={pricing.topUpCredits}
                            onChange={(e) => setPricing({ ...pricing, topUpCredits: parseInt(e.target.value, 10) || 0 })}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                          />
                        </div>
                      </div>

                      <div
                        style={{
                          border: '1px solid #e2e8f0',
                          borderRadius: '10px',
                          padding: '16px',
                          background: '#ffffff'
                        }}
                      >
                        <h4 style={{ fontSize: '0.92rem', fontWeight: 600, color: '#0f172a', marginBottom: '12px' }}>
                          Monthly Subscription Plan
                        </h4>
                        <div style={{ marginBottom: '12px' }}>
                          <label style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                            Price / Month (USD)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={pricing.monthlyPrice}
                            onChange={(e) => setPricing({ ...pricing, monthlyPrice: parseFloat(e.target.value) || 0 })}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                            Monthly Credits Allocation
                          </label>
                          <input
                            type="number"
                            value={pricing.monthlyCredits}
                            onChange={(e) => setPricing({ ...pricing, monthlyCredits: parseInt(e.target.value, 10) || 0 })}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                          />
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px' }}>
                      {pricingSaved && (
                        <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>
                          ✓ Pricing configuration saved
                        </span>
                      )}
                      <button type="submit" className="btn-primary" style={{ padding: '10px 24px' }}>
                        Save Pricing Changes
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 3: USERS */}
              {activeTab === 'users' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                        User Accounts & Credit Quotas
                      </h3>
                      <p style={{ fontSize: '0.84rem', color: '#64748b' }}>
                        Inspect active accounts, adjust wallet credit balance, and apply moderation restrictions.
                      </p>
                    </div>
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {users
                      .filter((u) => u.email.toLowerCase().includes(userSearch.toLowerCase()))
                      .map((u) => (
                        <div
                          key={u.id}
                          style={{
                            border: '1px solid #e2e8f0',
                            borderRadius: '10px',
                            padding: '14px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: u.status === 'banned' ? '#fff1f2' : '#ffffff'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>
                                {u.email}
                              </span>
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontWeight: 600,
                                  background: u.status === 'active' ? '#ecfdf5' : '#fee2e2',
                                  color: u.status === 'active' ? '#047857' : '#b91c1c'
                                }}
                              >
                                {u.status.toUpperCase()}
                              </span>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '3px' }}>
                              ID: {u.id} | Joined: {u.joinedAt} | Analyses: {u.totalAnalyses}
                            </p>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ textAlign: 'right', marginRight: '6px' }}>
                              <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                                {u.credits}
                              </span>
                              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>credits</span>
                            </div>

                            <button
                              onClick={() => handleAdjustCredits(u.id, 50)}
                              style={{
                                padding: '6px 10px',
                                borderRadius: '6px',
                                background: '#f1f5f9',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                color: '#1e293b'
                              }}
                            >
                              +50 Credits
                            </button>

                            <button
                              onClick={() => handleToggleUserBan(u.id, u.status)}
                              style={{
                                padding: '6px 10px',
                                borderRadius: '6px',
                                background: u.status === 'banned' ? '#ecfdf5' : '#fee2e2',
                                color: u.status === 'banned' ? '#047857' : '#b91c1c',
                                fontSize: '0.78rem',
                                fontWeight: 600
                              }}
                            >
                              {u.status === 'banned' ? 'Unban' : 'Ban User'}
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* TAB 4: UGC MODERATION */}
              {activeTab === 'ugc' && (
                <div>
                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                      UGC Safety & Community Flag Queue
                    </h3>
                    <p style={{ fontSize: '0.84rem', color: '#64748b' }}>
                      Store compliance queue (Apple 1.2 & Google Play UGC policy). Review user-reported content.
                    </p>
                  </div>

                  {reports.length === 0 ? (
                    <div
                      style={{
                        padding: '40px',
                        textAlign: 'center',
                        background: '#f8fafc',
                        borderRadius: '12px',
                        border: '1px dashed #cbd5e1'
                      }}
                    >
                      <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                        ✓ Moderation queue is clean. Zero reported images pending review.
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {reports.map((rep) => (
                        <div
                          key={rep.id}
                          style={{
                            border: '1px solid #e2e8f0',
                            borderRadius: '10px',
                            padding: '14px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: rep.status === 'dismissed' ? '#f8fafc' : '#ffffff'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>
                                Item: {rep.itemId}
                              </span>
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontWeight: 600,
                                  background: rep.status === 'pending' ? '#fef3c7' : '#e2e8f0',
                                  color: rep.status === 'pending' ? '#92400e' : '#64748b'
                                }}
                              >
                                {rep.status.toUpperCase()}
                              </span>
                            </div>
                            <p style={{ fontSize: '0.82rem', color: '#e11d48', marginTop: '4px' }}>
                              Reason: {rep.reason} (Author: {rep.authorName})
                            </p>
                          </div>

                          {rep.status === 'pending' && (
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={() => handleResolveUGC(rep.id, 'dismissed')}
                                style={{
                                  padding: '6px 12px',
                                  borderRadius: '6px',
                                  background: '#f1f5f9',
                                  fontSize: '0.8rem',
                                  color: '#475569'
                                }}
                              >
                                Dismiss
                              </button>
                              <button
                                onClick={() => handleResolveUGC(rep.id, 'removed')}
                                style={{
                                  padding: '6px 12px',
                                  borderRadius: '6px',
                                  background: '#fee2e2',
                                  color: '#b91c1c',
                                  fontSize: '0.8rem',
                                  fontWeight: 600
                                }}
                              >
                                Remove & Block
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: PROMOS & GIVEAWAYS */}
              {activeTab === 'promos' && (
                <div>
                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                      Promotions, Special Event Giveaways & Rewards
                    </h3>
                    <p style={{ fontSize: '0.84rem', color: '#64748b' }}>
                      Create redemption codes and trigger seasonal credit drops.
                    </p>
                  </div>

                  {/* Trigger Giveaway Banner */}
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                      border: '1px solid #bbf7d0',
                      borderRadius: '12px',
                      padding: '18px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '24px'
                    }}
                  >
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#166534' }}>
                        🎉 Trigger Special Event Community Giveaway
                      </h4>
                      <p style={{ fontSize: '0.82rem', color: '#15803d', marginTop: '2px' }}>
                        Instantly grant credits to active users celebrating product milestones or holidays.
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="number"
                        value={giveawayCredits}
                        onChange={(e) => setGiveawayCredits(parseInt(e.target.value, 10) || 10)}
                        style={{
                          width: '70px',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: '1px solid #86efac',
                          fontSize: '0.9rem',
                          textAlign: 'center'
                        }}
                      />
                      <button
                        onClick={handleCommunityGiveaway}
                        className="btn-primary"
                        style={{ background: '#166534', padding: '8px 16px', fontSize: '0.85rem' }}
                      >
                        {giveawaySuccess ? '✓ Giveaway Granted!' : 'Drop Giveaway Now'}
                      </button>
                    </div>
                  </div>

                  {/* Add Promo Code Form */}
                  <form
                    onSubmit={handleAddPromo}
                    style={{
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-end',
                      marginBottom: '24px',
                      background: '#f8fafc',
                      padding: '16px',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <div style={{ flex: 2 }}>
                      <label style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                        New Promo Code
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. ARTLAUNCH2026"
                        value={newPromoCode}
                        onChange={(e) => setNewPromoCode(e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                        Credits Granted
                      </label>
                      <input
                        type="number"
                        value={newPromoCredits}
                        onChange={(e) => setNewPromoCredits(parseInt(e.target.value, 10) || 10)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                    <button type="submit" className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.88rem' }}>
                      Add Promo
                    </button>
                  </form>

                  {/* Existing Promos List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {promos.map((p, idx) => (
                      <div
                        key={idx}
                        style={{
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '10px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: '#ffffff'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <code style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>{p.code}</code>
                          <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>
                            +{p.credits} credits
                          </span>
                        </div>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          {p.redeemedCount} redemptions
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: GA4 TELEMETRY */}
              {activeTab === 'analytics' && (
                <div>
                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                      Google Analytics (GA4) & Event Telemetry
                    </h3>
                    <p style={{ fontSize: '0.84rem', color: '#64748b' }}>
                      Monitor user journeys, camera captures, and conversion events.
                    </p>
                  </div>

                  {/* Summary Metric Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
                    {[
                      { label: 'Total Analyses', val: metrics.totalAnalyses, color: '#0f172a' },
                      { label: 'Camera Captures', val: metrics.totalCaptures, color: '#0284c7' },
                      { label: 'Rewarded Ads', val: metrics.totalAds, color: '#10b981' },
                      { label: 'Store Purchases', val: metrics.totalPurchases, color: '#d97706' }
                    ].map((m, i) => (
                      <div
                        key={i}
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '10px',
                          padding: '14px',
                          textAlign: 'center'
                        }}
                      >
                        <span style={{ fontSize: '1.4rem', fontWeight: 700, color: m.color, display: 'block' }}>
                          {m.val}
                        </span>
                        <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 500 }}>{m.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* GA Measurement ID Configuration */}
                  <form
                    onSubmit={handleSaveGA}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '24px'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                        Google Analytics Measurement ID
                      </label>
                      <input
                        type="text"
                        value={gaMeasurementId}
                        onChange={(e) => setGaMeasurementId(e.target.value)}
                        placeholder="G-XXXXXXXXXX"
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                    <button type="submit" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                      Update GA4
                    </button>
                  </form>

                  {/* Recent Live Events */}
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', marginBottom: '10px' }}>
                      Recent Event Telemetry Log
                    </h4>
                    <div
                      style={{
                        maxHeight: '200px',
                        overflowY: 'auto',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '8px'
                      }}
                    >
                      {recentEvents.length === 0 ? (
                        <p style={{ fontSize: '0.8rem', color: '#94a3b8', padding: '10px' }}>No events recorded yet.</p>
                      ) : (
                        recentEvents.map((evt, idx) => (
                          <div
                            key={idx}
                            style={{
                              fontSize: '0.76rem',
                              padding: '6px 8px',
                              borderBottom: '1px solid #e2e8f0',
                              display: 'flex',
                              justifyContent: 'space-between',
                              color: '#334155'
                            }}
                          >
                            <span>
                              <strong>{evt.eventName}</strong>{' '}
                              <span style={{ color: '#64748b' }}>{JSON.stringify(evt.params)}</span>
                            </span>
                            <span style={{ color: '#94a3b8' }}>{new Date(evt.timestamp).toLocaleTimeString()}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
