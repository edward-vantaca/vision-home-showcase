import { useEffect } from "react";

export function HighlightBeat({ target }: { target: string }) {
  useEffect(() => {
    const el = document.querySelector<HTMLElement>(`[data-vt-name="${target}"]`);
    el?.scrollIntoView({ block: "center", behavior: "auto" });
  }, [target]);
  return null;
}
