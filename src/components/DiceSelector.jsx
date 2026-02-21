import { DICE, dieLabel } from '../diceUtils';

export default function DiceSelector({ value, onChange, label }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs text-text-dim uppercase tracking-wide">{label}</label>}
      <select
        className="input-field"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        {DICE.map((d) => (
          <option key={d} value={d}>{dieLabel(d)}</option>
        ))}
      </select>
    </div>
  );
}
