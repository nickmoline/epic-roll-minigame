import { dieLabel } from '../diceUtils';

const DIE_CONFIGS = {
  // D4 - Tetrahedron: equilateral triangle from above, with edges radiating to base vertex
  4: {
    path: 'M50 12 L92 84 L8 84 Z',
    details: ['M50 12 L50 60', 'M92 84 L50 60', 'M8 84 L50 60'],
    textY: 62,
    fontSize: 24,
  },
  // D6 - Cube: square from above
  6: {
    path: 'M12 12 L88 12 L88 88 L12 88 Z',
    details: [],
    textY: 52,
    fontSize: 32,
  },
  // D8 - Octahedron: diamond (rotated square), cross lines show 4 visible faces
  8: {
    path: 'M50 5 L95 50 L50 95 L5 50 Z',
    details: ['M50 5 L50 95', 'M5 50 L95 50'],
    textY: 52,
    fontSize: 26,
  },
  // D10 - Pentagonal trapezohedron: elongated kite from 3/4 view with equator ridge
  10: {
    path: 'M50 3 L95 42 L76 90 L50 97 L24 90 L5 42 Z',
    details: [
      'M5 42 L95 42',
      'M50 3 L50 97',
    ],
    textY: 55,
    fontSize: 24,
  },
  // D12 - Dodecahedron: flat-top pentagon (rotated from D10), edges radiate to center
  12: {
    path: 'M76 14 L92 64 L50 94 L8 64 L24 14 Z',
    details: [
      'M76 14 L50 50', 'M92 64 L50 50', 'M50 94 L50 50',
      'M8 64 L50 50', 'M24 14 L50 50',
    ],
    textY: 52,
    fontSize: 22,
  },
  // D20 - Icosahedron: hexagonal silhouette from 3/4 view with triangular face divisions
  20: {
    path: 'M50 3 L93 27 L89 73 L50 97 L11 73 L7 27 Z',
    details: [
      'M7 27 L93 27',
      'M11 73 L89 73',
      'M50 27 L11 73',
      'M50 27 L89 73',
    ],
    textY: 52,
    fontSize: 24,
  },
};

const TEAM_COLORS = {
  good: { fill: 'rgba(21,128,61,0.45)', stroke: '#15803d', detail: 'rgba(21,128,61,0.25)', text: '#bbf7d0' },
  bad:  { fill: 'rgba(220,38,38,0.45)', stroke: '#dc2626', detail: 'rgba(220,38,38,0.25)', text: '#fecaca' },
};

export function DieShape({ sides, value, decreased, team, className = 'w-16 h-16' }) {
  const config = DIE_CONFIGS[sides] || DIE_CONFIGS[12];
  const tc = !decreased && team ? TEAM_COLORS[team] : null;
  const stroke = decreased ? '#ca8a04' : tc ? tc.stroke : '#a8a29e';
  const fill = decreased ? 'rgba(113,63,18,0.4)' : tc ? tc.fill : 'rgba(68,64,60,0.3)';
  const detailStroke = decreased ? 'rgba(202,138,4,0.3)' : tc ? tc.detail : 'rgba(168,162,158,0.2)';
  const textFill = decreased ? '#facc15' : tc ? tc.text : '#e7e5e4';
  const display = value !== undefined ? value : sides;

  return (
    <svg viewBox="0 0 100 100" className={`${className} shrink-0`}>
      <path
        d={config.path}
        fill={fill}
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {config.details.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke={detailStroke}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      ))}
      <text
        x="50"
        y={config.textY}
        textAnchor="middle"
        dominantBaseline="central"
        fill={textFill}
        fontFamily="Cinzel, serif"
        fontWeight="700"
        fontSize={config.fontSize}
      >
        {display}
      </text>
    </svg>
  );
}

export default function DieDisplay({ goodDie, badDie, goodBaseDie, badBaseDie, goodName, badName }) {
  const goodDecreased = goodDie !== goodBaseDie;
  const badDecreased = badDie !== badBaseDie;

  return (
    <div className="flex gap-4 sm:gap-8">
      <div className="flex-1 flex items-center justify-center gap-3 parchment-panel p-3">
        <DieShape sides={goodDie} decreased={goodDecreased} team="good" />
        <div className="text-left">
          <div className="text-xs text-text-dim uppercase tracking-wider">{goodName}</div>
          <div className="font-cinzel font-bold text-sm">{dieLabel(goodDie)}</div>
          {goodDecreased && (
            <div className="text-xs text-yellow-400">Reduced from {dieLabel(goodBaseDie)}</div>
          )}
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center gap-3 parchment-panel p-3">
        <DieShape sides={badDie} decreased={badDecreased} team="bad" />
        <div className="text-left">
          <div className="text-xs text-text-dim uppercase tracking-wider">{badName}</div>
          <div className="font-cinzel font-bold text-sm">{dieLabel(badDie)}</div>
          {badDecreased && (
            <div className="text-xs text-yellow-400">Reduced from {dieLabel(badBaseDie)}</div>
          )}
        </div>
      </div>
    </div>
  );
}
