import { useState, useRef, forwardRef, useImperativeHandle } from 'react';

const ExpenseForm = forwardRef(({ onAdd }, ref) => {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: 'Food & Dining',
  });

  const inputRef = useRef(null);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
  }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.amount) return;

    onAdd({
      ...formData,
      amount: parseFloat(formData.amount),
    });

    setFormData({
      name: '',
      amount: '',
      category: 'Food & Dining',
    });

    inputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Expense Name */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Transaction Description
          </label>
          <input
            ref={inputRef}
            type="text"
            name="name"
            placeholder="Coffee at Starbucks..."
            value={formData.name}
            onChange={handleChange}
            className="w-full p-5 border border-slate-200 rounded-3xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-400 transition-all font-medium text-lg h-16"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Amount
          </label>
          <input
            type="number"
            name="amount"
            placeholder="45.99"
            step="0.01"
            value={formData.amount}
            onChange={handleChange}
            className="w-full p-5 border border-slate-200 rounded-3xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all font-bold text-2xl text-right h-16"
          />
        </div>

        {/* Category + Button */}
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-5 border border-slate-200 rounded-3xl focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all font-semibold h-16"
            >
              <option>Food & Dining</option>
              <option>Transport</option>
              <option>Entertainment</option>
              <option>Shopping</option>
              <option>Bills & Utilities</option>
            </select>
          </div>

          <button
            type="submit"
            className="px-10 py-5 h-16 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white rounded-3xl font-black text-lg shadow-2xl hover:scale-[1.02] transition-all flex items-center"
          >
            <svg
              className="w-6 h-6 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Add Expense
          </button>
        </div>
      </div>
    </form>
  );
});

export default ExpenseForm;
