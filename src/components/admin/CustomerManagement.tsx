import {
  Check,
  CreditCard,
  Edit2,
  Eye,
  Key,
  Lock,
  Plus,
  Power,
  RefreshCw,
  Search,
  ShieldCheck,
  TrendingUp,
  User,
  UserCheck,
  UserPlus,
  Users,
  UserX,
  X
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../db/storage';
import { Customer, User as UserType } from '../../types';
import { formatIndianDate, formatINR } from '../../utils/formatters';
import { ConfirmModal } from '../common/ConfirmModal';
import { CustomerDetailModal } from './CustomerDetailModal';

interface CustomerManagementProps {
  onOpenPaymentModal?: (customer: Customer) => void;
  onOpenInvestmentModal?: (customer: Customer) => void;
}

export const CustomerManagement: React.FC<CustomerManagementProps> = ({
  onOpenPaymentModal,
  onOpenInvestmentModal,
}) => {
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [customers, setCustomers] = useState<Customer[]>(() => db.getCustomers());
  const [selectedCustomerForView, setSelectedCustomerForView] = useState<Customer | null>(null);

  // Add / Edit Modal State
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    id: '',
    fullName: '',
    mobileNumber: '',
    email: '',
    address: '',
    investmentDate: new Date().toISOString().split('T')[0],
    initialInvestmentAmount: 500000,
    monthlyProfitRate: 5.0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '2027-01-01',
    notes: '',
    // Credentials
    createLogin: true,
    loginUsername: '',
    loginPassword: 'password123',
  });
  const [formError, setFormError] = useState('');

  // Confirmation Modal State
  const [confirmModalData, setConfirmModalData] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => void;
    isDestructive?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: () => {},
  });

  const refreshList = () => {
    setCustomers(db.getCustomers());
  };

  const handleGenerateNextId = () => {
    const nextNum = customers.length + 1;
    const padded = String(nextNum).padStart(3, '0');
    return `TZ-${new Date().getFullYear()}-${padded}`;
  };

  const handleOpenAddModal = () => {
    const nextId = handleGenerateNextId();
    setEditingCustomer(null);
    setFormData({
      id: nextId,
      fullName: '',
      mobileNumber: '',
      email: '',
      address: '',
      investmentDate: new Date().toISOString().split('T')[0],
      initialInvestmentAmount: 500000,
      monthlyProfitRate: 5.0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '2027-01-01',
      notes: '',
      createLogin: true,
      loginUsername: '',
      loginPassword: 'password123',
    });
    setFormError('');
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setFormData({
      id: c.id,
      fullName: c.fullName,
      mobileNumber: c.mobileNumber,
      email: c.email || '',
      address: c.address,
      investmentDate: c.investmentDate,
      initialInvestmentAmount: c.initialInvestmentAmount,
      monthlyProfitRate: c.monthlyProfitRate,
      startDate: c.startDate,
      endDate: c.endDate || '',
      notes: c.notes || '',
      createLogin: false,
      loginUsername: '',
      loginPassword: '',
    });
    setFormError('');
    setIsAddEditModalOpen(true);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.id.trim() || !formData.fullName.trim() || !formData.mobileNumber.trim()) {
      setFormError('Customer ID, Full Name, and Mobile Number are required.');
      return;
    }

    if (formData.initialInvestmentAmount <= 0) {
      setFormError('Investment amount must be greater than 0.');
      return;
    }

    const customerObj: Customer = {
      id: formData.id.trim(),
      fullName: formData.fullName.trim(),
      mobileNumber: formData.mobileNumber.trim(),
      email: formData.email.trim() || undefined,
      address: formData.address.trim(),
      investmentDate: formData.investmentDate,
      initialInvestmentAmount: Number(formData.initialInvestmentAmount),
      monthlyProfitRate: Number(formData.monthlyProfitRate) || 5.0,
      startDate: formData.startDate,
      endDate: formData.endDate || undefined,
      notes: formData.notes.trim() || undefined,
      status: editingCustomer ? editingCustomer.status : 'active',
      createdAt: editingCustomer ? editingCustomer.createdAt : new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    // Save Customer
    db.saveCustomer(customerObj, currentUser?.username || 'admin');

    // Create User Login Credentials if checked
    if (!editingCustomer && formData.createLogin) {
      const username = (formData.loginUsername || formData.id.toLowerCase().replace(/[^a-z0-9]/g, '')).trim();
      const userObj: UserType = {
        id: `usr_${Date.now()}`,
        username,
        password: formData.loginPassword || 'password123',
        role: 'customer',
        customerId: customerObj.id,
        name: customerObj.fullName,
        mobile: customerObj.mobileNumber,
        email: customerObj.email,
        createdAt: new Date().toISOString().split('T')[0],
        isActive: true,
      };
      db.saveUser(userObj);
    }

    setIsAddEditModalOpen(false);
    refreshList();
  };

  const handleToggleStatus = (customer: Customer) => {
    const isDeactivating = customer.status === 'active';
    setConfirmModalData({
      isOpen: true,
      title: `${isDeactivating ? 'Deactivate' : 'Activate'} Customer`,
      message: `Are you sure you want to ${isDeactivating ? 'deactivate' : 'activate'} customer ${customer.fullName} (${customer.id})?`,
      isDestructive: isDeactivating,
      action: () => {
        db.toggleCustomerStatus(customer.id, currentUser?.username || 'admin');
        refreshList();
        setConfirmModalData((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Filtered List
  const filteredCustomers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return customers.filter((c) => {
      const matchesSearch =
        !q ||
        c.fullName.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.mobileNumber.includes(q);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && c.status === 'active') ||
        (statusFilter === 'inactive' && c.status === 'inactive');

      return matchesSearch && matchesStatus;
    });
  }, [customers, searchQuery, statusFilter]);

  return (
    <div className="p-4 space-y-4 max-w-5xl mx-auto">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Customer Management
          </h2>
          <p className="text-xs text-slate-500">
            Manage investor profiles, profit rates (5% default), accounts and balances.
          </p>
        </div>

        <button
          id="add-new-customer-btn"
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          Add New Customer
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="search-customer-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Name, Customer ID, Mobile..."
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 self-start sm:self-auto">
          {(['all', 'active', 'inactive'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                statusFilter === st
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Customer List */}
      <div className="space-y-3">
        {filteredCustomers.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <Users className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No customers found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or filter.</p>
          </div>
        ) : (
          filteredCustomers.map((customer) => {
            const summary = db.getCustomerFinancialSummary(customer.id);
            return (
              <div
                key={customer.id}
                id={`customer-card-${customer.id}`}
                className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition space-y-3"
              >
                {/* Customer Top Row */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-sm shadow-xs">
                      {customer.fullName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {customer.fullName}
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {customer.id}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            customer.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {customer.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-3 mt-0.5">
                        <span>📱 +91 {customer.mobileNumber}</span>
                        <span>🗓️ {formatIndianDate(customer.startDate)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Dropdown / Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSelectedCustomerForView(customer)}
                      className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="View 360 Details & Ledger"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(customer)}
                      className="p-2 rounded-xl text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition"
                      title="Edit Customer Details"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(customer)}
                      className={`p-2 rounded-xl transition ${
                        customer.status === 'active'
                          ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                          : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                      }`}
                      title={customer.status === 'active' ? 'Deactivate Customer' : 'Activate Customer'}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Financial Summary Strip */}
                {summary && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl">
                      <span className="text-[10px] font-semibold text-slate-400 block">
                        Principal Balance
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {formatINR(summary.principalBalance)}
                      </span>
                      <span className="text-[9px] text-slate-500 block">
                        (Inv: {formatINR(summary.totalInvestment)})
                      </span>
                    </div>

                    <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-2 rounded-xl border border-emerald-100/50 dark:border-emerald-900/30">
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 block">
                        Monthly Profit @ {summary.profitRate}%
                      </span>
                      <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300">
                        {formatINR(summary.currentMonthlyProfit)}/mo
                      </span>
                      <span className="text-[9px] text-emerald-600/70 block">
                        On ₹{formatINR(summary.principalBalance, false)}
                      </span>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl">
                      <span className="text-[10px] font-semibold text-slate-400 block">
                        Profit Paid
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {formatINR(summary.totalProfitPaid)}
                      </span>
                      <span className="text-[9px] text-slate-500 block">
                        Gen: {formatINR(summary.totalProfitGenerated)}
                      </span>
                    </div>

                    <div className="bg-amber-50/50 dark:bg-amber-950/20 p-2 rounded-xl border border-amber-100/50 dark:border-amber-900/30">
                      <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 block">
                        Profit Pending
                      </span>
                      <span className="text-xs font-extrabold text-amber-700 dark:text-amber-300">
                        {formatINR(summary.profitPending)}
                      </span>
                      <span className="text-[9px] text-amber-600/70 block">Due Payout</span>
                    </div>
                  </div>
                )}

                {/* Quick Action Footer */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                    {customer.notes || customer.address || 'No special notes'}
                  </div>

                  <div className="flex items-center gap-2">
                    {onOpenPaymentModal && (
                      <button
                        onClick={() => onOpenPaymentModal(customer)}
                        className="px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-[11px] flex items-center gap-1 transition"
                      >
                        <CreditCard className="w-3 h-3" />
                        Record Pay
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Customer Modal */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-600 text-white">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-base">
                  {editingCustomer ? 'Edit Customer Details' : 'Add New Customer'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddEditModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 font-semibold">
                  {formError}
                </div>
              )}

              {/* Customer ID & Auto-generator */}
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Customer ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, id: handleGenerateNextId() })}
                    className="w-full py-2 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-semibold flex items-center justify-center gap-1"
                    title="Generate Next ID"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Auto ID
                  </button>
                </div>
              </div>

              {/* Full Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Ramesh Chandra"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.mobileNumber}
                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                    placeholder="9876543210"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Email & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="investor@example.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="City, State"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Investment Amount & Monthly Profit Rate (5% default) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/50">
                <div>
                  <label className="block font-bold text-blue-900 dark:text-blue-300 mb-1">
                    Initial Investment Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1000}
                    step={1000}
                    value={formData.initialInvestmentAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, initialInvestmentAmount: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-emerald-700 dark:text-emerald-300 mb-1">
                    Monthly Profit Rate (% / month) *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.1"
                    value={formData.monthlyProfitRate}
                    onChange={(e) =>
                      setFormData({ ...formData, monthlyProfitRate: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-emerald-600 dark:text-emerald-400"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Default 5.0% = ₹{((formData.initialInvestmentAmount * formData.monthlyProfitRate) / 100).toLocaleString('en-IN')}/mo
                  </span>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Investment Date
                  </label>
                  <input
                    type="date"
                    value={formData.investmentDate}
                    onChange={(e) => setFormData({ ...formData, investmentDate: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Profit Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Maturity / Exit Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Notes / Terms
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional portfolio instructions or payout notes..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {/* Login Credentials generator for new customer */}
              {!editingCustomer && (
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-blue-600" />
                      Create Customer Login Credentials
                    </span>
                    <input
                      type="checkbox"
                      checked={formData.createLogin}
                      onChange={(e) => setFormData({ ...formData, createLogin: e.target.checked })}
                      className="w-4 h-4 rounded-sm text-blue-600"
                    />
                  </div>

                  {formData.createLogin && (
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                          Username
                        </label>
                        <input
                          type="text"
                          value={formData.loginUsername}
                          onChange={(e) => setFormData({ ...formData, loginUsername: e.target.value })}
                          placeholder={formData.id.toLowerCase()}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                          Password
                        </label>
                        <input
                          type="text"
                          value={formData.loginPassword}
                          onChange={(e) => setFormData({ ...formData, loginPassword: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/20"
                >
                  {editingCustomer ? 'Update Customer' : 'Save Customer & Investment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer 360 View Modal */}
      <CustomerDetailModal
        customer={selectedCustomerForView}
        isOpen={!!selectedCustomerForView}
        onClose={() => setSelectedCustomerForView(null)}
        onRecordPayment={onOpenPaymentModal}
        onAddInvestment={onOpenInvestmentModal}
        onRefresh={refreshList}
      />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModalData.isOpen}
        title={confirmModalData.title}
        message={confirmModalData.message}
        isDestructive={confirmModalData.isDestructive}
        onConfirm={() => confirmModalData.action()}
        onCancel={() => setConfirmModalData((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
