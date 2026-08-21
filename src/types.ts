export type UserRole = 'admin' | 'customer';

export interface User {
  id: string;
  username: string;
  password?: string;
  role: UserRole;
  customerId?: string; // linked customer if role is 'customer'
  name: string;
  mobile: string;
  email?: string;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

export interface Customer {
  id: string; // e.g. "TZ-2026-001"
  userId?: string; // associated user login
  fullName: string;
  mobileNumber: string;
  email?: string;
  address: string;
  investmentDate: string; // YYYY-MM-DD
  initialInvestmentAmount: number;
  monthlyProfitRate: number; // default 5.0 (%)
  startDate: string; // YYYY-MM-DD
  endDate?: string; // maturity date
  notes?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Investment {
  id: string;
  customerId: string;
  investmentDate: string; // YYYY-MM-DD
  amount: number;
  profitRate: number; // e.g. 5%
  profitStartDate: string; // YYYY-MM-DD
  maturityDate?: string; // YYYY-MM-DD
  notes?: string;
  createdAt: string;
}

export type PaymentType = 'Principal' | 'Profit' | 'Other';
export type PaymentMode = 'Bank' | 'UPI' | 'Cash';

export interface Payment {
  id: string;
  customerId: string;
  investmentId?: string;
  date: string; // YYYY-MM-DD
  paymentType: PaymentType;
  amount: number;
  paymentMode: PaymentMode;
  transactionReference: string;
  remarks?: string;
  recordedBy: string; // Admin username
  createdAt: string;
}

export interface MonthlyProfitRecord {
  id: string;
  customerId: string;
  investmentId?: string;
  monthYear: string; // e.g. "2026-02" or "Feb 2026"
  calculationDate: string; // YYYY-MM-DD
  principalBaseAmount: number; // Principal active during that month
  profitRate: number; // 5%
  profitAmount: number; // principalBaseAmount * rate / 100
  paidAmount: number;
  pendingAmount: number;
  status: 'Pending' | 'Partially Paid' | 'Paid';
  paymentDate?: string;
  paymentReference?: string;
  createdAt: string;
}

export type TransactionType = 'Investment' | 'Principal_Return' | 'Profit_Accrual' | 'Profit_Paid' | 'Other_Payment';

export interface TransactionLedgerItem {
  id: string;
  customerId: string;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  displayType: 'Investment' | 'Principal Return' | 'Profit Generated' | 'Profit Paid' | 'Other';
  category: 'Principal' | 'Profit' | 'Other';
  amount: number;
  paymentMode?: PaymentMode;
  referenceNumber?: string;
  status: 'Received' | 'Paid' | 'Accrued' | 'Pending';
  remarks?: string;
  runningPrincipalBalance: number;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  customerId?: string; // if null/undefined, broadcast to all or admin
  title: string;
  message: string;
  type: 'investment' | 'profit_generated' | 'profit_paid' | 'principal_paid' | 'statement' | 'system';
  date: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'PAYMENT' | 'PROFIT_GENERATE' | 'LOGIN';
  entity: 'Customer' | 'Investment' | 'Payment' | 'Profit' | 'User';
  entityId: string;
  performedBy: string;
  details: string;
  previousValue?: string;
  newValue?: string;
}

export interface CustomerFinancialSummary {
  customerId: string;
  customerName: string;
  mobile: string;
  totalInvestment: number;
  principalReturned: number;
  principalBalance: number; // Total Investment - Principal Returned
  profitRate: number; // default 5%
  currentMonthlyProfit: number; // principalBalance * (profitRate / 100)
  totalProfitGenerated: number;
  totalProfitPaid: number;
  profitPending: number; // totalProfitGenerated - totalProfitPaid
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
  lastPaymentType?: PaymentType;
  nextProfitDueDate: string;
  status: 'active' | 'inactive';
}

export interface AdminDashboardMetrics {
  totalCustomers: number;
  activeCustomers: number;
  totalInvestmentReceived: number;
  totalPrincipalReturned: number;
  totalPrincipalOutstanding: number;
  totalProfitGenerated: number;
  totalProfitPaid: number;
  totalProfitPending: number;
}

export type CustomerNotification = NotificationItem;

export type NavTab =
  | 'dashboard'
  | 'customers'
  | 'investments'
  | 'payments'
  | 'profit_schedules'
  | 'reports'
  | 'audit'
  | 'transactions'
  | 'statement'
  | 'notifications'
  | 'profile';

