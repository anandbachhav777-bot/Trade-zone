import {
  Calendar,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Layers,
  PieChart,
  Printer,
  Search,
  TrendingUp,
  Users,
  Wallet
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { db } from '../../db/storage';
import { Customer, PaymentType } from '../../types';
import { formatIndianDate, formatINR } from '../../utils/formatters';

type ReportCategory =
  | 'customer_wise'
  | 'investment'
  | 'principal_outstanding'
  | 'profit_report'
  | 'profit_pending'
  | 'payment_report'
  | 'date_wise'
  | 'monthly_report';

export const AdminReports: React.FC = () => {
  const [activeReport, setActiveReport] = useState<ReportCategory>('customer_wise');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('all');
  const [selectedPaymentType, setSelectedPaymentType] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('2026-01-01');
  const [endDate, setEndDate] = useState<string>('2026-12-31');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const customers = db.getCustomers();
  const investments = db.getInvestments();
  const payments = db.getPayments();
  const profitRecords = db.getProfitRecords();

  const reportCategories: { id: ReportCategory; title: string; desc: string }[] = [
    { id: 'customer_wise', title: 'Customer-Wise Report', desc: 'Summary of all customer portfolios and returns' },
    { id: 'investment', title: 'Investment Report', desc: 'Capital investments and start/maturity schedules' },
    { id: 'principal_outstanding', title: 'Principal Outstanding', desc: 'Current active principal balances' },
    { id: 'profit_report', title: 'Profit Report (5% Yield)', desc: 'Generated vs paid monthly returns' },
    { id: 'profit_pending', title: 'Profit Pending Report', desc: 'Outstanding profit payouts due to investors' },
    { id: 'payment_report', title: 'Payment & Payout Report', desc: 'Detailed log of all disbursements' },
    { id: 'date_wise', title: 'Date-Wise Ledger', desc: 'Chronological timeline of transactions' },
    { id: 'monthly_report', title: 'Monthly Summary', desc: 'Month-on-month accounting breakdown' },
  ];

  // Compute table dataset based on selected report & filters
  const reportData = useMemo(() => {
    switch (activeReport) {
      case 'customer_wise':
      case 'principal_outstanding': {
        return customers
          .filter((c) => {
            const matchesCust = selectedCustomerId === 'all' || c.id === selectedCustomerId;
            const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
            return matchesCust && matchesStatus;
          })
          .map((c) => {
            const summary = db.getCustomerFinancialSummary(c.id);
            return {
              id: c.id,
              name: c.fullName,
              mobile: c.mobileNumber,
              totalInvested: summary?.totalInvestment || 0,
              principalReturned: summary?.principalReturned || 0,
              principalBalance: summary?.principalBalance || 0,
              monthlyProfitRate: `${c.monthlyProfitRate}%`,
              currentMonthlyProfit: summary?.currentMonthlyProfit || 0,
              totalProfitGenerated: summary?.totalProfitGenerated || 0,
              totalProfitPaid: summary?.totalProfitPaid || 0,
              profitPending: summary?.profitPending || 0,
              status: c.status,
            };
          });
      }

      case 'investment': {
        return investments
          .filter((inv) => {
            const matchesCust = selectedCustomerId === 'all' || inv.customerId === selectedCustomerId;
            const withinDate =
              (!startDate || inv.investmentDate >= startDate) &&
              (!endDate || inv.investmentDate <= endDate);
            return matchesCust && withinDate;
          })
          .map((inv) => {
            const cust = customers.find((c) => c.id === inv.customerId);
            return {
              id: inv.id,
              customerId: inv.customerId,
              customerName: cust?.fullName || inv.customerId,
              date: inv.investmentDate,
              amount: inv.amount,
              profitRate: `${inv.profitRate}%`,
              expectedMonthlyProfit: (inv.amount * inv.profitRate) / 100,
              profitStartDate: inv.profitStartDate,
              maturityDate: inv.maturityDate || 'Open',
              notes: inv.notes || '-',
            };
          });
      }

      case 'payment_report': {
        return payments
          .filter((p) => {
            const matchesCust = selectedCustomerId === 'all' || p.customerId === selectedCustomerId;
            const matchesType =
              selectedPaymentType === 'all' || p.paymentType === selectedPaymentType;
            const withinDate =
              (!startDate || p.date >= startDate) && (!endDate || p.date <= endDate);
            return matchesCust && matchesType && withinDate;
          })
          .map((p) => {
            const cust = customers.find((c) => c.id === p.customerId);
            return {
              id: p.id,
              customerId: p.customerId,
              customerName: cust?.fullName || p.customerId,
              date: p.date,
              type: p.paymentType,
              amount: p.amount,
              mode: p.paymentMode,
              reference: p.transactionReference,
              remarks: p.remarks || '-',
              recordedBy: p.recordedBy,
            };
          });
      }

      case 'profit_report':
      case 'profit_pending': {
        return profitRecords
          .filter((pr) => {
            const matchesCust = selectedCustomerId === 'all' || pr.customerId === selectedCustomerId;
            const matchesStatus =
              activeReport === 'profit_pending'
                ? pr.pendingAmount > 0
                : statusFilter === 'all' || pr.status === statusFilter;
            const withinDate =
              (!startDate || pr.calculationDate >= startDate) &&
              (!endDate || pr.calculationDate <= endDate);
            return matchesCust && matchesStatus && withinDate;
          })
          .map((pr) => {
            const cust = customers.find((c) => c.id === pr.customerId);
            return {
              id: pr.id,
              customerId: pr.customerId,
              customerName: cust?.fullName || pr.customerId,
              monthYear: pr.monthYear,
              date: pr.calculationDate,
              basePrincipal: pr.principalBaseAmount,
              rate: `${pr.profitRate}%`,
              profitAmount: pr.profitAmount,
              paidAmount: pr.paidAmount,
              pendingAmount: pr.pendingAmount,
              status: pr.status,
              ref: pr.paymentReference || '-',
            };
          });
      }

      case 'date_wise': {
        // Build combined timeline
        const rows: any[] = [];
        for (const inv of investments) {
          if (selectedCustomerId === 'all' || inv.customerId === selectedCustomerId) {
            if ((!startDate || inv.investmentDate >= startDate) && (!endDate || inv.investmentDate <= endDate)) {
              const cust = customers.find((c) => c.id === inv.customerId);
              rows.push({
                date: inv.investmentDate,
                customerId: inv.customerId,
                customerName: cust?.fullName,
                type: 'Investment Deposit',
                category: 'Principal Inflow',
                amount: inv.amount,
                ref: inv.id,
              });
            }
          }
        }
        for (const p of payments) {
          if (selectedCustomerId === 'all' || p.customerId === selectedCustomerId) {
            if (selectedPaymentType === 'all' || p.paymentType === selectedPaymentType) {
              if ((!startDate || p.date >= startDate) && (!endDate || p.date <= endDate)) {
                const cust = customers.find((c) => c.id === p.customerId);
                rows.push({
                  date: p.date,
                  customerId: p.customerId,
                  customerName: cust?.fullName,
                  type: `${p.paymentType} Payout`,
                  category: p.paymentType === 'Principal' ? 'Principal Outflow' : 'Profit Outflow',
                  amount: p.amount,
                  ref: p.transactionReference,
                });
              }
            }
          }
        }
        return rows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }

      case 'monthly_report': {
        const monthMap: Record<string, { month: string; investments: number; principalReturned: number; profitGen: number; profitPaid: number }> = {};
        for (const inv of investments) {
          const m = inv.investmentDate.substring(0, 7);
          if (!monthMap[m]) monthMap[m] = { month: m, investments: 0, principalReturned: 0, profitGen: 0, profitPaid: 0 };
          monthMap[m].investments += inv.amount;
        }
        for (const p of payments) {
          const m = p.date.substring(0, 7);
          if (!monthMap[m]) monthMap[m] = { month: m, investments: 0, principalReturned: 0, profitGen: 0, profitPaid: 0 };
          if (p.paymentType === 'Principal') monthMap[m].principalReturned += p.amount;
          if (p.paymentType === 'Profit') monthMap[m].profitPaid += p.amount;
        }
        for (const pr of profitRecords) {
          const m = pr.monthYear;
          if (!monthMap[m]) monthMap[m] = { month: m, investments: 0, principalReturned: 0, profitGen: 0, profitPaid: 0 };
          monthMap[m].profitGen += pr.profitAmount;
        }
        return Object.values(monthMap).sort((a, b) => b.month.localeCompare(a.month));
      }

      default:
        return [];
    }
  }, [
    activeReport,
    selectedCustomerId,
    selectedPaymentType,
    startDate,
    endDate,
    statusFilter,
    customers,
    investments,
    payments,
    profitRecords,
  ]);

  // Export CSV
  const handleExportCSV = () => {
    if (!reportData || reportData.length === 0) return;
    const headers = Object.keys(reportData[0]).join(',');
    const rows = reportData.map((obj: any) =>
      Object.values(obj)
        .map((val) => `"${String(val).replace(/"/g, '""')}"`)
        .join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TradeZone_${activeReport}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 space-y-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            Admin Financial Reports
          </h2>
          <p className="text-xs text-slate-500">
            Comprehensive audit reports, customer statements, profit breakdown, and ledger export.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          Export CSV Report
        </button>
      </div>

      {/* Report Categories Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {reportCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveReport(cat.id)}
            className={`p-3 rounded-2xl border text-left transition ${
              activeReport === cat.id
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <div className="font-extrabold text-xs leading-tight">{cat.title}</div>
            <div
              className={`text-[10px] mt-1 line-clamp-1 ${
                activeReport === cat.id ? 'text-blue-100' : 'text-slate-400'
              }`}
            >
              {cat.desc}
            </div>
          </button>
        ))}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 text-xs">
        <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-blue-600" />
          Report Filters
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Customer Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Customer</label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
            >
              <option value="all">All Customers ({customers.length})</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName} ({c.id})
                </option>
              ))}
            </select>
          </div>

          {/* Payment Type Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Payment Type</label>
            <select
              value={selectedPaymentType}
              onChange={(e) => setSelectedPaymentType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
            >
              <option value="all">All Payment Types</option>
              <option value="Profit">Profit Payouts Only</option>
              <option value="Principal">Principal Returns Only</option>
              <option value="Other">Other Adjustments</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Report Table Display */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
            {reportCategories.find((c) => c.id === activeReport)?.title} ({reportData.length} rows)
          </span>
          <span className="text-slate-500 text-[11px]">Values in Indian Rupee (₹)</span>
        </div>

        <div className="overflow-x-auto max-h-[500px]">
          {reportData.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No matching records for the selected filters.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  {Object.keys(reportData[0]).map((key) => (
                    <th key={key} className="p-3 capitalize whitespace-nowrap text-[11px]">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {reportData.map((row: any, i: number) => (
                  <tr
                    key={i}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition text-slate-800 dark:text-slate-200"
                  >
                    {Object.entries(row).map(([k, val]: any, idx) => {
                      const isNumber = typeof val === 'number';
                      const isAmount =
                        isNumber &&
                        (k.toLowerCase().includes('amount') ||
                          k.toLowerCase().includes('balance') ||
                          k.toLowerCase().includes('invested') ||
                          k.toLowerCase().includes('profit') ||
                          k.toLowerCase().includes('returned'));

                      return (
                        <td
                          key={idx}
                          className={`p-3 whitespace-nowrap text-[11px] ${
                            isAmount ? 'font-bold font-mono text-slate-900 dark:text-white' : ''
                          }`}
                        >
                          {isAmount
                            ? formatINR(val)
                            : k.toLowerCase().includes('date')
                            ? formatIndianDate(val)
                            : String(val)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
