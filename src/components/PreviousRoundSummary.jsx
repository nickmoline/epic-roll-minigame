import { AdvBadge, MulliganBadge } from './CombatLog';
import { rollCellClass } from '../diceUtils';

export default function PreviousRoundSummary({
  entry,
  prevEntry,
  goodName,
  badName,
  goodMulligans = [],
  badMulligans = []
}) {
  // If we only have the 'Start' round, show an empty state.
  const hasHistory = entry && entry.round > 0 && prevEntry;

  if (!hasHistory) {
    return (
      <div className="parchment-panel p-4 flex flex-col items-center justify-center text-center">
        <div className="text-xs text-text-dim uppercase tracking-wider mb-1 font-cinzel">Previous Round</div>
        <div className="text-sm text-text-dim/60 italic py-4">No rounds resolved yet. Roll to start!</div>
      </div>
    );
  }

  const hpChangeGood = entry.hpGood - prevEntry.hpGood;
  const hpChangeBad = entry.hpBad - prevEntry.hpBad;

  const hpChangeText = (change) => {
    if (change === 0) return 'no change';
    return `${change > 0 ? '+' : ''}${change} HP`;
  };

  const hpChangeClass = (change) => {
    if (change > 0) return 'text-green-400 font-bold';
    if (change < 0) return 'text-red-400 font-bold';
    return 'text-text-dim/60';
  };

  return (
    <div className="parchment-panel p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-border/30 pb-2">
        <h4 className="font-cinzel text-xs font-bold text-gold uppercase tracking-wider">
          Previous Round: Round {entry.round}
        </h4>
        <span className="text-[10px] text-text-dim/70 px-2 py-0.5 bg-black/20 rounded">
          Summary
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="text-text-dim/80 font-cinzel uppercase tracking-wider text-[10px] border-b border-border/30">
              <th className="pb-1.5 font-semibold">Side</th>
              <th className="pb-1.5 text-center font-semibold">Roll</th>
              <th className="pb-1.5 text-right font-semibold">HP Change</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            <tr>
              <td className="py-2 text-good-bright font-bold">{goodName}</td>
              <td className={`py-2 text-center font-bold tabular-nums ${rollCellClass(entry.rollGood, entry.rollBad, 'good')}`}>
                {entry.rollGood ?? '—'}
                <AdvBadge adv={entry.advGood} />
                {entry.mulliganGood !== null && entry.mulliganGood !== false && (
                  <MulliganBadge name={goodMulligans[entry.mulliganGood]?.name} />
                )}
              </td>
              <td className="py-2 text-right tabular-nums">
                <span className="text-text-dim/70 mr-1.5">{prevEntry.hpGood} → {entry.hpGood}</span>
                <span className={hpChangeClass(hpChangeGood)}>({hpChangeText(hpChangeGood)})</span>
              </td>
            </tr>
            <tr>
              <td className="py-2 text-bad-bright font-bold">{badName}</td>
              <td className={`py-2 text-center font-bold tabular-nums ${rollCellClass(entry.rollGood, entry.rollBad, 'bad')}`}>
                {entry.rollBad ?? '—'}
                <AdvBadge adv={entry.advBad} />
                {entry.mulliganBad !== null && entry.mulliganBad !== false && (
                  <MulliganBadge name={badMulligans[entry.mulliganBad]?.name} />
                )}
              </td>
              <td className="py-2 text-right tabular-nums">
                <span className="text-text-dim/70 mr-1.5">{prevEntry.hpBad} → {entry.hpBad}</span>
                <span className={hpChangeClass(hpChangeBad)}>({hpChangeText(hpChangeBad)})</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {entry.notes && (
        <div className="bg-black/20 p-2.5 rounded border border-border/20 text-xs">
          <span className="text-gold font-bold font-cinzel block text-[10px] uppercase tracking-wider mb-1">
            Events & Modifiers
          </span>
          <p className="text-text-dim leading-relaxed">{entry.notes}</p>
        </div>
      )}
    </div>
  );
}
