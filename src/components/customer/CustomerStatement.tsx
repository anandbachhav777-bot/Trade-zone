import {
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Landmark,
  Percent,
  Printer,
  ShieldCheck,
  User,
  Wallet
} from 'lucide-react';
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../db/storage';
import { formatIndianDate, formatINR } from '../../utils/formatters';
import { generateCustomerPdfStatement } from '../../utils/pdfGenerator';

export const CustomerStatement: React.FC = () => {
  const { activeCustomer } = useAuth();

  if (!activeCustomer) return null;

  const summary = db.getCustomerFinancialSummary(activeCustomer.id);
  const ledger = db.getCustomerLedger(activeCustomer.id);

  const handleDownloadPdf = () => {
    if (summary) {
      generateCustomerPdfStatement(activeCustomer, summary, ledger);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 space-y-4 max-w-5xl mx-auto">
      {/* Header Actions */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Official Account Statement
          </h2>
          <p className="text-xs text-slate-500">
            Certified record of investments, principal returns, and monthly profit yield distributions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            id="download-statement-pdf-btn"
            onClick={handleDownloadPdf}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition"
          >
            <Download className="w-4 h-4" />
            Download PDF Statement
          </button>
        </div>
      </div>

      {/* Printable Statement Sheet */}
      <div
        id="printable-statement"
        className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-slate-800 dark:text-slate-200 text-xs"
      >
        {/* Statement Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md">
              TZ
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                TRADE ZONE
              </h1>
              <p className="text-[11px] font-semibold text-slate-500">
                Investment Portfolio & Return Statement
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Generated On
            </span>
            <div className="font-extrabold text-slate-900 dark:text-white text-xs">
              {formatIndianDate(new Date().toISOString().split('T')[0], 'DD MMM YYYY')}
            </div>
            <div className="text-[10px] text-emerald-600 font-mono font-bold">
              REF: TZ-STMT-{activeCustomer.id}-{Date.now().toString().slice(-6)}
            </div>
          </div>
        </div>

        {/* Customer Profile & Account Meta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Investor Details
            </span>
            <div className="font-extrabold text-sm text-slate-900 dark:text-white">
              {activeCustomer.fullName}
            </div>
            <div className="text-slate-600 dark:text-slate-400">ID: <strong className="font-mono">{activeCustomer.id}</strong></div>
            <div className="text-slate-600 dark:text-slate-400">Mobile: {activeCustomer.mobileNumber}</div>
            {activeCustomer.address && (
              <div className="text-slate-600 dark:text-slate-400">Address: {activeCustomer.address}</div>
            )}
          </div>

          <div className="space-y-1 sm:text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Terms & Schedule
            </span>
            <div className="text-slate-600 dark:text-slate-400">
              Start Date: <strong className="text-slate-900 dark:text-white">{formatIndianDate(activeCustomer.startDate)}</strong>
            </div>
            <div className="text-slate-600 dark:text-slate-400">
              Maturity Date: <strong className="text-slate-900 dark:text-white">{formatIndianDate(activeCustomer.maturityDate)}</strong>
            </div>
            <div className="text-emerald-600 dark:text-emerald-400 font-extrabold">
              Profit Rate: {activeCustomer.monthlyProfitRate || 5.0}% per month
            </div>
            <div className="text-slate-500 text-[10px]">
              Status: <span className="font-bold text-emerald-600 uppercase">{activeCustomer.status}</span>
            </div>
          </div>
        </div>

        {/* Summary Metric Matrix */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Account Financial Summary
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block">Total Investment</span>
              <span className="font-black text-sm text-slate-900 dark:text-white">
                {formatINR(summary?.totalInvestment)}
              </span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block">Principal Returned</span>
              <span className="font-black text-sm text-slate-700 dark:text-slate-300">
                {formatINR(summary?.principalReturned)}
              </span>
            </div>

            <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
              <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 block">
                Principal Balance
              </span>
              <span className="font-black text-sm text-indigo-700 dark:text-indigo-300">
                {formatINR(summary?.principalBalance)}
              </span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block">Profit Generated (@5%)</span>
              <span className="font-black text-sm text-emerald-600 dark:text-emerald-400">
                {formatINR(summary?.totalProfitGenerated)}
              </span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block">Profit Paid Out</span>
              <span className="font-black text-sm text-emerald-700 dark:text-emerald-300">
                {formatINR(summary?.totalProfitPaid)}
              </span>
            </div>

            <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-800">
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 block">
                Profit Pending Payout
              </span>
              <span className="font-black text-sm text-amber-700 dark:text-amber-300">
                {formatINR(summary?.profitPending)}
              </span>
            </div>
          </div>
        </div>

        {/* Complete Transaction Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Complete Audit Ledger & Transaction History
          </h3>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700 text-[11px]">
                <tr>
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5">Type</th>
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5">Reference</th>
                  <th className="p-2.5 text-right">Amount (₹)</th>
                  <th className="p-2.5 text-right">Principal Bal (₹)</th>
                  <th className="p-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {ledger.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-2.5 whitespace-nowrap">{formatIndianDate(item.date)}</td>
                    <td className="p-2.5 font-bold whitespace-nowrap">{item.displayType}</td>
                    <td className="p-2.5 whitespace-nowrap">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          item.category === 'Principal'
                            ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {item.category}
                      </span>
                    </td>
                    <td className="p-2.5 font-mono text-[10px] text-slate-500 whitespace-nowrap">
                      {item.referenceNumber || '-'}
                    </td>
                    <td
                      className={`p-2.5 text-right font-black whitespace-nowrap ${
                        item.type === 'Principal_Return' || item.type === 'Profit_Paid'
                          ? 'text-rose-600 dark:text-rose-400'
                          : item.type === 'Investment'
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {item.type === 'Principal_Return' || item.type === 'Profit_Paid' ? '-' : '+'} {formatINR(item.amount)}
                    </td>
                    <td className="p-2.5 text-right font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {formatINR(item.runningPrincipalBalance)}
                    </td>
                    <td className="p-2.5 text-center whitespace-nowrap">
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Statement Footer Certification & Disclaimer */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Certified System Ledger Output
          </div>
          <p className="leading-relaxed">
            This is a computer-generated statement issued by Trade Zone. Principal balances and Monthly Profit disbursements are maintained under strict separation rules. Please preserve this statement for your financial and tax records.
          </p>
        </div>
      </div>
    </div>
  );
};
