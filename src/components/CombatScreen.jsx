import { useState, useCallback } from 'react';
import HPDisplay from './HPDisplay';
import MulliganTracker from './MulliganTracker';
import DieDisplay from './DieDisplay';
import RoundInput from './RoundInput';
import CombatLog from './CombatLog';
import { useDiceBox } from '../hooks/useDiceBox';

export default function CombatScreen({ state, onResolve, onUndo, onNewCombat }) {
  const { config, combat } = state;
  const goodName = config.goodGuys.name;
  const badName = config.badGuys.name;
  const [trayOpen, setTrayOpen] = useState(false);
  const diceBox = useDiceBox();

  const rollDice = useCallback(async (goodDie, badDie) => {
    if (!trayOpen) {
      setTrayOpen(true);
      // Wait for CSS height transition (300ms) so container has dimensions
      await new Promise((r) => setTimeout(r, 350));
    }

    if (!diceBox.ready) {
      await diceBox.init();
      // Small extra delay after first init for canvas to settle
      await new Promise((r) => setTimeout(r, 100));
    }

    const result = await diceBox.roll(goodDie, badDie);
    return result;
  }, [trayOpen, diceBox]);

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
          onRoll3D={rollDice}
        />
      </div>

      <div className="dice-tray-frame">
        <button
          className="w-full text-left font-cinzel text-sm font-bold text-gold flex items-center justify-between px-2 py-1"
          onClick={() => setTrayOpen(!trayOpen)}
        >
          <span>Dice Tray</span>
          <span className="text-text-dim text-sm">{trayOpen ? '▲ Hide' : '▼ Show'}</span>
        </button>
        <div
          className="dice-tray-felt"
          style={{
            height: trayOpen ? '280px' : '0px',
            transition: 'height 0.3s ease',
          }}
        >
          <div
            id="dice-tray"
            style={{
              width: '100%',
              height: '100%',
              position: 'relative',
            }}
          />
        </div>
      </div>

      <CombatLog log={combat.log} goodName={goodName} badName={badName} goodMulligans={config.goodGuys.mulligans} badMulligans={config.badGuys.mulligans} />
    </div>
  );
}
