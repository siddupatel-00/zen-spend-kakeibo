'use client';

import React, { useState } from 'react';
import { Check, CalendarCheck, Award, PiggyBank, Heart } from 'lucide-react';
import Header from '../Header';
import { updateDailyLog } from '../actions';

interface DailyTrackerProps {
  initialData: {
    budget: any;
    dailyLogs: any[];
  };
  currentMonth: string;
}

const AVAILABLE_HABITS = [
  { id: 'budget', label: 'Checked budget & logged expenses', icon: '📝' },
  { id: 'no_spend', label: 'No Spend Day (Zero Wants)', icon: '🚫' },
  { id: 'monozukuri', label: 'Maintained or cared for a belonging', icon: '🧹' },
  { id: 'growth', label: 'Invested in growth (Read / Course)', icon: '📖' },
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

  // Stats
  const totalLogsThisMonth = initialData.dailyLogs.length;
  const totalHabitsCompleted = initialData.dailyLogs.reduce((sum, log) => sum + log.habits.length, 0);
  const noSpendDays = initialData.dailyLogs.filter(log => log.habits.includes('no_spend')).length;

  return (
    <div style={{ padding: '2rem 1rem', maxWidth: '1400px', margin: '0 auto' }}>
      
      <Header 
        insuranceTerm={initialData.budget.insurance_term || 0}
        insuranceHealth={initialData.budget.insurance_health || 0}
        selectedMonth={selectedMonth}
        onMonthChange={handleMonthChange}
      />

      <div className="dashboard-grid">
        
        {/* Left Side: Calendar Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <section className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CalendarCheck style={{ color: 'var(--accent-color)' }} /> Calendar Habit Grid
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Select a day in the month to log your daily financial and mindful practices.
            </p>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(7, 1fr)', 
              gap: '0.75rem',
              textAlign: 'center'
            }}>
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {day}
                </div>
              ))}

              {/* Pad blank days at the beginning of calendar */}
              {Array.from({ length: new Date(year, monthIdx, 1).getDay() }).map((_, idx) => (
                <div key={`empty-${idx}`} style={{ opacity: 0.1 }} />
              ))}

              {/* Days of the month */}
              {Array.from({ length: numDays }).map((_, idx) => {
                const dayNum = idx + 1;
                const log = getLogForDay(dayNum);
                const count = log ? log.habits.length : 0;
                const isActive = activeDay === dayNum;

                let cellBg = 'rgba(128,128,128,0.05)';
                let borderStyle = '1px solid var(--border-color)';
                
                if (count === 5) {
                  cellBg = 'rgba(16, 185, 129, 0.2)'; // 100% complete
                  borderStyle = '1px solid var(--accent-color)';
                } else if (count > 0) {
                  cellBg = 'rgba(16, 185, 129, 0.08)'; // partial
                }

                if (isActive) {
                  borderStyle = '2px solid var(--text-primary)';
                }

                return (
                  <button
                    key={`day-${dayNum}`}
                    onClick={() => setActiveDay(dayNum)}
                    className="glass-panel"
                    style={{
                      aspectRatio: '1',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      cursor: 'pointer',
                      border: borderStyle,
                      background: cellBg,
                      position: 'relative',
                      padding: '0.25rem'
                    }}
                  >
                    <span style={{ fontSize: '1rem', fontWeight: 'bold', color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                      {dayNum}
                    </span>
                    {count > 0 && (
                      <span style={{ 
                        fontSize: '0.65rem', 
                        color: 'var(--accent-color)', 
                        marginTop: '0.2rem',
                        fontWeight: '600'
                      }}>
                        {count}/5
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Quick Stats Summary */}
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Award size={32} style={{ color: 'var(--accent-color)' }} />
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Habits Checked</span>
                <strong style={{ fontSize: '1.25rem', display: 'block' }}>{totalHabitsCompleted}</strong>
              </div>
            </div>
            <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <PiggyBank size={32} style={{ color: 'var(--color-needs)' }} />
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>No-Spend Days</span>
                <strong style={{ fontSize: '1.25rem', display: 'block' }}>{noSpendDays} / {totalLogsThisMonth}</strong>
              </div>
            </div>
          </section>

        </div>

        {/* Right Side: Log Habit checklist */}
        <div>
          <section className="glass-panel" style={{ padding: '2rem', minHeight: '350px' }}>
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Daily Logging</span>
              <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>
                Day {activeDay} Check-in
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {selectedMonth}-{String(activeDay).padStart(2, '0')}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {AVAILABLE_HABITS.map(habit => {
                const log = getLogForDay(activeDay);
                const isChecked = log ? log.habits.includes(habit.id) : false;

                return (
                  <button
                    key={habit.id}
                    onClick={() => handleHabitToggle(activeDay, habit.id)}
                    className="glass-panel"
                    style={{
                      padding: '1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      textAlign: 'left',
                      cursor: 'pointer',
                      border: isChecked ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
                      background: isChecked ? 'var(--accent-glow)' : 'rgba(128,128,128,0.02)',
                      width: '100%'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '1.25rem' }}>{habit.icon}</span>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: isChecked ? '600' : '400' }}>
                        {habit.label}
                      </span>
                    </div>

                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: isChecked ? 'none' : '2px solid var(--border-color)',
                      background: isChecked ? 'var(--accent-color)' : 'none',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      {isChecked && <Check size={12} style={{ color: '#fff' }} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

      </div>

    </div>
  );
}
