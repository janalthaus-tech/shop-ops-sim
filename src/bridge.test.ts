import { describe, expect, it } from 'vitest';
import { ASSUMED_GP_PCT, boardLeakage, boardToFinanceSeed, mergeInputs } from './bridge';
import { STARTER_6_BAY } from './finance/model/defaults';
import type { DebriefStats } from './board/model/types';

const stats: DebriefStats = {
  completed: 3, inProcess: 2, blockersHit: 1, urgentHandled: 1, score: 70, maxScore: 100, grade: 'B', notes: [],
  waitersLeft: 1, hoursStuckPartsWip: 2.25, qcRestarts: 1, answersOnTime: 3, answersLate: 1,
  gpSold: 1800, gpCompleted: 1245, gpTarget: 2400,
  techHours: [
    { tech: 'A', hours: 6, goal: 8, efficiencyPct: 80 },
    { tech: 'B', hours: 4, goal: 8, efficiencyPct: 60 },
  ],
};

describe('bridge', () => {
  it('seeds sim-scaled finance inputs', () => {
    const s = boardToFinanceSeed(stats, { durationMin: 240, goals: { techHoursPerDay: 8, gpSoldTarget: 2400, flatRatePerFlagHr: 50 } });
    expect(s.rosPerDay).toBe(6);
    expect(s.aro).toBe(1000); // gpCompleted 1245 / 0.415 / 3 (gpSold ignored)
    expect(s.shopEfficiencyPct).toBe(70);
    expect(s.avgTechPayPerFlagHr).toBe(50);
    expect(s.techCount).toBe(2);
    expect(s.closeRatioPct).toBe(75);
  });
  it('omits rosPerDay and aro when completed === 0', () => {
    const s = boardToFinanceSeed({ ...stats, completed: 0 }, { durationMin: 240, goals: { techHoursPerDay: 8, gpSoldTarget: 2400, flatRatePerFlagHr: 50 } });
    expect('rosPerDay' in s).toBe(false);
    expect('aro' in s).toBe(false);
    const { merged } = mergeInputs(STARTER_6_BAY, s);
    expect(merged.rosPerDay).toBe(STARTER_6_BAY.rosPerDay);
  });

  it('omits aro when gpSold > 0 but completed === 0', () => {
    const s = boardToFinanceSeed({ ...stats, completed: 0, gpSold: 5000, gpCompleted: 0 }, { durationMin: 240, goals: { techHoursPerDay: 8, gpSoldTarget: 2400, flatRatePerFlagHr: 50 } });
    expect(s.aro).toBeUndefined();
    expect(s.rosPerDay).toBeUndefined();
  });

  it('ARO uses completed-only GP$ and the stated GP%', () => {
    const sc = { durationMin: 240, goals: { techHoursPerDay: 8, gpSoldTarget: 2400, flatRatePerFlagHr: 50 } };
    const st = { ...stats, completed: 2, gpSold: 9999, gpCompleted: 830 };
    expect(boardToFinanceSeed(st, sc).aro).toBe(Math.round(830 / ASSUMED_GP_PCT / 2));
    expect(boardToFinanceSeed(st, sc, 0.5).aro).toBe(830);
    expect(ASSUMED_GP_PCT).toBe(0.415);
  });

  it('leakage + merge reports changes', () => {
    expect(boardLeakage(stats).gpGap).toBe(-600);
    const { merged, changes } = mergeInputs(STARTER_6_BAY, { techCount: 2, bayCount: STARTER_6_BAY.bayCount });
    expect(merged.techCount).toBe(2);
    expect(changes.map((c) => c.key)).toEqual(['techCount']);
  });
});
