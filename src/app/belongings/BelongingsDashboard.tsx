'use client';

import React, { useState } from 'react';
import { Plus, Hammer, Heart, Sparkles } from 'lucide-react';
import Header from '../Header';
import { addMonozukuriItem, addCareLog } from '../actions';

interface BelongingsDashboardProps {
  initialData: {
    budget: any;
    monozukuriItems: any[];
  };
  currentMonth: string;
}

export default function BelongingsDashboard({ initialData, currentMonth }: BelongingsDashboardProps) {
  const [selectedMonth] = useState(currentMonth);

  // Form States
  const [monoName, setMonoName] = useState('');
  const [monoDesc, setMonoDesc] = useState('');
  const [monoDate, setMonoDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [activeCareItemId, setActiveCareItemId] = useState<number | null>(null);
  const [careLogText, setCareLogText] = useState('');

  const handleMonthChange = (newMonth: string) => {
    window.location.search = `?month=${newMonth}`;
  };

  const handleAddMono = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!monoName) return;
    try {
      await addMonozukuriItem(monoName, monoDesc, monoDate);
      setMonoName('');
      setMonoDesc('');
      setMonoDate(new Date().toISOString().split('T')[0]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCare = async (itemId: number) => {
    if (!careLogText.trim()) return;
    try {
      await addCareLog(itemId, careLogText);
      setCareLogText('');
      setActiveCareItemId(null);
    } catch (err) {
      console.error(err);
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
        
        {/* Left Side: Items Catalog */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <section className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Hammer style={{ color: 'var(--color-experience)' }} /> Monozukuri 物作り (Cherished Items)
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Kakeibo promotes taking care of your existing belongings instead of constantly replacing them. Here you can catalog your items and track their maintenance.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {initialData.monozukuriItems.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', gridColumn: '1 / -1', padding: '3rem' }}>
                  No cherished belongings cataloged yet. Use the form on the right to start!
                </p>
              ) : (
                initialData.monozukuriItems.map(item => (
                  <div key={item.id} className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div>
                      <strong style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>{item.name}</strong>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0' }}>{item.description || 'No description'}</p>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Acquired: {new Date(item.purchase_date).toLocaleDateString()}</span>
                    </div>

                    {/* Care logs section */}
                    <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>Maintenance Log</span>
                        <button 
                          onClick={() => {
                            setActiveCareItemId(activeCareItemId === item.id ? null : item.id);
                            setCareLogText('');
                          }}
                          className="btn btn-secondary"
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                        >
                          {activeCareItemId === item.id ? 'Cancel' : '+ Add Log'}
                        </button>
                      </div>

                      {activeCareItemId === item.id && (
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                          <input 
                            type="text" 
                            placeholder="e.g. Polished leather, wiped keyboard"
                            value={careLogText}
                            onChange={e => setCareLogText(e.target.value)}
                            style={{ padding: '0.4rem', fontSize: '0.8rem' }}
                            autoFocus
                          />
                          <button 
                            onClick={() => handleAddCare(item.id)}
                            className="btn btn-primary"
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                          >
                            Save
                          </button>
                        </div>
                      )}

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '120px', overflowY: 'auto' }}>
                        {item.care_log.length === 0 ? (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No logs yet. Take care of this object!</span>
                        ) : (
                          item.care_log.map((log: string, idx: number) => (
                            <div key={idx} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem' }}>
                              <span style={{ color: 'var(--text-muted)' }}>•</span>
                              <span>{log}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

        </div>

        {/* Right Side: Add Item Form & Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <section className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus style={{ color: 'var(--accent-color)' }} /> Add Cherished Item
            </h3>
            
            <form onSubmit={handleAddMono} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Item Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Leather wallet, Laptop, Coffee machine" 
                  value={monoName}
                  onChange={e => setMonoName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Description</label>
                <textarea 
                  rows={2}
                  placeholder="Specific details, price, or why it matters to you" 
                  value={monoDesc}
                  onChange={e => setMonoDesc(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Purchase Date</label>
                <input 
                  type="date" 
                  value={monoDate}
                  onChange={e => setMonoDate(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                <Plus size={16} /> Catalog Belonging
              </button>
            </form>
          </section>

          {/* Stats card */}
          <section className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Heart style={{ color: 'var(--color-wants)' }} size={32} />
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Total Belongings Maintained</span>
              <strong style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>{initialData.monozukuriItems.length} items</strong>
            </div>
          </section>

        </div>

      </div>

    </div>
  );
}
