'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingDown, 
  Hammer, 
  PenLine, 
  PiggyBank,
  AlertTriangle,
  Flame,
  User,
  HeartCrack,
  ChevronRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line 
} from 'recharts';
import Header from './Header';
import { 
  updateBudget, 
  addExpense, 
  addCoolingOffItem, 
  resolveCoolingOffItem, 
  updatePromise 
} from './actions';

interface KakeiboDashboardProps {
  initialData: {
    budget: any;
    expenses: any[];
    coolingOffItems: any[];
    monozukuriItems: any[];
    promise: any;
    settings: any;
  };
  currentMonth: string; // YYYY-MM
}

export default function KakeiboDashboard({ initialData, currentMonth }: KakeiboDashboardProps) {
  const [isMounted, setIsMounted] = useState(false);

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

  // Promises & Reflection
  const [promiseText, setPromiseText] = useState(initialData.promise.promise_text || '');
  const [reflectionText, setReflectionText] = useState(initialData.promise.reflection || '');
  const [isSavingPromise, setIsSavingPromise] = useState(false);

  // Month State
  const [selectedMonth] = useState(currentMonth);

  // Force re-renders for timers
  const [, setTick] = useState(0);

  useEffect(() => {
    setIsMounted(true);
    const timer = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update states when initialData changes
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
    unexpected: initialData.expenses.filter(e => e.category === 'unexpected' || e.category === 'extra').reduce((sum, e) => sum + e.amount, 0),
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

  // Action Submissions
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

  const handlePromiseSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPromise(true);
    try {
      await updatePromise(selectedMonth, promiseText, reflectionText);
      alert('Promise & Reflection saved!');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingPromise(false);
    }
  };

  const handleMonthChange = (newMonth: string) => {
    window.location.search = `?month=${newMonth}`;
  };

  // Helper for labor hour calculation
  const getLaborHours = (amount: number | string) => {
    const num = Number(amount);
    if (!num || !hourlyRate || Number(hourlyRate) <= 0) return 0;
    return (num / Number(hourlyRate)).toFixed(1);
  };

  // ----------------------------------------------------
  // Chart Data preparation
  // ----------------------------------------------------
  
  // 1. Category Bar Chart Data
  const categoryBarData = [
    { name: 'Needs', amount: spentByCat.needs, color: '#3b82f6' },
    { name: 'Wants', amount: spentByCat.wants, color: '#f43f5e' },
    { name: 'Experience', amount: spentByCat.experience, color: '#a855f7' },
    { name: 'Unexpected', amount: spentByCat.unexpected, color: '#eab308' },
  ];

  // 2. Daily Trendline (Cumulative)
  const getTrendData = () => {
    const [yStr, mStr] = selectedMonth.split('-');
    const daysInMonth = new Date(parseInt(yStr), parseInt(mStr), 0).getDate();
    const data = [];
    
    // Sort expenses ascending by day
    const expensesWithDays = initialData.expenses.map(exp => {
      const day = parseInt(exp.date.split('-')[2]);
      return { ...exp, day };
    }).sort((a, b) => a.day - b.day);

    let cumulativeSum = 0;
    const dailySpendLimit = spendablePool > 0 ? spendablePool / daysInMonth : 0;

    for (let day = 1; day <= daysInMonth; day++) {
      // Find sum of expenses for this specific day
      const daySum = expensesWithDays
        .filter(exp => exp.day === day)
        .reduce((sum, exp) => sum + exp.amount, 0);
      
      cumulativeSum += daySum;

      // Only display trend points up to today if looking at current month
      const today = new Date();
      const isCurrentMonth = today.getFullYear() === parseInt(yStr) && (today.getMonth() + 1) === parseInt(mStr);
      if (isCurrentMonth && day > today.getDate()) {
        // Future day, skip cumulative spend line but keep limit line for full graph reference
        data.push({
          day: `Day ${day}`,
          BudgetLimit: Math.round(dailySpendLimit * day)
        });
      } else {
        data.push({
          day: `Day ${day}`,
          Spent: Math.round(cumulativeSum),
          BudgetLimit: Math.round(dailySpendLimit * day)
        });
      }
    }
    return data;
  };

  const trendData = getTrendData();

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-500">
        Loading Mindful Space...
      </div>
    );
  }

  // Check if onboarding state is needed (no income is set)
  const showOnboarding = income === 0;

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

      {showOnboarding ? (
        /* Empty / Onboarding state highlighting core leaky bucket philosophy */
        <div className="glass-panel rounded-2xl p-8 text-center max-w-2xl mx-auto space-y-6 border-white/5">
          <div className="text-4xl">🧘</div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-brand to-cyan-400 bg-clip-text text-transparent">
            Welcome to Zen Spend (家計簿)
          </h2>
          
          <div className="text-sm leading-relaxed text-secondary space-y-4">
            <p>
              Imagine two rainwater collectors:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6 text-left">
              <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10">
                <span className="font-bold text-rose-400 block mb-1">The Leaky Bucket</span>
                A person with a massive income, but an uncontrolled bucket full of holes. No matter how much water falls, the bucket remains empty.
              </div>
              <div className="p-4 rounded-xl bg-brand/5 border border-brand/10">
                <span className="font-bold text-brand block mb-1">The Disciplined Cup</span>
                A person with a smaller income, but a strong, solid cup. By patching the leaks of mindless spending, they gather wealth and stability.
              </div>
            </div>
            <p>
              Kakeibo is the art of patching those leaks. It begins by deciding your income, saving first, and spending the rest mindfully.
            </p>
          </div>

          <div className="pt-4">
            <button 
              onClick={() => {
                // Focus budget config or set defaults
                setIncome(4500);
                setSavingsGoal(1000);
                setHourlyRate(25);
                setWantsLimit(600);
              }}
              className="btn btn-primary"
            >
              Patch My Leaky Bucket (Use Default Setup)
            </button>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Financial summaries & Charts */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Financial KPI Indicators */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-panel rounded-2xl p-5 relative overflow-hidden bg-slate-900/20 border-white/5">
              <div className="absolute right-0 bottom-0 opacity-5 text-brand transform translate-x-2 translate-y-2 pointer-events-none">
                <PiggyBank size={96} />
              </div>
              <span className="text-xs font-bold text-secondary uppercase tracking-wider">Monthly Spending Pool</span>
              <h2 className="text-3xl font-extrabold mt-1 text-primary">
                {initialData.settings.currency}{spendablePool.toLocaleString()}
              </h2>
              <p className="text-[10px] text-muted mt-1.5">
                Income: {initialData.settings.currency}{income} | Savings Goal: {initialData.settings.currency}{savingsGoal}
              </p>
            </div>

            <div className="glass-panel rounded-2xl p-5 bg-slate-900/20 border-white/5">
              <span className="text-xs font-bold text-secondary uppercase tracking-wider">Total Spent</span>
              <h2 className={`text-3xl font-extrabold mt-1 ${totalSpent > spendablePool ? 'text-rose-400' : 'text-primary'}`}>
                {initialData.settings.currency}{totalSpent.toLocaleString()}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <div className="progress-bar-track">
                  <div 
                    className="progress-bar-fill" 
                    style={{ 
                      width: `${Math.min(spentPercent, 100)}%`, 
                      backgroundColor: spentPercent > 100 ? 'var(--color-wants)' : 'var(--color-brand)'
                    }}
                  />
                </div>
                <span className="text-[10px] text-secondary font-bold">{spentPercent.toFixed(0)}%</span>
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-5 bg-slate-900/20 border-white/5">
              <span className="text-xs font-bold text-secondary uppercase tracking-wider">Remaining Balance</span>
              <h2 className={`text-3xl font-extrabold mt-1 ${remainingPool < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {initialData.settings.currency}{remainingPool.toLocaleString()}
              </h2>
              <span className="text-[10px] text-muted block mt-1.5">
                {remainingPool < 0 ? 'Exceeded Budget' : 'Safe to spend'}
              </span>
            </div>
          </section>

          {/* Kakeibo The Four Pillars Cards */}
          <section className="glass-panel rounded-2xl p-6 bg-slate-900/10 border-white/5 space-y-4">
            <h2 className="text-lg font-bold text-primary flex items-center gap-2">
              The Four Pillars <span className="text-xs font-normal text-secondary">家計簿 Envelopes</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Needs */}
              <div className="glass-panel rounded-xl p-4 border-l-4 border-l-needs bg-slate-900/30">
                <div className="flex justify-between items-start text-xs">
                  <span className="text-secondary font-bold">Needs</span>
                  <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold uppercase text-[9px]">Essential</span>
                </div>
                <h3 className="text-xl font-bold mt-2">{initialData.settings.currency}{spentByCat.needs.toLocaleString()}</h3>
                <p className="text-[9px] text-muted mt-1 leading-normal">Rent, electricity, groceries, medicines.</p>
              </div>

              {/* Wants */}
              <div className={`glass-panel rounded-xl p-4 border-l-4 border-l-wants ${
                wantsEnvelopeExceeded ? 'border-rose-500/30 bg-rose-500/5' : 'bg-slate-900/30'
              }`}>
                <div className="flex justify-between items-start text-xs">
                  <span className="text-secondary font-bold">Wants</span>
                  {wantsEnvelopeExceeded ? (
                    <span className="px-1.5 py-0.5 rounded bg-rose-500 text-white font-bold uppercase text-[9px]">EMPTY</span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 font-bold uppercase text-[9px]">Envelope</span>
                  )}
                </div>
                <h3 className="text-xl font-bold mt-2">{initialData.settings.currency}{spentByCat.wants.toLocaleString()}</h3>
                <p className="text-[9px] text-secondary mt-1">
                  Envelope Limit: <span className="text-primary font-bold">{initialData.settings.currency}{wantsLimit}</span>
                </p>
                {wantsLimit > 0 && (
                  <div className="progress-bar-track mt-1.5" style={{ height: '3px' }}>
                    <div 
                      className="progress-bar-fill" 
                      style={{ 
                        width: `${Math.min((spentByCat.wants / wantsLimit) * 100, 100)}%`, 
                        backgroundColor: wantsEnvelopeExceeded ? 'var(--color-wants)' : 'var(--color-brand)'
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Experience */}
              <div className="glass-panel rounded-xl p-4 border-l-4 border-l-experience bg-slate-900/30">
                <div className="flex justify-between items-start text-xs">
                  <span className="text-secondary font-bold">Experience</span>
                  <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 font-bold uppercase text-[9px]">Growth</span>
                </div>
                <h3 className="text-xl font-bold mt-2">{initialData.settings.currency}{spentByCat.experience.toLocaleString()}</h3>
                <p className="text-[9px] text-muted mt-1 leading-normal">Books, courses, travel, cultural visits.</p>
              </div>

              {/* Unexpected */}
              <div className="glass-panel rounded-xl p-4 border-l-4 border-l-unexpected bg-slate-900/30">
                <div className="flex justify-between items-start text-xs">
                  <span className="text-secondary font-bold">Unexpected</span>
                  <span className="px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400 font-bold uppercase text-[9px]">Emergency</span>
                </div>
                <h3 className="text-xl font-bold mt-2">{initialData.settings.currency}{spentByCat.unexpected.toLocaleString()}</h3>
                <p className="text-[9px] text-muted mt-1 leading-normal">Repairs, medical emergencies, fines.</p>
              </div>
            </div>
          </section>

          {/* Recharts Analytics Centerpiece */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Category Bar Chart */}
            <div className="glass-panel rounded-2xl p-5 bg-slate-900/20 border-white/5 space-y-4">
              <h3 className="text-sm font-bold text-secondary uppercase tracking-wider">Spending By Category</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={10} tickLine={false} />
                    <YAxis stroke="var(--text-secondary)" fontSize={10} tickLine={false} axisLine={false} />
                    <ChartTooltip 
                      contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                      {categoryBarData.map((entry, index) => (
                        <Bar key={`bar-${index}`} dataKey="amount" fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Daily Cumulative Line Chart */}
            <div className="glass-panel rounded-2xl p-5 bg-slate-900/20 border-white/5 space-y-4">
              <h3 className="text-sm font-bold text-secondary uppercase tracking-wider">Cumulative Spend vs Budget</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="day" stroke="var(--text-secondary)" fontSize={9} tickLine={false} />
                    <YAxis stroke="var(--text-secondary)" fontSize={9} tickLine={false} axisLine={false} />
                    <ChartTooltip 
                      contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    />
                    <Line type="monotone" dataKey="Spent" stroke="var(--color-brand)" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="BudgetLimit" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

          </section>

          {/* Cooling-off Desire Tracker */}
          <section className="glass-panel rounded-2xl p-6 bg-slate-900/20 border-white/5 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="text-lg font-bold text-primary flex items-center gap-2">
                  <Flame className="text-orange-500 animate-pulse" size={20} /> 24-48h Cooling-Off Tracker
                </h2>
                <p className="text-xs text-secondary">
                  Add non-essential wishes here. Wait for the cooldown to clear. See how much impulse spending you save!
                </p>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1.5">
                <TrendingDown size={14} />
                <span className="text-xs font-bold">Saved by Waiting: {initialData.settings.currency}{savedByWaiting}</span>
              </div>
            </div>

            {/* Quick add cooling off item */}
            <form onSubmit={handleAddCoolingItem} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end bg-slate-950/20 p-4 rounded-xl border border-white/5">
              <div className="sm:col-span-2">
                <label className="text-[10px] text-secondary font-bold uppercase tracking-wider block mb-1">Item / Desire Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Ergonomic Office Chair"
                  value={coolingName}
                  onChange={e => setCoolingName(e.target.value)}
                  className="text-sm bg-slate-900/60"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] text-secondary font-bold uppercase tracking-wider block mb-1">Cost ({initialData.settings.currency})</label>
                <input 
                  type="number"
                  placeholder="199"
                  value={coolingCost}
                  onChange={e => setCoolingCost(e.target.value)}
                  className="text-sm bg-slate-900/60"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] text-secondary font-bold uppercase tracking-wider block mb-1">Cooldown Duration</label>
                <select 
                  value={coolingDuration}
                  onChange={e => setCoolingDuration(e.target.value)}
                  className="text-sm bg-slate-900/60 h-[40px] px-2 py-1 focus:outline-none"
                >
                  <option value="24">24 Hours (1 Day)</option>
                  <option value="48">48 Hours (2 Days)</option>
                  <option value="72">72 Hours (3 Days)</option>
                  <option value="720">720 Hours (30 Days)</option>
                </select>
              </div>
              <button type="submit" className="sm:col-span-4 btn btn-primary py-2.5 w-full flex items-center justify-center gap-1 text-sm mt-2">
                <Plus size={16} /> Hold Desire in Cooling Tank
              </button>
            </form>

            {/* Cooling off items list */}
            <div className="space-y-3">
              {initialData.coolingOffItems.length === 0 ? (
                <p className="text-xs text-muted text-center py-4">No desires cooling off. Your bucket has zero leaks!</p>
              ) : (
                initialData.coolingOffItems.map(item => {
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
                      className={`p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all ${
                        item.status !== 'pending' 
                          ? 'bg-slate-900/10 border-white/5 opacity-50' 
                          : 'bg-slate-900/40 border-white/10'
                      }`}
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <strong className="text-sm text-primary">{item.name}</strong>
                          <span className="text-xs text-secondary">({initialData.settings.currency}{item.cost})</span>
                          
                          {item.status === 'purchased' && (
                            <span className="text-[8px] font-bold border border-rose-500/30 text-rose-400 px-1.5 py-0.5 rounded">ACQUIRED</span>
                          )}
                          {item.status === 'dismissed' && (
                            <span className="text-[8px] font-bold border border-brand/30 text-brand px-1.5 py-0.5 rounded">SAVED</span>
                          )}
                        </div>
                        
                        <div className="flex gap-3 text-[10px] text-secondary mt-1">
                          <span>Added: {new Date(item.added_date).toLocaleDateString()}</span>
                          {hourlyRate > 0 && (
                            <span className="text-orange-400 font-bold">≈ {getLaborHours(item.cost)} Hours of Work</span>
                          )}
                        </div>
                      </div>

                      {item.status === 'pending' && (
                        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                          {!isCooldownComplete ? (
                            <span className="text-xs text-orange-400 bg-orange-400/10 px-2 py-1 rounded-lg flex items-center gap-1.5 border border-orange-400/25">
                              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping" />
                              {remainingStr}
                            </span>
                          ) : (
                            <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg flex items-center gap-1.5 border border-emerald-500/20">
                              <CheckCircle size={12} /> Expiry Cleared! Still want it?
                            </span>
                          )}

                          <div className="flex gap-2 w-full sm:w-auto">
                            <button 
                              onClick={() => handleResolveCooling(item.id, 'dismiss')}
                              className="btn btn-secondary py-1 px-3 text-xs text-brand border-brand/25 bg-brand/5 hover:bg-brand/10 w-full sm:w-auto flex items-center gap-1"
                            >
                              <XCircle size={12} /> Dismiss (Save)
                            </button>
                            <button 
                              onClick={() => handleResolveCooling(item.id, 'buy')}
                              disabled={!isCooldownComplete}
                              className="btn btn-danger py-1 px-3 text-xs w-full sm:w-auto flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <CheckCircle size={12} /> Buy
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

          </section>

        </div>

        {/* Right 1 Column: Quick Add forms & reflections */}
        <div className="space-y-6">
          
          {/* Quick Log Expense Form */}
          <section className="glass-panel rounded-2xl p-5 bg-slate-900/20 border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-secondary uppercase tracking-wider flex items-center gap-2">
              <Plus size={16} className="text-brand" /> Log Spending (家計簿)
            </h3>
            
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="text-[10px] text-secondary font-bold uppercase tracking-wider block mb-1">Amount ({initialData.settings.currency})</label>
                <input 
                  type="number" 
                  placeholder="25.50" 
                  value={expenseAmount}
                  onChange={e => setExpenseAmount(e.target.value)}
                  className="text-sm"
                  required
                />
                {hourlyRate > 0 && expenseAmount && (
                  <span className="text-[10px] text-orange-400 font-bold block mt-1.5 flex items-center gap-1">
                    <AlertTriangle size={10} /> Equates to ~{getLaborHours(expenseAmount)} hours of work!
                  </span>
                )}
              </div>

              <div>
                <label className="text-[10px] text-secondary font-bold uppercase tracking-wider block mb-1">Category</label>
                <select 
                  value={expenseCategory}
                  onChange={e => setExpenseCategory(e.target.value)}
                  className="text-sm"
                >
                  <option value="needs">Needs (Essential life costs)</option>
                  <option value="wants">Wants (Comforts & desires)</option>
                  <option value="experience">Experience & Growth</option>
                  <option value="unexpected">Unexpected (Emergency)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-secondary font-bold uppercase tracking-wider block mb-1">Description</label>
                <input 
                  type="text" 
                  placeholder="e.g. Groceries, Book, Fine" 
                  value={expenseDesc}
                  onChange={e => setExpenseDesc(e.target.value)}
                  className="text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-secondary font-bold uppercase tracking-wider block mb-1">Date</label>
                <input 
                  type="date" 
                  value={expenseDate}
                  onChange={e => setExpenseDate(e.target.value)}
                  className="text-sm"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="w-full btn btn-primary py-2.5 flex items-center justify-center gap-1.5 text-sm"
              >
                Record Purchase
              </button>
            </form>
          </section>

          {/* Month Promise & Reflection */}
          <section className="glass-panel rounded-2xl p-5 bg-slate-900/20 border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-secondary uppercase tracking-wider flex items-center gap-2">
              <PenLine size={16} className="text-brand" /> Promises & Reflection
            </h3>
            <p className="text-[11px] text-secondary leading-relaxed">
              Kakeibo calls for a **promise** at the start of the month and a **reflection** journal at the end.
            </p>
            
            <form onSubmit={handlePromiseSave} className="space-y-4">
              <div>
                <label className="text-[10px] text-secondary font-bold uppercase tracking-wider block mb-1">Monthly Promise (Commitment)</label>
                <textarea 
                  rows={2}
                  placeholder="e.g. I promise to avoid takeout on weekdays and wait 48h before purchasing items."
                  value={promiseText}
                  onChange={e => setPromiseText(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-secondary font-bold uppercase tracking-wider block mb-1">Monthly Reflection (Review)</label>
                <textarea 
                  rows={3}
                  placeholder="e.g. I met my savings goal! Delaying purchases helped me realize I didn't need half of them."
                  value={reflectionText}
                  onChange={e => setReflectionText(e.target.value)}
                  className="text-xs"
                />
              </div>

              <button 
                type="submit" 
                disabled={isSavingPromise} 
                className="w-full btn btn-secondary py-2 text-xs flex items-center justify-center gap-1.5"
              >
                {isSavingPromise ? 'Saving...' : 'Save Commitments'}
              </button>
            </form>
          </section>

          {/* Month Settings shortcuts */}
          <section className="glass-panel rounded-2xl p-5 bg-slate-900/20 border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-secondary uppercase tracking-wider flex items-center gap-2">
              <PiggyBank size={16} className="text-brand" /> Quick Month Settings
            </h3>
            <form onSubmit={handleBudgetSave} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] text-secondary font-bold uppercase block mb-1">Income</label>
                  <input 
                    type="number" 
                    value={income}
                    onChange={e => setIncome(Number(e.target.value))}
                    className="text-xs p-2"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-secondary font-bold uppercase block mb-1">Savings Goal</label>
                  <input 
                    type="number" 
                    value={savingsGoal}
                    onChange={e => setSavingsGoal(Number(e.target.value))}
                    className="text-xs p-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] text-secondary font-bold uppercase block mb-1">Wants Envelope</label>
                  <input 
                    type="number" 
                    value={wantsLimit}
                    onChange={e => setWantsLimit(Number(e.target.value))}
                    className="text-xs p-2"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-secondary font-bold uppercase block mb-1">Hourly Wage</label>
                  <input 
                    type="number" 
                    value={hourlyRate}
                    onChange={e => setHourlyRate(Number(e.target.value))}
                    className="text-xs p-2"
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isSavingBudget} 
                className="w-full btn btn-primary py-2 text-xs flex items-center justify-center"
              >
                {isSavingBudget ? 'Updating...' : 'Save Parameters'}
              </button>
            </form>
          </section>

        </div>

      </div>

    </div>
  );
}
