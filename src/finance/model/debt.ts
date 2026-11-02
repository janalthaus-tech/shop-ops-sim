import type { DebtSchedule, DscrBand, ShopInputs } from './types';

/** DSCR bands: ≥1.35 green/pass (ownership target), ≥1.25 amber/warn (typical lender floor), else fail. */
export const DSCR_PASS = 1.35;
export const DSCR_FLOOR = 1.25;

/** Standard amortizing monthly payment. */
export function monthlyPayment(principal: number, ratePct: number, termYears: number): number {
  const p = Math.max(principal, 0);
  const n = Math.round(Math.max(termYears, 0) * 12);
  if (p <= 0 || n <= 0) return 0;
  const r = Math.max(ratePct, 0) / 100 / 12;
  if (r === 0) return p / n;
  return (p * r) / (1 - Math.pow(1 + r, -n));
}

function firstMonth(principal: number, ratePct: number, termYears: number) {
  const payment = monthlyPayment(principal, ratePct, termYears);
  const interest = payment > 0 ? Math.max(principal, 0) * (Math.max(ratePct, 0) / 100 / 12) : 0;
  return { payment, interest, principal: payment - interest };
}

export function dscrBand(dscr: number | null): DscrBand {
  if (dscr == null) return 'n/a';
  if (dscr >= DSCR_PASS) return 'pass';
  if (dscr >= DSCR_FLOOR) return 'warn';
  return 'fail';
}

/** Month-1 debt schedule (DSCR filled by withDscr once EBITDA is known). */
export function calcDebt(inputs: ShopInputs): DebtSchedule {
  const s = firstMonth(inputs.seniorDebtPrincipal ?? 0, inputs.seniorDebtRatePct ?? 0, inputs.seniorDebtTermYears ?? 0);
  const n = firstMonth(inputs.sellerNotePrincipal ?? 0, inputs.sellerNoteRatePct ?? 0, inputs.sellerNoteTermYears ?? 0);
  const otherInterest = Math.max(inputs.interestMonthly ?? 0, 0);
  const monthlyDebtService = s.payment + n.payment + otherInterest;
  return {
    seniorPayment: s.payment,
    sellerPayment: n.payment,
    seniorInterest: s.interest,
    sellerInterest: n.interest,
    seniorPrincipal: s.principal,
    sellerPrincipal: n.principal,
    otherInterest,
    totalInterest: s.interest + n.interest + otherInterest,
    totalPrincipal: s.principal + n.principal,
    monthlyDebtService,
    annualDebtService: monthlyDebtService * 12,
    dscr: null,
    dscrBand: 'n/a',
    sbaAvailable: Boolean(inputs.sbaAvailable),
  };
}

export function withDscr(d: DebtSchedule, monthlyEbitda: number): DebtSchedule {
  const dscr = d.annualDebtService > 0 ? (monthlyEbitda * 12) / d.annualDebtService : null;
  return { ...d, dscr, dscrBand: dscrBand(dscr) };
}
