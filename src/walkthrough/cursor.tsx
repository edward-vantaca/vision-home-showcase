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

export function withTransition(update: () => void): void {
  const vt = typeof document !== "undefined" ? document.startViewTransition : undefined;
  if (vt && !prefersReducedMotion()) {
    vt.call(document, update);
  } else {
    update();
  }
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
        return { ...state, cursor: { sceneIndex, beatIndex: beatIndex + 1 } };
      }
      if (sceneIndex + 1 < sequence.length) {
        return { ...state, cursor: { sceneIndex: sceneIndex + 1, beatIndex: 0 } };
      }
      return state;
    }
    case "back": {
      const { sceneIndex, beatIndex } = state.cursor;
      if (beatIndex > 0) {
        return { ...state, cursor: { sceneIndex, beatIndex: beatIndex - 1 } };
      }
      if (sceneIndex > 0) {
        const prev = sequence[sceneIndex - 1];
        return { ...state, cursor: { sceneIndex: sceneIndex - 1, beatIndex: prev.beats.length - 1 } };
      }
      return state;
    }
    case "jumpTo":
      return { ...state, cursor: action.cursor };
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

  const advance = useCallback(() => withTransition(() => dispatch({ type: "advance" })), []);
  const back = useCallback(() => withTransition(() => dispatch({ type: "back" })), []);
  const jumpTo = useCallback(
    (cursor: Cursor) => withTransition(() => dispatch({ type: "jumpTo", cursor })),
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
    advance: ctx.advance,
    back: ctx.back,
    jumpTo: ctx.jumpTo,
    toggleHud: ctx.toggleHud,
    sequence,
  };
}
