import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Shield,
  TrendingUp,
  User,
  Users
} from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

export const LoginScreen: React.FC = () => {
  const { login, loginAsDemo } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Please enter your Customer ID, Username, or Mobile Number.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = login(username, password);
      if (!res.success) {
        setError(res.error || 'Authentication failed.');
      }
      setIsLoading(false);
    }, 250);
  };

  return (
    <div className="min-h-full flex flex-col justify-center px-4 py-8 max-w-md mx-auto w-full">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-emerald-500 text-white shadow-xl shadow-blue-500/25 mb-3">
          <TrendingUp className="w-8 h-8 stroke-[2.5]" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          TRADE ZONE
        </h1>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
          Professional Investment & Profit Accounting
        </p>
      </div>

      {/* Role Switcher Tabs */}
      <div className="bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl flex items-center mb-6 border border-slate-200/60 dark:border-slate-700/60">
        <button
          type="button"
          id="tab-customer-login"
          onClick={() => {
            setSelectedRole('customer');
            setUsername('');
            setPassword('');
            setError('');
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
            selectedRole === 'customer'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <User className="w-4 h-4" />
          Customer Login
        </button>

        <button
          type="button"
          id="tab-admin-login"
          onClick={() => {
            setSelectedRole('admin');
            setUsername('admin');
            setPassword('password123');
            setError('');
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
            selectedRole === 'admin'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Shield className="w-4 h-4" />
          Admin Portal
        </button>
      </div>

      {/* Login Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-800">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {selectedRole === 'admin' ? 'Admin Username' : 'Customer ID / Username / Mobile'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="login-username-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={selectedRole === 'admin' ? 'admin' : 'e.g. rajesh or TZ-2026-001'}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="login-password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-600 dark:text-rose-400 font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            id="login-submit-btn"
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-xl text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 ${
              selectedRole === 'admin'
                ? 'bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 shadow-indigo-600/25'
                : 'bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 shadow-blue-600/25'
            }`}
          >
            {isLoading ? 'Signing In...' : `Sign in to ${selectedRole === 'admin' ? 'Admin Portal' : 'Trade Zone'}`}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Access Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Users className="w-3 h-3" /> Quick Demo Accounts
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-left">
            <button
              type="button"
              id="demo-admin-btn"
              onClick={() => loginAsDemo('admin')}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-left group"
            >
              <div className="text-xs font-bold text-slate-800 dark:text-white flex items-center justify-between">
                Admin Manager
                <Shield className="w-3 h-3 text-indigo-600" />
              </div>
              <div className="text-[10px] text-slate-500">Full Dashboard Access</div>
            </button>

            <button
              type="button"
              id="demo-rajesh-btn"
              onClick={() => loginAsDemo('customer', 'rajesh')}
              className="p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-100/50 transition text-left group"
            >
              <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                Rajesh Sharma
                <span className="text-[9px] bg-emerald-200 dark:bg-emerald-900 px-1 rounded-sm">₹10L</span>
              </div>
              <div className="text-[10px] text-slate-500">₹7L Bal • ₹35k/mo</div>
            </button>

            <button
              type="button"
              id="demo-pooja-btn"
              onClick={() => loginAsDemo('customer', 'pooja')}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-left"
            >
              <div className="text-xs font-bold text-slate-800 dark:text-white">Pooja Patel</div>
              <div className="text-[10px] text-slate-500">₹5,00,000 Portfolio</div>
            </button>

            <button
              type="button"
              id="demo-vikram-btn"
              onClick={() => loginAsDemo('customer', 'vikram')}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-left"
            >
              <div className="text-xs font-bold text-slate-800 dark:text-white">Vikram S.</div>
              <div className="text-[10px] text-slate-500">₹25,00,000 Portfolio</div>
            </button>
          </div>
        </div>
      </div>

      {/* Compliance Note */}
      <p className="text-[10px] text-center text-slate-400 mt-4 leading-relaxed px-4">
        Protected by Role-Based Access Control (RBAC). Customer data isolation strictly enforced.
      </p>
    </div>
  );
};
