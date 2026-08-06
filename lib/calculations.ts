export function formatINR(value: number): string {
  if (!isFinite(value)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatINRPrecise(value: number): string {
  if (!isFinite(value)) return "₹0.00";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

/* ---------------- GST ---------------- */

export interface GstResult {
  baseAmount: number;
  gstAmount: number;
  totalAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
}

export function calculateGstExclusive(
  amount: number,
  rate: number,
  interState: boolean
): GstResult {
  const gstAmount = (amount * rate) / 100;
  const totalAmount = amount + gstAmount;
  return {
    baseAmount: amount,
    gstAmount,
    totalAmount,
    cgst: interState ? 0 : gstAmount / 2,
    sgst: interState ? 0 : gstAmount / 2,
    igst: interState ? gstAmount : 0,
  };
}

export function calculateGstInclusive(
  amount: number,
  rate: number,
  interState: boolean
): GstResult {
  const baseAmount = (amount * 100) / (100 + rate);
  const gstAmount = amount - baseAmount;
  return {
    baseAmount,
    gstAmount,
    totalAmount: amount,
    cgst: interState ? 0 : gstAmount / 2,
    sgst: interState ? 0 : gstAmount / 2,
    igst: interState ? gstAmount : 0,
  };
}

/* ---------------- Salary (simplified, new tax regime FY 2025-26) ---------------- */
/* Note: simplified estimate for guidance only — not tax advice. */

export interface SalaryResult {
  ctc: number;
  basic: number;
  hra: number;
  specialAllowance: number;
  employerPf: number;
  employeePf: number;
  professionalTax: number;
  taxableIncome: number;
  incomeTax: number;
  cess: number;
  totalTax: number;
  monthlyInHand: number;
  annualInHand: number;
}

export function newRegimeTax(taxableIncome: number): number {
  // FY 2025-26 new regime slabs (simplified, no rebate/surcharge edge cases beyond 87A)
  const slabs = [
    { upto: 400000, rate: 0 },
    { upto: 800000, rate: 0.05 },
    { upto: 1200000, rate: 0.1 },
    { upto: 1600000, rate: 0.15 },
    { upto: 2000000, rate: 0.2 },
    { upto: 2400000, rate: 0.25 },
    { upto: Infinity, rate: 0.3 },
  ];

  let tax = 0;
  let lastLimit = 0;
  for (const slab of slabs) {
    if (taxableIncome > lastLimit) {
      const taxableInSlab = Math.min(taxableIncome, slab.upto) - lastLimit;
      tax += taxableInSlab * slab.rate;
      lastLimit = slab.upto;
    } else {
      break;
    }
  }

  // Section 87A rebate: taxable income up to 12L -> zero tax (new regime, FY25-26)
  if (taxableIncome <= 1200000) {
    return 0;
  }

  return tax;
}

export function calculateInHandSalary(ctc: number): SalaryResult {
  const basic = ctc * 0.4;
  const hra = basic * 0.5;
  const employerPf = Math.min(basic, 15000) * 12 * 0.12 <= ctc ? Math.min(basic * 0.12, 1800 * 12) : 0;
  const employeePf = employerPf; // symmetric employee contribution
  const specialAllowance = Math.max(
    ctc - basic - hra - employerPf,
    0
  );

  const professionalTax = 2400; // typical annual PT cap, varies by state

  const standardDeduction = 75000; // new regime standard deduction FY25-26
  const taxableIncome = Math.max(
    ctc - employerPf - standardDeduction,
    0
  );

  const incomeTax = newRegimeTax(taxableIncome);
  const cess = incomeTax * 0.04;
  const totalTax = incomeTax + cess;

  const annualInHand = ctc - employerPf - employeePf - professionalTax - totalTax;
  const monthlyInHand = annualInHand / 12;

  return {
    ctc,
    basic,
    hra,
    specialAllowance,
    employerPf,
    employeePf,
    professionalTax,
    taxableIncome,
    incomeTax,
    cess,
    totalTax,
    monthlyInHand,
    annualInHand,
  };
}

/* ---------------- Freelance / Presumptive Tax (Section 44ADA) ---------------- */
/* Simplified estimate for guidance only — not tax advice. */

export interface FreelanceTaxResult {
  grossReceipts: number;
  presumptiveIncome: number;
  standardDeduction: number;
  taxableIncome: number;
  incomeTax: number;
  cess: number;
  totalTax: number;
  netIncome: number;
  eligibleFor44ADA: boolean;
}

const SECTION_44ADA_LIMIT = 7500000; // ₹75L threshold (with 95%+ digital receipts), FY 2025-26

export function calculateFreelanceTax(grossReceipts: number): FreelanceTaxResult {
  const eligibleFor44ADA = grossReceipts <= SECTION_44ADA_LIMIT;

  // Under 44ADA, presumptive income = 50% of gross receipts (minimum)
  const presumptiveIncome = eligibleFor44ADA
    ? grossReceipts * 0.5
    : grossReceipts * 0.5; // still shown as estimate above threshold, flagged separately

  const standardDeduction = 75000; // new regime standard deduction FY25-26
  const taxableIncome = Math.max(presumptiveIncome - standardDeduction, 0);

  const incomeTax = newRegimeTax(taxableIncome);
  const cess = incomeTax * 0.04;
  const totalTax = incomeTax + cess;

  const netIncome = grossReceipts - totalTax;

  return {
    grossReceipts,
    presumptiveIncome,
    standardDeduction,
    taxableIncome,
    incomeTax,
    cess,
    totalTax,
    netIncome,
    eligibleFor44ADA,
  };
}

/* ---------------- HRA Exemption ---------------- */

export interface HraResult {
  hraReceived: number;
  exemptAmount: number;
  taxableHra: number;
}

export function calculateHraExemption(
  basicSalary: number,
  hraReceived: number,
  rentPaid: number,
  isMetro: boolean
): HraResult {
  const rule1 = hraReceived;
  const rule2 = isMetro ? basicSalary * 0.5 : basicSalary * 0.4;
  const rule3 = Math.max(rentPaid - basicSalary * 0.1, 0);

  const exemptAmount = Math.max(Math.min(rule1, rule2, rule3), 0);
  const taxableHra = Math.max(hraReceived - exemptAmount, 0);

  return { hraReceived, exemptAmount, taxableHra };
}

/* ---------------- TDS on Professional Fees (Section 194J) ---------------- */

export interface TdsResult {
  invoiceAmount: number;
  tdsRate: number;
  tdsAmount: number;
  netReceivable: number;
  thresholdApplies: boolean;
}

const TDS_194J_THRESHOLD = 30000;

export function calculateTds(invoiceAmount: number, tdsRate = 10): TdsResult {
  const thresholdApplies = invoiceAmount >= TDS_194J_THRESHOLD;
  const tdsAmount = thresholdApplies ? (invoiceAmount * tdsRate) / 100 : 0;
  const netReceivable = invoiceAmount - tdsAmount;

  return {
    invoiceAmount,
    tdsRate,
    tdsAmount,
    netReceivable,
    thresholdApplies,
  };
}

/* ---------------- EMI Calculator ---------------- */

export interface EmiResult {
  principal: number;
  monthlyRate: number;
  tenureMonths: number;
  emi: number;
  totalPayment: number;
  totalInterest: number;
}

export function calculateEmi(
  principal: number,
  annualRatePercent: number,
  tenureMonths: number
): EmiResult {
  const monthlyRate = annualRatePercent / 12 / 100;
  let emi: number;

  if (monthlyRate === 0) {
    emi = principal / tenureMonths;
  } else {
    const factor = Math.pow(1 + monthlyRate, tenureMonths);
    emi = (principal * monthlyRate * factor) / (factor - 1);
  }

  const totalPayment = emi * tenureMonths;
  const totalInterest = totalPayment - principal;

  return {
    principal,
    monthlyRate,
    tenureMonths,
    emi,
    totalPayment,
    totalInterest,
  };
}

/* ---------------- SIP Calculator ---------------- */

export interface SipResult {
  monthlyInvestment: number;
  annualRatePercent: number;
  tenureYears: number;
  totalInvested: number;
  futureValue: number;
  totalGains: number;
}

export function calculateSip(
  monthlyInvestment: number,
  annualRatePercent: number,
  tenureYears: number
): SipResult {
  const monthlyRate = annualRatePercent / 12 / 100;
  const months = tenureYears * 12;

  const futureValue =
    monthlyRate === 0
      ? monthlyInvestment * months
      : monthlyInvestment *
        ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
        (1 + monthlyRate);

  const totalInvested = monthlyInvestment * months;
  const totalGains = futureValue - totalInvested;

  return {
    monthlyInvestment,
    annualRatePercent,
    tenureYears,
    totalInvested,
    futureValue,
    totalGains,
  };
}

/* ---------------- Freelance Hourly Rate Calculator ---------------- */

export interface HourlyRateResult {
  desiredAnnualIncome: number;
  workingDaysPerYear: number;
  billablePercent: number;
  hoursPerDay: number;
  billableHoursPerYear: number;
  hourlyRate: number;
  dailyRate: number;
}

export function calculateHourlyRate(
  desiredAnnualIncome: number,
  workingDaysPerYear: number,
  hoursPerDay: number,
  billablePercent: number
): HourlyRateResult {
  const totalHours = workingDaysPerYear * hoursPerDay;
  const billableHoursPerYear = totalHours * (billablePercent / 100);
  const hourlyRate =
    billableHoursPerYear > 0 ? desiredAnnualIncome / billableHoursPerYear : 0;
  const dailyRate = hourlyRate * hoursPerDay;

  return {
    desiredAnnualIncome,
    workingDaysPerYear,
    billablePercent,
    hoursPerDay,
    billableHoursPerYear,
    hourlyRate,
    dailyRate,
  };
}

/* ---------------- Old vs New Tax Regime Comparison ---------------- */

function oldRegimeTax(taxableIncome: number): number {
  const slabs = [
    { upto: 250000, rate: 0 },
    { upto: 500000, rate: 0.05 },
    { upto: 1000000, rate: 0.2 },
    { upto: Infinity, rate: 0.3 },
  ];

  let tax = 0;
  let lastLimit = 0;
  for (const slab of slabs) {
    if (taxableIncome > lastLimit) {
      const taxableInSlab = Math.min(taxableIncome, slab.upto) - lastLimit;
      tax += taxableInSlab * slab.rate;
      lastLimit = slab.upto;
    } else {
      break;
    }
  }

  // Section 87A rebate: taxable income up to 5L -> zero tax (old regime)
  if (taxableIncome <= 500000) return 0;

  return tax;
}

export interface RegimeComparisonResult {
  grossIncome: number;
  oldRegime: { taxableIncome: number; tax: number; cess: number; total: number };
  newRegime: { taxableIncome: number; tax: number; cess: number; total: number };
  betterRegime: "old" | "new";
  savings: number;
}

export function compareRegimes(
  grossIncome: number,
  section80cDeductions: number,
  hraExemption: number
): RegimeComparisonResult {
  // Old regime: standard deduction 50,000 + 80C + HRA exemption
  const oldStandardDeduction = 50000;
  const oldTaxableIncome = Math.max(
    grossIncome - oldStandardDeduction - section80cDeductions - hraExemption,
    0
  );
  const oldTax = oldRegimeTax(oldTaxableIncome);
  const oldCess = oldTax * 0.04;

  // New regime: standard deduction 75,000, no 80C/HRA
  const newStandardDeduction = 75000;
  const newTaxableIncome = Math.max(grossIncome - newStandardDeduction, 0);
  const newTax = newRegimeTax(newTaxableIncome);
  const newCess = newTax * 0.04;

  const oldTotal = oldTax + oldCess;
  const newTotal = newTax + newCess;

  const betterRegime = newTotal <= oldTotal ? "new" : "old";
  const savings = Math.abs(oldTotal - newTotal);

  return {
    grossIncome,
    oldRegime: { taxableIncome: oldTaxableIncome, tax: oldTax, cess: oldCess, total: oldTotal },
    newRegime: { taxableIncome: newTaxableIncome, tax: newTax, cess: newCess, total: newTotal },
    betterRegime,
    savings,
  };
}

/* ---------------- Percentage Calculator ---------------- */

export function percentOf(value: number, percent: number): number {
  return (value * percent) / 100;
}

export function whatPercent(part: number, whole: number): number {
  return whole === 0 ? 0 : (part / whole) * 100;
}

export function percentChange(from: number, to: number): number {
  return from === 0 ? 0 : ((to - from) / from) * 100;
}

/* ---------------- Discount Calculator ---------------- */

export interface DiscountResult {
  originalPrice: number;
  discountPercent: number;
  discountAmount: number;
  finalPrice: number;
}

export function calculateDiscount(
  originalPrice: number,
  discountPercent: number
): DiscountResult {
  const discountAmount = (originalPrice * discountPercent) / 100;
  const finalPrice = originalPrice - discountAmount;
  return { originalPrice, discountPercent, discountAmount, finalPrice };
}

/* ---------------- Profit Margin Calculator ---------------- */

export interface ProfitMarginResult {
  costPrice: number;
  sellingPrice: number;
  profit: number;
  marginPercent: number;
  markupPercent: number;
}

export function calculateProfitMargin(
  costPrice: number,
  sellingPrice: number
): ProfitMarginResult {
  const profit = sellingPrice - costPrice;
  const marginPercent = sellingPrice === 0 ? 0 : (profit / sellingPrice) * 100;
  const markupPercent = costPrice === 0 ? 0 : (profit / costPrice) * 100;
  return { costPrice, sellingPrice, profit, marginPercent, markupPercent };
}

/* ---------------- PPF Calculator ---------------- */

export interface PpfResult {
  yearlyInvestment: number;
  rate: number;
  tenureYears: number;
  maturityValue: number;
  totalInvested: number;
  totalInterest: number;
}

export function calculatePpf(
  yearlyInvestment: number,
  rate: number,
  tenureYears: number
): PpfResult {
  let balance = 0;
  for (let i = 0; i < tenureYears; i++) {
    balance = (balance + yearlyInvestment) * (1 + rate / 100);
  }
  const totalInvested = yearlyInvestment * tenureYears;
  const totalInterest = balance - totalInvested;

  return {
    yearlyInvestment,
    rate,
    tenureYears,
    maturityValue: balance,
    totalInvested,
    totalInterest,
  };
}

/* ---------------- Gratuity Calculator ---------------- */

export interface GratuityResult {
  lastDrawnSalary: number;
  yearsOfService: number;
  gratuityAmount: number;
  cappedAt: boolean;
}

const GRATUITY_CAP = 2000000; // ₹20L statutory cap

export function calculateGratuity(
  lastDrawnSalary: number,
  yearsOfService: number
): GratuityResult {
  const raw = (15 * lastDrawnSalary * yearsOfService) / 26;
  const cappedAt = raw > GRATUITY_CAP;
  const gratuityAmount = cappedAt ? GRATUITY_CAP : raw;

  return { lastDrawnSalary, yearsOfService, gratuityAmount, cappedAt };
}

/* ---------------- Break-even Calculator ---------------- */

export interface BreakEvenResult {
  fixedCosts: number;
  pricePerUnit: number;
  variableCostPerUnit: number;
  contributionMargin: number;
  breakEvenUnits: number;
  breakEvenRevenue: number;
}

export function calculateBreakEven(
  fixedCosts: number,
  pricePerUnit: number,
  variableCostPerUnit: number
): BreakEvenResult {
  const contributionMargin = pricePerUnit - variableCostPerUnit;
  const breakEvenUnits =
    contributionMargin > 0 ? fixedCosts / contributionMargin : 0;
  const breakEvenRevenue = breakEvenUnits * pricePerUnit;

  return {
    fixedCosts,
    pricePerUnit,
    variableCostPerUnit,
    contributionMargin,
    breakEvenUnits,
    breakEvenRevenue,
  };
}

/* ---------------- Currency Converter (manual rate) ---------------- */

export interface CurrencyResult {
  amount: number;
  rate: number;
  converted: number;
}

export function convertCurrency(amount: number, rate: number): CurrencyResult {
  return { amount, rate, converted: amount * rate };
}

/* ---------------- Simple / Compound Interest ---------------- */

export interface InterestResult {
  principal: number;
  rate: number;
  timeYears: number;
  interest: number;
  totalAmount: number;
}

export function calculateSimpleInterest(
  principal: number,
  rate: number,
  timeYears: number
): InterestResult {
  const interest = (principal * rate * timeYears) / 100;
  return { principal, rate, timeYears, interest, totalAmount: principal + interest };
}

export function calculateCompoundInterest(
  principal: number,
  rate: number,
  timeYears: number,
  compoundsPerYear = 1
): InterestResult {
  const totalAmount =
    principal * Math.pow(1 + rate / 100 / compoundsPerYear, compoundsPerYear * timeYears);
  const interest = totalAmount - principal;
  return { principal, rate, timeYears, interest, totalAmount };
}

/* ---------------- NPS Calculator ---------------- */

export interface NpsResult {
  monthlyContribution: number;
  totalInvested: number;
  corpusAtRetirement: number;
  lumpSumWithdrawal: number;
  annuityInvestment: number;
  estimatedMonthlyPension: number;
}

export function calculateNps(
  monthlyContribution: number,
  annualReturnPercent: number,
  yearsToRetirement: number,
  annuityRatePercent = 6
): NpsResult {
  const monthlyRate = annualReturnPercent / 12 / 100;
  const months = yearsToRetirement * 12;

  const corpusAtRetirement =
    monthlyRate === 0
      ? monthlyContribution * months
      : monthlyContribution *
        ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
        (1 + monthlyRate);

  const totalInvested = monthlyContribution * months;
  const lumpSumWithdrawal = corpusAtRetirement * 0.6; // 60% withdrawable tax-free
  const annuityInvestment = corpusAtRetirement * 0.4; // 40% mandatory annuity
  const estimatedMonthlyPension = (annuityInvestment * (annuityRatePercent / 100)) / 12;

  return {
    monthlyContribution,
    totalInvested,
    corpusAtRetirement,
    lumpSumWithdrawal,
    annuityInvestment,
    estimatedMonthlyPension,
  };
}

/* ---------------- Late Payment Interest Calculator ---------------- */

export interface LatePaymentResult {
  invoiceAmount: number;
  daysOverdue: number;
  annualRatePercent: number;
  interestOwed: number;
  totalOwed: number;
}

export function calculateLatePaymentInterest(
  invoiceAmount: number,
  daysOverdue: number,
  annualRatePercent: number
): LatePaymentResult {
  const dailyRate = annualRatePercent / 100 / 365;
  const interestOwed = invoiceAmount * dailyRate * Math.max(daysOverdue, 0);
  const totalOwed = invoiceAmount + interestOwed;

  return { invoiceAmount, daysOverdue, annualRatePercent, interestOwed, totalOwed };
}

/* ---------------- Retirement Corpus Calculator ---------------- */

export interface RetirementResult {
  currentMonthlyExpense: number;
  yearsToRetirement: number;
  futureMonthlyExpense: number;
  requiredCorpus: number;
  requiredMonthlySip: number;
}

export function calculateRetirementCorpus(
  currentMonthlyExpense: number,
  yearsToRetirement: number,
  inflationPercent: number,
  expectedReturnPercent: number
): RetirementResult {
  const futureMonthlyExpense =
    currentMonthlyExpense * Math.pow(1 + inflationPercent / 100, yearsToRetirement);

  // 25x annual expense rule of thumb (4% safe withdrawal rate)
  const requiredCorpus = futureMonthlyExpense * 12 * 25;

  const monthlyRate = expectedReturnPercent / 12 / 100;
  const months = yearsToRetirement * 12;
  const futureValueFactor =
    monthlyRate === 0
      ? months
      : ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);

  const requiredMonthlySip = futureValueFactor > 0 ? requiredCorpus / futureValueFactor : 0;

  return {
    currentMonthlyExpense,
    yearsToRetirement,
    futureMonthlyExpense,
    requiredCorpus,
    requiredMonthlySip,
  };
}

/* ---------------- Net Worth Calculator ---------------- */

export interface NetWorthResult {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
}

export function calculateNetWorth(
  assets: number[],
  liabilities: number[]
): NetWorthResult {
  const totalAssets = assets.reduce((s, v) => s + (v || 0), 0);
  const totalLiabilities = liabilities.reduce((s, v) => s + (v || 0), 0);
  return { totalAssets, totalLiabilities, netWorth: totalAssets - totalLiabilities };
}
