import { createContext, useCallback, useContext, useMemo, useReducer, type ReactNode } from "react";
import type { Beat, Sequence, WalkthroughAction, WalkthroughState } from "./types";

export const initialState: WalkthroughState = {
  active: false,
  sequenceId: null,
  currentBeatIndex: 0,
  hudVisible: true,
  history: [],
};

export function walkthroughReducer(
  state: WalkthroughState,
  action: WalkthroughAction,
  sequences: Record<string, Sequence>,
): WalkthroughState {
  switch (action.type) {
    case "start": {
      const seq = sequences[action.sequenceId];
      if (!seq) return state;
      return {
        active: true,
        sequenceId: action.sequenceId,
        currentBeatIndex: 0,
        hudVisible: action.hudVisible ?? true,
        history: [],
      };
    }
    case "advance": {
      if (!state.active || !state.sequenceId) return state;
      const seq = sequences[state.sequenceId];
      if (!seq) return state;
      const nextIndex = state.currentBeatIndex + 1;
      if (nextIndex >= seq.beats.length) {
        return { ...initialState };
      }
      return {
        ...state,
        currentBeatIndex: nextIndex,
        history: [...state.history, state.currentBeatIndex],
      };
    }
    case "back": {
      if (!state.active || state.history.length === 0) return state;
      const prevIndex = state.history[state.history.length - 1];
      return {
        ...state,
        currentBeatIndex: prevIndex,
        history: state.history.slice(0, -1),
      };
    }
    case "exit":
      return { ...initialState };
    case "toggleHud":
      return { ...state, hudVisible: !state.hudVisible };
    case "replayBeat":
      return state;
    case "skipToEnd": {
      if (!state.active || !state.sequenceId) return state;
      const seq = sequences[state.sequenceId];
      if (!seq) return state;
      return { ...state, currentBeatIndex: seq.beats.length - 1 };
    }
    default:
      return state;
  }
}

type WalkthroughContextValue = {
  state: WalkthroughState;
  start: (sequenceId: string, opts?: { hudVisible?: boolean }) => void;
  advance: () => void;
  back: () => void;
  exit: () => void;
  toggleHud: () => void;
  replayBeat: () => void;
  skipToEnd: () => void;
  getCurrentSequence: () => Sequence | null;
  getCurrentBeat: () => Beat | null;
  requestNavigate: (page: string) => void;
};

const WalkthroughContext = createContext<WalkthroughContextValue | null>(null);

type ProviderProps = {
  children: ReactNode;
  sequences: Record<string, Sequence>;
  onNavigate?: (page: string) => void;
};

export function WalkthroughProvider({ children, sequences, onNavigate }: ProviderProps) {
  const [state, dispatch] = useReducer(
    (s: WalkthroughState, a: WalkthroughAction) => walkthroughReducer(s, a, sequences),
    initialState,
  );

  const getCurrentSequence = useCallback(
    () => (state.sequenceId ? sequences[state.sequenceId] ?? null : null),
    [state.sequenceId, sequences],
  );
  const getCurrentBeat = useCallback(() => {
    const seq = getCurrentSequence();
    return seq ? seq.beats[state.currentBeatIndex] ?? null : null;
  }, [getCurrentSequence, state.currentBeatIndex]);

  const value = useMemo<WalkthroughContextValue>(
    () => ({
      state,
      start: (sequenceId, opts) => dispatch({ type: "start", sequenceId, hudVisible: opts?.hudVisible }),
      advance: () => dispatch({ type: "advance" }),
      back: () => dispatch({ type: "back" }),
      exit: () => dispatch({ type: "exit" }),
      toggleHud: () => dispatch({ type: "toggleHud" }),
      replayBeat: () => dispatch({ type: "replayBeat" }),
      skipToEnd: () => dispatch({ type: "skipToEnd" }),
      getCurrentSequence,
      getCurrentBeat,
      requestNavigate: (page: string) => {
        onNavigate?.(page);
      },
    }),
    [state, getCurrentSequence, getCurrentBeat, onNavigate],
  );

  return <WalkthroughContext.Provider value={value}>{children}</WalkthroughContext.Provider>;
}

export function useWalkthrough(): WalkthroughContextValue {
  const ctx = useContext(WalkthroughContext);
  if (!ctx) throw new Error("useWalkthrough must be used inside <WalkthroughProvider>");
  return ctx;
}
