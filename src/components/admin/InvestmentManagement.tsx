import {
  Calendar,
  CheckCircle2,
  Clock,
  Coins,
  DollarSign,
  Plus,
  Search,
  ShieldCheck,
  TrendingUp,
  User,
  Wallet,
  X
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../db/storage';
import { Customer, Investment } from '../../types';
import { calculateMonthlyProfit, formatIndianDate, formatINR } from '../../utils/formatters';

interface InvestmentManagementProps {
  preselectedCustomer?: Customer | null;
  onInvestmentAdded?: () => void;
}

export const InvestmentManagement: React.FC<InvestmentManagementProps> = ({
  preselectedCustomer,
  onInvestmentAdded,
}) => {
  const { currentUser } = useAuth();
  const [investments, setInvestments] = useState<Investment[]>(() => db.getInvestments());
  const [customers] = useState<Customer[]>(() => db.getCustomers());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form fields
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    preselectedCustomer ? preselectedCustomer.id : customers[0]?.id || ''
  );
  const [investmentDate, setInvestmentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [amount, setAmount] = useState<number>(500000);
  const [profitRate, setProfitRate] = useState<number>(5.0);
  const [profitStartDate, setProfitStartDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [maturityDate, setMaturityDate] = useState<string>('2027-01-01');
  const [notes, setNotes] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  const refreshList = () => {
    setInvestments(db.getInvestments());
    if (onInvestmentAdded) onInvestmentAdded();
  };

  const calculatedMonthlyReturn = useMemo(() => {
    return calculateMonthlyProfit(amount, profitRate);
  }, [amount, profitRate]);

  const handleOpenAddModal = (cust?: Customer) => {
    if (cust) {
      setSelectedCustomerId(cust.id);
      setProfitRate(cust.monthlyProfitRate || 5.0);
    } else {
      setSelectedCustomerId(customers[0]?.id || '');
      setProfitRate(5.0);
    }
    setAmount(500000);
    setInvestmentDate(new Date().toISOString().split('T')[0]);
    setProfitStartDate(new Date().toISOString().split('T')[0]);
    setMaturityDate('2027-01-01');
    setNotes('');
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleSaveInvestment = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!selectedCustomerId) {
      setFormError('Please select a customer.');
      return;
    }

    if (!amount || amount <= 0) {
      setFormError('Investment amount must be greater than zero.');
      return;
    }

    const newInvestment: Investment = {
      id: `INV-${Date.now().toString().slice(-6)}`,
      customerId: selectedCustomerId,
      investmentDate,
      amount: Number(amount),
      profitRate: Number(profitRate) || 5.0,
      profitStartDate,
      maturityDate: maturityDate || undefined,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString().split('T')[0],
    };

    db.saveInvestment(newInvestment, currentUser?.username || 'admin', true);
    setIsAddModalOpen(false);
    refreshList();
  };

  const filteredInvestments = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return investments
      .filter((inv) => {
        const cust = customers.find((c) => c.id === inv.customerId);
        return (
          !q ||
          inv.customerId.toLowerCase().includes(q) ||
          inv.id.toLowerCase().includes(q) ||
          (cust && cust.fullName.toLowerCase().includes(q)) ||
          (inv.notes && inv.notes.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => new Date(b.investmentDate).getTime() - new Date(a.investmentDate).getTime());
  }, [investments, customers, searchQuery]);

  return (
    <div className="p-4 space-y-4 max-w-5xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-indigo-600" />
            Investment Management
          </h2>
          <p className="text-xs text-slate-500">
            Create and track investments with automatic 5% monthly profit yield calculations.
          </p>
        </div>

        <button
          id="add-investment-btn"
          onClick={() => handleOpenAddModal()}
          className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          New Investment
        </button>
      </div>

      {/* Formula & Calculation Explainer Box */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-indigo-50/80 via-blue-50/60 to-emerald-50/60 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border border-indigo-100 dark:border-slate-800 text-xs space-y-2">
        <div className="flex items-center gap-2 font-extrabold text-indigo-900 dark:text-indigo-300">
          <TrendingUp className="w-4 h-4 text-indigo-600" />
          Automated Monthly Profit Formula
        </div>
        <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-2xl border border-indigo-100/50 dark:border-slate-700 font-mono text-xs text-slate-800 dark:text-slate-200">
          <strong>Monthly Profit = Current Principal Balance × 5 / 100</strong>
        </div>
        <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
          Example: Investment = ₹10,00,000 → Monthly Profit = ₹50,000. If ₹3,00,000 principal is returned, remaining principal = ₹7,00,000 → Next Monthly Profit = ₹35,000.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search investments by Customer ID, Name, Reference..."
          className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-xs"
        />
      </div>

      {/* Investments List */}
      <div className="space-y-3">
        {filteredInvestments.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <Wallet className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No investments recorded</p>
          </div>
        ) : (
          filteredInvestments.map((inv) => {
            const customer = customers.find((c) => c.id === inv.customerId);
            const expectedProfit = calculateMonthlyProfit(inv.amount, inv.profitRate);
            return (
              <div
                key={inv.id}
                id={`investment-card-${inv.id}`}
                className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 flex items-center justify-center font-extrabold text-sm shadow-xs">
                      <Coins className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {customer ? customer.fullName : inv.customerId}
                        </h3>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {inv.customerId}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">{inv.id}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>Inv Date: {formatIndianDate(inv.investmentDate)}</span>
                        <span>•</span>
                        <span>Maturity: {formatIndianDate(inv.maturityDate)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] font-semibold text-slate-400">Invested Capital</div>
                    <div className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">
                      {formatINR(inv.amount)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">Monthly Rate</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {inv.profitRate}% / month
                    </span>
                  </div>

                  <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-2 rounded-xl border border-emerald-100/50 dark:border-emerald-900/30">
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 block">
                      Monthly Profit Yield
                    </span>
                    <span className="font-extrabold text-emerald-700 dark:text-emerald-300">
                      {formatINR(expectedProfit)} / mo
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-slate-400 block">Profit Start</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {formatIndianDate(inv.profitStartDate)}
                    </span>
                  </div>
                </div>

                {inv.notes && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                    Note: {inv.notes}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* New Investment Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-600 text-white">
                  <Wallet className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-base">Create Investment Record</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveInvestment} className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 font-semibold">
                  {formError}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Select Customer *
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => {
                    setSelectedCustomerId(e.target.value);
                    const cust = customers.find((c) => c.id === e.target.value);
                    if (cust) setProfitRate(cust.monthlyProfitRate || 5.0);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-xs"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} ({c.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Investment Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1000}
                    step={1000}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-extrabold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-emerald-700 dark:text-emerald-300 mb-1">
                    Profit Rate (% / Month) *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.1"
                    value={profitRate}
                    onChange={(e) => setProfitRate(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-emerald-600 dark:text-emerald-400"
                  />
                </div>
              </div>

              {/* Live Yield Calculation Preview */}
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
                    Calculated Monthly Profit
                  </span>
                  <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300">
                    {formatINR(calculatedMonthlyReturn)} / month
                  </span>
                </div>
                <span className="text-[10px] text-emerald-600">({profitRate}% on {formatINR(amount)})</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Investment Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={investmentDate}
                    onChange={(e) => setInvestmentDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Profit Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={profitStartDate}
                    onChange={(e) => setProfitStartDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Maturity Date
                  </label>
                  <input
                    type="date"
                    value={maturityDate}
                    onChange={(e) => setMaturityDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Portfolio notes, terms, bank details..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20"
                >
                  Save Investment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
