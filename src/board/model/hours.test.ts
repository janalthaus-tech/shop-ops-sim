import { describe, expect, it } from 'vitest';
import { SCENARIOS } from './scenarios';
import { startScenario } from './engine';
import { moveJob } from './board';
import { isSpeedZone, wipLevel } from './types';

describe('quoted vs sold hours', () => {
  it('no unsold speed-zone seed shows soldHours', () => {
    for (const s of SCENARIOS) {
      const { board } = startScenario(s);
      for (const j of board.jobs) {
        if (isSpeedZone(j.column) && j.answerDeliveredAtSimMin == null) {
          expect(j.soldHours ?? 0).toBe(0);
        }
      }
    }
  });
  it('moving to approval promotes quoted → sold', () => {
    const s = SCENARIOS.find((sc) => startScenario(sc).board.jobs.some((j) => j.quotedHours));
    if (!s) return;
    const { board } = startScenario(s);
    const job = board.jobs.find((j) => j.quotedHours)!;
    const moved = moveJob(board, job.id, 'approval', 5).jobs.find((j) => j.id === job.id)!;
    expect(moved.soldHours).toBe(job.quotedHours);
  });
  it('wip levels', () => {
    expect(wipLevel(2, 3)).toBe('ok');
    expect(wipLevel(3, 3)).toBe('amber');
    expect(wipLevel(5, 3)).toBe('red');
  });
});
