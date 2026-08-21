import {
  AlertCircle,
  Banknote,
  Building2,
  Calendar,
  CheckCircle2,
  Coins,
  CreditCard,
  Download,
  FileText,
  Filter,
  Landmark,
  Plus,
  Printer,
  Receipt,
  Search,
  ShieldAlert,
  Smartphone,
  Trash2,
  Wallet,
  X
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../db/storage';
import { Customer, Payment, PaymentMode, PaymentType } from '../../types';
import { formatIndianDate, formatINR } from '../../utils/formatters';
import { generateCashReceiptPdf } from '../../utils/pdfGenerator';
import { ConfirmModal } from '../common/ConfirmModal';

interface PaymentManagementProps {
  preselectedCustomer?: Customer | null;
  onPaymentRecorded?: () => void;
}

export const PaymentManagement: React.FC<PaymentManagementProps> = ({
  preselectedCustomer,
  onPaymentRecorded,
}) => {
  const { currentUser } = useAuth();
  const [payments, setPayments] = useState<Payment[]>(() => db.getPayments());
  const [customers] = useState<Customer[]>(() => db.getCustomers());

  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | PaymentType>('All');
  const [modeFilter, setModeFilter] = useState<'All' | PaymentMode>('All');

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    preselectedCustomer ? preselectedCustomer.id : customers[0]?.id || ''
  );
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [paymentType, setPaymentType] = useState<PaymentType>('Profit');
  const [amount, setAmount] = useState<number>(35000);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Cash');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');
  const [autoDownloadReceipt, setAutoDownloadReceipt] = useState<boolean>(true);
  const [formError, setFormError] = useState<string>('');

  // Delete/Reversal state
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);

  const refreshList = () => {
    setPayments(db.getPayments());
    if (onPaymentRecorded) onPaymentRecorded();
  };

  const currentSelectedSummary = useMemo(() => {
    if (!selectedCustomerId) return null;
    return db.getCustomerFinancialSummary(selectedCustomerId);
  }, [selectedCustomerId, payments]);

  const handleOpenRecordModal = (cust?: Customer, defaultMode: PaymentMode = 'Cash') => {
    if (cust) {
      setSelectedCustomerId(cust.id);
      const summ = db.getCustomerFinancialSummary(cust.id);
      if (summ && summ.profitPending > 0) {
        setPaymentType('Profit');
        setAmount(summ.profitPending);
      } else if (summ) {
        setPaymentType('Profit');
        setAmount(summ.currentMonthlyProfit || 10000);
      }
    } else {
      setSelectedCustomerId(customers[0]?.id || '');
    }
    setPaymentMode(defaultMode);
    setPaymentDate(new Date().toISOString().split('T')[0]);
    if (defaultMode === 'Cash') {
      setReferenceNumber(`CASH-REC-${Date.now().toString().slice(-6)}`);
    } else {
      setReferenceNumber(`TXN-${Date.now().toString().slice(-8)}`);
    }
    setRemarks('');
    setFormError('');
    setIsRecordModalOpen(true);
  };

  const handleModeChange = (mode: PaymentMode) => {
    setPaymentMode(mode);
    if (mode === 'Cash') {
      if (!referenceNumber || referenceNumber.startsWith('TXN-') || referenceNumber.startsWith('REF-')) {
        setReferenceNumber(`CASH-REC-${Date.now().toString().slice(-6)}`);
      }
    } else if (mode === 'Bank') {
      if (!referenceNumber || referenceNumber.startsWith('CASH-') || referenceNumber.startsWith('UPI-')) {
        setReferenceNumber(`NEFT-${Date.now().toString().slice(-8)}`);
      }
    } else if (mode === 'UPI') {
      if (!referenceNumber || referenceNumber.startsWith('CASH-') || referenceNumber.startsWith('NEFT-')) {
        setReferenceNumber(`UPI-${Date.now().toString().slice(-8)}`);
      }
    }
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!selectedCustomerId) {
      setFormError('Please select a valid customer.');
      return;
    }

    if (!amount || amount <= 0) {
      setFormError('Payment amount must be greater than zero.');
      return;
    }

    const summary = db.getCustomerFinancialSummary(selectedCustomerId);
    if (paymentType === 'Principal' && summary && amount > summary.principalBalance) {
      setFormError(
        `Cannot return more principal (${formatINR(amount)}) than the customer's current principal balance (${formatINR(
          summary.principalBalance
        )}).`
      );
      return;
    }

    const newPayment: Payment = {
      id: `PAY-${Date.now().toString().slice(-6)}`,
      customerId: selectedCustomerId,
      date: paymentDate,
      paymentType,
      amount: Number(amount),
      paymentMode,
      transactionReference:
        referenceNumber ||
        (paymentMode === 'Cash'
          ? `CASH-REC-${Date.now().toString().slice(-6)}`
          : `REF-${Date.now().toString().slice(-6)}`),
      remarks: remarks.trim() || (paymentMode === 'Cash' ? 'Cash payment handover' : undefined),
      recordedBy: currentUser?.username || 'admin',
      createdAt: new Date().toISOString().split('T')[0],
    };

    db.recordPayment(newPayment, currentUser?.username || 'admin');

    if (autoDownloadReceipt && paymentMode === 'Cash') {
      const cust = customers.find((c) => c.id === selectedCustomerId);
      try {
        generateCashReceiptPdf(newPayment, cust);
      } catch (err) {
        console.error('PDF generation error', err);
      }
    }

    setIsRecordModalOpen(false);
    refreshList();
  };

  const handleDeletePaymentConfirm = (reason?: string) => {
    if (paymentToDelete) {
      db.deletePayment(
        paymentToDelete.id,
        currentUser?.username || 'admin',
        reason || 'Administrative correction'
      );
      setPaymentToDelete(null);
      refreshList();
    }
  };

  // Filtered Payments
  const filteredPayments = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return payments
      .filter((p) => {
        const cust = customers.find((c) => c.id === p.customerId);
        const matchesSearch =
          !q ||
          p.customerId.toLowerCase().includes(q) ||
          p.transactionReference.toLowerCase().includes(q) ||
          (p.remarks && p.remarks.toLowerCase().includes(q)) ||
          (cust && cust.fullName.toLowerCase().includes(q));

        const matchesType = typeFilter === 'All' || p.paymentType === typeFilter;
        const matchesMode = modeFilter === 'All' || p.paymentMode === modeFilter;
        return matchesSearch && matchesType && matchesMode;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [payments, customers, searchQuery, typeFilter, modeFilter]);

  // Cash vs Other Statistics
  const cashPaymentsTotal = useMemo(() => {
    return payments
      .filter((p) => p.paymentMode === 'Cash')
      .reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  const bankPaymentsTotal = useMemo(() => {
    return payments
      .filter((p) => p.paymentMode === 'Bank')
      .reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  const upiPaymentsTotal = useMemo(() => {
    return payments
      .filter((p) => p.paymentMode === 'UPI')
      .reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  return (
    <div className="p-4 space-y-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            Payment Management & Payouts
          </h2>
          <p className="text-xs text-slate-500">
            Record Cash, Bank, and UPI payments with segregated ledgers and instant Cash Voucher printing.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            id="record-cash-payment-btn"
            onClick={() => handleOpenRecordModal(undefined, 'Cash')}
            className="px-3.5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition"
          >
            <Banknote className="w-4 h-4" />
            Record Cash Payout
          </button>
          <button
            id="record-payment-btn"
            onClick={() => handleOpenRecordModal(undefined, 'Bank')}
            className="px-3.5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            Record Payment
          </button>
        </div>
      </div>

      {/* Payment Modes Breakdown Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
              Total Cash Disbursed
            </span>
            <span className="text-lg font-extrabold text-emerald-700 dark:text-emerald-300 block mt-0.5">
              {formatINR(cashPaymentsTotal)}
            </span>
            <span className="text-[10px] text-emerald-600/80">Cash Receipts & Vouchers</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
            <Banknote className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
              Total Bank Disbursed
            </span>
            <span className="text-lg font-extrabold text-blue-700 dark:text-blue-300 block mt-0.5">
              {formatINR(bankPaymentsTotal)}
            </span>
            <span className="text-[10px] text-blue-600/80">NEFT / RTGS / IMPS</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
            <Landmark className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
              Total UPI Disbursed
            </span>
            <span className="text-lg font-extrabold text-purple-700 dark:text-purple-300 block mt-0.5">
              {formatINR(upiPaymentsTotal)}
            </span>
            <span className="text-[10px] text-purple-600/80">Instant QR / VPA</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
            <Smartphone className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Accounting Safeguard Banner */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 border border-blue-100 dark:border-slate-700 text-xs">
        <div className="flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-extrabold text-slate-900 dark:text-white">
              Accounting Safeguard: Strictly Segregated Payments & Cash Tracking
            </span>
            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              Payments marked as <strong className="text-emerald-600">Profit</strong> will reduce pending profit and <em>never reduce principal</em>. Cash disbursements automatically generate official Cash Receipts and are logged with cashier audit trails.
            </p>
          </div>
        </div>
      </div>

      {/* Search & Multi-Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Ref / Voucher No., Customer ID, Name, Remarks..."
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-xs"
          />
        </div>

        {/* Mode Filter Pills */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 self-start sm:self-auto">
          {(['All', 'Cash', 'Bank', 'UPI'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setModeFilter(mode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                modeFilter === mode
                  ? mode === 'Cash'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {mode === 'Cash' && <Banknote className="w-3.5 h-3.5" />}
              {mode === 'All' ? 'All Modes' : mode}
            </button>
          ))}
        </div>

        {/* Type Filter Pills */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 self-start sm:self-auto">
          {(['All', 'Profit', 'Principal', 'Other'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                typeFilter === type
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Payment Records List */}
      <div className="space-y-2.5">
        {filteredPayments.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <Receipt className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No payment records found</p>
          </div>
        ) : (
          filteredPayments.map((payment) => {
            const customer = customers.find((c) => c.id === payment.customerId);
            const isProfit = payment.paymentType === 'Profit';
            const isPrincipal = payment.paymentType === 'Principal';
            const isCash = payment.paymentMode === 'Cash';

            return (
              <div
                key={payment.id}
                id={`payment-row-${payment.id}`}
                className={`bg-white dark:bg-slate-900 rounded-2xl p-3.5 border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                  isCash
                    ? 'border-emerald-200 dark:border-emerald-900/60 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2.5 rounded-2xl shrink-0 mt-0.5 ${
                      isCash
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : isProfit
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                        : isPrincipal
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {isCash ? <Banknote className="w-5 h-5" /> : isProfit ? <Coins className="w-5 h-5" /> : <Wallet className="w-5 h-5" />}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {customer ? customer.fullName : payment.customerId}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {payment.customerId}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          isProfit
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : isPrincipal
                            ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                            : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {payment.paymentType} Payment
                      </span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          isCash
                            ? 'bg-emerald-600 text-white'
                            : payment.paymentMode === 'Bank'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                        }`}
                      >
                        {isCash && <Banknote className="w-3 h-3" />}
                        {payment.paymentMode}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-2">
                      <span>Ref / Voucher: <strong className="text-slate-700 dark:text-slate-300">{payment.transactionReference}</strong></span>
                      <span>•</span>
                      <span>Date: {formatIndianDate(payment.date)}</span>
                      <span>•</span>
                      <span>Recorded by: {payment.recordedBy}</span>
                    </div>

                    {payment.remarks && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 italic">
                        {payment.remarks}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800">
                  <div className="text-left sm:text-right">
                    <div className="text-[10px] font-semibold text-slate-400">Amount Paid</div>
                    <div className="text-base font-extrabold text-slate-900 dark:text-white">
                      {formatINR(payment.amount)}
                    </div>
                  </div>

                  {/* Cash Receipt / Voucher Download */}
                  {isCash && (
                    <button
                      onClick={() => generateCashReceiptPdf(payment, customer)}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 dark:text-emerald-300 font-bold text-xs flex items-center gap-1 border border-emerald-200 dark:border-emerald-800 transition"
                      title="Print / Download Official Cash Voucher PDF"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Voucher
                    </button>
                  )}

                  <button
                    onClick={() => setPaymentToDelete(payment)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                    title="Delete / Reverse Payment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Record Payment Modal */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-600 text-white">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">Record Payment / Cash Payout</h3>
                  <p className="text-[10px] text-slate-400">Strict ledger recording with instant receipt generation</p>
                </div>
              </div>
              <button
                onClick={() => setIsRecordModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 font-semibold">
                  {formError}
                </div>
              )}

              {/* Customer Selector */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Select Customer *
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-xs"
                >
                  {customers.map((c) => {
                    const summ = db.getCustomerFinancialSummary(c.id);
                    return (
                      <option key={c.id} value={c.id}>
                        {c.fullName} ({c.id}) — Bal: ₹{summ?.principalBalance.toLocaleString('en-IN')} | Pending Profit: ₹{summ?.profitPending.toLocaleString('en-IN')}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Live Customer Status Preview */}
              {currentSelectedSummary && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Current Principal Balance</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatINR(currentSelectedSummary.principalBalance)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Pending Profit Accrued</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {formatINR(currentSelectedSummary.profitPending)}
                    </span>
                  </div>
                </div>
              )}

              {/* Payment Type Tabs */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Payment Type (Strict Ledger Separation) *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { type: 'Profit' as PaymentType, label: 'Profit Payout', desc: 'Does not affect Principal' },
                    { type: 'Principal' as PaymentType, label: 'Principal Return', desc: 'Reduces Principal Balance' },
                    { type: 'Other' as PaymentType, label: 'Other', desc: 'Fee / Misc adjustment' },
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.type}
                      onClick={() => setPaymentType(item.type)}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        paymentType === item.type
                          ? item.type === 'Profit'
                            ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                            : item.type === 'Principal'
                            ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300'
                            : 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div className="font-extrabold text-xs">{item.label}</div>
                      <div className="text-[9px] mt-0.5 leading-tight opacity-80">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Mode Selection Tiles */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Payment Mode *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleModeChange('Cash')}
                    className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 ${
                      paymentMode === 'Cash'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 font-bold ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Banknote className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <div className="text-xs font-extrabold">Cash</div>
                      <div className="text-[9px] opacity-70">Physical Cash Voucher</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleModeChange('Bank')}
                    className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 ${
                      paymentMode === 'Bank'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-200 font-bold ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Landmark className="w-5 h-5 text-blue-600 shrink-0" />
                    <div>
                      <div className="text-xs font-extrabold">Bank</div>
                      <div className="text-[9px] opacity-70">NEFT / RTGS / IMPS</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleModeChange('UPI')}
                    className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 ${
                      paymentMode === 'UPI'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/50 text-purple-900 dark:text-purple-200 font-bold ring-2 ring-purple-500/20'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-purple-600 shrink-0" />
                    <div>
                      <div className="text-xs font-extrabold">UPI</div>
                      <div className="text-[9px] opacity-70">GPay / PhonePe / QR</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Payment Amount & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-extrabold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Reference / Cash Voucher Number */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {paymentMode === 'Cash' ? 'Cash Voucher / Receipt Number *' : 'Transaction Reference Number *'}
                </label>
                <input
                  type="text"
                  required
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder={paymentMode === 'Cash' ? 'e.g. CASH-REC-2026-0091' : 'e.g. HDFC-NEFT-889900'}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              {/* Remarks / Cash Handover Notes */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {paymentMode === 'Cash' ? 'Cash Handover Notes / Receiver Name' : 'Remarks / Notes'}
                </label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder={
                    paymentMode === 'Cash'
                      ? 'e.g. Cash collected in person by investor. Denomination: 70 x ₹500 notes.'
                      : 'e.g. Monthly Profit payout for March 2026 via NEFT'
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {/* Cash Receipt Auto-download Checkbox */}
              {paymentMode === 'Cash' && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Printer className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold text-emerald-900 dark:text-emerald-200 block text-xs">
                        Auto-Download Cash Voucher PDF
                      </span>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400">
                        Generates a printable A5 voucher with receiver signature line
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoDownloadReceipt}
                    onChange={(e) => setAutoDownloadReceipt(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded-md border-slate-300 focus:ring-emerald-500"
                  />
                </div>
              )}

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-xl font-extrabold text-white shadow-md transition flex items-center gap-1.5 ${
                    paymentMode === 'Cash'
                      ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                      : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {paymentMode === 'Cash' ? 'Confirm Cash Payout' : 'Save Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete/Reversal Confirmation */}
      <ConfirmModal
        isOpen={!!paymentToDelete}
        title="Reverse Payment Entry"
        message={
          paymentToDelete
            ? `Are you sure you want to reverse the ${paymentToDelete.paymentType} payment of ${formatINR(
                paymentToDelete.amount
              )} for customer ${paymentToDelete.customerId}? This will restore their balance in the ledger.`
            : ''
        }
        confirmLabel="Confirm Reversal"
        cancelLabel="Keep Record"
        isDestructive={true}
        requireReason={true}
        onConfirm={handleDeletePaymentConfirm}
        onCancel={() => setPaymentToDelete(null)}
      />
    </div>
  );
};
