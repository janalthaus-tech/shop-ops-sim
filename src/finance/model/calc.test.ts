import { describe, expect, it } from 'vitest';
import { calculate } from './calc';
import { monthlyPayment } from './debt';
import { ACQUISITION_EXAMPLE_LEASED, BUSY_8_BAY, STARTER_6_BAY } from './defaults';
import type { ShopInputs } from './types';

const presets: [string, ShopInputs][] = [
  ['STARTER_6_BAY', STARTER_6_BAY],
  ['BUSY_8_BAY', BUSY_8_BAY],
  ['ACQUISITION_EXAMPLE_LEASED', ACQUISITION_EXAMPLE_LEASED],
];

describe.each(presets)('%s', (_name, preset) => {
  const withCharges: ShopInputs = { ...preset, interestMonthly: 400, depreciationMonthly: 1200, incomeTaxPct: 21, distributionsMonthly: 2000 };

  it('EBITDA rebuilds from P&L waterfall', () => {
    const { pnl, kpis } = calculate(withCharges);
    expect(pnl.ebitda).toBeCloseTo(pnl.grossProfit - pnl.totalOpEx, 6);
    expect(pnl.ebit).toBeCloseTo(pnl.ebitda - pnl.depreciation, 6);
    expect(pnl.ebt).toBeCloseTo(pnl.ebit - pnl.interest, 6);
    expect(pnl.netIncome).toBeCloseTo(pnl.ebt - pnl.incomeTax, 6);
    expect(kpis.ebitda).toBeCloseTo(pnl.netIncome + pnl.incomeTax + pnl.interest + pnl.depreciation, 6);
  });

  it('interest + D&A reduce NI but not EBITDA', () => {
    const base = calculate({ ...preset, interestMonthly: 0, depreciationMonthly: 0 });
    const loaded = calculate(withCharges);
    expect(loaded.pnl.ebitda).toBeCloseTo(base.pnl.ebitda, 6);
    expect(loaded.pnl.netIncome).toBeLessThan(base.pnl.netIncome);
  });

  it('balance sheet balances and cash rolls forward', () => {
    const { pnl, balanceSheet: bs } = calculate(withCharges);
    expect(Math.abs(bs.imbalance)).toBeLessThan(0.01);
    expect(bs.equity).toBeCloseTo(bs.openingEquity + pnl.netIncome - bs.distributions, 6);
    expect(bs.cash).not.toBeCloseTo(withCharges.openingCash, 0);
  });
});

describe('debt', () => {
  it('amortizing payment formula', () => {
    expect(monthlyPayment(120000, 0, 10)).toBeCloseTo(1000, 6);
    expect(monthlyPayment(283000, 9.5, 7)).toBeCloseTo(4625, -1);
  });
  it('acquisition example: ~$2.4M sales, SBA off, DSCR computed', () => {
    const r = calculate(ACQUISITION_EXAMPLE_LEASED);
    expect(r.pnl.monthlySales * 12).toBeGreaterThan(2_390_000);
    expect(r.pnl.monthlySales * 12).toBeLessThan(2_410_000);
    expect(r.debt.sbaAvailable).toBe(false);
    expect(r.debt.dscr).not.toBeNull();
    expect(['pass', 'warn', 'fail']).toContain(r.debt.dscrBand);
  });
  it('no debt → DSCR n/a', () => {
    expect(calculate(STARTER_6_BAY).debt.dscrBand).toBe('n/a');
  });
});

describe('acquisition EXAMPLE lock', () => {
  it('DSCR ≈ 2.78 and pass band; BS split + goodwill balances', () => {
    const r = calculate(ACQUISITION_EXAMPLE_LEASED);
    expect(r.debt.dscr!).toBeGreaterThan(2.7);
    expect(r.debt.dscr!).toBeLessThan(2.86);
    expect(r.debt.dscrBand).toBe('pass');
    expect(r.pnl.ebitda / r.pnl.monthlySales).toBeCloseTo(0.122, 2);
    expect(ACQUISITION_EXAMPLE_LEASED.misc).toBeLessThanOrEqual(12000);
    expect(r.balanceSheet.goodwill).toBe(420000);
    expect(Math.abs(r.balanceSheet.imbalance)).toBeLessThan(0.01);
  });
});
