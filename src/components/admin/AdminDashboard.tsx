import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Calculator,
  CheckCircle2,
  ChevronRight,
  Clock,
  Coins,
  CreditCard,
  Download,
  FileSpreadsheet,
  Layers,
  PieChart,
  Plus,
  Receipt,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
  Wallet
} from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../db/storage';
import { Customer } from '../../types';
import { formatIndianDate, formatINR } from '../../utils/formatters';

interface AdminDashboardProps {
  onNavigateTab: (tab: any) => void;
  onOpenCustomerModal?: (customer: Customer) => void;
  onOpenRecordPaymentModal?: (customer?: Customer) => void;
  onOpenAddCustomerModal?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigateTab,
  onOpenCustomerModal,
  onOpenRecordPaymentModal,
  onOpenAddCustomerModal,
}) => {
  const { currentUser } = useAuth();
  const [metrics, setMetrics] = useState(() => db.getAdminDashboardMetrics());
  const [customers, setCustomers] = useState(() => db.getCustomers());
  const [payments, setPayments] = useState(() => db.getPayments());

  const refreshDashboard = () => {
    setMetrics(db.getAdminDashboardMetrics());
    setCustomers(db.getCustomers());
    setPayments(db.getPayments());
  };

  const recentPayments = [...payments]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto">
      {/* Top Header / Control Bar */}
      <div className="bg-white dark:bg-[#1e293b] rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Fintech Control Panel
            </span>
            <span className="text-xs text-slate-400">
              {formatIndianDate(new Date().toISOString().split('T')[0], 'DD MMM YYYY')}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Portfolio Overview & Accounting
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time isolation of Principal Capital and 5% Monthly Profit yields.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigateTab('customers')}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
            Add Customer
          </button>
          <button
            onClick={() => onNavigateTab('payments')}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
          >
            <CreditCard className="w-3.5 h-3.5" />
            Record Payment
          </button>
        </div>
      </div>

      {/* Primary 4 Metric Cards (Sleek Theme Archetype) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Customers */}
        <div
          onClick={() => onNavigateTab('customers')}
          className="bg-white dark:bg-[#1e293b] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500/50 transition cursor-pointer"
        >
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Total Customers
          </p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            {metrics.totalCustomers}
          </h3>
          <div className="mt-2 flex items-center text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
              +{metrics.activeCustomers} active accounts
            </span>
          </div>
        </div>

        {/* Investment Received */}
        <div
          onClick={() => onNavigateTab('investments')}
          className="bg-white dark:bg-[#1e293b] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500/50 transition cursor-pointer"
        >
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Investment Received
          </p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatINR(metrics.totalInvestmentReceived)}
          </h3>
          <p className="text-[10px] text-slate-400 mt-1 italic">Cumulative portfolio</p>
        </div>

        {/* Principal Outstanding */}
        <div
          onClick={() => onNavigateTab('reports')}
          className="bg-white dark:bg-[#1e293b] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500/50 transition cursor-pointer"
        >
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Principal Outstanding
          </p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatINR(metrics.totalPrincipalOutstanding)}
          </h3>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-amber-400 h-full rounded-full"
              style={{
                width: `${
                  metrics.totalInvestmentReceived > 0
                    ? Math.min(
                        100,
                        Math.round(
                          (metrics.totalPrincipalOutstanding / metrics.totalInvestmentReceived) * 100
                        )
                      )
                    : 0
                }%`,
              }}
            />
          </div>
        </div>

        {/* Profit Generated */}
        <div
          onClick={() => onNavigateTab('reports')}
          className="bg-white dark:bg-[#1e293b] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500/50 transition cursor-pointer"
        >
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Profit Generated
          </p>
          <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatINR(metrics.totalProfitGenerated)}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Calculated at 5% monthly</p>
        </div>
      </div>

      {/* Main Grid: Left Table + Right Sleek Snapshot & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Recent Customers & Investments Table */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1e293b] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">
                Recent Customers & Investments
              </h3>
              <p className="text-[11px] text-slate-400">Portfolios earning 5% per month</p>
            </div>
            <button
              onClick={() => onNavigateTab('customers')}
              className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-0.5"
            >
              + Add New Customer
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 sticky top-0 text-[11px] uppercase text-slate-500 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3">Customer ID</th>
                  <th className="px-5 py-3">Full Name</th>
                  <th className="px-5 py-3 text-right">Principal Bal</th>
                  <th className="px-5 py-3 text-right">Profit Pending</th>
                  <th className="px-5 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {customers.slice(0, 5).map((cust) => {
                  const summary = db.getCustomerFinancialSummary(cust.id);
                  return (
                    <tr
                      key={cust.id}
                      onClick={() => onOpenCustomerModal && onOpenCustomerModal(cust)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition"
                    >
                      <td className="px-5 py-3.5 font-mono text-slate-400 text-[11px]">
                        {cust.id}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-800 dark:text-slate-200">
                        {cust.fullName}
                      </td>
                      <td className="px-5 py-3.5 text-right font-semibold text-slate-900 dark:text-slate-100">
                        {formatINR(summary?.principalBalance || 0)}
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {formatINR(summary?.profitPending || 0)}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            cust.status === 'active'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                          }`}
                        >
                          {cust.status === 'active' ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Admin Snapshot + Quick Actions */}
        <div className="flex flex-col gap-4">
          {/* Dark Admin Snapshot Card */}
          <div className="bg-[#1e293b] rounded-xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-emerald-400 text-xs font-bold tracking-widest uppercase mb-4">
                Admin Snapshot
              </p>
              <div className="space-y-3.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-xs">Total Profit Paid</span>
                  <span className="font-bold text-base text-white">
                    {formatINR(metrics.totalProfitPaid)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-xs">Profit Pending</span>
                  <span className="font-bold text-base text-amber-400">
                    {formatINR(metrics.totalProfitPending)}
                  </span>
                </div>
                <div className="h-px bg-slate-700 my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-xs font-semibold">Total Outstanding</span>
                  <span className="font-bold text-xl text-emerald-400">
                    {formatINR(metrics.totalPrincipalOutstanding + metrics.totalProfitPending)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('reports')}
                className="w-full mt-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-bold transition-all text-xs text-white shadow-sm flex items-center justify-center gap-1.5"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Generate Master Report
              </button>
            </div>
            <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          </div>

          {/* Quick Payment Entry Card */}
          <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col shadow-sm">
            <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Quick Payment Entry</span>
              <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
            </h4>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Type</label>
                  <select
                    id="quick-pay-type"
                    className="w-full text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Profit">Profit Payout</option>
                    <option value="Principal">Principal Return</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Mode</label>
                  <select
                    id="quick-pay-mode"
                    className="w-full text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option>Bank Transfer (NEFT/IMPS)</option>
                    <option>UPI</option>
                    <option>Cheque</option>
                    <option>Cash</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Select Investor</label>
                <select
                  id="quick-pay-customer"
                  className="w-full text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} ({c.id})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => onNavigateTab('payments')}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
              >
                Proceed to Payment Desk
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation Shortcuts Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => onNavigateTab('customers')}
          className="p-3.5 rounded-xl bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 transition text-left flex items-center gap-3 shadow-sm"
        >
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-xs text-slate-900 dark:text-white">Customers</div>
            <div className="text-[10px] text-slate-400">{customers.length} Profiles</div>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('investments')}
          className="p-3.5 rounded-xl bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 transition text-left flex items-center gap-3 shadow-sm"
        >
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-xs text-slate-900 dark:text-white">Investments</div>
            <div className="text-[10px] text-slate-400">5% Returns Plan</div>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('profit_schedules')}
          className="p-3.5 rounded-xl bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 transition text-left flex items-center gap-3 shadow-sm"
        >
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-xs text-slate-900 dark:text-white">Monthly Accruals</div>
            <div className="text-[10px] text-slate-400">Batch Yield Run</div>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('reports')}
          className="p-3.5 rounded-xl bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 transition text-left flex items-center gap-3 shadow-sm"
        >
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-xs text-slate-900 dark:text-white">Reports & Ledger</div>
            <div className="text-[10px] text-slate-400">Export & Audit</div>
          </div>
        </button>
      </div>

      {/* Accounting & Regulatory Note */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 leading-relaxed flex items-start gap-3 shadow-sm">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-800 dark:text-white font-semibold">Accounting Notice:</strong> Principal balances and 5% Monthly Profit yields are maintained on distinct, isolated ledgers. All principal refunds dynamically calibrate ongoing monthly yields.
        </div>
      </div>
    </div>
  );
};
