import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import type { VTName } from "../viewTransitionNames";
import type { CursorStop } from "../types";
import { beatBusyRef } from "../cursor";

type Point = { x: number; y: number };

let lastCursorPoint: Point | null = null;

function resolveCenter(name: string): Point | null {
  const el = document.querySelector<HTMLElement>(`[data-vt-name="${name}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
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

export function CursorBeat({
  to,
  action,
  durationMs,
  direction,
  typeText,
  typeCps,
  then,
}: {
  to: VTName;
  action?: "click" | "hover";
  durationMs?: number;
  direction?: "forward" | "back";
  typeText?: string;
  typeCps?: number;
  then?: CursorStop[];
}) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const start = lastCursorPoint ?? defaultStart();

  useGSAP(
    () => {
      const el = cursorRef.current;
      if (!el) return;

      // Block arrow-key advance/back while this beat's animation is running.
      beatBusyRef.current = true;

      const primary: CursorStop = { to, action, typeText, typeCps };
      const stops: CursorStop[] = direction === "back" ? [{ to }] : [primary, ...(then ?? [])];

      const duration = (durationMs ?? 1000) / 1000;
      const pause = 0.55;

      let tl: gsap.core.Timeline | null = null;
      const run = () => {
        // Resolve every stop up front; a stop whose target can't be found is
        // skipped (silent fail is a better fallback than a crash).
        const resolved = stops.map((stop) => ({ stop, point: resolveCenter(stop.to) }));
        if (resolved.length === 0 || !resolved[0].point) {
          beatBusyRef.current = false;
          return;
        }

        tl = gsap.timeline({
          onComplete: () => {
            beatBusyRef.current = false;
          },
        });

        for (const { stop, point } of resolved) {
          if (!point) continue;

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
          } else {
            // Travel to this stop.
            tl.to(el, {
              x: point.x,
              y: point.y,
              duration,
              ease: "power2.inOut",
              onComplete: () => {
                lastCursorPoint = point;
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
        }
      };

      // One frame of grace for pending commits (expand/click from prev beat).
      const raf = requestAnimationFrame(run);
      return () => {
        cancelAnimationFrame(raf);
        tl?.kill();
        beatBusyRef.current = false;
      };
    },
    { dependencies: [to, action, durationMs, direction, typeText, typeCps, then] },
  );

  return (
    <div
      ref={cursorRef}
      data-testid="cursor-beat"
      className="wt-cursor"
      style={{ transform: `translate(${start.x}px, ${start.y}px)` }}
    >
      <svg width="26" height="30" viewBox="0 0 26 30" fill="none" aria-hidden>
        <path
          d="M3 2 L3 23 L8.5 18.5 L12 26 L15.5 24.5 L12 17 L19 17 Z"
          fill="#111"
          stroke="#fff"
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
