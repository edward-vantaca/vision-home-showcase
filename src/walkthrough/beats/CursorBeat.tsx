import { useRef } from "react";
import { createPortal } from "react-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import type { VTName } from "../viewTransitionNames";
import type { CursorStop } from "../types";
import { beatBusyRef } from "../cursor";
import { DROP_FILE_EVENT } from "../dropFile";

type Point = { x: number; y: number };

let lastCursorPoint: Point | null = null;

function resolveCenter(name: string): Point | null {
  const el = document.querySelector<HTMLElement>(`[data-vt-name="${name}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

// Where a drop stop's cursor enters from: just past the right edge, as if the
// file were dragged in from the desktop.
function offscreenRight(): Point {
  const w = typeof window !== "undefined" ? window.innerWidth : 1200;
  const h = typeof window !== "undefined" ? window.innerHeight : 800;
  return { x: w + 60, y: h * 0.62 };
}

function defaultStart(): Point {
  const w = typeof window !== "undefined" ? window.innerWidth : 1200;
  const h = typeof window !== "undefined" ? window.innerHeight : 800;
  return { x: w - 80, y: h - 80 };
}

// Drives a controlled React input: use the native setter + dispatch a bubbling
// 'input' event so React's synthetic event system notices and runs the onChange.
function reactSetInputValue(el: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
  if (setter) {
    setter.call(el, value);
  } else {
    el.value = value;
  }
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

// Upper bound on how long a cursor beat waits for in-flight CSS animations
// (e.g. the 700ms Ask HOAi panel morph) before measuring its stops anyway.
const SETTLE_TIMEOUT_MS = 1500;

/**
 * Resolves once every running, finite CSS/WAAPI animation in the document has
 * finished (or SETTLE_TIMEOUT_MS passes). Infinite loops (typing dots, pulses)
 * and paused animations are ignored, since they would never settle. Returns
 * null when the environment has no document.getAnimations (jsdom), meaning
 * "nothing to wait for".
 */
function animationsSettled(): Promise<void> | null {
  if (typeof document.getAnimations !== "function") return null;
  const pending = document.getAnimations().filter((a) => {
    if (a.playState !== "running") return false;
    const end = a.effect?.getComputedTiming().endTime;
    return typeof end === "number" && Number.isFinite(end);
  });
  if (pending.length === 0) return null;
  const all = Promise.all(pending.map((a) => a.finished.catch(() => {}))).then(() => {});
  const timeout = new Promise<void>((resolve) => setTimeout(resolve, SETTLE_TIMEOUT_MS));
  return Promise.race([all, timeout]);
}

export function CursorBeat({
  to,
  action,
  file,
  durationMs,
  direction,
  typeText,
  typeCps,
  then,
  holdMs,
  releaseStage,
  onReleaseStage,
  hideStage,
  onHideStage,
  pointer = "arrow",
}: {
  to: VTName;
  action?: "click" | "hover" | "drop";
  file?: string;
  durationMs?: number;
  direction?: "forward" | "back";
  typeText?: string;
  typeCps?: number;
  then?: CursorStop[];
  holdMs?: number;
  releaseStage?: boolean;
  onReleaseStage?: () => void;
  hideStage?: boolean;
  onHideStage?: () => void;
  /** "touch" draws a fingertip circle centred on the point (phone scenes). */
  pointer?: "arrow" | "touch";
}) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const fileCardRef = useRef<HTMLDivElement>(null);
  // Latest callback without restarting the timeline when the parent re-renders.
  const onReleaseStageRef = useRef(onReleaseStage);
  onReleaseStageRef.current = onReleaseStage;
  const onHideStageRef = useRef(onHideStage);
  onHideStageRef.current = onHideStage;
  // A beat that opens by dragging a file in starts off-screen, so the cursor
  // isn't parked on screen while it waits for the scene's animations to settle.
  const dropsFirst = action === "drop" && direction !== "back";
  const start = dropsFirst ? offscreenRight() : lastCursorPoint ?? defaultStart();
  const carriedFile = [{ action, file }, ...(then ?? [])].find((s) => s.action === "drop")?.file;

  useGSAP(
    () => {
      const el = cursorRef.current;
      if (!el) return;

      // Block arrow-key advance/back while this beat's animation is running.
      beatBusyRef.current = true;

      const primary: CursorStop = { to, action, file, typeText, typeCps, holdMs, releaseStage, hideStage };
      const stops: CursorStop[] = direction === "back" ? [{ to }] : [primary, ...(then ?? [])];

      const duration = (durationMs ?? 1000) / 1000;
      const pause = 0.55;

      let tl: gsap.core.Timeline | null = null;
      const run = () => {
        // Only the first stop must exist up front. Later stops are measured when
        // the cursor sets off for them, since an earlier click may be what
        // renders them (Make a Payment -> the modal's Continue button). A stop
        // whose target is still missing then is skipped in place.
        if (stops.length === 0 || !resolveCenter(stops[0].to)) {
          beatBusyRef.current = false;
          return;
        }

        tl = gsap.timeline({
          onComplete: () => {
            beatBusyRef.current = false;
          },
        });

        for (const stop of stops) {

          // "tab" stops don't move the cursor — just advance focus to the
          // target (as if the user had pressed Tab). Cursor stays parked at
          // the previous click location.
          if (stop.action === "tab") {
            tl.call(() => {
              const el2 = document.querySelector<HTMLElement>(`[data-vt-name="${stop.to}"]`);
              if (el2 && typeof (el2 as HTMLInputElement).focus === "function") {
                (el2 as HTMLInputElement).focus();
              }
            });
            tl.to({}, { duration: 0.15 });
          } else if (stop.action === "scroll") {
            // "scroll" stops don't move the cursor either — the target (a
            // scrollable page) eases down to its bottom, measured when the
            // scroll starts since an earlier click may have just rendered it.
            const scroll = { y: 0 };
            let page: HTMLElement | null = null;
            tl.call(() => {
              page = document.querySelector<HTMLElement>(`[data-vt-name="${stop.to}"]`);
              scroll.y = page?.scrollTop ?? 0;
            });
            tl.to(scroll, {
              y: () => (page ? page.scrollHeight - page.clientHeight : scroll.y),
              duration: (stop.scrollMs ?? 4000) / 1000,
              ease: "power1.inOut",
              onUpdate: () => {
                if (page) page.scrollTop = scroll.y;
              },
            });
          } else if (stop.action === "drop") {
            // Carry the file card in from off-screen, let go over the target:
            // the card shrinks away as the drop event lands on the target.
            const card = fileCardRef.current;
            let point: Point | null = null;
            tl.set(el, { x: () => offscreenRight().x, y: () => offscreenRight().y });
            if (card) tl.set(card, { opacity: 1, scale: 1 });
            tl.to(el, {
              x: () => {
                point = resolveCenter(stop.to);
                return point ? point.x : Number(gsap.getProperty(el, "x"));
              },
              y: () => (point ? point.y : Number(gsap.getProperty(el, "y"))),
              duration: duration * 1.2,
              ease: "power2.inOut",
              onComplete: () => {
                if (point) lastCursorPoint = point;
              },
            });
            tl.to({}, { duration: 0.35 });
            tl.call(() => {
              document
                .querySelector<HTMLElement>(`[data-vt-name="${stop.to}"]`)
                ?.dispatchEvent(new CustomEvent(DROP_FILE_EVENT, { bubbles: true, detail: { name: stop.file ?? "" } }));
            });
            if (card) tl.to(card, { opacity: 0, scale: 0.6, duration: 0.2, ease: "power2.in" });
          } else {
            // Travel to this stop. Function values are evaluated when this tween
            // starts, i.e. after every earlier stop's click has committed.
            let point: Point | null = null;
            tl.to(el, {
              x: () => {
                point = resolveCenter(stop.to);
                return point ? point.x : Number(gsap.getProperty(el, "x"));
              },
              y: () => (point ? point.y : Number(gsap.getProperty(el, "y"))),
              duration,
              ease: "power2.inOut",
              onComplete: () => {
                if (point) lastCursorPoint = point;
              },
            });

            if (stop.action === "click") {
              tl.to({}, { duration: pause });
              tl.to(el, { scale: 0.82, duration: 0.08, ease: "power1.out" });
              tl.call(() => {
                const el2 = document.querySelector<HTMLElement>(`[data-vt-name="${stop.to}"]`);
                el2?.click();
                if (el2 && typeof (el2 as HTMLInputElement).focus === "function") {
                  (el2 as HTMLInputElement).focus();
                }
              });
              if (stop.hideStage) {
                tl.call(() => onHideStageRef.current?.());
              }
              if (stop.releaseStage) {
                tl.call(() => onReleaseStageRef.current?.());
              }
              tl.to(el, { scale: 1, duration: 0.14, ease: "power2.out" });
            }
          }

          if (stop.typeText) {
            const text = stop.typeText;
            const cps = stop.typeCps ?? 14;
            const perChar = 1 / cps;
            // Guards against ping-pong with inputs that reformat on change:
            // only re-apply the value when the integer character count ticks.
            const tracker = { n: 0 };
            const lastN = { v: -1 };
            tl.to({}, { duration: 0.25 });
            tl.to(tracker, {
              n: text.length,
              duration: text.length * perChar,
              ease: "none",
              onUpdate() {
                const n = Math.round(tracker.n);
                if (n === lastN.v) return;
                lastN.v = n;
                const targetEl = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(
                  `[data-vt-name="${stop.to}"]`,
                );
                if (!targetEl) return;
                reactSetInputValue(targetEl, text.substring(0, n));
              },
            });
            // Short hold after typing so the final value is visually settled.
            tl.to({}, { duration: 0.4 });
            // Blur the input so the global arrow-key listener isn't swallowed
            // by the focused editable element (isEditable short-circuits it).
            tl.call(() => {
              const targetEl = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(
                `[data-vt-name="${stop.to}"]`,
              );
              targetEl?.blur();
            });
          }

          if (stop.holdMs) {
            tl.to({}, { duration: stop.holdMs / 1000 });
          }
        }
      };

      // One frame of grace for pending commits (expand/click from prev beat),
      // then wait out any CSS transitions they started (e.g. the panel morph on
      // scene enter) so stops are measured at their settled positions.
      let cancelled = false;
      let raf = requestAnimationFrame(() => {
        const settled = animationsSettled();
        if (!settled) {
          run();
          return;
        }
        void settled.then(() => {
          if (cancelled) return;
          raf = requestAnimationFrame(() => {
            if (!cancelled) run();
          });
        });
      });
      return () => {
        cancelled = true;
        cancelAnimationFrame(raf);
        tl?.kill();
        beatBusyRef.current = false;
      };
    },
    { dependencies: [to, action, file, durationMs, direction, typeText, typeCps, then, holdMs, releaseStage, hideStage] },
  );

  // Rendered into <body> rather than .wt-root so the cursor paints above the
  // lifted element (z 260) and app modals (z 300), not inside .wt-root's z 250.
  return createPortal(
    <div
      ref={cursorRef}
      data-testid="cursor-beat"
      className="wt-cursor"
      style={{ transform: `translate(${start.x}px, ${start.y}px)` }}
    >
      {pointer === "touch" ? (
        <span className="wt-cursor-touch" aria-hidden />
      ) : (
        <svg width="26" height="30" viewBox="0 0 26 30" fill="none" aria-hidden>
          <path
            d="M3 2 L3 23 L8.5 18.5 L12 26 L15.5 24.5 L12 17 L19 17 Z"
            fill="#111"
            stroke="#fff"
            strokeWidth={1.6}
            strokeLinejoin="round"
          />
        </svg>
      )}
      {carriedFile && (
        <div ref={fileCardRef} className="wt-cursor-file" style={{ opacity: 0 }}>
          <span className="wt-cursor-file-badge">PDF</span>
          <span className="wt-cursor-file-name">{carriedFile}</span>
        </div>
      )}
    </div>,
    document.body,
  );
}
