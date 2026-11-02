import type { ShopInputs } from './types';

const EXTRA_DEFAULTS = {
  doorRate: 0,
  techQuoteMultiplier: 2,
  closeRatioPct: 50,
  newCustomerPct: 30,
  investmentCost: 0,
  interestMonthly: 0,
  depreciationMonthly: 0,
} as const;

/** Starter 6-bay Michigan-style independent shop (illustrative). */
export const STARTER_6_BAY: ShopInputs = {
  bayCount: 6,
  techCount: 5,
  advisorCount: 2,
  workingDaysPerMonth: 21,
  rosPerDay: 12,
  aro: 450,
  partsMixPct: 45,
  laborMixPct: 55,
  effectiveLaborRate: 145,
  shopEfficiencyPct: 85,
  ...EXTRA_DEFAULTS,

  partsCostPctOfPartsSales: 55,
  subletPctOfSales: 4,
  shopSuppliesPctOfSales: 1.5,

  avgTechPayPerFlagHr: 32,
  advisorSalaryMonthly: 4500,
  managerSalaryMonthly: 6500,
  payrollTaxPct: 12,
  benefitsPctOfPayroll: 8,

  rent: 6500,
  utilities: 1800,
  insurance: 2200,
  software: 450,
  marketing: 1200,
  training: 300,
  misc: 800,

  openingCash: 45000,
  arDays: 12,
  inventoryParts: 35000,
  equipmentNet: 85000,
  apDays: 28,
  debt: 40000,

  incomeTaxPct: 0,
};

/** Busy 8-bay with higher volume and staffing. */
export const BUSY_8_BAY: ShopInputs = {
  bayCount: 8,
  techCount: 7,
  advisorCount: 3,
  workingDaysPerMonth: 22,
  rosPerDay: 18,
  aro: 475,
  partsMixPct: 48,
  laborMixPct: 52,
  effectiveLaborRate: 155,
  shopEfficiencyPct: 92,
  ...EXTRA_DEFAULTS,

  partsCostPctOfPartsSales: 52,
  subletPctOfSales: 3.5,
  shopSuppliesPctOfSales: 1.2,

  avgTechPayPerFlagHr: 34,
  advisorSalaryMonthly: 4800,
  managerSalaryMonthly: 7500,
  payrollTaxPct: 12,
  benefitsPctOfPayroll: 10,

  rent: 8500,
  utilities: 2400,
  insurance: 2800,
  software: 550,
  marketing: 2000,
  training: 500,
  misc: 1000,

  openingCash: 75000,
  arDays: 10,
  inventoryParts: 55000,
  equipmentNet: 120000,
  apDays: 25,
  debt: 55000,

  incomeTaxPct: 0,
};

export const DEFAULT_INPUTS: ShopInputs = { ...STARTER_6_BAY };

export const STORAGE_KEY = 'shop-financial-sim-inputs-v1';

/** Merge partial/legacy localStorage with current defaults so old saves don't crash. */
export function mergeInputs(partial: Partial<ShopInputs> | null | undefined): ShopInputs {
  return { ...DEFAULT_INPUTS, ...(partial ?? {}) };
}
