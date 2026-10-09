import { useWalkthrough } from "./WalkthroughProvider";

export function WalkthroughHUD() {
  const { state, advance, back, exit, getCurrentSequence, getCurrentBeat } = useWalkthrough();
  if (!state.hudVisible) return null;

  const seq = getCurrentSequence();
  const beat = getCurrentBeat();
  if (!seq || !beat) return null;

  const total = seq.beats.length;
  const current = state.currentBeatIndex;

  return (
    <>
      {"caption" in beat && beat.caption ? (
        <div
          data-testid="walkthrough-caption"
          className="fixed bottom-32 left-1/2 -translate-x-1/2 max-w-[720px] px-6 py-4 bg-white/95 rounded-xl shadow-lg text-[20px] text-[#262630] font-['DM_Sans:SemiBold',sans-serif] font-semibold text-center"
          style={{ zIndex: 120 }}
        >
          {beat.caption}
        </div>
      ) : null}
      <div
        data-testid="walkthrough-hud"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 px-5 py-3 bg-white/95 rounded-full shadow-lg"
        style={{ zIndex: 120 }}
      >
        <button
          onClick={back}
          aria-label="previous"
          className="size-8 flex items-center justify-center rounded-full hover:bg-[#f2f5f7]"
        >
          ◀
        </button>
        <div className="flex items-center gap-2 text-[14px] text-[#4b5563]">
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={`size-2 rounded-full ${i === current ? "bg-[#247ae4]" : i < current ? "bg-[#9bb6d9]" : "bg-[#e1e9ef]"}`}
            />
          ))}
          <span className="ml-2">
            {current + 1} / {total}
          </span>
        </div>
        <button
          onClick={advance}
          aria-label="next"
          className="size-8 flex items-center justify-center rounded-full hover:bg-[#f2f5f7]"
        >
          ▶
        </button>
        <button
          onClick={exit}
          aria-label="exit"
          className="ml-2 px-3 py-1 text-[13px] text-[#6b7280] hover:text-[#262630]"
        >
          ✕ exit
        </button>
      </div>
    </>
  );
}
