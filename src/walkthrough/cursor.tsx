import { createContext, useCallback, useContext, useMemo, useReducer, type ReactNode } from "react";
import type { Beat, Cursor, Scene, Sequence, WalkthroughAction, WalkthroughState } from "./types";

// Shared between beats and the keyboard handler. Beats flip `beatBusyRef` to
// `true` while their animation is running so arrow keys don't skip past
// mid-sequence; the keyboard handler and HUD read `isWalkthroughBusy()` before
// dispatching advance/back. Mutable ref — no re-renders needed when it flips.
export const beatBusyRef = { current: false };

// Ref-counted holds for timed sequences that live outside a cursor beat (app
// animations, chat typing, phone slides). Each `holdBusy()` must be released;
// the release function is idempotent.
let busyHolds = 0;

export function holdBusy(): () => void {
  busyHolds += 1;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    busyHolds -= 1;
  };
}

export function isWalkthroughBusy(): boolean {
  return beatBusyRef.current || busyHolds > 0;
}

export function withTransition(update: () => void): void {
  update();
}

/** The scene the app underneath shows for `cursor`; see `WalkthroughState.appSceneIndex`. */
export function appSceneIndexFor(cursor: Cursor, prevAppSceneIndex: number, sequence: Sequence): number {
  const scene = sequence[cursor.sceneIndex];
  if (scene?.stage !== "phone") return cursor.sceneIndex;
  if (cursor.beatIndex === 0) return prevAppSceneIndex;
  for (let i = cursor.sceneIndex + 1; i < sequence.length; i++) {
    if (sequence[i].stage !== "phone") return i;
  }
  return prevAppSceneIndex;
}

export function cursorReducer(
  state: WalkthroughState,
  action: WalkthroughAction,
  sequence: Sequence,
): WalkthroughState {
  if (action.type === "toggleHud") return { ...state, hudVisible: !state.hudVisible };
  const next = moveCursor(state, action, sequence);
  if (next === state) return state;
  const appSceneIndex = appSceneIndexFor(next.cursor, state.appSceneIndex, sequence);
  const arrivedAtAppScene =
    next.cursor.sceneIndex !== state.cursor.sceneIndex && sequence[next.cursor.sceneIndex]?.stage !== "phone";
  const resync = appSceneIndex !== state.appSceneIndex || arrivedAtAppScene;
  if (!resync) return next;
  return { ...next, appSceneIndex, appSyncKey: state.appSyncKey + 1 };
}

function moveCursor(
  state: WalkthroughState,
  action: WalkthroughAction,
  sequence: Sequence,
): WalkthroughState {
  switch (action.type) {
    case "advance": {
      const { sceneIndex, beatIndex } = state.cursor;
      const scene = sequence[sceneIndex];
      if (!scene) return state;
      if (state.replayOnAdvance) {
        return { ...state, lastDirection: "forward", replayOnAdvance: false };
      }
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
        const prevBeat = sequence[sceneIndex]?.beats[beatIndex - 1];
        return {
          ...state,
          cursor: { sceneIndex, beatIndex: beatIndex - 1 },
          lastDirection: "back",
          replayOnAdvance: prevBeat?.kind === "cursor" && prevBeat.replayOnBack === true,
        };
      }
      if (sceneIndex > 0) {
        const prev = sequence[sceneIndex - 1];
        const landing = prev.reenterAtStart ? 0 : prev.beats.length - 1;
        return {
          ...state,
          cursor: { sceneIndex: sceneIndex - 1, beatIndex: landing },
          lastDirection: "back",
          replayOnAdvance: prev.beats[landing]?.kind === "cursor",
        };
      }
      return state;
    }
    case "jumpTo":
      return { ...state, cursor: action.cursor, lastDirection: "forward", replayOnAdvance: false };
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
  appSceneIndex: 0,
  appSyncKey: 0,
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
  // What the app underneath shows; differs from `scene` only around phone scenes.
  const appScene: Scene | undefined = sequence[state.appSceneIndex];
  return {
    cursor: state.cursor,
    scene,
    beat,
    sceneId: scene?.id,
    page: scene?.page,
    appScene,
    appSceneId: appScene?.id,
    appPage: appScene?.page,
    appSyncKey: state.appSyncKey,
    hudVisible: state.hudVisible,
    direction: state.lastDirection ?? "forward",
    replayOnAdvance: state.replayOnAdvance ?? false,
    advance: ctx.advance,
    back: ctx.back,
    jumpTo: ctx.jumpTo,
    toggleHud: ctx.toggleHud,
    sequence,
  };
}
