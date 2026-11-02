import type { BalanceSheet, CalcResult, DebtSchedule, Kpis, PnL, ShopInputs, StatusBand } from './types';
import { calcDebt, withDscr } from './debt';

/**
 * Pure monthly P&L + balance sheet + KPI engine.
 *
 * Model notes (flag-hour linked tech payroll):
 * - Monthly ROs = rosPerDay × workingDaysPerMonth
 * - Monthly sales = ROs × ARO
 * - Labor / parts sales split by mix %
 * - Flag hours ≈ laborSales / effectiveLaborRate
 *   (efficiency is tracked as KPI / capacity check; tech pay uses billed flag hours)
 * - Tech payroll = flagHours × avgTechPayPerFlagHr
 * - Parts COGS = partsSales × partsCostPct
 * - Sublet & supplies as % of total sales (parts cost bucket for cost-% KPIs)
 * - OpEx = total payroll (w/ tax & benefits) + overhead
 * - Waterfall: GP − OpEx = EBITDA → −D&A = EBIT → −interest = EBT → −tax = NI
 * - Interest = manual interestMonthly + month-1 interest on senior debt + seller note
 * - BS (one month, opening AR/AP assumed 0):
 *   opening equity = openingCash + inventory + equipment − all opening debt
 *   closing cash = opening + NI + D&A − ΔAR + ΔAP − principal − distributions
 *   closing equity = opening equity + NI − distributions; imbalance should be ≈ 0
 */
export function calculate(inputs: ShopInputs): CalcResult {
  const debtBase = calcDebt(inputs);
  const pnl = calcPnL(inputs, debtBase);
  const debt = withDscr(debtBase, pnl.ebitda);
  const balanceSheet = calcBalanceSheet(inputs, pnl, debt);
  const kpis = calcKpis(inputs, pnl, balanceSheet);
  return { pnl, balanceSheet, kpis, debt };
}

export function calcPnL(inputs: ShopInputs, debt: DebtSchedule = calcDebt(inputs)): PnL {
  const partsMix = clampPct(inputs.partsMixPct) / 100;
  const laborMix = clampPct(inputs.laborMixPct) / 100;
  const mixSum = partsMix + laborMix;
  const partsShare = mixSum > 0 ? partsMix / mixSum : 0.45;
  const laborShare = mixSum > 0 ? laborMix / mixSum : 0.55;

  const rosPerMonth = inputs.rosPerDay * inputs.workingDaysPerMonth;
  const monthlySales = rosPerMonth * inputs.aro;
  const laborSales = monthlySales * laborShare;
  const partsSales = monthlySales * partsShare;

  const rate = Math.max(inputs.effectiveLaborRate, 0.01);
  const flagHours = laborSales / rate;

  const techPayroll = flagHours * inputs.avgTechPayPerFlagHr;
  const advisorPayroll = inputs.advisorCount * inputs.advisorSalaryMonthly;
  const managerPayroll = inputs.managerSalaryMonthly;
  const basePayroll = techPayroll + advisorPayroll + managerPayroll;
  const payrollTaxes = basePayroll * (clampPct(inputs.payrollTaxPct) / 100);
  const benefits = basePayroll * (clampPct(inputs.benefitsPctOfPayroll) / 100);
  const totalPayroll = basePayroll + payrollTaxes + benefits;

  const partsCogs = partsSales * (clampPct(inputs.partsCostPctOfPartsSales) / 100);
  const sublet = monthlySales * (clampPct(inputs.subletPctOfSales) / 100);
  const shopSupplies = monthlySales * (clampPct(inputs.shopSuppliesPctOfSales) / 100);
  const partsBucketCogs = partsCogs + sublet + shopSupplies;
  const totalCogs = partsBucketCogs + techPayroll;

  const grossProfit = monthlySales - totalCogs;
  const grossProfitPct = monthlySales > 0 ? (grossProfit / monthlySales) * 100 : 0;

  const laborGrossProfit = laborSales - techPayroll;
  const partsGrossProfit = partsSales - partsCogs;

  const overhead =
    inputs.rent +
    inputs.utilities +
    inputs.insurance +
    inputs.software +
    inputs.marketing +
    inputs.training +
    inputs.misc;

  const opExPayroll = advisorPayroll + managerPayroll + payrollTaxes + benefits;
  const cleanOpEx = opExPayroll + overhead;

  const ebitda = grossProfit - cleanOpEx;
  const operatingIncome = ebitda;
  const depreciation = Math.max(inputs.depreciationMonthly ?? 0, 0);
  const ebit = ebitda - depreciation;
  const interest = debt.totalInterest;
  const ebt = ebit - interest;
  const incomeTax = ebt > 0 ? ebt * (clampPct(inputs.incomeTaxPct) / 100) : 0;
  const netIncome = ebt - incomeTax;
  const netMarginPct = monthlySales > 0 ? (netIncome / monthlySales) * 100 : 0;

  const laborSalesPctOfSales = monthlySales > 0 ? (laborSales / monthlySales) * 100 : 0;
  const partsSalesPctOfSales = monthlySales > 0 ? (partsSales / monthlySales) * 100 : 0;
  const laborCostPctOfSales = monthlySales > 0 ? (techPayroll / monthlySales) * 100 : 0;
  const partsCostPctOfSales = monthlySales > 0 ? (partsBucketCogs / monthlySales) * 100 : 0;
  const laborPctOfCogs = totalCogs > 0 ? (techPayroll / totalCogs) * 100 : 0;
  const partsPctOfCogs = totalCogs > 0 ? (partsBucketCogs / totalCogs) * 100 : 0;
  const subletPctOfCogs = totalCogs > 0 ? (sublet / totalCogs) * 100 : 0;
  const suppliesPctOfCogs = totalCogs > 0 ? (shopSupplies / totalCogs) * 100 : 0;

  return {
    rosPerMonth,
    monthlySales,
    laborSales,
    partsSales,
    flagHours,
    techPayroll,
    advisorPayroll,
    managerPayroll,
    basePayroll,
    payrollTaxes,
    benefits,
    totalPayroll,
    partsCogs,
    sublet,
    shopSupplies,
    partsBucketCogs,
    totalCogs,
    grossProfit,
    grossProfitPct,
    laborGrossProfit,
    partsGrossProfit,
    overhead,
    totalOpEx: cleanOpEx,
    operatingIncome,
    ebitda,
    depreciation,
    ebit,
    interest,
    ebt,
    incomeTax,
    netIncome,
    netMarginPct,
    laborSalesPctOfSales,
    partsSalesPctOfSales,
    laborCostPctOfSales,
    partsCostPctOfSales,
    laborPctOfCogs,
    partsPctOfCogs,
    subletPctOfCogs,
    suppliesPctOfCogs,
  };
}

export function calcBalanceSheet(inputs: ShopInputs, pnl: PnL, debtSched: DebtSchedule = calcDebt(inputs)): BalanceSheet {
  const ar = pnl.monthlySales * (Math.max(inputs.arDays, 0) / 30);
  const purchases = pnl.partsCogs + pnl.sublet;
  const ap = purchases * (Math.max(inputs.apDays, 0) / 30);
  const inventory = Math.max(inputs.inventoryParts, 0);
  const openingEquipment = Math.max(inputs.equipmentNet, 0);
  const equipmentNet = openingEquipment - pnl.depreciation;
  const openingCash = inputs.openingCash;
  const openingDebt =
    Math.max(inputs.debt, 0) +
    Math.max(inputs.seniorDebtPrincipal ?? 0, 0) +
    Math.max(inputs.sellerNotePrincipal ?? 0, 0);
  const goodwill = Math.max(inputs.goodwill ?? 0, 0);
  // Opening equity is a plug: opening assets − opening debt (ownerCashInvested is informational only).
  const openingEquity = openingCash + inventory + openingEquipment + goodwill - openingDebt;

  const distributions = Math.max(inputs.distributionsMonthly ?? 0, 0);
  const principalRepaid = debtSched.totalPrincipal;
  const workingCapitalChange = ar - ap; // opening AR/AP assumed 0
  const cash =
    openingCash + pnl.netIncome + pnl.depreciation - workingCapitalChange - principalRepaid - distributions;
  const totalAssets = cash + ar + inventory + equipmentNet + goodwill;
  const debt = openingDebt - principalRepaid;
  const totalLiabilities = ap + debt;
  const equity = openingEquity + pnl.netIncome - distributions;
  const imbalance = totalAssets - totalLiabilities - equity;

  return {
    cash,
    ar,
    inventory,
    equipmentNet,
    goodwill,
    totalAssets,
    ap,
    debt,
    totalLiabilities,
    equity,
    impliedCashAfterMonth: cash,
    openingEquity,
    distributions,
    principalRepaid,
    workingCapitalChange,
    imbalance,
  };
}

export function calcKpis(
  inputs: ShopInputs,
  pnl: PnL,
  bs: BalanceSheet,
): Kpis {
  const salesPerBay = inputs.bayCount > 0 ? pnl.monthlySales / inputs.bayCount : 0;
  const salesPerTech = inputs.techCount > 0 ? pnl.monthlySales / inputs.techCount : 0;
  const salesPerRo = inputs.aro;

  const laborGpPct =
    pnl.laborSales > 0 ? (pnl.laborGrossProfit / pnl.laborSales) * 100 : 0;
  const partsGpPct =
    pnl.partsSales > 0 ? (pnl.partsGrossProfit / pnl.partsSales) * 100 : 0;

  const currentAssets = bs.cash + bs.ar + bs.inventory;
  const currentLiabilities = Math.max(bs.ap, 0.01);
  const currentRatio = currentAssets / currentLiabilities;

  const monthlyOpex = pnl.totalOpEx + pnl.techPayroll;
  const cashRunwayMonths =
    monthlyOpex > 0 ? bs.impliedCashAfterMonth / monthlyOpex : Infinity;

  const debtToEquity =
    Math.abs(bs.equity) > 0.01 ? bs.debt / bs.equity : bs.debt > 0 ? Infinity : 0;

  const cogsRatio = pnl.monthlySales > 0 ? pnl.totalCogs / pnl.monthlySales : 1;
  const contributionMargin = 1 - cogsRatio;
  const breakEvenSales =
    contributionMargin > 0.01 ? pnl.totalOpEx / contributionMargin : Infinity;
  const breakEvenRoCount =
    inputs.aro > 0 && Number.isFinite(breakEvenSales)
      ? breakEvenSales / inputs.aro
      : Infinity;

  const effectiveEfficiencyPct = clampPct(inputs.shopEfficiencyPct);
  const billableHours = Math.max(pnl.flagHours, 0);
  const clockedHours =
    effectiveEfficiencyPct > 0
      ? billableHours / (effectiveEfficiencyPct / 100)
      : 0;

  const gsh = billableHours > 0 ? pnl.monthlySales / billableHours : 0;
  const shopCapacity =
    8 * Math.max(inputs.bayCount, 0) * gsh * Math.max(inputs.workingDaysPerMonth, 0);
  const elr = billableHours > 0 ? pnl.laborSales / billableHours : inputs.effectiveLaborRate;
  const gph = billableHours > 0 ? pnl.grossProfit / billableHours : 0;

  const multiplier = Math.max(inputs.techQuoteMultiplier ?? 2, 0);
  const techQuote = inputs.aro * multiplier;
  const closeRatioPct = clampPct(inputs.closeRatioPct ?? 50);

  const tch = billableHours > 0 ? pnl.techPayroll / billableHours : 0;
  const investment = Math.max(inputs.investmentCost ?? 0, 0);
  const roiPct = investment > 0 ? (pnl.grossProfit / investment) * 100 : null;
  const ohch = billableHours > 0 ? pnl.overhead / billableHours : 0;
  const nph = billableHours > 0 ? pnl.netIncome / billableHours : 0;
  const ohPerRo = pnl.rosPerMonth > 0 ? pnl.overhead / pnl.rosPerMonth : 0;
  const marketingPctOfSales =
    pnl.monthlySales > 0 ? (inputs.marketing / pnl.monthlySales) * 100 : 0;
  const newCustomerPct = clampPct(inputs.newCustomerPct ?? 30);
  const newCustomers = pnl.rosPerMonth * (newCustomerPct / 100);
  const cac = newCustomers > 0 ? inputs.marketing / newCustomers : 0;

  const dailyGp =
    inputs.workingDaysPerMonth > 0
      ? pnl.grossProfit / inputs.workingDaysPerMonth
      : 0;
  const daysToOutrunOverhead = dailyGp > 0 ? pnl.overhead / dailyGp : Infinity;
  const dailyGpGoal = pnl.overhead / 15;

  const managerHeadcount = inputs.managerSalaryMonthly > 0 ? 1 : 0;
  const employeeCount =
    Math.max(inputs.techCount, 0) + Math.max(inputs.advisorCount, 0) + managerHeadcount;
  const revenuePerEmployee =
    employeeCount > 0 ? pnl.monthlySales / employeeCount : 0;
  const productivityPct = effectiveEfficiencyPct;

  const ebitda = pnl.ebitda;

  // Heuristic status bands (illustrative — not advice)
  const gpStatus: StatusBand =
    pnl.grossProfitPct >= 60 ? 'green' : pnl.grossProfitPct >= 50 ? 'amber' : 'red';
  const netStatus: StatusBand =
    pnl.netMarginPct >= 20 ? 'green' : pnl.netMarginPct >= 10 ? 'amber' : 'red';
  const runwayStatus: StatusBand =
    cashRunwayMonths >= 3 ? 'green' : cashRunwayMonths >= 1.5 ? 'amber' : 'red';
  const currentRatioStatus: StatusBand =
    currentRatio >= 1.5 ? 'green' : currentRatio >= 1.0 ? 'amber' : 'red';
  const efficiencyStatus: StatusBand =
    effectiveEfficiencyPct >= 90
      ? 'green'
      : effectiveEfficiencyPct >= 80
        ? 'amber'
        : 'red';
  const partsCostStatus: StatusBand =
    pnl.partsCostPctOfSales <= 25
      ? 'green'
      : pnl.partsCostPctOfSales <= 30
        ? 'amber'
        : 'red';
  const laborCostStatus: StatusBand =
    pnl.laborCostPctOfSales <= 15
      ? 'green'
      : pnl.laborCostPctOfSales <= 20
        ? 'amber'
        : 'red';

  return {
    salesPerBay,
    salesPerTech,
    salesPerRo,
    laborGpPct,
    partsGpPct,
    currentRatio,
    cashRunwayMonths: Number.isFinite(cashRunwayMonths) ? cashRunwayMonths : 999,
    debtToEquity: Number.isFinite(debtToEquity) ? debtToEquity : 999,
    breakEvenSales: Number.isFinite(breakEvenSales) ? breakEvenSales : 0,
    breakEvenRoCount: Number.isFinite(breakEvenRoCount) ? breakEvenRoCount : 0,
    effectiveEfficiencyPct,
    laborCostPctOfSales: pnl.laborCostPctOfSales,
    partsCostPctOfSales: pnl.partsCostPctOfSales,
    laborPctOfCogs: pnl.laborPctOfCogs,
    partsPctOfCogs: pnl.partsPctOfCogs,
    billableHours,
    clockedHours,
    gsh,
    shopCapacity,
    elr,
    gph,
    techQuote,
    closeRatioPct,
    tch,
    roiPct,
    ohch,
    nph,
    ohPerRo,
    marketingPctOfSales,
    newCustomerPct,
    cac,
    daysToOutrunOverhead: Number.isFinite(daysToOutrunOverhead)
      ? daysToOutrunOverhead
      : 999,
    dailyGpGoal,
    revenuePerBay: salesPerBay,
    revenuePerEmployee,
    productivityPct,
    ebitda,
    gpStatus,
    netStatus,
    runwayStatus,
    currentRatioStatus,
    efficiencyStatus,
    partsCostStatus,
    laborCostStatus,
  };
}

function clampPct(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(Math.max(n, 0), 100);
}
