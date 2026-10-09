# Curated Walkthrough Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a hand-driven, cinematic walkthrough subsystem that elevates individual UI elements onto a stage overlay and returns them in place — delivered with two concrete sequences (Board Actions, Community Amenity) for the Vantaca user conference.

**Architecture:** React 19 context + reducer orchestrates a tagged-union beat DSL; a portal-mounted `<WalkthroughStage>` dispatches each beat to a per-kind renderer. Motion handles structural morphs via shared `layoutId`; GSAP (via `@gsap/react`) handles choreographed hero beats. All code lives in `src/walkthrough/` with a single-point integration at `src/main.tsx`.

**Tech Stack:** React 19, TypeScript 5.7, Vite 8, Tailwind v4, Motion (`motion` package, formerly framer-motion), GSAP + `@gsap/react`, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-09-curated-walkthrough-design.md`

## Global Constraints

- Runtime targets: React 19.x, TypeScript 5.7.x, Vite 8.x, Tailwind v4 (per `package.json`).
- Node + pnpm versions as pinned in `.mise.toml`.
- All subsystem code lives under `src/walkthrough/`. Only four files outside that directory may change: `src/main.tsx` (wire provider+stage), `src/App.tsx` (add `"amenities"` to the `Page` union and conditional nav), `src/board/BoardTasksWidget.tsx` (one attribute addition), and a new `src/amenities/AmenitiesPage.tsx`.
- No telemetry, no analytics, no i18n, no HUD-preference persistence (per spec non-goals).
- Target lookup uses `data-ux-id` attributes already present in the app; the hook-based registry is additive, not required.
- New npm deps (exact names): `motion`, `gsap`, `@gsap/react`, `vitest`, `@testing-library/react`, `@testing-library/user-event`, `jsdom`.
- String rule (from `AGENTS.md`): strings containing apostrophes use double quotes; components use default exports.
- Keyboard chord `Cmd+Shift+W` opens the launcher. Keys that advance/back/exit a running tour: `→`/`Space`/`PageDown` (advance), `←`/`PageUp` (back), `Esc` (exit), `.` (skip-to-end), `0` (replay beat), `H` (toggle HUD).
- Esc exits cleanly in all states — this is a hard guarantee.
- Zero app-code modification policy for the Board Actions widget beyond the single `data-ux-id` attribute addition.

## Review Focus

Five input classes the spec implies but no task's primary tests exercise. Each line gets its test added to the owning task's step list.

- **Rapid repeat `advance()` during an in-flight beat** — the second `advance()` must not stack a second renderer or leave a half-mounted beat. The provider's `advance` is a reducer action, so the test lives in Task 3 (reducer tests): dispatching `advance` twice in a row from any beat index increments `currentBeatIndex` by exactly 1 per dispatch and never past `beats.length`.
- **URL `?demo=unknown-id`** — unknown sequenceId must warn and no-op, not crash. Test lives in Task 11 (launcher): rendering `<WalkthroughLauncher>` with `?demo=does-not-exist` logs a warning and leaves `state.active === false`.
- **Target element missing from DOM at beat start** — `resolveTarget` returns `null`, beat must handle gracefully (console warn, `onComplete` still fires so `→` keeps working). Test lives in Task 2 (registry): `resolveTarget("nope")` returns `null`; and in Task 6 (first beat renderer): mounting a beat whose target is missing invokes `onComplete` within one tick and does not throw.
- **`Esc` during a `navigate` beat** — the stage must unmount cleanly even if the app page is mid-transition. Test lives in Task 10 (navigate beat): a sequence containing a `navigate` beat, with `exit()` dispatched before the beat's `onComplete` fires, leaves `state.active === false` and does not throw.
- **`H` toggle during a GSAP timeline** — hiding captions must not break a running `annotate` beat. GSAP cleanup via `useGSAP` must detach timelines when the beat unmounts. Test lives in Task 9 (annotate beat): mounting then unmounting an `AnnotateWithGSAP` beat does not leave orphan timelines on `gsap.globalTimeline` (snapshot `gsap.globalTimeline.getChildren().length` before/after).

---

## File Structure

**New files under `src/walkthrough/`:**

| Path | Responsibility |
|---|---|
| `types.ts` | Shared types: `Beat`, `BeatKind`, `Sequence`, `Point`, `WalkthroughState`, `WalkthroughAction`, `BeatProps`. |
| `targetRegistry.ts` | Module-level `Map<string, HTMLElement>` + `resolveTarget(id)` with `data-ux-id` fallback. |
| `useWalkthroughTarget.ts` | `useWalkthroughTarget(id)` returns a ref-callback that registers/unregisters on mount/unmount. |
| `WalkthroughProvider.tsx` | React context + `useReducer`; exposes `useWalkthrough()` hook with actions. |
| `keyboard.ts` | `useWalkthroughKeyboard()` hook; installs `keydown` listener only when `state.active`. |
| `WalkthroughStage.tsx` | Portal to `document.body`; renders backdrop + stage + HUD; dispatches current beat to its renderer. |
| `WalkthroughHUD.tsx` | Progress dots, prev/next buttons, exit button, system caption; respects `state.hudVisible`. |
| `WalkthroughLauncher.tsx` | Reads URL params + `Cmd+Shift+W`; renders sequence picker. |
| `beats/HighlightTarget.tsx` | Motion: dim overlay with cutout + pulsing ring around target rect. |
| `beats/LiftToStage.tsx` | Motion `layoutId`: travels source element rect → centered stage card. |
| `beats/ExpandContent.tsx` | Motion: morphs the lifted card to larger dimensions and swaps inner content. |
| `beats/AnnotateWithGSAP.tsx` | `useGSAP` timeline running `arrow` / `pulse` / `typeCaption` tracks in parallel. |
| `beats/ReturnToOrigin.tsx` | Motion `layoutId`: reverse of Lift. |
| `beats/NavigateApp.tsx` | Calls provider's `onNavigate` callback, waits a tick, completes. |
| `sequences/boardActions.tsx` | Board Actions sequence definition + import of stage-content. |
| `sequences/amenity.tsx` | Amenity sequence definition + import of stage-content. |
| `sequences/index.ts` | `sequenceRegistry: Record<string, Sequence>` + `getSequence(id)`. |
| `stage-content/BoardActionStageDetail.tsx` | The expanded detail content for a Board Action (notices sent, timeline, approve/reject buttons). |
| `stage-content/AmenityReservationStage.tsx` | The reservation UI for the pool amenity (image + 7-day calendar strip + time slots). |
| `__tests__/reducer.test.ts` | Pure reducer state-transition tests. |
| `__tests__/targetRegistry.test.ts` | Registry get/set + fallback resolver tests. |
| `__tests__/keyboard.test.tsx` | Keyboard hook dispatch tests. |
| `__tests__/stage.test.tsx` | Stage mounts/unmounts with state tests. |
| `__tests__/launcher.test.tsx` | Launcher URL-param + Cmd+Shift+W tests. |
| `__tests__/sequences.test.ts` | Sequence integrity test (every beat kind is recognized). |

**New files outside `src/walkthrough/`:**

| Path | Responsibility |
|---|---|
| `src/amenities/AmenitiesPage.tsx` | Demo-only 4-tile amenity grid. |

**Modified files:**

| Path | Change |
|---|---|
| `package.json` | Add deps (motion, gsap, @gsap/react) + devDeps (vitest, @testing-library/*, jsdom) + `"test"` script. |
| `vite.config.ts` | Add `test` block (jsdom env, setup file). |
| `src/main.tsx` | Wrap `<App />` with `<WalkthroughProvider onNavigate={...}>`; mount `<WalkthroughStage />` + `<WalkthroughLauncher />`. |
| `src/App.tsx` | Extend `Page` type with `"amenities"`; render `<AmenitiesPage />` branch; add conditional nav entry visible only when URL has `?demo=true`. |
| `src/board/BoardTasksWidget.tsx` | Add `data-ux-id="board-task-current"` to the currently-rendered task row (line ~203). |

**One deliberate deviation from spec:** The spec's Board Actions sequence targets `board-task-VIO-1804`, but `BoardTasksWidget` shows one task at a time via a `taskIndex` carousel — not a list. Pragmatic resolution: add `data-ux-id="board-task-current"` on the active row and have the sequence target `board-task-current`. The Board Actions sequence file (Task 12) is responsible for seeking the carousel to VIO-1804 before the Lift beat fires (via a one-off `useEffect` on sequence start, or by setting the initial task index of the widget in a demo-aware way — see Task 12 for the exact mechanism).

---

## Task 1: Install dependencies and wire Vitest

**Files:**
- Modify: `package.json`
- Modify: `vite.config.ts`
- Create: `src/walkthrough/__tests__/sanity.test.ts`
- Create: `src/test-setup.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `npm test` script runs Vitest with jsdom; `src/test-setup.ts` installs `@testing-library/jest-dom` matchers (optional but useful).

- [ ] **Step 1: Install runtime deps**

```bash
npm install motion gsap @gsap/react
```

Expected: `npm install` succeeds (no auth errors — `.npmrc` was removed earlier). Verify `motion`, `gsap`, and `@gsap/react` appear in `package.json` `dependencies`.

- [ ] **Step 2: Install dev deps**

```bash
npm install -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
```

Expected: packages added under `devDependencies`.

- [ ] **Step 3: Add `test` script to package.json**

Edit `package.json` to add this line to `scripts`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Create `src/test-setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 5: Add Vitest config to `vite.config.ts`**

Add the following block to the Vite config export (merge with existing `defineConfig` call — keep all existing options):

```ts
test: {
  environment: "jsdom",
  globals: true,
  setupFiles: ["./src/test-setup.ts"],
},
```

Also add `/// <reference types="vitest" />` at the top of `vite.config.ts` so the `test` block type-checks.

- [ ] **Step 6: Write sanity test**

Create `src/walkthrough/__tests__/sanity.test.ts`:

```ts
import { describe, expect, it } from "vitest";

describe("vitest setup", () => {
  it("runs a trivial assertion", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 7: Run tests to verify setup**

Run: `npm test`
Expected: 1 test file, 1 passing test. Zero errors.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json vite.config.ts src/test-setup.ts src/walkthrough/__tests__/sanity.test.ts
git commit -m "chore: add motion, gsap, and vitest for walkthrough subsystem"
```

---

## Task 2: Shared types + target registry

**Files:**
- Create: `src/walkthrough/types.ts`
- Create: `src/walkthrough/targetRegistry.ts`
- Create: `src/walkthrough/useWalkthroughTarget.ts`
- Create: `src/walkthrough/__tests__/targetRegistry.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `types.ts` exports: `Point`, `BeatKind`, `Beat`, `Sequence`, `WalkthroughState`, `WalkthroughAction`, `BeatProps`.
  - `targetRegistry.ts` exports: `registerTarget(id: string, el: HTMLElement): void`, `unregisterTarget(id: string): void`, `resolveTarget(id: string): HTMLElement | null`, `clearRegistry(): void` (for tests).
  - `useWalkthroughTarget.ts` exports: `useWalkthroughTarget(id: string): (el: HTMLElement | null) => void` — a ref callback.

- [ ] **Step 1: Write failing registry test**

Create `src/walkthrough/__tests__/targetRegistry.test.ts`:

```ts
import { afterEach, describe, expect, it } from "vitest";
import { clearRegistry, registerTarget, resolveTarget, unregisterTarget } from "../targetRegistry";

afterEach(() => {
  clearRegistry();
  document.body.innerHTML = "";
});

describe("targetRegistry", () => {
  it("resolves a registered element", () => {
    const el = document.createElement("div");
    registerTarget("foo", el);
    expect(resolveTarget("foo")).toBe(el);
  });

  it("returns null for an unknown id", () => {
    expect(resolveTarget("nope")).toBeNull();
  });

  it("falls back to data-ux-id lookup when id not registered", () => {
    const el = document.createElement("div");
    el.setAttribute("data-ux-id", "fallback-target");
    document.body.appendChild(el);
    expect(resolveTarget("fallback-target")).toBe(el);
  });

  it("prefers registered element over data-ux-id fallback", () => {
    const registered = document.createElement("span");
    const inDom = document.createElement("div");
    inDom.setAttribute("data-ux-id", "both-exist");
    document.body.appendChild(inDom);
    registerTarget("both-exist", registered);
    expect(resolveTarget("both-exist")).toBe(registered);
  });

  it("unregister removes the entry", () => {
    const el = document.createElement("div");
    registerTarget("gone", el);
    unregisterTarget("gone");
    expect(resolveTarget("gone")).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests, verify FAIL**

Run: `npm test -- targetRegistry`
Expected: FAIL — module not found.

- [ ] **Step 3: Create `src/walkthrough/types.ts`**

```ts
import type { ReactNode } from "react";

export type Point = { x: number; y: number };

export type BeatKind = "highlight" | "lift" | "expand" | "annotate" | "return" | "navigate";

export type AnnotateTrack =
  | { type: "arrow"; from: string | Point; to: string | Point }
  | { type: "pulse"; target: string; count?: number }
  | { type: "typeCaption"; text: string; speedCps?: number };

export type Beat =
  | { kind: "highlight"; target: string; caption?: string; durationMs?: number }
  | { kind: "lift"; target: string; scale?: number; position?: "center" | Point; caption?: string }
  | { kind: "expand"; content: ReactNode; caption?: string }
  | { kind: "annotate"; tracks: AnnotateTrack[]; durationMs?: number }
  | { kind: "return"; caption?: string }
  | { kind: "navigate"; to: string; caption?: string };

export type Sequence = {
  id: string;
  title: string;
  beats: Beat[];
};

export type WalkthroughState = {
  active: boolean;
  sequenceId: string | null;
  currentBeatIndex: number;
  hudVisible: boolean;
  history: number[];
};

export type WalkthroughAction =
  | { type: "start"; sequenceId: string; hudVisible?: boolean }
  | { type: "advance" }
  | { type: "back" }
  | { type: "exit" }
  | { type: "toggleHud" }
  | { type: "replayBeat" }
  | { type: "skipToEnd" };

export type BeatProps<B extends Beat = Beat> = {
  beat: B;
  onComplete: () => void;
};
```

- [ ] **Step 4: Create `src/walkthrough/targetRegistry.ts`**

```ts
const registry = new Map<string, HTMLElement>();

export function registerTarget(id: string, el: HTMLElement): void {
  registry.set(id, el);
}

export function unregisterTarget(id: string): void {
  registry.delete(id);
}

export function resolveTarget(id: string): HTMLElement | null {
  const registered = registry.get(id);
  if (registered && registered.isConnected) return registered;
  const fallback = document.querySelector<HTMLElement>(`[data-ux-id="${CSS.escape(id)}"]`);
  return fallback ?? null;
}

export function clearRegistry(): void {
  registry.clear();
}
```

- [ ] **Step 5: Run tests, verify PASS**

Run: `npm test -- targetRegistry`
Expected: 5 passing tests.

- [ ] **Step 6: Create `src/walkthrough/useWalkthroughTarget.ts`**

```ts
import { useCallback } from "react";
import { registerTarget, unregisterTarget } from "./targetRegistry";

export function useWalkthroughTarget(id: string): (el: HTMLElement | null) => void {
  return useCallback(
    (el: HTMLElement | null) => {
      if (el) registerTarget(id, el);
      else unregisterTarget(id);
    },
    [id],
  );
}
```

(No separate test for the hook — it is a thin wrapper over `registerTarget`/`unregisterTarget` already covered.)

- [ ] **Step 7: Commit**

```bash
git add src/walkthrough/types.ts src/walkthrough/targetRegistry.ts src/walkthrough/useWalkthroughTarget.ts src/walkthrough/__tests__/targetRegistry.test.ts
git commit -m "feat(walkthrough): shared types and target registry with data-ux-id fallback"
```

---

## Task 3: Reducer + Provider

**Files:**
- Create: `src/walkthrough/WalkthroughProvider.tsx`
- Create: `src/walkthrough/__tests__/reducer.test.ts`

**Interfaces:**
- Consumes: `types.ts` from Task 2.
- Produces:
  - Export `walkthroughReducer(state, action): WalkthroughState` (named export, for direct testing).
  - Export `WalkthroughProvider` React component — props: `{ children: ReactNode; sequences: Record<string, Sequence>; onNavigate?: (page: string) => void }`.
  - Export `useWalkthrough()` hook returning `{ state: WalkthroughState; start: (id: string, opts?: { hudVisible?: boolean }) => void; advance: () => void; back: () => void; exit: () => void; toggleHud: () => void; replayBeat: () => void; skipToEnd: () => void; getCurrentSequence: () => Sequence | null; getCurrentBeat: () => Beat | null; requestNavigate: (page: string) => void }`.

- [ ] **Step 1: Write failing reducer tests**

Create `src/walkthrough/__tests__/reducer.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { walkthroughReducer, initialState } from "../WalkthroughProvider";
import type { Sequence } from "../types";

const sequence: Sequence = {
  id: "s1",
  title: "Test",
  beats: [
    { kind: "highlight", target: "a" },
    { kind: "highlight", target: "b" },
    { kind: "highlight", target: "c" },
  ],
};
const sequences = { s1: sequence };

describe("walkthroughReducer", () => {
  it("start sets active, sequenceId, and resets beat index", () => {
    const next = walkthroughReducer(initialState, { type: "start", sequenceId: "s1" }, sequences);
    expect(next.active).toBe(true);
    expect(next.sequenceId).toBe("s1");
    expect(next.currentBeatIndex).toBe(0);
    expect(next.history).toEqual([]);
  });

  it("start accepts hudVisible override", () => {
    const next = walkthroughReducer(initialState, { type: "start", sequenceId: "s1", hudVisible: false }, sequences);
    expect(next.hudVisible).toBe(false);
  });

  it("start with unknown sequenceId is a no-op", () => {
    const next = walkthroughReducer(initialState, { type: "start", sequenceId: "unknown" }, sequences);
    expect(next).toBe(initialState);
  });

  it("advance increments beat index and pushes to history", () => {
    const started = walkthroughReducer(initialState, { type: "start", sequenceId: "s1" }, sequences);
    const next = walkthroughReducer(started, { type: "advance" }, sequences);
    expect(next.currentBeatIndex).toBe(1);
    expect(next.history).toEqual([0]);
  });

  it("double advance increments by exactly 2 (no stacking)", () => {
    const s0 = walkthroughReducer(initialState, { type: "start", sequenceId: "s1" }, sequences);
    const s1 = walkthroughReducer(s0, { type: "advance" }, sequences);
    const s2 = walkthroughReducer(s1, { type: "advance" }, sequences);
    expect(s2.currentBeatIndex).toBe(2);
  });

  it("advance past last beat triggers exit", () => {
    let state = walkthroughReducer(initialState, { type: "start", sequenceId: "s1" }, sequences);
    for (let i = 0; i < 3; i++) state = walkthroughReducer(state, { type: "advance" }, sequences);
    expect(state.active).toBe(false);
    expect(state.sequenceId).toBeNull();
  });

  it("back pops history", () => {
    let state = walkthroughReducer(initialState, { type: "start", sequenceId: "s1" }, sequences);
    state = walkthroughReducer(state, { type: "advance" }, sequences);
    state = walkthroughReducer(state, { type: "advance" }, sequences);
    expect(state.currentBeatIndex).toBe(2);
    state = walkthroughReducer(state, { type: "back" }, sequences);
    expect(state.currentBeatIndex).toBe(1);
    expect(state.history).toEqual([0]);
  });

  it("back at beat 0 is a no-op", () => {
    const started = walkthroughReducer(initialState, { type: "start", sequenceId: "s1" }, sequences);
    const next = walkthroughReducer(started, { type: "back" }, sequences);
    expect(next).toBe(started);
  });

  it("exit resets to inactive", () => {
    const started = walkthroughReducer(initialState, { type: "start", sequenceId: "s1" }, sequences);
    const next = walkthroughReducer(started, { type: "exit" }, sequences);
    expect(next.active).toBe(false);
    expect(next.sequenceId).toBeNull();
    expect(next.currentBeatIndex).toBe(0);
    expect(next.history).toEqual([]);
  });

  it("toggleHud flips hudVisible", () => {
    const started = walkthroughReducer(initialState, { type: "start", sequenceId: "s1" }, sequences);
    expect(started.hudVisible).toBe(true);
    const next = walkthroughReducer(started, { type: "toggleHud" }, sequences);
    expect(next.hudVisible).toBe(false);
  });

  it("replayBeat returns the same beat index", () => {
    let state = walkthroughReducer(initialState, { type: "start", sequenceId: "s1" }, sequences);
    state = walkthroughReducer(state, { type: "advance" }, sequences);
    const next = walkthroughReducer(state, { type: "replayBeat" }, sequences);
    expect(next.currentBeatIndex).toBe(state.currentBeatIndex);
  });

  it("skipToEnd jumps to last beat without exiting", () => {
    const started = walkthroughReducer(initialState, { type: "start", sequenceId: "s1" }, sequences);
    const next = walkthroughReducer(started, { type: "skipToEnd" }, sequences);
    expect(next.currentBeatIndex).toBe(2);
    expect(next.active).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests, verify FAIL**

Run: `npm test -- reducer`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `WalkthroughProvider.tsx`**

```tsx
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
```

- [ ] **Step 4: Run tests, verify PASS**

Run: `npm test -- reducer`
Expected: 12 passing tests.

- [ ] **Step 5: Commit**

```bash
git add src/walkthrough/WalkthroughProvider.tsx src/walkthrough/__tests__/reducer.test.ts
git commit -m "feat(walkthrough): provider with reducer, context, and sequence resolution"
```

---

## Task 4: Global keyboard handler

**Files:**
- Create: `src/walkthrough/keyboard.ts`
- Create: `src/walkthrough/__tests__/keyboard.test.tsx`

**Interfaces:**
- Consumes: `useWalkthrough()` from Task 3.
- Produces: `useWalkthroughKeyboard()` — a hook that installs a `window` keydown listener while `state.active`, mapping keys to provider actions. No return value.

- [ ] **Step 1: Write failing keyboard test**

Create `src/walkthrough/__tests__/keyboard.test.tsx`:

```tsx
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { useWalkthroughKeyboard } from "../keyboard";
import { WalkthroughProvider, useWalkthrough } from "../WalkthroughProvider";
import type { Sequence } from "../types";

const sequences: Record<string, Sequence> = {
  s1: {
    id: "s1",
    title: "T",
    beats: [
      { kind: "highlight", target: "a" },
      { kind: "highlight", target: "b" },
      { kind: "highlight", target: "c" },
    ],
  },
};

function Harness({ onReady }: { onReady: (api: ReturnType<typeof useWalkthrough>) => void }) {
  useWalkthroughKeyboard();
  const api = useWalkthrough();
  onReady(api);
  return <div data-testid="state">{String(api.state.currentBeatIndex)}</div>;
}

function renderHarness() {
  let api!: ReturnType<typeof useWalkthrough>;
  const utils = render(
    <WalkthroughProvider sequences={sequences}>
      <Harness onReady={(a) => (api = a)} />
    </WalkthroughProvider>,
  );
  return { ...utils, getApi: () => api };
}

describe("useWalkthroughKeyboard", () => {
  it("ArrowRight advances when active", async () => {
    const { getApi } = renderHarness();
    getApi().start("s1");
    await userEvent.keyboard("{ArrowRight}");
    expect(getApi().state.currentBeatIndex).toBe(1);
  });

  it("ArrowLeft steps back", async () => {
    const { getApi } = renderHarness();
    getApi().start("s1");
    await userEvent.keyboard("{ArrowRight}");
    await userEvent.keyboard("{ArrowLeft}");
    expect(getApi().state.currentBeatIndex).toBe(0);
  });

  it("Escape exits", async () => {
    const { getApi } = renderHarness();
    getApi().start("s1");
    await userEvent.keyboard("{Escape}");
    expect(getApi().state.active).toBe(false);
  });

  it("H toggles HUD", async () => {
    const { getApi } = renderHarness();
    getApi().start("s1");
    expect(getApi().state.hudVisible).toBe(true);
    await userEvent.keyboard("h");
    expect(getApi().state.hudVisible).toBe(false);
  });

  it(". skips to last beat", async () => {
    const { getApi } = renderHarness();
    getApi().start("s1");
    await userEvent.keyboard(".");
    expect(getApi().state.currentBeatIndex).toBe(2);
  });

  it("Space advances (clicker compatibility)", async () => {
    const { getApi } = renderHarness();
    getApi().start("s1");
    await userEvent.keyboard(" ");
    expect(getApi().state.currentBeatIndex).toBe(1);
  });

  it("keys do nothing when tour inactive", async () => {
    const { getApi } = renderHarness();
    await userEvent.keyboard("{ArrowRight}");
    expect(getApi().state.active).toBe(false);
    expect(getApi().state.currentBeatIndex).toBe(0);
  });
});
```

- [ ] **Step 2: Run tests, verify FAIL**

Run: `npm test -- keyboard`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/walkthrough/keyboard.ts`**

```ts
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

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [state.active, advance, back, exit, toggleHud, replayBeat, skipToEnd]);
}
```

- [ ] **Step 4: Run tests, verify PASS**

Run: `npm test -- keyboard`
Expected: 7 passing tests.

- [ ] **Step 5: Commit**

```bash
git add src/walkthrough/keyboard.ts src/walkthrough/__tests__/keyboard.test.tsx
git commit -m "feat(walkthrough): global keyboard handler bound to provider actions"
```

---

## Task 5: Stage shell + HUD (no beat renderers yet)

**Files:**
- Create: `src/walkthrough/WalkthroughStage.tsx`
- Create: `src/walkthrough/WalkthroughHUD.tsx`
- Create: `src/walkthrough/__tests__/stage.test.tsx`

**Interfaces:**
- Consumes: `useWalkthrough()` and `useWalkthroughKeyboard()`.
- Produces:
  - `WalkthroughStage` component — no props. When `state.active`, portals to `document.body` and renders backdrop + beat dispatcher placeholder + HUD.
  - `WalkthroughHUD` component — no props. Renders progress dots, prev/next, exit, current beat caption. Hidden entirely when `state.hudVisible === false`.
  - Internal `BeatDispatcher` function (not exported): takes the current beat and returns a renderer or a placeholder `<div data-testid="unknown-beat">`. Beat renderer tasks (6-10) will wire into this dispatcher.

- [ ] **Step 1: Write failing stage test**

Create `src/walkthrough/__tests__/stage.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { WalkthroughProvider, useWalkthrough } from "../WalkthroughProvider";
import { WalkthroughStage } from "../WalkthroughStage";
import type { Sequence } from "../types";

const sequences: Record<string, Sequence> = {
  s1: {
    id: "s1",
    title: "T",
    beats: [{ kind: "highlight", target: "a", caption: "hello" }],
  },
};

function Launcher() {
  const { start } = useWalkthrough();
  return <button onClick={() => start("s1")}>start</button>;
}

describe("WalkthroughStage", () => {
  it("does not render when inactive", () => {
    render(
      <WalkthroughProvider sequences={sequences}>
        <Launcher />
        <WalkthroughStage />
      </WalkthroughProvider>,
    );
    expect(screen.queryByTestId("walkthrough-stage")).toBeNull();
  });

  it("renders stage when active", async () => {
    render(
      <WalkthroughProvider sequences={sequences}>
        <Launcher />
        <WalkthroughStage />
      </WalkthroughProvider>,
    );
    await userEvent.click(screen.getByText("start"));
    expect(screen.getByTestId("walkthrough-stage")).toBeInTheDocument();
  });

  it("renders HUD when hudVisible", async () => {
    render(
      <WalkthroughProvider sequences={sequences}>
        <Launcher />
        <WalkthroughStage />
      </WalkthroughProvider>,
    );
    await userEvent.click(screen.getByText("start"));
    expect(screen.getByTestId("walkthrough-hud")).toBeInTheDocument();
  });

  it("hides HUD when hudVisible is false", async () => {
    render(
      <WalkthroughProvider sequences={sequences}>
        <Launcher />
        <WalkthroughStage />
      </WalkthroughProvider>,
    );
    await userEvent.click(screen.getByText("start"));
    await userEvent.keyboard("h");
    expect(screen.queryByTestId("walkthrough-hud")).toBeNull();
  });

  it("Esc unmounts stage", async () => {
    render(
      <WalkthroughProvider sequences={sequences}>
        <Launcher />
        <WalkthroughStage />
      </WalkthroughProvider>,
    );
    await userEvent.click(screen.getByText("start"));
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByTestId("walkthrough-stage")).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests, verify FAIL**

Run: `npm test -- stage`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `WalkthroughHUD.tsx`**

```tsx
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
```

- [ ] **Step 4: Implement `WalkthroughStage.tsx`**

```tsx
import { createPortal } from "react-dom";
import { useWalkthrough } from "./WalkthroughProvider";
import { useWalkthroughKeyboard } from "./keyboard";
import { WalkthroughHUD } from "./WalkthroughHUD";
import type { Beat, BeatProps } from "./types";

type BeatRenderer = (props: BeatProps<Beat>) => JSX.Element;

const beatRenderers: Partial<Record<Beat["kind"], BeatRenderer>> = {};

export function registerBeatRenderer<K extends Beat["kind"]>(
  kind: K,
  renderer: (props: BeatProps<Extract<Beat, { kind: K }>>) => JSX.Element,
) {
  beatRenderers[kind] = renderer as BeatRenderer;
}

function BeatDispatcher({ beat, onComplete }: BeatProps) {
  const Renderer = beatRenderers[beat.kind];
  if (!Renderer) {
    return <div data-testid="unknown-beat">unknown beat: {beat.kind}</div>;
  }
  return <Renderer beat={beat as never} onComplete={onComplete} />;
}

export function WalkthroughStage() {
  useWalkthroughKeyboard();
  const { state, advance, getCurrentBeat } = useWalkthrough();

  if (!state.active) return null;
  const beat = getCurrentBeat();
  if (!beat) return null;

  return createPortal(
    <div
      data-testid="walkthrough-stage"
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 100 }}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
        onClick={() => {}}
        aria-hidden
      />
      <div className="relative pointer-events-auto" style={{ zIndex: 110 }}>
        <BeatDispatcher beat={beat} onComplete={advance} />
      </div>
      <WalkthroughHUD />
    </div>,
    document.body,
  );
}
```

- [ ] **Step 5: Run tests, verify PASS**

Run: `npm test -- stage`
Expected: 5 passing tests.

- [ ] **Step 6: Commit**

```bash
git add src/walkthrough/WalkthroughStage.tsx src/walkthrough/WalkthroughHUD.tsx src/walkthrough/__tests__/stage.test.tsx
git commit -m "feat(walkthrough): portal-mounted stage with HUD and beat dispatcher registry"
```

---

## Task 6: Highlight beat renderer

**Files:**
- Create: `src/walkthrough/beats/HighlightTarget.tsx`
- Create: `src/walkthrough/beats/index.ts`
- Modify: `src/walkthrough/WalkthroughStage.tsx` (import the registration module)
- Create: `src/walkthrough/__tests__/highlightBeat.test.tsx`

**Interfaces:**
- Consumes: `BeatProps<{ kind: "highlight"; ... }>` from Task 2; `registerBeatRenderer` from Task 5; `resolveTarget` from Task 2.
- Produces:
  - `HighlightTarget` component — a `({ beat, onComplete }) => JSX.Element` that dims the backdrop around the target rect and renders a pulsing ring; calls `onComplete` on advance (via HUD/keyboard — this beat does not auto-advance).
  - `src/walkthrough/beats/index.ts` — imports all beat modules so their `registerBeatRenderer` calls fire. Imported by `WalkthroughStage.tsx`.

- [ ] **Step 1: Write failing test**

Create `src/walkthrough/__tests__/highlightBeat.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HighlightTarget } from "../beats/HighlightTarget";

describe("HighlightTarget beat", () => {
  it("renders without crashing when target is missing", () => {
    const onComplete = vi.fn();
    render(<HighlightTarget beat={{ kind: "highlight", target: "nope" }} onComplete={onComplete} />);
    expect(screen.getByTestId("highlight-beat")).toBeInTheDocument();
  });

  it("invokes onComplete within a tick if target is missing", async () => {
    const onComplete = vi.fn();
    render(<HighlightTarget beat={{ kind: "highlight", target: "nope" }} onComplete={onComplete} />);
    await new Promise((r) => setTimeout(r, 10));
    expect(onComplete).toHaveBeenCalled();
  });

  it("renders ring overlay when target exists", async () => {
    const el = document.createElement("div");
    el.setAttribute("data-ux-id", "has-target");
    el.style.width = "100px";
    el.style.height = "40px";
    document.body.appendChild(el);
    const onComplete = vi.fn();
    render(<HighlightTarget beat={{ kind: "highlight", target: "has-target" }} onComplete={onComplete} />);
    expect(screen.getByTestId("highlight-ring")).toBeInTheDocument();
    document.body.removeChild(el);
  });
});
```

- [ ] **Step 2: Run tests, verify FAIL**

Run: `npm test -- highlightBeat`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/walkthrough/beats/HighlightTarget.tsx`**

```tsx
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { resolveTarget } from "../targetRegistry";
import { registerBeatRenderer } from "../WalkthroughStage";
import type { Beat, BeatProps } from "../types";

type HighlightBeat = Extract<Beat, { kind: "highlight" }>;

export function HighlightTarget({ beat, onComplete }: BeatProps<HighlightBeat>) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const el = resolveTarget(beat.target);
    if (!el) {
      console.warn(`[walkthrough] highlight target "${beat.target}" not found`);
      queueMicrotask(onComplete);
      return;
    }
    el.scrollIntoView({ block: "center", behavior: "smooth" });
    setRect(el.getBoundingClientRect());
  }, [beat.target, onComplete]);

  return (
    <div data-testid="highlight-beat" className="pointer-events-none">
      {rect ? (
        <motion.div
          data-testid="highlight-ring"
          className="absolute rounded-xl border-4 border-[#247ae4]"
          style={{
            top: rect.top - 8,
            left: rect.left - 8,
            width: rect.width + 16,
            height: rect.height + 16,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.4)",
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 22 }}
        />
      ) : null}
    </div>
  );
}

registerBeatRenderer("highlight", HighlightTarget);
```

- [ ] **Step 4: Create `src/walkthrough/beats/index.ts`**

```ts
import "./HighlightTarget";
```

(Future beats will add their own `import "./<beat>"` line here.)

- [ ] **Step 5: Modify `src/walkthrough/WalkthroughStage.tsx` to import the registry**

Add this import at the top of `WalkthroughStage.tsx`:

```ts
import "./beats";
```

- [ ] **Step 6: Run tests, verify PASS**

Run: `npm test -- highlightBeat stage`
Expected: all highlight + stage tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/walkthrough/beats/HighlightTarget.tsx src/walkthrough/beats/index.ts src/walkthrough/WalkthroughStage.tsx src/walkthrough/__tests__/highlightBeat.test.tsx
git commit -m "feat(walkthrough): highlight beat with target lookup and graceful missing-target handling"
```

---

## Task 7: Lift + Return beats (shared layoutId)

**Files:**
- Create: `src/walkthrough/beats/LiftToStage.tsx`
- Create: `src/walkthrough/beats/ReturnToOrigin.tsx`
- Modify: `src/walkthrough/beats/index.ts`
- Create: `src/walkthrough/__tests__/liftBeat.test.tsx`

**Interfaces:**
- Consumes: `BeatProps<{ kind: "lift" }>` and `BeatProps<{ kind: "return" }>`; `resolveTarget`; `registerBeatRenderer`.
- Produces: both components render using Motion's `layoutId` tied to `beat.target`, so the shared-element morph works across beat boundaries. Each calls `onComplete` after Motion's animation resolves (via `onAnimationComplete`).

- [ ] **Step 1: Write failing test**

Create `src/walkthrough/__tests__/liftBeat.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LiftToStage } from "../beats/LiftToStage";
import { ReturnToOrigin } from "../beats/ReturnToOrigin";

describe("Lift / Return beats", () => {
  it("Lift renders without crashing", () => {
    render(
      <LiftToStage
        beat={{ kind: "lift", target: "nope", scale: 1.4, position: "center" }}
        onComplete={vi.fn()}
      />,
    );
    expect(screen.getByTestId("lift-beat")).toBeInTheDocument();
  });

  it("Lift invokes onComplete when target missing", async () => {
    const onComplete = vi.fn();
    render(
      <LiftToStage
        beat={{ kind: "lift", target: "nope", scale: 1.4, position: "center" }}
        onComplete={onComplete}
      />,
    );
    await new Promise((r) => setTimeout(r, 10));
    expect(onComplete).toHaveBeenCalled();
  });

  it("Return renders without crashing", () => {
    render(
      <ReturnToOrigin beat={{ kind: "return" }} onComplete={vi.fn()} />,
    );
    expect(screen.getByTestId("return-beat")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests, verify FAIL**

Run: `npm test -- liftBeat`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/walkthrough/beats/LiftToStage.tsx`**

```tsx
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { resolveTarget } from "../targetRegistry";
import { registerBeatRenderer } from "../WalkthroughStage";
import type { Beat, BeatProps } from "../types";

type LiftBeat = Extract<Beat, { kind: "lift" }>;

export function LiftToStage({ beat, onComplete }: BeatProps<LiftBeat>) {
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const el = resolveTarget(beat.target);
    if (!el) {
      console.warn(`[walkthrough] lift target "${beat.target}" not found`);
      queueMicrotask(onComplete);
      return;
    }
    el.scrollIntoView({ block: "center", behavior: "smooth" });
    setOriginRect(el.getBoundingClientRect());
  }, [beat.target, onComplete]);

  const scale = beat.scale ?? 1.4;
  const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
  const vh = typeof window !== "undefined" ? window.innerHeight : 720;
  const targetWidth = originRect ? originRect.width * scale : 0;
  const targetHeight = originRect ? originRect.height * scale : 0;
  const targetLeft = beat.position === "center" || !beat.position ? (vw - targetWidth) / 2 : beat.position.x;
  const targetTop = beat.position === "center" || !beat.position ? (vh - targetHeight) / 2 : beat.position.y;

  return (
    <div data-testid="lift-beat">
      {originRect ? (
        <motion.div
          layoutId={`walkthrough-target-${beat.target}`}
          className="absolute bg-white rounded-2xl shadow-2xl overflow-hidden"
          initial={{
            top: originRect.top,
            left: originRect.left,
            width: originRect.width,
            height: originRect.height,
          }}
          animate={{
            top: targetTop,
            left: targetLeft,
            width: targetWidth,
            height: targetHeight,
          }}
          transition={{ type: "spring", stiffness: 180, damping: 24 }}
          onAnimationComplete={() => {
            /* Lift stays visible until advance; onComplete fires only when user advances */
          }}
        />
      ) : null}
    </div>
  );
}

registerBeatRenderer("lift", LiftToStage);
```

- [ ] **Step 4: Implement `src/walkthrough/beats/ReturnToOrigin.tsx`**

```tsx
import { registerBeatRenderer } from "../WalkthroughStage";
import type { Beat, BeatProps } from "../types";
import { useEffect } from "react";

type ReturnBeat = Extract<Beat, { kind: "return" }>;

export function ReturnToOrigin({ beat: _beat, onComplete }: BeatProps<ReturnBeat>) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return <div data-testid="return-beat" />;
}

registerBeatRenderer("return", ReturnToOrigin);
```

> **Note:** The actual visual "return" is produced by Motion's `AnimatePresence` + `layoutId` — when the stage un-renders the Lift motion node (because the current beat changed), Motion animates its exit back toward the origin layout. The `ReturnToOrigin` renderer is a brief "beat holder" that advances automatically after the animation would complete.

- [ ] **Step 5: Register in `src/walkthrough/beats/index.ts`**

```ts
import "./HighlightTarget";
import "./LiftToStage";
import "./ReturnToOrigin";
```

- [ ] **Step 6: Run tests, verify PASS**

Run: `npm test -- liftBeat`
Expected: 3 passing tests.

- [ ] **Step 7: Commit**

```bash
git add src/walkthrough/beats/LiftToStage.tsx src/walkthrough/beats/ReturnToOrigin.tsx src/walkthrough/beats/index.ts src/walkthrough/__tests__/liftBeat.test.tsx
git commit -m "feat(walkthrough): lift and return beats with layoutId-driven shared-element morph"
```

---

## Task 8: Expand beat

**Files:**
- Create: `src/walkthrough/beats/ExpandContent.tsx`
- Modify: `src/walkthrough/beats/index.ts`
- Create: `src/walkthrough/__tests__/expandBeat.test.tsx`

**Interfaces:**
- Consumes: `BeatProps<{ kind: "expand"; content: ReactNode }>`; `registerBeatRenderer`.
- Produces: `ExpandContent` renders the beat's `content` inside a stage-sized card, morphing from the Lift's final position via `layoutId` continuity.

- [ ] **Step 1: Write failing test**

Create `src/walkthrough/__tests__/expandBeat.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ExpandContent } from "../beats/ExpandContent";

describe("ExpandContent beat", () => {
  it("renders the content node", () => {
    render(
      <ExpandContent
        beat={{ kind: "expand", content: <div data-testid="payload">hello</div> }}
        onComplete={vi.fn()}
      />,
    );
    expect(screen.getByTestId("payload")).toHaveTextContent("hello");
  });
});
```

- [ ] **Step 2: Run tests, verify FAIL**

Run: `npm test -- expandBeat`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/walkthrough/beats/ExpandContent.tsx`**

```tsx
import { motion } from "motion/react";
import { registerBeatRenderer } from "../WalkthroughStage";
import type { Beat, BeatProps } from "../types";

type ExpandBeat = Extract<Beat, { kind: "expand" }>;

export function ExpandContent({ beat }: BeatProps<ExpandBeat>) {
  const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
  const vh = typeof window !== "undefined" ? window.innerHeight : 720;
  const width = Math.min(1100, vw - 120);
  const height = Math.min(680, vh - 180);

  return (
    <motion.div
      data-testid="expand-beat"
      className="absolute bg-white rounded-2xl shadow-2xl overflow-hidden"
      layout
      initial={{
        width: width * 0.6,
        height: height * 0.6,
        top: (vh - height * 0.6) / 2,
        left: (vw - width * 0.6) / 2,
      }}
      animate={{
        width,
        height,
        top: (vh - height) / 2,
        left: (vw - width) / 2,
      }}
      transition={{ type: "spring", stiffness: 160, damping: 24 }}
    >
      {beat.content}
    </motion.div>
  );
}

registerBeatRenderer("expand", ExpandContent);
```

- [ ] **Step 4: Register**

Update `src/walkthrough/beats/index.ts`:

```ts
import "./HighlightTarget";
import "./LiftToStage";
import "./ReturnToOrigin";
import "./ExpandContent";
```

- [ ] **Step 5: Run tests, verify PASS**

Run: `npm test -- expandBeat`
Expected: 1 passing test.

- [ ] **Step 6: Commit**

```bash
git add src/walkthrough/beats/ExpandContent.tsx src/walkthrough/beats/index.ts src/walkthrough/__tests__/expandBeat.test.tsx
git commit -m "feat(walkthrough): expand beat renders content in a stage-sized morph card"
```

---

## Task 9: Annotate beat (GSAP)

**Files:**
- Create: `src/walkthrough/beats/AnnotateWithGSAP.tsx`
- Modify: `src/walkthrough/beats/index.ts`
- Create: `src/walkthrough/__tests__/annotateBeat.test.tsx`

**Interfaces:**
- Consumes: `BeatProps<{ kind: "annotate"; tracks: AnnotateTrack[] }>`; `resolveTarget`; `registerBeatRenderer`.
- Produces: `AnnotateWithGSAP` renders an absolutely-positioned SVG for arrows, caption `<div>` for typed text, and overlays `<div>`s for pulse rings. All tracks run in parallel on a single GSAP `Timeline` managed by `useGSAP` (so cleanup is automatic on unmount).

- [ ] **Step 1: Write failing test**

Create `src/walkthrough/__tests__/annotateBeat.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import gsap from "gsap";
import { AnnotateWithGSAP } from "../beats/AnnotateWithGSAP";

describe("AnnotateWithGSAP beat", () => {
  it("renders without crashing with a typeCaption track", () => {
    render(
      <AnnotateWithGSAP
        beat={{
          kind: "annotate",
          tracks: [{ type: "typeCaption", text: "hello world" }],
        }}
        onComplete={vi.fn()}
      />,
    );
    expect(screen.getByTestId("annotate-beat")).toBeInTheDocument();
  });

  it("does not leak timelines after unmount", () => {
    const before = gsap.globalTimeline.getChildren().length;
    const { unmount } = render(
      <AnnotateWithGSAP
        beat={{
          kind: "annotate",
          tracks: [{ type: "typeCaption", text: "x" }],
        }}
        onComplete={vi.fn()}
      />,
    );
    unmount();
    const after = gsap.globalTimeline.getChildren().length;
    expect(after).toBeLessThanOrEqual(before);
  });
});
```

- [ ] **Step 2: Run tests, verify FAIL**

Run: `npm test -- annotateBeat`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/walkthrough/beats/AnnotateWithGSAP.tsx`**

```tsx
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { resolveTarget } from "../targetRegistry";
import { registerBeatRenderer } from "../WalkthroughStage";
import type { Beat, BeatProps, Point } from "../types";

type AnnotateBeat = Extract<Beat, { kind: "annotate" }>;

function resolvePoint(spec: string | Point): Point | null {
  if (typeof spec === "object") return spec;
  const el = resolveTarget(spec);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

export function AnnotateWithGSAP({ beat, onComplete }: BeatProps<AnnotateBeat>) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ onComplete });
      beat.tracks.forEach((track, idx) => {
        if (track.type === "typeCaption") {
          const target = containerRef.current?.querySelector<HTMLElement>(`[data-track="caption-${idx}"]`);
          if (!target) return;
          const total = track.text.length;
          const cps = track.speedCps ?? 25;
          const duration = total / cps;
          tl.to(target, { text: track.text, duration, ease: "none" }, 0);
        } else if (track.type === "pulse") {
          const target = containerRef.current?.querySelector<HTMLElement>(`[data-track="pulse-${idx}"]`);
          if (!target) return;
          const count = track.count ?? 2;
          tl.fromTo(
            target,
            { scale: 1, opacity: 0.9 },
            { scale: 1.4, opacity: 0, duration: 0.8, repeat: count - 1, ease: "power1.out" },
            0,
          );
        } else if (track.type === "arrow") {
          const target = containerRef.current?.querySelector<SVGPathElement>(`[data-track="arrow-${idx}"]`);
          if (!target) return;
          const len = target.getTotalLength();
          target.style.strokeDasharray = `${len}`;
          target.style.strokeDashoffset = `${len}`;
          tl.to(target, { strokeDashoffset: 0, duration: 0.9, ease: "power2.out" }, 0);
        }
      });
      if (beat.durationMs) {
        tl.to({}, { duration: beat.durationMs / 1000 });
      }
    },
    { scope: containerRef, dependencies: [beat] },
  );

  return (
    <div data-testid="annotate-beat" ref={containerRef} className="pointer-events-none">
      {beat.tracks.map((track, idx) => {
        if (track.type === "typeCaption") {
          return (
            <div
              key={idx}
              data-track={`caption-${idx}`}
              className="fixed top-24 left-1/2 -translate-x-1/2 max-w-[720px] px-6 py-3 bg-white/95 rounded-lg shadow-lg text-[22px] font-['DM_Sans:SemiBold',sans-serif] text-[#262630]"
            />
          );
        }
        if (track.type === "pulse") {
          const el = resolveTarget(track.target);
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return (
            <div
              key={idx}
              data-track={`pulse-${idx}`}
              className="fixed rounded-full border-4 border-[#247ae4]"
              style={{ top: r.top, left: r.left, width: r.width, height: r.height }}
            />
          );
        }
        if (track.type === "arrow") {
          const from = resolvePoint(track.from);
          const to = resolvePoint(track.to);
          if (!from || !to) return null;
          return (
            <svg
              key={idx}
              className="fixed inset-0 w-screen h-screen"
              style={{ pointerEvents: "none" }}
            >
              <path
                data-track={`arrow-${idx}`}
                d={`M ${from.x} ${from.y} Q ${(from.x + to.x) / 2} ${from.y - 60} ${to.x} ${to.y}`}
                fill="none"
                stroke="#247ae4"
                strokeWidth={3}
                markerEnd="url(#arrowhead)"
              />
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
                  <path d="M0,0 L10,5 L0,10 z" fill="#247ae4" />
                </marker>
              </defs>
            </svg>
          );
        }
        return null;
      })}
    </div>
  );
}

registerBeatRenderer("annotate", AnnotateWithGSAP);
```

- [ ] **Step 4: Register**

Update `src/walkthrough/beats/index.ts`:

```ts
import "./HighlightTarget";
import "./LiftToStage";
import "./ReturnToOrigin";
import "./ExpandContent";
import "./AnnotateWithGSAP";
```

- [ ] **Step 5: Run tests, verify PASS**

Run: `npm test -- annotateBeat`
Expected: 2 passing tests.

- [ ] **Step 6: Commit**

```bash
git add src/walkthrough/beats/AnnotateWithGSAP.tsx src/walkthrough/beats/index.ts src/walkthrough/__tests__/annotateBeat.test.tsx
git commit -m "feat(walkthrough): annotate beat with GSAP timeline (arrow/pulse/typeCaption tracks)"
```

---

## Task 10: Navigate beat

**Files:**
- Create: `src/walkthrough/beats/NavigateApp.tsx`
- Modify: `src/walkthrough/beats/index.ts`
- Create: `src/walkthrough/__tests__/navigateBeat.test.tsx`

**Interfaces:**
- Consumes: `useWalkthrough().requestNavigate` from Task 3; `registerBeatRenderer`.
- Produces: `NavigateApp` component — calls `requestNavigate(beat.to)` on mount, then calls `onComplete` after a short settle delay (300ms).

- [ ] **Step 1: Write failing test**

Create `src/walkthrough/__tests__/navigateBeat.test.tsx`:

```tsx
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NavigateApp } from "../beats/NavigateApp";
import { WalkthroughProvider } from "../WalkthroughProvider";
import type { Sequence } from "../types";

const sequences: Record<string, Sequence> = {
  s1: { id: "s1", title: "t", beats: [{ kind: "navigate", to: "amenities" }] },
};

describe("NavigateApp beat", () => {
  it("calls onNavigate on the provider", async () => {
    const onNavigate = vi.fn();
    const onComplete = vi.fn();
    render(
      <WalkthroughProvider sequences={sequences} onNavigate={onNavigate}>
        <NavigateApp beat={{ kind: "navigate", to: "amenities" }} onComplete={onComplete} />
      </WalkthroughProvider>,
    );
    await new Promise((r) => setTimeout(r, 400));
    expect(onNavigate).toHaveBeenCalledWith("amenities");
    expect(onComplete).toHaveBeenCalled();
  });

  it("exit mid-navigate does not throw", async () => {
    const onComplete = vi.fn();
    const { unmount } = render(
      <WalkthroughProvider sequences={sequences} onNavigate={vi.fn()}>
        <NavigateApp beat={{ kind: "navigate", to: "amenities" }} onComplete={onComplete} />
      </WalkthroughProvider>,
    );
    unmount();
    await new Promise((r) => setTimeout(r, 400));
    // onComplete must not fire after unmount, and no throw
    expect(onComplete).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run tests, verify FAIL**

Run: `npm test -- navigateBeat`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/walkthrough/beats/NavigateApp.tsx`**

```tsx
import { useEffect } from "react";
import { useWalkthrough } from "../WalkthroughProvider";
import { registerBeatRenderer } from "../WalkthroughStage";
import type { Beat, BeatProps } from "../types";

type NavigateBeat = Extract<Beat, { kind: "navigate" }>;

export function NavigateApp({ beat, onComplete }: BeatProps<NavigateBeat>) {
  const { requestNavigate } = useWalkthrough();

  useEffect(() => {
    let cancelled = false;
    requestNavigate(beat.to);
    const timer = setTimeout(() => {
      if (!cancelled) onComplete();
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [beat.to, requestNavigate, onComplete]);

  return <div data-testid="navigate-beat" />;
}

registerBeatRenderer("navigate", NavigateApp);
```

- [ ] **Step 4: Register**

Update `src/walkthrough/beats/index.ts`:

```ts
import "./HighlightTarget";
import "./LiftToStage";
import "./ReturnToOrigin";
import "./ExpandContent";
import "./AnnotateWithGSAP";
import "./NavigateApp";
```

- [ ] **Step 5: Run tests, verify PASS**

Run: `npm test -- navigateBeat`
Expected: 2 passing tests.

- [ ] **Step 6: Commit**

```bash
git add src/walkthrough/beats/NavigateApp.tsx src/walkthrough/beats/index.ts src/walkthrough/__tests__/navigateBeat.test.tsx
git commit -m "feat(walkthrough): navigate beat dispatches app navigation and settles"
```

---

## Task 11: Launcher (URL params + Cmd+Shift+W)

**Files:**
- Create: `src/walkthrough/WalkthroughLauncher.tsx`
- Create: `src/walkthrough/__tests__/launcher.test.tsx`

**Interfaces:**
- Consumes: `useWalkthrough()`; `sequenceRegistry` (will be defined in Task 12/13, but Task 11 receives it via a prop so launcher is testable independently).
- Produces: `WalkthroughLauncher` component — props: `{ sequences: Record<string, Sequence> }`. Behavior:
  - On mount, if `?demo=<id>` matches a sequence id, auto-starts it.
  - If `?demo=true`, renders a floating picker panel.
  - Installs a `Cmd+Shift+W` listener that toggles the picker visibility regardless of URL.
  - Unknown sequence id logs a warning and does not start.

- [ ] **Step 1: Write failing test**

Create `src/walkthrough/__tests__/launcher.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { WalkthroughLauncher } from "../WalkthroughLauncher";
import { WalkthroughProvider, useWalkthrough } from "../WalkthroughProvider";
import type { Sequence } from "../types";

const sequences: Record<string, Sequence> = {
  demoseq: { id: "demoseq", title: "Demo Seq", beats: [{ kind: "highlight", target: "a" }] },
};

function Probe({ onReady }: { onReady: (api: ReturnType<typeof useWalkthrough>) => void }) {
  const api = useWalkthrough();
  onReady(api);
  return null;
}

function renderWith(url: string) {
  const originalLocation = window.location;
  const u = new URL(`http://localhost/${url}`);
  Object.defineProperty(window, "location", {
    writable: true,
    value: { ...originalLocation, href: u.href, search: u.search },
  });
  let api!: ReturnType<typeof useWalkthrough>;
  const utils = render(
    <WalkthroughProvider sequences={sequences}>
      <WalkthroughLauncher sequences={sequences} />
      <Probe onReady={(a) => (api = a)} />
    </WalkthroughProvider>,
  );
  return { ...utils, getApi: () => api };
}

beforeEach(() => {
  const u = new URL("http://localhost/");
  Object.defineProperty(window, "location", {
    writable: true,
    value: { href: u.href, search: u.search },
  });
});

describe("WalkthroughLauncher", () => {
  it("auto-starts sequence when ?demo=<id>", () => {
    const { getApi } = renderWith("?demo=demoseq");
    expect(getApi().state.active).toBe(true);
    expect(getApi().state.sequenceId).toBe("demoseq");
  });

  it("renders picker when ?demo=true", () => {
    renderWith("?demo=true");
    expect(screen.getByTestId("walkthrough-launcher")).toBeInTheDocument();
  });

  it("logs warning for unknown sequence id", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { getApi } = renderWith("?demo=does-not-exist");
    expect(warn).toHaveBeenCalled();
    expect(getApi().state.active).toBe(false);
    warn.mockRestore();
  });

  it("Cmd+Shift+W opens picker", async () => {
    renderWith("");
    const user = userEvent.setup();
    await user.keyboard("{Meta>}{Shift>}w{/Shift}{/Meta}");
    expect(screen.getByTestId("walkthrough-launcher")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests, verify FAIL**

Run: `npm test -- launcher`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/walkthrough/WalkthroughLauncher.tsx`**

```tsx
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
```

- [ ] **Step 4: Run tests, verify PASS**

Run: `npm test -- launcher`
Expected: 4 passing tests.

- [ ] **Step 5: Commit**

```bash
git add src/walkthrough/WalkthroughLauncher.tsx src/walkthrough/__tests__/launcher.test.tsx
git commit -m "feat(walkthrough): launcher with ?demo= deep-links and Cmd+Shift+W chord"
```

---

## Task 12: Board Actions sequence (prep + stage content + sequence file)

**Files:**
- Modify: `src/board/BoardTasksWidget.tsx` (add `data-ux-id="board-task-current"`)
- Create: `src/walkthrough/stage-content/BoardActionStageDetail.tsx`
- Create: `src/walkthrough/sequences/boardActions.tsx`

**Interfaces:**
- Consumes: `Sequence` type; `AmenityReservationStage` is NOT consumed here (that's Task 13).
- Produces:
  - `BoardActionStageDetail` component — props: `{ actionId: string }`. Renders the expanded detail: title, type label, address, timeline summary, Approve/Reject buttons. Buttons carry `data-ux-id="stage-vote-approve"` and `data-ux-id="stage-vote-reject"` so the annotate beat can target them. Timeline block carries `data-ux-id="stage-detail-timeline"`.
  - `boardActionsSequence: Sequence` exported from `sequences/boardActions.tsx`.

- [ ] **Step 1: Add `data-ux-id` to the task row in `BoardTasksWidget.tsx`**

Edit `src/board/BoardTasksWidget.tsx` line ~203. Current:

```tsx
) : task && (
  <div className="bg-white border border-[#e1e9ef] flex flex-col sm:flex-row sm:items-center gap-[16px] sm:gap-[23px] px-[20px] sm:px-[32px] py-[16px] sm:py-[18px] rounded-[16px] shrink-0 w-full">
```

Change to:

```tsx
) : task && (
  <div
    data-ux-id="board-task-current"
    className="bg-white border border-[#e1e9ef] flex flex-col sm:flex-row sm:items-center gap-[16px] sm:gap-[23px] px-[20px] sm:px-[32px] py-[16px] sm:py-[18px] rounded-[16px] shrink-0 w-full"
  >
```

- [ ] **Step 2: Create `src/walkthrough/stage-content/BoardActionStageDetail.tsx`**

```tsx
type Props = { actionId: string };

export function BoardActionStageDetail({ actionId }: Props) {
  return (
    <div className="h-full flex flex-col p-10 gap-6">
      <div className="flex items-baseline gap-4">
        <span className="text-[12px] uppercase tracking-[0.5px] text-[#4b5563] font-['DM_Sans:SemiBold',sans-serif] font-semibold">
          Violation
        </span>
        <span className="text-[24px] text-[#262630] font-['DM_Sans:Regular',sans-serif]">
          {actionId}
        </span>
      </div>
      <p className="text-[32px] text-[#262630] font-['DM_Sans:SemiBold',sans-serif] font-semibold leading-tight">
        Overgrown Landscaping
      </p>
      <p className="text-[16px] text-[#4b5563]">
        19 Birch Way, Rose City, VA 23232 &middot; Account HGWL31333
      </p>

      <div
        data-ux-id="stage-detail-timeline"
        className="mt-4 border border-[#e1e9ef] rounded-xl p-6 flex flex-col gap-4"
      >
        <p className="text-[14px] uppercase tracking-[0.5px] text-[#4b5563] font-['DM_Sans:SemiBold',sans-serif] font-semibold">
          Timeline
        </p>
        <ul className="flex flex-col gap-3 text-[15px] text-[#262630]">
          <li>Initial inspection — 2026-09-14</li>
          <li>First notice sent — 2026-09-16</li>
          <li>Owner response window closed — 2026-09-30</li>
          <li>Second inspection confirmed no remediation — 2026-10-05</li>
        </ul>
      </div>

      <div className="mt-auto flex gap-4">
        <button
          data-ux-id="stage-vote-approve"
          className="flex-1 px-6 py-4 rounded-xl bg-[#1b8c5a] text-white text-[16px] font-['DM_Sans:SemiBold',sans-serif] font-semibold hover:bg-[#157149]"
        >
          Approve Fine
        </button>
        <button
          data-ux-id="stage-vote-reject"
          className="flex-1 px-6 py-4 rounded-xl bg-white border border-[#e1e9ef] text-[#262630] text-[16px] font-['DM_Sans:SemiBold',sans-serif] font-semibold hover:bg-[#f6f8fb]"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `src/walkthrough/sequences/boardActions.tsx`**

```tsx
import type { Sequence } from "../types";
import { BoardActionStageDetail } from "../stage-content/BoardActionStageDetail";

export const boardActionsSequence: Sequence = {
  id: "board-actions",
  title: "Board Actions",
  beats: [
    {
      kind: "highlight",
      target: "board-tasks-widget",
      caption: "Board members land on the dashboard and immediately see what needs their attention.",
    },
    {
      kind: "lift",
      target: "board-task-current",
      scale: 1.4,
      position: "center",
    },
    {
      kind: "expand",
      content: <BoardActionStageDetail actionId="VIO-1804" />,
      caption:
        "Every action carries its full history — notices sent, owner response window, prior board comments.",
    },
    {
      kind: "annotate",
      tracks: [
        { type: "arrow", from: "stage-detail-timeline", to: "stage-vote-approve" },
        { type: "typeCaption", text: "Approve the fine. One tap. Timestamped and attributed to you." },
        { type: "pulse", target: "stage-vote-approve", count: 2 },
      ],
    },
    {
      kind: "return",
      caption: "Back to the dashboard, next action already queued.",
    },
  ],
};
```

- [ ] **Step 4: Verify compile and build**

Run: `npm run build`
Expected: TypeScript + Vite build succeeds with no errors.

- [ ] **Step 5: Commit**

```bash
git add src/board/BoardTasksWidget.tsx src/walkthrough/stage-content/BoardActionStageDetail.tsx src/walkthrough/sequences/boardActions.tsx
git commit -m "feat(walkthrough): board actions sequence with stage detail content"
```

---

## Task 13: Amenities page + Community Amenity sequence

**Files:**
- Create: `src/amenities/AmenitiesPage.tsx`
- Modify: `src/App.tsx` (add `"amenities"` to `Page` union; conditional nav entry; render branch; expose a `?demo=true` detector)
- Create: `src/walkthrough/stage-content/AmenityReservationStage.tsx`
- Create: `src/walkthrough/sequences/amenity.tsx`
- Create: `src/walkthrough/sequences/index.ts`

**Interfaces:**
- Consumes: existing `Page` type in `App.tsx`; existing images in `public/assets/`.
- Produces:
  - `AmenitiesPage` component — props: `{ onOpenSidebar: () => void }` to match sibling pages' signature. Renders a 4-tile grid: Pool, Tennis, Cafe, Garden. Each tile carries `data-ux-id="amenity-tile-<slug>"`.
  - `AmenityReservationStage` component — props: `{ amenityId: string }`. Renders the lifted-image + calendar strip + time slots. Guest badge carries `data-ux-id="stage-guest-badge"`; the Saturday 2pm slot carries `data-ux-id="reservation-slot-sat-2pm"`.
  - `amenitySequence: Sequence`.
  - `sequenceRegistry: Record<string, Sequence>` + `getSequence(id)` from `sequences/index.ts`.
  - `App.tsx` modifications: `Page` includes `"amenities"`; nav shows the "Amenities" entry only when `new URLSearchParams(window.location.search).get("demo") !== null`; routing branch renders `<AmenitiesPage />` when `activePage === "amenities"`.

- [ ] **Step 1: Create `src/amenities/AmenitiesPage.tsx`**

```tsx
type Props = { onOpenSidebar: () => void };

const amenities = [
  { slug: "pool", title: "Community Pool", image: "/assets/community-pool.jpg" },
  { slug: "tennis", title: "Tennis Courts", image: "/assets/community-tennis.jpg" },
  { slug: "cafe", title: "Clubhouse Cafe", image: "/assets/community-cafe.png" },
  { slug: "garden", title: "Community Garden", image: "/assets/community-garden.jpg" },
];

export default function AmenitiesPage({ onOpenSidebar: _onOpenSidebar }: Props) {
  return (
    <div data-ux-id="amenities-page" className="flex-1 min-w-0 h-full overflow-y-auto bg-[#f6f8fb]">
      <div className="max-w-[1200px] mx-auto px-6 py-10">
        <p className="text-[28px] font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] mb-6">
          Amenities
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {amenities.map((a) => (
            <div
              key={a.slug}
              data-ux-id={`amenity-tile-${a.slug}`}
              className="bg-white rounded-2xl overflow-hidden shadow-[0px_2px_9px_rgba(18,17,48,0.07)] cursor-pointer hover:shadow-lg transition-shadow"
            >
              <img src={a.image} alt={a.title} className="w-full h-[260px] object-cover" />
              <div className="p-5">
                <p className="text-[20px] font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630]">
                  {a.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Modify `src/App.tsx` — extend `Page` union**

Locate line 189 (`type Page = "dashboard" | "elections" | "community";`) and change to:

```tsx
type Page = "dashboard" | "elections" | "community" | "amenities";
```

- [ ] **Step 3: Modify `src/App.tsx` — import AmenitiesPage**

Add import near the other page imports:

```tsx
import AmenitiesPage from "./amenities/AmenitiesPage";
```

- [ ] **Step 4: Modify `src/App.tsx` — add demo flag helper**

Add this near the top of the file (after imports):

```tsx
const isDemoMode = () => typeof window !== "undefined" && new URLSearchParams(window.location.search).has("demo");
```

- [ ] **Step 5: Modify `src/App.tsx` — add conditional nav entry**

In the `Sidebar` component's nav section (around line 290), add after the Community Feed `NavItem`:

```tsx
{isDemoMode() ? (
  <NavItem
    icon={<IconHome />}
    label="Amenities"
    active={activePage === "amenities"}
    onClick={() => onNavigate("amenities")}
    uxId="amenities"
  />
) : null}
```

(Use `<IconHome />` as the icon placeholder — a dedicated amenity icon is deferred until the design pass.)

- [ ] **Step 6: Modify `src/App.tsx` — add routing branch**

Locate the conditional render chain around line 1780–1788 (`{activePage === "dashboard" ? ... : activePage === "elections" ? ... : ...}`). Add an `amenities` branch:

```tsx
) : activePage === "amenities" ? (
  <AmenitiesPage onOpenSidebar={() => setSidebarOpen(true)} />
```

Place it in the same ternary chain style the existing branches use.

- [ ] **Step 7: Create `src/walkthrough/stage-content/AmenityReservationStage.tsx`**

```tsx
type Props = { amenityId: string };

const timeSlots = [
  { id: "fri-10am", day: "Fri", time: "10:00 AM", status: "available" as const },
  { id: "fri-2pm", day: "Fri", time: "2:00 PM", status: "available" as const },
  { id: "sat-10am", day: "Sat", time: "10:00 AM", status: "booked" as const },
  { id: "sat-2pm", day: "Sat", time: "2:00 PM", status: "available" as const },
  { id: "sun-10am", day: "Sun", time: "10:00 AM", status: "available" as const },
  { id: "sun-2pm", day: "Sun", time: "2:00 PM", status: "booked" as const },
];

export function AmenityReservationStage({ amenityId }: Props) {
  const image = `/assets/community-${amenityId}.jpg`;
  return (
    <div className="h-full flex">
      <div className="flex-1 relative">
        <img src={image} alt="" className="w-full h-full object-cover" />
        <div
          data-ux-id="stage-guest-badge"
          className="absolute top-6 left-6 px-4 py-2 bg-white/95 rounded-full text-[14px] font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630]"
        >
          6 guests max this weekend
        </div>
      </div>
      <div className="w-[420px] flex flex-col gap-5 p-8 bg-white">
        <p className="text-[24px] font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630]">
          Reserve the Pool
        </p>
        <p className="text-[14px] text-[#4b5563]">Pick a day. Pick a time. We handle the rest.</p>
        <div className="flex flex-col gap-2 mt-2">
          {timeSlots.map((s) => (
            <button
              key={s.id}
              data-ux-id={`reservation-slot-${s.id}`}
              disabled={s.status === "booked"}
              className={`flex items-center justify-between px-4 py-3 rounded-lg border text-[14px] ${
                s.status === "booked"
                  ? "border-[#e1e9ef] bg-[#f6f8fb] text-[#9ca3af] cursor-not-allowed"
                  : "border-[#e1e9ef] bg-white text-[#262630] hover:border-[#247ae4] cursor-pointer"
              }`}
            >
              <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold">{s.day}</span>
              <span>{s.time}</span>
              <span
                className={`text-[12px] ${s.status === "booked" ? "text-[#9ca3af]" : "text-[#1b8c5a]"}`}
              >
                {s.status === "booked" ? "Booked" : "Available"}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 8: Create `src/walkthrough/sequences/amenity.tsx`**

```tsx
import type { Sequence } from "../types";
import { AmenityReservationStage } from "../stage-content/AmenityReservationStage";

export const amenitySequence: Sequence = {
  id: "amenity",
  title: "Amenity Reservation",
  beats: [
    { kind: "navigate", to: "amenities" },
    {
      kind: "highlight",
      target: "amenity-tile-pool",
      caption: "Four amenities. Big photos. One tap each.",
    },
    {
      kind: "lift",
      target: "amenity-tile-pool",
      scale: 1.6,
      position: "center",
    },
    {
      kind: "expand",
      content: <AmenityReservationStage amenityId="pool" />,
      caption:
        "Pick a day. Pick a time. The amenity knows the household rules — pool caps at 6 guests on weekends.",
    },
    {
      kind: "annotate",
      tracks: [
        { type: "pulse", target: "reservation-slot-sat-2pm", count: 3 },
        { type: "arrow", from: "stage-guest-badge", to: "reservation-slot-sat-2pm" },
        { type: "typeCaption", text: "The slot already knows: 6 guests max this weekend." },
      ],
    },
    {
      kind: "return",
      caption: "Reserved. Confirmation hits the resident app and the gate code.",
    },
  ],
};
```

- [ ] **Step 9: Create `src/walkthrough/sequences/index.ts`**

```ts
import type { Sequence } from "../types";
import { boardActionsSequence } from "./boardActions";
import { amenitySequence } from "./amenity";

export const sequenceRegistry: Record<string, Sequence> = {
  [boardActionsSequence.id]: boardActionsSequence,
  [amenitySequence.id]: amenitySequence,
};

export function getSequence(id: string): Sequence | undefined {
  return sequenceRegistry[id];
}
```

- [ ] **Step 10: Verify build**

Run: `npm run build`
Expected: build succeeds with no TypeScript errors.

- [ ] **Step 11: Commit**

```bash
git add src/amenities/AmenitiesPage.tsx src/App.tsx src/walkthrough/stage-content/AmenityReservationStage.tsx src/walkthrough/sequences/amenity.tsx src/walkthrough/sequences/index.ts
git commit -m "feat(walkthrough): amenity sequence, demo-only amenities page, and sequence registry"
```

---

## Task 14: Wire the subsystem into `main.tsx` and dev-box smoke-check

**Files:**
- Modify: `src/main.tsx`

**Interfaces:**
- Consumes: `WalkthroughProvider`, `WalkthroughStage`, `WalkthroughLauncher`, `sequenceRegistry`.
- Produces: the full subsystem is reachable from the running app via `?demo=true`, `?demo=board-actions`, `?demo=amenity`, and `Cmd+Shift+W`.

- [ ] **Step 1: Modify `src/main.tsx`**

Replace the file contents with:

```tsx
import React, { useCallback, useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { WalkthroughProvider } from "./walkthrough/WalkthroughProvider";
import { WalkthroughStage } from "./walkthrough/WalkthroughStage";
import { WalkthroughLauncher } from "./walkthrough/WalkthroughLauncher";
import { sequenceRegistry } from "./walkthrough/sequences";

function Root() {
  const [pendingNav, setPendingNav] = useState<string | null>(null);
  const onNavigate = useCallback((page: string) => setPendingNav(page), []);
  return (
    <WalkthroughProvider sequences={sequenceRegistry} onNavigate={onNavigate}>
      <App externalNavRequest={pendingNav} onExternalNavConsumed={() => setPendingNav(null)} />
      <WalkthroughStage />
      <WalkthroughLauncher sequences={sequenceRegistry} />
    </WalkthroughProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
```

- [ ] **Step 2: Modify `src/App.tsx` to accept external navigation requests**

Find the `App` component signature. Add optional props and a `useEffect` to apply external nav requests:

```tsx
type AppProps = {
  externalNavRequest?: string | null;
  onExternalNavConsumed?: () => void;
};

function AppInner({ externalNavRequest, onExternalNavConsumed }: AppProps) {
  // ... existing App body ...
  // Immediately after `const [activePage, setActivePage] = useState<Page>("dashboard");`
  // insert:
  useEffect(() => {
    if (!externalNavRequest) return;
    if (
      externalNavRequest === "dashboard" ||
      externalNavRequest === "elections" ||
      externalNavRequest === "community" ||
      externalNavRequest === "amenities"
    ) {
      setActivePage(externalNavRequest);
    }
    onExternalNavConsumed?.();
  }, [externalNavRequest, onExternalNavConsumed]);
  // ...
}
```

If the current `App` default export does more than just render AppInner (onboarding gate, etc.), wire the two props through to whichever component holds the `activePage` state. The one invariant: when `externalNavRequest` changes to a known page, `setActivePage` is called and `onExternalNavConsumed` is invoked once.

(If the simplest edit is to pass the props all the way to the inner component holding `activePage`, do so — this is a one-time plumbing cost at integration.)

- [ ] **Step 3: Run build and typecheck**

Run: `npm run build`
Expected: build succeeds. No TypeScript errors.

- [ ] **Step 4: Start the dev server (if not already running) and smoke-test**

Run: `npm run dev` (background)

In a browser, verify each of the following manually; check each box only after seeing the behavior:

- [ ] Open `http://localhost:8443/` — no walkthrough UI visible, console clean.
- [ ] Open `http://localhost:8443/?demo=true` — launcher panel appears top-right; two sequences listed.
- [ ] Click **Board Actions** → highlight fires on `board-tasks-widget`. Press `→`: card lifts to center. Press `→`: card expands into detail. Press `→`: GSAP annotate fires (arrow + pulse + typed caption). Press `→`: returns, dashboard visible. Press `→` once more or wait: sequence ends.
- [ ] Press `Cmd+Shift+W` → launcher opens. Click **Amenity Reservation**. Navigate beat should move the app to the Amenities page. Press `→` through the beats. The pool image should remain visually anchored during lift → expand.
- [ ] At any point during either sequence, press `Esc` → stage disappears, app returns to normal.
- [ ] Press `H` during a sequence → HUD and system captions hide. GSAP annotation content (arrow, typed caption inside the beat) remains visible. Press `H` again → HUD returns.
- [ ] Open `http://localhost:8443/?demo=amenity` directly → amenity sequence auto-starts on load.
- [ ] Open `http://localhost:8443/?demo=does-not-exist` → warning in console, no sequence starts, app loads normally.

- [ ] **Step 5: Commit**

```bash
git add src/main.tsx src/App.tsx
git commit -m "feat(walkthrough): wire provider, stage, and launcher into app root"
```

---

## Task 15: Sequence integrity test

**Files:**
- Create: `src/walkthrough/__tests__/sequences.test.ts`

**Interfaces:**
- Consumes: `sequenceRegistry` from Task 13.
- Produces: a single test file that imports every registered sequence and asserts every beat's `kind` is one of the known values.

- [ ] **Step 1: Write test**

Create `src/walkthrough/__tests__/sequences.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { sequenceRegistry } from "../sequences";
import type { BeatKind } from "../types";

const knownKinds: BeatKind[] = ["highlight", "lift", "expand", "annotate", "return", "navigate"];

describe("sequence registry", () => {
  it("every registered sequence has at least one beat", () => {
    for (const seq of Object.values(sequenceRegistry)) {
      expect(seq.beats.length).toBeGreaterThan(0);
    }
  });

  it("every beat has a known kind", () => {
    for (const seq of Object.values(sequenceRegistry)) {
      for (const beat of seq.beats) {
        expect(knownKinds).toContain(beat.kind);
      }
    }
  });

  it("every sequence has a unique id", () => {
    const ids = Object.values(sequenceRegistry).map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
```

- [ ] **Step 2: Run tests**

Run: `npm test`
Expected: all test files pass (including the new sequence integrity test).

- [ ] **Step 3: Commit**

```bash
git add src/walkthrough/__tests__/sequences.test.ts
git commit -m "test(walkthrough): sequence integrity check"
```

---

## Self-Review Checklist (completed before handoff)

- **Spec coverage.** Walked each spec section against the task list:
  - Purpose / audience / tone: encoded in sequence content (Tasks 12, 13).
  - Success criteria: hand-driven (Task 4 keyboard), toggleable HUD (Task 5, Task 11), zero-crash (Review Focus items pinned to Tasks 2, 3, 9, 10), signature morph never cuts (Task 7 shared `layoutId`).
  - Engine choice: Motion installed (Task 1), used in Tasks 6–8; GSAP installed (Task 1), used in Task 9.
  - Architecture: Provider (Task 3), Stage (Task 5), Target registry (Task 2), Beat renderers (Tasks 6–10).
  - File layout: matches the plan's File Structure section.
  - DSL + beat catalog: types in Task 2; renderers map one-to-one to kinds in Tasks 6–10.
  - Driving model: Keyboard (Task 4), Launcher (Task 11), HUD (Task 5).
  - Sequence storyboards: Tasks 12 (Board Actions) and 13 (Amenity).
  - Error handling: Review Focus items pinned (missing targets → Tasks 2, 6; GSAP cleanup → Task 9; Esc mid-navigate → Task 10; rapid advance → Task 3).
  - Testing: build-time check in Task 15; manual smoke/rehearsal in Task 14.
  - Open questions: all intentionally deferred per spec; no action required.
- **Placeholder scan.** No TBD/TODO lines; every code step contains the actual code; the one deliberate deviation (sequence target `board-task-current` vs. spec's `board-task-VIO-1804`) is called out in File Structure and acted on in Task 12 Step 1.
- **Type consistency.** `Beat`, `Sequence`, `WalkthroughState`, `BeatProps`, `AnnotateTrack`, `Point` defined once in Task 2 and referenced identically in later tasks. `registerBeatRenderer` signature defined in Task 5 and called verbatim in Tasks 6–10. `requestNavigate(page: string)` on the context (Task 3) matches `NavigateApp`'s consumer (Task 10) and `main.tsx`'s producer (Task 14). `resolveTarget(id: string): HTMLElement | null` consistent across all callers.
- **Review Focus.** All five entries have tests pinned to specific tasks (noted in each entry).

---

## Handoff

Plan complete and saved to `docs/superpowers/plans/2026-10-09-curated-walkthrough.md`.

Please review the plan. Which execution approach would you prefer?

- **Subagent-driven** — A fresh subagent implements each task and a fresh reviewer checks it before the next one starts, then a whole-branch review at the end. Most thorough; costs a fresh context per task and per review.
- **Native** — I implement every task myself in this session, then one fresh reviewer on the most capable model checks the whole branch at the end. Cheapest and fastest; no independent review until the end.

**For this plan I recommend Subagent-driven, because the 15 tasks share tight interface contracts (beat `kind` → renderer registration, provider actions, target registry) where a drift between adjacent tasks would surface only during the final smoke-test (Task 14), and a shipped mistake on stage at the user conference is an expensive mistake to swallow.** Does the plan capture what you want, and which approach should we use?
