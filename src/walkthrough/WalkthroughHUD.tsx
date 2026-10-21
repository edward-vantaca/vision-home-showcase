import { useCursor } from "./cursor";

export function WalkthroughHUD() {
  const { cursor, scene, sequence, hudVisible, advance, back } = useCursor();
  if (!hudVisible || !scene) return null;
  const sceneCount = sequence.length;
  const beatCount = scene.beats.length;
  return (
    <div
      data-testid="wt-hud"
      className="fixed bottom-6 right-6 z-[310] flex items-center gap-3 rounded-full bg-white/95 px-4 py-2 shadow-lg"
    >
      <button
        type="button"
        onClick={back}
        className="rounded-full px-3 py-1 text-sm font-medium hover:bg-black/5"
      >
        ← prev
      </button>
      <span className="text-sm font-medium text-[#262630]">
        scene {cursor.sceneIndex + 1} of {sceneCount} · beat {cursor.beatIndex + 1} of {beatCount}
      </span>
      <div className="flex gap-1">
        {scene.beats.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 w-1.5 rounded-full ${i === cursor.beatIndex ? "bg-[#247ae4]" : "bg-black/20"}`}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={advance}
        className="rounded-full px-3 py-1 text-sm font-medium hover:bg-black/5"
      >
        next →
      </button>
    </div>
  );
}
