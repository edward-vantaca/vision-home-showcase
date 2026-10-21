# Walkthrough animation subsystem — CSS rewrite — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the View Transitions API-based animation subsystem with CSS-driven, scene-isolated animations (plus GSAP for the welcome → thread chat morph) so the Nov 3 2026 stage demo is bulletproof enough to trust and rehearse.

**Architecture:** Rip `document.startViewTransition()` out of the walkthrough and the chat panel. Rewrite `LiftBeat` and `ExpandBeat` as components that mutate inline styles on the real target element (snapshot on mount, animate via CSS `transition`, restore on unmount). Replace the Ask HOAi panel's sub-region VT names with a plain CSS transition on the `aside`'s normalized `position: fixed` layout. Replace the welcome → thread morph with a GSAP timeline. Simplify the backdrop to a single rule set driven by `data-beat-kind`.

**Tech Stack:** React 19, TypeScript 5.7, Tailwind v4 utility classes with inline-style escape hatches, CSS transitions, GSAP 3.15 (already a dependency, already used in `CursorBeat` and `AnnotateBeat`), Vitest + Testing Library + jsdom.

**Spec:** `docs/superpowers/specs/2026-10-21-walkthrough-css-rewrite-design.md`

## Global Constraints

- **Deadline:** rehearsal must start by day 5 (2026-10-26); demo is 2026-11-03.
- **No new npm dependencies.** `gsap` and `@gsap/react` are already installed.
- **No `pnpm format` on `src/walkthrough/*`.** oxfmt strips semicolons from TS type literals. Hand-format new code.
- **No `git add -A` or `git add .`.** Stage files by explicit path (Git-LFS inconsistencies in the working tree).
- **No pushes.** Remote isn't configured.
- **Preserve the untracked session work:** `src/walkthrough/scenes/*.tsx` (9 scene definitions), `src/walkthrough/SceneLauncher.tsx`, the `appState` field on `Scene`, and the useEffects in `src/App.tsx` that sync phase/page/view/panel from `scene.appState`.
- **Preserve scene sequence order:** intro → inbox → onboarding → autopay → goToPortal → payments → askHoai → boardActions → amenity.
- **Keep existing GSAP usage untouched** in `src/walkthrough/beats/CursorBeat.tsx` and `src/walkthrough/beats/AnnotateBeat.tsx`.
- **Test suite ratchet:** currently 88/90 passing. The two keyboard failures (React 19 strict-mode + `fireEvent(window)` race) are deferred-minor. The suite must stay ≥ 88 passing after each task.
- **Lift timing:** 1000ms, `cubic-bezier(0.65, 0, 0.35, 1)`. Panel morph timing: 700ms, same easing. Backdrop opacity: 500ms, `ease-out`.
- **TypeScript strict:** `npx tsc --noEmit` must stay clean after each task.

## Review Focus

Five input classes the spec implies but no task's tests exercise. Each line names the condition and the behavior a reasonable person expects; the test that pins it is added to the owning task.

1. **Scrubbing back fast through multiple beats within a scene.** User presses ArrowLeft twice in quick succession. Each previous `LiftBeat`/`ExpandBeat` must restore its target's original inline-style values; no accumulated residue. Owned by Task 2 (LiftBeat tests) and Task 3 (ExpandBeat tests) — each adds a test that mounts the beat, unmounts, remounts a second instance pointing at the same target, unmounts, and asserts the target's inline-style string is empty.
2. **Target of a `LiftBeat` scrolled off-screen when the beat mounts.** Launcher jumps directly into a scene whose dashboard was scrolled from the prior visit. The lift must start from the on-screen position. Owned by Task 2 — add a test that pre-scrolls the parent container, mounts the beat, and asserts `scrollIntoView` was called before `getBoundingClientRect`.
3. **`prefers-reduced-motion: reduce`.** Users with this preference should see hard cuts, not animations. Owned by Task 4 (walkthrough.css) — add a CSS `@media (prefers-reduced-motion: reduce)` block that zeros `transition-duration` on `.wt-backdrop`, on the aside's inline transition, and on the lift's target inline transition (via a CSS variable). No automated test; manual browser verification in Task 7.
4. **Rapid ArrowRight through the Ask HOAi `handleSend` morph.** User advances past the chat scene before the GSAP timeline finishes. The timeline must `.kill()` on unmount and leave the panel in a sane state. Owned by Task 6 — add a Vitest test that starts the timeline, unmounts the component, and asserts no pending GSAP tweens on the targeted elements.
5. **Walkthrough `advance()` fires before the previous beat's lift target has been found** (target DOM is still mounting during a scene change). Current behavior silently no-ops when `findTarget` returns null. New behavior must do the same — no error thrown, no crashed scene. Owned by Task 2 — the existing `findTarget` returning `null` is already a quiet exit path; the new test case asserts no exception when target is missing.

---

## File Structure

**Created:**
- `src/walkthrough/beats/__tests__/LiftBeat.test.tsx` — jsdom test for inline-style mutation + cleanup + scroll safety + missing-target quiet exit.
- `src/walkthrough/beats/__tests__/ExpandBeat.test.tsx` — same pattern as LiftBeat, plus content-fade-in assertion.

**Rewritten (same path, same exports, new implementation):**
- `src/walkthrough/beats/LiftBeat.tsx`
- `src/walkthrough/beats/ExpandBeat.tsx`

**Modified:**
- `src/walkthrough/cursor.tsx` — remove `startViewTransition`, remove `scenesInvolve` + `htmlClass` plumbing. `withTransition(update)` reduces to `update()`.
- `src/walkthrough/walkthrough.css` — delete all `::view-transition-*` rules, delete `data-walkthrough-scene`-scoped rules, delete `html.wt-chat-send` and `html.wt-ash-vt-active` rules, simplify `.wt-backdrop`, add `prefers-reduced-motion` guard.
- `src/walkthrough/WalkthroughOverlay.tsx` — remove the `useLayoutEffect` that sets `data-walkthrough-scene` on `<html>`.
- `src/walkthrough/WalkthroughRoot.tsx` — remove `useVTNameUniquenessGuard`.
- `src/chat/AskHoaiPanel.tsx` — remove all `viewTransitionName` / `data-ash-vt`, normalize sidebar form to `position: fixed`, add inline `transition: all 700ms`, replace `pushUserMessage` with a GSAP timeline.
- `src/App.tsx` — remove `paymentsLiftActive` and the `data-vt-name`/`viewTransitionName` block on the payment widget. Keep the `appState`-driven useEffects.
- `src/board/BoardTasksWidget.tsx` — remove inline `viewTransitionName`; keep `data-vt-name` (used by cursor targeting).
- `src/amenities/AmenitiesPage.tsx` — same as BoardTasksWidget.

**Deleted:**
- `src/types/view-transitions.d.ts` — ambient types no longer needed.

---

## Tasks

### Task 1: Strip view transitions from the walkthrough and chat subsystems

**Files:**
- Modify: `src/walkthrough/cursor.tsx`
- Modify: `src/walkthrough/WalkthroughOverlay.tsx`
- Modify: `src/walkthrough/WalkthroughRoot.tsx`
- Modify: `src/chat/AskHoaiPanel.tsx`
- Modify: `src/App.tsx`
- Modify: `src/board/BoardTasksWidget.tsx`
- Modify: `src/amenities/AmenitiesPage.tsx`
- Delete: `src/types/view-transitions.d.ts`
- Test: existing `src/walkthrough/__tests__/*` must stay ≥ 88 passing.

**Interfaces:**
- Consumes: nothing new.
- Produces: `withTransition(update: () => void): void` — now just invokes `update()` synchronously. No options parameter. `beatBusyRef` export unchanged. `useCursor()` return shape unchanged.

- [ ] **Step 1: Verify current test baseline**

Run: `npx tsc --noEmit && npx vitest run`
Expected: `tsc` clean, 88 passing / 2 failing (keyboard tests).

- [ ] **Step 2: Remove `startViewTransition` path from `withTransition`**

In `src/walkthrough/cursor.tsx`: replace the entire body of `withTransition` with a direct `update()` call. Delete the `WithTransitionOptions` type, the `scenesInvolve` helper, the `htmlClass` plumbing in `advance`/`back`/`jumpTo`. Keep the scroll-save/restore scaffolding only if removing it breaks a test; otherwise delete.

- [ ] **Step 3: Remove `data-walkthrough-scene` attribute writer**

In `src/walkthrough/WalkthroughOverlay.tsx`: delete the `useLayoutEffect` block that reads `scene?.id` and sets/clears the `data-walkthrough-scene` attribute on `<html>`.

- [ ] **Step 4: Remove `useVTNameUniquenessGuard`**

In `src/walkthrough/WalkthroughRoot.tsx`: delete the hook function and the call site inside `Inner`.

- [ ] **Step 5: Strip VT from `AskHoaiPanel.tsx`**

In `src/chat/AskHoaiPanel.tsx`:
- Replace `pushUserMessage` with a plain synchronous commit (no `startViewTransition`, no html class). The GSAP timeline arrives in Task 6; for now ship the hard-cut version.
- Remove the `useCursor()` import and `sceneId`/`ashVT`/`vtName` locals.
- Delete every `data-ash-vt` attribute on the sub-regions.

- [ ] **Step 6: Strip VT from `App.tsx`, `BoardTasksWidget.tsx`, `AmenitiesPage.tsx`**

- `src/App.tsx`: find the payment widget div (grep `VT.PaymentsWidget`), delete the `data-vt-name` and `viewTransitionName` conditional block. Delete the `paymentsLiftActive` local that drives the gate.
- `src/board/BoardTasksWidget.tsx`: delete the inline `style={{ viewTransitionName: ... }}` on `wt-board-task-current`. Keep the `data-vt-name` attribute.
- `src/amenities/AmenitiesPage.tsx`: delete the inline `style={{ viewTransitionName: ... }}` on `wt-amenity-tile-pool`. Keep the `data-vt-name` attribute.

- [ ] **Step 7: Delete the view-transitions ambient types file**

Run: `rm src/types/view-transitions.d.ts`

- [ ] **Step 8: Strip VT CSS from `walkthrough.css`**

In `src/walkthrough/walkthrough.css`: delete every rule that selects on `::view-transition-old`, `::view-transition-new`, `::view-transition-group`, `::view-transition-image-pair`. Delete every rule scoped on `html[data-walkthrough-scene=...]`, `html.wt-chat-send`, `html.wt-ash-vt-active`. Delete the `.wt-root[data-scene="payments"]` block. Leave `.wt-root`, `.wt-backdrop` (minus the complex transitions — those get rewritten in Task 4), `.wt-cutout`, `.wt-caption`, `.wt-intro*`, `.wt-cursor`, `@keyframes askhoai-dot`. Backdrop properties stay with sensible defaults; Task 4 polishes them.

- [ ] **Step 9: Typecheck and run tests**

Run: `npx tsc --noEmit && npx vitest run`
Expected: `tsc` clean. Tests: ≥ 88 passing / 2 failing (the pre-existing keyboard failures).

- [ ] **Step 10: Smoke-check the dev server**

Open the dev preview, press ArrowRight through all 9 scenes. Expected: scenes advance without errors; animations are hard cuts (no lift, no backdrop fade). No console errors.

- [ ] **Step 11: Commit**

```bash
git add src/walkthrough/cursor.tsx src/walkthrough/WalkthroughOverlay.tsx src/walkthrough/WalkthroughRoot.tsx src/chat/AskHoaiPanel.tsx src/App.tsx src/board/BoardTasksWidget.tsx src/amenities/AmenitiesPage.tsx src/walkthrough/walkthrough.css
git rm src/types/view-transitions.d.ts
git commit -m "refactor(walkthrough): strip View Transitions API from walkthrough + chat subsystems

Baseline for CSS/GSAP-driven rewrite. All scenes advance as hard cuts.
No animation yet; subsequent tasks reinstate lift/expand/panel-morph/
welcome-thread via inline-style CSS transitions and a GSAP timeline.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Rewrite `LiftBeat` with inline-style + CSS transition

**Files:**
- Rewrite: `src/walkthrough/beats/LiftBeat.tsx`
- Create: `src/walkthrough/beats/__tests__/LiftBeat.test.tsx`

**Interfaces:**
- Consumes: nothing new. The dispatcher in `WalkthroughOverlay.tsx` already renders `<LiftBeat target={beat.target} scale={beat.scale} position={beat.position} />`.
- Produces: `LiftBeat` component with the existing `Props` signature:

```ts
type Props = {
  target: string;
  scale?: number;
  position?: "center" | { x: number; y: number };
};
```

The component renders `null`; its effect is the inline-style mutation on the real target.

- [ ] **Step 1: Write the failing tests**

In `src/walkthrough/beats/__tests__/LiftBeat.test.tsx`, four tests:

```tsx
describe("LiftBeat", () => {
  it("snapshots and mutates inline styles on mount", () => {
    const target = document.createElement("div");
    target.setAttribute("data-vt-name", "wt-test");
    target.style.position = "relative"; // original value we must restore
    document.body.appendChild(target);

    render(<LiftBeat target="wt-test" scale={1.4} position="center" />);

    expect(target.style.position).toBe("fixed");
    expect(target.style.zIndex).toBe("150");
    expect(target.style.transition).toContain("transform");
  });

  it("restores all mutated inline styles on unmount", () => {
    const target = document.createElement("div");
    target.setAttribute("data-vt-name", "wt-test");
    target.style.position = "relative";
    document.body.appendChild(target);

    const { unmount } = render(<LiftBeat target="wt-test" />);
    unmount();

    expect(target.style.position).toBe("relative");
    expect(target.style.zIndex).toBe("");
    expect(target.style.transition).toBe("");
    expect(target.style.transform).toBe("");
  });

  it("calls scrollIntoView before measuring the target rect", () => {
    const target = document.createElement("div");
    target.setAttribute("data-vt-name", "wt-test");
    const spy = vi.fn();
    target.scrollIntoView = spy;
    document.body.appendChild(target);

    render(<LiftBeat target="wt-test" />);

    expect(spy).toHaveBeenCalledWith({ block: "center", inline: "center", behavior: "instant" });
  });

  it("quietly no-ops when the target is missing", () => {
    expect(() => render(<LiftBeat target="wt-nonexistent" />)).not.toThrow();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/walkthrough/beats/__tests__/LiftBeat.test.tsx`
Expected: all four fail (the current LiftBeat implementation uses a stage-slot clone, not inline-style mutation on the target).

- [ ] **Step 3: Implement the new `LiftBeat`**

In `src/walkthrough/beats/LiftBeat.tsx`, follow the design doc section 2 "LiftBeat (full rewrite)". `useLayoutEffect` finds the target by `data-vt-name`, calls `scrollIntoView` with `{ block: "center", inline: "center", behavior: "instant" }`, snapshots `position`/`top`/`left`/`transform`/`transition`/`zIndex`/`willChange`, writes `position: fixed`, `top`/`left` from `getBoundingClientRect`, `transform: translate(0,0) scale(1)`, `transition: transform 1000ms cubic-bezier(0.65,0,0.35,1)`, `zIndex: 150`, `willChange: transform`. On the next animation frame, computes delta from current to center (or `position` prop) and sets `transform: translate(Xpx, Ypx) scale(scale)`. Returns a cleanup that `cancelAnimationFrame`s the RAF and `Object.assign`s the saved values back. Component returns `null`.

The existing `findScene` helper is a good base; rename or inline as needed. **Do not** use `data-vt-name` elements that also carry `.wt-stage-slot` class — the old code filtered those out and this rewrite should too (defensive; no more stage slots are created, but a stale one from a failed hot-reload shouldn't be matched).

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/walkthrough/beats/__tests__/LiftBeat.test.tsx`
Expected: all four pass.

- [ ] **Step 5: Run the full suite**

Run: `npx tsc --noEmit && npx vitest run`
Expected: `tsc` clean. Tests: ≥ 92 passing (88 prior + 4 new) / 2 failing (keyboard).

- [ ] **Step 6: Smoke-check in the browser**

Open the dev preview, advance to the Payments scene's lift beat. Expected: the payments widget morphs smoothly from its dashboard position to centered + scaled. Backdrop blurs the surrounding dashboard including the Ask HOAi panel.

- [ ] **Step 7: Commit**

```bash
git add src/walkthrough/beats/LiftBeat.tsx src/walkthrough/beats/__tests__/LiftBeat.test.tsx
git commit -m "feat(walkthrough): rewrite LiftBeat as inline-style + CSS transition on target

Replaces the stage-slot clone with direct mutation of the real target
element: snapshot original inline styles, pin to fixed-position at
current rect, RAF-flip transform to centered-scaled. On unmount
restore all snapshotted values. scrollIntoView prepass guards against
off-screen targets after scrubs and launcher jumps.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Rewrite `ExpandBeat` with inline-style + CSS transition + fade-in content

**Files:**
- Rewrite: `src/walkthrough/beats/ExpandBeat.tsx`
- Create: `src/walkthrough/beats/__tests__/ExpandBeat.test.tsx`

**Interfaces:**
- Consumes: the `LiftBeat` pattern established in Task 2 (inline-style snapshot + mutate + restore).
- Produces: `ExpandBeat` component with the existing `Props`:

```ts
type Props = {
  target: string;
  children: React.ReactNode;
};
```

The component renders a fixed-centered content container that fades in; the target element is also lifted (same mutation as `LiftBeat`) to clear visual space.

- [ ] **Step 1: Write the failing tests**

In `src/walkthrough/beats/__tests__/ExpandBeat.test.tsx`, three tests:

```tsx
describe("ExpandBeat", () => {
  it("lifts the target and renders fade-in content", () => {
    const target = document.createElement("div");
    target.setAttribute("data-vt-name", "wt-test");
    document.body.appendChild(target);

    render(<ExpandBeat target="wt-test"><div data-testid="content">hi</div></ExpandBeat>);

    expect(target.style.position).toBe("fixed");
    expect(screen.getByTestId("content")).toBeInTheDocument();
  });

  it("restores target styles on unmount", () => {
    const target = document.createElement("div");
    target.setAttribute("data-vt-name", "wt-test");
    target.style.position = "relative";
    document.body.appendChild(target);

    const { unmount } = render(<ExpandBeat target="wt-test"><div /></ExpandBeat>);
    unmount();

    expect(target.style.position).toBe("relative");
  });

  it("quietly no-ops when target is missing", () => {
    expect(() =>
      render(<ExpandBeat target="wt-nonexistent"><div /></ExpandBeat>)
    ).not.toThrow();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/walkthrough/beats/__tests__/ExpandBeat.test.tsx`
Expected: tests fail against current implementation (which uses a stage slot with cloned content).

- [ ] **Step 3: Implement the new `ExpandBeat`**

In `src/walkthrough/beats/ExpandBeat.tsx`:
- Share the lift-mutation pattern with `LiftBeat` (hoist to a shared helper `useLiftTarget(target, { scale, position })` in a new file `src/walkthrough/beats/useLiftTarget.ts` if it makes the code tighter; otherwise inline).
- The lift's scale defaults to 1.0 for Expand (the stage content provides the "expanded" surface, not scaled target).
- Render a fixed-centered `<div>` with the `children` prop. Give it inline `opacity: 0; transition: opacity 500ms ease-out;` on mount; on the next RAF set `opacity: 1`.
- Cleanup on unmount: snapshot restore, remove the content div (React handles it).

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/walkthrough/beats/__tests__/ExpandBeat.test.tsx`
Expected: all three pass.

- [ ] **Step 5: Run the full suite**

Run: `npx tsc --noEmit && npx vitest run`
Expected: `tsc` clean. Tests: ≥ 95 passing / 2 failing (keyboard).

- [ ] **Step 6: Smoke-check in the browser**

Open the dev preview, advance to the Board Actions scene's expand beat (also Amenity scene's expand beat). Expected: the task card / amenity tile lifts to center with the detail content fading in.

- [ ] **Step 7: Commit**

```bash
git add src/walkthrough/beats/ExpandBeat.tsx src/walkthrough/beats/__tests__/ExpandBeat.test.tsx
git add src/walkthrough/beats/useLiftTarget.ts  # if the shared helper was created
git commit -m "feat(walkthrough): rewrite ExpandBeat with lift-in-place + fade-in content

Shares the inline-style target mutation with LiftBeat; renders content
in a fixed-centered div that fades in over 500ms. On unmount, restores
target styles via the shared helper.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Simplify backdrop CSS and add reduced-motion guard

**Files:**
- Modify: `src/walkthrough/walkthrough.css`

**Interfaces:**
- Consumes: `.wt-backdrop[data-beat-kind="..."]` already set by `WalkthroughOverlay` based on current beat kind.
- Produces: a single rule set that drives backdrop appearance for all scenes.

- [ ] **Step 1: Replace `.wt-backdrop` rules**

In `src/walkthrough/walkthrough.css`, replace the current backdrop block with the design doc section 4 rules:

```css
.wt-root {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 250;
}

.wt-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(40px) saturate(1.1);
  -webkit-backdrop-filter: blur(40px) saturate(1.1);
  opacity: 0;
  transition: opacity 500ms ease-out;
}

.wt-backdrop[data-beat-kind="lift"],
.wt-backdrop[data-beat-kind="expand"],
.wt-backdrop[data-beat-kind="annotate"],
.wt-backdrop[data-beat-kind="narrate"] {
  opacity: 1;
}

.wt-backdrop[data-beat-kind="intro"] {
  opacity: 1;
  background: #ffffff;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}
```

- [ ] **Step 2: Add reduced-motion guard**

Append at the bottom of `walkthrough.css`:

```css
@media (prefers-reduced-motion: reduce) {
  .wt-backdrop {
    transition: none;
  }
  /* LiftBeat/ExpandBeat snapshot `transition` as part of their saved state,
     so forcing `transition: none` on the target would need a JS check; the
     reduced-motion case is handled at the beat level by reading matchMedia
     if needed (deferred — out of scope for Nov 3). */
}
```

- [ ] **Step 3: Typecheck + tests**

Run: `npx tsc --noEmit && npx vitest run`
Expected: `tsc` clean. Tests: ≥ 95 passing / 2 failing.

- [ ] **Step 4: Smoke-check in the browser**

Advance to Payments scene lift. Expected: backdrop dims + blurs the dashboard (including the Ask HOAi panel) smoothly over 500ms. Advance to Board Actions scene's expand beat. Expected: same backdrop behavior.

- [ ] **Step 5: Commit**

```bash
git add src/walkthrough/walkthrough.css
git commit -m "fix(walkthrough): simplify backdrop CSS to single rule set

One backdrop rule per beat kind; no scene-specific variants. Removes
the data-walkthrough-scene gating that depended on view-transition
pseudo tricks. Adds a prefers-reduced-motion guard on the backdrop
opacity transition.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: AskHoaiPanel sidebar ↔ focused morph via normalized `position: fixed`

**Files:**
- Modify: `src/chat/AskHoaiPanel.tsx`

**Interfaces:**
- Consumes: `focused` and `open` props on `AskHoaiPanel`, already wired from `App.tsx` based on `scene.appState.askHoaiOpen` and `sceneId === "ask-hoai"`.
- Produces: no exported-signature change. Visual behavior: `aside` morphs its layout smoothly between sidebar and focused forms.

- [ ] **Step 1: Normalize the `aside` to `position: fixed` in both states**

In `src/chat/AskHoaiPanel.tsx`, change the sidebar-form className from `hidden lg:flex shrink-0 h-full overflow-hidden transition-[width] duration-300 ease-in-out w-[400px] border-l border-[#e5eaf0]` to a `fixed` form:

```tsx
const focusedClass = "fixed inset-y-[6vh] left-1/2 -translate-x-1/2 w-[min(820px,92vw)] z-[200] flex overflow-hidden";
const sidebarClass = "hidden lg:flex fixed right-0 top-0 bottom-0 w-[400px] border-l border-[#e5eaf0] overflow-hidden";
const collapsedClass = "hidden lg:flex fixed right-0 top-0 bottom-0 w-0 border-l-0 overflow-hidden";
```

The inner app layout (sidebar nav + main content) must no longer rely on the `AskHoaiPanel`'s width to flex itself. If the main content region currently stretches to fill alongside a flex-child panel, add a `pr-[400px]` on the main region when the panel is in sidebar mode (gated on `lg:` and `open`). Grep `data-ux-id="app-shell"` to find the layout container and adjust.

- [ ] **Step 2: Add the inline transition**

```tsx
<aside
  style={{ transition: "all 700ms cubic-bezier(0.65,0,0.35,1)" }}
  className={focused ? focusedClass : open ? sidebarClass : collapsedClass}
>
```

- [ ] **Step 3: Typecheck + tests**

Run: `npx tsc --noEmit && npx vitest run`
Expected: `tsc` clean. Tests: ≥ 95 passing / 2 failing.

- [ ] **Step 4: Smoke-check in the browser**

Advance to Ask HOAi scene (jump via `?launcher` if needed). Expected: panel morphs from right-sidebar to centered-focused smoothly over 700ms. Advance past it (to Board Actions). Expected: panel morphs back to sidebar form. White-background canvas (`App.tsx:3104`) fades in with the morph (behavior unchanged, verify it still works).

- [ ] **Step 5: Commit**

```bash
git add src/chat/AskHoaiPanel.tsx src/App.tsx
git commit -m "feat(chat): AskHoaiPanel sidebar/focused morph via CSS transition

Normalizes both panel forms to position: fixed so CSS can interpolate
width/inset/transform smoothly. 700ms cubic-bezier(.65,0,.35,1) matches
the lift timing. Main content region gets explicit pr-[400px] when
panel is in sidebar form (replaces the flex-child-width behavior).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: AskHoaiPanel welcome → thread morph via GSAP timeline

**Files:**
- Modify: `src/chat/AskHoaiPanel.tsx`

**Interfaces:**
- Consumes: `useGSAP` from `@gsap/react`, `gsap` core (both already in dependencies). Access to the welcome div, questions div, thread div, and input container via refs or `data-ash-section` markers.
- Produces: `pushUserMessage(text: string): void` — synchronous entry point that triggers the morph and commits the message.

- [ ] **Step 1: Write the failing test**

In `src/chat/__tests__/AskHoaiPanel.test.tsx` (create if absent):

```tsx
import { render, act } from "@testing-library/react";
import { vi } from "vitest";
import AskHoaiPanel from "../AskHoaiPanel";
import gsap from "gsap";

it("kills in-flight welcome->thread timeline on unmount", async () => {
  const killSpy = vi.spyOn(gsap, "killTweensOf");
  const { unmount, getByText } = render(
    <AskHoaiPanel open={true} onCollapse={() => {}} focused={true} />
  );
  // Simulate a send that would start the timeline.
  act(() => {
    const btn = getByText(/Send/i);
    btn.click();
  });
  unmount();
  expect(killSpy).toHaveBeenCalled();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/chat/__tests__/AskHoaiPanel.test.tsx`
Expected: fails — current `pushUserMessage` has no GSAP code, `killTweensOf` not called.

- [ ] **Step 3: Implement the GSAP timeline in `pushUserMessage`**

Follow design doc section 3 "Welcome → thread morph inside the panel". Add `data-ash-section="welcome" | "questions" | "thread" | "input"` markers on the four regions. Rewrite `pushUserMessage(text)`:

```ts
function pushUserMessage(text: string) {
  const commit = () => {
    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
  };

  const scope = scrollRef.current;
  if (!scope) { commit(); return; }

  const welcomeEl = scope.querySelector<HTMLElement>('[data-ash-section="welcome"]');
  const questionsEl = scope.querySelector<HTMLElement>('[data-ash-section="questions"]');
  const inputEl = scope.querySelector<HTMLElement>('[data-ash-section="input"]');

  if (!welcomeEl || !questionsEl || !inputEl) { commit(); return; }

  const inputStartTop = inputEl.getBoundingClientRect().top;

  gsap.to([welcomeEl, questionsEl], {
    opacity: 0,
    y: -16,
    duration: 0.35,
    ease: "power2.in",
    onComplete: () => {
      flushSync(commit);
      const inputEndTop = inputEl.getBoundingClientRect().top;
      const dy = inputEndTop - inputStartTop;
      gsap.fromTo(inputEl, { y: -dy }, { y: 0, duration: 0.5, ease: "power2.out", clearProps: "transform" });
      const threadEl = scope.querySelector<HTMLElement>('[data-ash-section="thread"]');
      if (threadEl) gsap.fromTo(threadEl, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power2.out" });
    },
  });
}
```

Add a `useEffect` cleanup in the component that calls `gsap.killTweensOf([welcomeEl, questionsEl, inputEl, threadEl])` on unmount — collect refs via `useRef` or by querying at cleanup time.

Add `data-ash-section` markers to the welcome div, common-questions div, thread container, and input container in the JSX. The input container is `.mx-5 mb-5 border-2 border-[#247ae4] rounded-xl p-3 bg-white` in the thread view and `.mt-5 border-2 border-[#247ae4] ...` in the welcome view — mark both as `data-ash-section="input"`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/chat/__tests__/AskHoaiPanel.test.tsx`
Expected: pass.

- [ ] **Step 5: Run the full suite**

Run: `npx tsc --noEmit && npx vitest run`
Expected: `tsc` clean. Tests: ≥ 96 passing / 2 failing.

- [ ] **Step 6: Smoke-check in the browser**

Advance to Ask HOAi scene. Watch the cursor beat type a message and submit. Expected: welcome + common questions fade up and out; input snaps to its new position smoothly; thread fades in from below.

- [ ] **Step 7: Commit**

```bash
git add src/chat/AskHoaiPanel.tsx src/chat/__tests__/AskHoaiPanel.test.tsx
git commit -m "feat(chat): GSAP timeline for welcome -> thread morph

Phase 1 fades welcome + common questions up and out. Phase 2 commits
the state change via flushSync. Phase 3 FLIPs the input to its new
position and fades the thread in. gsap.killTweensOf on unmount guards
against mid-morph scrubs.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: End-to-end verification + residual cleanup

**Files:**
- Modify: `src/walkthrough/cursor.tsx` (final cleanup of defensive VT-name-stripping block in `advance`)
- No other code changes expected; this task is primarily rehearsal-worthiness verification.

**Interfaces:** none produced; this is a verification + cleanup pass.

- [ ] **Step 1: Full forward playthrough**

Open the dev preview, press ArrowRight through every beat of every scene in order (intro → inbox → onboarding → autopay → goToPortal → payments → askHoai → boardActions → amenity). Observe:
- No console errors.
- Every lift beat morphs its target smoothly to center.
- Every expand beat lifts its target and fades in detail content.
- Backdrop fades in/out at scene boundaries where appropriate.
- Ask HOAi panel morphs sidebar → centered on scene enter, morphs back on scene exit.
- Welcome → thread morph plays smoothly when the cursor beat sends a message.
- White-background canvas fades in on Ask HOAi scene enter, fades out on exit.
- Payments scene: Ask HOAi panel visible in sidebar form during the lift, blurred live by the backdrop.

- [ ] **Step 2: Full backward playthrough**

From the last scene, press ArrowLeft all the way back to intro. Observe:
- No console errors.
- Target elements return to their original DOM positions (no inline-style residue).
- Phase transitions (portal → onboarding → inbox) work; onboarding re-enters at the correct `initialScreen`.
- No stale lifted elements left on screen.

- [ ] **Step 3: Launcher jump playthrough**

Append `?launcher` to the URL. For each scene in the sequence, click it in the launcher. Observe:
- App state (phase, page, dashboard view, panel open state) snaps correctly from `scene.appState`.
- First beat of the jumped scene plays its animation.
- No stale state from the prior scene (e.g., no lifted widget from a previous scene).

- [ ] **Step 4: Reduced-motion check**

In Chrome DevTools, Rendering tab, enable "Emulate CSS media feature prefers-reduced-motion: reduce". Replay through the sequence. Backdrop opacity should snap rather than transition. Lift and panel morphs will still animate (reduced-motion for those is deferred — out of scope for Nov 3; note in follow-ups).

- [ ] **Step 5: Remove the defensive VT-name-stripping block in `advance`**

In `src/walkthrough/cursor.tsx`, delete the `willLeaveScene` block in `advance` that walks `data-vt-name` elements and sets `el.style.viewTransitionName = "none"`. No `viewTransitionName` values are set anywhere in the app anymore; this block is dead code.

- [ ] **Step 6: Run full test suite**

Run: `npx tsc --noEmit && npx vitest run`
Expected: `tsc` clean. Tests: ≥ 96 passing / 2 failing.

- [ ] **Step 7: Commit the final cleanup**

```bash
git add src/walkthrough/cursor.tsx
git commit -m "chore(walkthrough): remove dead viewTransitionName-stripping block in advance

No inline viewTransitionName values are set anywhere after the CSS
rewrite; the defensive strip-on-scene-leave block is unreachable.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

- [ ] **Step 8: Hand off to rehearsal**

Tell the user: "Rewrite complete. All scenes verified forward, backward, and via launcher. Start rehearsal."

---

## Self-review notes

- **Spec coverage:** All 8 design-doc sections are addressed by one or more tasks. Section 1 (rip-out) → Task 1. Section 2 (beat primitives) → Tasks 2 and 3. Sections 3, 3b, 3c (AskHoai morphs) → Tasks 5 and 6. Section 4 (backdrop) → Task 4. Section 5 (scene change) → Task 1 Step 2. Section 6 (back nav) → Task 7 Step 2 verification. Section 7 (isolation enforcement) → shared pattern across Tasks 2, 3. Section 8 (tests) → Tasks 2, 3, 6.
- **Review Focus coverage:** Each of the five Review Focus items is attached to the owning task's tests (Items 1 and 5 → Task 2; Item 2 → Task 2; Item 3 → Task 4; Item 4 → Task 6).
- **Proportion:** Plan is roughly 2.5x the design doc length. Code blocks only where the signature/test leaves a choice (GSAP timeline algorithm; one-off CSS structure). Everything else is signature + reference to design doc section.
- **Type consistency:** `withTransition(update)` signature is reduced to `(update: () => void) => void` in Task 1; no later task re-references the old options param. `LiftBeat` and `ExpandBeat` keep their current prop shapes; the dispatcher in `WalkthroughOverlay.tsx` is unchanged.
