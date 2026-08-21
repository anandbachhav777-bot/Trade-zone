import {
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  FileText,
  Mail,
  MapPin,
  Percent,
  Phone,
  Plus,
  ShieldCheck,
  TrendingUp,
  User,
  Wallet,
  X
} from 'lucide-react';
import React, { useState } from 'react';
import { db } from '../../db/storage';
import { Customer } from '../../types';
import { formatIndianDate, formatINR } from '../../utils/formatters';
import { generateCustomerPdfStatement } from '../../utils/pdfGenerator';

interface CustomerDetailModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onRecordPayment?: (customer: Customer) => void;
  onAddInvestment?: (customer: Customer) => void;
  onRefresh?: () => void;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  customer,
  isOpen,
  onClose,
  onRecordPayment,
  onAddInvestment,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'ledger' | 'profits' | 'investments'>('summary');

  if (!isOpen || !customer) return null;

  const summary = db.getCustomerFinancialSummary(customer.id);
  const ledger = db.getCustomerLedger(customer.id);
  const profitRecords = db.getProfitRecordsByCustomerId(customer.id);
  const investments = db.getInvestmentsByCustomerId(customer.id);

  const handleDownloadPdf = () => {
    if (summary) {
      generateCustomerPdfStatement(customer, summary, ledger);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center text-white font-extrabold text-lg shadow-md">
              {customer.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-white">{customer.fullName}</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-950/80 text-blue-300 border border-blue-800/50">
                  {customer.id}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    customer.status === 'active'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {customer.status.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-300 flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-emerald-400" /> +91 {customer.mobileNumber}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-blue-400" /> Started: {formatIndianDate(customer.startDate)}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
              title="Download Statement PDF"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-xs">
            {(['summary', 'ledger', 'profits', 'investments'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-xl font-bold capitalize transition ${
                  activeTab === tab
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {onRecordPayment && (
              <button
                onClick={() => {
                  onClose();
                  onRecordPayment(customer);
                }}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
              >
                <CreditCard className="w-3.5 h-3.5" />
                Record Payment
              </button>
            )}
            {onAddInvestment && (
              <button
                onClick={() => {
                  onClose();
                  onAddInvestment(customer);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Inv
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {summary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                  Principal Balance
                </span>
                <span className="text-base font-extrabold text-slate-900 dark:text-white block mt-0.5">
                  {formatINR(summary.principalBalance)}
                </span>
                <span className="text-[10px] text-slate-500">
                  Total Inv: {formatINR(summary.totalInvestment)}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                  Monthly Profit @ {summary.profitRate}%
                </span>
                <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-300 block mt-0.5">
                  {formatINR(summary.currentMonthlyProfit)}/mo
                </span>
                <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80">
                  On {formatINR(summary.principalBalance)} Bal
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                  Profit Paid
                </span>
                <span className="text-base font-extrabold text-slate-900 dark:text-white block mt-0.5">
                  {formatINR(summary.totalProfitPaid)}
                </span>
                <span className="text-[10px] text-slate-500">
                  Total Gen: {formatINR(summary.totalProfitGenerated)}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50">
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                  Profit Pending
                </span>
                <span className="text-base font-extrabold text-amber-700 dark:text-amber-300 block mt-0.5">
                  {formatINR(summary.profitPending)}
                </span>
                <span className="text-[10px] text-amber-600/80 dark:text-amber-400/80">
                  Due Payout
                </span>
              </div>
            </div>
          )}

          {activeTab === 'summary' && (
            <div className="space-y-4">
              {/* Profile Details */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  Investor Information & Rules
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Address</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {customer.address || 'Not Provided'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Email</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {customer.email || 'Not Provided'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Maturity / Exit Date</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {formatIndianDate(customer.endDate)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Principal Returned Till Date</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {formatINR(summary?.principalReturned)}
                    </span>
                  </div>
                  {customer.notes && (
                    <div className="sm:col-span-2">
                      <span className="text-slate-400 block text-[11px]">Notes</span>
                      <p className="text-slate-700 dark:text-slate-300 italic">{customer.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Accounting Rule Box */}
              <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/70 dark:border-blue-900/50 text-xs">
                <div className="flex items-center gap-2 font-bold text-blue-800 dark:text-blue-300 mb-1">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  Strict Accounting Principle Enforced
                </div>
                <p className="text-blue-900/80 dark:text-blue-200/80 leading-relaxed text-[11px]">
                  Principal and Profit are tracked completely separately. Returning principal automatically reduces subsequent monthly 5% returns on the new outstanding balance. Profit payments never reduce principal balances.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'ledger' && (
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center justify-between">
                <span>Complete Transaction Ledger</span>
                <span className="text-[10px] text-slate-400 font-normal">{ledger.length} entries</span>
              </h4>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                {ledger.map((item) => (
                  <div key={item.id} className="p-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            item.category === 'Principal'
                              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}
                        >
                          {item.displayType}
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {formatIndianDate(item.date)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span
                          className={`font-extrabold text-sm ${
                            item.type === 'Principal_Return' || item.type === 'Profit_Paid'
                              ? 'text-rose-600 dark:text-rose-400'
                              : item.type === 'Investment'
                              ? 'text-indigo-600 dark:text-indigo-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {item.type === 'Principal_Return' || item.type === 'Profit_Paid' ? '-' : '+'} {formatINR(item.amount)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                      <span>{item.remarks || item.referenceNumber || '-'}</span>
                      <span className="font-medium">
                        Principal Bal: <strong className="text-slate-800 dark:text-slate-200">{formatINR(item.runningPrincipalBalance)}</strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'profits' && (
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                Monthly Profit Records ({profitRecords.length})
              </h4>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                {profitRecords.map((pr) => (
                  <div key={pr.id} className="p-3 bg-white dark:bg-slate-900 text-xs flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">
                        Month: {pr.monthYear}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Base Principal: {formatINR(pr.principalBaseAmount)} @ {pr.profitRate}%
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-emerald-600 dark:text-emerald-400">
                        {formatINR(pr.profitAmount)}
                      </div>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm ${
                          pr.status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {pr.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'investments' && (
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                Active Investments ({investments.length})
              </h4>
              <div className="space-y-2">
                {investments.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-xs">
                        {inv.id} • {formatIndianDate(inv.investmentDate)}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Profit Rate: <span className="text-emerald-600 font-bold">{inv.profitRate}% / month</span>
                      </div>
                    </div>
                    <div className="text-right font-extrabold text-sm text-indigo-600 dark:text-indigo-400">
                      {formatINR(inv.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
