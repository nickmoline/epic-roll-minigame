import CombatLog from './CombatLog';

export default function VictoryScreen({ state, onNewCombat }) {
  const { config, combat, winner } = state;
  const goodName = config.goodGuys.name;
  const badName = config.badGuys.name;

  const winnerName = winner === 'goodGuys' ? goodName : winner === 'badGuys' ? badName : 'Neither side';
  const isGoodWin = winner === 'goodGuys';
  const isTie = winner === 'tie';
  const finalEntry = combat.log[combat.log.length - 1];

  const totalRounds = combat.log.length - 1;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="parchment-panel p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className={`w-full h-full ${isGoodWin ? 'bg-good' : isTie ? 'bg-yellow-700' : 'bg-bad'}`} />
          </div>
          <div className="relative">
            {config.combatName && (
              <div className="font-cinzel text-sm text-gold mb-1">{config.combatName}</div>
            )}
            <h2 className="font-cinzel text-lg text-text-dim uppercase tracking-widest mb-2">
              {isTie ? 'Mutual Destruction' : 'Victory'}
            </h2>
            <h1 className={`font-cinzel text-4xl sm:text-5xl font-black mb-4 ${isGoodWin ? 'text-good-bright' : isTie ? 'text-yellow-400' : 'text-bad-bright'}`}>
              {isTie ? 'A Pyrrhic End' : `${winnerName} Triumph!`}
            </h1>
            <div className="flex justify-center gap-8 sm:gap-16 mt-6">
              <div className="text-center">
                <div className="text-xs text-text-dim uppercase tracking-wider">{goodName}</div>
                <div className={`font-cinzel text-3xl font-bold ${finalEntry.hpGood > 0 ? 'text-good-bright' : 'text-bad-bright'}`}>
                  {finalEntry.hpGood} HP
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-text-dim uppercase tracking-wider">{badName}</div>
                <div className={`font-cinzel text-3xl font-bold ${finalEntry.hpBad > 0 ? 'text-good-bright' : 'text-bad-bright'}`}>
                  {finalEntry.hpBad} HP
                </div>
              </div>
            </div>
            <div className="mt-4 text-text-dim text-sm">
              Battle lasted <span className="text-gold font-bold">{totalRounds}</span> round{totalRounds !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      <CombatLog log={combat.log} goodName={goodName} badName={badName} goodMulligans={config.goodGuys.mulligans} badMulligans={config.badGuys.mulligans} />

      <div className="text-center mt-6">
        <button className="btn-gold text-lg !px-10 !py-3" onClick={onNewCombat}>
          New Combat
        </button>
      </div>
    </div>
  );
}
