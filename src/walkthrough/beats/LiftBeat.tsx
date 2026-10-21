import { useLayoutEffect } from "react";
import type { Point } from "../types";

type Props = {
  target: string;
  scale?: number;
  position?: "center" | Point;
};

function findTarget(name: string): HTMLElement | null {
  // Defensive: skip any stale stage slot left over from the old clone-based lift.
  const all = Array.from(document.querySelectorAll<HTMLElement>(`[data-vt-name="${name}"]`));
  return all.find((el) => !el.classList.contains("wt-stage-slot")) ?? null;
}

/**
 * Lifts the real target element to the stage by mutating its inline styles
 * and letting a CSS transition do the morph.
 *
 * Scene isolation invariant (spec section 7): every inline style written on
 * mount is snapshotted first and restored on unmount, so nothing bleeds into
 * the next scene. Renders nothing.
 */
export function LiftBeat({ target, scale = 1.4, position = "center" }: Props) {
  // Primitive key so a parent re-render with a fresh object doesn't restart the lift.
  const positionKey = position === "center" ? "center" : `${position.x},${position.y}`;

  useLayoutEffect(() => {
    const el = findTarget(target);
    if (!el) return;

    el.scrollIntoView({ block: "center", inline: "center", behavior: "instant" });

    const saved = {
      position: el.style.position,
      top: el.style.top,
      left: el.style.left,
      width: el.style.width,
      height: el.style.height,
      margin: el.style.margin,
      transform: el.style.transform,
      transition: el.style.transition,
      zIndex: el.style.zIndex,
      willChange: el.style.willChange,
    };

    const rect = el.getBoundingClientRect();

    // Pin in place at the current viewport position, at its current size, so
    // going position:fixed doesn't resize or shift it.
    el.style.position = "fixed";
    el.style.top = `${rect.top}px`;
    el.style.left = `${rect.left}px`;
    el.style.width = `${rect.width}px`;
    el.style.height = `${rect.height}px`;
    el.style.margin = "0";
    el.style.transform = "translate(0px, 0px) scale(1)";
    el.style.transition = "transform 1000ms cubic-bezier(0.65,0,0.35,1)";
    // Above .wt-root (z-index 250) so the lifted element sits over the blurred backdrop.
    el.style.zIndex = "260";
    el.style.willChange = "transform";

    const raf = requestAnimationFrame(() => {
      const dx =
        position === "center"
          ? window.innerWidth / 2 - (rect.left + rect.width / 2)
          : position.x - rect.left;
      const dy =
        position === "center"
          ? window.innerHeight / 2 - (rect.top + rect.height / 2)
          : position.y - rect.top;
      el.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;
    });

    return () => {
      cancelAnimationFrame(raf);
      Object.assign(el.style, saved);
    };
    // position is represented by positionKey
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, scale, positionKey]);

  return null;
}
