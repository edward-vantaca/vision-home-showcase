import { registerBeatRenderer } from "../WalkthroughStage";
import type { Beat, BeatProps } from "../types";
import { useEffect } from "react";

type ReturnBeat = Extract<Beat, { kind: "return" }>;

export function ReturnToOrigin({ beat: _beat, onComplete }: BeatProps<ReturnBeat>) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return <div data-testid="return-beat" />;
}

registerBeatRenderer("return", ReturnToOrigin);
