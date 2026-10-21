import { useLayoutEffect, useState } from "react";
import type { Point } from "../types";

type Props = {
  target: string;
  scale?: number;
  position?: "center" | Point;
};

type Snapshot = { html: string; width: number; height: number; className: string };

function findScene(name: string): HTMLElement | null {
  // The scene-side element — not the stage slot (which has class wt-stage-slot).
  const all = Array.from(document.querySelectorAll<HTMLElement>(`[data-vt-name="${name}"]`));
  return all.find((el) => !el.classList.contains("wt-stage-slot")) ?? null;
}

export function LiftBeat({ target, scale = 1.4, position = "center" }: Props) {
  // Capture content + dimensions during the render inside startViewTransition so
  // the stage slot has size and content on its FIRST commit — otherwise the
  // browser snapshots a 0×0 empty slot and skips the morph animation.
  const [snapshot] = useState<Snapshot | null>(() => {
    if (typeof document === "undefined") return null;
    const scene = findScene(target);
    if (!scene) return null;
    const rect = scene.getBoundingClientRect();
    return {
      html: scene.innerHTML,
      width: rect.width,
      height: rect.height,
      className: scene.className,
    };
  });

  // While the stage slot owns the view-transition-name, the scene-side element
  // must release it or the browser sees a duplicate and refuses to animate.
  // On cleanup we restore the target name so the return morph has a landing
  // pad; the advance() handler is responsible for stripping the name again
  // when stepping out of this scene so the lift doesn't bleed forward.
  useLayoutEffect(() => {
    const scene = findScene(target);
    if (!scene) return;
    scene.style.visibility = "hidden";
    scene.style.viewTransitionName = "none";
    return () => {
      scene.style.visibility = "";
      scene.style.viewTransitionName = target;
    };
  }, [target]);

  const centered = position === "center";
  const style: React.CSSProperties = {
    position: "fixed",
    top: centered ? "50%" : position.y,
    left: centered ? "50%" : position.x,
    transform: centered
      ? `translate(-50%, -50%) scale(${scale})`
      : `scale(${scale})`,
    transformOrigin: "center center",
    viewTransitionName: target,
    pointerEvents: "none",
    // Pre-promote so the browser doesn't rasterize on frame 1, which was
    // reading as a page-wide jitter when the lift kicked off.
    willChange: "transform, opacity",
    backfaceVisibility: "hidden",
    contain: "layout paint",
    ...(snapshot ? { width: snapshot.width, height: snapshot.height } : null),
  };

  return (
    <div
      className={`wt-stage-slot ${snapshot?.className ?? ""}`.trim()}
      data-vt-name={target}
      style={style}
      {...(snapshot ? { dangerouslySetInnerHTML: { __html: snapshot.html } } : {})}
    />
  );
}
