import { useState, useEffect, useMemo, useCallback } from 'react';

export const useExpenses = () => {
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/posts?_limit=5')
      .then(res => res.json())
      .then(data => setExpenses(data.map(item => ({...item, amount: Math.floor(Math.random()*100), category: 'Misc'}))));
  }, []);

  const total = useMemo(() => 
    expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0), [expenses]
  );

  const addExpense = useCallback((newExpense) => {
    setExpenses(prev => [...prev, newExpense]);
  }, []);

  const deleteExpense = useCallback((id) => {
    setExpenses(prev => prev.filter(exp => exp.id !== id));
  }, []);

  return { expenses, total, addExpense, deleteExpense };
};
