import {
  AdminDashboardMetrics,
  AuditLog,
  Customer,
  CustomerFinancialSummary,
  Investment,
  MonthlyProfitRecord,
  NotificationItem,
  Payment,
  PaymentMode,
  PaymentType,
  TransactionLedgerItem,
  User,
} from '../types';
import { calculateMonthlyProfit, getNextProfitDueDate } from '../utils/formatters';

const STORAGE_KEYS = {
  USERS: 'tz_users',
  CUSTOMERS: 'tz_customers',
  INVESTMENTS: 'tz_investments',
  PAYMENTS: 'tz_payments',
  PROFIT_RECORDS: 'tz_profit_records',
  NOTIFICATIONS: 'tz_notifications',
  AUDIT_LOGS: 'tz_audit_logs',
  INITIALIZED: 'tz_initialized_v2',
};

class StorageService {
  private get<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage error', e);
    }
  }

  // --- Initialization & Seeding ---
  public initialize(): void {
    const isInitialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
    if (!isInitialized) {
      this.seedData();
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    }
  }

  public resetToDefault(): void {
    localStorage.clear();
    this.seedData();
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  }

  public seedData(): void {
    // 1. Initial Users
    const users: User[] = [
      {
        id: 'usr_admin',
        username: 'admin',
        password: 'password123',
        role: 'admin',
        name: 'Admin Manager',
        mobile: '+91 9820011223',
        email: 'admin@tradezone.in',
        createdAt: '2026-01-01',
        isActive: true,
      },
      {
        id: 'usr_rajesh',
        username: 'rajesh',
        password: 'password123',
        role: 'customer',
        customerId: 'TZ-2026-001',
        name: 'Rajesh Sharma',
        mobile: '9876543210',
        email: 'rajesh.sharma@example.com',
        createdAt: '2026-01-01',
        isActive: true,
      },
      {
        id: 'usr_pooja',
        username: 'pooja',
        password: 'password123',
        role: 'customer',
        customerId: 'TZ-2026-002',
        name: 'Pooja Patel',
        mobile: '9812345678',
        email: 'pooja.patel@example.com',
        createdAt: '2026-01-15',
        isActive: true,
      },
      {
        id: 'usr_vikram',
        username: 'vikram',
        password: 'password123',
        role: 'customer',
        customerId: 'TZ-2026-003',
        name: 'Vikram Singhania',
        mobile: '9899001122',
        email: 'vikram.s@example.com',
        createdAt: '2026-02-01',
        isActive: true,
      },
      {
        id: 'usr_ananya',
        username: 'ananya',
        password: 'password123',
        role: 'customer',
        customerId: 'TZ-2026-004',
        name: 'Ananya Reddy',
        mobile: '9700112233',
        email: 'ananya.reddy@example.com',
        createdAt: '2026-02-10',
        isActive: true,
      },
    ];

    // 2. Initial Customers
    const customers: Customer[] = [
      {
        id: 'TZ-2026-001',
        userId: 'usr_rajesh',
        fullName: 'Rajesh Sharma',
        mobileNumber: '9876543210',
        email: 'rajesh.sharma@example.com',
        address: 'Flat 402, Sai Residency, Bandra West, Mumbai, Maharashtra 400050',
        investmentDate: '2026-01-01',
        initialInvestmentAmount: 1000000,
        monthlyProfitRate: 5.0,
        startDate: '2026-01-01',
        endDate: '2027-01-01',
        notes: 'High net-worth long-term investor. Monthly profit payout via NEFT.',
        status: 'active',
        createdAt: '2026-01-01',
        updatedAt: '2026-03-15',
      },
      {
        id: 'TZ-2026-002',
        userId: 'usr_pooja',
        fullName: 'Pooja Patel',
        mobileNumber: '9812345678',
        email: 'pooja.patel@example.com',
        address: 'B-12, Green Acres, SG Highway, Ahmedabad, Gujarat 380054',
        investmentDate: '2026-01-15',
        initialInvestmentAmount: 500000,
        monthlyProfitRate: 5.0,
        startDate: '2026-01-15',
        endDate: '2026-12-31',
        notes: 'Regular retail investor with 5% monthly return mandate.',
        status: 'active',
        createdAt: '2026-01-15',
        updatedAt: '2026-01-15',
      },
      {
        id: 'TZ-2026-003',
        userId: 'usr_vikram',
        fullName: 'Vikram Singhania',
        mobileNumber: '9899001122',
        email: 'vikram.s@example.com',
        address: 'Villa 14, Prestige Golfshire, Nandi Hills, Bengaluru, Karnataka 562110',
        investmentDate: '2026-02-01',
        initialInvestmentAmount: 2500000,
        monthlyProfitRate: 5.0,
        startDate: '2026-02-01',
        endDate: '2027-02-01',
        notes: 'Premium investor portfolio.',
        status: 'active',
        createdAt: '2026-02-01',
        updatedAt: '2026-02-01',
      },
      {
        id: 'TZ-2026-004',
        userId: 'usr_ananya',
        fullName: 'Ananya Reddy',
        mobileNumber: '9700112233',
        email: 'ananya.reddy@example.com',
        address: 'Plot 88, Jubilee Hills, Hyderabad, Telangana 500033',
        investmentDate: '2026-02-10',
        initialInvestmentAmount: 800000,
        monthlyProfitRate: 5.0,
        startDate: '2026-02-10',
        endDate: '2027-02-10',
        notes: 'Technology entrepreneur investment portfolio.',
        status: 'active',
        createdAt: '2026-02-10',
        updatedAt: '2026-02-10',
      },
    ];

    // 3. Investments
    const investments: Investment[] = [
      {
        id: 'INV-2026-001',
        customerId: 'TZ-2026-001',
        investmentDate: '2026-01-01',
        amount: 1000000,
        profitRate: 5.0,
        profitStartDate: '2026-01-01',
        maturityDate: '2027-01-01',
        notes: 'Initial principal investment of ₹10,00,000 at 5% monthly rate.',
        createdAt: '2026-01-01',
      },
      {
        id: 'INV-2026-002',
        customerId: 'TZ-2026-002',
        investmentDate: '2026-01-15',
        amount: 500000,
        profitRate: 5.0,
        profitStartDate: '2026-01-15',
        maturityDate: '2026-12-31',
        notes: 'Principal investment of ₹5,00,000 at 5% rate.',
        createdAt: '2026-01-15',
      },
      {
        id: 'INV-2026-003',
        customerId: 'TZ-2026-003',
        investmentDate: '2026-02-01',
        amount: 2500000,
        profitRate: 5.0,
        profitStartDate: '2026-02-01',
        maturityDate: '2027-02-01',
        notes: 'Principal investment of ₹25,00,000 at 5% rate.',
        createdAt: '2026-02-01',
      },
      {
        id: 'INV-2026-004',
        customerId: 'TZ-2026-004',
        investmentDate: '2026-02-10',
        amount: 800000,
        profitRate: 5.0,
        profitStartDate: '2026-02-10',
        maturityDate: '2027-02-10',
        notes: 'Principal investment of ₹8,00,000 at 5% rate.',
        createdAt: '2026-02-10',
      },
    ];

    // 4. Payments (Principal Returns & Profit Payouts)
    const payments: Payment[] = [
      // Rajesh: Received Jan profit (₹50,000) on 01-02-2026
      {
        id: 'PAY-2026-001',
        customerId: 'TZ-2026-001',
        date: '2026-02-01',
        paymentType: 'Profit',
        amount: 50000,
        paymentMode: 'Bank',
        transactionReference: 'HDFC-NEFT-99120482',
        remarks: 'Monthly Profit for Jan 2026 paid via HDFC Bank NEFT',
        recordedBy: 'admin',
        createdAt: '2026-02-01',
      },
      // Rajesh: Principal returned ₹3,00,000 on 15-03-2026
      {
        id: 'PAY-2026-002',
        customerId: 'TZ-2026-001',
        date: '2026-03-15',
        paymentType: 'Principal',
        amount: 300000,
        paymentMode: 'Bank',
        transactionReference: 'ICICI-RTGS-77218391',
        remarks: 'Partial Principal return of ₹3,00,000 requested by investor. Remaining balance: ₹7,00,000',
        recordedBy: 'admin',
        createdAt: '2026-03-15',
      },
      // Pooja: Received Jan-Feb profit (₹25,000) on 15-02-2026
      {
        id: 'PAY-2026-003',
        customerId: 'TZ-2026-002',
        date: '2026-02-15',
        paymentType: 'Profit',
        amount: 25000,
        paymentMode: 'UPI',
        transactionReference: 'UPI-AXIS-93821092',
        remarks: 'Monthly profit payment for Period 15-Jan to 15-Feb',
        recordedBy: 'admin',
        createdAt: '2026-02-15',
      },
      // Vikram: Received Feb profit (₹1,25,000) on 01-03-2026
      {
        id: 'PAY-2026-004',
        customerId: 'TZ-2026-003',
        date: '2026-03-01',
        paymentType: 'Profit',
        amount: 125000,
        paymentMode: 'Bank',
        transactionReference: 'SBI-RTGS-55443322',
        remarks: 'Monthly profit for Feb 2026 @ 5% on ₹25,00,000',
        recordedBy: 'admin',
        createdAt: '2026-03-01',
      },
    ];

    // 5. Monthly Profit Records
    const profitRecords: MonthlyProfitRecord[] = [
      // Rajesh Jan 2026: Base ₹10,00,000 -> ₹50,000 (Paid)
      {
        id: 'PRF-2026-001',
        customerId: 'TZ-2026-001',
        monthYear: '2026-01',
        calculationDate: '2026-01-31',
        principalBaseAmount: 1000000,
        profitRate: 5.0,
        profitAmount: 50000,
        paidAmount: 50000,
        pendingAmount: 0,
        status: 'Paid',
        paymentDate: '2026-02-01',
        paymentReference: 'HDFC-NEFT-99120482',
        createdAt: '2026-01-31',
      },
      // Rajesh Feb 2026: Base ₹10,00,000 -> ₹50,000 (Pending / Accrued)
      {
        id: 'PRF-2026-002',
        customerId: 'TZ-2026-001',
        monthYear: '2026-02',
        calculationDate: '2026-02-28',
        principalBaseAmount: 1000000,
        profitRate: 5.0,
        profitAmount: 50000,
        paidAmount: 0,
        pendingAmount: 50000,
        status: 'Pending',
        createdAt: '2026-02-28',
      },
      // Rajesh Mar 2026: (After ₹3L principal return, base is ₹7,00,000 -> ₹35,000)
      {
        id: 'PRF-2026-003',
        customerId: 'TZ-2026-001',
        monthYear: '2026-03',
        calculationDate: '2026-03-31',
        principalBaseAmount: 700000,
        profitRate: 5.0,
        profitAmount: 35000,
        paidAmount: 0,
        pendingAmount: 35000,
        status: 'Pending',
        createdAt: '2026-03-31',
      },
      // Pooja Jan-Feb
      {
        id: 'PRF-2026-004',
        customerId: 'TZ-2026-002',
        monthYear: '2026-01',
        calculationDate: '2026-02-14',
        principalBaseAmount: 500000,
        profitRate: 5.0,
        profitAmount: 25000,
        paidAmount: 25000,
        pendingAmount: 0,
        status: 'Paid',
        paymentDate: '2026-02-15',
        paymentReference: 'UPI-AXIS-93821092',
        createdAt: '2026-02-14',
      },
      // Pooja Feb-Mar
      {
        id: 'PRF-2026-005',
        customerId: 'TZ-2026-002',
        monthYear: '2026-02',
        calculationDate: '2026-03-14',
        principalBaseAmount: 500000,
        profitRate: 5.0,
        profitAmount: 25000,
        paidAmount: 0,
        pendingAmount: 25000,
        status: 'Pending',
        createdAt: '2026-03-14',
      },
      // Vikram Feb
      {
        id: 'PRF-2026-006',
        customerId: 'TZ-2026-003',
        monthYear: '2026-02',
        calculationDate: '2026-02-28',
        principalBaseAmount: 2500000,
        profitRate: 5.0,
        profitAmount: 125000,
        paidAmount: 125000,
        pendingAmount: 0,
        status: 'Paid',
        paymentDate: '2026-03-01',
        paymentReference: 'SBI-RTGS-55443322',
        createdAt: '2026-02-28',
      },
      // Vikram Mar
      {
        id: 'PRF-2026-007',
        customerId: 'TZ-2026-003',
        monthYear: '2026-03',
        calculationDate: '2026-03-31',
        principalBaseAmount: 2500000,
        profitRate: 5.0,
        profitAmount: 125000,
        paidAmount: 0,
        pendingAmount: 125000,
        status: 'Pending',
        createdAt: '2026-03-31',
      },
      // Ananya Feb
      {
        id: 'PRF-2026-008',
        customerId: 'TZ-2026-004',
        monthYear: '2026-02',
        calculationDate: '2026-02-28',
        principalBaseAmount: 800000,
        profitRate: 5.0,
        profitAmount: 40000,
        paidAmount: 0,
        pendingAmount: 40000,
        status: 'Pending',
        createdAt: '2026-02-28',
      },
    ];

    // 6. Notifications
    const notifications: NotificationItem[] = [
      {
        id: 'NOTIF-001',
        customerId: 'TZ-2026-001',
        title: 'New Investment Recorded',
        message: 'Your initial investment of ₹10,00,000 has been verified and registered at 5% monthly profit rate.',
        type: 'investment',
        date: '2026-01-01',
        isRead: true,
        createdAt: '2026-01-01',
      },
      {
        id: 'NOTIF-002',
        customerId: 'TZ-2026-001',
        title: 'Monthly Profit Paid',
        message: 'Your monthly profit of ₹50,000 for Jan 2026 has been credited to your bank account (Ref: HDFC-NEFT-99120482).',
        type: 'profit_paid',
        date: '2026-02-01',
        isRead: true,
        createdAt: '2026-02-01',
      },
      {
        id: 'NOTIF-003',
        customerId: 'TZ-2026-001',
        title: 'Principal Payment Recorded',
        message: 'Principal return payment of ₹3,00,000 has been processed. Your remaining active principal balance is ₹7,00,000.',
        type: 'principal_paid',
        date: '2026-03-15',
        isRead: false,
        createdAt: '2026-03-15',
      },
      {
        id: 'NOTIF-004',
        customerId: 'TZ-2026-001',
        title: 'Monthly Profit Generated',
        message: 'Your monthly profit of ₹35,000 for Mar 2026 calculated on ₹7,00,000 outstanding principal has been accrued.',
        type: 'profit_generated',
        date: '2026-03-31',
        isRead: false,
        createdAt: '2026-03-31',
      },
      {
        id: 'NOTIF-005',
        customerId: 'TZ-2026-002',
        title: 'Investment Active',
        message: 'Your investment of ₹5,00,000 is active. Monthly profit rate: 5%.',
        type: 'investment',
        date: '2026-01-15',
        isRead: true,
        createdAt: '2026-01-15',
      },
    ];

    // 7. Audit Logs
    const auditLogs: AuditLog[] = [
      {
        id: 'AUD-001',
        timestamp: '2026-01-01 10:00:00',
        action: 'CREATE',
        entity: 'Customer',
        entityId: 'TZ-2026-001',
        performedBy: 'admin',
        details: 'Customer Rajesh Sharma created with initial investment ₹10,00,000',
      },
      {
        id: 'AUD-002',
        timestamp: '2026-02-01 11:30:00',
        action: 'PAYMENT',
        entity: 'Payment',
        entityId: 'PAY-2026-001',
        performedBy: 'admin',
        details: 'Recorded Profit payment ₹50,000 for Rajesh Sharma (Jan 2026)',
      },
      {
        id: 'AUD-003',
        timestamp: '2026-03-15 14:15:00',
        action: 'PAYMENT',
        entity: 'Payment',
        entityId: 'PAY-2026-002',
        performedBy: 'admin',
        details: 'Recorded Principal return payment of ₹3,00,000 for Rajesh Sharma. New Principal Balance: ₹7,00,000',
      },
      {
        id: 'AUD-004',
        timestamp: '2026-03-31 18:00:00',
        action: 'PROFIT_GENERATE',
        entity: 'Profit',
        entityId: 'PRF-2026-003',
        performedBy: 'admin',
        details: 'Generated monthly profit ₹35,000 for Rajesh Sharma based on ₹7,00,000 balance',
      },
    ];

    this.set(STORAGE_KEYS.USERS, users);
    this.set(STORAGE_KEYS.CUSTOMERS, customers);
    this.set(STORAGE_KEYS.INVESTMENTS, investments);
    this.set(STORAGE_KEYS.PAYMENTS, payments);
    this.set(STORAGE_KEYS.PROFIT_RECORDS, profitRecords);
    this.set(STORAGE_KEYS.NOTIFICATIONS, notifications);
    this.set(STORAGE_KEYS.AUDIT_LOGS, auditLogs);
  }

  // --- Users CRUD ---
  public getUsers(): User[] {
    return this.get<User[]>(STORAGE_KEYS.USERS, []);
  }

  public getUserByUsername(username: string): User | undefined {
    return this.getUsers().find((u) => u.username.toLowerCase() === username.toLowerCase());
  }

  public saveUser(user: User): void {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    this.set(STORAGE_KEYS.USERS, users);
  }

  // --- Customers CRUD ---
  public getCustomers(): Customer[] {
    return this.get<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
  }

  public getCustomerById(id: string): Customer | undefined {
    return this.getCustomers().find((c) => c.id === id);
  }

  public saveCustomer(customer: Customer, adminUsername: string = 'admin'): Customer {
    const customers = this.getCustomers();
    const index = customers.findIndex((c) => c.id === customer.id);
    const isNew = index === -1;

    if (isNew) {
      customers.push(customer);
      this.logAudit({
        action: 'CREATE',
        entity: 'Customer',
        entityId: customer.id,
        performedBy: adminUsername,
        details: `Added new customer ${customer.fullName} (${customer.id}) with initial investment ₹${customer.initialInvestmentAmount}`,
      });

      // Also create matching investment record
      this.saveInvestment({
        id: `INV-${Date.now().toString().slice(-6)}`,
        customerId: customer.id,
        investmentDate: customer.investmentDate,
        amount: customer.initialInvestmentAmount,
        profitRate: customer.monthlyProfitRate,
        profitStartDate: customer.startDate,
        maturityDate: customer.endDate,
        notes: `Initial investment on customer onboarding. ${customer.notes || ''}`,
        createdAt: new Date().toISOString().split('T')[0],
      }, adminUsername, false);

      // Create notification
      this.addNotification({
        customerId: customer.id,
        title: 'Account Activated & Investment Recorded',
        message: `Welcome to Trade Zone. Your investment account ${customer.id} is active with ₹${customer.initialInvestmentAmount} at ${customer.monthlyProfitRate}% monthly profit rate.`,
        type: 'investment',
        date: customer.investmentDate,
      });
    } else {
      const prev = customers[index];
      customers[index] = { ...customer, updatedAt: new Date().toISOString().split('T')[0] };
      this.logAudit({
        action: 'UPDATE',
        entity: 'Customer',
        entityId: customer.id,
        performedBy: adminUsername,
        details: `Updated details for customer ${customer.fullName} (${customer.id})`,
        previousValue: JSON.stringify(prev),
        newValue: JSON.stringify(customer),
      });
    }

    this.set(STORAGE_KEYS.CUSTOMERS, customers);
    return customer;
  }

  public toggleCustomerStatus(id: string, adminUsername: string = 'admin'): Customer | null {
    const customers = this.getCustomers();
    const customer = customers.find((c) => c.id === id);
    if (!customer) return null;

    customer.status = customer.status === 'active' ? 'inactive' : 'active';
    customer.updatedAt = new Date().toISOString().split('T')[0];
    this.set(STORAGE_KEYS.CUSTOMERS, customers);

    this.logAudit({
      action: 'UPDATE',
      entity: 'Customer',
      entityId: customer.id,
      performedBy: adminUsername,
      details: `Changed status of customer ${customer.fullName} to ${customer.status}`,
    });

    return customer;
  }

  // --- Investments CRUD ---
  public getInvestments(): Investment[] {
    return this.get<Investment[]>(STORAGE_KEYS.INVESTMENTS, []);
  }

  public getInvestmentsByCustomerId(customerId: string): Investment[] {
    return this.getInvestments().filter((inv) => inv.customerId === customerId);
  }

  public saveInvestment(investment: Investment, adminUsername: string = 'admin', log: boolean = true): Investment {
    const investments = this.getInvestments();
    const index = investments.findIndex((i) => i.id === investment.id);
    if (index >= 0) {
      investments[index] = investment;
    } else {
      investments.push(investment);
    }
    this.set(STORAGE_KEYS.INVESTMENTS, investments);

    if (log) {
      this.logAudit({
        action: 'CREATE',
        entity: 'Investment',
        entityId: investment.id,
        performedBy: adminUsername,
        details: `Created new investment of ₹${investment.amount} at ${investment.profitRate}% for customer ${investment.customerId}`,
      });

      this.addNotification({
        customerId: investment.customerId,
        title: 'New Investment Recorded',
        message: `An additional investment of ₹${investment.amount} has been registered to your portfolio at ${investment.profitRate}% monthly rate.`,
        type: 'investment',
        date: investment.investmentDate,
      });
    }

    return investment;
  }

  // --- Payments CRUD (Principal and Profit strictly segregated) ---
  public getPayments(): Payment[] {
    return this.get<Payment[]>(STORAGE_KEYS.PAYMENTS, []);
  }

  public getPaymentsByCustomerId(customerId: string): Payment[] {
    return this.getPayments().filter((p) => p.customerId === customerId);
  }

  public recordPayment(payment: Payment, adminUsername: string = 'admin'): Payment {
    const payments = this.getPayments();
    payments.push(payment);
    this.set(STORAGE_KEYS.PAYMENTS, payments);

    // If payment is for Profit, mark corresponding pending profit records as paid
    if (payment.paymentType === 'Profit') {
      this.allocateProfitPayment(payment.customerId, payment.amount, payment.date, payment.transactionReference);
    }

    // Log to Audit trail
    this.logAudit({
      action: 'PAYMENT',
      entity: 'Payment',
      entityId: payment.id,
      performedBy: adminUsername,
      details: `Recorded ${payment.paymentType} payment of ₹${payment.amount} via ${payment.paymentMode} for customer ${payment.customerId}. Ref: ${payment.transactionReference}`,
    });

    // Create Customer Notification
    if (payment.paymentType === 'Principal') {
      const summary = this.getCustomerFinancialSummary(payment.customerId);
      this.addNotification({
        customerId: payment.customerId,
        title: 'Principal Payment Recorded',
        message: `Principal refund payment of ₹${payment.amount} processed (${payment.paymentMode}). Your updated active principal balance is ₹${summary?.principalBalance || 0}.`,
        type: 'principal_paid',
        date: payment.date,
      });
    } else if (payment.paymentType === 'Profit') {
      this.addNotification({
        customerId: payment.customerId,
        title: 'Profit Payment Credited',
        message: `Profit payout of ₹${payment.amount} has been issued via ${payment.paymentMode}. Reference: ${payment.transactionReference}.`,
        type: 'profit_paid',
        date: payment.date,
      });
    } else {
      this.addNotification({
        customerId: payment.customerId,
        title: 'Payment Recorded',
        message: `Payment of ₹${payment.amount} (${payment.paymentType}) has been recorded on your account.`,
        type: 'system',
        date: payment.date,
      });
    }

    return payment;
  }

  public deletePayment(paymentId: string, adminUsername: string, reason: string): boolean {
    const payments = this.getPayments();
    const index = payments.findIndex((p) => p.id === paymentId);
    if (index === -1) return false;

    const payment = payments[index];
    payments.splice(index, 1);
    this.set(STORAGE_KEYS.PAYMENTS, payments);

    this.logAudit({
      action: 'DELETE',
      entity: 'Payment',
      entityId: paymentId,
      performedBy: adminUsername,
      details: `Deleted ${payment.paymentType} payment of ₹${payment.amount} (Ref: ${payment.transactionReference}) for customer ${payment.customerId}. Reason: ${reason}`,
      previousValue: JSON.stringify(payment),
    });

    return true;
  }

  // --- Monthly Profit Records CRUD ---
  public getProfitRecords(): MonthlyProfitRecord[] {
    return this.get<MonthlyProfitRecord[]>(STORAGE_KEYS.PROFIT_RECORDS, []);
  }

  public getProfitRecordsByCustomerId(customerId: string): MonthlyProfitRecord[] {
    return this.getProfitRecords().filter((r) => r.customerId === customerId);
  }

  /**
   * Helper to allocate a profit payment across pending monthly records
   */
  private allocateProfitPayment(customerId: string, amountToPay: number, paymentDate: string, reference: string): void {
    const records = this.getProfitRecords();
    let remaining = amountToPay;

    for (const record of records) {
      if (record.customerId === customerId && record.pendingAmount > 0 && remaining > 0) {
        const payForThis = Math.min(record.pendingAmount, remaining);
        record.paidAmount += payForThis;
        record.pendingAmount -= payForThis;
        record.paymentDate = paymentDate;
        record.paymentReference = reference;
        record.status = record.pendingAmount === 0 ? 'Paid' : 'Partially Paid';
        remaining -= payForThis;
      }
    }

    this.set(STORAGE_KEYS.PROFIT_RECORDS, records);
  }

  /**
   * Generate monthly profit record for a customer for a given month
   * Strictly uses current principal balance!
   */
  public generateMonthlyProfitForCustomer(
    customerId: string,
    monthYear: string,
    calculationDate: string,
    adminUsername: string = 'admin'
  ): MonthlyProfitRecord | null {
    const customer = this.getCustomerById(customerId);
    if (!customer) return null;

    const summary = this.getCustomerFinancialSummary(customerId);
    if (!summary || summary.principalBalance <= 0) {
      return null;
    }

    // Check if profit for this month already exists
    const existing = this.getProfitRecords().find(
      (r) => r.customerId === customerId && r.monthYear === monthYear
    );
    if (existing) {
      return existing; // Already generated
    }

    const principalBase = summary.principalBalance;
    const rate = customer.monthlyProfitRate || 5.0;
    const profitAmount = calculateMonthlyProfit(principalBase, rate);

    const newRecord: MonthlyProfitRecord = {
      id: `PRF-${Date.now().toString().slice(-6)}`,
      customerId,
      monthYear,
      calculationDate: calculationDate || new Date().toISOString().split('T')[0],
      principalBaseAmount: principalBase,
      profitRate: rate,
      profitAmount,
      paidAmount: 0,
      pendingAmount: profitAmount,
      status: 'Pending',
      createdAt: new Date().toISOString().split('T')[0],
    };

    const records = this.getProfitRecords();
    records.push(newRecord);
    this.set(STORAGE_KEYS.PROFIT_RECORDS, records);

    this.logAudit({
      action: 'PROFIT_GENERATE',
      entity: 'Profit',
      entityId: newRecord.id,
      performedBy: adminUsername,
      details: `Generated monthly profit of ₹${profitAmount} for ${customer.fullName} (${customerId}) for ${monthYear} on principal ₹${principalBase} @ ${rate}%`,
    });

    this.addNotification({
      customerId,
      title: 'Monthly Profit Generated',
      message: `Your monthly profit of ₹${profitAmount} for ${monthYear} has been generated based on current principal ₹${principalBase}.`,
      type: 'profit_generated',
      date: calculationDate,
    });

    return newRecord;
  }

  /**
   * Generate monthly profit for all active customers
   */
  public generateMonthlyProfitsForAll(
    monthYear: string,
    calculationDate: string,
    adminUsername: string = 'admin'
  ): { count: number; totalProfit: number } {
    const customers = this.getCustomers().filter((c) => c.status === 'active');
    let count = 0;
    let totalProfit = 0;

    for (const customer of customers) {
      const rec = this.generateMonthlyProfitForCustomer(customer.id, monthYear, calculationDate, adminUsername);
      if (rec) {
        count++;
        totalProfit += rec.profitAmount;
      }
    }

    return { count, totalProfit };
  }

  // --- Financial Summary & Complete Calculations ---
  public getCustomerFinancialSummary(customerId: string): CustomerFinancialSummary | null {
    const customer = this.getCustomerById(customerId);
    if (!customer) return null;

    const investments = this.getInvestmentsByCustomerId(customerId);
    const payments = this.getPaymentsByCustomerId(customerId);
    const profitRecords = this.getProfitRecordsByCustomerId(customerId);

    // Total Investment
    const totalInvestment = investments.reduce((sum, i) => sum + i.amount, 0);

    // Principal Returned (ONLY payments with type 'Principal')
    const principalReturned = payments
      .filter((p) => p.paymentType === 'Principal')
      .reduce((sum, p) => sum + p.amount, 0);

    // Principal Balance = Total Investment - Principal Returned
    const principalBalance = Math.max(0, totalInvestment - principalReturned);

    // Profit Rate
    const profitRate = customer.monthlyProfitRate || 5.0;

    // Current Monthly Profit = Current Principal * Rate / 100
    const currentMonthlyProfit = calculateMonthlyProfit(principalBalance, profitRate);

    // Total Profit Generated = Sum of all monthly profit records
    const totalProfitGenerated = profitRecords.reduce((sum, r) => sum + r.profitAmount, 0);

    // Total Profit Paid = Sum of all profit payments
    const totalProfitPaid = payments
      .filter((p) => p.paymentType === 'Profit')
      .reduce((sum, p) => sum + p.amount, 0);

    // Profit Pending
    const profitPending = Math.max(0, totalProfitGenerated - totalProfitPaid);

    // Last Payment details
    const sortedPayments = [...payments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const lastPayment = sortedPayments[0];

    return {
      customerId: customer.id,
      customerName: customer.fullName,
      mobile: customer.mobileNumber,
      totalInvestment,
      principalReturned,
      principalBalance,
      profitRate,
      currentMonthlyProfit,
      totalProfitGenerated,
      totalProfitPaid,
      profitPending,
      lastPaymentDate: lastPayment?.date,
      lastPaymentAmount: lastPayment?.amount,
      lastPaymentType: lastPayment?.paymentType,
      nextProfitDueDate: getNextProfitDueDate(customer.startDate),
      status: customer.status,
    };
  }

  // --- Admin Aggregate Dashboard Metrics ---
  public getAdminDashboardMetrics(): AdminDashboardMetrics {
    const customers = this.getCustomers();
    let totalInvestmentReceived = 0;
    let totalPrincipalReturned = 0;
    let totalPrincipalOutstanding = 0;
    let totalProfitGenerated = 0;
    let totalProfitPaid = 0;
    let totalProfitPending = 0;

    for (const c of customers) {
      const summary = this.getCustomerFinancialSummary(c.id);
      if (summary) {
        totalInvestmentReceived += summary.totalInvestment;
        totalPrincipalReturned += summary.principalReturned;
        totalPrincipalOutstanding += summary.principalBalance;
        totalProfitGenerated += summary.totalProfitGenerated;
        totalProfitPaid += summary.totalProfitPaid;
        totalProfitPending += summary.profitPending;
      }
    }

    return {
      totalCustomers: customers.length,
      activeCustomers: customers.filter((c) => c.status === 'active').length,
      totalInvestmentReceived,
      totalPrincipalReturned,
      totalPrincipalOutstanding,
      totalProfitGenerated,
      totalProfitPaid,
      totalProfitPending,
    };
  }

  // --- Complete Chronological Transaction Ledger for Customer ---
  public getCustomerLedger(customerId: string): TransactionLedgerItem[] {
    const investments = this.getInvestmentsByCustomerId(customerId);
    const payments = this.getPaymentsByCustomerId(customerId);
    const profitRecords = this.getProfitRecordsByCustomerId(customerId);

    const ledger: TransactionLedgerItem[] = [];

    // 1. Investments
    for (const inv of investments) {
      ledger.push({
        id: inv.id,
        customerId,
        date: inv.investmentDate,
        type: 'Investment',
        displayType: 'Investment',
        category: 'Principal',
        amount: inv.amount,
        status: 'Received',
        remarks: inv.notes || 'Investment capital deposited',
        runningPrincipalBalance: 0, // calculated below
        createdAt: inv.createdAt,
      });
    }

    // 2. Payments (Principal Returns & Profit Payouts)
    for (const pay of payments) {
      if (pay.paymentType === 'Principal') {
        ledger.push({
          id: pay.id,
          customerId,
          date: pay.date,
          type: 'Principal_Return',
          displayType: 'Principal Return',
          category: 'Principal',
          amount: pay.amount,
          paymentMode: pay.paymentMode,
          referenceNumber: pay.transactionReference,
          status: 'Paid',
          remarks: pay.remarks || 'Principal returned to customer',
          runningPrincipalBalance: 0,
          createdAt: pay.createdAt,
        });
      } else if (pay.paymentType === 'Profit') {
        ledger.push({
          id: pay.id,
          customerId,
          date: pay.date,
          type: 'Profit_Paid',
          displayType: 'Profit Paid',
          category: 'Profit',
          amount: pay.amount,
          paymentMode: pay.paymentMode,
          referenceNumber: pay.transactionReference,
          status: 'Paid',
          remarks: pay.remarks || 'Profit payout disbursed',
          runningPrincipalBalance: 0,
          createdAt: pay.createdAt,
        });
      } else {
        ledger.push({
          id: pay.id,
          customerId,
          date: pay.date,
          type: 'Other_Payment',
          displayType: 'Other',
          category: 'Other',
          amount: pay.amount,
          paymentMode: pay.paymentMode,
          referenceNumber: pay.transactionReference,
          status: 'Paid',
          remarks: pay.remarks || 'Adjustment / Other payment',
          runningPrincipalBalance: 0,
          createdAt: pay.createdAt,
        });
      }
    }

    // 3. Profit Accruals (Monthly Generated Profits)
    for (const pr of profitRecords) {
      ledger.push({
        id: pr.id,
        customerId,
        date: pr.calculationDate,
        type: 'Profit_Accrual',
        displayType: 'Profit Generated',
        category: 'Profit',
        amount: pr.profitAmount,
        status: pr.status === 'Paid' ? 'Paid' : 'Accrued',
        remarks: `Monthly Profit for ${pr.monthYear} (${pr.profitRate}% on ₹${pr.principalBaseAmount.toLocaleString('en-IN')})`,
        runningPrincipalBalance: 0,
        createdAt: pr.createdAt,
      });
    }

    // Sort chronologically ascending
    ledger.sort((a, b) => {
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();
      if (timeA !== timeB) return timeA - timeB;
      // If same date, Investments before Principal returns, before Profit
      return a.createdAt.localeCompare(b.createdAt);
    });

    // Compute running principal balance
    let currentBalance = 0;
    for (const item of ledger) {
      if (item.type === 'Investment') {
        currentBalance += item.amount;
      } else if (item.type === 'Principal_Return') {
        currentBalance -= item.amount;
      }
      item.runningPrincipalBalance = Math.max(0, currentBalance);
    }

    return ledger;
  }

  // --- Notifications CRUD ---
  public getNotifications(customerId?: string): NotificationItem[] {
    const all = this.get<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    if (!customerId) return all;
    return all.filter((n) => !n.customerId || n.customerId === customerId);
  }

  public addNotification(item: Omit<NotificationItem, 'id' | 'isRead' | 'createdAt'>): NotificationItem {
    const notifications = this.getNotifications();
    const newNotif: NotificationItem = {
      ...item,
      id: `NOTIF-${Date.now().toString().slice(-6)}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    notifications.unshift(newNotif);
    this.set(STORAGE_KEYS.NOTIFICATIONS, notifications);
    return newNotif;
  }

  public markNotificationAsRead(id: string): void {
    const notifications = this.getNotifications();
    const notif = notifications.find((n) => n.id === id);
    if (notif) {
      notif.isRead = true;
      this.set(STORAGE_KEYS.NOTIFICATIONS, notifications);
    }
  }

  public markAllNotificationsAsRead(customerId?: string): void {
    const notifications = this.getNotifications();
    notifications.forEach((n) => {
      if (!customerId || n.customerId === customerId) {
        n.isRead = true;
      }
    });
    this.set(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }

  // --- Audit Logs ---
  public getAuditLogs(): AuditLog[] {
    return this.get<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []);
  }

  public logAudit(log: Omit<AuditLog, 'id' | 'timestamp'>): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      ...log,
      id: `AUD-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    logs.unshift(newLog);
    this.set(STORAGE_KEYS.AUDIT_LOGS, logs.slice(0, 500)); // Keep recent 500
  }
}

export const db = new StorageService();
db.initialize();
