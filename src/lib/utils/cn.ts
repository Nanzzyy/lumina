/**
 * Merges class names, filtering out falsy values.
 * Lightweight alternative to clsx + tailwind-merge for this project's needs.
 */
export function cn(...inputs: (string | false | null | undefined)[]): string {
  return inputs.filter(Boolean).join(' ');
}
