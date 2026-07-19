'use client';

import React, { useState } from 'react';
import { Trash2, ArrowUpDown, Filter, Sparkles, Search } from 'lucide-react';
import Header from '../Header';
import { deleteExpense } from '../actions';

interface HistoryDashboardProps {
  initialData: {
    budget: any;
    expenses: any[];
    settings: any;
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

      <section className="glass-panel rounded-2xl p-6 bg-slate-900/20 border-white/5 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-primary flex items-center gap-2">
              Spending Ledger <span className="text-xs font-normal text-secondary">家計簿 履歴</span>
            </h2>
            <p className="text-xs text-secondary mt-0.5">Filter, search, and manage your ledger entries for {selectedMonth}</p>
          </div>
          
          {/* Total summary bubble */}
          <div className="px-4 py-2 rounded-xl bg-brand/10 border border-brand/20 text-brand text-right">
            <span className="text-[10px] text-secondary font-bold uppercase tracking-wider block">Filtered Total</span>
            <strong className="text-xl font-extrabold">{initialData.settings.currency}{totalFilteredAmount.toLocaleString()}</strong>
          </div>
        </div>

        {/* Filter controls bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          {/* Search bar */}
          <div>
            <label className="text-[10px] text-secondary font-bold uppercase tracking-wider block mb-1">Search Descriptions</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="e.g. groceries, coffee..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="text-sm pl-9"
              />
              <Search className="absolute left-3 top-3 text-secondary" size={14} />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="text-[10px] text-secondary font-bold uppercase tracking-wider block mb-1">Category Filter</label>
            <select 
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="text-sm h-[40px] px-2 py-1 focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="needs">Needs (Essential)</option>
              <option value="wants">Wants (Discretionary)</option>
              <option value="experience">Experience & Growth</option>
              <option value="unexpected">Unexpected (Emergency)</option>
            </select>
          </div>

          {/* Sorting Toggles */}
          <div className="flex gap-2">
            <button 
              onClick={() => toggleSort('date')}
              className={`flex-1 btn btn-secondary py-2.5 text-xs flex items-center justify-center gap-1.5 border transition-all ${
                sortBy === 'date' ? 'border-brand text-brand bg-brand/5' : 'border-white/5'
              }`}
            >
              <ArrowUpDown size={12} /> Date {sortBy === 'date' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
            <button 
              onClick={() => toggleSort('amount')}
              className={`flex-1 btn btn-secondary py-2.5 text-xs flex items-center justify-center gap-1.5 border transition-all ${
                sortBy === 'amount' ? 'border-brand text-brand bg-brand/5' : 'border-white/5'
              }`}
            >
              <ArrowUpDown size={12} /> Amount {sortBy === 'amount' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
          </div>
        </div>

        {/* Ledger Table/List */}
        <div className="space-y-2">
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-12 text-slate-500 border border-dashed border-white/5 rounded-xl">
              <Filter size={32} className="mx-auto opacity-30 mb-2" />
              <p className="text-xs">No transactions match your search filters.</p>
            </div>
          ) : (
            filteredExpenses.map(exp => (
              <div 
                key={exp.id} 
                className="glass-panel rounded-xl p-3 px-4 flex justify-between items-center gap-4 bg-slate-900/40 border-white/5 hover:border-white/10"
              >
                <div className="flex items-center gap-3">
                  {/* Category dot */}
                  <span className={`w-2.5 h-2.5 rounded-full inline-block ${
                    exp.category === 'needs' ? 'bg-needs shadow-[0_0_8px_#3b82f6]' :
                    exp.category === 'wants' ? 'bg-wants shadow-[0_0_8px_#f43f5e]' :
                    exp.category === 'experience' ? 'bg-experience shadow-[0_0_8px_#a855f7]' :
                    'bg-unexpected shadow-[0_0_8px_#eab308]'
                  }`} />
                  
                  <div>
                    <strong className="text-sm text-primary font-bold">{exp.description}</strong>
                    <div className="flex gap-3 text-[10px] text-secondary mt-0.5">
                      <span>{exp.date}</span>
                      <span className="uppercase text-muted font-bold tracking-wider">{exp.category}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <strong className="text-sm font-extrabold text-primary">
                    {initialData.settings.currency}{exp.amount.toLocaleString()}
                  </strong>
                  <button 
                    onClick={() => handleDeleteExpense(exp.id)}
                    className="p-2 rounded-lg text-secondary hover:text-rose-400 hover:bg-rose-500/10 border border-transparent transition-all"
                    title="Delete Entry"
                  >
                    <Trash2 size={14} />
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
