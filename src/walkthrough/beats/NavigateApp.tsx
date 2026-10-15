import { useEffect } from "react";
import { useWalkthrough } from "../WalkthroughProvider";
import { registerBeatRenderer } from "../WalkthroughStage";
import type { Beat, BeatProps } from "../types";

type NavigateBeat = Extract<Beat, { kind: "navigate" }>;

export function NavigateApp({ beat, onComplete: _onComplete }: BeatProps<NavigateBeat>) {
  const { requestNavigate } = useWalkthrough();

  useEffect(() => {
    requestNavigate(beat.to);
  }, [beat.to, requestNavigate]);

  return <div data-testid="navigate-beat" />;
}

registerBeatRenderer("navigate", NavigateApp);
