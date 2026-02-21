function ShieldIcon({ used }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`w-5 h-5 shrink-0 transition-all ${used ? 'text-parchment-lighter opacity-40' : 'text-gold'}`}
      fill="currentColor"
    >
      <path d="M12 2L3 7v5c0 5.25 3.83 10.15 9 11.25C17.17 22.15 21 17.25 21 12V7l-9-5z" />
    </svg>
  );
}

function effectSummary(m) {
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

function MulliganList({ mulligans, usedIndices }) {
  if (mulligans.length === 0) {
    return <span className="text-text-dim text-sm">No mulligans</span>;
  }

  const remaining = mulligans.length - usedIndices.length;

  return (
    <div className="space-y-1.5">
      {mulligans.map((m, idx) => {
        const used = usedIndices.includes(idx);
        const effect = effectSummary(m);
        return (
          <div key={idx} className={`flex items-start gap-2 ${used ? 'opacity-40' : ''}`}>
            <ShieldIcon used={used} />
            <div className="min-w-0">
              <div className={`text-sm font-bold leading-tight ${used ? 'line-through' : ''}`}>
                {m.name || `Mulligan ${idx + 1}`}
              </div>
              {effect && (
                <div className="text-xs text-yellow-400 leading-tight">{effect}</div>
              )}
            </div>
          </div>
        );
      })}
      <div className="text-xs text-text-dim mt-1">{remaining} remaining</div>
    </div>
  );
}

export default function MulliganTracker({ goodMulligans, goodUsed, badMulligans, badUsed, goodName, badName }) {
  return (
    <div className="flex gap-4 sm:gap-8">
      <div className="flex-1 parchment-panel p-3">
        <div className="text-xs text-text-dim uppercase tracking-wider mb-2 text-center">{goodName} Mulligans</div>
        <MulliganList mulligans={goodMulligans} usedIndices={goodUsed} groupName={goodName} />
      </div>

      <div className="flex-1 parchment-panel p-3">
        <div className="text-xs text-text-dim uppercase tracking-wider mb-2 text-center">{badName} Mulligans</div>
        <MulliganList mulligans={badMulligans} usedIndices={badUsed} groupName={badName} />
      </div>
    </div>
  );
}
