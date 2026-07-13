'use client';

import {
  createContext,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  type ReactNode,
} from 'react';
import type { ThemeConfig, DeepPartial } from './types';
import { defaultTheme } from './defaults';

interface ThemeContextValue {
  theme: ThemeConfig;
  updateTheme: (overrides: DeepPartial<ThemeConfig>) => void;
  resetTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextValue>({
  theme: defaultTheme,
  updateTheme: () => {},
  resetTheme: () => {},
});

/**
 * Flattens a nested theme config into CSS custom property declarations.
 * e.g. { colors: { primary: '#db2777' } } → `--color-primary: #db2777`
 * When scope is provided, vars are scoped to that selector instead of :root.
 */
function themeToCSSVars(theme: ThemeConfig, scope?: string): string {
  const parts: string[] = [];

  for (const [category, values] of Object.entries(theme)) {
    for (const [key, value] of Object.entries(values as Record<string, string>)) {
      parts.push(`  --${category}-${key.replace(/_/g, '-')}: ${value};`);
    }
  }

  const selector = scope || ':root';
  return `${selector} {\n${parts.join('\n')}\n}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deepMerge(base: any, overrides: any): any {
  const result = { ...base };

  for (const key of Object.keys(overrides)) {
    const override = overrides[key];
    if (
      override !== undefined &&
      typeof override === 'object' &&
      !Array.isArray(override) &&
      typeof result[key] === 'object' &&
      result[key] !== null
    ) {
      result[key] = deepMerge(result[key], override);
    } else if (override !== undefined) {
      result[key] = override;
    }
  }

  return result;
}

interface ThemeProviderProps {
  children: ReactNode;
  theme?: DeepPartial<ThemeConfig>;
  /** CSS scope class — when set, vars are scoped to this class & children wrapped in <div className={scopeClass}>. */
  scopeClass?: string;
}

export function ThemeProvider({
  children,
  theme: initialTheme,
  scopeClass,
}: ThemeProviderProps) {
  const styleRef = useRef<HTMLStyleElement | null>(null);
  const resolved = initialTheme
    ? deepMerge(defaultTheme, initialTheme as DeepPartial<ThemeConfig>)
    : defaultTheme;
  const themeRef = useRef<ThemeConfig>(resolved);

  const scopeSelector = scopeClass ? `.${scopeClass}` : undefined;

  const injectCSSVars = useCallback((theme: ThemeConfig) => {
    if (!styleRef.current) {
      styleRef.current = document.createElement('style');
      styleRef.current.id = scopeClass
        ? `lumina-theme-${scopeClass}`
        : 'lumina-theme-vars';
      document.head.appendChild(styleRef.current);
    }
    styleRef.current.textContent = themeToCSSVars(theme, scopeSelector);
  }, [scopeSelector, scopeClass]);

  const updateTheme = useCallback(
    (overrides: DeepPartial<ThemeConfig>) => {
      themeRef.current = deepMerge(themeRef.current, overrides);
      injectCSSVars(themeRef.current);
    },
    [injectCSSVars],
  );

  const resetTheme = useCallback(() => {
    themeRef.current = defaultTheme;
    injectCSSVars(defaultTheme);
  }, [injectCSSVars]);

  // On mount, inject the resolved theme
  useEffect(() => {
    injectCSSVars(themeRef.current);
  }, [injectCSSVars]);

  const value = useMemo(
    () => ({
      theme: themeRef.current,
      updateTheme,
      resetTheme,
    }),
    [updateTheme, resetTheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      {scopeClass ? (
        <div className={scopeClass}>{children}</div>
      ) : (
        children
      )}
    </ThemeContext.Provider>
  );
}
