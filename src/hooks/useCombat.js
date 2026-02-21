import { useReducer, useEffect, useCallback, useState } from 'react';
import { combatReducer, getInitialState, getDefaultConfig } from '../combatReducer';

const STORAGE_KEY = 'epic-combat-rolloff-state';
const PRESETS_KEY = 'epic-combat-rolloff-presets';

function migrateMulligan(m) {
  return {
    name: m.name || '',
    noDamage: m.noDamage || false,
    hpModGood: m.hpModGood || 0,
    hpModBad: m.hpModBad || 0,
    rollBonusGood: m.rollBonusGood || m.rollBonus || 0,
    rollBonusBad: m.rollBonusBad || 0,
    swapDieGood: m.swapDieGood || 0,
    swapDieBad: m.swapDieBad || 0,
  };
}

function migrateGroup(group) {
  if (typeof group.mulligans === 'number') {
    const count = group.mulligans;
    group.mulligans = Array.from({ length: count }, (_, i) => migrateMulligan({
      name: `Mulligan ${i + 1}`,
    }));
  }
  if (!Array.isArray(group.mulligans)) {
    group.mulligans = [];
  }
  group.mulligans = group.mulligans.map(migrateMulligan);
  return group;
}

function migrateConfig(config) {
  const defaults = getDefaultConfig();
  const migrated = { ...defaults, ...config };
  if (typeof migrated.combatName === 'undefined') migrated.combatName = '';

  migrated.goodGuys = migrateGroup({ ...defaults.goodGuys, ...migrated.goodGuys });
  migrated.badGuys = migrateGroup({ ...defaults.badGuys, ...migrated.badGuys });

  if (config.tieEvent && !config.tieEvents) {
    if (config.tieEvent.enabled) {
      migrated.tieEvents = [{
        description: config.tieEvent.description || '',
        hpModGood: config.tieEvent.hpModGood || 0,
        hpModBad: config.tieEvent.hpModBad || 0,
      }];
    } else {
      migrated.tieEvents = [];
    }
    migrated.remainingTieEvent = defaults.remainingTieEvent;
  }
  delete migrated.tieEvent;

  if (!Array.isArray(migrated.tieEvents)) migrated.tieEvents = [];
  if (!Array.isArray(migrated.roundEvents)) migrated.roundEvents = [];
  if (!migrated.remainingTieEvent) migrated.remainingTieEvent = defaults.remainingTieEvent;

  return migrated;
}

function migrateCombat(combat) {
  if (!combat) return combat;
  for (const side of ['goodGuys', 'badGuys']) {
    if (typeof combat[side]?.mulligansUsed === 'number') {
      combat[side].mulligansUsed = [];
    }
    if (!Array.isArray(combat[side]?.mulligansUsed)) {
      combat[side].mulligansUsed = [];
    }
  }
  if (typeof combat.tieCount === 'undefined') {
    combat.tieCount = 0;
  }
  return combat;
}

function loadSavedState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.phase && parsed.config) {
        parsed.config = migrateConfig(parsed.config);
        parsed.combat = migrateCombat(parsed.combat);
        return parsed;
      }
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
  return null;
}

function loadPresets() {
  try {
    const saved = localStorage.getItem(PRESETS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed.map((p) => ({ ...p, config: migrateConfig(p.config) }));
    }
  } catch { /* ignore */ }
  return [];
}

function savePresetsToStorage(presets) {
  localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
}

export function useCombat() {
  const saved = loadSavedState();
  const [state, dispatch] = useReducer(combatReducer, saved || getInitialState());
  const [presets, setPresets] = useState(loadPresets);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const updateConfig = useCallback((config) => {
    dispatch({ type: 'UPDATE_CONFIG', payload: config });
  }, []);

  const startCombat = useCallback(() => {
    dispatch({ type: 'START_COMBAT' });
  }, []);

  const resolveRound = useCallback((payload) => {
    dispatch({ type: 'RESOLVE_ROUND', payload });
  }, []);

  const undoRound = useCallback(() => {
    dispatch({ type: 'UNDO_ROUND' });
  }, []);

  const newCombat = useCallback(() => {
    dispatch({ type: 'NEW_COMBAT' });
  }, []);

  const savePreset = useCallback((config) => {
    const name = config.combatName || 'Untitled Combat';
    const preset = { id: Date.now(), name, config: { ...config }, savedAt: new Date().toISOString() };
    setPresets((prev) => {
      const next = [...prev, preset];
      savePresetsToStorage(next);
      return next;
    });
  }, []);

  const loadPreset = useCallback((presetId) => {
    const preset = presets.find((p) => p.id === presetId);
    if (preset) {
      dispatch({ type: 'UPDATE_CONFIG', payload: migrateConfig({ ...preset.config }) });
    }
  }, [presets]);

  const deletePreset = useCallback((presetId) => {
    setPresets((prev) => {
      const next = prev.filter((p) => p.id !== presetId);
      savePresetsToStorage(next);
      return next;
    });
  }, []);

  return {
    state,
    updateConfig,
    startCombat,
    resolveRound,
    undoRound,
    newCombat,
    presets,
    savePreset,
    loadPreset,
    deletePreset,
  };
}
