import {
  Bell,
  CreditCard,
  FileSpreadsheet,
  FileText,
  History,
  LayoutDashboard,
  PieChart,
  User,
  Users,
  Wallet
} from 'lucide-react';
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../db/storage';

export type AdminTab = 'dashboard' | 'customers' | 'investments' | 'payments' | 'reports';
export type CustomerTab = 'dashboard' | 'transactions' | 'statement' | 'notifications' | 'profile';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: any) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';

  const notifications = db.getNotifications(
    currentUser?.role === 'customer' ? currentUser.customerId : undefined
  );
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  interface NavItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }

  const adminTabs: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'investments', label: 'Investments', icon: Wallet },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
  ];

  const customerTabs: NavItem[] = [
    { id: 'dashboard', label: 'Overview', icon: PieChart },
    { id: 'transactions', label: 'Transactions', icon: History },
    { id: 'statement', label: 'Statement', icon: FileText },
    { id: 'notifications', label: 'Alerts', icon: Bell, badge: unreadCount },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const currentTabs = isAdmin ? adminTabs : customerTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#1e293b]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-1.5 safe-area-bottom">
        {currentTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all relative ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
              }`}
            >
              <div className="relative">
                <div
                  className={`p-1 rounded-xl transition-all ${
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 scale-105'
                      : 'bg-transparent'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                </div>
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-emerald-600 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center shadow-xs">
                    {tab.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight whitespace-nowrap">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
