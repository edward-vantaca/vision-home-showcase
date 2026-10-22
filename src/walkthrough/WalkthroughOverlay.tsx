import { useState } from "react";
import { useCursor } from "./cursor";
import { useTargetRect } from "./useTargetRect";
import type { Beat } from "./types";
import "./walkthrough.css";
import { HighlightBeat } from "./beats/HighlightBeat";
import { LiftBeat } from "./beats/LiftBeat";
import { ExpandBeat } from "./beats/ExpandBeat";
import { AnnotateBeat } from "./beats/AnnotateBeat";
import { CursorBeat } from "./beats/CursorBeat";
import { IntroBeat } from "./beats/IntroBeat";

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
  const { beat, cursor, scene, direction } = useCursor();

  // Sticky stage: when annotate or cursor is active, keep the preceding
  // lift/expand mounted so the staged element stays on screen while GSAP paints
  // annotations on top or the cursor clicks something on it. A cursor stop with
  // releaseStage lets the element go mid-beat (e.g. once a modal covers it).
  // The release lasts only for the beat visit it happened in: any cursor or
  // direction change (including a replay of the same beat) re-holds the stage.
  const beatKey = `${cursor.sceneIndex}:${cursor.beatIndex}:${direction}`;
  const [release, setRelease] = useState({ key: beatKey, released: false });
  if (release.key !== beatKey) setRelease({ key: beatKey, released: false });
  const stageReleased = release.key === beatKey && release.released;
  const prevBeat =
    cursor.beatIndex > 0 ? scene?.beats[cursor.beatIndex - 1] : undefined;
  const holdsStage =
    (beat?.kind === "annotate" || beat?.kind === "cursor") &&
    (prevBeat?.kind === "lift" || prevBeat?.kind === "expand") &&
    !stageReleased;
  const stageBeat: Beat | undefined = holdsStage ? prevBeat : beat;

  const target =
    stageBeat && (stageBeat.kind === "highlight" || stageBeat.kind === "lift" || stageBeat.kind === "expand")
      ? stageBeat.target
      : null;
  const rect = useTargetRect(target);
  const kind = beat?.kind ?? "idle";
  // The backdrop follows whatever holds the stage, so it stays up while a
  // staged lift is held through a cursor beat.
  const backdropKind = stageBeat?.kind ?? "idle";
  const caption = captionOf(beat);

  return (
    <div className="wt-root" data-scene={scene?.id} aria-hidden={kind === "idle"}>
      <div className="wt-backdrop" data-beat-kind={backdropKind} />
      {kind === "highlight" && rect && (
        <div className="wt-cutout" style={{ clipPath: cutoutClipPath(rect) }} />
      )}
      {caption && <div className="wt-caption">{caption}</div>}
      {beat?.kind === "highlight" && <HighlightBeat target={beat.target} />}
      {stageBeat?.kind === "lift" && (
        <LiftBeat target={stageBeat.target} scale={stageBeat.scale} position={stageBeat.position} />
      )}
      {stageBeat?.kind === "expand" && (
        <ExpandBeat target={stageBeat.target}>{stageBeat.content}</ExpandBeat>
      )}
      {beat?.kind === "annotate" && <AnnotateBeat tracks={beat.tracks} durationMs={beat.durationMs} />}
      {beat?.kind === "cursor" && (
        <CursorBeat
          to={beat.to}
          action={beat.action}
          durationMs={beat.durationMs}
          direction={direction}
          typeText={beat.typeText}
          typeCps={beat.typeCps}
          then={beat.then}
          holdMs={beat.holdMs}
          releaseStage={beat.releaseStage}
          onReleaseStage={() => setRelease({ key: beatKey, released: true })}
        />
      )}
      {beat?.kind === "intro" && (
        <IntroBeat title={beat.title} logoSrc={beat.logoSrc} wordmark={beat.wordmark} />
      )}
    </div>
  );
}
