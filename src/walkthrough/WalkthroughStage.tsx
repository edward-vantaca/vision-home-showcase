import { createPortal } from "react-dom";
import { AnimatePresence } from "motion/react";
import { useWalkthrough } from "./WalkthroughProvider";
import { useWalkthroughKeyboard } from "./keyboard";
import { WalkthroughHUD } from "./WalkthroughHUD";
import type { Beat, BeatProps } from "./types";

type BeatRenderer = (props: BeatProps<Beat>) => JSX.Element;

const beatRenderers: Partial<Record<Beat["kind"], BeatRenderer>> = {};

export function registerBeatRenderer<K extends Beat["kind"]>(
  kind: K,
  renderer: (props: BeatProps<Extract<Beat, { kind: K }>>) => JSX.Element,
) {
  beatRenderers[kind] = renderer as BeatRenderer;
}

// Dynamic import runs after module initialization completes, when beatRenderers is initialized
void import("./beats");

function BeatDispatcher({ beat, onComplete }: BeatProps) {
  const Renderer = beatRenderers[beat.kind];
  if (!Renderer) {
    return <div data-testid="unknown-beat">unknown beat: {beat.kind}</div>;
  }
  return <Renderer beat={beat as never} onComplete={onComplete} />;
}

export function WalkthroughStage() {
  useWalkthroughKeyboard();
  const { state, advance, getCurrentBeat } = useWalkthrough();

  if (!state.active) return null;
  const beat = getCurrentBeat();
  if (!beat) return null;

  return createPortal(
    <div
      data-testid="walkthrough-stage"
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 100 }}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
        aria-hidden
      />
      <div className="relative pointer-events-auto" style={{ zIndex: 110 }}>
        <AnimatePresence mode="popLayout">
          <BeatDispatcher
            key={`beat-${state.currentBeatIndex}`}
            beat={beat}
            onComplete={advance}
          />
        </AnimatePresence>
      </div>
      <WalkthroughHUD />
    </div>,
    document.body,
  );
}
