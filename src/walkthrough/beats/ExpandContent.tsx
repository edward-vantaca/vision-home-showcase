import { motion } from "motion/react";
import { registerBeatRenderer } from "../WalkthroughStage";
import type { Beat, BeatProps } from "../types";

type ExpandBeat = Extract<Beat, { kind: "expand" }>;

export function ExpandContent({ beat }: BeatProps<ExpandBeat>) {
  const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
  const vh = typeof window !== "undefined" ? window.innerHeight : 720;
  const width = Math.min(1100, vw - 120);
  const height = Math.min(680, vh - 180);

  return (
    <motion.div
      data-testid="expand-beat"
      className="absolute bg-white rounded-2xl shadow-2xl overflow-hidden"
      layout
      layoutId={beat.target ? `walkthrough-target-${beat.target}` : undefined}
      initial={{
        width: width * 0.6,
        height: height * 0.6,
        top: (vh - height * 0.6) / 2,
        left: (vw - width * 0.6) / 2,
      }}
      animate={{
        width,
        height,
        top: (vh - height) / 2,
        left: (vw - width) / 2,
      }}
      transition={{ type: "spring", stiffness: 160, damping: 24 }}
    >
      {beat.content}
    </motion.div>
  );
}

registerBeatRenderer("expand", ExpandContent);
