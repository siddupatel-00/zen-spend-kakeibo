'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, Sparkles, Sun, Moon, Laptop, ShieldCheck, ShieldAlert, Check } from 'lucide-react';
import { toggleInsurance } from './actions';

interface HeaderProps {
  insuranceTerm: number;
  insuranceHealth: number;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  currency?: string;
  avatar?: string;
  username?: string;
}

export default function Header({ 
  insuranceTerm, 
  insuranceHealth, 
  selectedMonth, 
  onMonthChange,
  currency = '$',
  avatar = '🧘',
  username = 'Zen User'
}: HeaderProps) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const savedTheme = (localStorage.getItem('theme') || 'system') as 'light' | 'dark' | 'system';
    setTheme(savedTheme);
  }, []);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'system') {
      const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', newTheme);
    }
  };

  const getMonthOptions = () => {
    const options = [];
    const now = new Date();
    for (let i = -6; i <= 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const str = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      options.push({ value: str, label });
    }
    return options;
  };

  const isInsured = insuranceTerm === 1 && insuranceHealth === 1;

  return (
    <header className="glass-panel rounded-2xl p-4 mb-8 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900/40 border-white/10 dark:bg-slate-950/40">
      
      {/* Brand & Navigation */}
      <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto">
        <div className="text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="text-2xl">{avatar}</span>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-brand to-cyan-500 bg-clip-text text-transparent flex items-center gap-1.5">
              Zen Spend <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand/10 text-brand">家計簿</span>
            </h1>
          </div>
          <p className="text-xs text-secondary mt-0.5">Mindful Living with {username}</p>
        </div>

        <nav className="flex items-center gap-1 bg-slate-950/40 p-1 rounded-xl border border-white/5">
          <Link 
            href={`/?month=${selectedMonth}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              pathname === '/' 
                ? 'bg-brand text-white shadow-sm' 
                : 'text-secondary hover:text-primary'
            }`}
          >
            Dashboard
          </Link>
          <Link 
            href={`/daily?month=${selectedMonth}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              pathname.startsWith('/daily') 
                ? 'bg-brand text-white shadow-sm' 
                : 'text-secondary hover:text-primary'
            }`}
          >
            Daily Tracker
          </Link>
          <Link 
            href={`/history?month=${selectedMonth}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              pathname.startsWith('/history') 
                ? 'bg-brand text-white shadow-sm' 
                : 'text-secondary hover:text-primary'
            }`}
          >
            History
          </Link>
          <Link 
            href={`/belongings?month=${selectedMonth}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              pathname.startsWith('/belongings') 
                ? 'bg-brand text-white shadow-sm' 
                : 'text-secondary hover:text-primary'
            }`}
          >
            Belongings
          </Link>
          <Link 
            href={`/settings?month=${selectedMonth}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              pathname.startsWith('/settings') 
                ? 'bg-brand text-white shadow-sm' 
                : 'text-secondary hover:text-primary'
            }`}
          >
            Settings
          </Link>
        </nav>
      </div>

      {/* Control Widgets */}
      <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 w-full md:w-auto">
        
        {/* Month Selector */}
        <div className="flex items-center gap-2 bg-slate-950/20 px-2 py-1.5 rounded-xl border border-white/5">
          <Calendar size={14} className="text-brand" />
          <select 
            value={selectedMonth} 
            onChange={(e) => onMonthChange(e.target.value)}
            className="bg-transparent text-xs font-medium focus:outline-none cursor-pointer pr-4"
          >
            {getMonthOptions().map(opt => (
              <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Theme Selector */}
        <div className="flex gap-0.5 bg-slate-950/40 p-1 rounded-xl border border-white/5">
          <button 
            onClick={() => handleThemeChange('light')}
            className={`p-1.5 rounded-lg transition-all ${theme === 'light' ? 'bg-brand text-white' : 'text-secondary hover:text-primary'}`}
            title="Light Mode"
          >
            <Sun size={14} />
          </button>
          <button 
            onClick={() => handleThemeChange('dark')}
            className={`p-1.5 rounded-lg transition-all ${theme === 'dark' ? 'bg-brand text-white' : 'text-secondary hover:text-primary'}`}
            title="Dark Mode"
          >
            <Moon size={14} />
          </button>
          <button 
            onClick={() => handleThemeChange('system')}
            className={`p-1.5 rounded-lg transition-all ${theme === 'system' ? 'bg-brand text-white' : 'text-secondary hover:text-primary'}`}
            title="System Preference"
          >
            <Laptop size={14} />
          </button>
        </div>

        {/* Insurance Protection Checklist Widget */}
        <div 
          className={`relative flex items-center gap-3 px-3 py-1.5 rounded-xl border transition-all ${
            isInsured 
              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' 
              : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
          }`}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          {/* Notification Glow Dot */}
          {!isInsured && (
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
          )}

          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-wider text-muted font-bold">Financial Shield</span>
            <div className="flex gap-2.5 mt-0.5">
              <label className="flex items-center gap-1 text-[11px] font-semibold cursor-pointer text-primary">
                <input 
                  type="checkbox" 
                  checked={insuranceTerm === 1}
                  onChange={() => toggleInsurance(selectedMonth, 'term', insuranceTerm !== 1)}
                  className="rounded text-brand focus:ring-brand h-3 w-3 accent-brand cursor-pointer"
                />
                Term
              </label>
              <label className="flex items-center gap-1 text-[11px] font-semibold cursor-pointer text-primary">
                <input 
                  type="checkbox" 
                  checked={insuranceHealth === 1}
                  onChange={() => toggleInsurance(selectedMonth, 'health', insuranceHealth !== 1)}
                  className="rounded text-brand focus:ring-brand h-3 w-3 accent-brand cursor-pointer"
                />
                Health
              </label>
            </div>
          </div>
          
          <div className="cursor-pointer">
            {isInsured ? (
              <ShieldCheck size={20} className="text-emerald-400" />
            ) : (
              <ShieldAlert size={20} className="text-rose-400 animate-pulse" />
            )}
          </div>

          {/* Custom Tooltip */}
          {showTooltip && (
            <div className="absolute right-0 top-11 z-50 w-64 p-3 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl text-[11px] leading-relaxed text-secondary pointer-events-none">
              <strong className="text-primary block mb-1">Financial Safety Foundation</strong>
              In the Kakeibo method, mindful spending is built on household security. **Term Insurance** and **Health Insurance** are absolute essentials to protect your family from unexpected financial shocks.
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
