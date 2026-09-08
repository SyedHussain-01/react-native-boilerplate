import { useEffect, useState } from "react";

/**
 * Returns `value` after it has stayed unchanged for `delayMs`.
 * If `value` becomes empty, updates immediately (no wait) so clears feel instant.
 */
export function useDebouncedValue(
  value: string,
  delayMs: number,
  options?: { flushEmpty?: boolean },
): string {
  const flushEmpty = options?.flushEmpty !== false;

  const [debounced, setDebounced] = useState(() => value ?? "");

  useEffect(() => {
    const next = value ?? "";
    if (flushEmpty && next?.trim?.() === "") {
      setDebounced("");
      return;
    }
    const id = setTimeout(() => {
      setDebounced(next);
    }, delayMs);
    return () => clearTimeout(id);
  }, [delayMs, flushEmpty, value]);

  return debounced;
}
