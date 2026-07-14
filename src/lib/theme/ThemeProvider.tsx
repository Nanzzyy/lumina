'use client';

import { useCallback, useRef, useEffect, type ReactNode } from 'react';
import type { ThemeConfig, DeepPartial } from './types';
import { defaultTheme } from './defaults';

function deepMerge(base: any, overrides: any): any {
  const result = { ...base };
  for (const key of Object.keys(overrides)) {
    const o = overrides[key];
    if (o !== undefined && typeof o === 'object' && !Array.isArray(o) && typeof result[key] === 'object' && result[key] !== null) {
      result[key] = deepMerge(result[key], o);
    } else if (o !== undefined) {
      result[key] = o;
    }
  }
  return result;
}

function themeToCSSVars(theme: ThemeConfig, scope?: string): string {
  const parts: string[] = [];
  const walk = (obj: Record<string, any>, prefix: string) => {
    for (const [key, value] of Object.entries(obj)) {
      const k = `${prefix}-${key}`;
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        walk(value, k);
      } else {
        parts.push(`  ${k}: ${value};`);
      }
    }
  };
  walk(theme as any, '--');
  const selector = scope || ':root';
  return `${selector} {\n${parts.join('\n')}\n}`;
}

interface ThemeProviderProps {
  children: ReactNode;
  theme?: DeepPartial<ThemeConfig>;
  scopeClass?: string;
}

export function ThemeProvider({ children, theme: initialTheme, scopeClass }: ThemeProviderProps) {
  const styleRef = useRef<HTMLStyleElement | null>(null);
  const resolved = useRef(defaultTheme);

  const injectCSSVars = useCallback((theme: ThemeConfig) => {
    if (!styleRef.current) {
      styleRef.current = document.createElement('style');
      styleRef.current.setAttribute('data-lumina-theme', scopeClass || 'root');
      document.head.appendChild(styleRef.current);
    }
    styleRef.current.textContent = themeToCSSVars(theme, scopeClass ? `.${scopeClass}` : undefined);
  }, [scopeClass]);

  useEffect(() => {
    const merged = initialTheme ? deepMerge(defaultTheme, initialTheme as DeepPartial<ThemeConfig>) : defaultTheme;
    resolved.current = merged;
    injectCSSVars(merged);
  }, [initialTheme, injectCSSVars]);

  return scopeClass ? <div className={scopeClass}>{children}</div> : <>{children}</>;
}
