import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { resolveTarget } from "../targetRegistry";
import { registerBeatRenderer } from "../WalkthroughStage";
import type { Beat, BeatProps } from "../types";

type LiftBeat = Extract<Beat, { kind: "lift" }>;

export function LiftToStage({ beat, onComplete }: BeatProps<LiftBeat>) {
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);
  const [originOuterHTML, setOriginOuterHTML] = useState<string>("");
  const firedRef = useRef(false);

  useEffect(() => {
    const el = resolveTarget(beat.target);
    if (!el) {
      console.warn(`[walkthrough] lift target "${beat.target}" not found`);
      if (!firedRef.current) {
        firedRef.current = true;
        queueMicrotask(onComplete);
      }
      return;
    }
    el.scrollIntoView({ block: "center", behavior: "smooth" });
    setOriginRect(el.getBoundingClientRect());
    setOriginOuterHTML(el.outerHTML);
    el.style.visibility = "hidden";
    return () => {
      el.style.visibility = "";
    };
  }, [beat.target, onComplete]);

  const scale = beat.scale ?? 1.4;
  const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
  const vh = typeof window !== "undefined" ? window.innerHeight : 720;

  return (
    <div data-testid="lift-beat">
      {originRect ? (
        <motion.div
          layoutId={`walkthrough-target-${beat.target}`}
          className="absolute overflow-hidden"
          style={{ transformOrigin: "top left" }}
          initial={{
            top: originRect.top,
            left: originRect.left,
            width: originRect.width,
            height: originRect.height,
            scale: 1,
          }}
          animate={{
            top: beat.position === "center" || !beat.position
              ? (vh - originRect.height * scale) / 2
              : beat.position.y,
            left: beat.position === "center" || !beat.position
              ? (vw - originRect.width * scale) / 2
              : beat.position.x,
            width: originRect.width,
            height: originRect.height,
            scale: scale,
          }}
          transition={{ type: "spring", stiffness: 180, damping: 24 }}
          onAnimationComplete={() => {
            /* Lift stays visible until advance; onComplete fires only when user advances */
          }}
          dangerouslySetInnerHTML={{ __html: originOuterHTML }}
        />
      ) : null}
    </div>
  );
}

registerBeatRenderer("lift", LiftToStage);
