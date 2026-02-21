import { useState } from 'react';
import { isValidRoll, dieLabel } from '../diceUtils';

function mulliganEffectSummary(m) {
  const parts = [];
  if (m.noDamage) parts.push('No damage');
  if (m.hpModGood) parts.push(`Allies ${m.hpModGood > 0 ? '+' : ''}${m.hpModGood} HP`);
  if (m.hpModBad) parts.push(`Enemies ${m.hpModBad > 0 ? '+' : ''}${m.hpModBad} HP`);
  if (m.rollBonusGood) parts.push(`Allies roll ${m.rollBonusGood > 0 ? '+' : ''}${m.rollBonusGood}`);
  if (m.rollBonusBad) parts.push(`Enemies roll ${m.rollBonusBad > 0 ? '+' : ''}${m.rollBonusBad}`);
  if (m.swapDieGood) parts.push(`Allies use D${m.swapDieGood}`);
  if (m.swapDieBad) parts.push(`Enemies use D${m.swapDieBad}`);
  return parts.join(', ');
}

function MulliganSelect({ mulligans, usedIndices, value, onChange, groupName }) {
  const available = mulligans
    .map((m, idx) => ({ ...m, idx }))
    .filter((m) => !usedIndices.includes(m.idx));

  if (mulligans.length === 0) return null;

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-text-dim uppercase tracking-wider">{groupName} Mulligan</label>
      <select
        className="input-field text-sm"
        value={value === null ? '' : value}
        onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
        disabled={available.length === 0}
      >
        <option value="">None ({available.length} left)</option>
        {available.map((m) => (
          <option key={m.idx} value={m.idx}>
            {m.name || `Mulligan ${m.idx + 1}`}
          </option>
        ))}
      </select>
      {value !== null && mulligans[value] && (
        <div className="text-xs text-yellow-400">
          {mulliganEffectSummary(mulligans[value]) || 'No mechanical effect'}
        </div>
      )}
    </div>
  );
}

export default function RoundInput({
  round,
  goodDie,
  badDie,
  goodName,
  badName,
  goodMulligans,
  goodMulligansUsed,
  badMulligans,
  badMulligansUsed,
  roundEvents,
  tieCount,
  tieEvents,
  remainingTieEvent,
  onResolve,
}) {
  const [rollGood, setRollGood] = useState('');
  const [rollBad, setRollBad] = useState('');
  const [mulliganGood, setMulliganGood] = useState(null);
  const [mulliganBad, setMulliganBad] = useState(null);

  const activeEvents = roundEvents.filter((e) => e.round === round);

  let nextTieEvent = null;
  if (tieCount < tieEvents.length) {
    nextTieEvent = tieEvents[tieCount];
  } else if (remainingTieEvent?.enabled) {
    nextTieEvent = remainingTieEvent;
  }

  // Compute effective dice accounting for die-swap mulligans
  const goodMull = mulliganGood !== null ? goodMulligans[mulliganGood] : null;
  const badMull = mulliganBad !== null ? badMulligans[mulliganBad] : null;
  const effectiveGoodDie = goodMull?.swapDieGood || badMull?.swapDieGood || goodDie;
  const effectiveBadDie = goodMull?.swapDieBad || badMull?.swapDieBad || badDie;

  const canSubmit =
    isValidRoll(rollGood, effectiveGoodDie) &&
    isValidRoll(rollBad, effectiveBadDie);

  function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    onResolve({
      rollGood: Number(rollGood),
      rollBad: Number(rollBad),
      mulliganGood,
      mulliganBad,
    });
    setRollGood('');
    setRollBad('');
    setMulliganGood(null);
    setMulliganBad(null);
  }

  return (
    <form onSubmit={handleSubmit} className="parchment-panel p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-cinzel text-lg font-bold text-gold">Round {round}</h3>
        {activeEvents.length > 0 && (
          <div className="text-xs text-yellow-400 bg-yellow-900/30 px-3 py-1 rounded">
            Event: {activeEvents.map((e) => e.description).join('; ')}
          </div>
        )}
      </div>
      {nextTieEvent && nextTieEvent.description && (
        <div className="text-xs text-text-dim bg-parchment-lighter/40 px-3 py-2 rounded mb-4">
          <span className="text-yellow-400 font-bold">On tie:</span> {nextTieEvent.description}
        </div>
      )}

      <div className="grid grid-cols-[1fr_auto_1fr] gap-2 mb-4 items-end">
        <div>
          <label className="block text-xs text-text-dim uppercase tracking-wider mb-1">
            {goodName} ({dieLabel(effectiveGoodDie)})
            {effectiveGoodDie !== goodDie && <span className="text-yellow-400 ml-1">(swapped)</span>}
          </label>
          <input
            className="input-field w-full text-center text-xl font-bold"
            type="number"
            min={1}
            max={effectiveGoodDie}
            value={rollGood}
            onChange={(e) => {
              const v = e.target.value;
              if (v === '') { setRollGood(''); return; }
              const n = Number(v);
              if (n >= 1 && n <= effectiveGoodDie) setRollGood(v);
            }}
            placeholder={`1-${effectiveGoodDie}`}
          />
        </div>
        <button
          type="button"
          className="px-3 py-2 text-xs font-bold rounded border border-gold/40 text-gold hover:bg-gold/10 transition-colors whitespace-nowrap"
          onClick={() => {
            setRollGood(String(Math.floor(Math.random() * effectiveGoodDie) + 1));
            setRollBad(String(Math.floor(Math.random() * effectiveBadDie) + 1));
          }}
          title="Roll both dice"
        >
          Roll
        </button>
        <div>
          <label className="block text-xs text-text-dim uppercase tracking-wider mb-1">
            {badName} ({dieLabel(effectiveBadDie)})
            {effectiveBadDie !== badDie && <span className="text-yellow-400 ml-1">(swapped)</span>}
          </label>
          <input
            className="input-field w-full text-center text-xl font-bold"
            type="number"
            min={1}
            max={effectiveBadDie}
            value={rollBad}
            onChange={(e) => {
              const v = e.target.value;
              if (v === '') { setRollBad(''); return; }
              const n = Number(v);
              if (n >= 1 && n <= effectiveBadDie) setRollBad(v);
            }}
            placeholder={`1-${effectiveBadDie}`}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <MulliganSelect
          mulligans={goodMulligans}
          usedIndices={goodMulligansUsed}
          value={mulliganGood}
          onChange={setMulliganGood}
          groupName={goodName}
        />
        <MulliganSelect
          mulligans={badMulligans}
          usedIndices={badMulligansUsed}
          value={mulliganBad}
          onChange={setMulliganBad}
          groupName={badName}
        />
      </div>

      <button
        type="submit"
        className="btn-gold w-full text-lg !py-3"
        disabled={!canSubmit}
      >
        Resolve Round
      </button>
    </form>
  );
}
