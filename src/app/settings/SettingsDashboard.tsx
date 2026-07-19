'use client';

import React, { useState } from 'react';
import { User, Settings, Sparkles, ShieldCheck } from 'lucide-react';
import Header from '../Header';
import { updateSettings } from '../actions';

interface SettingsDashboardProps {
  initialData: {
    budget: any;
    settings: any;
  };
  currentMonth: string;
}

const AVATAR_OPTIONS = ['🧘', '🦊', '🐼', '🦁', '🦉', '🌸', '⚡', '💻', '💸', '📈'];
const CURRENCY_OPTIONS = [
  { value: '$', label: 'USD ($)' },
  { value: '€', label: 'Euro (€)' },
  { value: '£', label: 'GBP (£)' },
  { value: '¥', label: 'Yen (¥)' },
  { value: '₹', label: 'Rupee (₹)' },
];

export default function SettingsDashboard({ initialData, currentMonth }: SettingsDashboardProps) {
  const [selectedMonth] = useState(currentMonth);

  // Form States
  const [username, setUsername] = useState(initialData.settings.username || 'Zen User');
  const [currency, setCurrency] = useState(initialData.settings.currency || '$');
  const [avatar, setAvatar] = useState(initialData.settings.avatar || '🧘');
  const [isSaving, setIsSaving] = useState(false);

  const handleMonthChange = (newMonth: string) => {
    window.location.search = `?month=${newMonth}`;
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSettings(username, currency, avatar);
      alert('Settings updated successfully!');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ padding: '2rem 1rem', maxWidth: '1400px', margin: '0 auto' }}>
      
      <Header 
        insuranceTerm={initialData.budget.insurance_term || 0}
        insuranceHealth={initialData.budget.insurance_health || 0}
        selectedMonth={selectedMonth}
        onMonthChange={handleMonthChange}
      />

      <div className="dashboard-grid">
        
        {/* Left Side: Profile Card & Settings Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <section className="glass-panel" style={{ padding: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User style={{ color: 'var(--accent-color)' }} /> User Profile & settings
            </h2>

            <form onSubmit={handleSaveSettings} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Username / Practitioner Name</label>
                  <input 
                    type="text" 
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Preferred Currency Symbol</label>
                  <select 
                    value={currency}
                    onChange={e => setCurrency(e.target.value)}
                  >
                    {CURRENCY_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Avatar Emoji</label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {AVATAR_OPTIONS.map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setAvatar(opt)}
                        className="glass-panel"
                        style={{
                          fontSize: '1.5rem',
                          padding: '0.5rem 0.75rem',
                          cursor: 'pointer',
                          background: avatar === opt ? 'var(--accent-glow)' : 'rgba(128,128,128,0.05)',
                          border: avatar === opt ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                          borderRadius: '8px'
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button type="submit" disabled={isSaving} className="btn btn-primary" style={{ justifySelf: 'start', marginTop: '1rem' }}>
                {isSaving ? 'Saving...' : 'Save Settings'}
              </button>

            </form>
          </section>

          {/* Database System Information */}
          <section className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Settings size={20} style={{ color: 'var(--text-muted)' }} /> System Diagnostics
            </h3>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div>
                <strong>Database client:</strong> SQLite (libsql) Local Driver
              </div>
              <div>
                <strong>Location:</strong> `/Users/siddu/.gemini/antigravity/scratch/kakeibo-tracker/local.db`
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success-color)', marginTop: '0.5rem' }}>
                <ShieldCheck size={16} /> Connection Secure & Local
              </div>
            </div>
          </section>

        </div>

        {/* Right Side: Profile Summary Display Card */}
        <div>
          <section className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
            
            {/* Large avatar circle */}
            <div className="glass-panel" style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              fontSize: '4.5rem',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              background: 'var(--accent-glow)',
              borderColor: 'var(--accent-color)'
            }}>
              {avatar}
            </div>

            <div>
              <h3 style={{ fontSize: '1.75rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}>
                {username} <Sparkles size={16} style={{ color: 'var(--accent-color)' }} />
              </h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.2rem' }}>
                Mindful Kakeibo Practitioner
              </span>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', width: '100%', paddingTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Base Currency</span>
                <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{currency}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Practitioner Status</span>
                <strong style={{ fontSize: '1.1rem', color: 'var(--success-color)' }}>Active</strong>
              </div>
            </div>

          </section>
        </div>

      </div>

    </div>
  );
}
