import { memo } from 'react';

const ExpenseItem = memo(({ expense, onDelete }) => {
  const categoryColors = {
    Food: 'from-orange-400 to-orange-500',
    Transport: 'from-blue-400 to-blue-500', 
    Entertainment: 'from-purple-400 to-purple-500',
    Misc: 'from-gray-400 to-gray-500'
  };

  return (
    <div className="group border-b border-gray-50 hover:bg-gray-50 px-8 py-6 transition-all duration-200 hover:border-blue-100">
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${categoryColors[expense.category || 'Misc'] || 'from-gray-400 to-gray-500'}`}>
            <span className="text-xl font-bold text-white">
              {expense.category?.charAt(0) || 'M'}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-gray-900 truncate group-hover:text-blue-600">{expense.name}</h4>
            <p className="text-sm text-gray-500 capitalize">{expense.category || 'Misc'}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-2xl font-black text-gray-900">${expense.amount?.toFixed(2)}</span>
          <button
            onClick={() => onDelete(expense.id)}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all group-hover:scale-110"
            title="Delete"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
});

export default ExpenseItem;
