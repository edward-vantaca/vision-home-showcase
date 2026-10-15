import { useCursor } from "./cursor";
import { useTargetRect } from "./useTargetRect";
import type { Beat } from "./types";
import "./walkthrough.css";
import { HighlightBeat } from "./beats/HighlightBeat";
import { LiftBeat } from "./beats/LiftBeat";
import { ExpandBeat } from "./beats/ExpandBeat";
import { AnnotateBeat } from "./beats/AnnotateBeat";

function cutoutClipPath(rect: DOMRect | null): string | undefined {
  if (!rect) return undefined;
  const { left: l, top: t, right: r, bottom: b } = rect;
  // polygon traces outer viewport, dives into the hole and back out
  return `polygon(0 0, 100vw 0, 100vw 100vh, 0 100vh, 0 0, ${l}px ${t}px, ${l}px ${b}px, ${r}px ${b}px, ${r}px ${t}px, ${l}px ${t}px, 0 0)`;
}

function captionOf(beat: Beat | undefined): string | null {
  if (!beat) return null;
  if ("caption" in beat && beat.caption) return beat.caption;
  if (beat.kind === "narrate") return beat.body;
  return null;
}

export function WalkthroughOverlay() {
  const { beat } = useCursor();
  const target =
    beat && (beat.kind === "highlight" || beat.kind === "lift" || beat.kind === "expand") ? beat.target : null;
  const rect = useTargetRect(target);
  const kind = beat?.kind ?? "idle";
  const caption = captionOf(beat);

  return (
    <div className="wt-root" aria-hidden={kind === "idle"}>
      <div className="wt-backdrop" data-beat-kind={kind} />
      {kind === "highlight" && rect && (
        <div className="wt-cutout" style={{ clipPath: cutoutClipPath(rect) }} />
      )}
      {caption && <div className="wt-caption">{caption}</div>}
      {beat?.kind === "highlight" && <HighlightBeat target={beat.target} />}
      {beat?.kind === "lift" && <LiftBeat target={beat.target} scale={beat.scale} position={beat.position} />}
      {beat?.kind === "expand" && <ExpandBeat target={beat.target}>{beat.content}</ExpandBeat>}
      {beat?.kind === "annotate" && <AnnotateBeat tracks={beat.tracks} durationMs={beat.durationMs} />}
    </div>
  );
}
