import { useEffect, useLayoutEffect, useState, type CSSProperties, type ReactNode } from "react";
import type { Point } from "../types";
import { LIFT_INSET_PX, findTarget, useLiftTarget } from "./useLiftTarget";

type Props = {
  target: string;
  scale?: number;
  /** "center", "top-left", or a Point the element's pre-scale top-left moves to. */
  position?: "center" | "top-left" | Point;
  /** Fade the lifted element out in place (e.g. while a modal covers it). */
  dissolve?: boolean;
  /** Panel beside a top-left lift, filling the rest of the screen. */
  aside?: ReactNode;
};

/** Gap between a top-left lift and its aside panel. */
const ASIDE_GAP_PX = 32;

/**
 * Lifts the real target element to the stage by mutating its inline styles
 * and letting a CSS transition do the morph (see useLiftTarget).
 *
 * Scene isolation invariant (spec section 7): every inline style written on
 * mount is snapshotted first and restored on unmount (deferred one microtask
 * so a same-commit handoff to another beat on the same target doesn't snap
 * back), so nothing bleeds into the next scene. Renders nothing, unless it has
 * an aside: that panel fades in to the right of the lifted element.
 */
export function LiftBeat({ target, scale = 1.4, position = "center", dissolve = false, aside }: Props) {
  useLiftTarget(target, { scale, position, dissolve });

  // The aside starts where the lifted element ends: measured once, unscaled,
  // right after useLiftTarget pinned it.
  const [left, setLeft] = useState<number | null>(null);
  useLayoutEffect(() => {
    if (!aside) return;
    const width = findTarget(target)?.getBoundingClientRect().width ?? 0;
    setLeft(LIFT_INSET_PX + width * scale + ASIDE_GAP_PX);
  }, [aside, target, scale]);

  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (left === null) return;
    const raf = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(raf);
  }, [left]);

  if (!aside || left === null) return null;
  const style: CSSProperties = {
    position: "fixed",
    top: LIFT_INSET_PX,
    bottom: LIFT_INSET_PX,
    left,
    right: LIFT_INSET_PX,
    pointerEvents: "auto",
    overflowY: "auto",
    opacity: shown ? 1 : 0,
    transition: "opacity 500ms ease-out 400ms",
  };
  return (
    <div data-testid="lift-aside" style={style}>
      {aside}
    </div>
  );
}
