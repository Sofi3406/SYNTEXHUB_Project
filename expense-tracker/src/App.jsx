import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import LandingPage from './components/LandingPage';
import Footer from './components/Footer';

function App() {
  const [showTracker, setShowTracker] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const formRef = useRef(null);
  useEffect(() => {
    setExpenses([]);
  }, []);
  useEffect(() => {
    if (showTracker && formRef.current) {
      formRef.current.focus();
    }
  }, [showTracker]);

  const total = useMemo(() => 
    expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0), [expenses]
  );

  const addExpense = useCallback((newExpense) => {
    setExpenses(prev => [...prev, { ...newExpense, id: Date.now() }]);
  }, []);

  const deleteExpense = useCallback((id) => {
    setExpenses(prev => prev.filter(exp => exp.id !== id));
  }, []);

  const handleStartTracking = () => {
    setShowTracker(true);
  };
 if (!showTracker) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-blue-500 to-purple-600 flex flex-col">
      <LandingPage onStartTracking={handleStartTracking} />
      <Footer />
    </div>
  );
}


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
    
      <header className="bg-white/90 backdrop-blur-2xl shadow-lg border-b border-slate-100/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-gray-800 to-slate-700 bg-clip-text text-transparent leading-tight">
                  Finance Dashboard
                </h1>
                <p className="text-sm text-slate-500 font-medium tracking-wide">Professional expense management</p>
              </div>
            </div>
            <button
              onClick={() => setShowTracker(false)}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-semibold text-sm border border-slate-200 transition-all duration-200 hover:shadow-md whitespace-nowrap"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pb-24 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="group bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-2xl shadow-lg flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                </svg>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full group-hover:scale-105 transition-transform">This Month</span>
            </div>
            <div>
              <p className="text-3xl lg:text-4xl font-black text-slate-900 mb-1 leading-tight">${total.toFixed(2)}</p>
              <p className="text-slate-600 font-semibold text-sm tracking-wide">Total Expenses</p>
            </div>
          </div>

          <div className="group bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-1">
            <p className="text-3xl font-black mb-1">{expenses.length}</p>
            <p className="font-semibold text-sm opacity-95 tracking-wide">Transactions</p>
          </div>

          <div className="group bg-gradient-to-br from-purple-500 to-violet-600 text-white rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-1">
            <p className="text-3xl font-black mb-1">+{(total/expenses.length || 0).toFixed(1)}%</p>
            <p className="font-semibold text-sm opacity-95 tracking-wide">Avg Per Item</p>
          </div>

          <div className="group bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-1">
            <p className="text-3xl font-black mb-1">{expenses.length > 0 ? ((total/5000)*100).toFixed(1) : 0}%</p>
            <p className="font-semibold text-sm opacity-95 tracking-wide">Budget Usage</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-10">
          {/* Form Column */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-100/50 p-8">
              <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center">
                <span className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                Add New Transaction
              </h2>
              <ExpenseForm ref={formRef} onAdd={addExpense} />
            </div>
          </div>

          {/* Filter Column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-100/50 p-8 sticky top-32">
              <h3 className="text-xl font-black text-slate-900 mb-6">Filters</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                  <select className="w-full p-3.5 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all text-sm font-medium">
                    <option>All Categories</option>
                    <option>Food</option>
                    <option>Transport</option>
                    <option>Entertainment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Date Range</label>
                  <input type="date" className="w-full p-3.5 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all text-sm" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100/50 overflow-hidden">
          <div className="px-8 py-8 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900 flex items-center">
                Recent Transactions
                <span className="ml-3 px-3 py-1.5 bg-emerald-100 text-emerald-800 text-sm font-bold rounded-full">{expenses.length}</span>
              </h3>
              <div className="text-sm text-slate-500 font-medium">Updated {new Date().toLocaleTimeString()}</div>
            </div>
          </div>
          <ExpenseList expenses={expenses} onDelete={deleteExpense} />
        </div>
         <Footer />
      </main>
      
    </div>
  );
}

export default App;
