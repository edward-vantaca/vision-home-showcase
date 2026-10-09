import { useEffect, useState, type ReactNode } from "react";
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

function StickyStageLayer({ content }: { content: ReactNode }) {
  const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
  const vh = typeof window !== "undefined" ? window.innerHeight : 720;
  const width = Math.min(1100, vw - 120);
  const height = Math.min(680, vh - 180);
  return (
    <div
      data-testid="walkthrough-sticky-stage"
      className="absolute bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto"
      style={{
        width,
        height,
        top: (vh - height) / 2,
        left: (vw - width) / 2,
        zIndex: 108,
      }}
    >
      {content}
    </div>
  );
}

export function WalkthroughStage() {
  useWalkthroughKeyboard();
  const { state, advance, getCurrentBeat } = useWalkthrough();
  const [stickyExpand, setStickyExpand] = useState<ReactNode | null>(null);

  const beat = state.active ? getCurrentBeat() : null;

  useEffect(() => {
    if (!state.active) {
      setStickyExpand(null);
      return;
    }
    if (!beat) return;
    if (beat.kind === "expand") {
      setStickyExpand(beat.content);
    } else if (
      beat.kind === "lift" ||
      beat.kind === "highlight" ||
      beat.kind === "navigate" ||
      beat.kind === "return"
    ) {
      setStickyExpand(null);
    }
  }, [state.active, state.currentBeatIndex, beat]);

  if (!state.active) return null;
  if (!beat) return null;

  const showStickyExpand = beat.kind === "annotate" && stickyExpand !== null;

  return createPortal(
    <div
      data-testid="walkthrough-stage"
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 100 }}
    >
      {beat.kind !== "highlight" && (
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-md pointer-events-auto"
          aria-hidden
        />
      )}
      {showStickyExpand ? <StickyStageLayer content={stickyExpand} /> : null}
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
