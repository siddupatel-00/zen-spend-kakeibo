'use client';

import React, { useState } from 'react';
import { Plus, Hammer, Heart, Sparkles, Calendar } from 'lucide-react';
import Header from '../Header';
import { addMonozukuriItem, addCareLog } from '../actions';

interface BelongingsDashboardProps {
  initialData: {
    budget: any;
    monozukuriItems: any[];
    settings: any;
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
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      
      <Header 
        insuranceTerm={initialData.budget.insurance_term || 0}
        insuranceHealth={initialData.budget.insurance_health || 0}
        selectedMonth={selectedMonth}
        onMonthChange={handleMonthChange}
        currency={initialData.settings.currency}
        avatar={initialData.settings.avatar}
        username={initialData.settings.username}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Items Catalog */}
        <div className="lg:col-span-2 space-y-6">
          
          <section className="glass-panel rounded-2xl p-6 bg-slate-900/20 border-white/5 space-y-4">
            <h2 className="text-xl font-bold tracking-tight text-primary flex items-center gap-2">
              <Hammer style={{ color: 'var(--color-experience)' }} /> Monozukuri 物作り
            </h2>
            
            {/* Philosophical blurb */}
            <div className="p-4 rounded-xl bg-brand/5 border border-brand/10 text-xs leading-relaxed text-secondary space-y-2">
              <span className="font-bold text-primary flex items-center gap-1">
                <Sparkles size={14} className="text-brand" /> The Art of Caring (物作り)
              </span>
              <p>
                In Japan, *Monozukuri* is not just about making things—it is about respecting the craftsmanship behind the objects we own. Kakeibo emphasizes caring for your current possessions through regular maintenance. By respecting what you already have, you naturally slow down the urge to replace items with new, mindless purchases.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {initialData.monozukuriItems.length === 0 ? (
                <p className="text-xs text-muted text-center py-12 md:col-span-2">
                  No belongings cataloged. Set up your cherished belongings in the form on the right!
                </p>
              ) : (
                initialData.monozukuriItems.map(item => (
                  <div key={item.id} className="glass-panel rounded-xl p-4 bg-slate-900/40 border-white/5 hover:border-white/10 flex flex-col justify-between space-y-4">
                    <div>
                      <strong className="text-sm text-primary font-bold">{item.name}</strong>
                      <p className="text-xs text-secondary mt-1">{item.description || 'No description'}</p>
                      <span className="text-[10px] text-muted mt-1.5 flex items-center gap-1">
                        <Calendar size={10} /> Acquired: {new Date(item.purchase_date).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Care logs section */}
                    <div className="border-t border-white/5 pt-3 mt-2">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold text-brand uppercase tracking-wider">Maintenance Log</span>
                        <button 
                          onClick={() => {
                            setActiveCareItemId(activeCareItemId === item.id ? null : item.id);
                            setCareLogText('');
                          }}
                          className="btn btn-secondary px-2 py-0.5 rounded text-[10px] border-white/5"
                        >
                          {activeCareItemId === item.id ? 'Cancel' : '+ Add Log'}
                        </button>
                      </div>

                      {activeCareItemId === item.id && (
                        <div className="flex gap-2 mb-3">
                          <input 
                            type="text" 
                            placeholder="e.g. Polished leather, wiped computer fan"
                            value={careLogText}
                            onChange={e => setCareLogText(e.target.value)}
                            className="text-xs p-1.5 bg-slate-900"
                            autoFocus
                          />
                          <button 
                            onClick={() => handleAddCare(item.id)}
                            className="btn btn-primary py-1 px-3 text-xs"
                          >
                            Save
                          </button>
                        </div>
                      )}

                      <div className="flex flex-col gap-1.5 max-h-24 overflow-y-auto pr-1">
                        {item.care_log.length === 0 ? (
                          <span className="text-[10px] text-muted">No maintenance events recorded. Log your care!</span>
                        ) : (
                          item.care_log.map((log: string, idx: number) => (
                            <div key={idx} className="text-[10px] text-secondary flex gap-1.5 leading-normal">
                              <span className="text-brand">•</span>
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
        <div className="space-y-6">
          
          <section className="glass-panel rounded-2xl p-5 bg-slate-900/20 border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-secondary uppercase tracking-wider flex items-center gap-2">
              <Plus size={16} className="text-brand" /> Catalog Cherished Item
            </h3>
            
            <form onSubmit={handleAddMono} className="space-y-4">
              <div>
                <label className="text-[10px] text-secondary font-bold uppercase tracking-wider block mb-1">Item Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Mechanical Keyboard, Leather Wallet" 
                  value={monoName}
                  onChange={e => setMonoName(e.target.value)}
                  className="text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-secondary font-bold uppercase tracking-wider block mb-1">Description / Details</label>
                <textarea 
                  rows={3}
                  placeholder="e.g. Handcrafted, high-value, or items you frequently use." 
                  value={monoDesc}
                  onChange={e => setMonoDesc(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-secondary font-bold uppercase tracking-wider block mb-1">Purchase Date</label>
                <input 
                  type="date" 
                  value={monoDate}
                  onChange={e => setMonoDate(e.target.value)}
                  className="text-sm"
                />
              </div>

              <button type="submit" className="w-full btn btn-primary py-2.5 flex items-center justify-center gap-1.5 text-sm">
                <Plus size={16} /> Catalog Item
              </button>
            </form>
          </section>

          {/* Maintenance Count Stats Card */}
          <section className="glass-panel rounded-2xl p-5 bg-slate-900/20 border-white/5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-brand/15 text-brand">
              <Heart size={24} />
            </div>
            <div>
              <span className="text-[10px] text-secondary font-bold uppercase tracking-wider block">Belongings Logged</span>
              <strong className="text-xl font-extrabold text-primary">{initialData.monozukuriItems.length} Cherished Items</strong>
            </div>
          </section>

        </div>

      </div>

    </div>
  );
}
