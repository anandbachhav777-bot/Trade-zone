/**
 * Formats a number to Indian Rupee (INR) format
 * e.g., 1000000 -> "₹ 10,00,000"
 */
export function formatINR(amount: number | null | undefined, showSymbol: boolean = true): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return showSymbol ? '₹ 0' : '0';
  }

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  // Format using Indian Numbering System
  const parts = absAmount.toFixed(2).split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1];

  let lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formattedInteger = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;

  // If decimal is .00, we can omit or keep based on preference, but for clarity let's omit .00 if whole
  const finalNumber = decimalPart === '00' ? formattedInteger : `${formattedInteger}.${decimalPart}`;

  return `${isNegative ? '-' : ''}${showSymbol ? '₹ ' : ''}${finalNumber}`;
}

/**
 * Formats standard date YYYY-MM-DD to Indian format DD-MM-YYYY or DD MMM YYYY
 */
export function formatIndianDate(dateString?: string, format: 'DD-MM-YYYY' | 'DD MMM YYYY' = 'DD-MM-YYYY'): string {
  if (!dateString) return '-';
  try {
    const [year, month, day] = dateString.split('-');
    if (!year || !month || !day) {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      if (format === 'DD-MM-YYYY') return `${dd}-${mm}-${yyyy}`;
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${dd} ${months[d.getMonth()]} ${yyyy}`;
    }

    if (format === 'DD-MM-YYYY') {
      return `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`;
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthIndex = parseInt(month, 10) - 1;
    const monthName = months[monthIndex] || month;
    return `${day} ${monthName} ${year}`;
  } catch {
    return dateString;
  }
}

/**
 * Generate a unique ID
 */
export function generateId(prefix: string = 'ID'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`.toUpperCase();
}

/**
 * Calculates monthly profit strictly based on outstanding principal
 * Formula: Monthly Profit = Current Principal * Rate / 100
 */
export function calculateMonthlyProfit(principalBalance: number, ratePercent: number = 5): number {
  if (principalBalance <= 0) return 0;
  return Math.round((principalBalance * ratePercent) / 100);
}

/**
 * Converts numbers into Indian Currency Words (e.g. "Rupees One Lakh Fifty Thousand Only")
 */
export function numberToIndianWords(amount: number): string {
  if (!amount || isNaN(amount) || amount === 0) return 'Rupees Zero Only';

  const singleDigits = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertTwoDigits(n: number): string {
    if (n === 0) return '';
    if (n < 10) return singleDigits[n];
    if (n < 20) return teens[n - 10];
    const unit = n % 10;
    const ten = Math.floor(n / 10);
    return `${tens[ten]}${unit ? ' ' + singleDigits[unit] : ''}`;
  }

  function convertThreeDigits(n: number): string {
    const hundred = Math.floor(n / 100);
    const remainder = n % 100;
    let str = '';
    if (hundred > 0) {
      str += `${singleDigits[hundred]} Hundred`;
      if (remainder > 0) str += ' and ';
    }
    if (remainder > 0) {
      str += convertTwoDigits(remainder);
    }
    return str;
  }

  const absAmount = Math.floor(Math.abs(amount));
  let output = '';

  const crore = Math.floor(absAmount / 10000000);
  const remainderCrore = absAmount % 10000000;

  const lakh = Math.floor(remainderCrore / 100000);
  const remainderLakh = remainderCrore % 100000;

  const thousand = Math.floor(remainderLakh / 1000);
  const remainderThousand = remainderLakh % 1000;

  const hundred = remainderThousand;

  if (crore > 0) {
    output += `${convertThreeDigits(crore)} Crore `;
  }
  if (lakh > 0) {
    output += `${convertThreeDigits(lakh)} Lakh `;
  }
  if (thousand > 0) {
    output += `${convertThreeDigits(thousand)} Thousand `;
  }
  if (hundred > 0) {
    output += `${convertThreeDigits(hundred)} `;
  }

  return `Rupees ${output.trim()} Only`;
}

/**
 * Get Next Profit Due Date (typically 1st or same day of next month)
 */
export function getNextProfitDueDate(startDate?: string): string {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const yyyy = nextMonth.getFullYear();
  const mm = String(nextMonth.getMonth() + 1).padStart(2, '0');
  const dd = '01';
  return `${yyyy}-${mm}-${dd}`;
}
