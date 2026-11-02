/**
 * Board ↔ Finance bridge v1 (EXAMPLE / sim-scaled — training only, not shop data).
 *
 * Maps a Board debrief into a Partial<ShopInputs> "seed" for the Finance model,
 * plus a parallel BoardLeakageMetrics bag for a future leakage panel.
 *
 * Assumptions (documented, EXAMPLE):
 *  - rosPerDay: completed ROs scaled to an 8h (480 min) teaching day:
 *      completed × (480 / scenario.durationMin). Labeled sim-scaled.
 *      Omitted when completed === 0 (never seed 0).
 *  - aro: Board runs do not track RO sales $. We DO NOT treat gpSold as sales.
 *      ARO ≈ (gpSold ÷ ASSUMED_GP_PCT) ÷ completed ROs, with ASSUMED_GP_PCT = 60%.
 *      Omitted when there are no completed ROs or no GP$.
 *  - shopEfficiencyPct: mean of techHours[].efficiencyPct.
 *  - avgTechPayPerFlagHr: scenario.goals.flatRatePerFlagHr (training rate, EXAMPLE).
 *  - techCount: unique techs in techHours.
 *  - closeRatioPct: proxy = on-time answers ÷ (on-time + late) answers.
 */
import type { DebriefStats, Scenario } from './board/model/types';
import type { ShopInputs } from './finance/model/types';

export const TEACHING_DAY_MIN = 480;
export const ASSUMED_GP_PCT = 0.6;
export const BRIDGE_SEED_KEY = 'shop-ops-sim-bridge-seed-v1';

export interface BoardLeakageMetrics {
  waitersLeft: number;
  answersLate: number;
  hoursStuckPartsWip: number;
  qcRestarts: number;
  gpSold: number;
  gpTarget: number;
  /** gpSold − gpTarget (negative = short of target) */
  gpGap: number;
}

export interface BridgeSeed {
  scenarioId: string;
  scenarioTitle: string;
  pace: string;
  createdAt: string;
  seed: Partial<ShopInputs>;
  leakage: BoardLeakageMetrics;
  notes: string[];
}

function round(n: number, dp = 1): number {
  const f = 10 ** dp;
  return Math.round(n * f) / f;
}

export function boardToFinanceSeed(
  stats: DebriefStats,
  scenario: Pick<Scenario, 'durationMin' | 'goals'>,
): Partial<ShopInputs> {
  const seed: Partial<ShopInputs> = {};
  // completed === 0 (failed drill): omit rather than seed 0 over a good model.
  if (scenario.durationMin > 0 && stats.completed > 0) {
    seed.rosPerDay = round(stats.completed * (TEACHING_DAY_MIN / scenario.durationMin), 1);
  }
  if (stats.completed > 0 && (stats.gpSold ?? 0) > 0) {
    seed.aro = Math.round((stats.gpSold! / ASSUMED_GP_PCT) / stats.completed);
  }
  const effs = (stats.techHours ?? [])
    .map((t) => t.efficiencyPct)
    .filter((e): e is number => e != null && Number.isFinite(e));
  if (effs.length > 0) {
    seed.shopEfficiencyPct = round(effs.reduce((a, b) => a + b, 0) / effs.length, 1);
  }
  const rate = scenario.goals?.flatRatePerFlagHr;
  if (rate != null && rate > 0) seed.avgTechPayPerFlagHr = rate;
  const techs = new Set((stats.techHours ?? []).map((t) => t.tech));
  if (techs.size > 0) seed.techCount = techs.size;
  const onTime = stats.answersOnTime ?? 0;
  const late = stats.answersLate ?? 0;
  if (onTime + late > 0) seed.closeRatioPct = Math.round((onTime / (onTime + late)) * 100);
  return seed;
}

export function boardLeakage(stats: DebriefStats): BoardLeakageMetrics {
  const gpSold = stats.gpSold ?? 0;
  const gpTarget = stats.gpTarget ?? 0;
  return {
    waitersLeft: stats.waitersLeft ?? 0,
    answersLate: stats.answersLate ?? 0,
    hoursStuckPartsWip: round(stats.hoursStuckPartsWip ?? 0, 1),
    qcRestarts: stats.qcRestarts ?? 0,
    gpSold,
    gpTarget,
    gpGap: gpSold - gpTarget,
  };
}

export function buildBridgeSeed(
  stats: DebriefStats,
  scenario: Pick<Scenario, 'id' | 'title' | 'durationMin' | 'goals'>,
  pace: string,
): BridgeSeed {
  return {
    scenarioId: scenario.id,
    scenarioTitle: scenario.title,
    pace,
    createdAt: new Date().toISOString(),
    seed: boardToFinanceSeed(stats, scenario),
    leakage: boardLeakage(stats),
    notes: [
      `ROs/day sim-scaled to an 8h day (×${round(TEACHING_DAY_MIN / Math.max(scenario.durationMin, 1), 2)}).`,
      `ARO = GP$ sold ÷ assumed ${ASSUMED_GP_PCT * 100}% GP ÷ completed ROs (EXAMPLE; Board has no RO sales $).`,
      'Close ratio = on-time answers ÷ all answers (proxy).',
      'Tech $/flag hr = scenario training flat rate (EXAMPLE).',
    ],
  };
}

export interface SeedDiff<K extends keyof ShopInputs = keyof ShopInputs> {
  key: K;
  current: ShopInputs[K];
  seeded: ShopInputs[K];
}

/**
 * Merge a seed into current inputs. Returns the merged inputs AND the list of
 * changed fields so the UI can show seeded-vs-manual and ask for confirmation.
 * Never call this to silently overwrite — the caller must confirm first.
 */
export function mergeInputs(
  current: ShopInputs,
  seed: Partial<ShopInputs>,
): { merged: ShopInputs; changes: SeedDiff[] } {
  const merged = { ...current };
  const changes: SeedDiff[] = [];
  for (const k of Object.keys(seed) as (keyof ShopInputs)[]) {
    const v = seed[k];
    if (v === undefined) continue;
    if (current[k] !== v) changes.push({ key: k, current: current[k], seeded: v as never });
    (merged as Record<string, unknown>)[k] = v;
  }
  return { merged, changes };
}

export function saveBridgeSeed(s: BridgeSeed): void {
  try {
    sessionStorage.setItem(BRIDGE_SEED_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

export function loadBridgeSeed(): BridgeSeed | null {
  try {
    const raw = sessionStorage.getItem(BRIDGE_SEED_KEY);
    return raw ? (JSON.parse(raw) as BridgeSeed) : null;
  } catch {
    return null;
  }
}

export function clearBridgeSeed(): void {
  try {
    sessionStorage.removeItem(BRIDGE_SEED_KEY);
  } catch {
    /* ignore */
  }
}
