import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { resolveTarget } from "../targetRegistry";
import { registerBeatRenderer } from "../WalkthroughStage";
import type { Beat, BeatProps } from "../types";

type HighlightBeat = Extract<Beat, { kind: "highlight" }>;

export function HighlightTarget({ beat, onComplete: _onComplete }: BeatProps<HighlightBeat>) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const el = resolveTarget(beat.target);
    if (!el) {
      console.warn(`[walkthrough] highlight target "${beat.target}" not found`);
      return;
    }
    if (el.scrollIntoView) {
      el.scrollIntoView({ block: "center", behavior: "smooth" });
    }
    setRect(el.getBoundingClientRect());
  }, [beat.target]);

  return (
    <div data-testid="highlight-beat" className="pointer-events-none">
      {rect ? (
        <>
          <div
            className="fixed left-0 right-0 top-0 bg-black/70 backdrop-blur-md pointer-events-auto"
            style={{ height: Math.max(0, rect.top - 8) }}
          />
          <div
            className="fixed left-0 right-0 bottom-0 bg-black/70 backdrop-blur-md pointer-events-auto"
            style={{ top: rect.bottom + 8 }}
          />
          <div
            className="fixed left-0 bg-black/70 backdrop-blur-md pointer-events-auto"
            style={{
              top: rect.top - 8,
              height: rect.height + 16,
              width: Math.max(0, rect.left - 8),
            }}
          />
          <div
            className="fixed right-0 bg-black/70 backdrop-blur-md pointer-events-auto"
            style={{
              top: rect.top - 8,
              height: rect.height + 16,
              left: rect.right + 8,
            }}
          />
          <motion.div
            data-testid="highlight-ring"
            className="absolute rounded-xl border-4 border-[#247ae4] pointer-events-none"
            style={{
              top: rect.top - 8,
              left: rect.left - 8,
              width: rect.width + 16,
              height: rect.height + 16,
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
          />
        </>
      ) : null}
    </div>
  );
}

registerBeatRenderer("highlight", HighlightTarget);
