import { useEffect } from "react";
import { useWalkthrough } from "./WalkthroughProvider";

export function useWalkthroughKeyboard(): void {
  const { state, advance, back, exit, toggleHud, replayBeat, skipToEnd } = useWalkthrough();

  useEffect(() => {
    if (!state.active) return;

    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        exit();
        return;
      }
      const target = event.target as HTMLElement | null;
      const isTypingTarget =
        target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (isTypingTarget && event.key !== "Escape") return;

      switch (event.key) {
        case "ArrowRight":
        case " ":
        case "PageDown":
          event.preventDefault();
          advance();
          return;
        case "ArrowLeft":
        case "PageUp":
          event.preventDefault();
          back();
          return;
        case ".":
          event.preventDefault();
          skipToEnd();
          return;
        case "0":
          event.preventDefault();
          replayBeat();
          return;
        case "h":
        case "H":
          event.preventDefault();
          toggleHud();
          return;
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [state.active, advance, back, exit, toggleHud, replayBeat, skipToEnd]);
}
