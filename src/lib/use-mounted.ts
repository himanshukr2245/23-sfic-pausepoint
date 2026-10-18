// lib/use-mounted.ts — React 19 / SSR-safe mounted hook using useSyncExternalStore.
// Zero cascading renders, zero setState-in-effect violations, zero hydration mismatch.
import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
