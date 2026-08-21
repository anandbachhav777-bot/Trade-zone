import {
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Filter,
  Play,
  RefreshCw,
  Search,
  Sparkles,
  TrendingUp,
  User,
  Wallet
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../db/storage';
import { Customer, MonthlyProfitRecord } from '../../types';
import { formatIndianDate, formatINR } from '../../utils/formatters';

interface ProfitScheduleManagerProps {
  onRecordPayment?: (customer: Customer) => void;
}

export const ProfitScheduleManager: React.FC<ProfitScheduleManagerProps> = ({ onRecordPayment }) => {
  const { currentUser } = useAuth();
  const [profitRecords, setProfitRecords] = useState<MonthlyProfitRecord[]>(() =>
    db.getProfitRecords()
  );
  const [customers] = useState<Customer[]>(() => db.getCustomers());

  // Batch Generation State
  const [targetMonthYear, setTargetMonthYear] = useState<string>('2026-04');
  const [calcDate, setCalcDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [genResult, setGenResult] = useState<{ message: string; totalProfit: number; count: number } | null>(
    null
  );
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Pending'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const refreshList = () => {
    setProfitRecords(db.getProfitRecords());
  };

  const handleGenerateBatch = () => {
    const result = db.generateMonthlyProfitsForAll(
      targetMonthYear,
      calcDate,
      currentUser?.username || 'admin'
    );
    refreshList();
    setGenResult({
      message: `Generated 5% monthly profit for ${result.count} active customer portfolios for ${targetMonthYear}.`,
      totalProfit: result.totalProfit,
      count: result.count,
    });
    setTimeout(() => setGenResult(null), 6000);
  };

  const filteredRecords = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return profitRecords
      .filter((r) => {
        const cust = customers.find((c) => c.id === r.customerId);
        const matchesSearch =
          !q ||
          r.customerId.toLowerCase().includes(q) ||
          r.monthYear.toLowerCase().includes(q) ||
          (cust && cust.fullName.toLowerCase().includes(q));

        const matchesStatus =
          statusFilter === 'All' ||
          (statusFilter === 'Paid' && r.status === 'Paid') ||
          (statusFilter === 'Pending' && r.status === 'Pending');

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => new Date(b.calculationDate).getTime() - new Date(a.calculationDate).getTime());
  }, [profitRecords, customers, searchQuery, statusFilter]);

  const totalGenerated = useMemo(
    () => profitRecords.reduce((sum, r) => sum + r.profitAmount, 0),
    [profitRecords]
  );
  const totalPaid = useMemo(
    () => profitRecords.reduce((sum, r) => sum + r.paidAmount, 0),
    [profitRecords]
  );
  const totalPending = useMemo(
    () => profitRecords.reduce((sum, r) => sum + r.pendingAmount, 0),
    [profitRecords]
  );

  return (
    <div className="p-4 space-y-4 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            Monthly Profit Accrual & Schedules
          </h2>
          <p className="text-xs text-slate-500">
            Batch calculate 5% monthly return strictly derived from active outstanding principal.
          </p>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-3xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
            Total Profit Generated
          </span>
          <span className="text-xl font-extrabold text-slate-900 dark:text-white block mt-0.5">
            {formatINR(totalGenerated)}
          </span>
          <span className="text-[10px] text-slate-500">{profitRecords.length} month records</span>
        </div>

        <div className="p-4 rounded-3xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
            Total Profit Paid Out
          </span>
          <span className="text-xl font-extrabold text-emerald-700 dark:text-emerald-300 block mt-0.5">
            {formatINR(totalPaid)}
          </span>
          <span className="text-[10px] text-emerald-600/80">Disbursed to investors</span>
        </div>

        <div className="p-4 rounded-3xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50">
          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
            Total Profit Pending
          </span>
          <span className="text-xl font-extrabold text-amber-700 dark:text-amber-300 block mt-0.5">
            {formatINR(totalPending)}
          </span>
          <span className="text-[10px] text-amber-600/80">Due for payout</span>
        </div>
      </div>

      {/* Batch Monthly Profit Generation Action Card */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Batch Generate 5% Monthly Profit for All Active Investors
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
              Target Month (YYYY-MM)
            </label>
            <input
              type="month"
              value={targetMonthYear}
              onChange={(e) => setTargetMonthYear(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
              Accrual / Calculation Date
            </label>
            <input
              type="date"
              value={calcDate}
              onChange={(e) => setCalcDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-end">
            <button
              id="batch-generate-profit-btn"
              onClick={handleGenerateBatch}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition"
            >
              <Play className="w-4 h-4 fill-current" />
              Generate Monthly Profit
            </button>
          </div>
        </div>

        {genResult && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs text-emerald-800 dark:text-emerald-300 font-semibold flex items-center justify-between">
            <span>{genResult.message}</span>
            <span className="font-extrabold">{formatINR(genResult.totalProfit)} total</span>
          </div>
        )}
      </div>

      {/* Search & Status Filter */}
      <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Month, Customer ID, Name..."
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-xs"
          />
        </div>

        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 self-start sm:self-auto">
          {(['All', 'Pending', 'Paid'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                statusFilter === st
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Records Table / List */}
      <div className="space-y-2.5">
        {filteredRecords.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No profit records found</p>
          </div>
        ) : (
          filteredRecords.map((rec) => {
            const cust = customers.find((c) => c.id === rec.customerId);
            return (
              <div
                key={rec.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {rec.monthYear.substring(5) || 'MO'}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {cust ? cust.fullName : rec.customerId}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {rec.customerId}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          rec.status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-2">
                      <span>Month: <strong className="text-slate-700 dark:text-slate-300">{rec.monthYear}</strong></span>
                      <span>•</span>
                      <span>Base Principal: {formatINR(rec.principalBaseAmount)}</span>
                      <span>•</span>
                      <span>Rate: {rec.profitRate}%</span>
                    </div>

                    {rec.paymentReference && (
                      <div className="text-[10px] text-slate-400">
                        Paid Ref: {rec.paymentReference} on {formatIndianDate(rec.paymentDate)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800">
                  <div className="text-left sm:text-right">
                    <div className="text-[10px] font-semibold text-slate-400">Profit Amount</div>
                    <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                      {formatINR(rec.profitAmount)}
                    </div>
                  </div>

                  {rec.status !== 'Paid' && onRecordPayment && cust && (
                    <button
                      onClick={() => onRecordPayment(cust)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      Pay
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
