'use client';

import React, { useState } from 'react';
import { Trash2, ArrowUpDown, Filter, Sparkles } from 'lucide-react';
import Header from '../Header';
import { deleteExpense } from '../actions';

interface HistoryDashboardProps {
  initialData: {
    budget: any;
    expenses: any[];
  };
  currentMonth: string;
}

export default function HistoryDashboard({ initialData, currentMonth }: HistoryDashboardProps) {
  const [selectedMonth] = useState(currentMonth);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');

  const handleMonthChange = (newMonth: string) => {
    window.location.search = `?month=${newMonth}`;
  };

  const handleDeleteExpense = async (id: number) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      await deleteExpense(id);
    }
  };

  // Filter and search expenses
  const filteredExpenses = initialData.expenses
    .filter(exp => {
      const matchCat = filterCategory === 'all' || exp.category === filterCategory;
      const matchSearch = exp.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        const valA = new Date(a.date).getTime();
        const valB = new Date(b.date).getTime();
        return sortOrder === 'desc' ? valB - valA : valA - valB;
      } else {
        return sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount;
      }
    });

  // Calculate sum of visible expenses
  const totalFilteredAmount = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  const toggleSort = (type: 'date' | 'amount') => {
    if (sortBy === type) {
      setSortOrder(order => order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(type);
      setSortOrder('desc');
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

      <section className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Spending Ledger <Sparkles style={{ color: 'var(--accent-color)' }} size={20} />
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Review and filter your financial transactions for {selectedMonth}</p>
          </div>
          
          {/* Total summary bubble */}
          <div className="glass-panel" style={{ padding: '0.75rem 1.5rem', background: 'var(--accent-glow)', borderColor: 'var(--accent-color)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Filtered Total</span>
            <strong style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>${totalFilteredAmount.toLocaleString()}</strong>
          </div>
        </div>

        {/* Filter controls bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {/* Search bar */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Search descriptions</label>
            <input 
              type="text" 
              placeholder="e.g. groceries, electric..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Category filter</label>
            <div style={{ position: 'relative' }}>
              <select 
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="needs">Needs (Essential)</option>
                <option value="wants">Wants (Discretionary)</option>
                <option value="experience">Experience & Growth</option>
                <option value="unexpected">Unexpected (Extra)</option>
              </select>
            </div>
          </div>

          {/* Sorting Toggles */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'end' }}>
            <button 
              onClick={() => toggleSort('date')}
              className="btn btn-secondary"
              style={{ flex: 1, padding: '0.65rem', fontSize: '0.85rem', display: 'flex', gap: '0.4rem', border: sortBy === 'date' ? '1px solid var(--accent-color)' : '1px solid var(--border-color)', color: sortBy === 'date' ? 'var(--accent-color)' : 'var(--text-primary)' }}
            >
              <ArrowUpDown size={14} /> Date {sortBy === 'date' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
            <button 
              onClick={() => toggleSort('amount')}
              className="btn btn-secondary"
              style={{ flex: 1, padding: '0.65rem', fontSize: '0.85rem', display: 'flex', gap: '0.4rem', border: sortBy === 'amount' ? '1px solid var(--accent-color)' : '1px solid var(--border-color)', color: sortBy === 'amount' ? 'var(--accent-color)' : 'var(--text-primary)' }}
            >
              <ArrowUpDown size={14} /> Amount {sortBy === 'amount' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
          </div>
        </div>

        {/* Ledger Table/List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredExpenses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <Filter size={40} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
              <p>No transactions found matching your criteria.</p>
            </div>
          ) : (
            filteredExpenses.map(exp => (
              <div 
                key={exp.id} 
                className="glass-panel"
                style={{ 
                  padding: '1rem 1.25rem', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  flexWrap: 'wrap', 
                  gap: '1rem' 
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {/* Category dot */}
                  <span style={{ 
                    width: '12px', 
                    height: '12px', 
                    borderRadius: '50%', 
                    display: 'inline-block',
                    background: exp.category === 'needs' ? 'var(--color-needs)' :
                                exp.category === 'wants' ? 'var(--color-wants)' :
                                exp.category === 'experience' ? 'var(--color-experience)' :
                                'var(--color-unexpected)',
                    boxShadow: `0 0 8px ${
                                exp.category === 'needs' ? 'var(--color-needs)' :
                                exp.category === 'wants' ? 'var(--color-wants)' :
                                exp.category === 'experience' ? 'var(--color-experience)' :
                                'var(--color-unexpected)'
                              }`
                  }} />
                  
                  <div>
                    <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>{exp.description}</strong>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.15rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>{exp.date}</span>
                      <span style={{ textTransform: 'uppercase', color: 
                        exp.category === 'needs' ? 'var(--color-needs)' :
                        exp.category === 'wants' ? 'var(--color-wants)' :
                        exp.category === 'experience' ? 'var(--color-experience)' :
                        'var(--color-unexpected)'
                      }}>{exp.category}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <strong style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>${exp.amount.toLocaleString()}</strong>
                  <button 
                    onClick={() => handleDeleteExpense(exp.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.4rem', borderRadius: '6px' }}
                    className="btn-secondary"
                  >
                    <Trash2 size={16} style={{ color: 'var(--danger-color)' }} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

    </div>
  );
}
