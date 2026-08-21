import React, { useState } from 'react';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminReports } from './components/admin/AdminReports';
import { AuditLogsView } from './components/admin/AuditLogsView';
import { CustomerDetailModal } from './components/admin/CustomerDetailModal';
import { CustomerManagement } from './components/admin/CustomerManagement';
import { InvestmentManagement } from './components/admin/InvestmentManagement';
import { PaymentManagement } from './components/admin/PaymentManagement';
import { ProfitScheduleManager } from './components/admin/ProfitScheduleManager';
import { LoginScreen } from './components/auth/LoginScreen';
import { AndroidFrameWrapper } from './components/common/AndroidFrameWrapper';
import { BottomNav } from './components/common/BottomNav';
import { Header } from './components/common/Header';
import { CustomerDashboard } from './components/customer/CustomerDashboard';
import { CustomerNotifications } from './components/customer/CustomerNotifications';
import { CustomerProfile } from './components/customer/CustomerProfile';
import { CustomerStatement } from './components/customer/CustomerStatement';
import { CustomerTransactions } from './components/customer/CustomerTransactions';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Customer, NavTab } from './types';

const MainAppContent: React.FC = () => {
  const { currentUser, activeCustomer, unreadNotificationsCount } = useAuth();

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [selectedCustomerForDetail, setSelectedCustomerForDetail] = useState<Customer | null>(null);
  const [isMobileFrameView, setIsMobileFrameView] = useState(true);

  if (!currentUser) {
    return <LoginScreen />;
  }

  const isAdmin = currentUser.role === 'admin';

  const renderAdminView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <AdminDashboard
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenCustomerModal={(cust) => setSelectedCustomerForDetail(cust)}
          />
        );
      case 'customers':
        return (
          <CustomerManagement
            onViewCustomer={(cust) => setSelectedCustomerForDetail(cust)}
          />
        );
      case 'investments':
        return <InvestmentManagement />;
      case 'payments':
        return <PaymentManagement />;
      case 'profit_schedules':
        return (
          <ProfitScheduleManager
            onRecordPayment={(cust) => {
              setActiveTab('payments');
            }}
          />
        );
      case 'reports':
        return <AdminReports />;
      case 'audit':
        return <AuditLogsView />;
      default:
        return (
          <AdminDashboard
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenCustomerModal={(cust) => setSelectedCustomerForDetail(cust)}
          />
        );
    }
  };

  const renderCustomerView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <CustomerDashboard onNavigateTab={(tab) => setActiveTab(tab)} />;
      case 'transactions':
        return <CustomerTransactions />;
      case 'statement':
        return <CustomerStatement />;
      case 'notifications':
        return <CustomerNotifications />;
      case 'profile':
        return <CustomerProfile />;
      default:
        return <CustomerDashboard onNavigateTab={(tab) => setActiveTab(tab)} />;
    }
  };

  const content = (
    <div className="flex flex-col min-h-full bg-[#f0f2f5] dark:bg-[#0f172a] text-slate-800 dark:text-slate-100 transition-colors">
      <Header
        activeTab={activeTab}
        onNavigateTab={setActiveTab}
        isMobileFrameView={isMobileFrameView}
        onToggleMobileFrame={() => setIsMobileFrameView(!isMobileFrameView)}
      />

      <main className="flex-1 pb-20 sm:pb-8 overflow-y-auto">
        {isAdmin ? renderAdminView() : renderCustomerView()}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Customer 360 Detail Modal */}
      {selectedCustomerForDetail && (
        <CustomerDetailModal
          customer={selectedCustomerForDetail}
          isOpen={!!selectedCustomerForDetail}
          onClose={() => setSelectedCustomerForDetail(null)}
          onRecordPayment={(cust) => {
            setSelectedCustomerForDetail(null);
            setActiveTab('payments');
          }}
          onAddInvestment={(cust) => {
            setSelectedCustomerForDetail(null);
            setActiveTab('investments');
          }}
        />
      )}
    </div>
  );

  return (
    <AndroidFrameWrapper isFrameEnabled={isMobileFrameView}>
      {content}
    </AndroidFrameWrapper>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
