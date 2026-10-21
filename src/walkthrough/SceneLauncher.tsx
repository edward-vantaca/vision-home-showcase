import { useEffect, useState } from "react";
import { useCursor } from "./cursor";

// URL-gated scene jumper. Pass `?launcher` (or `?launcher=1`) to surface a
// bottom-left pill listing every scene. Clicking a scene calls walkthrough
// `jumpTo` — the scene's `appState` is applied by useEffects watching
// `sceneId` in App root and MainApp, so the correct phase/page/view mounts
// before the first beat runs.
function launcherEnabled(): boolean {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  if (!params.has("launcher")) return false;
  const v = params.get("launcher");
  return v === null || v === "" || v === "1" || v === "true";
}

export function SceneLauncher() {
  const { sequence, cursor, jumpTo } = useCursor();
  const [enabled] = useState(launcherEnabled);
  const [open, setOpen] = useState(true);

  // Keep the launcher in sync with navigation changes (back/forward).
  useEffect(() => {
    if (!enabled) return;
    const onPop = () => {
      if (!launcherEnabled()) {
        setOpen(false);
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [enabled]);

  if (!enabled) return null;

  const activeIndex = cursor.sceneIndex;

  return (
    <div
      data-testid="wt-scene-launcher"
      className="fixed bottom-6 left-6 z-[300] pointer-events-auto"
    >
      {open ? (
        <div className="rounded-xl bg-white/95 shadow-xl border border-black/5 backdrop-blur-sm overflow-hidden min-w-[220px]">
          <div className="flex items-center justify-between px-3 py-2 border-b border-black/5">
            <span className="text-[11px] font-semibold tracking-[0.08em] text-[#5a5a66] uppercase">
              Jump to scene
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Hide launcher"
              className="text-[#8a8a96] hover:text-[#262630] text-sm leading-none px-1"
            >
              ×
            </button>
          </div>
          <ul className="py-1 max-h-[60vh] overflow-y-auto">
            {sequence.map((s, i) => {
              const isActive = i === activeIndex;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => jumpTo({ sceneIndex: i, beatIndex: 0 })}
                    className={`w-full text-left px-3 py-2 text-[13px] flex items-center gap-2 ${
                      isActive
                        ? "bg-[#eaf2fd] text-[#1D70DC] font-medium"
                        : "text-[#262630] hover:bg-black/[0.04]"
                    }`}
                  >
                    <span className="text-[11px] text-[#8a8a96] tabular-nums w-5 shrink-0">
                      {i + 1}
                    </span>
                    <span className="truncate">{s.label ?? s.id}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-full bg-white/95 shadow-lg border border-black/5 px-4 py-2 text-[12px] font-medium text-[#262630] hover:bg-white"
        >
          Scenes
        </button>
      )}
    </div>
  );
}
