'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { copyText } from '@/lib/utils/clipboard';

/**
 * "Copy → show Tersalin → revert" behaviour that every gift/bank-account block
 * re-implemented with its own `copiedIdx` state plus a bare `setTimeout`.
 * `copiedKey` identifies which item was copied (the item's index, or the text
 * itself when no key is given); it resets after `resetMs`.
 */
export function useCopyFeedback<K = number>(resetMs = 2500) {
  const [copiedKey, setCopiedKey] = useState<K | string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const copy = useCallback(
    (text: string, key?: K) => {
      void copyText(text);
      setCopiedKey(key ?? text);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopiedKey(null), resetMs);
    },
    [resetMs],
  );

  return { copiedKey, copy };
}
