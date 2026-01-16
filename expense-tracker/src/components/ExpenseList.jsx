import ExpenseItem from './ExpenseItem';

const ExpenseList = ({ expenses, onDelete }) => (
  <div className="divide-y divide-slate-100">
    {expenses.length === 0 ? (
      <div className="text-center py-20 px-8">
        <div className="w-24 h-24 bg-gradient-to-r from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
          <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-3">No transactions yet</h3>
        <p className="text-slate-500 text-lg mb-8 max-w-md mx-auto leading-relaxed">
          Add your first expense using the form above. Your transaction history will appear here automatically.
        </p>
        <div className="h-px bg-gradient-to-r from-slate-200 to-slate-100 mx-auto mb-8 w-24" />
        <div className="text-sm text-slate-400 font-medium space-y-1">
          <p>Ready to track:</p>
          <p><span className="text-3xl font-black text-slate-900">$0.00</span> Total Expenses</p>
        </div>
      </div>
    ) : (
      expenses.map(expense => (
        <ExpenseItem key={expense.id} expense={expense} onDelete={onDelete} />
      ))
    )}
  </div>
);

export default ExpenseList;
