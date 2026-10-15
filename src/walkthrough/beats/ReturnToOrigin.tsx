import { registerBeatRenderer } from "../WalkthroughStage";
import type { Beat, BeatProps } from "../types";

type ReturnBeat = Extract<Beat, { kind: "return" }>;

export function ReturnToOrigin({ beat: _beat, onComplete: _onComplete }: BeatProps<ReturnBeat>) {
  return <div data-testid="return-beat" />;
}

registerBeatRenderer("return", ReturnToOrigin);
