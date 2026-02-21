import HPDisplay from './HPDisplay';
import MulliganTracker from './MulliganTracker';
import DieDisplay from './DieDisplay';
import RoundInput from './RoundInput';
import CombatLog from './CombatLog';

export default function CombatScreen({ state, onResolve, onUndo, onNewCombat }) {
  const { config, combat } = state;
  const goodName = config.goodGuys.name;
  const badName = config.badGuys.name;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-gold">
            {config.combatName || 'Epic Combat Rolloff'}
          </h1>
        </div>
        <div className="flex gap-2">
          {combat.log.length > 1 && (
            <button
              onClick={onUndo}
              className="text-xs px-3 py-1.5 rounded border border-border text-text-dim hover:text-text hover:border-border-light transition-colors"
            >
              Undo Last
            </button>
          )}
          <button
            onClick={() => {
              if (window.confirm('Abandon this combat and start a new one?')) {
                onNewCombat();
              }
            }}
            className="text-xs px-3 py-1.5 rounded border border-border text-text-dim hover:text-bad-bright hover:border-bad transition-colors"
          >
            New Combat
          </button>
        </div>
      </div>

      <HPDisplay
        goodHP={combat.goodGuys.hp}
        badHP={combat.badGuys.hp}
        goodName={goodName}
        badName={badName}
        goodStartHP={config.goodGuys.startHP}
        badStartHP={config.badGuys.startHP}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-4">
          <MulliganTracker
            goodMulligans={config.goodGuys.mulligans}
            goodUsed={combat.goodGuys.mulligansUsed}
            badMulligans={config.badGuys.mulligans}
            badUsed={combat.badGuys.mulligansUsed}
            goodName={goodName}
            badName={badName}
          />
          <DieDisplay
            goodDie={combat.goodGuys.currentDie}
            badDie={combat.badGuys.currentDie}
            goodBaseDie={config.goodGuys.baseDie}
            badBaseDie={config.badGuys.baseDie}
            goodName={goodName}
            badName={badName}
          />
        </div>
        <RoundInput
          round={combat.round}
          goodDie={combat.goodGuys.currentDie}
          badDie={combat.badGuys.currentDie}
          goodName={goodName}
          badName={badName}
          goodMulligans={config.goodGuys.mulligans}
          goodMulligansUsed={combat.goodGuys.mulligansUsed}
          badMulligans={config.badGuys.mulligans}
          badMulligansUsed={combat.badGuys.mulligansUsed}
          roundEvents={config.roundEvents}
          tieCount={combat.tieCount}
          tieEvents={config.tieEvents}
          remainingTieEvent={config.remainingTieEvent}
          onResolve={onResolve}
        />
      </div>

      <CombatLog log={combat.log} goodName={goodName} badName={badName} goodMulligans={config.goodGuys.mulligans} badMulligans={config.badGuys.mulligans} />
    </div>
  );
}
