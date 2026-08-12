'use client';

import { useMemo } from 'react';
import type { DeepPartial, ThemeConfig, ThemeTypography } from '@/lib/theme/types';
import {
  FONT_OPTIONS,
  FONT_PRESETS,
  getRecommendedFontPreset,
  getRecommendedTypography,
  typographyFromPreset,
} from '@/lib/theme/fonts';

interface FontCustomizerProps {
  overrides: DeepPartial<ThemeConfig>;
  onChange: (overrides: DeepPartial<ThemeConfig>) => void;
  templateId?: string;
  baseTypography?: Partial<ThemeTypography>;
}

const selectClass = 'w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[var(--colors-primary)] focus:border-transparent';

export function FontCustomizer({ overrides, onChange, templateId, baseTypography }: FontCustomizerProps) {
  const recommendedPreset = getRecommendedFontPreset(templateId);
  const recommended = getRecommendedTypography(templateId);
  const activeTypography = useMemo(() => ({
    ...recommended,
    ...(baseTypography || {}),
    ...((overrides.typography || {}) as Partial<ThemeTypography>),
  }), [baseTypography, overrides.typography, recommended]);

  const setFont = (key: keyof ThemeTypography, value: string) => {
    onChange({
      ...overrides,
      typography: { ...((overrides.typography || {}) as Partial<ThemeTypography>), [key]: value },
    });
  };

  const applyPreset = (presetId: string) => {
    const preset = FONT_PRESETS.find((item) => item.id === presetId);
    if (!preset) return;
    onChange({ ...overrides, typography: typographyFromPreset(preset) });
  };

  const reset = () => {
    const next = { ...overrides };
    delete next.typography;
    onChange(next);
  };

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="text-sm font-semibold text-zinc-800">Gaya Font Undangan</h3>
            <p className="text-xs text-zinc-500 mt-1">Atur nama mempelai, judul section, isi, dan aksen secara terpisah.</p>
          </div>
          <button type="button" onClick={reset} className="text-xs text-zinc-400 hover:text-[var(--colors-primary)] whitespace-nowrap">
            Kembalikan default
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {FONT_PRESETS.map((preset) => {
            const presetTypography = typographyFromPreset(preset);
            const selected = Object.entries(presetTypography).every(([key, value]) => activeTypography[key as keyof ThemeTypography] === value);
            return (
              <button
                type="button"
                key={preset.id}
                onClick={() => applyPreset(preset.id)}
                className={`text-left rounded-xl border p-3 transition-all ${selected ? 'border-[var(--colors-primary)] bg-[var(--colors-primary-light)] ring-1 ring-[var(--colors-primary)]/20' : 'border-zinc-200 hover:border-[var(--colors-primary)]/50 hover:bg-zinc-50'}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-zinc-800">{preset.name}</span>
                  {preset.id === recommendedPreset.id && <span className="text-[9px] rounded-full bg-white px-2 py-0.5 text-[var(--colors-primary)]">Cocok untuk template</span>}
                </div>
                <span className="mt-1 block text-[10px] leading-relaxed text-zinc-500">{preset.description}</span>
                <span className="mt-2 block text-lg text-zinc-700" style={{ fontFamily: typographyFromPreset(preset)['font-heading'] }}>Alya &amp; Raka</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <FontSelect label="Nama pengantin" value={activeTypography['font-name'] || activeTypography['font-heading'] || ''} onChange={(value) => setFont('font-name', value)} options={FONT_OPTIONS} />
        <FontSelect label="Heading / judul" value={activeTypography['font-heading'] || ''} onChange={(value) => setFont('font-heading', value)} options={FONT_OPTIONS.filter((font) => !font.category.includes('Script'))} />
        <FontSelect label="Isi teks" value={activeTypography['font-body'] || ''} onChange={(value) => setFont('font-body', value)} options={FONT_OPTIONS.filter((font) => !font.category.includes('Script'))} />
        <FontSelect label="Aksen & pemanis" value={activeTypography['font-accent'] || ''} onChange={(value) => setFont('font-accent', value)} options={FONT_OPTIONS.filter((font) => font.category === 'Script' || font.category === 'Romantis' || font.category === 'Elegan')} />
      </div>

      <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 px-5 py-4 text-center">
        <p className="text-[10px] uppercase tracking-[0.28em] text-zinc-400" style={{ fontFamily: activeTypography['font-body'] }}>The Wedding Of</p>
        <p className="mt-2 text-3xl leading-tight text-zinc-800" style={{ fontFamily: activeTypography['font-name'] || activeTypography['font-heading'] }}>Alya &amp; Raka</p>
        <p className="mt-3 text-base font-semibold text-zinc-700" style={{ fontFamily: activeTypography['font-heading'] }}>Heading Section</p>
        <p className="mt-2 text-sm text-zinc-500" style={{ fontFamily: activeTypography['font-accent'] }}>Sebuah cerita untuk selamanya</p>
      </div>
    </div>
  );
}

function FontSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: typeof FONT_OPTIONS }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className={selectClass}>
        {options.map((font) => <option key={font.id} value={font.family}>{font.label}</option>)}
      </select>
    </label>
  );
}

export default FontCustomizer;
