import {
  Bell,
  BellOff,
  Calendar,
  Check,
  CheckCheck,
  Coins,
  CreditCard,
  FileText,
  Trash2,
  Wallet
} from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../db/storage';
import { CustomerNotification } from '../../types';
import { formatIndianDate } from '../../utils/formatters';

export const CustomerNotifications: React.FC = () => {
  const { activeCustomer } = useAuth();
  const [notifications, setNotifications] = useState<CustomerNotification[]>(() => {
    if (!activeCustomer) return [];
    return db.getNotifications(activeCustomer.id);
  });

  if (!activeCustomer) return null;

  const refreshList = () => {
    setNotifications(db.getNotifications(activeCustomer.id));
  };

  const handleMarkAsRead = (id: string) => {
    db.markNotificationAsRead(id);
    refreshList();
  };

  const handleMarkAllAsRead = () => {
    notifications.forEach((n) => {
      if (!n.isRead) db.markNotificationAsRead(n.id);
    });
    refreshList();
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getIcon = (type: CustomerNotification['type']) => {
    switch (type) {
      case 'profit_generated':
        return <Coins className="w-4 h-4 text-emerald-600" />;
      case 'profit_paid':
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case 'principal_paid':
        return <Wallet className="w-4 h-4 text-indigo-600" />;
      case 'investment':
        return <Wallet className="w-4 h-4 text-blue-600" />;
      case 'statement':
        return <FileText className="w-4 h-4 text-purple-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            Portfolio Notifications & Alerts
          </h2>
          <p className="text-xs text-slate-500">
            Real-time updates regarding profit disbursements, principal returns, and statements.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4 text-blue-600" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-2.5">
        {notifications.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <BellOff className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No notifications</p>
            <p className="text-xs text-slate-400 mt-1">You will receive alerts here when monthly profits or payments are processed.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
              className={`p-4 rounded-2xl border transition flex items-start justify-between gap-3 text-xs cursor-pointer ${
                notif.isRead
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-80'
                  : 'bg-blue-50/40 dark:bg-slate-800 border-blue-200 dark:border-blue-800/60 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2.5 rounded-2xl shrink-0 mt-0.5 ${
                    notif.isRead
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      : 'bg-white dark:bg-slate-700 shadow-xs'
                  }`}
                >
                  {getIcon(notif.type)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-xs">
                      {notif.title}
                    </h3>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                    )}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                    {notif.message}
                  </p>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    {formatIndianDate(notif.date)}
                  </span>
                </div>
              </div>

              {!notif.isRead && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkAsRead(notif.id);
                  }}
                  className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-100 dark:hover:bg-slate-700 shrink-0"
                  title="Mark as read"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
