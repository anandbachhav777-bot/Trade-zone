import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Customer, CustomerFinancialSummary, Payment, TransactionLedgerItem } from '../types';
import { formatIndianDate, formatINR, numberToIndianWords } from './formatters';

export function generateCustomerPdfStatement(
  customer: Customer,
  summary: CustomerFinancialSummary,
  ledger: TransactionLedgerItem[]
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor = [15, 76, 129]; // Classic Deep Blue
  const secondaryColor = [30, 41, 59]; // Slate
  const accentColor = [16, 185, 129]; // Emerald Green

  // Header Banner
  doc.setFillColor(15, 23, 42); // Dark slate
  doc.rect(0, 0, 210, 32, 'F');

  // Brand Name
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('TRADE ZONE', 14, 15);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text('PORTFOLIO INVESTMENT MANAGEMENT & STATEMENT', 14, 22);

  const statementDate = formatIndianDate(new Date().toISOString().split('T')[0], 'DD MMM YYYY');
  doc.setFontSize(9);
  doc.text(`Generated On: ${statementDate}`, 196, 22, { align: 'right' });

  // Customer Information Box
  let currentY = 40;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, currentY, 182, 34, 2, 2, 'FD');

  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('CUSTOMER ACCOUNT DETAILS', 18, currentY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);

  // Column 1
  doc.text(`Customer ID:`, 18, currentY + 14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(customer.id, 45, currentY + 14);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Full Name:`, 18, currentY + 20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(customer.fullName, 45, currentY + 20);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Mobile:`, 18, currentY + 26);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`+91 ${customer.mobileNumber}`, 45, currentY + 26);

  // Column 2
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Start Date:`, 110, currentY + 14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(formatIndianDate(customer.startDate), 138, currentY + 14);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Profit Rate:`, 110, currentY + 20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129);
  doc.text(`${customer.monthlyProfitRate}% / Month`, 138, currentY + 20);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Status:`, 110, currentY + 26);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(customer.status === 'active' ? 16 : 220, customer.status === 'active' ? 185 : 38, customer.status === 'active' ? 129 : 38);
  doc.text(customer.status.toUpperCase(), 138, currentY + 26);

  currentY += 40;

  // Key Financial Cards (2-Grid)
  doc.setFillColor(238, 242, 255); // Soft Indigo/Blue
  doc.roundedRect(14, currentY, 88, 30, 2, 2, 'F');
  doc.setTextColor(67, 56, 202);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('PRINCIPAL POSITION', 18, currentY + 6);

  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('Total Invested:', 18, currentY + 13);
  doc.text(formatINR(summary.totalInvestment), 96, currentY + 13, { align: 'right' });

  doc.text('Principal Returned:', 18, currentY + 19);
  doc.text(`- ${formatINR(summary.principalReturned)}`, 96, currentY + 19, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Active Principal Balance:', 18, currentY + 25);
  doc.text(formatINR(summary.principalBalance), 96, currentY + 25, { align: 'right' });

  // Profit Position Box
  doc.setFillColor(236, 253, 245); // Soft Green
  doc.roundedRect(108, currentY, 88, 30, 2, 2, 'F');
  doc.setTextColor(4, 120, 87);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('PROFIT STATUS (@ 5% MONTHLY)', 112, currentY + 6);

  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('Total Profit Accrued:', 112, currentY + 13);
  doc.text(formatINR(summary.totalProfitGenerated), 190, currentY + 13, { align: 'right' });

  doc.text('Total Profit Paid:', 112, currentY + 19);
  doc.text(formatINR(summary.totalProfitPaid), 190, currentY + 19, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(217, 119, 6); // Amber
  doc.text('Profit Pending Payout:', 112, currentY + 25);
  doc.text(formatINR(summary.profitPending), 190, currentY + 25, { align: 'right' });

  currentY += 36;

  // Monthly Profit Note
  doc.setFillColor(241, 245, 249);
  doc.rect(14, currentY, 182, 8, 'F');
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(`Current Monthly Profit Expectation: ${formatINR(summary.currentMonthlyProfit)} / Month (Calculated as 5% of active principal ${formatINR(summary.principalBalance)})`, 18, currentY + 5.5);

  currentY += 12;

  // Table Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('COMPLETE TRANSACTION LEDGER (IMMUTABLE AUDIT)', 14, currentY);

  currentY += 4;

  // Build Table Data
  const tableData = ledger.map((item) => [
    formatIndianDate(item.date),
    item.displayType,
    item.paymentMode || '-',
    item.referenceNumber || '-',
    item.type === 'Principal_Return' || item.type === 'Profit_Paid'
      ? `- ${formatINR(item.amount)}`
      : formatINR(item.amount),
    formatINR(item.runningPrincipalBalance),
    item.status,
  ]);

  (doc as any).autoTable({
    startY: currentY,
    head: [['Date', 'Transaction Type', 'Mode', 'Ref No.', 'Amount', 'Principal Bal.', 'Status']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [51, 65, 85],
    },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 32 },
      2: { cellWidth: 18 },
      3: { cellWidth: 32 },
      4: { cellWidth: 26, halign: 'right' },
      5: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
      6: { cellWidth: 22, halign: 'center' },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (data: any) => {
      // Footer on every page
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        'Note: Principal and Profit are tracked as independent ledgers. Regulatory and legal review recommended.',
        14,
        287
      );
      doc.text(`Page ${data.pageNumber} of ${pageCount}`, 196, 287, { align: 'right' });
    },
  });

  // Save the PDF
  const filename = `TradeZone_Statement_${customer.id}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}

export function generateCashReceiptPdf(
  payment: Payment,
  customer?: Customer
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5', // A5 standard receipt format
  });

  const isProfit = payment.paymentType === 'Profit';
  const isPrincipal = payment.paymentType === 'Principal';

  // Outer Border & Fill
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.roundedRect(8, 8, 132, 194, 3, 3, 'D');

  // Top Header Banner
  doc.setFillColor(15, 23, 42); // Dark slate header
  doc.rect(8, 8, 132, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('TRADE ZONE', 74, 18, { align: 'center' });

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(16, 185, 129);
  doc.text('OFFICIAL CASH PAYMENT VOUCHER / RECEIPT', 74, 25, { align: 'center' });

  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text('Fintech Investment Management & Returns Portal', 74, 30, { align: 'center' });

  // Receipt Number & Date Strip
  let y = 43;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(12, y, 124, 12, 1.5, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text('VOUCHER NO:', 16, y + 7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(payment.transactionReference || payment.id, 42, y + 7.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('DATE:', 92, y + 7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(formatIndianDate(payment.date, 'DD MMM YYYY'), 104, y + 7.5);

  // Customer & Details Box
  y += 18;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(12, y, 124, 52, 2, 2, 'D');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);

  doc.text('Customer ID:', 16, y + 8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(payment.customerId, 48, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Customer Name:', 16, y + 16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(customer ? customer.fullName : payment.customerId, 48, y + 16);

  if (customer?.mobileNumber) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Contact Mobile:', 16, y + 24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`+91 ${customer.mobileNumber}`, 48, y + 24);
  }

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Payment Purpose:', 16, y + 32);
  doc.setFont('helvetica', 'bold');
  if (isProfit) {
    doc.setTextColor(16, 185, 129);
    doc.text('5% Monthly Profit Payout (Disbursement)', 48, y + 32);
  } else if (isPrincipal) {
    doc.setTextColor(79, 70, 229);
    doc.text('Principal Capital Return', 48, y + 32);
  } else {
    doc.setTextColor(15, 23, 42);
    doc.text(`${payment.paymentType} Payment`, 48, y + 32);
  }

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Payment Mode:', 16, y + 40);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('CASH (Hand-delivered physical currency)', 48, y + 40);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Handled By:', 16, y + 48);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`Admin Desk (${payment.recordedBy})`, 48, y + 48);

  // Amount Highlight Box
  y += 58;
  doc.setFillColor(236, 253, 245); // Emerald light bg
  doc.setDrawColor(16, 185, 129);
  doc.roundedRect(12, y, 124, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(4, 120, 87);
  doc.text('NET CASH AMOUNT PAID / DISBURSED:', 16, y + 7);

  doc.setFontSize(14);
  doc.setTextColor(6, 95, 70);
  doc.text(formatINR(payment.amount), 16, y + 17);

  // Amount in Words
  y += 28;
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Amount in Words:', 14, y);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(numberToIndianWords(payment.amount), 14, y + 5);

  if (payment.remarks) {
    y += 12;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Remarks / Notes:', 14, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text(payment.remarks, 14, y + 4.5);
  }

  // Signatures Section
  y = 175;
  doc.setDrawColor(203, 213, 225);
  doc.line(16, y, 54, y);
  doc.line(90, y, 128, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("Investor / Receiver's Signature", 18, y + 4);
  doc.text('Authorized Cashier / Officer', 92, y + 4);

  // Footer
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Trade Zone • System Generated Official Cash Voucher • Retain for tax & accounting records', 74, 196, { align: 'center' });

  // Save Document
  const filename = `TradeZone_CashReceipt_${payment.id}_${payment.date}.pdf`;
  doc.save(filename);
}
