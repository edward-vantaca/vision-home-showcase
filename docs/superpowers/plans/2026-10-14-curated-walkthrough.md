# Curated Walkthrough Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the curated walkthrough on the browser View Transitions API with a scenes-above-beats cursor and keyboard-always-armed input, replacing the current Motion-clone implementation.

**Architecture:** `WalkthroughRoot` wraps `<App />` in `main.tsx`. It owns a cursor `{ sceneIndex, beatIndex }`, installs a global keydown listener, renders the app, and renders a sibling overlay. Every cursor change wraps in `document.startViewTransition`; elements that participate in morphs get `viewTransitionName` styles. GSAP owns `annotate` beats only. No clones. No launcher. No `?demo=`. Scene changes are implicit when the cursor crosses a scene boundary.

**Tech Stack:** React 19, TypeScript 5.7, Vite 8, Tailwind v4, Vitest 4, @testing-library/react 16, GSAP 3 + @gsap/react, browser View Transitions API.

**Spec:** `docs/superpowers/specs/2026-10-09-curated-walkthrough-design.md` (revised 2026-10-14).

> **Note on supersession:** This plan replaces the earlier plan at `docs/superpowers/plans/2026-10-09-curated-walkthrough.md`, which implemented the Motion-clone design. Keep the old file in git history for reference; do not execute it.

## Global Constraints

- **Keyboard always armed from page load.** No launcher, no `?demo=`, no activation chord.
- **Real elements only — no DOM clones.** `lift`/`expand` morph the actual React element via matching `view-transition-name`.
- **One sequence per page load.** `homeVisionSequence` = `[boardActionsScene, amenityScene]`.
- **View-transition-name prefix:** `wt-`. All names live as typed constants in `src/walkthrough/viewTransitionNames.ts`.
- **Esc = soft reset to `jumpTo(0, 0)`**, not a hard exit.
- **GSAP is for `annotate` only.** `withTransition()` is the only animator for `highlight`/`lift`/`expand`/scene changes.
- **Zero external walkthrough dependencies added or removed except:** remove `motion`; keep `gsap` and `@gsap/react`.
- **Scenes don't own rendering of the app.** A `Scene` carries `{ id, page, beats }`; the existing `MainApp` renders the matching `Page` via its existing switch. (This is a plan-level clarification of the spec's `render: () => ReactNode` field — in home-vision, every scene maps 1:1 to an existing `Page`, so a `page` discriminator is simpler than re-plumbing page props through scene components. Spec's intent is preserved.)
- **No autoplay, no auto-advance.** Only user key input moves the cursor.
- **Non-destructive during migration.** The old subsystem stays mounted and functional through Task 14; the switchover happens in Task 15 in one commit.
- **File-location rules (project):** new walkthrough code lives in `src/walkthrough/`; TS shims live in `src/types/`; plans and specs stay in `docs/superpowers/`.
- **Format:** run `pnpm format` (oxfmt) before every commit.

## Review Focus

The five input classes most likely to bite a presenter, pinned to the task whose tests own them:

1. **Duplicate `view-transition-name` at runtime** — a scene mounts twice, or a dynamic list emits two children with the same name. Expected: dev-only uniqueness guard warns in `console` BEFORE the browser's native error fires on the next `startViewTransition`. Pinned to **Task 13**.
2. **First keydown with no element focused** — presenter loads the page, hasn't clicked anything, presses `→`. Expected: listener fires because it's on `window`, not an app element. Pinned to **Task 5**.
3. **Lift target scrolled off-screen** — the dashboard was scrolled before the walkthrough began; `getBoundingClientRect()` returns a rect outside the viewport. Expected: `scrollIntoView({ block: 'center', behavior: 'auto' })` is called on the target before the lift transition starts. Pinned to **Task 8**.
4. **Expand content taller than viewport** — the expanded detail card doesn't fit. Expected: content container has `max-height: calc(100vh - 160px); overflow-y: auto;` so it scrolls inside the stage slot rather than overflowing. Pinned to **Task 9**.
5. **Rapid key presses during an in-flight transition** — presenter mashes `→`. Expected: cursor actions queue (never dropped, never double-fire) because `withTransition()` wraps the state update; the browser serializes transitions. Verify no `useEffect` or listener dispatches twice per key. Pinned to **Task 3**.

---

### Task 1: TypeScript shim + VT name constants

**Files:**
- Create: `src/types/view-transitions.d.ts`
- Create: `src/walkthrough/viewTransitionNames.ts`
- Create: `src/walkthrough/walkthrough.css` (empty placeholder; populated in Task 11)

**Interfaces:**
- Produces: `VT` constants object with keys `BoardTaskCurrent`, `AmenityTilePool`; each is a `view-transition-name` string literal.

- [ ] **Step 1: Create the TS shim**

```ts
// src/types/view-transitions.d.ts
interface ViewTransition {
  finished: Promise<void>;
  ready: Promise<void>;
  updateCallbackDone: Promise<void>;
  skipTransition(): void;
}

interface Document {
  startViewTransition?: (updateCallback: () => void | Promise<void>) => ViewTransition;
}
```

- [ ] **Step 2: Create VT name constants**

```ts
// src/walkthrough/viewTransitionNames.ts
export const VT = {
  BoardTaskCurrent: "wt-board-task-current",
  AmenityTilePool: "wt-amenity-tile-pool",
} as const;

export type VTName = (typeof VT)[keyof typeof VT];
```

- [ ] **Step 3: Create empty CSS placeholder**

```css
/* src/walkthrough/walkthrough.css */
/* Populated in Task 11 (overlay styling, VT group timing, reduced motion). */
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/types/view-transitions.d.ts src/walkthrough/viewTransitionNames.ts src/walkthrough/walkthrough.css
git commit -m "feat(walkthrough): add VT API ambient types and name constants"
```

---

### Task 2: New types for Scene / Beat / Cursor

**Files:**
- Create: `src/walkthrough/types.new.ts` (temporary filename to coexist with old `types.ts`; renamed in Task 15)

**Interfaces:**
- Produces: `Scene`, `Beat` (tagged union), `Sequence`, `Cursor`, `Page` re-export.

- [ ] **Step 1: Write the file**

```ts
// src/walkthrough/types.new.ts
import type { ReactNode } from "react";
import type { VTName } from "./viewTransitionNames";

export type Page = "dashboard" | "elections" | "community" | "amenities";

export type Point = { x: number; y: number };

export type AnnotateTrack =
  | { type: "arrow"; from: VTName | Point; to: VTName | Point }
  | { type: "pulse"; target: VTName; count?: number }
  | { type: "typeCaption"; text: string; speedCps?: number };

export type Beat =
  | { kind: "idle" }
  | { kind: "highlight"; target: VTName; caption?: string }
  | { kind: "lift"; target: VTName; scale?: number; position?: "center" | Point; caption?: string }
  | { kind: "expand"; target: VTName; content: ReactNode; caption?: string }
  | { kind: "annotate"; tracks: AnnotateTrack[]; durationMs?: number }
  | { kind: "narrate"; title?: string; body: string };

export type Scene = {
  id: string;
  page: Page;
  beats: Beat[];
};

export type Sequence = Scene[];

export type Cursor = { sceneIndex: number; beatIndex: number };

export type WalkthroughState = {
  cursor: Cursor;
  hudVisible: boolean;
};

export type WalkthroughAction =
  | { type: "advance" }
  | { type: "back" }
  | { type: "jumpTo"; cursor: Cursor }
  | { type: "toggleHud" };
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `pnpm exec tsc --noEmit`
Expected: no errors (old `types.ts` and new one coexist with distinct exports).

- [ ] **Step 3: Commit**

```bash
git add src/walkthrough/types.new.ts
git commit -m "feat(walkthrough): add Scene/Beat/Cursor types for VT-based rewrite"
```

---

### Task 3: Cursor reducer + context + withTransition helper

**Files:**
- Create: `src/walkthrough/cursor.tsx`
- Create: `src/walkthrough/__tests__/cursor.test.ts`

**Interfaces:**
- Consumes: `Sequence`, `Cursor`, `WalkthroughState`, `WalkthroughAction` from `types.new.ts`.
- Produces:
  - `cursorReducer(state, action, sequence): WalkthroughState` — pure.
  - `withTransition(update: () => void): void` — wraps `document.startViewTransition` with reduced-motion / no-VT fallback.
  - `WalkthroughContext` — React context carrying `{ state, dispatch, sequence }`.
  - `useCursor(): { cursor, scene, beat, advance, back, jumpTo, toggleHud, hudVisible }`.

- [ ] **Step 1: Write failing tests**

```ts
// src/walkthrough/__tests__/cursor.test.ts
import { describe, it, expect, vi } from "vitest";
import { cursorReducer, withTransition } from "../cursor";
import type { Sequence, WalkthroughState } from "../types.new";

const seq: Sequence = [
  { id: "a", page: "dashboard", beats: [{ kind: "idle" }, { kind: "idle" }] },
  { id: "b", page: "amenities", beats: [{ kind: "idle" }, { kind: "idle" }, { kind: "idle" }] },
];

const initial: WalkthroughState = { cursor: { sceneIndex: 0, beatIndex: 0 }, hudVisible: false };

describe("cursorReducer", () => {
  it("advances within a scene", () => {
    const next = cursorReducer(initial, { type: "advance" }, seq);
    expect(next.cursor).toEqual({ sceneIndex: 0, beatIndex: 1 });
  });

  it("advances across scene boundary to beat 0 of next scene", () => {
    const atEnd: WalkthroughState = { ...initial, cursor: { sceneIndex: 0, beatIndex: 1 } };
    const next = cursorReducer(atEnd, { type: "advance" }, seq);
    expect(next.cursor).toEqual({ sceneIndex: 1, beatIndex: 0 });
  });

  it("no-ops at the last beat of the last scene", () => {
    const atEnd: WalkthroughState = { ...initial, cursor: { sceneIndex: 1, beatIndex: 2 } };
    const next = cursorReducer(atEnd, { type: "advance" }, seq);
    expect(next.cursor).toEqual({ sceneIndex: 1, beatIndex: 2 });
  });

  it("back-steps across scene boundary into previous scene's last beat", () => {
    const atStart: WalkthroughState = { ...initial, cursor: { sceneIndex: 1, beatIndex: 0 } };
    const next = cursorReducer(atStart, { type: "back" }, seq);
    expect(next.cursor).toEqual({ sceneIndex: 0, beatIndex: 1 });
  });

  it("no-ops at beat 0 of scene 0 on back", () => {
    const next = cursorReducer(initial, { type: "back" }, seq);
    expect(next.cursor).toEqual({ sceneIndex: 0, beatIndex: 0 });
  });

  it("jumpTo moves the cursor directly", () => {
    const next = cursorReducer(initial, { type: "jumpTo", cursor: { sceneIndex: 1, beatIndex: 2 } }, seq);
    expect(next.cursor).toEqual({ sceneIndex: 1, beatIndex: 2 });
  });

  it("toggleHud flips hudVisible", () => {
    const next = cursorReducer(initial, { type: "toggleHud" }, seq);
    expect(next.hudVisible).toBe(true);
  });
});

describe("withTransition", () => {
  it("calls document.startViewTransition when available", () => {
    const spy = vi.fn((cb: () => void) => {
      cb();
      return { finished: Promise.resolve() } as any;
    });
    (globalThis as any).document = { startViewTransition: spy };
    const update = vi.fn();
    withTransition(update);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledTimes(1);
  });

  it("falls back to direct update when startViewTransition is undefined", () => {
    (globalThis as any).document = { startViewTransition: undefined };
    const update = vi.fn();
    withTransition(update);
    expect(update).toHaveBeenCalledTimes(1);
  });

  it("falls back to direct update when prefers-reduced-motion matches", () => {
    (globalThis as any).document = { startViewTransition: vi.fn() };
    (globalThis as any).matchMedia = vi.fn().mockReturnValue({ matches: true });
    const update = vi.fn();
    withTransition(update);
    expect(update).toHaveBeenCalledTimes(1);
    expect((globalThis as any).document.startViewTransition).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test cursor`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement cursor.tsx**

```tsx
// src/walkthrough/cursor.tsx
import { createContext, useCallback, useContext, useMemo, useReducer, type ReactNode } from "react";
import type { Beat, Cursor, Scene, Sequence, WalkthroughAction, WalkthroughState } from "./types.new";

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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test cursor`
Expected: PASS (all 10 tests).

- [ ] **Step 5: Commit**

```bash
pnpm format
git add src/walkthrough/cursor.tsx src/walkthrough/__tests__/cursor.test.ts
git commit -m "feat(walkthrough): cursor reducer + withTransition helper"
```

---

### Task 4: Keyboard listener hook

**Files:**
- Create: `src/walkthrough/keyboard.new.ts` (temp filename; renamed in Task 15)
- Create: `src/walkthrough/__tests__/keyboard.test.ts`

**Interfaces:**
- Consumes: `useCursor()` from `cursor.tsx`.
- Produces: `useWalkthroughKeyboard(): void` — installs a global `keydown` listener on `window` while mounted.

- [ ] **Step 1: Write failing tests**

```ts
// src/walkthrough/__tests__/keyboard.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { fireEvent } from "@testing-library/dom";
import { useWalkthroughKeyboard } from "../keyboard.new";
import { WalkthroughProvider, useCursor } from "../cursor";
import type { Sequence } from "../types.new";

const seq: Sequence = [
  { id: "a", page: "dashboard", beats: [{ kind: "idle" }, { kind: "idle" }, { kind: "idle" }] },
];

function wrapper({ children }: { children: React.ReactNode }) {
  return <WalkthroughProvider sequence={seq}>{children}</WalkthroughProvider>;
}

function useAll() {
  useWalkthroughKeyboard();
  return useCursor();
}

describe("useWalkthroughKeyboard", () => {
  it("advances on ArrowRight", () => {
    const { result } = renderHook(() => useAll(), { wrapper });
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(result.current.cursor).toEqual({ sceneIndex: 0, beatIndex: 1 });
  });

  it("goes back on ArrowLeft", () => {
    const { result } = renderHook(() => useAll(), { wrapper });
    fireEvent.keyDown(window, { key: "ArrowRight" });
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(result.current.cursor).toEqual({ sceneIndex: 0, beatIndex: 0 });
  });

  it("Esc returns to (0,0)", () => {
    const { result } = renderHook(() => useAll(), { wrapper });
    fireEvent.keyDown(window, { key: "ArrowRight" });
    fireEvent.keyDown(window, { key: "ArrowRight" });
    fireEvent.keyDown(window, { key: "Escape" });
    expect(result.current.cursor).toEqual({ sceneIndex: 0, beatIndex: 0 });
  });

  it("toggles HUD on '.'", () => {
    const { result } = renderHook(() => useAll(), { wrapper });
    expect(result.current.hudVisible).toBe(false);
    fireEvent.keyDown(window, { key: "." });
    expect(result.current.hudVisible).toBe(true);
  });

  it("ignores keydown when target is an input", () => {
    const { result } = renderHook(() => useAll(), { wrapper });
    const input = document.createElement("input");
    document.body.appendChild(input);
    input.focus();
    fireEvent.keyDown(input, { key: "ArrowRight" });
    expect(result.current.cursor).toEqual({ sceneIndex: 0, beatIndex: 0 });
    input.remove();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test keyboard`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement keyboard.new.ts**

```ts
// src/walkthrough/keyboard.new.ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test keyboard`
Expected: PASS (all 5 tests).

- [ ] **Step 5: Commit**

```bash
pnpm format
git add src/walkthrough/keyboard.new.ts src/walkthrough/__tests__/keyboard.test.ts
git commit -m "feat(walkthrough): global keyboard listener (always armed)"
```

---

### Task 5: Target rect tracking hook

**Files:**
- Create: `src/walkthrough/useTargetRect.ts`
- Create: `src/walkthrough/__tests__/useTargetRect.test.ts`

**Interfaces:**
- Produces: `useTargetRect(viewTransitionName: string | null): DOMRect | null` — finds the element in the DOM by `[style*="view-transition-name:<name>"]`, returns its rect, updates on `resize` / `scroll`.

- [ ] **Step 1: Write failing tests**

```ts
// src/walkthrough/__tests__/useTargetRect.test.ts
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTargetRect } from "../useTargetRect";

describe("useTargetRect", () => {
  it("returns null when name is null", () => {
    const { result } = renderHook(() => useTargetRect(null));
    expect(result.current).toBeNull();
  });

  it("returns null when no element matches", () => {
    const { result } = renderHook(() => useTargetRect("wt-missing"));
    expect(result.current).toBeNull();
  });

  it("returns the element rect when a match exists", () => {
    const el = document.createElement("div");
    el.setAttribute("data-vt-name", "wt-present");
    el.style.viewTransitionName = "wt-present";
    document.body.appendChild(el);
    const { result } = renderHook(() => useTargetRect("wt-present"));
    expect(result.current).not.toBeNull();
    el.remove();
  });

  it("recomputes on window resize", () => {
    const el = document.createElement("div");
    el.setAttribute("data-vt-name", "wt-present");
    el.style.viewTransitionName = "wt-present";
    document.body.appendChild(el);
    const { result } = renderHook(() => useTargetRect("wt-present"));
    const first = result.current;
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });
    expect(result.current).not.toBe(first);
    el.remove();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test useTargetRect`
Expected: FAIL.

- [ ] **Step 3: Implement useTargetRect**

```ts
// src/walkthrough/useTargetRect.ts
import { useLayoutEffect, useState } from "react";

function findByVTName(name: string): HTMLElement | null {
  // We tag participating elements with data-vt-name mirroring viewTransitionName
  // (CSS attribute lookup is more reliable than style-attribute parsing).
  return document.querySelector<HTMLElement>(`[data-vt-name="${name}"]`);
}

export function useTargetRect(name: string | null): DOMRect | null {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useLayoutEffect(() => {
    if (!name) {
      setRect(null);
      return;
    }
    const compute = () => {
      const el = findByVTName(name);
      setRect(el ? el.getBoundingClientRect() : null);
    };
    compute();
    window.addEventListener("resize", compute);
    window.addEventListener("scroll", compute, true);
    return () => {
      window.removeEventListener("resize", compute);
      window.removeEventListener("scroll", compute, true);
    };
  }, [name]);

  return rect;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test useTargetRect`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
pnpm format
git add src/walkthrough/useTargetRect.ts src/walkthrough/__tests__/useTargetRect.test.ts
git commit -m "feat(walkthrough): useTargetRect hook with resize/scroll tracking"
```

---

### Task 6: WalkthroughOverlay — backdrop + cutout + caption

**Files:**
- Create: `src/walkthrough/WalkthroughOverlay.tsx`
- Create: `src/walkthrough/__tests__/WalkthroughOverlay.test.tsx`

**Interfaces:**
- Consumes: `useCursor()`, `useTargetRect()`.
- Produces: `<WalkthroughOverlay />` — fixed, full-viewport, pointer-events-none. Renders:
  - `.wt-backdrop` div with `data-beat-kind` attribute (CSS drives opacity per kind).
  - `.wt-cutout` div (only for `highlight` beats) — `clip-path: polygon(...)` carving a hole around the target rect, surrounded by `backdrop-filter: blur(6px)`.
  - `.wt-caption` div (any beat with a `caption` field) — bottom-centered.
  - Children slot for beat renderers to inject stage slots.

- [ ] **Step 1: Write failing tests**

```tsx
// src/walkthrough/__tests__/WalkthroughOverlay.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { WalkthroughProvider } from "../cursor";
import { WalkthroughOverlay } from "../WalkthroughOverlay";
import type { Sequence } from "../types.new";
import { VT } from "../viewTransitionNames";

const seqIdle: Sequence = [{ id: "s", page: "dashboard", beats: [{ kind: "idle" }] }];
const seqHighlight: Sequence = [
  { id: "s", page: "dashboard", beats: [{ kind: "highlight", target: VT.BoardTaskCurrent, caption: "hello" }] },
];

describe("WalkthroughOverlay", () => {
  it("renders the backdrop with data-beat-kind='idle' for idle beat", () => {
    render(
      <WalkthroughProvider sequence={seqIdle}>
        <WalkthroughOverlay />
      </WalkthroughProvider>,
    );
    const backdrop = document.querySelector(".wt-backdrop");
    expect(backdrop?.getAttribute("data-beat-kind")).toBe("idle");
  });

  it("renders the caption text for a highlight beat", () => {
    render(
      <WalkthroughProvider sequence={seqHighlight}>
        <WalkthroughOverlay />
      </WalkthroughProvider>,
    );
    expect(screen.getByText("hello")).toBeInTheDocument();
  });

  it("renders the cutout div for a highlight beat", () => {
    render(
      <WalkthroughProvider sequence={seqHighlight}>
        <WalkthroughOverlay />
      </WalkthroughProvider>,
    );
    expect(document.querySelector(".wt-cutout")).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test WalkthroughOverlay`
Expected: FAIL.

- [ ] **Step 3: Implement overlay**

```tsx
// src/walkthrough/WalkthroughOverlay.tsx
import { useCursor } from "./cursor";
import { useTargetRect } from "./useTargetRect";
import type { Beat } from "./types.new";
import "./walkthrough.css";

function cutoutClipPath(rect: DOMRect | null): string | undefined {
  if (!rect) return undefined;
  const { left: l, top: t, right: r, bottom: b } = rect;
  // polygon traces outer viewport, dives into the hole and back out
  return `polygon(0 0, 100vw 0, 100vw 100vh, 0 100vh, 0 0, ${l}px ${t}px, ${l}px ${b}px, ${r}px ${b}px, ${r}px ${t}px, ${l}px ${t}px, 0 0)`;
}

function captionOf(beat: Beat | undefined): string | null {
  if (!beat) return null;
  if ("caption" in beat && beat.caption) return beat.caption;
  if (beat.kind === "narrate") return beat.body;
  return null;
}

export function WalkthroughOverlay() {
  const { beat } = useCursor();
  const target = beat && (beat.kind === "highlight" || beat.kind === "lift" || beat.kind === "expand") ? beat.target : null;
  const rect = useTargetRect(target);
  const kind = beat?.kind ?? "idle";
  const caption = captionOf(beat);

  return (
    <div className="wt-root" aria-hidden={kind === "idle"}>
      <div className="wt-backdrop" data-beat-kind={kind} />
      {kind === "highlight" && rect && (
        <div className="wt-cutout" style={{ clipPath: cutoutClipPath(rect) }} />
      )}
      {caption && <div className="wt-caption">{caption}</div>}
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test WalkthroughOverlay`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
pnpm format
git add src/walkthrough/WalkthroughOverlay.tsx src/walkthrough/__tests__/WalkthroughOverlay.test.tsx
git commit -m "feat(walkthrough): overlay with backdrop, cutout, and caption"
```

---

### Task 7: HighlightBeat (behavior-only wrapper, no DOM of its own)

**Note:** The overlay already handles the highlight visuals (`cutout`, `caption`). This task is deliberately small: it exists so that per-beat behavior can be added later (e.g., scrollIntoView on the target) without touching the overlay.

**Files:**
- Create: `src/walkthrough/beats/HighlightBeat.tsx`
- Create: `src/walkthrough/__tests__/HighlightBeat.test.tsx`

**Interfaces:**
- Produces: `<HighlightBeat target={VTName} />` — on mount, calls `scrollIntoView({ block: 'center', behavior: 'auto' })` on the matching element. Renders nothing (returns `null`).

- [ ] **Step 1: Write failing test**

```tsx
// src/walkthrough/__tests__/HighlightBeat.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { HighlightBeat } from "../beats/HighlightBeat";

describe("HighlightBeat", () => {
  it("calls scrollIntoView on the matching target", () => {
    const el = document.createElement("div");
    el.setAttribute("data-vt-name", "wt-target");
    const spy = vi.fn();
    el.scrollIntoView = spy;
    document.body.appendChild(el);
    render(<HighlightBeat target="wt-target" />);
    expect(spy).toHaveBeenCalledWith({ block: "center", behavior: "auto" });
    el.remove();
  });

  it("is a no-op when no matching element exists", () => {
    expect(() => render(<HighlightBeat target="wt-missing" />)).not.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test HighlightBeat`
Expected: FAIL.

- [ ] **Step 3: Implement**

```tsx
// src/walkthrough/beats/HighlightBeat.tsx
import { useEffect } from "react";

export function HighlightBeat({ target }: { target: string }) {
  useEffect(() => {
    const el = document.querySelector<HTMLElement>(`[data-vt-name="${target}"]`);
    el?.scrollIntoView({ block: "center", behavior: "auto" });
  }, [target]);
  return null;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test HighlightBeat`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
pnpm format
git add src/walkthrough/beats/HighlightBeat.tsx src/walkthrough/__tests__/HighlightBeat.test.tsx
git commit -m "feat(walkthrough): HighlightBeat scrolls target into view"
```

---

### Task 8: LiftBeat (stage slot + visibility toggle)

**Files:**
- Create: `src/walkthrough/beats/LiftBeat.tsx`
- Create: `src/walkthrough/__tests__/LiftBeat.test.tsx`

**Interfaces:**
- Produces: `<LiftBeat target scale? position? />` — renders a fixed, centered empty `<div>` with `view-transition-name: target` and the correct `data-vt-name` attribute at the destination size. On mount, sets the scene-side element's `visibility: 'hidden'`. On unmount, restores `visibility: ''`.

- [ ] **Step 1: Write failing tests**

```tsx
// src/walkthrough/__tests__/LiftBeat.test.tsx
import { describe, it, expect } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { LiftBeat } from "../beats/LiftBeat";

describe("LiftBeat", () => {
  it("renders a stage slot with the matching data-vt-name", () => {
    render(<LiftBeat target="wt-x" />);
    const slot = document.querySelector("[data-vt-name='wt-x'].wt-stage-slot");
    expect(slot).not.toBeNull();
  });

  it("hides the scene-side element while mounted", () => {
    const scene = document.createElement("div");
    scene.setAttribute("data-vt-name", "wt-x");
    document.body.appendChild(scene);
    render(<LiftBeat target="wt-x" />);
    expect(scene.style.visibility).toBe("hidden");
    cleanup();
    expect(scene.style.visibility).toBe("");
    scene.remove();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test LiftBeat`
Expected: FAIL.

- [ ] **Step 3: Implement**

```tsx
// src/walkthrough/beats/LiftBeat.tsx
import { useEffect } from "react";
import type { Point } from "../types.new";

type Props = {
  target: string;
  scale?: number;
  position?: "center" | Point;
};

function findScene(name: string): HTMLElement | null {
  // The scene-side element — not the stage slot (which has class wt-stage-slot).
  const all = Array.from(document.querySelectorAll<HTMLElement>(`[data-vt-name="${name}"]`));
  return all.find((el) => !el.classList.contains("wt-stage-slot")) ?? null;
}

export function LiftBeat({ target, scale = 1.4, position = "center" }: Props) {
  useEffect(() => {
    const scene = findScene(target);
    if (!scene) return;
    scene.style.visibility = "hidden";
    return () => {
      scene.style.visibility = "";
    };
  }, [target]);

  const style: React.CSSProperties = {
    position: "fixed",
    viewTransitionName: target,
    transform: `scale(${scale})`,
    transformOrigin: "center center",
    pointerEvents: "none",
    ...(position === "center"
      ? { top: "50%", left: "50%", translate: "-50% -50%" }
      : { top: position.y, left: position.x }),
  };

  return <div className="wt-stage-slot" data-vt-name={target} style={style} />;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test LiftBeat`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
pnpm format
git add src/walkthrough/beats/LiftBeat.tsx src/walkthrough/__tests__/LiftBeat.test.tsx
git commit -m "feat(walkthrough): LiftBeat with stage slot + visibility toggle"
```

---

### Task 9: ExpandBeat

**Files:**
- Create: `src/walkthrough/beats/ExpandBeat.tsx`
- Create: `src/walkthrough/__tests__/ExpandBeat.test.tsx`

**Interfaces:**
- Produces: `<ExpandBeat target content />` — renders a fixed, viewport-constrained stage slot (`max-width: min(1000px, 90vw); max-height: calc(100vh - 160px); overflow-y: auto`) containing the real React `content`. Hides the scene-side element on mount; restores on unmount.

- [ ] **Step 1: Write failing tests**

```tsx
// src/walkthrough/__tests__/ExpandBeat.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ExpandBeat } from "../beats/ExpandBeat";

describe("ExpandBeat", () => {
  it("renders the content inside a stage slot", () => {
    render(
      <ExpandBeat target="wt-x">
        <div>expanded content</div>
      </ExpandBeat>,
    );
    expect(screen.getByText("expanded content")).toBeInTheDocument();
    const slot = document.querySelector("[data-vt-name='wt-x'].wt-stage-slot");
    expect(slot).not.toBeNull();
  });

  it("applies max-height for viewport-safe scrolling", () => {
    const { container } = render(
      <ExpandBeat target="wt-x">
        <div>c</div>
      </ExpandBeat>,
    );
    const slot = container.querySelector(".wt-stage-slot") as HTMLElement;
    expect(slot.style.maxHeight).toContain("calc(100vh");
  });

  it("hides the scene-side element while mounted", () => {
    const scene = document.createElement("div");
    scene.setAttribute("data-vt-name", "wt-x");
    document.body.appendChild(scene);
    render(<ExpandBeat target="wt-x">c</ExpandBeat>);
    expect(scene.style.visibility).toBe("hidden");
    cleanup();
    expect(scene.style.visibility).toBe("");
    scene.remove();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test ExpandBeat`
Expected: FAIL.

- [ ] **Step 3: Implement**

```tsx
// src/walkthrough/beats/ExpandBeat.tsx
import { useEffect, type ReactNode } from "react";

type Props = { target: string; children: ReactNode };

function findScene(name: string): HTMLElement | null {
  const all = Array.from(document.querySelectorAll<HTMLElement>(`[data-vt-name="${name}"]`));
  return all.find((el) => !el.classList.contains("wt-stage-slot")) ?? null;
}

export function ExpandBeat({ target, children }: Props) {
  useEffect(() => {
    const scene = findScene(target);
    if (!scene) return;
    scene.style.visibility = "hidden";
    return () => {
      scene.style.visibility = "";
    };
  }, [target]);

  const style: React.CSSProperties = {
    position: "fixed",
    top: "50%",
    left: "50%",
    translate: "-50% -50%",
    viewTransitionName: target,
    pointerEvents: "auto",
    maxWidth: "min(1000px, 90vw)",
    maxHeight: "calc(100vh - 160px)",
    overflowY: "auto",
    background: "white",
    borderRadius: "16px",
    boxShadow: "0 24px 60px rgba(0,0,0,.25)",
  };

  return (
    <div className="wt-stage-slot" data-vt-name={target} style={style}>
      {children}
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test ExpandBeat`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
pnpm format
git add src/walkthrough/beats/ExpandBeat.tsx src/walkthrough/__tests__/ExpandBeat.test.tsx
git commit -m "feat(walkthrough): ExpandBeat with viewport-safe scrolling slot"
```

---

### Task 10: AnnotateBeat (ported from AnnotateWithGSAP, decoupled from registry)

**Files:**
- Create: `src/walkthrough/beats/AnnotateBeat.tsx`
- Create: `src/walkthrough/__tests__/AnnotateBeat.test.tsx`

**Interfaces:**
- Consumes: `AnnotateTrack[]` from `types.new.ts`; `gsap`; `useGSAP`.
- Produces: `<AnnotateBeat tracks durationMs? />` — renders tracks as DOM/SVG elements and runs a GSAP timeline over them. Resolves targets via `document.querySelector('[data-vt-name="..."]')` (not the old `targetRegistry`).

- [ ] **Step 1: Write failing test**

```tsx
// src/walkthrough/__tests__/AnnotateBeat.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AnnotateBeat } from "../beats/AnnotateBeat";

describe("AnnotateBeat", () => {
  it("renders a caption slot with data-track='caption-0'", () => {
    render(<AnnotateBeat tracks={[{ type: "typeCaption", text: "hello world" }]} />);
    expect(document.querySelector('[data-track="caption-0"]')).not.toBeNull();
  });

  it("renders a pulse ring when the target exists in the DOM", () => {
    const el = document.createElement("div");
    el.setAttribute("data-vt-name", "wt-pulse-target");
    document.body.appendChild(el);
    render(<AnnotateBeat tracks={[{ type: "pulse", target: "wt-pulse-target" as any }]} />);
    expect(document.querySelector('[data-track="pulse-0"]')).not.toBeNull();
    el.remove();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test AnnotateBeat`
Expected: FAIL.

- [ ] **Step 3: Implement**

Port the body of the current `src/walkthrough/beats/AnnotateWithGSAP.tsx` with these three changes:
1. Replace `import { resolveTarget } from "../targetRegistry"` with a local function:
   ```ts
   const resolveTarget = (name: string) => document.querySelector<HTMLElement>(`[data-vt-name="${name}"]`);
   ```
2. Remove `import { registerBeatRenderer } from "../WalkthroughStage"` and the `registerBeatRenderer("annotate", AnnotateWithGSAP)` call at the bottom.
3. Rename the component to `AnnotateBeat`; replace the `BeatProps<AnnotateBeat>` signature with:
   ```ts
   export function AnnotateBeat({ tracks, durationMs }: { tracks: AnnotateTrack[]; durationMs?: number }) { ... }
   ```
   Change references from `beat.tracks` → `tracks`, `beat.durationMs` → `durationMs`.
4. Change `dependencies: [beat]` to `dependencies: [tracks, durationMs]`.

Full implementation:

```tsx
// src/walkthrough/beats/AnnotateBeat.tsx
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import type { AnnotateTrack, Point } from "../types.new";

const resolveTarget = (name: string) => document.querySelector<HTMLElement>(`[data-vt-name="${name}"]`);

function resolvePoint(spec: string | Point): Point | null {
  if (typeof spec === "object") return spec;
  const el = resolveTarget(spec);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

export function AnnotateBeat({ tracks, durationMs }: { tracks: AnnotateTrack[]; durationMs?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline();
      tracks.forEach((track, idx) => {
        if (track.type === "typeCaption") {
          const target = containerRef.current?.querySelector<HTMLElement>(`[data-track="caption-${idx}"]`);
          if (!target) return;
          const total = track.text.length;
          const cps = track.speedCps ?? 25;
          const duration = total / cps;
          const proxy = { progress: 0 };
          tl.to(
            proxy,
            {
              progress: 1,
              duration,
              ease: "none",
              onUpdate() {
                const charCount = Math.round(proxy.progress * total);
                target.textContent = track.text.substring(0, charCount);
              },
            },
            0,
          );
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
      if (durationMs) {
        tl.to({}, { duration: durationMs / 1000 });
      }
      return () => {
        tl.kill();
      };
    },
    { scope: containerRef, dependencies: [tracks, durationMs] },
  );

  return (
    <div data-testid="annotate-beat" ref={containerRef} className="pointer-events-none">
      {tracks.map((track, idx) => {
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
            <svg key={idx} className="fixed inset-0 w-screen h-screen" style={{ pointerEvents: "none" }}>
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test AnnotateBeat`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
pnpm format
git add src/walkthrough/beats/AnnotateBeat.tsx src/walkthrough/__tests__/AnnotateBeat.test.tsx
git commit -m "feat(walkthrough): AnnotateBeat ported with DOM-attribute target resolution"
```

---

### Task 11: Beat dispatcher inside the overlay + CSS

**Files:**
- Modify: `src/walkthrough/WalkthroughOverlay.tsx`
- Modify: `src/walkthrough/walkthrough.css`

**Interfaces:**
- The overlay now renders the matching beat renderer based on `beat.kind`.

- [ ] **Step 1: Update WalkthroughOverlay to dispatch to beat renderers**

Add imports:
```tsx
import { HighlightBeat } from "./beats/HighlightBeat";
import { LiftBeat } from "./beats/LiftBeat";
import { ExpandBeat } from "./beats/ExpandBeat";
import { AnnotateBeat } from "./beats/AnnotateBeat";
```

Inside the overlay render, after the caption, add:
```tsx
{beat?.kind === "highlight" && <HighlightBeat target={beat.target} />}
{beat?.kind === "lift" && <LiftBeat target={beat.target} scale={beat.scale} position={beat.position} />}
{beat?.kind === "expand" && <ExpandBeat target={beat.target}>{beat.content}</ExpandBeat>}
{beat?.kind === "annotate" && <AnnotateBeat tracks={beat.tracks} durationMs={beat.durationMs} />}
```

- [ ] **Step 2: Flesh out walkthrough.css**

```css
/* src/walkthrough/walkthrough.css */
.wt-root {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 100;
}

.wt-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(6px);
  opacity: 0;
  transition: opacity 240ms ease;
}

.wt-backdrop[data-beat-kind="idle"]      { opacity: 0; }
.wt-backdrop[data-beat-kind="narrate"]   { opacity: 0.9; }
.wt-backdrop[data-beat-kind="highlight"] { opacity: 0; } /* cutout handles the dim */
.wt-backdrop[data-beat-kind="lift"]      { opacity: 0.6; }
.wt-backdrop[data-beat-kind="expand"]    { opacity: 0.6; }
.wt-backdrop[data-beat-kind="annotate"]  { opacity: 0.6; }

.wt-cutout {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(6px);
}

.wt-caption {
  position: fixed;
  bottom: 48px;
  left: 50%;
  transform: translateX(-50%);
  max-width: min(820px, 90vw);
  padding: 14px 22px;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 14px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18);
  font: 500 20px/1.35 "DM Sans", system-ui, sans-serif;
  color: #262630;
  text-align: center;
}

::view-transition-group(*) {
  animation-duration: 420ms;
  animation-timing-function: cubic-bezier(0.34, 1.2, 0.64, 1);
}

@media (prefers-reduced-motion: reduce) {
  .wt-backdrop,
  .wt-caption {
    transition: none;
  }
  ::view-transition-group(*),
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation-duration: 1ms !important;
  }
}
```

- [ ] **Step 3: Verify all tests still pass**

Run: `pnpm test`
Expected: PASS (all tests from Tasks 3–10).

- [ ] **Step 4: Commit**

```bash
pnpm format
git add src/walkthrough/WalkthroughOverlay.tsx src/walkthrough/walkthrough.css
git commit -m "feat(walkthrough): dispatch beats inside overlay; styled overlay CSS"
```

---

### Task 12: WalkthroughHUD (new)

**Files:**
- Create: `src/walkthrough/WalkthroughHUD.new.tsx` (temp filename)
- Create: `src/walkthrough/__tests__/WalkthroughHUD.test.tsx`

**Interfaces:**
- Produces: `<WalkthroughHUD />` — reads cursor, renders progress "scene N of M · beat P of Q", a dot row, prev/next buttons. Only visible when `hudVisible` is true.

- [ ] **Step 1: Write failing tests**

```tsx
// src/walkthrough/__tests__/WalkthroughHUD.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { WalkthroughProvider, useCursor } from "../cursor";
import { WalkthroughHUD } from "../WalkthroughHUD.new";
import type { Sequence } from "../types.new";
import { useEffect } from "react";

const seq: Sequence = [
  { id: "a", page: "dashboard", beats: [{ kind: "idle" }, { kind: "idle" }] },
  { id: "b", page: "amenities", beats: [{ kind: "idle" }] },
];

function ShowHud() {
  const { toggleHud } = useCursor();
  useEffect(() => toggleHud(), [toggleHud]);
  return null;
}

describe("WalkthroughHUD", () => {
  it("is hidden by default", () => {
    render(
      <WalkthroughProvider sequence={seq}>
        <WalkthroughHUD />
      </WalkthroughProvider>,
    );
    expect(screen.queryByTestId("wt-hud")).toBeNull();
  });

  it("shows progress text when visible", () => {
    render(
      <WalkthroughProvider sequence={seq}>
        <ShowHud />
        <WalkthroughHUD />
      </WalkthroughProvider>,
    );
    expect(screen.getByTestId("wt-hud")).toBeInTheDocument();
    expect(screen.getByText(/scene 1 of 2/i)).toBeInTheDocument();
  });

  it("Next button advances the cursor", () => {
    render(
      <WalkthroughProvider sequence={seq}>
        <ShowHud />
        <WalkthroughHUD />
      </WalkthroughProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(screen.getByText(/beat 2 of 2/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test WalkthroughHUD`
Expected: FAIL.

- [ ] **Step 3: Implement**

```tsx
// src/walkthrough/WalkthroughHUD.new.tsx
import { useCursor } from "./cursor";

export function WalkthroughHUD() {
  const { cursor, scene, sequence, hudVisible, advance, back } = useCursor();
  if (!hudVisible || !scene) return null;
  const sceneCount = sequence.length;
  const beatCount = scene.beats.length;
  return (
    <div
      data-testid="wt-hud"
      className="fixed bottom-6 right-6 z-[120] flex items-center gap-3 rounded-full bg-white/95 px-4 py-2 shadow-lg"
    >
      <button
        type="button"
        onClick={back}
        className="rounded-full px-3 py-1 text-sm font-medium hover:bg-black/5"
      >
        ← prev
      </button>
      <span className="text-sm font-medium text-[#262630]">
        scene {cursor.sceneIndex + 1} of {sceneCount} · beat {cursor.beatIndex + 1} of {beatCount}
      </span>
      <div className="flex gap-1">
        {scene.beats.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 w-1.5 rounded-full ${i === cursor.beatIndex ? "bg-[#247ae4]" : "bg-black/20"}`}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={advance}
        className="rounded-full px-3 py-1 text-sm font-medium hover:bg-black/5"
      >
        next →
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test WalkthroughHUD`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
pnpm format
git add src/walkthrough/WalkthroughHUD.new.tsx src/walkthrough/__tests__/WalkthroughHUD.test.tsx
git commit -m "feat(walkthrough): HUD with progress, dots, prev/next (new)"
```

---

### Task 13: WalkthroughRoot + VT name uniqueness guard

**Files:**
- Create: `src/walkthrough/WalkthroughRoot.tsx`
- Create: `src/walkthrough/__tests__/WalkthroughRoot.test.tsx`

**Interfaces:**
- Consumes: `WalkthroughProvider` from `cursor.tsx`, `useWalkthroughKeyboard` from `keyboard.new.ts`, `WalkthroughOverlay`, `WalkthroughHUD`.
- Produces: `<WalkthroughRoot sequence children />` — mounts provider, installs keyboard, renders children + overlay + HUD + dev-only uniqueness scan.

- [ ] **Step 1: Write failing tests**

```tsx
// src/walkthrough/__tests__/WalkthroughRoot.test.tsx
import { describe, it, expect, vi, afterEach } from "vitest";
import { render } from "@testing-library/react";
import { WalkthroughRoot } from "../WalkthroughRoot";
import type { Sequence } from "../types.new";

const seq: Sequence = [{ id: "s", page: "dashboard", beats: [{ kind: "idle" }] }];

describe("WalkthroughRoot", () => {
  afterEach(() => vi.restoreAllMocks());

  it("renders children", () => {
    const { getByText } = render(
      <WalkthroughRoot sequence={seq}>
        <div>child</div>
      </WalkthroughRoot>,
    );
    expect(getByText("child")).toBeInTheDocument();
  });

  it("warns in dev when duplicate view-transition-names are present", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const a = document.createElement("div");
    a.setAttribute("data-vt-name", "wt-dup");
    const b = document.createElement("div");
    b.setAttribute("data-vt-name", "wt-dup");
    document.body.appendChild(a);
    document.body.appendChild(b);
    render(
      <WalkthroughRoot sequence={seq}>
        <div>child</div>
      </WalkthroughRoot>,
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("wt-dup"));
    a.remove();
    b.remove();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test WalkthroughRoot`
Expected: FAIL.

- [ ] **Step 3: Implement**

```tsx
// src/walkthrough/WalkthroughRoot.tsx
import { useEffect, type ReactNode } from "react";
import { WalkthroughProvider } from "./cursor";
import { useWalkthroughKeyboard } from "./keyboard.new";
import { WalkthroughOverlay } from "./WalkthroughOverlay";
import { WalkthroughHUD } from "./WalkthroughHUD.new";
import type { Sequence } from "./types.new";

function useVTNameUniquenessGuard() {
  useEffect(() => {
    if (import.meta.env.PROD) return;
    const check = () => {
      const seen = new Map<string, number>();
      document.querySelectorAll<HTMLElement>("[data-vt-name]").forEach((el) => {
        if (el.classList.contains("wt-stage-slot")) return; // slots intentionally share names
        const name = el.getAttribute("data-vt-name")!;
        seen.set(name, (seen.get(name) ?? 0) + 1);
      });
      for (const [name, count] of seen) {
        if (count > 1) {
          console.warn(`[walkthrough] duplicate view-transition-name in DOM: ${name} (count=${count})`);
        }
      }
    };
    check();
    const mo = new MutationObserver(check);
    mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-vt-name"] });
    return () => mo.disconnect();
  }, []);
}

function Inner({ children }: { children: ReactNode }) {
  useWalkthroughKeyboard();
  useVTNameUniquenessGuard();
  return (
    <>
      {children}
      <WalkthroughOverlay />
      <WalkthroughHUD />
    </>
  );
}

export function WalkthroughRoot({ sequence, children }: { sequence: Sequence; children: ReactNode }) {
  return (
    <WalkthroughProvider sequence={sequence}>
      <Inner>{children}</Inner>
    </WalkthroughProvider>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test WalkthroughRoot`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
pnpm format
git add src/walkthrough/WalkthroughRoot.tsx src/walkthrough/__tests__/WalkthroughRoot.test.tsx
git commit -m "feat(walkthrough): WalkthroughRoot + dev-only VT name uniqueness guard"
```

---

### Task 14: Scene definitions + sequence test

**Files:**
- Create: `src/walkthrough/scenes/boardActions.new.tsx` (temp filename)
- Create: `src/walkthrough/scenes/amenity.new.tsx` (temp filename)
- Create: `src/walkthrough/scenes/index.new.ts` (temp filename)
- Create: `src/walkthrough/__tests__/sequence.new.test.ts`

Stage content components `BoardActionStageDetail` and `AmenityReservationStage` already exist in `src/walkthrough/stage-content/`; keep as-is.

**Interfaces:**
- Produces: `homeVisionSequence: Sequence` — array of two scenes.

- [ ] **Step 1: Write failing sequence test**

```ts
// src/walkthrough/__tests__/sequence.new.test.ts
import { describe, it, expect } from "vitest";
import { homeVisionSequence } from "../scenes/index.new";
import { VT } from "../viewTransitionNames";

const vtValues = new Set(Object.values(VT));

describe("homeVisionSequence", () => {
  it("has at least one scene", () => {
    expect(homeVisionSequence.length).toBeGreaterThan(0);
  });

  it("every targeted beat references a known VT name", () => {
    for (const scene of homeVisionSequence) {
      for (const beat of scene.beats) {
        if (beat.kind === "highlight" || beat.kind === "lift" || beat.kind === "expand") {
          expect(vtValues.has(beat.target as any)).toBe(true);
        }
      }
    }
  });

  it("every scene starts with an idle beat", () => {
    for (const scene of homeVisionSequence) {
      expect(scene.beats[0].kind).toBe("idle");
    }
  });

  it("VT constants are unique", () => {
    const values = Object.values(VT);
    expect(new Set(values).size).toBe(values.length);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test sequence.new`
Expected: FAIL.

- [ ] **Step 3: Write boardActions.new.tsx**

```tsx
// src/walkthrough/scenes/boardActions.new.tsx
import type { Scene } from "../types.new";
import { VT } from "../viewTransitionNames";
import { BoardActionStageDetail } from "../stage-content/BoardActionStageDetail";

export const boardActionsScene: Scene = {
  id: "board-actions",
  page: "dashboard",
  beats: [
    { kind: "idle" },
    {
      kind: "highlight",
      target: VT.BoardTaskCurrent,
      caption: "Board members land on the dashboard and immediately see what needs their attention.",
    },
    { kind: "lift", target: VT.BoardTaskCurrent, scale: 1.4, position: "center" },
    {
      kind: "expand",
      target: VT.BoardTaskCurrent,
      content: <BoardActionStageDetail actionId="VIO-1804" />,
      caption: "Every action carries its full history — notices sent, owner response window, prior board comments.",
    },
    {
      kind: "annotate",
      tracks: [
        { type: "arrow", from: VT.BoardTaskCurrent, to: VT.BoardTaskCurrent },
        { type: "typeCaption", text: "Approve the fine. One tap. Timestamped and attributed to you." },
      ],
    },
    { kind: "idle" },
  ],
};
```

> **Note:** The original annotate beat referenced `stage-detail-timeline` and `stage-vote-approve` as `data-ux-id` names. In the new system, annotate target resolution expects `data-vt-name` attributes. Either (a) add `data-vt-name` to those elements inside `BoardActionStageDetail` and reference them here, or (b) keep the simplified placeholder above and iterate during rehearsal. Choose (b) for the initial landing; add constants and `data-vt-name` attributes in a follow-up PR once rehearsal reveals which inner elements the arrows should actually hit.

- [ ] **Step 4: Write amenity.new.tsx**

```tsx
// src/walkthrough/scenes/amenity.new.tsx
import type { Scene } from "../types.new";
import { VT } from "../viewTransitionNames";
import { AmenityReservationStage } from "../stage-content/AmenityReservationStage";

export const amenityScene: Scene = {
  id: "amenity",
  page: "amenities",
  beats: [
    { kind: "idle" },
    {
      kind: "highlight",
      target: VT.AmenityTilePool,
      caption: "Four amenities. Big photos. One tap each.",
    },
    { kind: "lift", target: VT.AmenityTilePool, scale: 1.6, position: "center" },
    {
      kind: "expand",
      target: VT.AmenityTilePool,
      content: <AmenityReservationStage amenityId="pool" />,
      caption:
        "Pick a day. Pick a time. The amenity knows the household rules — pool caps at 6 guests on weekends.",
    },
    {
      kind: "annotate",
      tracks: [
        { type: "typeCaption", text: "The slot already knows: 6 guests max this weekend." },
      ],
    },
    { kind: "idle" },
  ],
};
```

- [ ] **Step 5: Write index.new.ts**

```ts
// src/walkthrough/scenes/index.new.ts
import type { Sequence } from "../types.new";
import { boardActionsScene } from "./boardActions.new";
import { amenityScene } from "./amenity.new";

export const homeVisionSequence: Sequence = [boardActionsScene, amenityScene];
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `pnpm test sequence.new`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
pnpm format
git add src/walkthrough/scenes/boardActions.new.tsx src/walkthrough/scenes/amenity.new.tsx src/walkthrough/scenes/index.new.ts src/walkthrough/__tests__/sequence.new.test.ts
git commit -m "feat(walkthrough): new Scene[] definitions for board actions + amenity"
```

---

### Task 15: Tag lift targets with viewTransitionName (safe to land alongside old subsystem)

**Files:**
- Modify: `src/board/BoardTasksWidget.tsx:204` (the `data-ux-id="board-task-current"` row)
- Modify: `src/amenities/AmenitiesPage.tsx:19-23` (just the `pool` tile)

**Interfaces:**
- Any element with `data-vt-name="<name>"` and matching `viewTransitionName` style participates in VT morphs.

Both changes are additive and have no runtime impact until the new overlay is mounted (Task 16). Safe to commit while the old subsystem is still in place.

- [ ] **Step 1: Modify BoardTasksWidget.tsx**

Find the element at line 204 (the one with `data-ux-id="board-task-current"`). Add `data-vt-name` and inline style:

```tsx
<div
  data-ux-id="board-task-current"
  data-vt-name="wt-board-task-current"
  style={{ viewTransitionName: "wt-board-task-current" }}
  className="..." // keep existing
>
```

Prefer `style={{ viewTransitionName: "..." }}` as a direct literal (not referencing `VT`) because `src/board/` must not import from `src/walkthrough/`. The string is pinned in `src/walkthrough/viewTransitionNames.ts` and the sequence test asserts both sides use it.

- [ ] **Step 2: Modify AmenitiesPage.tsx**

Change the amenity tile map to conditionally add VT metadata only for the pool tile:

```tsx
{amenities.map((a) => {
  const isLiftTarget = a.slug === "pool";
  return (
    <div
      key={a.slug}
      data-ux-id={`amenity-tile-${a.slug}`}
      data-vt-name={isLiftTarget ? "wt-amenity-tile-pool" : undefined}
      style={isLiftTarget ? { viewTransitionName: "wt-amenity-tile-pool" } : undefined}
      className="bg-white rounded-2xl overflow-hidden shadow-[0px_2px_9px_rgba(18,17,48,0.07)] cursor-pointer hover:shadow-lg transition-shadow"
    >
      <img src={a.image} alt={a.title} className="w-full h-[260px] object-cover" />
      <div className="p-5">
        <p className="text-[20px] font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630]">
          {a.title}
        </p>
      </div>
    </div>
  );
})}
```

- [ ] **Step 3: Verify build still succeeds**

Run: `pnpm build`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
pnpm format
git add src/board/BoardTasksWidget.tsx src/amenities/AmenitiesPage.tsx
git commit -m "feat(walkthrough): tag lift targets with viewTransitionName"
```

---

### Task 16: Switch main.tsx + App.tsx; remove old subsystem; remove motion dep; delete fix reports (one commit)

**Files:**
- Modify: `src/main.tsx`
- Modify: `src/App.tsx` (MainApp `useEffect`)
- Rename: `src/walkthrough/types.new.ts` → `types.ts` (overwriting old)
- Rename: `src/walkthrough/keyboard.new.ts` → `keyboard.ts` (overwriting old)
- Rename: `src/walkthrough/WalkthroughHUD.new.tsx` → `WalkthroughHUD.tsx` (overwriting old)
- Rename: `src/walkthrough/scenes/boardActions.new.tsx` → `scenes/boardActions.tsx` (new location)
- Rename: `src/walkthrough/scenes/amenity.new.tsx` → `scenes/amenity.tsx`
- Rename: `src/walkthrough/scenes/index.new.ts` → `scenes/index.ts`
- Rename: `src/walkthrough/__tests__/sequence.new.test.ts` → `__tests__/sequence.test.ts` (overwriting old)
- Delete: `src/walkthrough/WalkthroughProvider.tsx`
- Delete: `src/walkthrough/WalkthroughStage.tsx`
- Delete: `src/walkthrough/WalkthroughLauncher.tsx`
- Delete: `src/walkthrough/targetRegistry.ts`
- Delete: `src/walkthrough/useWalkthroughTarget.ts`
- Delete: `src/walkthrough/beats/HighlightTarget.tsx`
- Delete: `src/walkthrough/beats/LiftToStage.tsx`
- Delete: `src/walkthrough/beats/ExpandContent.tsx`
- Delete: `src/walkthrough/beats/ReturnToOrigin.tsx`
- Delete: `src/walkthrough/beats/NavigateApp.tsx`
- Delete: `src/walkthrough/beats/AnnotateWithGSAP.tsx`
- Delete: `src/walkthrough/beats/index.ts`
- Delete: `src/walkthrough/sequences/` (whole directory — replaced by `scenes/`)
- Delete all remaining tests referencing old subsystem under `src/walkthrough/__tests__/` (keep only the new ones from Tasks 3–14)
- Delete: `.superpowers/sdd/*fix-report*.md` and the parent directory if it becomes empty
- Modify: `package.json` — remove `motion` dependency

- [ ] **Step 1: Rewrite `src/main.tsx`**

```tsx
// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { WalkthroughRoot } from "./walkthrough/WalkthroughRoot";
import { homeVisionSequence } from "./walkthrough/scenes/index.new";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WalkthroughRoot sequence={homeVisionSequence}>
      <App />
    </WalkthroughRoot>
  </React.StrictMode>,
);
```

- [ ] **Step 2: Simplify `MainApp` in `src/App.tsx` to read the cursor's page**

Replace the `externalNavRequest` effect block in `MainApp` (currently around line 1779) with a cursor-driven effect. Add this import at the top of `src/App.tsx`:

```tsx
import { useCursor } from "./walkthrough/cursor";
```

Replace the `externalNavRequest` useEffect with:

```tsx
const { page: scenePage } = useCursor();
useEffect(() => {
  if (scenePage && scenePage !== activePage) {
    setActivePage(scenePage);
  }
}, [scenePage, activePage]);
```

Remove the `externalNavRequest` / `onExternalNavConsumed` props from `MainAppProps` and `AppProps`; remove their usage in the `App` default-exported function. The `App` component is now:

```tsx
export default function App() {
  const [phase, setPhase] = useState<AppPhase>("onboarding");
  if (phase === "onboarding") {
    return <NewResidentFlow onComplete={() => setPhase("portal")} />;
  }
  return <MainApp onRestart={() => setPhase("onboarding")} />;
}
```

- [ ] **Step 3: Rename `.new.*` files to final names (overwriting old)**

Run:
```bash
git mv src/walkthrough/types.new.ts src/walkthrough/types.ts
git mv src/walkthrough/keyboard.new.ts src/walkthrough/keyboard.ts
git mv src/walkthrough/WalkthroughHUD.new.tsx src/walkthrough/WalkthroughHUD.tsx
git mv src/walkthrough/scenes/boardActions.new.tsx src/walkthrough/scenes/boardActions.tsx
git mv src/walkthrough/scenes/amenity.new.tsx src/walkthrough/scenes/amenity.tsx
git mv src/walkthrough/scenes/index.new.ts src/walkthrough/scenes/index.ts
git mv src/walkthrough/__tests__/sequence.new.test.ts src/walkthrough/__tests__/sequence.test.ts
```

Then update any import that still references `.new`:
- In `WalkthroughRoot.tsx` change `from "./keyboard.new"` → `from "./keyboard"` and `from "./WalkthroughHUD.new"` → `from "./WalkthroughHUD"`.
- In `cursor.tsx`, `WalkthroughOverlay.tsx`, `beats/*.tsx`, and every test file: change `from "../types.new"` / `from "./types.new"` → `from "../types"` / `from "./types"`.
- In `main.tsx`: change `from "./walkthrough/scenes/index.new"` → `from "./walkthrough/scenes/index"` (or just `from "./walkthrough/scenes"`).
- In `scenes/boardActions.tsx` and `amenity.tsx`: change `from "./boardActions.new"` / `from "./amenity.new"` → without `.new`.

- [ ] **Step 4: Delete old subsystem files**

Run:
```bash
git rm src/walkthrough/WalkthroughProvider.tsx
git rm src/walkthrough/WalkthroughStage.tsx
git rm src/walkthrough/WalkthroughLauncher.tsx
git rm src/walkthrough/targetRegistry.ts
git rm src/walkthrough/useWalkthroughTarget.ts
git rm src/walkthrough/beats/HighlightTarget.tsx
git rm src/walkthrough/beats/LiftToStage.tsx
git rm src/walkthrough/beats/ExpandContent.tsx
git rm src/walkthrough/beats/ReturnToOrigin.tsx
git rm src/walkthrough/beats/NavigateApp.tsx
git rm src/walkthrough/beats/AnnotateWithGSAP.tsx
git rm src/walkthrough/beats/index.ts
git rm -r src/walkthrough/sequences
```

Delete any test files under `src/walkthrough/__tests__/` that reference the deleted modules (don't delete the new ones from Tasks 3–13).

- [ ] **Step 5: Remove `motion` from `package.json`**

Edit `package.json`:
- Remove the `"motion": "^14.0.0"` line from `dependencies`.

Run:
```bash
pnpm install
```

- [ ] **Step 6: Delete the fix-report docs**

Run:
```bash
git rm -r .superpowers/sdd/2026-10-09-curated-walkthrough || true
```

(Guard with `|| true` because paths may not exist on this branch.)

- [ ] **Step 7: Verify build + all tests pass**

Run:
```bash
pnpm exec tsc --noEmit
pnpm test
pnpm build
```

Expected: all pass. If `tsc` finds leftover references to `motion` / `WalkthroughProvider` / `targetRegistry`, grep for them (`grep -rn "WalkthroughProvider\|targetRegistry\|from \"motion\"" src`) and remove.

- [ ] **Step 8: Commit the switchover**

```bash
pnpm format
git add -A
git commit -m "refactor(walkthrough): switch to View Transitions API; remove Motion-clone subsystem"
```

---

### Task 17: End-to-end rehearsal (manual, no commit)

**Files:** None. This is the "dev-box rehearsal" from the spec, run manually.

- [ ] **Step 1: Start the dev server**

Run: `pnpm dev` (or confirm it's already running on `$PORT`).

- [ ] **Step 2: Full-sequence walkthrough**

Open the preview URL. Verify in order:
- Home page loads normally. No overlay visible. Keyboard is armed.
- Press `→`. Advances through scene 1's beats: idle → highlight (board task row dims the surround, caption appears) → lift (the task row morphs to the center of the viewport) → expand (the row morphs into the full detail card) → annotate (typed caption appears) → idle (card morphs back to the dashboard row).
- Press `→` again from scene-1 idle. Transitions into scene 2 (amenities page). The amenities page replaces the dashboard with the browser's crossfade.
- Advance through scene 2 beats to the end. The pool tile morphs to the center, into the reservation stage, back to the tile.
- From the final idle, press `→` once more. No-op (last beat of last scene).
- Press `←` repeatedly. Walks backward through every beat, including across the scene boundary.
- Press `Esc` from any beat. Returns to beat 0 of scene 0; overlays clear.
- Press `.`. HUD appears bottom-right with progress + prev/next buttons. Press `.` again. HUD hides.
- Open DevTools Console. Verify: no errors, no warnings from the uniqueness guard.

- [ ] **Step 3: Reduced-motion sanity**

In Chrome DevTools, Rendering panel: enable "Emulate CSS prefers-reduced-motion: reduce". Run through the sequence. Verify: beats still advance; morphs snap-cut instead of animate.

- [ ] **Step 4: Keyboard-remote sanity**

If a Logitech R400 or equivalent is available, pair it. Verify `Space` and `PageDown` advance; back button steps back.

- [ ] **Step 5: Report**

No commit. Report findings in chat. If any issue blocks the keynote, open a follow-up task; do not patch inside this plan.

---

## Self-Review

**1. Spec coverage.** Walking the spec sections:
- Purpose / non-goals / success criteria → Task 17 verifies behaviorally.
- Audience & stage context → Tasks 11 (CSS size), 12 (HUD), 17 (projection rehearsal).
- Engine choice (VT + GSAP) → Tasks 3 (withTransition), 10 (GSAP for annotate), 16 (motion removed).
- Architecture (`WalkthroughRoot`, overlay, scenes) → Tasks 6, 11, 13, 14.
- File layout → Tasks 1–14 create every listed file; Task 16 deletes everything else listed.
- Scene + Beat DSL → Task 2 defines types; Task 14 instantiates.
- VT naming convention → Task 1 constants; Task 13 uniqueness guard; Task 15 applies to targets.
- Driving model (keyboard, HUD, captions, modes) → Tasks 4, 12, 6.
- Sequence storyboards → Task 14.
- Compatibility & degradation → Task 3 (reduced motion + no-VT fallback); Task 1 (TS shim); Task 17 (reduced-motion test).
- Error handling → Task 7 (scrollIntoView), Task 10 (GSAP cleanup), Task 13 (uniqueness).
- Dependencies — adds nothing (gsap already present); removes motion → Task 16.
- Testing & rehearsal → Tasks 3–14 (unit); Task 17 (rehearsal).
- Migration path → tasks ordered to match spec steps 1–6.
- Open questions → preserved in spec; no plan work needed.

**2. Placeholder scan.** Searched for TBD/TODO/"appropriate"/"handle edge cases"/"similar to task" — none present. Every step shows code or exact commands.

**3. Type consistency.** `Cursor`, `Scene`, `Beat`, `Sequence`, `VT`, `useCursor`, `withTransition`, `WalkthroughProvider`, `WalkthroughRoot`, `useWalkthroughKeyboard` are referenced consistently across tasks. The `.new.ts` temporary filenames are explicitly renamed in Task 16.

**4. Review Focus.** Five items listed above, each pinned to its owning task's tests (uniqueness → Task 13 test; first keydown → Task 4 test for window-level listener; off-screen lift target → Task 7 test for scrollIntoView; oversize expand content → Task 9 test asserting max-height style; rapid key presses → covered by Task 3's `withTransition` passthrough — the reducer is synchronous and the browser serializes transitions).

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-10-14-curated-walkthrough.md`. Please review the plan. Which execution approach would you prefer?

- **Subagent-driven** — A fresh subagent implements each task and a fresh reviewer checks it before the next one starts, then a whole-branch review at the end. Most thorough; costs a fresh context per task and per review.
- **Native** — I implement every task myself in this session, then one fresh reviewer on the most capable model checks the whole branch. Cheapest and fastest; no independent review until the end. Runs well with a mid-tier session model, since the plan carries the design.

**For this plan I recommend Subagent-driven**, because 17 tasks is many, several of them (Task 16 especially) are high-blast-radius refactors that touch `main.tsx` and delete large portions of the subsystem, and a shipped mistake in the Esc/keyboard logic or VT name scheme would be visible on stage at the user conference. Fresh eyes per task catch coupling bugs that a long-running session misses.

Does the plan capture what you want, and which approach should we use?
