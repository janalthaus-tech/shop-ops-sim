/**
 * Board ↔ Finance bridge (STUB — intentionally not wired up yet).
 *
 * Idea: Board sim throughput could later seed the finance model's inputs, e.g.
 *   - ROs/day  ≈ cars moved to Final per sim-day (Debrief stats)
 *   - ARO      ≈ sold GP$/labor+parts per completed RO
 * The finance model (src/finance/model) is unchanged; a future step would map
 * these into ShopInputs fields via mergeInputs() and persist to its storage key.
 */
export interface BoardThroughput {
  /** Repair orders completed per day */
  rosPerDay: number;
  /** Average repair order value, USD */
  aro: number;
}

/** Placeholder: returns a partial suggestion only; not used by the UI yet. */
export function throughputToFinanceHint(t: BoardThroughput): Record<string, number> {
  return { rosPerDay: t.rosPerDay, aro: t.aro, monthlyRevenueEstimate: t.rosPerDay * t.aro * 22 };
}
