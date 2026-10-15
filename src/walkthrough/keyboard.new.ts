import { useEffect } from "react";
import { useCursor } from "./cursor";

function isEditable(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return el.isContentEditable;
}

export function useWalkthroughKeyboard(): void {
  const { advance, back, jumpTo, toggleHud, sequence } = useCursor();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isEditable(e.target)) return;
      switch (e.key) {
        case "ArrowRight":
        case " ":
        case "PageDown":
          e.preventDefault();
          advance();
          return;
        case "ArrowLeft":
        case "PageUp":
          e.preventDefault();
          back();
          return;
        case "Home":
          e.preventDefault();
          jumpTo({ sceneIndex: 0, beatIndex: 0 });
          return;
        case "End": {
          e.preventDefault();
          const lastScene = sequence.length - 1;
          const lastBeat = sequence[lastScene].beats.length - 1;
          jumpTo({ sceneIndex: lastScene, beatIndex: lastBeat });
          return;
        }
        case "Escape":
          e.preventDefault();
          jumpTo({ sceneIndex: 0, beatIndex: 0 });
          return;
        case ".":
          e.preventDefault();
          toggleHud();
          return;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [advance, back, jumpTo, toggleHud, sequence]);
}
