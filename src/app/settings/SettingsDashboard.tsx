'use client';

import React, { useState } from 'react';
import { User, Settings, Sparkles, ShieldCheck } from 'lucide-react';
import Header from '../Header';
import { updateSettings, updateBudget } from '../actions';

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

  // Profile States
  const [username, setUsername] = useState(initialData.settings.username || 'Zen User');
  const [currency, setCurrency] = useState(initialData.settings.currency || '$');
  const [avatar, setAvatar] = useState(initialData.settings.avatar || '🧘');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Budget Parameter States
  const [income, setIncome] = useState(initialData.budget.income || 0);
  const [savingsGoal, setSavingsGoal] = useState(initialData.budget.savings_goal || 0);
  const [hourlyRate, setHourlyRate] = useState(initialData.budget.hourly_rate || 0);
  const [wantsLimit, setWantsLimit] = useState(initialData.budget.wants_limit || 0);
  const [isSavingBudget, setIsSavingBudget] = useState(false);

  const handleMonthChange = (newMonth: string) => {
    window.location.search = `?month=${newMonth}`;
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await updateSettings(username, currency, avatar);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBudget(true);
    try {
      await updateBudget(selectedMonth, Number(income), Number(savingsGoal), Number(hourlyRate), Number(wantsLimit));
      alert('Monthly settings updated!');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingBudget(false);
    }
  };

  const savingsPercent = income > 0 ? (savingsGoal / income) * 100 : 0;

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
        
        {/* Left Side: Profile Forms & Settings */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* User Profile Config */}
          <section className="glass-panel rounded-2xl p-6 bg-slate-900/20 border-white/5 space-y-4">
            <h2 className="text-xl font-bold tracking-tight text-primary flex items-center gap-2">
              <User className="text-brand" /> Profile Customization
            </h2>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-secondary font-bold uppercase tracking-wider block mb-1">Username / Practitioner Name</label>
                  <input 
                    type="text" 
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] text-secondary font-bold uppercase tracking-wider block mb-1">Base Currency Symbol</label>
                  <select 
                    value={currency}
                    onChange={e => setCurrency(e.target.value)}
                    className="text-sm"
                  >
                    {CURRENCY_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-secondary font-bold uppercase tracking-wider block mb-1">Select Avatar Emoji</label>
                <div className="flex gap-2 flex-wrap pt-1">
                  {AVATAR_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setAvatar(opt)}
                      className={`glass-panel text-xl px-4 py-2 rounded-xl transition-all border ${
                        avatar === opt 
                          ? 'border-brand bg-brand/10 text-brand ring-2 ring-brand/10' 
                          : 'border-white/5 hover:border-white/10'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={isSavingProfile} className="btn btn-primary py-2 px-5 text-sm">
                {isSavingProfile ? 'Saving...' : 'Update Profile'}
              </button>
            </form>
          </section>

          {/* Month Financial Parameters */}
          <section className="glass-panel rounded-2xl p-6 bg-slate-900/20 border-white/5 space-y-4">
            <h2 className="text-xl font-bold tracking-tight text-primary flex items-center gap-2">
              <Settings className="text-brand" /> Monthly Financial Settings
            </h2>

            <form onSubmit={handleSaveBudget} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-secondary font-bold uppercase tracking-wider block mb-1">Monthly Income ({currency})</label>
                  <input 
                    type="number" 
                    value={income}
                    onChange={e => setIncome(Number(e.target.value))}
                    className="text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] text-secondary font-bold uppercase tracking-wider block mb-1">Monthly Savings Goal ({currency})</label>
                  <input 
                    type="number" 
                    value={savingsGoal}
                    onChange={e => setSavingsGoal(Number(e.target.value))}
                    className="text-sm"
                    required
                  />
                  {income > 0 && (
                    <span className="text-[9px] text-emerald-400 font-bold block mt-1">
                      Saving {savingsPercent.toFixed(0)}% of your income (Artificial Scarcity)
                    </span>
                  )}
                </div>

                <div>
                  <label className="text-[10px] text-secondary font-bold uppercase tracking-wider block mb-1">Wants Envelope Limit ({currency})</label>
                  <input 
                    type="number" 
                    value={wantsLimit}
                    onChange={e => setWantsLimit(Number(e.target.value))}
                    className="text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] text-secondary font-bold uppercase tracking-wider block mb-1">Hourly Labor Wage ({currency}/hr)</label>
                  <input 
                    type="number" 
                    value={hourlyRate}
                    onChange={e => setHourlyRate(Number(e.target.value))}
                    className="text-sm"
                    required
                  />
                </div>
              </div>

              <button type="submit" disabled={isSavingBudget} className="btn btn-primary py-2 px-5 text-sm">
                {isSavingBudget ? 'Updating...' : 'Update Month parameters'}
              </button>
            </form>
          </section>

          {/* System Diagnostics */}
          <section className="glass-panel rounded-2xl p-6 bg-slate-900/20 border-white/5 space-y-3">
            <h3 className="text-sm font-bold text-secondary uppercase tracking-wider flex items-center gap-2">
              System Diagnostics (Transparency Panel)
            </h3>
            <div className="text-xs text-secondary space-y-2 leading-relaxed">
              <div>
                <strong>Database Client:</strong> LibSQL SQLite Local File client (libsql-serverless fallback)
              </div>
              <div>
                <strong>Driver Path:</strong> `@libsql/client/sqlite`
              </div>
              <div className="font-mono bg-slate-950/40 p-2.5 rounded-lg border border-white/5 overflow-x-auto text-[10px]">
                {"sqlite3://data.db -> file:/Users/siddu/.gemini/antigravity/scratch/kakeibo-tracker/local.db"}
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold mt-1">
                <ShieldCheck size={14} /> Local Database Active & Persisted
              </div>
            </div>
          </section>

        </div>

        {/* Right Side: Profile Summary Display Card */}
        <div>
          <section className="glass-panel rounded-2xl p-6 bg-slate-900/20 border-white/5 text-center flex flex-col items-center gap-5">
            
            {/* Large avatar circle */}
            <div className="w-28 h-28 rounded-full text-5xl flex justify-center items-center bg-brand/10 border border-brand/20 shadow-lg">
              {avatar}
            </div>

            <div>
              <h3 className="text-lg font-bold text-primary flex items-center gap-1.5 justify-center">
                {username} <Sparkles size={14} className="text-brand" />
              </h3>
              <span className="text-xs text-secondary block mt-0.5">
                Mindful Kakeibo Practitioner
              </span>
            </div>

            <div className="border-t border-white/5 w-full pt-4 grid grid-cols-2 gap-4 text-left">
              <div>
                <span className="text-[10px] text-secondary font-bold uppercase tracking-wider block">Base Currency</span>
                <strong className="text-sm text-primary">{currency}</strong>
              </div>
              <div>
                <span className="text-[10px] text-secondary font-bold uppercase tracking-wider block">Status</span>
                <strong className="text-sm text-emerald-400">Active</strong>
              </div>
            </div>

          </section>
        </div>

      </div>

    </div>
  );
}
