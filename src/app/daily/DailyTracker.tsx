'use client';

import React, { useState } from 'react';
import { Check, CalendarCheck, Award, PiggyBank, Flame, Star } from 'lucide-react';
import Header from '../Header';
import { updateDailyLog } from '../actions';

interface DailyTrackerProps {
  initialData: {
    budget: any;
    dailyLogs: any[];
    settings: any;
  };
  currentMonth: string;
}

const AVAILABLE_HABITS = [
  { id: 'budget', label: 'Checked budget & logged expenses', icon: '📝' },
  { id: 'no_spend', label: 'No-Spend Day (Zero Wants)', icon: '🚫' },
  { id: 'monozukuri', label: 'Maintained/cared for a belonging', icon: '🧹' },
  { id: 'growth', label: 'Invested in growth (Read / Book)', icon: '📖' },
  { id: 'cooking', label: 'Cooked at home (Mindful eating)', icon: '🍳' },
];

export default function DailyTracker({ initialData, currentMonth }: DailyTrackerProps) {
  const [selectedMonth] = useState(currentMonth);

  // Parse days in month
  const [yearStr, monthStr] = selectedMonth.split('-');
  const year = parseInt(yearStr);
  const monthIdx = parseInt(monthStr) - 1;
  const numDays = new Date(year, monthIdx + 1, 0).getDate();

  // Get current active selected day
  const todayDateString = new Date().toISOString().split('T')[0];
  const defaultDay = todayDateString.startsWith(selectedMonth) 
    ? new Date().getDate() 
    : 1;

  const [activeDay, setActiveDay] = useState<number>(defaultDay);

  const handleMonthChange = (newMonth: string) => {
    window.location.search = `?month=${newMonth}`;
  };

  const getLogForDay = (dayNum: number) => {
    const dayStr = String(dayNum).padStart(2, '0');
    const dateStr = `${selectedMonth}-${dayStr}`;
    return initialData.dailyLogs.find(log => log.date === dateStr);
  };

  const handleHabitToggle = async (dayNum: number, habitId: string) => {
    const dayStr = String(dayNum).padStart(2, '0');
    const dateStr = `${selectedMonth}-${dayStr}`;
    const log = getLogForDay(dayNum);
    let habits: string[] = log ? [...log.habits] : [];

    if (habits.includes(habitId)) {
      habits = habits.filter(h => h !== habitId);
    } else {
      habits.push(habitId);
    }

    await updateDailyLog(dateStr, habits);
  };

  // ----------------------------------------------------
  // Streak calculations
  // ----------------------------------------------------
  const calculateStreak = () => {
    const sortedLogs = [...initialData.dailyLogs]
      .filter(log => log.habits.length > 0)
      .map(log => parseInt(log.date.split('-')[2]))
      .sort((a, b) => b - a); // descending order (newest first)

    if (sortedLogs.length === 0) return 0;

    let streak = 0;
    let expectedDay = sortedLogs[0];

    // Check if the latest log is within 1 day of today to consider active
    const today = new Date().getDate();
    const todayDateString = new Date().toISOString().split('T')[0];
    const isCurrentMonth = todayDateString.startsWith(selectedMonth);
    
    if (isCurrentMonth && (today - expectedDay) > 1) {
      return 0; // Streak broken
    }

    for (let day of sortedLogs) {
      if (day === expectedDay) {
        streak++;
        expectedDay--; // expect previous day
      } else if (day === expectedDay + 1) {
        // duplicate logs on same day (should not happen with unique constraint, but just in case)
        continue;
      } else {
        break; // gap found, streak ends
      }
    }
    return streak;
  };

  const currentStreak = calculateStreak();

  // Summary tallies
  const totalLogsThisMonth = initialData.dailyLogs.length;
  const totalHabitsCompleted = initialData.dailyLogs.reduce((sum, log) => sum + log.habits.length, 0);
  const noSpendDays = initialData.dailyLogs.filter(log => log.habits.includes('no_spend')).length;

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
        
        {/* Left Side: Calendar Grid */}
        <div className="lg:col-span-2 space-y-6">
          
          <section className="glass-panel rounded-2xl p-6 bg-slate-900/20 border-white/5 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="text-lg font-bold text-primary flex items-center gap-2">
                  <CalendarCheck className="text-brand" size={20} /> Calendar Habit Grid
                </h2>
                <p className="text-xs text-secondary mt-0.5">
                  Select a day to track your Kakeibo daily habits and commitments.
                </p>
              </div>

              {/* Streak Badge */}
              <div className="px-3.5 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center gap-1.5">
                <Flame size={16} className="animate-pulse" />
                <span className="text-xs font-bold">Active Streak: {currentStreak} Days</span>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center pt-2">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-[10px] font-bold text-muted uppercase tracking-wider">
                  {day}
                </div>
              ))}

              {/* Pad blank days */}
              {Array.from({ length: new Date(year, monthIdx, 1).getDay() }).map((_, idx) => (
                <div key={`empty-${idx}`} className="opacity-0" />
              ))}

              {/* Days of the month */}
              {Array.from({ length: numDays }).map((_, idx) => {
                const dayNum = idx + 1;
                const log = getLogForDay(dayNum);
                const count = log ? log.habits.length : 0;
                const isActive = activeDay === dayNum;

                let cellBg = 'bg-slate-900/20 border-white/5';
                let hoverStyle = 'hover:border-brand/40';
                
                if (count === 5) {
                  cellBg = 'bg-brand/10 border-brand/40 text-brand';
                } else if (count > 0) {
                  cellBg = 'bg-brand/5 border-brand/20 text-brand-hover';
                }

                return (
                  <button
                    key={`day-${dayNum}`}
                    onClick={() => setActiveDay(dayNum)}
                    className={`aspect-square rounded-xl flex flex-col justify-center items-center cursor-pointer border transition-all ${cellBg} ${hoverStyle} ${
                      isActive ? 'border-brand ring-2 ring-brand/20 scale-[1.02]' : ''
                    }`}
                  >
                    <span className={`text-xs font-bold ${isActive ? 'text-primary' : 'text-secondary'}`}>
                      {dayNum}
                    </span>
                    {count > 0 && (
                      <span className="text-[8px] font-extrabold uppercase mt-1">
                        {count}/5
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Quick Stats Summary Footer */}
          <section className="grid grid-cols-2 gap-4">
            <div className="glass-panel rounded-2xl p-5 bg-slate-900/20 border-white/5 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-brand/15 text-brand">
                <Award size={24} />
              </div>
              <div>
                <span className="text-[10px] text-secondary font-bold uppercase tracking-wider block">Total Habits Logged</span>
                <strong className="text-xl font-extrabold text-primary">{totalHabitsCompleted} Completed</strong>
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-5 bg-slate-900/20 border-white/5 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-orange-500/15 text-orange-400">
                <PiggyBank size={24} />
              </div>
              <div>
                <span className="text-[10px] text-secondary font-bold uppercase tracking-wider block">No-Spend Days</span>
                <strong className="text-xl font-extrabold text-primary">{noSpendDays} Days</strong>
              </div>
            </div>
          </section>

        </div>

        {/* Right Side: Log Habit checklist panel */}
        <div>
          <section className="glass-panel rounded-2xl p-5 bg-slate-900/20 border-white/5 space-y-6">
            <div className="border-b border-white/5 pb-4">
              <span className="text-[9px] text-secondary font-bold uppercase tracking-wider block">Habit Checklist</span>
              <h3 className="text-lg font-bold text-primary">
                Day {activeDay} Check-In
              </h3>
              <span className="text-xs text-muted block mt-0.5">
                {selectedMonth}-{String(activeDay).padStart(2, '0')}
              </span>
            </div>

            <div className="space-y-3">
              {AVAILABLE_HABITS.map(habit => {
                const log = getLogForDay(activeDay);
                const isChecked = log ? log.habits.includes(habit.id) : false;

                return (
                  <button
                    key={habit.id}
                    onClick={() => handleHabitToggle(activeDay, habit.id)}
                    className={`w-full p-4 rounded-xl border flex justify-between items-center text-left transition-all ${
                      isChecked 
                        ? 'border-brand bg-brand/10 text-brand' 
                        : 'border-white/5 bg-slate-900/40 text-secondary hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{habit.icon}</span>
                      <span className="text-xs font-semibold text-primary">{habit.label}</span>
                    </div>

                    <div className={`w-5 h-5 rounded-full border flex justify-center items-center transition-all ${
                      isChecked ? 'bg-brand border-transparent' : 'border-white/20'
                    }`}>
                      {isChecked && <Check size={12} className="text-white font-extrabold" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Daily Wisdom Quote */}
            <div className="p-4 rounded-xl bg-brand/5 border border-brand/10 flex gap-3 text-xs leading-relaxed text-secondary mt-6">
              <span className="text-brand text-lg font-bold">💡</span>
              <p>
                <strong>Zen Tip:</strong> Every checked box is a step toward mindful wealth. Checking *No-Spend Day* patches the leaks in your financial bucket.
              </p>
            </div>
          </section>
        </div>

      </div>

    </div>
  );
}
