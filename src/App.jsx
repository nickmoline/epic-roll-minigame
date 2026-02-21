import { useCombat } from './hooks/useCombat';
import SetupScreen from './components/SetupScreen';
import CombatScreen from './components/CombatScreen';
import VictoryScreen from './components/VictoryScreen';

export default function App() {
  const { state, updateConfig, startCombat, resolveRound, undoRound, newCombat, presets, savePreset, loadPreset, deletePreset } = useCombat();

  if (state.phase === 'setup') {
    return (
      <SetupScreen
        config={state.config}
        onUpdateConfig={updateConfig}
        onStart={startCombat}
        onReset={newCombat}
        presets={presets}
        onSavePreset={savePreset}
        onLoadPreset={loadPreset}
        onDeletePreset={deletePreset}
      />
    );
  }

  if (state.phase === 'victory') {
    return (
      <VictoryScreen
        state={state}
        onNewCombat={newCombat}
      />
    );
  }

  return (
    <CombatScreen
      state={state}
      onResolve={resolveRound}
      onUndo={undoRound}
      onNewCombat={newCombat}
    />
  );
}
