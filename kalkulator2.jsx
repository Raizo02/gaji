import React, { useState, useEffect, useMemo } from 'react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend
} from 'recharts';
import {
    Wallet, PiggyBank, CreditCard, Plus, Trash2,
    CheckCircle2, Circle, TrendingUp, AlertCircle, Save
} from 'lucide-react';

// --- Components ---

const Card = ({ children, className = "" }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 ${className}`}>
        {children}
    </div>
);

const SectionHeader = ({ icon: Icon, title, colorClass }) => (
    <div className="flex items-center gap-2 mb-4">
        <div className={`p-2 rounded-lg ${colorClass}`}>
            <Icon size={20} className="text-white" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">{title}</h2>
    </div>
);

const ProgressBar = ({ current, max, color }) => {
    const percentage = Math.min(100, Math.max(0, (current / max) * 100));
    return (
        <div className="w-full bg-slate-100 rounded-full h-2.5 mt-2">
            <div
                className={`h-2.5 rounded-full transition-all duration-500 ${color}`}
                style={{ width: `${percentage}%` }}
            ></div>
        </div>
    );
};

export default function App() {
    // --- State ---

    // Basic Config
    const [income, setIncome] = useState(2800);
    const [month, setMonth] = useState("November");

    // Percentages from CSV
    const allocations = {
        commitments: 0.41,
        savings: 0.36,
        expenses: 0.23
    };

    // 1. Commitments Data (From CSV)
    const [commitments, setCommitments] = useState([
        { id: 1, name: 'Messbill', amount: 0, paid: false },
        { id: 2, name: 'Parents', amount: 0, paid: false },
        { id: 3, name: 'Netflix/spotify', amount: 0, paid: false },
        { id: 4, name: 'Topup Maxis', amount: 0, paid: false },
        { id: 5, name: 'Kereta (saga)', amount: 0, paid: false },
        { id: 6, name: 'Insurance (saga)', amount: 0, paid: false },
        { id: 7, name: 'Services (saga)', amount: 0, paid: false },
        { id: 8, name: 'Spaylater', amount: 0, paid: false },
    ]);

    // 2. Savings Data (From CSV)
    const [savings, setSavings] = useState([
        { id: 1, name: 'ASB', amount: 0 },
        { id: 2, name: 'Gold', amount: 0 },
        { id: 3, name: 'Tabung Haji', amount: 0 },
    ]);

    // 3. Daily Expenses / Belanja (From CSV Log)
    const [transactions, setTransactions] = useState([]);
    const [newTransaction, setNewTransaction] = useState({ item: '', amount: '', category: 'Makan', date: new Date().toISOString().split('T')[0] });

    // --- Calculations ---

    const budget = useMemo(() => ({
        commitments: Math.round(income * allocations.commitments),
        savings: Math.round(income * allocations.savings),
        expenses: Math.round(income * allocations.expenses),
    }), [income]);

    const totals = useMemo(() => {
        const totalCommitments = commitments.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
        const totalSavings = savings.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
        const totalExpenses = transactions.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

        return {
            commitments: totalCommitments,
            savings: totalSavings,
            expenses: totalExpenses,
            grandTotal: totalCommitments + totalSavings + totalExpenses
        };
    }, [commitments, savings, transactions]);

    const balances = {
        commitments: budget.commitments - totals.commitments,
        savings: budget.savings - totals.savings,
        expenses: budget.expenses - totals.expenses,
        overall: income - totals.grandTotal
    };

    // --- Handlers ---

    // Commitment Handlers
    const toggleCommitmentPaid = (id) => {
        setCommitments(commitments.map(c => c.id === id ? { ...c, paid: !c.paid } : c));
    };

    const updateCommitmentAmount = (id, val) => {
        setCommitments(commitments.map(c => c.id === id ? { ...c, amount: val } : c));
    };

    const updateCommitmentName = (id, val) => {
        setCommitments(commitments.map(c => c.id === id ? { ...c, name: val } : c));
    };

    const deleteCommitment = (id) => {
        setCommitments(commitments.filter(c => c.id !== id));
    };

    const addCommitment = () => {
        const newId = commitments.length > 0 ? Math.max(...commitments.map(c => c.id)) + 1 : 1;
        setCommitments([...commitments, { id: newId, name: 'New Commitment', amount: 0, paid: false }]);
    };

    // Savings Handlers
    const updateSavingsAmount = (id, val) => {
        setSavings(savings.map(s => s.id === id ? { ...s, amount: val } : s));
    };

    const updateSavingsName = (id, val) => {
        setSavings(savings.map(s => s.id === id ? { ...s, name: val } : s));
    };

    const deleteSavings = (id) => {
        setSavings(savings.filter(s => s.id !== id));
    };

    const addSavings = () => {
        const newId = savings.length > 0 ? Math.max(...savings.map(s => s.id)) + 1 : 1;
        setSavings([...savings, { id: newId, name: 'New Goal', amount: 0 }]);
    };

    // Transaction Handlers
    const addTransaction = (e) => {
        e.preventDefault();
        if (!newTransaction.item || !newTransaction.amount) return;

        setTransactions([
            ...transactions,
            { ...newTransaction, id: Date.now(), amount: parseFloat(newTransaction.amount) }
        ]);
        setNewTransaction({ item: '', amount: '', category: 'Makan', date: new Date().toISOString().split('T')[0] });
    };

    const deleteTransaction = (id) => {
        setTransactions(transactions.filter(t => t.id !== id));
    };

    // --- Charts Data ---

    const pieData = [
        { name: 'Commitments', value: totals.commitments, color: '#ef4444' },
        { name: 'Savings', value: totals.savings, color: '#22c55e' },
        { name: 'Belanja', value: totals.expenses, color: '#3b82f6' },
    ].filter(d => d.value > 0);

    const barData = [
        { name: 'Commitments', Budget: budget.commitments, Actual: totals.commitments },
        { name: 'Savings', Budget: budget.savings, Actual: totals.savings },
        { name: 'Belanja', Budget: budget.expenses, Actual: totals.expenses },
    ];

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-800">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-indigo-900 text-white p-6 rounded-2xl shadow-lg">
                    <div>
                        <h1 className="text-3xl font-bold">Dashboard Gaji</h1>
                        <p className="text-indigo-200 text-sm">Overview for {month} 2025</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <div className="bg-indigo-800/50 p-3 rounded-lg border border-indigo-700">
                            <label className="text-xs text-indigo-300 block mb-1">Gaji Bersih (RM)</label>
                            <input
                                type="number"
                                value={income}
                                onChange={(e) => setIncome(Number(e.target.value))}
                                className="bg-transparent text-xl font-bold w-32 focus:outline-none"
                            />
                        </div>
                        <div className={`p-3 rounded-lg border ${balances.overall >= 0 ? 'bg-green-600 border-green-500' : 'bg-red-600 border-red-500'}`}>
                            <label className="text-xs text-white/80 block mb-1">Current Balance</label>
                            <div className="text-xl font-bold">RM {balances.overall.toLocaleString()}</div>
                        </div>
                    </div>
                </div>

                {/* Overview Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Commitments Card */}
                    <Card className="p-6 border-t-4 border-t-red-500">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="text-slate-500 font-medium text-sm">Commitments (41%)</h3>
                                <div className="text-2xl font-bold text-slate-800">RM {totals.commitments}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-slate-400">Budget</div>
                                <div className="text-sm font-semibold text-slate-600">RM {budget.commitments}</div>
                            </div>
                        </div>
                        <ProgressBar current={totals.commitments} max={budget.commitments} color="bg-red-500" />
                        <div className="mt-2 text-xs text-slate-400 text-right">
                            {Math.abs(balances.commitments)} {balances.commitments >= 0 ? 'remaining' : 'over budget'}
                        </div>
                    </Card>

                    {/* Savings Card */}
                    <Card className="p-6 border-t-4 border-t-green-500">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="text-slate-500 font-medium text-sm">Savings (36%)</h3>
                                <div className="text-2xl font-bold text-slate-800">RM {totals.savings}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-slate-400">Target</div>
                                <div className="text-sm font-semibold text-slate-600">RM {budget.savings}</div>
                            </div>
                        </div>
                        <ProgressBar current={totals.savings} max={budget.savings} color="bg-green-500" />
                        <div className="mt-2 text-xs text-slate-400 text-right">
                            {Math.abs(balances.savings)} {balances.savings >= 0 ? 'to go' : 'above target'}
                        </div>
                    </Card>

                    {/* Expenses Card */}
                    <Card className="p-6 border-t-4 border-t-blue-500">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="text-slate-500 font-medium text-sm">Belanja (23%)</h3>
                                <div className="text-2xl font-bold text-slate-800">RM {totals.expenses}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-slate-400">Budget</div>
                                <div className="text-sm font-semibold text-slate-600">RM {budget.expenses}</div>
                            </div>
                        </div>
                        <ProgressBar current={totals.expenses} max={budget.expenses} color="bg-blue-500" />
                        <div className="mt-2 text-xs text-slate-400 text-right">
                            {Math.abs(balances.expenses)} {balances.expenses >= 0 ? 'available' : 'overspent'}
                        </div>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* LEFT COLUMN: Commitments & Savings List */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Commitments Detail */}
                        <Card className="p-6">
                            <SectionHeader icon={CreditCard} title="Fixed Commitments" colorClass="bg-red-500" />
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                                        <tr>
                                            <th className="px-4 py-3">Paid?</th>
                                            <th className="px-4 py-3">Item</th>
                                            <th className="px-4 py-3 text-right">Amount (RM)</th>
                                            <th className="w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {commitments.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                                                <td className="px-4 py-3">
                                                    <button
                                                        onClick={() => toggleCommitmentPaid(item.id)}
                                                        className={`transition-colors ${item.paid ? 'text-green-500' : 'text-slate-300 hover:text-slate-400'}`}
                                                    >
                                                        {item.paid ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                                                    </button>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="text"
                                                        className={`bg-transparent border-b border-transparent focus:border-slate-300 focus:outline-none w-full font-medium ${item.paid ? 'text-slate-400 line-through' : 'text-slate-700'}`}
                                                        value={item.name}
                                                        onChange={(e) => updateCommitmentName(item.id, e.target.value)}
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <input
                                                        type="number"
                                                        placeholder="0"
                                                        className="w-24 text-right bg-slate-50 border border-slate-200 rounded px-2 py-1 focus:outline-blue-500"
                                                        value={item.amount === 0 ? '' : item.amount}
                                                        onChange={(e) => updateCommitmentAmount(item.id, e.target.value)}
                                                    />
                                                </td>
                                                <td className="px-2 text-center">
                                                    <button
                                                        onClick={() => deleteCommitment(item.id)}
                                                        className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                        title="Remove commitment"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <button
                                    onClick={addCommitment}
                                    className="w-full mt-4 py-2 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                                >
                                    <Plus size={16} /> Add New Commitment
                                </button>
                            </div>
                        </Card>

                        {/* Savings Detail */}
                        <Card className="p-6">
                            <SectionHeader icon={PiggyBank} title="Savings Allocation" colorClass="bg-green-500" />
                            <div className="space-y-4">
                                {savings.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors group">
                                        <div className="flex items-center gap-3 w-full">
                                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                                                <Save size={16} />
                                            </div>
                                            <input
                                                type="text"
                                                className="bg-transparent border-b border-transparent focus:border-slate-300 focus:outline-none w-full font-medium text-slate-700"
                                                value={item.name}
                                                onChange={(e) => updateSavingsName(item.id, e.target.value)}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-400 text-sm">RM</span>
                                            <input
                                                type="number"
                                                placeholder="0"
                                                className="w-24 text-right bg-white border border-slate-200 rounded px-2 py-1 focus:outline-green-500"
                                                value={item.amount === 0 ? '' : item.amount}
                                                onChange={(e) => updateSavingsAmount(item.id, e.target.value)}
                                            />
                                            <button
                                                onClick={() => deleteSavings(item.id)}
                                                className="text-slate-300 hover:text-red-500 ml-2 transition-colors opacity-0 group-hover:opacity-100"
                                                title="Remove saving goal"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    onClick={addSavings}
                                    className="w-full mt-4 py-2 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                                >
                                    <Plus size={16} /> Add New Saving
                                </button>
                            </div>
                        </Card>

                        {/* Graphs */}
                        <Card className="p-6">
                            <SectionHeader icon={TrendingUp} title="Financial Analysis" colorClass="bg-indigo-500" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => `RM ${value}`} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>

                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <XAxis dataKey="name" fontSize={12} />
                                        <YAxis fontSize={12} />
                                        <Tooltip formatter={(value) => `RM ${value}`} />
                                        <Legend />
                                        <Bar dataKey="Budget" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="Actual" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                    </div>

                    {/* RIGHT COLUMN: Expenses Log */}
                    <div className="lg:col-span-1">
                        <Card className="p-6 h-full flex flex-col">
                            <SectionHeader icon={Wallet} title="Daily Expenses (Belanja)" colorClass="bg-blue-500" />

                            {/* Add New Transaction Form */}
                            <form onSubmit={addTransaction} className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
                                <h4 className="text-sm font-bold text-slate-700 mb-3">Add Transaction</h4>
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        placeholder="Item (e.g. Nasi Lemak)"
                                        className="w-full text-sm px-3 py-2 border rounded focus:outline-blue-500"
                                        value={newTransaction.item}
                                        onChange={(e) => setNewTransaction({ ...newTransaction, item: e.target.value })}
                                        required
                                    />
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            placeholder="RM Amount"
                                            className="w-full text-sm px-3 py-2 border rounded focus:outline-blue-500"
                                            value={newTransaction.amount}
                                            onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                                            required
                                        />
                                        <select
                                            className="text-sm px-2 py-2 border rounded focus:outline-blue-500 bg-white"
                                            value={newTransaction.category}
                                            onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                                        >
                                            <option>Makan</option>
                                            <option>Belanja</option>
                                            <option>Hutang</option>
                                            <option>Minyak</option>
                                            <option>Other</option>
                                        </select>
                                    </div>
                                    <input
                                        type="date"
                                        className="w-full text-sm px-3 py-2 border rounded focus:outline-blue-500 bg-white"
                                        value={newTransaction.date}
                                        onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                                    />
                                    <button
                                        type="submit"
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <Plus size={16} /> Add Log
                                    </button>
                                </div>
                            </form>

                            {/* Transaction List */}
                            <div className="flex-1 overflow-y-auto max-h-[500px] space-y-3 pr-2">
                                {transactions.length === 0 ? (
                                    <div className="text-center py-10 text-slate-400">
                                        <AlertCircle size={32} className="mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">No transactions yet.</p>
                                    </div>
                                ) : (
                                    transactions.slice().reverse().map((t) => (
                                        <div key={t.id} className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-lg shadow-sm hover:shadow-md transition-shadow group">
                                            <div>
                                                <div className="font-semibold text-slate-800 text-sm">{t.item}</div>
                                                <div className="text-xs text-slate-500 flex gap-2">
                                                    <span>{t.date}</span>
                                                    <span className="text-blue-500 font-medium">{t.category}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="font-bold text-slate-700">RM {t.amount.toFixed(2)}</span>
                                                <button
                                                    onClick={() => deleteTransaction(t.id)}
                                                    className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>
                    </div>

                </div>
            </div>
        </div>
    );
}