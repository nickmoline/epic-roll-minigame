import { resolveRound, shouldDecreaseDie } from './diceUtils';

export function getDefaultConfig() {
  return {
    combatName: '',
    goodGuys: { name: 'Good Guys', baseDie: 12, startHP: 20, mulligans: [] },
    badGuys: { name: 'Bad Guys', baseDie: 12, startHP: 20, mulligans: [] },
    tieEvents: [],
    remainingTieEvent: { enabled: false, description: '', hpModGood: 0, hpModBad: 0 },
    roundEvents: [],
    decreasingDie: { enabled: false, threshold: 10, smallerDie: 10 },
  };
}

export function getInitialState() {
  return {
    phase: 'setup',
    config: getDefaultConfig(),
    combat: null,
    winner: null,
  };
}

function initCombat(config) {
  return {
    round: 1,
    tieCount: 0,
    goodGuys: { hp: config.goodGuys.startHP, mulligansUsed: [], currentDie: config.goodGuys.baseDie },
    badGuys: { hp: config.badGuys.startHP, mulligansUsed: [], currentDie: config.badGuys.baseDie },
    log: [{
      round: 0,
      label: 'Start',
      rollGood: null,
      rollBad: null,
      hpGood: config.goodGuys.startHP,
      hpBad: config.badGuys.startHP,
      modGood: 0,
      modBad: 0,
      notes: '',
      mulliganGood: null,
      mulliganBad: null,
      wasTie: false,
    }],
  };
}

function getTieEvent(config, tieIndex) {
  if (tieIndex < config.tieEvents.length) {
    return config.tieEvents[tieIndex];
  }
  if (config.remainingTieEvent.enabled) {
    return config.remainingTieEvent;
  }
  return null;
}

export function combatReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_CONFIG': {
      return { ...state, config: action.payload };
    }

    case 'START_COMBAT': {
      return {
        ...state,
        phase: 'combat',
        combat: initCombat(state.config),
        winner: null,
      };
    }

    case 'RESOLVE_ROUND': {
      const { rollGood, rollBad, mulliganGood, mulliganBad } = action.payload;
      const { config, combat } = state;

      const goodMull = mulliganGood !== null ? config.goodGuys.mulligans[mulliganGood] : null;
      const badMull = mulliganBad !== null ? config.badGuys.mulligans[mulliganBad] : null;

      // Apply roll bonuses from mulligans before damage calc
      let effectiveRollGood = rollGood
        + (goodMull?.rollBonusGood || 0)
        + (badMull?.rollBonusGood || 0);
      let effectiveRollBad = rollBad
        + (goodMull?.rollBonusBad || 0)
        + (badMull?.rollBonusBad || 0);

      let { hpChangeGood, hpChangeBad, isTie } = resolveRound({
        rollGood: effectiveRollGood,
        rollBad: effectiveRollBad,
        modGood: 0,
        modBad: 0,
      });

      if (goodMull?.noDamage && hpChangeGood < 0) {
        hpChangeGood = 0;
      }
      if (badMull?.noDamage && hpChangeBad < 0) {
        hpChangeBad = 0;
      }
      if (goodMull) {
        hpChangeGood += (goodMull.hpModGood || 0);
        hpChangeBad += (goodMull.hpModBad || 0);
      }
      if (badMull) {
        hpChangeGood += (badMull.hpModGood || 0);
        hpChangeBad += (badMull.hpModBad || 0);
      }

      let extraModGood = 0;
      let extraModBad = 0;
      let newTieCount = combat.tieCount;
      const autoNotes = [];

      const diff = effectiveRollGood - effectiveRollBad;
      if (diff > 0) {
        autoNotes.push(`${config.goodGuys.name} win by ${diff}`);
      } else if (diff < 0) {
        autoNotes.push(`${config.badGuys.name} win by ${Math.abs(diff)}`);
      }

      // Tie event
      if (isTie) {
        const tieEvent = getTieEvent(config, newTieCount);
        newTieCount += 1;
        if (tieEvent) {
          extraModGood += tieEvent.hpModGood;
          extraModBad += tieEvent.hpModBad;
          if (tieEvent.description) autoNotes.push(`Tie: ${tieEvent.description}`);
        } else {
          autoNotes.push('Tie');
        }
      }

      // Mulligan notes
      if (goodMull) {
        autoNotes.push(`${config.goodGuys.name} mulligan: ${goodMull.name || 'Used'}`);
      }
      if (badMull) {
        autoNotes.push(`${config.badGuys.name} mulligan: ${badMull.name || 'Used'}`);
      }

      // Round events
      const activeRoundEvents = config.roundEvents.filter((e) => e.round === combat.round);
      for (const evt of activeRoundEvents) {
        extraModGood += (evt.hpModGood || 0);
        extraModBad += (evt.hpModBad || 0);
        if (evt.description) autoNotes.push(`Round event: ${evt.description}`);
      }

      let newHpGood = Math.max(0, combat.goodGuys.hp + hpChangeGood + extraModGood);
      let newHpBad = Math.max(0, combat.badGuys.hp + hpChangeBad + extraModBad);

      const newMulligansUsedGood = mulliganGood !== null
        ? [...combat.goodGuys.mulligansUsed, mulliganGood]
        : [...combat.goodGuys.mulligansUsed];
      const newMulligansUsedBad = mulliganBad !== null
        ? [...combat.badGuys.mulligansUsed, mulliganBad]
        : [...combat.badGuys.mulligansUsed];

      let newDieGood = config.goodGuys.baseDie;
      let newDieBad = config.badGuys.baseDie;

      if (config.decreasingDie.enabled) {
        if (shouldDecreaseDie(newHpGood, config.decreasingDie.threshold)) {
          newDieGood = config.decreasingDie.smallerDie;
        }
        if (shouldDecreaseDie(newHpBad, config.decreasingDie.threshold)) {
          newDieBad = config.decreasingDie.smallerDie;
        }
      }

      const logEntry = {
        round: combat.round,
        label: String(combat.round),
        rollGood: effectiveRollGood,
        rollBad: effectiveRollBad,
        hpGood: newHpGood,
        hpBad: newHpBad,
        modGood: extraModGood,
        modBad: extraModBad,
        notes: autoNotes.join(' | '),
        mulliganGood,
        mulliganBad,
        wasTie: isTie,
      };

      let winner = null;
      if (newHpGood <= 0 && newHpBad <= 0) {
        winner = 'tie';
      } else if (newHpBad <= 0) {
        winner = 'goodGuys';
      } else if (newHpGood <= 0) {
        winner = 'badGuys';
      }

      return {
        ...state,
        phase: winner ? 'victory' : 'combat',
        combat: {
          ...combat,
          round: combat.round + 1,
          tieCount: newTieCount,
          goodGuys: { hp: newHpGood, mulligansUsed: newMulligansUsedGood, currentDie: newDieGood },
          badGuys: { hp: newHpBad, mulligansUsed: newMulligansUsedBad, currentDie: newDieBad },
          log: [...combat.log, logEntry],
        },
        winner,
      };
    }

    case 'UNDO_ROUND': {
      const { combat } = state;
      if (combat.log.length <= 1) return state;

      const newLog = combat.log.slice(0, -1);
      const lastEntry = newLog[newLog.length - 1];

      const mulligansUsedGood = newLog.filter(e => e.mulliganGood !== null).map(e => e.mulliganGood);
      const mulligansUsedBad = newLog.filter(e => e.mulliganBad !== null).map(e => e.mulliganBad);
      const tieCount = newLog.filter(e => e.wasTie).length;

      let dieGood = state.config.goodGuys.baseDie;
      let dieBad = state.config.badGuys.baseDie;
      if (state.config.decreasingDie.enabled) {
        if (shouldDecreaseDie(lastEntry.hpGood, state.config.decreasingDie.threshold)) {
          dieGood = state.config.decreasingDie.smallerDie;
        }
        if (shouldDecreaseDie(lastEntry.hpBad, state.config.decreasingDie.threshold)) {
          dieBad = state.config.decreasingDie.smallerDie;
        }
      }

      return {
        ...state,
        phase: 'combat',
        winner: null,
        combat: {
          ...combat,
          round: combat.round - 1,
          tieCount,
          goodGuys: { hp: lastEntry.hpGood, mulligansUsed: mulligansUsedGood, currentDie: dieGood },
          badGuys: { hp: lastEntry.hpBad, mulligansUsed: mulligansUsedBad, currentDie: dieBad },
          log: newLog,
        },
      };
    }

    case 'NEW_COMBAT': {
      return getInitialState();
    }

    case 'LOAD_STATE': {
      return action.payload;
    }

    default:
      return state;
  }
}
