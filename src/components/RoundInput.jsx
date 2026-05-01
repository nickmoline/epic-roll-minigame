import { useState, useEffect } from 'react';
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
  if (m.advGood && m.advGood !== 'normal') parts.push(`Allies ${m.advGood === 'adv' ? 'Advantage' : 'Disadvantage'}`);
  if (m.advBad && m.advBad !== 'normal') parts.push(`Enemies ${m.advBad === 'adv' ? 'Advantage' : 'Disadvantage'}`);
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
function AdvToggle({ value, onChange }) {
  return (
    <div className="flex gap-1 mt-2 justify-center bg-black/20 p-1 rounded">
      <button 
        type="button" 
        onClick={() => onChange('dis')}
        className={`flex-1 px-1 py-1 text-[10px] font-bold rounded transition-colors ${value === 'dis' ? 'bg-red-900/80 text-red-200 shadow-inner' : 'text-text-dim hover:text-text hover:bg-white/5'}`}
      >
        DIS
      </button>
      <button 
        type="button" 
        onClick={() => onChange('normal')}
        className={`flex-1 px-1 py-1 text-[10px] font-bold rounded transition-colors ${value === 'normal' ? 'bg-gray-700 text-gray-200 shadow-inner' : 'text-text-dim hover:text-text hover:bg-white/5'}`}
      >
        NORM
      </button>
      <button 
        type="button" 
        onClick={() => onChange('adv')}
        className={`flex-1 px-1 py-1 text-[10px] font-bold rounded transition-colors ${value === 'adv' ? 'bg-green-900/80 text-green-200 shadow-inner' : 'text-text-dim hover:text-text hover:bg-white/5'}`}
      >
        ADV
      </button>
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
  onRoll3D,
}) {
  const [rollGood, setRollGood] = useState('');
  const [rollBad, setRollBad] = useState('');
  const [goodAdvState, setGoodAdvState] = useState('normal');
  const [badAdvState, setBadAdvState] = useState('normal');
  const [mulliganGood, setMulliganGood] = useState(null);
  const [mulliganBad, setMulliganBad] = useState(null);
  const [isRolling, setIsRolling] = useState(false);

  const activeEvents = roundEvents.filter((e) => e.round === round);

  const eventGoodAdv = activeEvents.reduce((acc, e) => (e.advGood && e.advGood !== 'normal' ? e.advGood : acc), 'normal');
  const eventBadAdv = activeEvents.reduce((acc, e) => (e.advBad && e.advBad !== 'normal' ? e.advBad : acc), 'normal');

  const goodMull = mulliganGood !== null ? goodMulligans[mulliganGood] : null;
  const badMull = mulliganBad !== null ? badMulligans[mulliganBad] : null;

  const mullGoodAdv = goodMull?.advGood && goodMull.advGood !== 'normal' ? goodMull.advGood : (badMull?.advGood && badMull.advGood !== 'normal' ? badMull.advGood : 'normal');
  const mullBadAdv = goodMull?.advBad && goodMull.advBad !== 'normal' ? goodMull.advBad : (badMull?.advBad && badMull.advBad !== 'normal' ? badMull.advBad : 'normal');

  const computedGoodAdv = mullGoodAdv !== 'normal' ? mullGoodAdv : eventGoodAdv;
  const computedBadAdv = mullBadAdv !== 'normal' ? mullBadAdv : eventBadAdv;

  useEffect(() => {
    setGoodAdvState(computedGoodAdv);
  }, [computedGoodAdv, round]);

  useEffect(() => {
    setBadAdvState(computedBadAdv);
  }, [computedBadAdv, round]);

  let nextTieEvent = null;
  if (tieCount < tieEvents.length) {
    nextTieEvent = tieEvents[tieCount];
  } else if (remainingTieEvent?.enabled) {
    nextTieEvent = remainingTieEvent;
  }

  // Compute effective dice accounting for die-swap mulligans
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
      advGood: goodAdvState,
      advBad: badAdvState,
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
          <AdvToggle value={goodAdvState} onChange={setGoodAdvState} />
        </div>
        <button
          type="button"
          className="px-3 py-2 text-xs font-bold rounded border border-gold/40 text-gold hover:bg-gold/10 transition-colors whitespace-nowrap disabled:opacity-40"
          disabled={isRolling}
          onClick={async () => {
            if (onRoll3D) {
              setIsRolling(true);
              try {
                const result = await onRoll3D(effectiveGoodDie, effectiveBadDie, goodAdvState, badAdvState);
                if (result) {
                  setRollGood(String(result.rollGood));
                  setRollBad(String(result.rollBad));
                  return;
                }
              } catch (err) {
                console.error('3D roll failed, using fallback:', err);
              } finally {
                setIsRolling(false);
              }
            }

            const rollDie = (sides, adv) => {
              const r1 = Math.floor(Math.random() * sides) + 1;
              if (adv === 'normal') return r1;
              const r2 = Math.floor(Math.random() * sides) + 1;
              return adv === 'adv' ? Math.max(r1, r2) : Math.min(r1, r2);
            };

            setRollGood(String(rollDie(effectiveGoodDie, goodAdvState)));
            setRollBad(String(rollDie(effectiveBadDie, badAdvState)));
          }}
          title="Roll both dice"
        >
          {isRolling ? '...' : 'Roll'}
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
          <AdvToggle value={badAdvState} onChange={setBadAdvState} />
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
