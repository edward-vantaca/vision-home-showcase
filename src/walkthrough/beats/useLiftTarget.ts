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

// One transition for every claim, so opacity also animates when a handoff
// un-dissolves the element (expand -> lift back-scrub) instead of snapping.
const LIFT_TRANSITION = "transform 1000ms cubic-bezier(0.65,0,0.35,1), opacity 500ms ease-out";
/** How many frames to keep looking for a target that isn't rendered yet. */
const TARGET_RETRY_FRAMES = 30;

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
  /** Invisible stand-in that keeps the element's layout slot while it's fixed. */
  spacer: HTMLElement;
  pendingRestore: boolean;
};

const entries = new Map<HTMLElement, Entry>();

function findTarget(name: string): HTMLElement | null {
  // Defensive: skip any stale stage slot left over from the old clone-based lift.
  const all = Array.from(document.querySelectorAll<HTMLElement>(`[data-vt-name="${name}"]`));
  return all.find((el) => !el.classList.contains("wt-stage-slot")) ?? null;
}

// Any of these on an ancestor makes it the containing block for position:fixed
// descendants (and/or a stacking context), so the pinned element lands offset
// and stays trapped under .wt-root's backdrop. Dev-only diagnostic.
const CONTAINING_BLOCK_CHECKS: [prop: string, isTrap: (value: string) => boolean][] = [
  ["transform", (v) => v !== "" && v !== "none"],
  ["filter", (v) => v !== "" && v !== "none"],
  ["backdrop-filter", (v) => v !== "" && v !== "none"],
  ["perspective", (v) => v !== "" && v !== "none"],
  ["contain", (v) => /\b(paint|layout|strict|content)\b/.test(v)],
  ["will-change", (v) => /\b(transform|filter|perspective|backdrop-filter)\b/.test(v)],
  ["container-type", (v) => v !== "" && v !== "normal"],
];

function warnOnContainingBlockAncestors(el: HTMLElement, name: string) {
  for (let node = el.parentElement; node && node !== document.documentElement; node = node.parentElement) {
    const cs = getComputedStyle(node);
    for (const [prop, isTrap] of CONTAINING_BLOCK_CHECKS) {
      const value = cs.getPropertyValue(prop);
      if (isTrap(value)) {
        console.warn(
          `[walkthrough] lift target "${name}" has an ancestor with ${prop}: ${value}; ` +
            "position:fixed will be offset and trapped under the backdrop.",
          node,
        );
      }
    }
  }
}

// position:fixed takes the element out of flow, so its siblings would close
// the gap (the dashboard widget below slides up). Hold the slot with an empty
// element carrying the same classes and inline styles (same grid/flex
// placement, margins) at the measured size. No data-vt-name or id, so it is
// never matched as a target. Call before mutating el's inline styles.
function createSpacer(el: HTMLElement, rect: DOMRect): HTMLElement {
  const spacer = document.createElement(el.tagName);
  spacer.className = el.className;
  spacer.style.cssText = el.style.cssText;
  spacer.style.width = `${rect.width}px`;
  spacer.style.height = `${rect.height}px`;
  spacer.style.visibility = "hidden";
  spacer.style.pointerEvents = "none";
  spacer.setAttribute("aria-hidden", "true");
  spacer.setAttribute("data-wt-lift-spacer", "");
  el.before(spacer);
  return spacer;
}

function liftTransform(rect: DOMRect, scale: number, position: "center" | Point): string {
  const dx =
    position === "center" ? window.innerWidth / 2 - (rect.left + rect.width / 2) : position.x - rect.left;
  const dy =
    position === "center" ? window.innerHeight / 2 - (rect.top + rect.height / 2) : position.y - rect.top;
  // Nudge so the scaled box's top-left lands on a whole pixel: text on a
  // fractional offset renders soft.
  const snap = (start: number, size: number, d: number) => {
    const visible = start + d + (size * (1 - scale)) / 2;
    return d + Math.round(visible) - visible;
  };
  return `translate(${snap(rect.left, rect.width, dx)}px, ${snap(rect.top, rect.height, dy)}px) scale(${scale})`;
}

// will-change keeps the element on a layer rendered at its unscaled size, so
// a scaled lift would stay a stretched bitmap. Drop it once the move ends and
// the browser re-renders the text sharp at the lifted size.
function dropWillChange(e: TransitionEvent) {
  if (e.propertyName === "transform") (e.currentTarget as HTMLElement).style.willChange = "auto";
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
    let raf = 0;
    let claimedEl: HTMLElement | null = null;
    let claimedEntry: Entry | null = null;

    const claim = (el: HTMLElement) => {
      const existing = entries.get(el);
      let entry: Entry;

      if (existing) {
        existing.pendingRestore = false;
        entry = existing;
        if (!dissolve) entry.transform = liftTransform(entry.rect, scale, position);
        el.style.transition = LIFT_TRANSITION;
        applyTarget(el, entry, dissolve);
      } else {
        if (import.meta.env.DEV) warnOnContainingBlockAncestors(el, target);
        el.scrollIntoView({ block: "center", inline: "center", behavior: "instant" });

        const saved = {} as Saved;
        for (const prop of SAVED_PROPS) saved[prop] = el.style[prop];

        const rect = el.getBoundingClientRect();
        entry = {
          saved,
          rect,
          transform: liftTransform(rect, scale, position),
          spacer: createSpacer(el, rect),
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
        el.style.transition = LIFT_TRANSITION;
        // Above .wt-root (z-index 250) so the lifted element sits over the blurred backdrop.
        el.style.zIndex = "260";
        el.style.willChange = "transform";
        el.addEventListener("transitionend", dropWillChange);

        // Force a reflow so the transition always starts from the pinned state.
        void el.offsetWidth;

        const claimed = entry;
        raf = requestAnimationFrame(() => applyTarget(el, claimed, dissolve));
      }

      claimedEl = el;
      claimedEntry = entry;
    };

    // The target may not be rendered yet (e.g. a launcher jump into another
    // page: App's appState sync runs in a useEffect after this layout effect).
    // Retry each frame for a short window, then give up quietly.
    const el = findTarget(target);
    if (el) {
      claim(el);
    } else {
      let frames = 0;
      const retry = () => {
        const found = findTarget(target);
        if (found) {
          claim(found);
        } else if (++frames < TARGET_RETRY_FRAMES) {
          raf = requestAnimationFrame(retry);
        }
      };
      raf = requestAnimationFrame(retry);
    }

    return () => {
      cancelAnimationFrame(raf);
      const el = claimedEl;
      const entry = claimedEntry;
      if (!el || !entry) return;
      entry.pendingRestore = true;
      queueMicrotask(() => {
        if (!entry.pendingRestore || entries.get(el) !== entry) return;
        el.removeEventListener("transitionend", dropWillChange);
        Object.assign(el.style, entry.saved);
        entry.spacer.remove();
        entries.delete(el);
      });
    };
    // position is represented by positionKey
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, scale, positionKey, dissolve]);
}
