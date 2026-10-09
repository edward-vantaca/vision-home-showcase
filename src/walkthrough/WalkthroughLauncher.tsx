import { useEffect, useState } from "react";
import { useWalkthrough } from "./WalkthroughProvider";
import type { Sequence } from "./types";

type Props = { sequences: Record<string, Sequence> };

export function WalkthroughLauncher({ sequences }: Props) {
  const { start } = useWalkthrough();
  const [open, setOpen] = useState(false);
  const [hudVisible, setHudVisible] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const demo = params.get("demo");
    if (!demo) return;
    if (demo === "true") {
      setOpen(true);
      return;
    }
    if (sequences[demo]) {
      start(demo);
    } else {
      console.warn(`[walkthrough] unknown sequence id in ?demo=${demo}`);
    }
  }, [sequences, start]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === "w" || e.key === "W")) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (!open) return null;

  return (
    <div
      data-testid="walkthrough-launcher"
      className="fixed top-6 right-6 bg-white rounded-xl shadow-2xl p-5 min-w-[300px]"
      style={{ zIndex: 200 }}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[16px] text-[#262630]">
          Walkthrough
        </p>
        <button onClick={() => setOpen(false)} className="text-[#6b7280] hover:text-[#262630] text-[14px]">
          ✕
        </button>
      </div>
      <label className="flex items-center gap-2 mb-4 text-[13px] text-[#4b5563]">
        <input type="checkbox" checked={hudVisible} onChange={(e) => setHudVisible(e.target.checked)} />
        Show HUD &amp; captions
      </label>
      <div className="flex flex-col gap-2">
        {Object.values(sequences).map((seq) => (
          <button
            key={seq.id}
            onClick={() => {
              start(seq.id, { hudVisible });
              setOpen(false);
            }}
            className="text-left px-3 py-2 rounded-lg bg-[#f6f8fb] hover:bg-[#eef3fa] text-[14px] text-[#262630]"
          >
            {seq.title}
          </button>
        ))}
      </div>
    </div>
  );
}
