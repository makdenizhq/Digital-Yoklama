
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { CreditCard, Plus, Filter, Trash2 } from 'lucide-react';
import { Payment, Expense, FeeType } from '../types';

const Finance = () => {
  const { t, payments, expenses, students, addPayment, addExpense, deleteExpense, settings } = useAppContext();
  const [activeTab, setActiveTab] = useState<'income' | 'expenses'>('income');
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  
  // Modals
  const [showPayModal, setShowPayModal] = useState(false);
  const [showExpModal, setShowExpModal] = useState(false);
  
  // New Items State
  const [newPayment, setNewPayment] = useState<Partial<Payment>>({ type: 'tuition', status: 'paid', amount: 0 });
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({ category: 'supplies', amount: 0, date: new Date().toISOString() });

  const filteredPayments = payments.filter(p => filter === 'all' || p.status === filter);

  // Stats
  const totalIncome = payments.filter(p => p.status === 'paid').reduce((a, b) => a + b.amount, 0);
  const totalExpenses = expenses.reduce((a, b) => a + b.amount, 0);
  const netBalance = totalIncome - totalExpenses;

  const handlePaymentTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const typeName = e.target.value;
      // Find the fee amount based on name
      const fee = settings.feeStructure.find(f => f.name === typeName);
      setNewPayment({ ...newPayment, type: typeName, amount: fee ? fee.amount : 0 });
  };

  const handleAddPayment = (e: React.FormEvent) => {
      e.preventDefault();
      if(newPayment.studentId && newPayment.amount) {
          addPayment({
              id: Date.now().toString(),
              studentId: newPayment.studentId,
              amount: Number(newPayment.amount),
              date: new Date().toISOString(),
              type: newPayment.type as string,
              status: newPayment.status as any,
              description: newPayment.description
          });
          setShowPayModal(false);
      }
  };

  const handleAddExpense = (e: React.FormEvent) => {
      e.preventDefault();
      if(newExpense.title && newExpense.amount) {
          addExpense({
              id: Date.now().toString(),
              title: newExpense.title,
              amount: Number(newExpense.amount),
              category: newExpense.category as any,
              date: newExpense.date!,
              description: newExpense.description
          });
          setShowExpModal(false);
      }
  };

  if (!settings.isPaidSchool) return null;

  return (
    <div className="space-y-6">
        {/* Header & Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><CreditCard size={24}/></div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">{t('finance')}</h2>
                        <p className="text-xs text-slate-500">Net Balance: <b className={`text-base ${netBalance >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>${netBalance.toLocaleString()}</b></p>
                    </div>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button onClick={() => setActiveTab('income')} className={`px-4 py-2 text-xs font-bold rounded-lg transition ${activeTab === 'income' ? 'bg-white text-emerald-600 shadow' : 'text-slate-500'}`}>Income</button>
                    <button onClick={() => setActiveTab('expenses')} className={`px-4 py-2 text-xs font-bold rounded-lg transition ${activeTab === 'expenses' ? 'bg-white text-red-600 shadow' : 'text-slate-500'}`}>Expenses</button>
                </div>
            </div>
        </div>

        {/* INCOME TAB */}
        {activeTab === 'income' && (
            <div className="animate-in fade-in">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex gap-2">
                        {['all', 'paid', 'pending', 'overdue'].map(f => (
                            <button key={f} onClick={() => setFilter(f as any)} className={`px-3 py-1 text-xs font-bold rounded-lg capitalize ${filter === f ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-500'}`}>{f}</button>
                        ))}
                    </div>
                    <button onClick={() => setShowPayModal(true)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-emerald-700"><Plus size={14}/> {t('addPayment')}</button>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                            <tr><th className="px-6 py-3">Student</th><th className="px-6 py-3">Type</th><th className="px-6 py-3">Amount</th><th className="px-6 py-3">Date</th><th className="px-6 py-3">Status</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredPayments.map(p => {
                                const student = students.find(s => s.id === p.studentId);
                                return (
                                    <tr key={p.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-3 font-bold text-slate-800">{student ? `${student.firstName} ${student.lastName}` : p.studentId}</td>
                                        <td className="px-6 py-3 capitalize text-slate-600">{p.type}</td>
                                        <td className="px-6 py-3 font-mono font-bold text-emerald-600">+${p.amount}</td>
                                        <td className="px-6 py-3 text-slate-500 text-xs">{new Date(p.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-3"><span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold capitalize ${p.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : p.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{p.status}</span></td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* EXPENSES TAB */}
        {activeTab === 'expenses' && (
            <div className="animate-in fade-in">
                <div className="flex justify-end mb-4">
                    <button onClick={() => setShowExpModal(true)} className="bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-red-700"><Plus size={14}/> {t('addExpense')}</button>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                            <tr><th className="px-6 py-3">Title</th><th className="px-6 py-3">Category</th><th className="px-6 py-3">Amount</th><th className="px-6 py-3">Date</th><th className="px-6 py-3 text-right">Action</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {expenses.length === 0 ? <tr><td colSpan={5} className="text-center py-8 text-slate-400">No expenses recorded.</td></tr> : expenses.map(e => (
                                <tr key={e.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-3 font-bold text-slate-800">{e.title}</td>
                                    <td className="px-6 py-3 capitalize text-slate-600"><span className="bg-slate-100 px-2 py-1 rounded text-xs">{e.category}</span></td>
                                    <td className="px-6 py-3 font-mono font-bold text-red-500">-${e.amount}</td>
                                    <td className="px-6 py-3 text-slate-500 text-xs">{new Date(e.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-3 text-right"><button onClick={() => deleteExpense(e.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={16}/></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* Add Payment Modal */}
        {showPayModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl">
                    <h3 className="font-bold text-lg mb-4 text-emerald-800">{t('addPayment')}</h3>
                    <form onSubmit={handleAddPayment} className="space-y-4">
                        <select className="w-full border rounded-lg px-3 py-2 text-sm" required onChange={e => setNewPayment({...newPayment, studentId: e.target.value})}>
                            <option value="">Select Student</option>
                            {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
                        </select>
                        <select className="w-full border rounded-lg px-3 py-2 text-sm" required value={newPayment.type} onChange={handlePaymentTypeChange}>
                            <option value="">Select Fee Type</option>
                            {settings.feeStructure.map(fee => (
                                <option key={fee.id} value={fee.name}>{fee.name}</option>
                            ))}
                        </select>
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-slate-400">$</span>
                            <input type="number" placeholder="Amount" className="w-full border rounded-lg pl-6 pr-3 py-2 text-sm" required value={newPayment.amount} onChange={e => setNewPayment({...newPayment, amount: Number(e.target.value)})} />
                        </div>
                        <select className="w-full border rounded-lg px-3 py-2 text-sm" required onChange={e => setNewPayment({...newPayment, status: e.target.value as any})}>
                            <option value="paid">Paid</option>
                            <option value="pending">Pending</option>
                        </select>
                        <div className="flex gap-2 pt-2">
                            <button type="button" onClick={() => setShowPayModal(false)} className="flex-1 bg-slate-100 py-2 rounded-lg font-bold text-slate-600">Cancel</button>
                            <button type="submit" className="flex-1 bg-emerald-600 py-2 rounded-lg font-bold text-white hover:bg-emerald-700">Save Income</button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* Add Expense Modal */}
        {showExpModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl">
                    <h3 className="font-bold text-lg mb-4 text-red-800">{t('addExpense')}</h3>
                    <form onSubmit={handleAddExpense} className="space-y-4">
                        <input placeholder="Expense Title" className="w-full border rounded-lg px-3 py-2 text-sm" required onChange={e => setNewExpense({...newExpense, title: e.target.value})} />
                        <select className="w-full border rounded-lg px-3 py-2 text-sm" required onChange={e => setNewExpense({...newExpense, category: e.target.value as any})}>
                            <option value="supplies">Supplies</option>
                            <option value="salary">Salary</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="utilities">Utilities</option>
                            <option value="other">Other</option>
                        </select>
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-slate-400">$</span>
                            <input type="number" placeholder="Amount" className="w-full border rounded-lg pl-6 pr-3 py-2 text-sm" required onChange={e => setNewExpense({...newExpense, amount: Number(e.target.value)})} />
                        </div>
                        <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm" required value={newExpense.date?.split('T')[0]} onChange={e => setNewExpense({...newExpense, date: e.target.value})} />
                        <div className="flex gap-2 pt-2">
                            <button type="button" onClick={() => setShowExpModal(false)} className="flex-1 bg-slate-100 py-2 rounded-lg font-bold text-slate-600">Cancel</button>
                            <button type="submit" className="flex-1 bg-red-600 py-2 rounded-lg font-bold text-white hover:bg-red-700">Save Expense</button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};

export default Finance;
