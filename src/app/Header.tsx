'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, Sparkles, Sun, Moon, Laptop, ShieldCheck, ShieldAlert } from 'lucide-react';
import { toggleInsurance } from './actions';

interface HeaderProps {
  insuranceTerm: number;
  insuranceHealth: number;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}

export default function Header({ insuranceTerm, insuranceHealth, selectedMonth, onMonthChange }: HeaderProps) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

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

  return (
    <header className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem' }}>
      
      {/* Brand & Nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', background: 'linear-gradient(to right, var(--accent-color), #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            Kakeibo 家計簿 <Sparkles style={{ color: 'var(--accent-color)' }} size={20} />
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0 }}>Mindful spendings tracker</p>
        </div>

        <nav style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link 
            href={`/?month=${selectedMonth}`}
            style={{ 
              textDecoration: 'none', 
              color: pathname === '/' ? 'var(--accent-color)' : 'var(--text-secondary)', 
              fontWeight: pathname === '/' ? 'bold' : 'normal',
              fontSize: '0.95rem',
              borderBottom: pathname === '/' ? '2px solid var(--accent-color)' : 'none',
              paddingBottom: '0.2rem'
            }}
          >
            Dashboard
          </Link>
          <Link 
            href={`/daily?month=${selectedMonth}`}
            style={{ 
              textDecoration: 'none', 
              color: pathname.startsWith('/daily') ? 'var(--accent-color)' : 'var(--text-secondary)', 
              fontWeight: pathname.startsWith('/daily') ? 'bold' : 'normal',
              fontSize: '0.95rem',
              borderBottom: pathname.startsWith('/daily') ? '2px solid var(--accent-color)' : 'none',
              paddingBottom: '0.2rem'
            }}
          >
            Daily Tracker
          </Link>
          <Link 
            href={`/history?month=${selectedMonth}`}
            style={{ 
              textDecoration: 'none', 
              color: pathname.startsWith('/history') ? 'var(--accent-color)' : 'var(--text-secondary)', 
              fontWeight: pathname.startsWith('/history') ? 'bold' : 'normal',
              fontSize: '0.95rem',
              borderBottom: pathname.startsWith('/history') ? '2px solid var(--accent-color)' : 'none',
              paddingBottom: '0.2rem'
            }}
          >
            History
          </Link>
          <Link 
            href={`/belongings?month=${selectedMonth}`}
            style={{ 
              textDecoration: 'none', 
              color: pathname.startsWith('/belongings') ? 'var(--accent-color)' : 'var(--text-secondary)', 
              fontWeight: pathname.startsWith('/belongings') ? 'bold' : 'normal',
              fontSize: '0.95rem',
              borderBottom: pathname.startsWith('/belongings') ? '2px solid var(--accent-color)' : 'none',
              paddingBottom: '0.2rem'
            }}
          >
            Belongings
          </Link>
          <Link 
            href={`/settings?month=${selectedMonth}`}
            style={{ 
              textDecoration: 'none', 
              color: pathname.startsWith('/settings') ? 'var(--accent-color)' : 'var(--text-secondary)', 
              fontWeight: pathname.startsWith('/settings') ? 'bold' : 'normal',
              fontSize: '0.95rem',
              borderBottom: pathname.startsWith('/settings') ? '2px solid var(--accent-color)' : 'none',
              paddingBottom: '0.2rem'
            }}
          >
            Settings
          </Link>
        </nav>
      </div>

      {/* Toggles, Selector, Insurance */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
        
        {/* Month Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar style={{ color: 'var(--accent-color)' }} size={16} />
          <select 
            value={selectedMonth} 
            onChange={(e) => onMonthChange(e.target.value)}
            style={{ width: '180px', padding: '0.5rem', fontSize: '0.85rem' }}
          >
            {getMonthOptions().map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Theme Toggle Selector */}
        <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(128,128,128,0.1)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <button 
            onClick={() => handleThemeChange('light')}
            title="Light Mode"
            style={{ 
              background: theme === 'light' ? 'var(--panel-bg)' : 'none', 
              border: 'none', 
              padding: '0.4rem', 
              borderRadius: '6px', 
              cursor: 'pointer',
              color: theme === 'light' ? 'var(--accent-color)' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Sun size={15} />
          </button>
          <button 
            onClick={() => handleThemeChange('dark')}
            title="Dark Mode"
            style={{ 
              background: theme === 'dark' ? 'var(--panel-bg)' : 'none', 
              border: 'none', 
              padding: '0.4rem', 
              borderRadius: '6px', 
              cursor: 'pointer',
              color: theme === 'dark' ? 'var(--accent-color)' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Moon size={15} />
          </button>
          <button 
            onClick={() => handleThemeChange('system')}
            title="System Preference"
            style={{ 
              background: theme === 'system' ? 'var(--panel-bg)' : 'none', 
              border: 'none', 
              padding: '0.4rem', 
              borderRadius: '6px', 
              cursor: 'pointer',
              color: theme === 'system' ? 'var(--accent-color)' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Laptop size={15} />
          </button>
        </div>

        {/* Insurance Shield */}
        <div className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderRadius: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Financial Protection Checklist</span>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={insuranceTerm === 1}
                  onChange={() => toggleInsurance(selectedMonth, 'term', insuranceTerm !== 1)}
                />
                Term
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={insuranceHealth === 1}
                  onChange={() => toggleInsurance(selectedMonth, 'health', insuranceHealth !== 1)}
                />
                Health
              </label>
            </div>
          </div>
          <div>
            {insuranceTerm === 1 && insuranceHealth === 1 ? (
              <div className="tooltip" style={{ display: 'flex', alignItems: 'center' }}>
                <ShieldCheck style={{ color: 'var(--success-color)' }} size={24} />
                <span className="tooltiptext">Your foundation is secure! Term & Health insurance coverages protect your household.</span>
              </div>
            ) : (
              <div className="tooltip" style={{ display: 'flex', alignItems: 'center' }}>
                <ShieldAlert className="pulse-indicator alert" style={{ color: 'var(--warning-color)', borderRadius: '50%' }} size={24} />
                <span className="tooltiptext" style={{ width: '220px', left: '-180px' }}>⚠️ Warning: Complete your insurance coverages. Protection is essential in the Kakeibo method.</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}
