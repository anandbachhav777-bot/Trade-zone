import {
  Building2,
  Calendar,
  CheckCircle2,
  Headphones,
  KeyRound,
  LogOut,
  Mail,
  MapPin,
  Percent,
  Phone,
  ShieldCheck,
  User,
  Wallet
} from 'lucide-react';
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../db/storage';
import { formatIndianDate, formatINR } from '../../utils/formatters';

export const CustomerProfile: React.FC = () => {
  const { activeCustomer, logout } = useAuth();

  if (!activeCustomer) return null;

  const summary = db.getCustomerFinancialSummary(activeCustomer.id);

  return (
    <div className="p-4 space-y-4 max-w-5xl mx-auto">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-5 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white font-black text-xl flex items-center justify-center shadow-lg">
            {activeCustomer.fullName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white">{activeCustomer.fullName}</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                {activeCustomer.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Customer ID: <strong className="font-mono text-white">{activeCustomer.id}</strong>
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2.5 rounded-2xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-bold text-xs flex items-center justify-center gap-1.5 transition self-start sm:self-auto"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Personal & Contact Information */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5 text-xs">
          <h3 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            Contact & Account Information
          </h3>

          <div className="space-y-3 pt-1">
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-slate-400 block">Mobile Number</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {activeCustomer.mobileNumber}
                </span>
              </div>
            </div>

            {activeCustomer.email && (
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 block">Email Address</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {activeCustomer.email}
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-slate-400 block">Registered Address</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {activeCustomer.address || 'Address on file'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Investment Terms & Schedule */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5 text-xs">
          <h3 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-2">
            <Percent className="w-4 h-4 text-emerald-600" />
            Portfolio Terms & Rates
          </h3>

          <div className="space-y-3 pt-1">
            <div className="flex items-start gap-3">
              <Percent className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-slate-400 block">Monthly Profit Rate</span>
                <span className="font-extrabold text-emerald-600 text-sm">
                  {activeCustomer.monthlyProfitRate || 5.0}% per month (fixed yield)
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-slate-400 block">Portfolio Investment Start Date</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {formatIndianDate(activeCustomer.startDate)}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-slate-400 block">Expected Maturity / Exit Date</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {formatIndianDate(activeCustomer.maturityDate)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Support & Relationship Manager Desk */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 text-xs">
        <h3 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-2">
          <Headphones className="w-4 h-4 text-indigo-600" />
          Trade Zone Investor Support & Help Desk
        </h3>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
          For payout inquiries, banking updates, or principal withdrawal requests, reach out directly to your assigned portfolio administrator.
        </p>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div>
            <span className="font-extrabold text-slate-900 dark:text-white">Admin Helpdesk Support</span>
            <span className="text-slate-500 block text-[11px]">Monday to Saturday, 9:00 AM – 6:00 PM IST</span>
          </div>
          <div className="font-bold text-blue-600 dark:text-blue-400">
            support@tradezone.finance
          </div>
        </div>
      </div>
    </div>
  );
};
