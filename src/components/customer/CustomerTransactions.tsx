import {
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  History,
  Layers,
  Search,
  Tag,
  Wallet,
  X
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../db/storage';
import { TransactionLedgerItem } from '../../types';
import { formatIndianDate, formatINR } from '../../utils/formatters';
import { generateCustomerPdfStatement } from '../../utils/pdfGenerator';

export const CustomerTransactions: React.FC = () => {
  const { activeCustomer } = useAuth();
  const [filterCategory, setFilterCategory] = useState<'All' | 'Principal' | 'Profit'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  if (!activeCustomer) return null;

  const ledger = db.getCustomerLedger(activeCustomer.id);
  const summary = db.getCustomerFinancialSummary(activeCustomer.id);

  const filteredLedger = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return ledger
      .filter((item) => {
        const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
        const matchesSearch =
          !q ||
          item.displayType.toLowerCase().includes(q) ||
          (item.referenceNumber && item.referenceNumber.toLowerCase().includes(q)) ||
          (item.remarks && item.remarks.toLowerCase().includes(q)) ||
          item.status.toLowerCase().includes(q);

        return matchesCategory && matchesSearch;
      })
      .reverse(); // Newest first
  }, [ledger, filterCategory, searchQuery]);

  const handleDownloadPdf = () => {
    if (summary) {
      generateCustomerPdfStatement(activeCustomer, summary, ledger);
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            Transaction Ledger & History
          </h2>
          <p className="text-xs text-slate-500">
            Real-time audit log of investments, monthly returns, and principal refunds.
          </p>
        </div>

        <button
          onClick={handleDownloadPdf}
          className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          Download PDF Statement
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ref no, type, remarks..."
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-xs"
          />
        </div>

        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 self-start sm:self-auto">
          {(['All', 'Principal', 'Profit'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                filterCategory === cat
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Feed */}
      <div className="space-y-2.5">
        {filteredLedger.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <History className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              No matching transactions found
            </p>
          </div>
        ) : (
          filteredLedger.map((item) => {
            const isOutflow =
              item.type === 'Principal_Return' || item.type === 'Profit_Paid';
            const isProfit = item.category === 'Profit';

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 font-bold ${
                      item.type === 'Investment'
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                        : item.type === 'Principal_Return'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        : item.type === 'Profit_Paid'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {item.category.charAt(0)}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900 dark:text-white text-sm">
                        {item.displayType}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          item.category === 'Principal'
                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        }`}
                      >
                        {item.category}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          item.status === 'Received' || item.status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-2">
                      <span>Date: <strong className="text-slate-700 dark:text-slate-300">{formatIndianDate(item.date)}</strong></span>
                      {item.paymentMode && <span>• Mode: {item.paymentMode}</span>}
                      {item.referenceNumber && <span>• Ref: {item.referenceNumber}</span>}
                    </div>

                    {item.remarks && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 italic">
                        {item.remarks}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800">
                  <div className="text-left sm:text-right">
                    <div
                      className={`text-base font-black ${
                        isOutflow
                          ? 'text-rose-600 dark:text-rose-400'
                          : item.type === 'Investment'
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {isOutflow ? '-' : '+'} {formatINR(item.amount)}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Running Principal Bal: <strong className="text-slate-800 dark:text-slate-200">{formatINR(item.runningPrincipalBalance)}</strong>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
