import { useEffect } from "react";
import { useWalkthrough } from "../WalkthroughProvider";
import { registerBeatRenderer } from "../WalkthroughStage";
import type { Beat, BeatProps } from "../types";

type NavigateBeat = Extract<Beat, { kind: "navigate" }>;

export function NavigateApp({ beat, onComplete }: BeatProps<NavigateBeat>) {
  const { requestNavigate } = useWalkthrough();

  useEffect(() => {
    let cancelled = false;
    requestNavigate(beat.to);
    const timer = setTimeout(() => {
      if (!cancelled) onComplete();
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [beat.to, requestNavigate, onComplete]);

  return <div data-testid="navigate-beat" />;
}

registerBeatRenderer("navigate", NavigateApp);
