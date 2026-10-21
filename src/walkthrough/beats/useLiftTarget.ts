import { useLayoutEffect } from "react";
import type { Point } from "../types";

export type LiftOptions = {
  scale?: number;
  /**
   * "center" centers the element in the viewport. A Point moves the element's
   * top-left corner (pre-scale) to (x, y); since scale is applied around the
   * element's center, the visible top-left of a scaled element will differ.
   */
  position?: "center" | Point;
  /**
   * Fade the element out (opacity 0, pointer-events none) so content rendered
   * in .wt-root below it shows through. When the element is handed off from a
   * beat that already lifted it, its current transform is kept as-is.
   */
  dissolve?: boolean;
};

const MOVE_TRANSITION = "transform 1000ms cubic-bezier(0.65,0,0.35,1)";
const DISSOLVE_TRANSITION = `${MOVE_TRANSITION}, opacity 500ms ease-out`;

// Union of every inline property any beat mutates. Snapshotted once, on the
// first claim, and restored once, when the last claim is released.
const SAVED_PROPS = [
  "position",
  "top",
  "left",
  "width",
  "height",
  "margin",
  "transform",
  "transition",
  "zIndex",
  "willChange",
  "opacity",
  "pointerEvents",
] as const;

type Saved = Record<(typeof SAVED_PROPS)[number], string>;

type Entry = {
  saved: Saved;
  rect: DOMRect;
  /** Transform the most recent claimant aimed for (may not be applied yet). */
  transform: string;
  pendingRestore: boolean;
};

const entries = new Map<HTMLElement, Entry>();

function findTarget(name: string): HTMLElement | null {
  // Defensive: skip any stale stage slot left over from the old clone-based lift.
  const all = Array.from(document.querySelectorAll<HTMLElement>(`[data-vt-name="${name}"]`));
  return all.find((el) => !el.classList.contains("wt-stage-slot")) ?? null;
}

function liftTransform(rect: DOMRect, scale: number, position: "center" | Point): string {
  const dx =
    position === "center" ? window.innerWidth / 2 - (rect.left + rect.width / 2) : position.x - rect.left;
  const dy =
    position === "center" ? window.innerHeight / 2 - (rect.top + rect.height / 2) : position.y - rect.top;
  return `translate(${dx}px, ${dy}px) scale(${scale})`;
}

function applyTarget(el: HTMLElement, entry: Entry, dissolve: boolean) {
  el.style.transform = entry.transform;
  if (dissolve) {
    el.style.opacity = "0";
    el.style.pointerEvents = "none";
  } else {
    el.style.opacity = entry.saved.opacity;
    el.style.pointerEvents = entry.saved.pointerEvents;
  }
}

/**
 * Lifts the real target element to the stage by mutating its inline styles
 * and letting a CSS transition do the morph.
 *
 * Scene isolation invariant (spec section 7): every inline style written is
 * snapshotted first and restored when the beat unmounts, so nothing bleeds
 * into the next scene.
 *
 * Handoff: restore is deferred to a microtask. If another beat claims the same
 * element in the same commit (lift -> expand, or a StrictMode remount), it
 * cancels the restore, reuses the ORIGINAL snapshot, skips scroll/re-pin and
 * just applies its own target styles; the existing transition carries the
 * change smoothly.
 */
export function useLiftTarget(target: string, { scale = 1.4, position = "center", dissolve = false }: LiftOptions) {
  // Primitive key so a parent re-render with a fresh object doesn't restart the lift.
  const positionKey = position === "center" ? "center" : `${position.x},${position.y}`;

  useLayoutEffect(() => {
    const el = findTarget(target);
    if (!el) return;

    let raf = 0;
    const existing = entries.get(el);
    let entry: Entry;

    if (existing) {
      existing.pendingRestore = false;
      entry = existing;
      if (!dissolve) entry.transform = liftTransform(entry.rect, scale, position);
      el.style.transition = dissolve ? DISSOLVE_TRANSITION : MOVE_TRANSITION;
      applyTarget(el, entry, dissolve);
    } else {
      el.scrollIntoView({ block: "center", inline: "center", behavior: "instant" });

      const saved = {} as Saved;
      for (const prop of SAVED_PROPS) saved[prop] = el.style[prop];

      const rect = el.getBoundingClientRect();
      entry = {
        saved,
        rect,
        transform: liftTransform(rect, scale, position),
        pendingRestore: false,
      };
      entries.set(el, entry);

      // Pin in place at the current viewport position, at its current size, so
      // going position:fixed doesn't resize or shift it.
      el.style.position = "fixed";
      el.style.top = `${rect.top}px`;
      el.style.left = `${rect.left}px`;
      el.style.width = `${rect.width}px`;
      el.style.height = `${rect.height}px`;
      el.style.margin = "0";
      el.style.transform = "translate(0px, 0px) scale(1)";
      el.style.transition = dissolve ? DISSOLVE_TRANSITION : MOVE_TRANSITION;
      // Above .wt-root (z-index 250) so the lifted element sits over the blurred backdrop.
      el.style.zIndex = "260";
      el.style.willChange = "transform";

      // Force a reflow so the transition always starts from the pinned state.
      void el.offsetWidth;

      const claimed = entry;
      raf = requestAnimationFrame(() => applyTarget(el, claimed, dissolve));
    }

    return () => {
      cancelAnimationFrame(raf);
      entry.pendingRestore = true;
      queueMicrotask(() => {
        if (!entry.pendingRestore || entries.get(el) !== entry) return;
        Object.assign(el.style, entry.saved);
        entries.delete(el);
      });
    };
    // position is represented by positionKey
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, scale, positionKey, dissolve]);
}
