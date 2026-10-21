import { createContext, useCallback, useContext, useMemo, useReducer, type ReactNode } from "react";
import type { Beat, Cursor, Scene, Sequence, WalkthroughAction, WalkthroughState } from "./types";

// Shared between beats and the keyboard handler. Beats flip this to `true` while
// their animation is running so arrow keys don't skip past mid-sequence; the
// keyboard handler reads it before dispatching advance/back. Mutable ref — no
// re-renders needed when the flag flips.
export const beatBusyRef = { current: false };

export function withTransition(update: () => void): void {
  update();
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
    withTransition(() => dispatch({ type: "advance" }));
  }, []);
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
    if (reverseTo) {
      const el = document.querySelector<HTMLElement>(`[data-vt-name="${reverseTo}"]`);
      el?.click();
      requestAnimationFrame(() =>
        withTransition(() => dispatch({ type: "back" })),
      );
    } else {
      withTransition(() => dispatch({ type: "back" }));
    }
  }, [state.cursor, sequence]);
  const jumpTo = useCallback(
    (cursor: Cursor) => {
      withTransition(() => dispatch({ type: "jumpTo", cursor }));
    },
    [],
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
