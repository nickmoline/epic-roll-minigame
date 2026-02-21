function hpColor(hp, startHP) {
  const pct = hp / startHP;
  if (pct > 0.6) return 'text-good-bright';
  if (pct > 0.3) return 'text-yellow-400';
  return 'text-bad-bright';
}

function barColor(hp, startHP) {
  const pct = hp / startHP;
  if (pct > 0.6) return 'bg-good';
  if (pct > 0.3) return 'bg-yellow-600';
  return 'bg-bad';
}

export default function HPDisplay({ goodHP, badHP, goodName, badName, goodStartHP, badStartHP }) {
  const goodPct = Math.max(0, Math.min(100, (goodHP / goodStartHP) * 100));
  const badPct = Math.max(0, Math.min(100, (badHP / badStartHP) * 100));

  return (
    <div className="flex gap-4 sm:gap-8 items-stretch">
      <div className="flex-1 parchment-panel p-4 sm:p-6 text-center">
        <div className="text-xs text-text-dim uppercase tracking-wider mb-1">{goodName}</div>
        <div className={`font-cinzel text-5xl sm:text-6xl font-black tabular-nums ${hpColor(goodHP, goodStartHP)}`}>
          {goodHP}
        </div>
        <div className="mt-3 h-3 bg-bg-dark rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor(goodHP, goodStartHP)}`}
            style={{ width: `${goodPct}%` }}
          />
        </div>
      </div>

      <div className="flex items-center">
        <span className="font-cinzel text-2xl text-gold font-bold">VS</span>
      </div>

      <div className="flex-1 parchment-panel p-4 sm:p-6 text-center">
        <div className="text-xs text-text-dim uppercase tracking-wider mb-1">{badName}</div>
        <div className={`font-cinzel text-5xl sm:text-6xl font-black tabular-nums ${hpColor(badHP, badStartHP)}`}>
          {badHP}
        </div>
        <div className="mt-3 h-3 bg-bg-dark rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor(badHP, badStartHP)}`}
            style={{ width: `${badPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
