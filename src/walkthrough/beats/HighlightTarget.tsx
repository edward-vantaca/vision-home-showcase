import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { resolveTarget } from "../targetRegistry";
import { registerBeatRenderer } from "../WalkthroughStage";
import type { Beat, BeatProps } from "../types";

type HighlightBeat = Extract<Beat, { kind: "highlight" }>;

export function HighlightTarget({ beat, onComplete }: BeatProps<HighlightBeat>) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const firedRef = useRef(false);

  useEffect(() => {
    const el = resolveTarget(beat.target);
    if (!el) {
      console.warn(`[walkthrough] highlight target "${beat.target}" not found`);
      if (!firedRef.current) {
        firedRef.current = true;
        queueMicrotask(onComplete);
      }
      return;
    }
    if (el.scrollIntoView) {
      el.scrollIntoView({ block: "center", behavior: "smooth" });
    }
    setRect(el.getBoundingClientRect());
  }, [beat.target, onComplete]);

  return (
    <div data-testid="highlight-beat" className="pointer-events-none">
      {rect ? (
        <motion.div
          data-testid="highlight-ring"
          className="absolute rounded-xl border-4 border-[#247ae4]"
          style={{
            top: rect.top - 8,
            left: rect.left - 8,
            width: rect.width + 16,
            height: rect.height + 16,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.4)",
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 22 }}
        />
      ) : null}
    </div>
  );
}

registerBeatRenderer("highlight", HighlightTarget);
