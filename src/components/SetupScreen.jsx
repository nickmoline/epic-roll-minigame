import { useState } from 'react';
import DiceSelector from './DiceSelector';
import { dieLabel } from '../diceUtils';

function DieSwapInline({ value, onChange }) {
  return (
    <select
      className="input-field text-sm text-center"
      value={value || 0}
      onChange={(e) => onChange(Number(e.target.value))}
    >
      <option value={0}>--</option>
      {[4, 6, 8, 10, 12, 20].map((d) => (
        <option key={d} value={d}>D{d}</option>
      ))}
    </select>
  );
}

function MulliganRow({ mulligan, onChange, onRemove, goodLabel, badLabel }) {
  return (
    <div className="p-2 bg-bg-dark/50 rounded space-y-2">
      <div className="flex items-center gap-2">
        <input
          className="input-field text-sm flex-1 min-w-24"
          type="text"
          value={mulligan.name}
          onChange={(e) => onChange({ ...mulligan, name: e.target.value })}
          placeholder="Name"
        />
        <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={mulligan.noDamage || false}
            onChange={(e) => onChange({ ...mulligan, noDamage: e.target.checked })}
            className="accent-gold w-3.5 h-3.5"
          />
          <span className="text-xs font-bold text-yellow-400">No Dmg</span>
        </label>
        <button
          onClick={onRemove}
          className="text-bad-bright hover:text-bad-light transition-colors px-1 text-lg leading-none shrink-0"
          title="Remove"
        >
          &times;
        </button>
      </div>
      <div className="grid grid-cols-[auto_5rem_5rem] gap-x-3 gap-y-1.5 items-center text-xs">
        <span></span>
        <span className="text-text-dim text-center uppercase tracking-wide">{goodLabel}</span>
        <span className="text-text-dim text-center uppercase tracking-wide">{badLabel}</span>

        <span className="text-text-dim">Die</span>
        <DieSwapInline value={mulligan.swapDieGood} onChange={(v) => onChange({ ...mulligan, swapDieGood: v })} />
        <DieSwapInline value={mulligan.swapDieBad} onChange={(v) => onChange({ ...mulligan, swapDieBad: v })} />

        <span className="text-text-dim">Roll +/-</span>
        <input className="input-field text-sm text-center" type="number" value={mulligan.rollBonusGood || 0} onChange={(e) => onChange({ ...mulligan, rollBonusGood: Number(e.target.value) || 0 })} />
        <input className="input-field text-sm text-center" type="number" value={mulligan.rollBonusBad || 0} onChange={(e) => onChange({ ...mulligan, rollBonusBad: Number(e.target.value) || 0 })} />

        <span className="text-text-dim">HP Mod</span>
        <input className="input-field text-sm text-center" type="number" value={mulligan.hpModGood || 0} onChange={(e) => onChange({ ...mulligan, hpModGood: Number(e.target.value) || 0 })} />
        <input className="input-field text-sm text-center" type="number" value={mulligan.hpModBad || 0} onChange={(e) => onChange({ ...mulligan, hpModBad: Number(e.target.value) || 0 })} />
      </div>
    </div>
  );
}

function GroupConfig({ group, onChange, label, accentClass, goodLabel, badLabel }) {
  return (
    <div className="flex-1 parchment-panel p-5">
      <h3 className={`font-cinzel text-lg font-bold mb-4 ${accentClass}`}>{label}</h3>
      <div className="space-y-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-text-dim uppercase tracking-wide">Name</label>
          <input
            className="input-field"
            type="text"
            value={group.name}
            onChange={(e) => onChange({ ...group, name: e.target.value })}
            placeholder="Group name"
          />
        </div>
        <DiceSelector
          label="Base Die"
          value={group.baseDie}
          onChange={(v) => onChange({ ...group, baseDie: v })}
        />
        <div className="flex flex-col gap-1">
          <label className="text-xs text-text-dim uppercase tracking-wide">Starting HP</label>
          <input
            className="input-field"
            type="number"
            min={1}
            max={999}
            value={group.startHP}
            onChange={(e) => onChange({ ...group, startHP: Math.max(1, Number(e.target.value) || 1) })}
          />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="text-xs text-text-dim uppercase tracking-wide">Mulligans</label>
            <button
              className="text-xs text-gold hover:text-gold-bright transition-colors"
              onClick={() => onChange({
                ...group,
                mulligans: [...group.mulligans, { name: '', noDamage: false, hpModGood: 0, hpModBad: 0, rollBonusGood: 0, rollBonusBad: 0, swapDieGood: 0, swapDieBad: 0 }],
              })}
            >
              + Add
            </button>
          </div>
          {group.mulligans.length === 0 && (
            <p className="text-xs text-text-dim italic">No mulligans configured</p>
          )}
          <div className="space-y-2">
            {group.mulligans.map((m, idx) => (
              <MulliganRow
                key={idx}
                mulligan={m}
                goodLabel={goodLabel}
                badLabel={badLabel}
                onChange={(updated) => {
                  const newMulls = [...group.mulligans];
                  newMulls[idx] = updated;
                  onChange({ ...group, mulligans: newMulls });
                }}
                onRemove={() => {
                  onChange({
                    ...group,
                    mulligans: group.mulligans.filter((_, i) => i !== idx),
                  });
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const ORDINALS = ['1st', '2nd', '3rd'];
function ordinalLabel(idx) {
  if (idx < ORDINALS.length) return `${ORDINALS[idx]} Tie`;
  return `${idx + 1}th Tie`;
}

function TieEventRow({ event, label, onChange, onRemove }) {
  return (
    <div className="flex items-end gap-2 p-3 bg-bg-dark/50 rounded">
      <div className="flex items-center justify-center min-w-16 pb-1">
        <span className="text-sm font-cinzel font-bold text-yellow-400">{label}</span>
      </div>
      <div className="flex flex-col gap-1 flex-1">
        <label className="text-xs text-text-dim uppercase tracking-wide">Description</label>
        <input
          className="input-field"
          type="text"
          value={event.description}
          onChange={(e) => onChange({ ...event, description: e.target.value })}
          placeholder="What happens..."
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-text-dim uppercase tracking-wide">Ally HP</label>
        <input
          className="input-field w-20"
          type="number"
          value={event.hpModGood}
          onChange={(e) => onChange({ ...event, hpModGood: Number(e.target.value) || 0 })}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-text-dim uppercase tracking-wide">Enemy HP</label>
        <input
          className="input-field w-20"
          type="number"
          value={event.hpModBad}
          onChange={(e) => onChange({ ...event, hpModBad: Number(e.target.value) || 0 })}
        />
      </div>
      <button
        onClick={onRemove}
        className="text-bad-bright hover:text-bad-light transition-colors px-2 py-1 text-lg leading-none"
        title="Remove"
      >
        &times;
      </button>
    </div>
  );
}

function RoundEventRow({ event, onChange, onRemove }) {
  return (
    <div className="flex items-end gap-2 p-3 bg-bg-dark/50 rounded">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-text-dim uppercase tracking-wide">Round</label>
        <input
          className="input-field w-16"
          type="number"
          min={1}
          value={event.round}
          onChange={(e) => onChange({ ...event, round: Math.max(1, Number(e.target.value) || 1) })}
        />
      </div>
      <div className="flex flex-col gap-1 flex-1">
        <label className="text-xs text-text-dim uppercase tracking-wide">Description</label>
        <input
          className="input-field"
          type="text"
          value={event.description}
          onChange={(e) => onChange({ ...event, description: e.target.value })}
          placeholder="What happens..."
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-text-dim uppercase tracking-wide">Ally HP</label>
        <input
          className="input-field w-20"
          type="number"
          value={event.hpModGood}
          onChange={(e) => onChange({ ...event, hpModGood: Number(e.target.value) || 0 })}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-text-dim uppercase tracking-wide">Enemy HP</label>
        <input
          className="input-field w-20"
          type="number"
          value={event.hpModBad}
          onChange={(e) => onChange({ ...event, hpModBad: Number(e.target.value) || 0 })}
        />
      </div>
      <button
        onClick={onRemove}
        className="text-bad-bright hover:text-bad-light transition-colors px-2 py-1 text-lg leading-none"
        title="Remove"
      >
        &times;
      </button>
    </div>
  );
}

export default function SetupScreen({ config, onUpdateConfig, onStart, onReset, presets = [], onSavePreset, onLoadPreset, onDeletePreset }) {
  const [showPresets, setShowPresets] = useState(false);

  const updateGoodGuys = (g) => onUpdateConfig({ ...config, goodGuys: g });
  const updateBadGuys = (g) => onUpdateConfig({ ...config, badGuys: g });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="font-cinzel text-4xl font-bold text-gold mb-2">Epic Combat Rolloff</h1>
        <p className="text-text-dim text-sm mb-4">Configure the battle and begin</p>
        <input
          className="input-field text-center text-lg font-cinzel w-full max-w-md mx-auto"
          type="text"
          value={config.combatName || ''}
          onChange={(e) => onUpdateConfig({ ...config, combatName: e.target.value })}
          placeholder="Combat Name (e.g. Battle of Ironhold)"
        />
      </div>

      <div className="parchment-panel p-4 mb-6">
        <button
          className="w-full text-left font-cinzel text-sm font-bold text-gold flex items-center justify-between"
          onClick={() => setShowPresets(!showPresets)}
        >
          <span>Saved Setups {presets.length > 0 && <span className="text-text-dim font-normal">({presets.length})</span>}</span>
          <span className="text-text-dim text-sm">{showPresets ? '▲ Hide' : '▼ Show'}</span>
        </button>

        {showPresets && (
          <div className="mt-3 space-y-2">
            {presets.length === 0 && (
              <p className="text-xs text-text-dim italic">No saved setups yet. Configure a combat and save it for later.</p>
            )}
            {presets.map((preset) => (
              <div key={preset.id} className="flex items-center gap-2 p-2 bg-bg-dark/50 rounded">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate">{preset.name}</div>
                  <div className="text-xs text-text-dim">
                    {preset.config.goodGuys?.name || 'Good Guys'} vs {preset.config.badGuys?.name || 'Bad Guys'}
                    {' · '}D{preset.config.goodGuys?.baseDie || 12}
                    {' · '}{preset.config.goodGuys?.startHP || 20} HP
                  </div>
                </div>
                <button
                  className="text-xs px-3 py-1.5 rounded border border-gold/50 text-gold hover:bg-gold/10 transition-colors shrink-0"
                  onClick={() => onLoadPreset(preset.id)}
                >
                  Load
                </button>
                <button
                  className="text-xs px-2 py-1.5 rounded border border-border text-text-dim hover:text-bad-bright hover:border-bad transition-colors shrink-0"
                  onClick={() => { if (window.confirm(`Delete "${preset.name}"?`)) onDeletePreset(preset.id); }}
                >
                  &times;
                </button>
              </div>
            ))}
            <button
              className="btn-gold text-xs !py-1.5 !px-4 w-full"
              onClick={() => onSavePreset(config)}
            >
              Save Current Setup
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <GroupConfig
          group={config.goodGuys}
          onChange={updateGoodGuys}
          label="Allies"
          accentClass="text-good-bright"
          goodLabel="Allies"
          badLabel="Enemies"
        />
        <div className="flex items-center justify-center font-cinzel text-2xl text-gold font-bold">VS</div>
        <GroupConfig
          group={config.badGuys}
          onChange={updateBadGuys}
          label="Enemies"
          accentClass="text-bad-bright"
          goodLabel="Allies"
          badLabel="Enemies"
        />
      </div>

      <div className="parchment-panel p-5 mb-6">
        <h2 className="font-cinzel text-lg font-bold text-gold mb-4">Special Rules</h2>
        <div className="space-y-5">
            {/* Tie Events */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-cinzel font-bold text-sm">Tie Events</span>
                  <span className="text-xs text-text-dim ml-2">Triggered in order when both dice match</span>
                </div>
                <button
                  className="text-xs btn-gold !py-1 !px-3"
                  onClick={() => onUpdateConfig({
                    ...config,
                    tieEvents: [...config.tieEvents, { description: '', hpModGood: 0, hpModBad: 0 }],
                  })}
                >
                  + Add
                </button>
              </div>
              {config.tieEvents.map((event, idx) => (
                <TieEventRow
                  key={idx}
                  event={event}
                  label={ordinalLabel(idx)}
                  onChange={(updated) => {
                    const newEvents = [...config.tieEvents];
                    newEvents[idx] = updated;
                    onUpdateConfig({ ...config, tieEvents: newEvents });
                  }}
                  onRemove={() => {
                    onUpdateConfig({
                      ...config,
                      tieEvents: config.tieEvents.filter((_, i) => i !== idx),
                    });
                  }}
                />
              ))}

              {/* Remaining Ties fallback */}
              <div className="mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.remainingTieEvent.enabled}
                    onChange={(e) => onUpdateConfig({
                      ...config,
                      remainingTieEvent: { ...config.remainingTieEvent, enabled: e.target.checked },
                    })}
                    className="accent-gold w-4 h-4"
                  />
                  <span className="text-sm font-bold">Remaining Ties</span>
                  <span className="text-xs text-text-dim">Fallback for any ties beyond the list above</span>
                </label>
                {config.remainingTieEvent.enabled && (
                  <div className="flex items-end gap-2 p-3 mt-2 bg-bg-dark/50 rounded ml-6">
                    <div className="flex flex-col gap-1 flex-1">
                      <label className="text-xs text-text-dim uppercase tracking-wide">Description</label>
                      <input
                        className="input-field"
                        type="text"
                        value={config.remainingTieEvent.description}
                        onChange={(e) => onUpdateConfig({
                          ...config,
                          remainingTieEvent: { ...config.remainingTieEvent, description: e.target.value },
                        })}
                        placeholder="What happens on subsequent ties..."
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-text-dim uppercase tracking-wide">Ally HP</label>
                      <input
                        className="input-field w-20"
                        type="number"
                        value={config.remainingTieEvent.hpModGood}
                        onChange={(e) => onUpdateConfig({
                          ...config,
                          remainingTieEvent: { ...config.remainingTieEvent, hpModGood: Number(e.target.value) || 0 },
                        })}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-text-dim uppercase tracking-wide">Enemy HP</label>
                      <input
                        className="input-field w-20"
                        type="number"
                        value={config.remainingTieEvent.hpModBad}
                        onChange={(e) => onUpdateConfig({
                          ...config,
                          remainingTieEvent: { ...config.remainingTieEvent, hpModBad: Number(e.target.value) || 0 },
                        })}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <hr className="border-border" />

            {/* Round Events */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-cinzel font-bold text-sm">Round Events</span>
                  <span className="text-xs text-text-dim ml-2">HP changes at specific rounds</span>
                </div>
                <button
                  className="text-xs btn-gold !py-1 !px-3"
                  onClick={() => onUpdateConfig({
                    ...config,
                    roundEvents: [...config.roundEvents, { round: 1, description: '', hpModGood: 0, hpModBad: 0 }],
                  })}
                >
                  + Add
                </button>
              </div>
              {config.roundEvents.map((event, idx) => (
                <RoundEventRow
                  key={idx}
                  event={event}
                  onChange={(updated) => {
                    const newEvents = [...config.roundEvents];
                    newEvents[idx] = updated;
                    onUpdateConfig({ ...config, roundEvents: newEvents });
                  }}
                  onRemove={() => {
                    onUpdateConfig({
                      ...config,
                      roundEvents: config.roundEvents.filter((_, i) => i !== idx),
                    });
                  }}
                />
              ))}
            </div>

            <hr className="border-border" />

            {/* Decreasing Die */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.decreasingDie.enabled}
                  onChange={(e) => onUpdateConfig({
                    ...config,
                    decreasingDie: { ...config.decreasingDie, enabled: e.target.checked },
                  })}
                  className="accent-gold w-4 h-4"
                />
                <span className="font-cinzel font-bold text-sm">Decreasing Die</span>
                <span className="text-xs text-text-dim">Weaker die when HP drops low</span>
              </label>
              {config.decreasingDie.enabled && (
                <div className="ml-6 flex gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-text-dim uppercase tracking-wide">HP Threshold</label>
                    <input
                      className="input-field w-20"
                      type="number"
                      min={1}
                      value={config.decreasingDie.threshold}
                      onChange={(e) => onUpdateConfig({
                        ...config,
                        decreasingDie: { ...config.decreasingDie, threshold: Math.max(1, Number(e.target.value) || 1) },
                      })}
                    />
                  </div>
                  <DiceSelector
                    label="Smaller Die"
                    value={config.decreasingDie.smallerDie}
                    onChange={(v) => onUpdateConfig({
                      ...config,
                      decreasingDie: { ...config.decreasingDie, smallerDie: v },
                    })}
                  />
                </div>
              )}
            </div>
          </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        <button
          className="btn-gold text-lg !px-6 !py-3 !bg-none !border-border !text-text-dim hover:!border-bad hover:!text-bad-bright"
          onClick={() => { if (window.confirm('Reset all settings to defaults?')) onReset(); }}
        >
          Reset
        </button>
        <button className="btn-gold text-lg !px-10 !py-3" onClick={onStart}>
          Begin Combat
        </button>
      </div>
    </div>
  );
}
