import {
  Bell,
  Check,
  CheckCircle2,
  ChevronDown,
  LogOut,
  Maximize2,
  Minimize2,
  Moon,
  Shield,
  Smartphone,
  Sun,
  TrendingUp,
  User as UserIcon,
  Users
} from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../db/storage';
import { formatIndianDate } from '../../utils/formatters';

interface HeaderProps {
  onOpenNotifications?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNotifications }) => {
  const {
    currentUser,
    activeCustomer,
    logout,
    loginAsDemo,
    isDarkMode,
    toggleDarkMode,
    isAndroidFrame,
    toggleAndroidFrame,
  } = useAuth();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const notifications = db.getNotifications(
    currentUser?.role === 'customer' ? currentUser.customerId : undefined
  );
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = () => {
    db.markAllNotificationsAsRead(
      currentUser?.role === 'customer' ? currentUser.customerId : undefined
    );
    setShowNotifMenu(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#1e293b]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5">
        {/* Brand & Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-white shadow-xs">
            <TrendingUp className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-base tracking-tight text-slate-800 dark:text-white flex items-center gap-1">
                TRADE ZONE
              </h1>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  currentUser?.role === 'admin'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {currentUser?.role === 'admin' ? 'Admin' : 'Investor'}
              </span>
            </div>
            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-none">
              {currentUser?.role === 'admin'
                ? 'Fintech Control Panel'
                : activeCustomer?.fullName || currentUser?.name}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Demo Switcher Dropdown */}
          <div className="relative">
            <button
              id="switch-account-btn"
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              title="Quick Switch Account/Role"
            >
              <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Switch</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {showRoleMenu && (
              <div
                className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#1e293b] rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-50 animate-in fade-in slide-in-from-top-2"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-2.5 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Switch User Role
                </div>

                <button
                  onClick={() => {
                    loginAsDemo('admin');
                    setShowRoleMenu(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-medium text-left transition ${
                    currentUser?.role === 'admin'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="font-bold">Chief Admin</div>
                      <div className="text-[10px] text-slate-400">admin@tradezone.com</div>
                    </div>
                  </div>
                  {currentUser?.role === 'admin' && <Check className="w-4 h-4 text-emerald-600" />}
                </button>

                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                <div className="px-2.5 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Switch Customer Account
                </div>

                {[
                  {
                    username: 'rajesh',
                    id: 'TZ-2026-001',
                    name: 'Rajesh Sharma',
                    invested: '₹10,00,000 (Bal: ₹7,00,000)',
                  },
                  {
                    username: 'pooja',
                    id: 'TZ-2026-002',
                    name: 'Pooja Patel',
                    invested: '₹5,00,000',
                  },
                  {
                    username: 'vikram',
                    id: 'TZ-2026-003',
                    name: 'Vikram Singhania',
                    invested: '₹25,00,000',
                  },
                  {
                    username: 'ananya',
                    id: 'TZ-2026-004',
                    name: 'Ananya Reddy',
                    invested: '₹8,00,000',
                  },
                ].map((cust) => {
                  const isCurrent = currentUser?.customerId === cust.id;
                  return (
                    <button
                      key={cust.id}
                      onClick={() => {
                        loginAsDemo('customer', cust.username);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-medium text-left transition ${
                        isCurrent
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-emerald-600" />
                        <div>
                          <div className="font-bold">{cust.name}</div>
                          <div className="text-[10px] text-slate-400">
                            {cust.id} • {cust.invested}
                          </div>
                        </div>
                      </div>
                      {isCurrent && <Check className="w-4 h-4 text-emerald-600" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              id="notif-btn"
              onClick={() => {
                if (onOpenNotifications) {
                  onOpenNotifications();
                } else {
                  setShowNotifMenu(!showNotifMenu);
                }
              }}
              className="relative w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              title="Notifications"
            >
              <Bell className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              )}
            </button>

            {showNotifMenu && (
              <div
                className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-[#1e293b] rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-3 z-50"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">
                    Notifications ({notifications.length})
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3" /> Mark all read
                    </button>
                  )}
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((notif) => (
                      <div
                        key={notif.id}
                        className={`py-2.5 px-1 text-xs transition ${
                          !notif.isRead ? 'bg-emerald-50/50 dark:bg-emerald-950/30 rounded-lg px-2' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {notif.title}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {formatIndianDate(notif.date)}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">
                          {notif.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Frame Toggle */}
          <button
            onClick={toggleAndroidFrame}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition hidden md:flex items-center justify-center"
            title={isAndroidFrame ? 'Switch to Full Width View' : 'Switch to Android Frame View'}
          >
            <Smartphone className={`w-4 h-4 ${isAndroidFrame ? 'text-emerald-600' : ''}`} />
          </button>

          {/* Logout */}
          <button
            id="logout-btn"
            onClick={logout}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center transition"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
