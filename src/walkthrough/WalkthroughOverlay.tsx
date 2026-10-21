import { useLayoutEffect } from "react";
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

  // Sticky stage: when annotate is active, keep the preceding lift/expand mounted
  // so the staged element stays on screen while GSAP paints annotations on top.
  const prevBeat =
    cursor.beatIndex > 0 ? scene?.beats[cursor.beatIndex - 1] : undefined;
  const stageBeat: Beat | undefined =
    beat?.kind === "annotate" && (prevBeat?.kind === "lift" || prevBeat?.kind === "expand")
      ? prevBeat
      : beat;

  const target =
    stageBeat && (stageBeat.kind === "highlight" || stageBeat.kind === "lift" || stageBeat.kind === "expand")
      ? stageBeat.target
      : null;
  const rect = useTargetRect(target);
  const kind = beat?.kind ?? "idle";
  const caption = captionOf(beat);

  // Scene-scoped hooks for ::view-transition pseudo-elements. Those live on
  // :root, so we tag the <html> element with the current scene id to let CSS
  // target scene-specific pseudo rules (e.g. hiding the root snapshot while
  // the payments scene is active so its live backdrop can paint through).
  // useLayoutEffect — the attribute MUST be in place before the browser
  // captures the view-transition's new snapshot, which happens between React's
  // commit and the next frame paint.
  useLayoutEffect(() => {
    const sceneId = scene?.id;
    if (!sceneId) {
      document.documentElement.removeAttribute("data-walkthrough-scene");
      return;
    }
    document.documentElement.setAttribute("data-walkthrough-scene", sceneId);
    return () => {
      document.documentElement.removeAttribute("data-walkthrough-scene");
    };
  }, [scene?.id]);

  return (
    <div className="wt-root" data-scene={scene?.id} aria-hidden={kind === "idle"}>
      <div className="wt-backdrop" data-beat-kind={kind} />
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
        />
      )}
      {beat?.kind === "intro" && (
        <IntroBeat title={beat.title} logoSrc={beat.logoSrc} wordmark={beat.wordmark} />
      )}
    </div>
  );
}
