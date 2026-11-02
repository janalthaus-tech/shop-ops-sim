/** All editable simulator inputs. Percents stored as 0–100 in UI/state. */
export interface ShopInputs {
  // Ops / revenue
  bayCount: number;
  techCount: number;
  advisorCount: number;
  workingDaysPerMonth: number;
  rosPerDay: number;
  aro: number;
  partsMixPct: number;
  /** Labor mix is derived as 100 - partsMixPct when syncLaborMix is true */
  laborMixPct: number;
  effectiveLaborRate: number;
  shopEfficiencyPct: number;
  /** Optional posted door rate for ELR vs door comparison (0 = hide). */
  doorRate: number;
  /** Quoted work per RO as multiple of ARO (default 2×). TQ = ARO × multiplier. */
  techQuoteMultiplier: number;
  closeRatioPct: number;
  newCustomerPct: number;

  // COGS
  partsCostPctOfPartsSales: number;
  subletPctOfSales: number;
  shopSuppliesPctOfSales: number;

  // Payroll
  avgTechPayPerFlagHr: number;
  advisorSalaryMonthly: number;
  managerSalaryMonthly: number;
  payrollTaxPct: number;
  benefitsPctOfPayroll: number;

  // Overhead monthly
  rent: number;
  utilities: number;
  insurance: number;
  software: number;
  marketing: number;
  training: number;
  misc: number;

  // Optional capital / EBITDA add-backs
  investmentCost: number;
  interestMonthly: number;
  depreciationMonthly: number;

  // Balance sheet starters
  openingCash: number;
  arDays: number;
  inventoryParts: number;
  equipmentNet: number;
  /** Acquisition goodwill / intangibles (EXAMPLE). Optional; amortize via D&A. */
  goodwill?: number;
  apDays: number;
  debt: number;

  // Optional income tax
  incomeTaxPct: number;

  // Owner draws / distributions (monthly cash out of equity)
  distributionsMonthly: number;

  // Acquisition debt (amortizing). Principal 0 = off.
  seniorDebtPrincipal: number;
  seniorDebtRatePct: number;
  seniorDebtTermYears: number;
  sellerNotePrincipal: number;
  sellerNoteRatePct: number;
  sellerNoteTermYears: number;
  /** Option B default: false. SBA often unavailable to non-US-citizen / non-PR owners. */
  sbaAvailable: boolean;
  /** EXAMPLE owner cash injected at close (informational). */
  ownerCashInvested: number;
}

export type StatusBand = 'green' | 'amber' | 'red' | 'neutral';

export interface PnL {
  rosPerMonth: number;
  monthlySales: number;
  laborSales: number;
  partsSales: number;
  flagHours: number;
  techPayroll: number;
  advisorPayroll: number;
  managerPayroll: number;
  basePayroll: number;
  payrollTaxes: number;
  benefits: number;
  totalPayroll: number;
  partsCogs: number;
  sublet: number;
  shopSupplies: number;
  /** Parts + sublet + shop supplies (parts cost bucket). */
  partsBucketCogs: number;
  totalCogs: number;
  grossProfit: number;
  grossProfitPct: number;
  laborGrossProfit: number;
  partsGrossProfit: number;
  overhead: number;
  totalOpEx: number;
  /** = EBITDA (operating income before D&A / interest). */
  operatingIncome: number;
  ebitda: number;
  depreciation: number;
  ebit: number;
  interest: number;
  ebt: number;
  incomeTax: number;
  netIncome: number;
  netMarginPct: number;
  // Mix / cost ratios for P&L display
  laborSalesPctOfSales: number;
  partsSalesPctOfSales: number;
  laborCostPctOfSales: number;
  partsCostPctOfSales: number;
  laborPctOfCogs: number;
  partsPctOfCogs: number;
  subletPctOfCogs: number;
  suppliesPctOfCogs: number;
}

export interface BalanceSheet {
  cash: number;
  ar: number;
  inventory: number;
  equipmentNet: number;
  goodwill: number;
  totalAssets: number;
  ap: number;
  debt: number;
  totalLiabilities: number;
  equity: number;
  /** Closing cash after this month (same as cash). */
  impliedCashAfterMonth: number;
  openingEquity: number;
  distributions: number;
  principalRepaid: number;
  workingCapitalChange: number;
  /** Assets − liabilities − equity; should be ≈ 0. */
  imbalance: number;
}

export type DscrBand = 'pass' | 'warn' | 'fail' | 'n/a';

export interface DebtSchedule {
  seniorPayment: number;
  sellerPayment: number;
  seniorInterest: number;
  sellerInterest: number;
  seniorPrincipal: number;
  sellerPrincipal: number;
  otherInterest: number;
  totalInterest: number;
  totalPrincipal: number;
  monthlyDebtService: number;
  annualDebtService: number;
  /** Annualized EBITDA ÷ annual debt service; null when no debt service. */
  dscr: number | null;
  dscrBand: DscrBand;
  sbaAvailable: boolean;
}

export interface Kpis {
  salesPerBay: number;
  salesPerTech: number;
  salesPerRo: number;
  laborGpPct: number;
  partsGpPct: number;
  currentRatio: number;
  cashRunwayMonths: number;
  debtToEquity: number;
  breakEvenSales: number;
  breakEvenRoCount: number;
  effectiveEfficiencyPct: number;

  // Cost mix
  laborCostPctOfSales: number;
  partsCostPctOfSales: number;
  laborPctOfCogs: number;
  partsPctOfCogs: number;

  // Shop Fix–style metrics
  billableHours: number;
  clockedHours: number;
  gsh: number;
  shopCapacity: number;
  elr: number;
  gph: number;
  techQuote: number;
  closeRatioPct: number;
  tch: number;
  roiPct: number | null;
  ohch: number;
  nph: number;
  ohPerRo: number;
  marketingPctOfSales: number;
  newCustomerPct: number;
  cac: number;
  daysToOutrunOverhead: number;
  dailyGpGoal: number;
  revenuePerBay: number;
  revenuePerEmployee: number;
  productivityPct: number;
  ebitda: number;

  // Status bands
  gpStatus: StatusBand;
  netStatus: StatusBand;
  runwayStatus: StatusBand;
  currentRatioStatus: StatusBand;
  efficiencyStatus: StatusBand;
  partsCostStatus: StatusBand;
  laborCostStatus: StatusBand;
}

export interface CalcResult {
  pnl: PnL;
  balanceSheet: BalanceSheet;
  kpis: Kpis;
  debt: DebtSchedule;
}
