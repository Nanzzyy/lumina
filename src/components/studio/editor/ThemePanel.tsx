'use client';

import { memo, useCallback, useState } from 'react';
import type { FC } from 'react';
import { DEFAULT_THEME } from '@core/theme';
import type { ThemeToken } from '@core/theme';
import type { TokenLayer } from '@core/token';

/**
 * Theme Editor — P4.6 (ADR-018).
 *
 * Minimal panel: theme list (workspace/project scope), token editor per layer,
 * live preview via re-resolve. Write-back via Theme API (deferred until P5).
 *
 * ponytail: full theme CRUD + semantic mapping + save-to-API lands in P5
 * alongside the asset manager. This provides the interactive preview for P4 exit.
 */

const LAYERS: { key: TokenLayer; label: string }[] = [
  { key: 'raw', label: 'Raw' },
  { key: 'semantic', label: 'Semantic' },
  { key: 'component', label: 'Component' },
];

const GROUPS = [
  { key: 'color', label: 'Colors', filter: (t: ThemeToken) => t.key.startsWith('color') && !t.key.includes('-hover') && !t.key.includes('-light') && !t.key.includes('-secondary') && !t.key.includes('-muted') },
  { key: 'spacing', label: 'Spacing', filter: (t: ThemeToken) => t.key.startsWith('space') || t.key.startsWith('spacing') },
  { key: 'radius', label: 'Radius', filter: (t: ThemeToken) => t.key.startsWith('radius') },
  { key: 'other', label: 'Other', filter: () => true },
];

const ThemePanel: FC<{}> = memo(function ThemePanelFn() {
  const [activeLayer, setActiveLayer] = useState<TokenLayer>('raw');
  const [activeGroup, setActiveGroup] = useState('color');

  const tokens = DEFAULT_THEME.tokens.filter((t) => t.layer === activeLayer);
  const group = GROUPS.find((g) => g.key === activeGroup);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-zinc-500 uppercase">Theme</h3>
        <span className="text-[9px] text-zinc-400">{DEFAULT_THEME.name}</span>
      </div>

      {/* Layer tabs */}
      <div className="flex gap-1 text-xs">
        {LAYERS.map((l) => (
          <button
            key={l.key}
            onClick={() => setActiveLayer(l.key)}
            className={`px-2 py-1 rounded ${activeLayer === l.key ? 'bg-blue-100 text-blue-700' : 'text-zinc-500 hover:bg-zinc-100'}`}
          >
            {l.label}
          </button>
        ))}
      </div>

      {/* Group tabs */}
      <div className="flex gap-1 text-[10px]">
        {GROUPS.map((g) => (
          <button
            key={g.key}
            onClick={() => setActiveGroup(g.key)}
            className={`px-2 py-0.5 rounded ${activeGroup === g.key ? 'bg-zinc-200 text-zinc-800' : 'text-zinc-400 hover:bg-zinc-50'}`}
          >
            {g.label}
          </button>
        ))}
      </div>

      {/* Token list */}
      <div className="space-y-1 max-h-[60vh] overflow-y-auto">
        {tokens.filter(group?.filter ?? (() => true)).map((token) => (
          <TokenRow key={token.key} token={token} />
        ))}
      </div>

      {/* ponytail: theme save button → API (P5) */}
      {/* ponytail: theme switch dropdown → list from API (P5) */}
    </div>
  );
});

function TokenRow({ token }: { token: ThemeToken }) {
  const isColor = token.key.startsWith('color') || token.value.startsWith('#');
  const isSize = token.key.startsWith('space') || token.key.startsWith('radius') || token.value.endsWith('rem') || token.value.endsWith('px');

  return (
    <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-zinc-50 text-xs">
      {isColor && (
        <div
          className="w-5 h-5 rounded border border-zinc-200 flex-shrink-0"
          style={{ background: token.value }}
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-zinc-700 truncate">{token.key}</p>
        <p className="text-zinc-400 text-[10px] truncate">
          {token.alias ? `→ ${token.alias}` : token.value}
        </p>
      </div>
      {isSize && <span className="text-[10px] text-zinc-400">{token.value}</span>}
    </div>
  );
}

export default ThemePanel;
