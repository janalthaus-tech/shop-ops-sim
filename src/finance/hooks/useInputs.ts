import { useCallback, useEffect, useMemo, useState } from 'react';
import { calculate } from '../model/calc';
import {
  BUSY_8_BAY,
  DEFAULT_INPUTS,
  mergeInputs,
  STARTER_6_BAY,
  STORAGE_KEY,
} from '../model/defaults';
import type { ShopInputs } from '../model/types';

function loadInputs(): ShopInputs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_INPUTS };
    const parsed = JSON.parse(raw) as Partial<ShopInputs>;
    // Merge so legacy localStorage (missing new keys) never crashes the calc engine.
    return mergeInputs(parsed);
  } catch {
    return { ...DEFAULT_INPUTS };
  }
}

export function useInputs() {
  const [inputs, setInputs] = useState<ShopInputs>(loadInputs);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
  }, [inputs]);

  const setField = useCallback(<K extends keyof ShopInputs>(key: K, value: ShopInputs[K]) => {
    setInputs((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'partsMixPct' && typeof value === 'number') {
        next.laborMixPct = Math.max(0, 100 - value);
      }
      if (key === 'laborMixPct' && typeof value === 'number') {
        next.partsMixPct = Math.max(0, 100 - value);
      }
      return next;
    });
  }, []);

  const resetDefaults = useCallback(() => {
    setInputs({ ...DEFAULT_INPUTS });
  }, []);

  const applyStarter = useCallback(() => {
    setInputs({ ...STARTER_6_BAY });
  }, []);

  const applyBusy = useCallback(() => {
    setInputs({ ...BUSY_8_BAY });
  }, []);

  const result = useMemo(() => calculate(inputs), [inputs]);

  return {
    inputs,
    setField,
    resetDefaults,
    applyStarter,
    applyBusy,
    result,
  };
}
