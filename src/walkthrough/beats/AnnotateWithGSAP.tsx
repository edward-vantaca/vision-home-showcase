import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { resolveTarget } from "../targetRegistry";
import { registerBeatRenderer } from "../WalkthroughStage";
import type { Beat, BeatProps, Point } from "../types";

type AnnotateBeat = Extract<Beat, { kind: "annotate" }>;

function resolvePoint(spec: string | Point): Point | null {
  if (typeof spec === "object") return spec;
  const el = resolveTarget(spec);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

export function AnnotateWithGSAP({ beat, onComplete }: BeatProps<AnnotateBeat>) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ onComplete });
      beat.tracks.forEach((track, idx) => {
        if (track.type === "typeCaption") {
          const target = containerRef.current?.querySelector<HTMLElement>(`[data-track="caption-${idx}"]`);
          if (!target) return;
          const total = track.text.length;
          const cps = track.speedCps ?? 25;
          const duration = total / cps;

          // Use a proxy object with manual text update via onUpdate
          const proxy = { progress: 0 };
          tl.to(
            proxy,
            {
              progress: 1,
              duration,
              ease: "none",
              onUpdate() {
                const charCount = Math.round(proxy.progress * total);
                target.textContent = track.text.substring(0, charCount);
              },
            },
            0,
          );
        } else if (track.type === "pulse") {
          const target = containerRef.current?.querySelector<HTMLElement>(`[data-track="pulse-${idx}"]`);
          if (!target) return;
          const count = track.count ?? 2;
          tl.fromTo(
            target,
            { scale: 1, opacity: 0.9 },
            { scale: 1.4, opacity: 0, duration: 0.8, repeat: count - 1, ease: "power1.out" },
            0,
          );
        } else if (track.type === "arrow") {
          const target = containerRef.current?.querySelector<SVGPathElement>(`[data-track="arrow-${idx}"]`);
          if (!target) return;
          const len = target.getTotalLength();
          target.style.strokeDasharray = `${len}`;
          target.style.strokeDashoffset = `${len}`;
          tl.to(target, { strokeDashoffset: 0, duration: 0.9, ease: "power2.out" }, 0);
        }
      });
      if (beat.durationMs) {
        tl.to({}, { duration: beat.durationMs / 1000 });
      }

      return () => {
        tl.kill();
      };
    },
    { scope: containerRef, dependencies: [beat] },
  );

  return (
    <div data-testid="annotate-beat" ref={containerRef} className="pointer-events-none">
      {beat.tracks.map((track, idx) => {
        if (track.type === "typeCaption") {
          return (
            <div
              key={idx}
              data-track={`caption-${idx}`}
              className="fixed top-24 left-1/2 -translate-x-1/2 max-w-[720px] px-6 py-3 bg-white/95 rounded-lg shadow-lg text-[22px] font-['DM_Sans:SemiBold',sans-serif] text-[#262630]"
            />
          );
        }
        if (track.type === "pulse") {
          const el = resolveTarget(track.target);
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return (
            <div
              key={idx}
              data-track={`pulse-${idx}`}
              className="fixed rounded-full border-4 border-[#247ae4]"
              style={{ top: r.top, left: r.left, width: r.width, height: r.height }}
            />
          );
        }
        if (track.type === "arrow") {
          const from = resolvePoint(track.from);
          const to = resolvePoint(track.to);
          if (!from || !to) return null;
          return (
            <svg
              key={idx}
              className="fixed inset-0 w-screen h-screen"
              style={{ pointerEvents: "none" }}
            >
              <path
                data-track={`arrow-${idx}`}
                d={`M ${from.x} ${from.y} Q ${(from.x + to.x) / 2} ${from.y - 60} ${to.x} ${to.y}`}
                fill="none"
                stroke="#247ae4"
                strokeWidth={3}
                markerEnd="url(#arrowhead)"
              />
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
                  <path d="M0,0 L10,5 L0,10 z" fill="#247ae4" />
                </marker>
              </defs>
            </svg>
          );
        }
        return null;
      })}
    </div>
  );
}

registerBeatRenderer("annotate", AnnotateWithGSAP);
