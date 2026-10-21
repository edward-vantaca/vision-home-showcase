import { createContext, useCallback, useContext, useMemo, useReducer, type ReactNode } from "react";
import type { Beat, Cursor, Scene, Sequence, WalkthroughAction, WalkthroughState } from "./types";

function prefersReducedMotion(): boolean {
  if (typeof matchMedia === "undefined") return false;
  try {
    return matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

// Shared between beats and the keyboard handler. Beats flip this to `true` while
// their animation is running so arrow keys don't skip past mid-sequence; the
// keyboard handler reads it before dispatching advance/back. Mutable ref — no
// re-renders needed when the flag flips.
export const beatBusyRef = { current: false };

type WithTransitionOptions = {
  // When provided, the class is added to <html> BEFORE startViewTransition
  // fires so CSS rules scoped to it apply during the OLD snapshot capture,
  // and removed when the transition finishes. This is how we scope which
  // elements receive viewTransitionName per-transition: AskHoaiPanel's
  // sub-regions, for instance, only need their VT names during transitions
  // that actually move the panel (ask-hoai scene enter/exit, chat-send).
  htmlClass?: string;
};

export function withTransition(update: () => void, options?: WithTransitionOptions): void {
  const vt = typeof document !== "undefined" ? document.startViewTransition : undefined;
  if (vt && !prefersReducedMotion()) {
    // Lock scroll on every page-level scrollable container across the whole
    // view-transition. Browsers tend to nudge scroll by a few pixels when
    // view-transition-named elements change containment mid-transition —
    // keeping overflow:hidden until .finished resolves pins the viewport.
    const scrollables =
      typeof document !== "undefined" && typeof document.querySelectorAll === "function"
        ? Array.from(document.querySelectorAll<HTMLElement>('[data-ux-id$="-page"]'))
        : [];
    const savedOverflow = scrollables.map((el) => el.style.overflow);
    const savedScroll = scrollables.map((el) => ({ top: el.scrollTop, left: el.scrollLeft }));
    for (const el of scrollables) {
      el.style.overflow = "hidden";
    }
    const hasWindow = typeof window !== "undefined";
    const savedWindowScroll = hasWindow
      ? { top: window.scrollY, left: window.scrollX }
      : { top: 0, left: 0 };

    const htmlClass = options?.htmlClass;
    if (htmlClass) document.documentElement.classList.add(htmlClass);

    const transition = vt.call(document, update);
    const restore = () => {
      scrollables.forEach((el, i) => {
        el.style.overflow = savedOverflow[i];
        el.scrollTop = savedScroll[i].top;
        el.scrollLeft = savedScroll[i].left;
      });
      if (hasWindow && typeof window.scrollTo === "function") {
        window.scrollTo(savedWindowScroll.left, savedWindowScroll.top);
      }
      if (htmlClass) document.documentElement.classList.remove(htmlClass);
    };
    transition?.finished?.then(restore, restore);
  } else {
    update();
  }
}

function scenesInvolve(a: Scene | undefined, b: Scene | undefined, id: string): boolean {
  return a?.id === id || b?.id === id;
}

export function cursorReducer(
  state: WalkthroughState,
  action: WalkthroughAction,
  sequence: Sequence,
): WalkthroughState {
  switch (action.type) {
    case "advance": {
      const { sceneIndex, beatIndex } = state.cursor;
      const scene = sequence[sceneIndex];
      if (!scene) return state;
      if (beatIndex + 1 < scene.beats.length) {
        return { ...state, cursor: { sceneIndex, beatIndex: beatIndex + 1 }, lastDirection: "forward" };
      }
      if (sceneIndex + 1 < sequence.length) {
        return { ...state, cursor: { sceneIndex: sceneIndex + 1, beatIndex: 0 }, lastDirection: "forward" };
      }
      return state;
    }
    case "back": {
      const { sceneIndex, beatIndex } = state.cursor;
      if (beatIndex > 0) {
        return { ...state, cursor: { sceneIndex, beatIndex: beatIndex - 1 }, lastDirection: "back" };
      }
      if (sceneIndex > 0) {
        const prev = sequence[sceneIndex - 1];
        return { ...state, cursor: { sceneIndex: sceneIndex - 1, beatIndex: prev.beats.length - 1 }, lastDirection: "back" };
      }
      return state;
    }
    case "jumpTo":
      return { ...state, cursor: action.cursor, lastDirection: "forward" };
    case "toggleHud":
      return { ...state, hudVisible: !state.hudVisible };
    default:
      return state;
  }
}

type Ctx = {
  state: WalkthroughState;
  sequence: Sequence;
  advance: () => void;
  back: () => void;
  jumpTo: (cursor: Cursor) => void;
  toggleHud: () => void;
};

const WalkthroughContext = createContext<Ctx | null>(null);

const initialState: WalkthroughState = {
  cursor: { sceneIndex: 0, beatIndex: 0 },
  hudVisible: false,
};

export function WalkthroughProvider({ sequence, children }: { sequence: Sequence; children: ReactNode }) {
  const [state, dispatch] = useReducer(
    (s: WalkthroughState, a: WalkthroughAction) => cursorReducer(s, a, sequence),
    initialState,
  );

  const advance = useCallback(() => {
    // If this advance will step from the last beat of a scene into the next
    // scene, strip any lingering view-transition-name declarations from DOM
    // elements the current scene was targeting. Without this, the browser's
    // view-transition captures the old frame with the name still live and the
    // outgoing scene's lift/expand animation bleeds into the next scene.
    const { sceneIndex, beatIndex } = state.cursor;
    const currentScene = sequence[sceneIndex];
    const atLastBeat = currentScene && beatIndex + 1 >= currentScene.beats.length;
    const willLeaveScene = atLastBeat && sceneIndex + 1 < sequence.length;
    if (willLeaveScene && typeof document !== "undefined") {
      const targets = new Set<string>();
      for (const beat of currentScene.beats) {
        if (beat.kind === "lift" || beat.kind === "expand" || beat.kind === "highlight") {
          targets.add(beat.target as string);
        }
      }
      for (const name of targets) {
        document
          .querySelectorAll<HTMLElement>(`[data-vt-name="${name}"]`)
          .forEach((el) => {
            if (el.classList.contains("wt-stage-slot")) return;
            el.style.viewTransitionName = "none";
          });
      }
    }
    const nextScene = willLeaveScene ? sequence[sceneIndex + 1] : currentScene;
    const htmlClass = scenesInvolve(currentScene, nextScene, "ask-hoai")
      ? "wt-ash-vt-active"
      : undefined;
    withTransition(() => dispatch({ type: "advance" }), { htmlClass });
  }, [state.cursor, sequence]);
  const back = useCallback(() => {
    // If the current beat declares a reverseTo target, click it to undo the
    // beat's forward side effect (close an opened detail, roll back a phase
    // change). Give React one frame to commit before advancing cursor state
    // so the backward beat renders against the restored DOM.
    const { sceneIndex, beatIndex } = state.cursor;
    const currentScene = sequence[sceneIndex];
    const currentBeat = currentScene?.beats[beatIndex];
    const reverseTo =
      currentBeat && currentBeat.kind === "cursor" ? currentBeat.reverseTo : undefined;
    const prevScene = beatIndex > 0 ? currentScene : sequence[sceneIndex - 1];
    const htmlClass = scenesInvolve(currentScene, prevScene, "ask-hoai")
      ? "wt-ash-vt-active"
      : undefined;
    if (reverseTo) {
      const el = document.querySelector<HTMLElement>(`[data-vt-name="${reverseTo}"]`);
      el?.click();
      requestAnimationFrame(() =>
        withTransition(() => dispatch({ type: "back" }), { htmlClass }),
      );
    } else {
      withTransition(() => dispatch({ type: "back" }), { htmlClass });
    }
  }, [state.cursor, sequence]);
  const jumpTo = useCallback(
    (cursor: Cursor) => {
      const curScene = sequence[state.cursor.sceneIndex];
      const nextScene = sequence[cursor.sceneIndex];
      const htmlClass = scenesInvolve(curScene, nextScene, "ask-hoai")
        ? "wt-ash-vt-active"
        : undefined;
      withTransition(() => dispatch({ type: "jumpTo", cursor }), { htmlClass });
    },
    [state.cursor, sequence],
  );
  const toggleHud = useCallback(() => dispatch({ type: "toggleHud" }), []);

  const value = useMemo<Ctx>(
    () => ({ state, sequence, advance, back, jumpTo, toggleHud }),
    [state, sequence, advance, back, jumpTo, toggleHud],
  );

  return <WalkthroughContext.Provider value={value}>{children}</WalkthroughContext.Provider>;
}

export function useCursor() {
  const ctx = useContext(WalkthroughContext);
  if (!ctx) throw new Error("useCursor must be used within <WalkthroughProvider>");
  const { state, sequence } = ctx;
  const scene: Scene | undefined = sequence[state.cursor.sceneIndex];
  const beat: Beat | undefined = scene?.beats[state.cursor.beatIndex];
  return {
    cursor: state.cursor,
    scene,
    beat,
    sceneId: scene?.id,
    page: scene?.page,
    hudVisible: state.hudVisible,
    direction: state.lastDirection ?? "forward",
    advance: ctx.advance,
    back: ctx.back,
    jumpTo: ctx.jumpTo,
    toggleHud: ctx.toggleHud,
    sequence,
  };
}
