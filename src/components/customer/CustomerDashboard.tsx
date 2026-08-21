import {
  AlertCircle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  Eye,
  FileText,
  HelpCircle,
  History,
  Info,
  Layers,
  Percent,
  PieChart,
  ShieldCheck,
  TrendingUp,
  User,
  Wallet
} from 'lucide-react';
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../db/storage';
import { formatIndianDate, formatINR } from '../../utils/formatters';
import { generateCustomerPdfStatement } from '../../utils/pdfGenerator';

interface CustomerDashboardProps {
  onNavigateTab: (tab: any) => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ onNavigateTab }) => {
  const { activeCustomer, currentUser } = useAuth();

  if (!activeCustomer) {
    return (
      <div className="p-8 text-center text-slate-500">
        <User className="w-12 h-12 mx-auto mb-2 text-slate-300" />
        <p className="text-sm">No customer profile linked to this account.</p>
      </div>
    );
  }

  const summary = db.getCustomerFinancialSummary(activeCustomer.id);
  const ledger = db.getCustomerLedger(activeCustomer.id);
  const recentTransactions = [...ledger].reverse().slice(0, 4);

  const handleDownloadPdf = () => {
    if (summary) {
      generateCustomerPdfStatement(activeCustomer, summary, ledger);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto">
      {/* Top Welcome / Status Card */}
      <div className="bg-white dark:bg-[#1e293b] rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Customer Account • {activeCustomer.id}
            </span>
            <span className="text-xs text-slate-400">
              Joined {formatIndianDate(activeCustomer.startDate)}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Welcome back, {activeCustomer.fullName}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Your investment portfolio generates a structured 5% monthly return.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="download-statement-top-btn"
            onClick={handleDownloadPdf}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Download Statement PDF
          </button>
        </div>
      </div>

      {/* Hero Financial Overview (Dark Card Archetype) */}
      <div className="bg-[#1e293b] rounded-xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2 space-y-2">
            <span className="text-emerald-400 text-xs font-bold tracking-widest uppercase block">
              Active Principal Balance (Outstanding)
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              {formatINR(summary?.principalBalance)}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1">
              <span>Total Deposited: <strong className="text-white">{formatINR(summary?.totalInvestment)}</strong></span>
              <span>•</span>
              <span>Principal Returned: <strong className="text-slate-200">{formatINR(summary?.principalReturned)}</strong></span>
            </div>
          </div>

          {/* 5% Monthly Profit Badge */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Monthly Return Rate
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[11px] font-bold">
                {summary?.profitRate || 5}% / month
              </span>
            </div>
            <div className="text-2xl font-bold text-emerald-400 mt-2">
              +{formatINR(summary?.currentMonthlyProfit)}
            </div>
            <span className="text-[10px] text-slate-400 mt-1">
              Next payout expected {formatIndianDate(summary?.nextProfitDueDate, 'DD MMM YYYY')}
            </span>
          </div>
        </div>

        <div className="absolute top-[-20%] right-[-10%] w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Primary 4-Metric Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Investment */}
        <div className="bg-white dark:bg-[#1e293b] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Total Investment
          </p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatINR(summary?.totalInvestment)}
          </h3>
          <p className="text-[10px] text-slate-400 mt-1 italic">Gross capital committed</p>
        </div>

        {/* Principal Returned */}
        <div className="bg-white dark:bg-[#1e293b] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Principal Returned
          </p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatINR(summary?.principalReturned)}
          </h3>
          <p className="text-[10px] text-slate-400 mt-1 italic">Capital credited back</p>
        </div>

        {/* Total Profit Received */}
        <div className="bg-white dark:bg-[#1e293b] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Profit Received
          </p>
          <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatINR(summary?.totalProfitPaid)}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Disbursed to your account</p>
        </div>

        {/* Profit Pending */}
        <div className="bg-white dark:bg-[#1e293b] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Profit Pending
          </p>
          <h3 className="text-2xl font-bold text-amber-500 dark:text-amber-400">
            {formatINR(summary?.profitPending)}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Accrued awaiting transfer</p>
        </div>
      </div>

      {/* Main Grid: Activity Ledger + Payout & Accounting Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Activity Ledger */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1e293b] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">
                Recent Transactions & Ledger
              </h3>
              <p className="text-[11px] text-slate-400">Principal deposits, payouts, and monthly yields</p>
            </div>
            <button
              onClick={() => onNavigateTab('transactions')}
              className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-0.5"
            >
              View Full History →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 sticky top-0 text-[11px] uppercase text-slate-500 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Description</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                  <th className="px-5 py-3 text-right">Principal Bal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                      No activity recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentTransactions.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        {formatIndianDate(item.date)}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-800 dark:text-slate-200">
                        {item.displayType}
                        <div className="text-[10px] text-slate-400">
                          {item.remarks || item.referenceNumber || '-'}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.category === 'Principal'
                              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}
                        >
                          {item.category}
                        </span>
                      </td>
                      <td
                        className={`px-5 py-3.5 text-right font-bold ${
                          item.type === 'Principal_Return' || item.type === 'Profit_Paid'
                            ? 'text-rose-600 dark:text-rose-400'
                            : item.type === 'Investment'
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {item.type === 'Principal_Return' || item.type === 'Profit_Paid' ? '-' : '+'} {formatINR(item.amount)}
                      </td>
                      <td className="px-5 py-3.5 text-right font-semibold text-slate-700 dark:text-slate-300">
                        {formatINR(item.runningPrincipalBalance)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Payout Status & Guarantee Card */}
        <div className="flex flex-col gap-4">
          {/* Payout Information */}
          <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center justify-between">
              <span>Payout Schedule</span>
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            </h4>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700">
                <div className="text-[10px] uppercase font-bold text-slate-400">Next Scheduled Payout</div>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {formatIndianDate(summary?.nextProfitDueDate, 'DD MMM YYYY')}
                </div>
                <div className="text-xs font-semibold text-emerald-600 mt-0.5">
                  Expected: {formatINR(summary?.currentMonthlyProfit)}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700">
                <div className="text-[10px] uppercase font-bold text-slate-400">Last Payment Received</div>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {summary?.lastPaymentAmount ? formatINR(summary.lastPaymentAmount) : 'No payments yet'}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {summary?.lastPaymentDate
                    ? `${formatIndianDate(summary.lastPaymentDate)} • ${summary.lastPaymentType}`
                    : 'Awaiting initial disbursement'}
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('statement')}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              View Full Statement Ledger
            </button>
          </div>

          {/* Separation Guarantee */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 leading-relaxed flex items-start gap-3 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-800 dark:text-white font-semibold">Segregated Ledgers:</strong> Principal balance and monthly yields operate on distinct accounting streams. Principal returns never affect previously distributed profits.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
