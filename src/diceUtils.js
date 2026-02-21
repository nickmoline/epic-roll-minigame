export const DICE = [4, 6, 8, 10, 12, 20];

export function dieLabel(sides) {
  return `D${sides}`;
}

export function isValidRoll(value, dieSides) {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 && n <= dieSides;
}

export function resolveRound({ rollGood, rollBad, modGood = 0, modBad = 0 }) {
  const diff = rollGood - rollBad;
  let hpChangeGood = 0;
  let hpChangeBad = 0;

  if (diff > 0) {
    hpChangeBad = -diff;
  } else if (diff < 0) {
    hpChangeGood = diff;
  }

  hpChangeGood += modGood;
  hpChangeBad += modBad;

  return { hpChangeGood, hpChangeBad, isTie: diff === 0 };
}

export function getSmallerDie(currentDie) {
  const idx = DICE.indexOf(currentDie);
  if (idx <= 0) return DICE[0];
  return DICE[idx - 1];
}

export function shouldDecreaseDie(hp, threshold) {
  return hp <= threshold && hp > 0;
}
