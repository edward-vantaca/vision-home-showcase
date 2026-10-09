import { useCallback } from "react";
import { registerTarget, unregisterTarget } from "./targetRegistry";

export function useWalkthroughTarget(id: string): (el: HTMLElement | null) => void {
  return useCallback(
    (el: HTMLElement | null) => {
      if (el) registerTarget(id, el);
      else unregisterTarget(id);
    },
    [id],
  );
}
