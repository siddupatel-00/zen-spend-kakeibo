'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Sparkles, 
  ShieldAlert, 
  ShieldCheck,
  Calendar,
  PenLine,
  TrendingDown,
  Hammer,
  HelpCircle,
  PiggyBank
} from 'lucide-react';
import { 
  updateBudget, 
  toggleInsurance, 
  addExpense, 
  deleteExpense, 
  addCoolingOffItem, 
  resolveCoolingOffItem, 
  addMonozukuriItem, 
  addCareLog, 
  updatePromise 
} from './actions';

interface KakeiboDashboardProps {
  initialData: {
    budget: any;
    expenses: any[];
    coolingOffItems: any[];
    monozukuriItems: any[];
    promise: any;
  };
  currentMonth: string; // YYYY-MM
}

export default function KakeiboDashboard({ initialData, currentMonth }: KakeiboDashboardProps) {
  // Budget States
  const [income, setIncome] = useState(initialData.budget.income || 0);
  const [savingsGoal, setSavingsGoal] = useState(initialData.budget.savings_goal || 0);
  const [hourlyRate, setHourlyRate] = useState(initialData.budget.hourly_rate || 0);
  const [wantsLimit, setWantsLimit] = useState(initialData.budget.wants_limit || 0);
  const [isSavingBudget, setIsSavingBudget] = useState(false);

  // Form States
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('needs');
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Cooling-off Form
  const [coolingName, setCoolingName] = useState('');
  const [coolingCost, setCoolingCost] = useState('');
  const [coolingDuration, setCoolingDuration] = useState('24');

  // Monozukuri Form
  const [monoName, setMonoName] = useState('');
  const [monoDesc, setMonoDesc] = useState('');
  const [monoDate, setMonoDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [activeCareItemId, setActiveCareItemId] = useState<number | null>(null);
  const [careLogText, setCareLogText] = useState('');

  // Promises & Reflection
  const [promiseText, setPromiseText] = useState(initialData.promise.promise_text || '');
  const [reflectionText, setReflectionText] = useState(initialData.promise.reflection || '');
  const [isSavingPromise, setIsSavingPromise] = useState(false);

  // Month Navigation
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  // Force re-renders for timers
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update budget local state when initialData changes (e.g. on month switch)
  useEffect(() => {
    setIncome(initialData.budget.income || 0);
    setSavingsGoal(initialData.budget.savings_goal || 0);
    setHourlyRate(initialData.budget.hourly_rate || 0);
    setWantsLimit(initialData.budget.wants_limit || 0);
    setPromiseText(initialData.promise.promise_text || '');
    setReflectionText(initialData.promise.reflection || '');
  }, [initialData]);

  // Calculations
  const totalSpent = initialData.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const spentByCat = {
    needs: initialData.expenses.filter(e => e.category === 'needs').reduce((sum, e) => sum + e.amount, 0),
    wants: initialData.expenses.filter(e => e.category === 'wants').reduce((sum, e) => sum + e.amount, 0),
    experience: initialData.expenses.filter(e => e.category === 'experience').reduce((sum, e) => sum + e.amount, 0),
    extra: initialData.expenses.filter(e => e.category === 'extra').reduce((sum, e) => sum + e.amount, 0),
  };

  const spendablePool = income - savingsGoal;
  const remainingPool = spendablePool - totalSpent;
  const savingsPercent = income > 0 ? (savingsGoal / income) * 100 : 0;
  const spentPercent = spendablePool > 0 ? (totalSpent / spendablePool) * 100 : 0;

  // Wants envelope status
  const wantsEnvelopeExceeded = wantsLimit > 0 && spentByCat.wants > wantsLimit;

  // Savings tracker from cooling off items
  const savedByWaiting = initialData.coolingOffItems
    .filter(item => item.status === 'dismissed')
    .reduce((sum, item) => sum + item.cost, 0);

  // Form submit handlers
  const handleBudgetSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBudget(true);
    try {
      await updateBudget(selectedMonth, Number(income), Number(savingsGoal), Number(hourlyRate), Number(wantsLimit));
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingBudget(false);
    }
  };

  const handleInsuranceToggle = async (type: 'term' | 'health', currentVal: number) => {
    await toggleInsurance(selectedMonth, type, currentVal === 0);
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseAmount || Number(expenseAmount) <= 0) return;
    try {
      await addExpense(Number(expenseAmount), expenseCategory, expenseDesc, expenseDate);
      setExpenseAmount('');
      setExpenseDesc('');
      setExpenseDate(new Date().toISOString().split('T')[0]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteExpense = async (id: number) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      await deleteExpense(id);
    }
  };

  const handleAddCoolingItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coolingName || !coolingCost || Number(coolingCost) <= 0) return;
    try {
      await addCoolingOffItem(coolingName, Number(coolingCost), Number(coolingDuration));
      setCoolingName('');
      setCoolingCost('');
      setCoolingDuration('24');
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveCooling = async (id: number, action: 'buy' | 'dismiss') => {
    await resolveCoolingOffItem(id, action);
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

  const handlePromiseSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPromise(true);
    try {
      await updatePromise(selectedMonth, promiseText, reflectionText);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingPromise(false);
    }
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedMonth(val);
    window.location.search = `?month=${val}`;
  };

  // Helper for labor hour calculation
  const getLaborHours = (amount: number | string) => {
    const num = Number(amount);
    if (!num || !hourlyRate || Number(hourlyRate) <= 0) return 0;
    return (num / Number(hourlyRate)).toFixed(1);
  };

  // Generate options for month selector (past 6 months + next 6 months)
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
    <div style={{ padding: '2rem 1rem', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Header Panel */}
      <header className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', background: 'linear-gradient(to right, #a855f7, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            Kakeibo 家計簿 <Sparkles style={{ color: 'var(--brand-color)' }} />
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Mindful financial habit & spending tracker</p>
        </div>

        {/* Month Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Calendar style={{ color: 'var(--brand-color)' }} size={20} />
          <select 
            value={selectedMonth} 
            onChange={handleMonthChange}
            style={{ width: '220px', background: 'rgba(255,255,255,0.06)' }}
          >
            {getMonthOptions().map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Financial Protection Shield */}
        <div className="glass-panel" style={{ padding: '0.75rem 1.25rem', border: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Financial Protection Checklist</span>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={initialData.budget.insurance_term === 1}
                  onChange={() => handleInsuranceToggle('term', initialData.budget.insurance_term)}
                />
                Term Insurance
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={initialData.budget.insurance_health === 1}
                  onChange={() => handleInsuranceToggle('health', initialData.budget.insurance_health)}
                />
                Health Insurance
              </label>
            </div>
          </div>
          <div>
            {initialData.budget.insurance_term === 1 && initialData.budget.insurance_health === 1 ? (
              <div className="tooltip" style={{ display: 'flex', alignItems: 'center' }}>
                <ShieldCheck style={{ color: 'var(--success-color)' }} size={32} />
                <span className="tooltiptext">Your foundation is secure! Term & Health insurance coverages protect your household.</span>
              </div>
            ) : (
              <div className="tooltip" style={{ display: 'flex', alignItems: 'center' }}>
                <ShieldAlert className="pulse-indicator alert" style={{ color: 'var(--warning-color)', borderRadius: '50%' }} size={32} />
                <span className="tooltiptext" style={{ width: '220px', left: '-10px' }}>⚠️ Warning: Complete your insurance coverages. Protection is essential in the Kakeibo method.</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="dashboard-grid">
        
        {/* Left Side: Finances & Lists */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Dashboard Summary Numbers */}
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: '-10px', bottom: '-15px', opacity: 0.05, color: '#fff' }}>
                <PiggyBank size={80} />
              </div>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Monthly Spending Pool</span>
              <h2 style={{ fontSize: '2rem', margin: '0.25rem 0', fontWeight: 'bold' }}>
                ${spendablePool.toLocaleString()}
              </h2>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Income: ${income.toLocaleString()} | Savings Goal: ${savingsGoal.toLocaleString()}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Total Spent</span>
              <h2 style={{ fontSize: '2rem', margin: '0.25rem 0', fontWeight: 'bold', color: totalSpent > spendablePool ? 'var(--danger-color)' : 'var(--text-primary)' }}>
                ${totalSpent.toLocaleString()}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div className="progress-bar-track" style={{ height: '6px' }}>
                  <div className="progress-bar-fill" style={{ 
                    width: `${Math.min(spentPercent, 100)}%`, 
                    backgroundColor: spentPercent > 100 ? 'var(--danger-color)' : 'var(--brand-color)'
                  }}></div>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{spentPercent.toFixed(0)}%</span>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Remaining Pool</span>
              <h2 style={{ fontSize: '2rem', margin: '0.25rem 0', fontWeight: 'bold', color: remainingPool < 0 ? 'var(--danger-color)' : 'var(--success-color)' }}>
                ${remainingPool.toLocaleString()}
              </h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {remainingPool < 0 ? 'Exceeded Budget' : 'Safe to spend'}
              </span>
            </div>
          </section>

          {/* Kakeibo Four Pillars Envelope Method */}
          <section className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              The Four Pillars (Envelope Method)
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
              
              {/* Needs card */}
              <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--color-needs)', background: 'rgba(59, 130, 246, 0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>Needs (Essential)</h3>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(59, 130, 246, 0.2)', padding: '0.2rem 0.5rem', borderRadius: '4px', color: 'var(--color-needs)' }}>Survival</span>
                </div>
                <h4 style={{ fontSize: '1.5rem', margin: '0.5rem 0' }}>${spentByCat.needs.toLocaleString()}</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rent, groceries, utility, medicine.</p>
              </div>

              {/* Wants card */}
              <div className={`glass-panel ${wantsEnvelopeExceeded ? 'danger-glow' : ''}`} style={{ 
                padding: '1.25rem', 
                borderLeft: '4px solid var(--color-wants)', 
                background: wantsEnvelopeExceeded ? 'rgba(244, 63, 94, 0.1)' : 'rgba(244, 63, 94, 0.05)',
                borderWidth: wantsEnvelopeExceeded ? '1px 1px 1px 4px' : '1px',
                borderColor: wantsEnvelopeExceeded ? 'rgba(244, 63, 94, 0.3)' : 'var(--glass-border)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1rem' }}>Wants (Optional)</h3>
                  {wantsEnvelopeExceeded ? (
                    <span style={{ fontSize: '0.75rem', background: 'var(--danger-color)', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#fff', fontWeight: 'bold' }}>ENVELOPE EMPTY</span>
                  ) : (
                    <span style={{ fontSize: '0.75rem', background: 'rgba(244, 63, 94, 0.2)', padding: '0.2rem 0.5rem', borderRadius: '4px', color: 'var(--color-wants)' }}>Envelope</span>
                  )}
                </div>
                <h4 style={{ fontSize: '1.5rem', margin: '0.5rem 0' }}>${spentByCat.wants.toLocaleString()}</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Envelope Limit: <strong style={{ color: '#fff' }}>${wantsLimit}</strong>
                </p>
                {wantsLimit > 0 && (
                  <div className="progress-bar-track" style={{ height: '4px', marginTop: '0.5rem' }}>
                    <div className="progress-bar-fill" style={{ 
                      width: `${Math.min((spentByCat.wants / wantsLimit) * 100, 100)}%`, 
                      backgroundColor: wantsEnvelopeExceeded ? 'var(--danger-color)' : 'var(--color-wants)'
                    }}></div>
                  </div>
                )}
              </div>

              {/* Experience card */}
              <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--color-experience)', background: 'rgba(168, 85, 247, 0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1rem' }}>Experience & Growth</h3>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(168, 85, 247, 0.2)', padding: '0.2rem 0.5rem', borderRadius: '4px', color: 'var(--color-experience)' }}>Investment</span>
                </div>
                <h4 style={{ fontSize: '1.5rem', margin: '0.5rem 0' }}>${spentByCat.experience.toLocaleString()}</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Books, courses, museums, travel.</p>
              </div>

              {/* Extra card */}
              <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--color-extra)', background: 'rgba(249, 115, 22, 0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1rem' }}>Extra (Unexpected)</h3>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(249, 115, 22, 0.2)', padding: '0.2rem 0.5rem', borderRadius: '4px', color: 'var(--color-extra)' }}>Emergency</span>
                </div>
                <h4 style={{ fontSize: '1.5rem', margin: '0.5rem 0' }}>${spentByCat.extra.toLocaleString()}</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Repairs, emergency medical, etc.</p>
              </div>

            </div>
          </section>

          {/* Cooling-off Period Tracker */}
          <section className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock style={{ color: 'var(--warning-color)' }} /> 24-48h Cooling-off Tracker
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Online desires are held here. Wait before confirming! Save money when the urge fades.</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '0.5rem 1rem', borderRadius: '8px', color: 'var(--success-color)' }}>
                <TrendingDown />
                <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Saved by waiting: ${savedByWaiting}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
              {/* Form to Add Cooling-off Item */}
              <form onSubmit={handleAddCoolingItem} className="glass-panel" style={{ padding: '1.25rem', border: '1px dashed var(--glass-border)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', alignItems: 'end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Item Name / Link</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Mechanical Keyboard" 
                    value={coolingName}
                    onChange={e => setCoolingName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Cost ($)</label>
                  <input 
                    type="number" 
                    placeholder="120" 
                    value={coolingCost}
                    onChange={e => setCoolingCost(e.target.value)}
                    required
                  />
                  {hourlyRate > 0 && coolingCost && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--warning-color)', marginTop: '0.2rem', display: 'block' }}>
                      ≈ {getLaborHours(coolingCost)} hours of labor
                    </span>
                  )}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Wait Period (Hours)</label>
                  <select 
                    value={coolingDuration}
                    onChange={e => setCoolingDuration(e.target.value)}
                  >
                    <option value="24">24 Hours (1 Day)</option>
                    <option value="48">48 Hours (2 Days)</option>
                    <option value="72">72 Hours (3 Days)</option>
                    <option value="168">168 Hours (1 Week)</option>
                    <option value="720">720 Hours (30 Days)</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.7rem' }}>
                  <Plus size={16} /> Hold Desire
                </button>
              </form>

              {/* List of Cooling-off Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {initialData.coolingOffItems.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>No items currently cooling down.</p>
                ) : (
                  initialData.coolingOffItems.map(item => {
                    // Calculate remaining time
                    const addedTime = new Date(item.added_date).getTime();
                    const durationMs = item.duration_hours * 60 * 60 * 1000;
                    const elapsed = Date.now() - addedTime;
                    const remainingMs = durationMs - elapsed;
                    const isCooldownComplete = remainingMs <= 0;

                    let remainingStr = '';
                    if (remainingMs > 0) {
                      const totalSec = Math.floor(remainingMs / 1000);
                      const hours = Math.floor(totalSec / 3600);
                      const minutes = Math.floor((totalSec % 3600) / 60);
                      const seconds = totalSec % 60;
                      remainingStr = `${hours}h ${minutes}m ${seconds}s left`;
                    }

                    return (
                      <div 
                        key={item.id} 
                        className="glass-panel" 
                        style={{ 
                          padding: '1rem', 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          flexWrap: 'wrap', 
                          gap: '1rem',
                          border: item.status !== 'pending' ? '1px solid rgba(255,255,255,0.02)' : '1px solid var(--glass-border)',
                          opacity: item.status !== 'pending' ? 0.5 : 1
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <strong style={{ fontSize: '1rem' }}>{item.name}</strong>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>(${item.cost})</span>
                            
                            {/* Status tags */}
                            {item.status === 'purchased' && (
                              <span style={{ fontSize: '0.7rem', color: 'var(--danger-color)', border: '1px solid var(--danger-color)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>BOUGHT</span>
                            )}
                            {item.status === 'dismissed' && (
                              <span style={{ fontSize: '0.7rem', color: 'var(--success-color)', border: '1px solid var(--success-color)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>DISMISSED (SAVED!)</span>
                            )}
                          </div>
                          
                          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            <span>Added: {new Date(item.added_date).toLocaleDateString()}</span>
                            <span>Period: {item.duration_hours}h</span>
                          </div>
                        </div>

                        {item.status === 'pending' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                            {!isCooldownComplete ? (
                              <span style={{ fontSize: '0.85rem', color: 'var(--warning-color)', display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(245, 158, 11, 0.1)', padding: '0.3rem 0.6rem', borderRadius: '6px' }}>
                                <Clock size={14} className="pulse-indicator" style={{ background: 'var(--warning-color)', boxShadow: '0 0 6px var(--warning-color)' }} /> {remainingStr}
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.85rem', color: 'var(--success-color)', display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(16, 185, 129, 0.1)', padding: '0.3rem 0.6rem', borderRadius: '6px' }}>
                                <CheckCircle size={14} /> Ready to Decide
                              </span>
                            )}

                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button 
                                onClick={() => handleResolveCooling(item.id, 'dismiss')}
                                className="btn btn-secondary" 
                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: 'var(--success-color)', borderColor: 'rgba(16, 185, 129, 0.3)' }}
                              >
                                <XCircle size={14} /> Dismiss (Save)
                              </button>
                              <button 
                                onClick={() => handleResolveCooling(item.id, 'buy')}
                                disabled={!isCooldownComplete}
                                className="btn btn-danger" 
                                style={{ 
                                  padding: '0.4rem 0.8rem', 
                                  fontSize: '0.8rem',
                                  opacity: isCooldownComplete ? 1 : 0.5,
                                  cursor: isCooldownComplete ? 'pointer' : 'not-allowed'
                                }}
                              >
                                <CheckCircle size={14} /> Mindfully Buy
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </section>

          {/* Monozukuri — Cherished Possessions & Care */}
          <section className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Hammer style={{ color: 'var(--color-experience)' }} /> Monozukuri 物作り (Respecting Belongings)
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Catalog and record maintenance logs for things you already own. Kakeibo emphasizes caring for your items to limit disposable, mindless buying habits.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
              {/* Add item form */}
              <form onSubmit={handleAddMono} className="glass-panel" style={{ padding: '1.25rem', border: '1px dashed var(--glass-border)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Item Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. MacBook Pro, Leather boots" 
                    value={monoName}
                    onChange={e => setMonoName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Description</label>
                  <input 
                    type="text" 
                    placeholder="Specific detail or value" 
                    value={monoDesc}
                    onChange={e => setMonoDesc(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Purchase Date</label>
                  <input 
                    type="date" 
                    value={monoDate}
                    onChange={e => setMonoDate(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.7rem' }}>
                  <Plus size={16} /> Catalog Item
                </button>
              </form>

              {/* Items Inventory List */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {initialData.monozukuriItems.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', gridColumn: '1 / -1' }}>No cherished belongings cataloged yet.</p>
                ) : (
                  initialData.monozukuriItems.map(item => (
                    <div key={item.id} className="glass-panel" style={{ padding: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                          <strong style={{ fontSize: '1.1rem', color: '#fff' }}>{item.name}</strong>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.description || 'No description'}</p>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Acquired: {new Date(item.purchase_date).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Care logs section */}
                      <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--brand-color)' }}>Maintenance Log</span>
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

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', maxHeight: '100px', overflowY: 'auto' }}>
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
            </div>
          </section>

        </div>

        {/* Right Side: Ledger Form & Reflection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Budget Config Panel */}
          <section className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PiggyBank style={{ color: 'var(--brand-color)' }} /> Month Settings
            </h3>
            
            <form onSubmit={handleBudgetSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Income ($)</label>
                <input 
                  type="number" 
                  value={income}
                  onChange={e => setIncome(Number(e.target.value))}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Savings Goal ($)</label>
                <input 
                  type="number" 
                  value={savingsGoal}
                  onChange={e => setSavingsGoal(Number(e.target.value))}
                />
                {income > 0 && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--success-color)', marginTop: '0.2rem', display: 'block' }}>
                    Saving {savingsPercent.toFixed(0)}% of income (Artificial Scarcity)
                  </span>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Wants Envelope Budget ($)</label>
                <input 
                  type="number" 
                  value={wantsLimit}
                  onChange={e => setWantsLimit(Number(e.target.value))}
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'block' }}>
                  Wants category limit for Envelope method.
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Hourly Wage ($/hour)</label>
                <input 
                  type="number" 
                  value={hourlyRate}
                  onChange={e => setHourlyRate(Number(e.target.value))}
                  placeholder="For calculating labor equivalence"
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'block' }}>
                  Computes how many hours of work are required for purchases.
                </span>
              </div>

              <button type="submit" disabled={isSavingBudget} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                {isSavingBudget ? 'Saving...' : 'Update Settings'}
              </button>
            </form>
          </section>

          {/* Expense Logger Form */}
          <section className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus style={{ color: 'var(--success-color)' }} /> Log Spending
            </h3>
            
            <form onSubmit={handleAddExpense} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Amount ($)</label>
                <input 
                  type="number" 
                  placeholder="25.50" 
                  value={expenseAmount}
                  onChange={e => setExpenseAmount(e.target.value)}
                  required
                />
                {hourlyRate > 0 && expenseAmount && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--warning-color)', marginTop: '0.25rem', display: 'block', fontWeight: '500' }}>
                    ⚠️ Costs {getLaborHours(expenseAmount)} hours of your labor
                  </span>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Category</label>
                <select 
                  value={expenseCategory}
                  onChange={e => setExpenseCategory(e.target.value)}
                >
                  <option value="needs">Needs (Essential utilities/groceries)</option>
                  <option value="wants">Wants (Discretionary/comforts)</option>
                  <option value="experience">Experience & Growth (Books, travel, courses)</option>
                  <option value="extra">Extra (Unplanned emergencies)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Description</label>
                <input 
                  type="text" 
                  placeholder="Groceries, book, dinner, electric bill" 
                  value={expenseDesc}
                  onChange={e => setExpenseDesc(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Date</label>
                <input 
                  type="date" 
                  value={expenseDate}
                  onChange={e => setExpenseDate(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ background: 'linear-gradient(135deg, var(--success-color), #059669)', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.2)' }}>
                Record Purchase
              </button>
            </form>
          </section>

          {/* Monthly Promise & Reflection Corner */}
          <section className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PenLine style={{ color: 'var(--brand-color)' }} /> Promise & Reflection
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1rem' }}>
              Write your focus promise at the start of the month. Reflect on how your habits did at the end.
            </p>
            
            <form onSubmit={handlePromiseSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Monthly Promise (Commitment)</label>
                <textarea 
                  rows={2}
                  placeholder="e.g. I promise to delay buying wants for 48 hours and stick to home-cooked meals."
                  value={promiseText}
                  onChange={e => setPromiseText(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>End-of-Month Reflection</label>
                <textarea 
                  rows={3}
                  placeholder="How did you spend? Did you feel mindful? What changes will you make next month?"
                  value={reflectionText}
                  onChange={e => setReflectionText(e.target.value)}
                />
              </div>

              <button type="submit" disabled={isSavingPromise} className="btn btn-secondary">
                {isSavingPromise ? 'Saving...' : 'Save Promise & Reflection'}
              </button>
            </form>
          </section>

          {/* Ledger History */}
          <section className="glass-panel" style={{ padding: '1.5rem', maxHeight: '400px', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Ledger for {selectedMonth}</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {initialData.expenses.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>No expenses recorded this month.</p>
              ) : (
                initialData.expenses.map(exp => (
                  <div 
                    key={exp.id} 
                    style={{ 
                      padding: '0.75rem', 
                      background: 'rgba(255, 255, 255, 0.02)', 
                      border: '1px solid var(--glass-border)', 
                      borderRadius: '8px', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center' 
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ 
                          width: '8px', 
                          height: '8px', 
                          borderRadius: '50%', 
                          background: exp.category === 'needs' ? 'var(--color-needs)' :
                                      exp.category === 'wants' ? 'var(--color-wants)' :
                                      exp.category === 'experience' ? 'var(--color-experience)' :
                                      'var(--color-extra)' 
                        }} />
                        <strong style={{ fontSize: '0.9rem' }}>{exp.description}</strong>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                        {exp.date} • {exp.category.toUpperCase()}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <strong style={{ fontSize: '1rem' }}>${exp.amount}</strong>
                      <button 
                        onClick={() => handleDeleteExpense(exp.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                        className="tooltip"
                      >
                        <Trash2 size={14} style={{ color: 'var(--danger-color)', opacity: 0.7 }} />
                        <span className="tooltiptext" style={{ width: '80px', marginLeft: '-40px' }}>Delete</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

        </div>

      </div>

    </div>
  );
}
