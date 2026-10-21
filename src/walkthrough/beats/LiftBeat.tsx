import type { Point } from "../types";
import { useLiftTarget } from "./useLiftTarget";

type Props = {
  target: string;
  scale?: number;
  /** "center", or a Point the element's pre-scale top-left moves to. */
  position?: "center" | Point;
};

/**
 * Lifts the real target element to the stage by mutating its inline styles
 * and letting a CSS transition do the morph (see useLiftTarget).
 *
 * Scene isolation invariant (spec section 7): every inline style written on
 * mount is snapshotted first and restored on unmount (deferred one microtask
 * so a same-commit handoff to another beat on the same target doesn't snap
 * back), so nothing bleeds into the next scene. Renders nothing.
 */
export function LiftBeat({ target, scale = 1.4, position = "center" }: Props) {
  useLiftTarget(target, { scale, position });
  return null;
}
