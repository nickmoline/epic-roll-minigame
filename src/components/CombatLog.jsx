import { useRef, useEffect } from 'react';

function MulliganBadge({ name }) {
  return (
    <span className="inline-block ml-1 text-gold text-xs align-super" title={name || 'Mulligan used'}>
      ★
    </span>
  );
}

function rollCellClass(rollGood, rollBad, side) {
  if (rollGood === null || rollBad === null) return '';
  if (rollGood === rollBad) return 'text-yellow-400';
  if (side === 'good') return rollGood > rollBad ? 'text-good-bright' : 'text-bad-bright';
  return rollBad > rollGood ? 'text-good-bright' : 'text-bad-bright';
}

export default function CombatLog({ log, goodName, badName, goodMulligans = [], badMulligans = [] }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log.length]);

  if (log.length <= 1) return null;

  return (
    <div className="parchment-panel overflow-hidden">
      <div className="overflow-x-auto max-h-80 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="bg-parchment-light">
              <th className="px-3 py-2 text-left font-cinzel text-xs text-text-dim uppercase tracking-wider">Round</th>
              <th className="px-3 py-2 text-center font-cinzel text-xs text-text-dim uppercase tracking-wider" colSpan={2}>Rolls</th>
              <th className="px-3 py-2 text-center font-cinzel text-xs text-text-dim uppercase tracking-wider" colSpan={2}>Health</th>
              <th className="px-3 py-2 text-center font-cinzel text-xs text-text-dim uppercase tracking-wider" colSpan={2}>Modifiers</th>
              <th className="px-3 py-2 text-left font-cinzel text-xs text-text-dim uppercase tracking-wider">Events</th>
            </tr>
            <tr className="bg-parchment-light border-b border-border">
              <th></th>
              <th className="px-3 pb-1 text-center text-xs text-good-bright font-normal">{goodName}</th>
              <th className="px-3 pb-1 text-center text-xs text-bad-bright font-normal">{badName}</th>
              <th className="px-3 pb-1 text-center text-xs text-good-bright font-normal">{goodName}</th>
              <th className="px-3 pb-1 text-center text-xs text-bad-bright font-normal">{badName}</th>
              <th className="px-3 pb-1 text-center text-xs text-good-bright font-normal">{goodName}</th>
              <th className="px-3 pb-1 text-center text-xs text-bad-bright font-normal">{badName}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {log.map((entry, idx) => {
              const isStart = entry.round === 0;
              return (
                <tr
                  key={idx}
                  className={`
                    border-b border-border/50 transition-colors
                    ${isStart ? 'bg-parchment/50' : 'hover:bg-parchment-light/50'}
                    ${idx === log.length - 1 && !isStart ? 'bg-gold/5' : ''}
                  `}
                >
                  <td className="px-3 py-2 font-cinzel font-bold text-text-dim">
                    {entry.label}
                  </td>
                  <td className={`px-3 py-2 text-center font-bold tabular-nums ${rollCellClass(entry.rollGood, entry.rollBad, 'good')}`}>
                    {entry.rollGood ?? '—'}
                    {entry.mulliganGood !== null && entry.mulliganGood !== false && (
                      <MulliganBadge name={goodMulligans[entry.mulliganGood]?.name} />
                    )}
                  </td>
                  <td className={`px-3 py-2 text-center font-bold tabular-nums ${rollCellClass(entry.rollGood, entry.rollBad, 'bad')}`}>
                    {entry.rollBad ?? '—'}
                    {entry.mulliganBad !== null && entry.mulliganBad !== false && (
                      <MulliganBadge name={badMulligans[entry.mulliganBad]?.name} />
                    )}
                  </td>
                  <td className="px-3 py-2 text-center tabular-nums">{entry.hpGood}</td>
                  <td className="px-3 py-2 text-center tabular-nums">{entry.hpBad}</td>
                  <td className="px-3 py-2 text-center tabular-nums text-text-dim">
                    {entry.modGood !== 0 ? (entry.modGood > 0 ? `+${entry.modGood}` : entry.modGood) : ''}
                  </td>
                  <td className="px-3 py-2 text-center tabular-nums text-text-dim">
                    {entry.modBad !== 0 ? (entry.modBad > 0 ? `+${entry.modBad}` : entry.modBad) : ''}
                  </td>
                  <td className="px-3 py-2 text-text-dim text-xs">{entry.notes}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div ref={endRef} />
      </div>
    </div>
  );
}
