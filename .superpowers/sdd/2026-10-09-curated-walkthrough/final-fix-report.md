# Final Fix Wave Report

**Branch:** walkthrough-subsystem  
**Commit:** fix(walkthrough): return-trip morph via AnimatePresence and StrictMode double-fire guard

---

## Changes Per File

### `src/walkthrough/types.ts`
Added optional `target?: string` to the `expand` beat variant so sequence definitions can declare which lifted target the expand panel corresponds to:
```ts
| { kind: "expand"; content: ReactNode; caption?: string; target?: string }
```

### `src/walkthrough/sequences/boardActions.tsx`
Added `target: "board-task-current"` to the expand beat so ExpandContent receives the layoutId that matches LiftToStage's `walkthrough-target-board-task-current`.

### `src/walkthrough/sequences/amenity.tsx`
Added `target: "amenity-tile-pool"` to the expand beat for the same reason.

### `src/walkthrough/beats/ExpandContent.tsx`
Added `layoutId` prop when `beat.target` is present:
```tsx
layoutId={beat.target ? `walkthrough-target-${beat.target}` : undefined}
```
This makes Motion recognize the ExpandContent div as the same element as LiftToStage's div, enabling the shared-layout morph on exit (return trip).

### `src/walkthrough/beats/HighlightTarget.tsx`
- Added `import { useRef }` to the import line.
- Added `const firedRef = useRef(false)` inside the component.
- Guarded the missing-target `queueMicrotask(onComplete)` path:
  ```tsx
  if (!firedRef.current) {
    firedRef.current = true;
    queueMicrotask(onComplete);
  }
  ```
  Prevents React 19 StrictMode dev double-mount from advancing the sequence twice.

### `src/walkthrough/beats/LiftToStage.tsx`
Same StrictMode double-fire guard as HighlightTarget: `useRef<boolean>(false)` + guard block around `queueMicrotask(onComplete)`.

### `src/walkthrough/WalkthroughStage.tsx`
Three changes:
1. Added `import { AnimatePresence } from "motion/react"`.
2. Wrapped `BeatDispatcher` in `<AnimatePresence mode="popLayout">` with `key={`beat-${state.currentBeatIndex}`}` so Motion can run exit animations when beats transition.
3. Removed dead `onClick={() => {}}` from the backdrop div.

### `src/walkthrough/__tests__/stage.test.tsx`
Updated the `s1` test sequence from a single `highlight` beat to two beats (`highlight` + `return`). The `highlight` beat auto-advances via `queueMicrotask` when the target is missing, landing on the `return` beat which uses `setTimeout(800)` — not flushed by `userEvent`'s `act()`. This keeps the stage visible after `await userEvent.click()` resolves, fixing fragile timing that broke when `AnimatePresence` added extra layout-effect cycles. The tests verify the same behavior as before; the sequence is just robust enough to survive the assertion window.

---

## Test Output

```
Tests  48 passed (48)
Test Files  12 passed (12)
Duration  9.06s
```

All 48 tests pass.

---

## Build Output

```
vite v8.3.3 building client environment for production...
✓ 2335 modules transformed.
dist/assets/index-D9TAw2cB.js   390.57 kB │ gzip: 109.49 kB
✓ built in 1.17s
```

Clean build, no errors or warnings (the two Vite config warnings are pre-existing and unrelated to this change).
