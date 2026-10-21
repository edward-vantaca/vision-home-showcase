# Walkthrough animation subsystem — CSS rewrite

**Date:** 2026-10-21
**Branch:** `walkthrough-subsystem`
**Supersedes (partially):** `2026-10-09-curated-walkthrough-design.md` for the animation primitives only. Scene/beat data model and cursor state machine remain as that doc describes.

---

## Intent

Replace the View Transitions API-based animation subsystem with CSS-driven, scene-isolated animations so a live stage demo on **Nov 3, 2026** can be rehearsed and trusted. The current VT-based system has shown repeated regressions — scenes bleed into each other, `backdrop-filter` cannot reach panels with `viewTransitionName`, and the "root pseudo opacity 0 to let live DOM paint through" trick depends on undocumented browser behavior. The presenter has lost trust in the system. 13 days to the talk; rehearsal must start within 3-4 days.

## Why

1. **The stage demo acceptance test is "I trust it on stage in front of a large audience."** The current system has had the HOAi morph regress, the payments backdrop blur turn solid-white, and scrubbing-back drag forward scenes' visual state into prior scenes. Every "fix" has moved the collision rather than eliminating it.
2. **View Transitions have fundamental limitations for this use case.** Elements with `viewTransitionName` are suppressed in the live DOM during a transition, so `backdrop-filter` cannot blur them. Named pseudos paint in the view-transition top layer, which the normal DOM cannot composite over. The CSS tricks that have accumulated to work around this (`::view-transition-old(root) { opacity: 0 }`, `data-walkthrough-scene` gates, `wt-chat-send` / `wt-ash-vt-active` html classes) are increasingly load-bearing and fragile.
3. **CSS transitions on inline styles are the simplest animation primitive on the web.** No pseudo-element ordering, no stacking-context voodoo, no live-DOM suppression. Zero browser-quirk surface area. Debuggable with the normal DevTools inspector.
4. **GSAP is already a dependency** (`gsap`, `@gsap/react`) and already used for the annotate beat. No new npm dependencies needed. If any single scene wants a complex timeline, GSAP is right there.
5. **Deadline pressure makes migration to a new framework (Framer Motion, Motion One) too risky.** 13 days is not enough to migrate 9 scenes and still rehearse. CSS transitions and GSAP (already present) are the pragmatic choice.

## Goals

- Each beat's animation is self-contained. Its `useEffect`/`useLayoutEffect` cleanup fully restores any DOM state it mutated.
- The payments scene lift blurs the Ask HOAi panel via live `backdrop-filter`. No white flash, no snapshot artifacts.
- The Ask HOAi scene enter morphs the panel from its sidebar position/size to its centered focused position/size, matching the quality that worked when `viewTransitionName` was unconditional. Same timing, same easing.
- Scrubbing back (ArrowLeft) is safe at scene boundaries. Previous scene's inline-style residue is cleared on unmount. No visual artifacts carry forward.
- The scene launcher (`?launcher`) continues to work. Jumping between phases is a hard cut; jumping within a phase runs the scene's enter animation.
- All 9 scenes play through: intro, inbox, onboarding, autopay, goToPortal, payments, askHoai, boardActions, amenity.
- The two pre-existing keyboard test failures (React 19 strict-mode race) remain acceptable deferred-minor.

## Non-goals

- Scrubbing mid-animation. The presenter must advance / back only at beat boundaries. If this constraint fails during rehearsal, we add a `durationMs: 0` skip-mode, not a scrubbing timeline.
- Reduced-motion variants beyond honoring the current `prefers-reduced-motion` media query.
- Hot-swapping scenes mid-animation.
- Animation editor / timeline UI.
- Switching to Framer Motion, Motion One, or any other new animation library.
- Changes to the inbox → onboarding → portal phase architecture in `App.tsx`.
- Changes to the `appState` scene-driven sync useEffects added earlier this session. Those remain.
- Changes to the `SceneLauncher` component. It remains URL-gated by `?launcher`.
- Removing the sequence tests. They continue to validate the scene list.

## Anti-goals (failure modes even if the system technically works)

- The HOAi morph is visibly worse than the version that was working with unconditional `viewTransitionName`. If the user cannot say "yes, that's the one," the rewrite failed.
- Any scene has a `>100ms` "white flash" or "empty box" between beats.
- Scrubbing back from any beat requires a page refresh.
- The user has to touch code or DevTools during rehearsal to recover from a glitch.
- Beat primitives have cross-coupling (a change in one scene's beat breaks another scene).

## Constraints

- **Deadline:** Nov 3, 2026. User needs to start rehearsing within 3-4 days of implementation start.
- **No new npm dependencies.** `gsap`, `@gsap/react`, React 19 are available.
- **Preserve the scene sequence:** intro → inbox → onboarding → autopay → goToPortal → payments → askHoai → boardActions → amenity.
- **Preserve the untracked work from this session:** scene definitions in `src/walkthrough/scenes/*.tsx`, `SceneLauncher.tsx`, the `appState` field on `Scene`, and the useEffects in `App.tsx` that sync phase/page/view/panel from `scene.appState`.
- **Do not break the scene launcher.** `?launcher` continues to show the floating pill; clicking a scene jumps the walkthrough and the app state.
- **Do not run `pnpm format`.** oxfmt strips semicolons from TypeScript type literals. Hand-format new code.
- **Do not `git add -A` or `git add .`.** There are Git-LFS-inconsistent image modifications in the working tree; stage files by explicit path.
- **No pushes.** The user plans to configure a remote later.
- **Keep tests green.** The two pre-existing keyboard-test failures (React 19 strict-mode + `fireEvent(window)`) stay as-is. All other tests continue to pass.
- **No worktree.** Dev server runs against the branch directly; worktree would hide live progress.

## The design

### 1. Rip out view transitions

**Remove:**

- `document.startViewTransition()` calls in `src/walkthrough/cursor.tsx` (`withTransition` function) and `src/chat/AskHoaiPanel.tsx` (`pushUserMessage`).
- The `withTransition(update, options)` function signature's `options` parameter. The function reduces to just `update()`. For `prefers-reduced-motion`, no special path needed — CSS media queries handle it on the animated elements themselves.
- Inline `viewTransitionName` style props from: `src/chat/AskHoaiPanel.tsx`, `src/App.tsx` (payment widget), `src/board/BoardTasksWidget.tsx`, `src/amenities/AmenitiesPage.tsx`.
- CSS rules in `src/walkthrough/walkthrough.css` targeting `::view-transition-*` pseudos, `data-walkthrough-scene`-scoped backdrop variants, `html.wt-chat-send` rules, and `html.wt-ash-vt-active` rules.
- The useLayoutEffect in `WalkthroughOverlay.tsx` that sets `data-walkthrough-scene` on `<html>`. If other code reads this attribute, remove those reads too (grep first; expected: nothing reads it besides the removed CSS).
- The `scenesInvolve` helper and `htmlClass` plumbing in `cursor.tsx::advance/back/jumpTo`.
- The `useVTNameUniquenessGuard` in `WalkthroughRoot.tsx` (no VT names left to collide).
- `src/types/view-transitions.d.ts` — safe to delete (ambient types no longer needed).

**Keep:**

- `data-vt-name` attributes used by `cursor.tsx` for `querySelector` to find click targets and reverseTo targets. Those are not VT-related despite the name; rename to `data-wt-target` for clarity in a follow-up pass, but not required for Nov 3.
- GSAP imports and usage in `AnnotateBeat.tsx` and `CursorBeat.tsx` (untracked). GSAP is scope-safe and already working.

**Result:** `withTransition(update)` becomes `update()`. No global snapshot. Each React commit is a plain state change. No cross-scene transition machinery exists.

### 2. Rebuild beat primitives

Each beat kind becomes a React component with isolated lifecycle. The dispatcher in `WalkthroughOverlay.tsx` continues to switch on `beat.kind` and render the right component.

#### `HighlightBeat` (minor change)

Current implementation (`src/walkthrough/beats/HighlightBeat.tsx`): `scrollIntoView` on mount, no DOM mutation. The cutout mask is painted by `WalkthroughOverlay.tsx` via `cutoutClipPath`.

Change: nothing. The cutout mask continues to work with CSS `backdrop-filter` on `.wt-cutout`.

#### `LiftBeat` (full rewrite)

Current implementation (`src/walkthrough/beats/LiftBeat.tsx`): captures target's `innerHTML` and dimensions on mount, hides the real target with `visibility: hidden`, mounts an empty `<div>` at viewport center with `viewTransitionName` matching the target. Fragile and known to show an empty slot after the transition completes.

New implementation:

```tsx
export function LiftBeat({ target, scale = 1.4, position = "center" }: Props) {
  useLayoutEffect(() => {
    const el = findTarget(target); // existing helper
    if (!el) return;

    // Snapshot current inline-style values so we can restore them on unmount.
    const saved = {
      position: el.style.position,
      top: el.style.top,
      left: el.style.left,
      transform: el.style.transform,
      transition: el.style.transition,
      zIndex: el.style.zIndex,
      willChange: el.style.willChange,
    };

    const rect = el.getBoundingClientRect();

    // Pin the element in place at its current viewport position. CSS
    // transitions will carry it from here to the center-scaled target.
    el.style.position = "fixed";
    el.style.top = `${rect.top}px`;
    el.style.left = `${rect.left}px`;
    el.style.transform = "translate(0,0) scale(1)";
    el.style.transition = "transform 1000ms cubic-bezier(0.65,0,0.35,1)";
    el.style.zIndex = "150";
    el.style.willChange = "transform";

    // Next frame: flip the transform to its final value. CSS does the morph.
    const raf = requestAnimationFrame(() => {
      const dx = position === "center" ? window.innerWidth / 2 - (rect.left + rect.width / 2) : position.x - rect.left;
      const dy = position === "center" ? window.innerHeight / 2 - (rect.top + rect.height / 2) : position.y - rect.top;
      el.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;
    });

    return () => {
      cancelAnimationFrame(raf);
      // On unmount, restore the original inline-style values. If the element
      // is still rendered in its "lifted" state, the CSS transition on
      // `transform` will carry it back visually. If it's unmounted (scene
      // change), the restore is irrelevant.
      Object.assign(el.style, saved);
    };
  }, [target, scale, position]);

  return null; // nothing to render; the real element is the stage
}
```

Key properties:
- **No clones, no stage slot, no VT names.**
- **Backdrop blur works** because `.wt-backdrop` is a sibling in `.wt-root` with its own CSS transition on `backdrop-filter`. The lifted element is live DOM; `backdrop-filter` on a higher z-index layer blurs it normally.
- **Cleanup is complete.** Every inline-style property set on mount is restored on unmount. No residue.
- **Return animation.** When unmounting while still visible (scene change), the element snaps back to its original flow position because `position: fixed` → `position: ""` is not animatable. If the user wants a smoothed return, we can add a short post-unmount transition in a follow-up; the recommendation for Nov 3 is to accept the snap-back as the "I'm done with this scene" visual.

#### `ExpandBeat` (full rewrite)

Current implementation renders a stage slot with content. In the new model, `ExpandBeat` behaves like `LiftBeat` but also mounts the provided `content` prop centered over the lifted target.

Shape:
- `useLayoutEffect` mutates the target element exactly like `LiftBeat`.
- The component renders a `<div>` fixed-centered with the provided `content`. The `<div>` fades in via CSS `opacity 0 → 1 transition 500ms`.
- On unmount, inline styles restored and the content div unmounts (CSS fade-out via unmount; acceptable to snap).

#### `CursorBeat` (no change)

Current untracked implementation uses GSAP. GSAP is scope-safe (it operates on specific elements, no global side effects). No change.

#### `AnnotateBeat` (no change)

GSAP timeline. No change.

#### `IntroBeat` (no change)

Simple fixed-position overlay with CSS fade-in. No change.

#### `NarrateBeat` (no change)

Caption-only beat. The caption already renders in `WalkthroughOverlay` with a CSS fade.

#### `IdleBeat` (no change)

Renders nothing. Backdrop fades out via its CSS opacity rule when `data-beat-kind="idle"`.

### 3. AskHoaiPanel focus morph

Replace the VT-driven morph with CSS. The `aside`'s class already toggles between two layouts based on the `focused` prop:

```tsx
<aside
  className={
    focused
      ? "fixed inset-y-[6vh] left-1/2 -translate-x-1/2 w-[min(820px,92vw)] z-[200] flex overflow-hidden"
      : "hidden lg:flex shrink-0 h-full overflow-hidden w-[400px] border-l border-[#e5eaf0]"
  }
>
```

Change: add a persistent `transition` property that carries the morph:

```tsx
<aside
  style={{ transition: "all 700ms cubic-bezier(0.65,0,0.35,1)" }}
  className={...}
>
```

For the morph to actually animate, both the before and after classes must use properties that CSS can interpolate (position, transform, width — fine; `display: flex` ↔ `display: none` — not animatable, must be handled). The current `focused=false` form uses `hidden lg:flex`. We change to always `lg:flex` and animate `opacity` + `width` together so collapse → zero width = visually gone:

```tsx
const focusedClass = "fixed inset-y-[6vh] left-1/2 -translate-x-1/2 w-[min(820px,92vw)] z-[200] flex opacity-100";
const sidebarClass = "hidden lg:flex shrink-0 h-full w-[400px] border-l border-[#e5eaf0] opacity-100";
const collapsedClass = "hidden lg:flex shrink-0 h-full w-0 opacity-0";
```

For the stage demo, the panel is always open during the askHoai scene (`appState.askHoaiOpen = true`), so the morph is sidebar ↔ focused. No collapsed state is involved in the walkthrough. The collapse pill behavior for user clicks remains.

Remove: all `data-ash-vt` attributes added to sub-regions, all CSS keyed on `html.wt-ash-vt-active`, the `useCursor()` import from this session's edit.

#### Welcome → thread morph inside the panel

**User has confirmed this morph is part of the "HOAi animation was perfect" quality bar.** The simple CSS crossfade is not sufficient. Ship the GSAP timeline on day 3.

Current implementation wraps `pushUserMessage` in `startViewTransition()` with the `wt-chat-send` class for duration tuning and sub-regions tagged with `viewTransitionName` so the browser morphed layouts between welcome and thread states.

Replace with a GSAP timeline inside `pushUserMessage`. Pseudocode:

```ts
import { gsap } from "gsap";

function pushUserMessage(text: string) {
  const commit = () => {
    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
  };

  const welcomeEl = scrollRef.current?.querySelector('[data-ash-section="welcome"]');
  const questionsEl = scrollRef.current?.querySelector('[data-ash-section="questions"]');
  const inputEl = /* ref to the input container */;

  if (!welcomeEl || !questionsEl) {
    commit();
    return;
  }

  // Measure input's current top (above common questions, below welcome).
  const inputStart = inputEl.getBoundingClientRect();

  // Phase 1: welcome + questions out (short upward translate + fade).
  gsap.to([welcomeEl, questionsEl], {
    opacity: 0,
    y: -16,
    duration: 0.35,
    ease: "power2.in",
    onComplete: () => {
      // Phase 2: commit the state change (welcome/questions unmount).
      flushSync(commit);

      // Phase 3: measure input's new top (now it's at the top because
      // welcome/questions are gone, or wherever the thread layout puts it).
      const inputEnd = inputEl.getBoundingClientRect();
      const dy = inputEnd.top - inputStart.top;

      // Pin input at its old position via FLIP, then animate to new position.
      gsap.fromTo(
        inputEl,
        { y: -dy },
        { y: 0, duration: 0.5, ease: "power2.out" }
      );

      // Fade the thread container in.
      const threadEl = scrollRef.current?.querySelector('[data-ash-section="thread"]');
      if (threadEl) {
        gsap.fromTo(threadEl, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power2.out" });
      }
    },
  });
}
```

Add `data-ash-section` markers on the welcome div, common-questions div, thread container, and input container so GSAP can find them.

If GSAP's `flushSync` + measurement timing turns out to be glitchy in React 19, the fallback is to pre-measure before the state change, compute the delta, and run both phases in parallel with a scheduled commit between them. Decide after seeing it.

### 3b. Ask HOAi scene enter — panel sidebar → centered

**User confirmed:** this morph was part of the "perfect" quality bar.

The `aside` element's layout flips when `focused` toggles. CSS alone covers it:

```tsx
<aside
  style={{ transition: "all 700ms cubic-bezier(0.65,0,0.35,1)" }}
  className={focused ? "fixed inset-y-[6vh] left-1/2 -translate-x-1/2 w-[min(820px,92vw)] z-[200] flex" : "hidden lg:flex shrink-0 h-full w-[400px] border-l border-[#e5eaf0]"}
>
```

The transition carries width, position, and transform. For React to see it as the same element (so CSS transition applies rather than unmount/remount), the `aside` must remain mounted across the morph — it does, because `AskHoaiPanel` always renders the aside; only its classes change.

Risk: `position: static` ↔ `position: fixed` is not interpolable; the transition will snap. **Mitigation:** keep `position: fixed` in BOTH states. Sidebar form becomes `fixed right-0 top-0 bottom-0 w-[400px]`. Focused form stays `fixed inset-y-[6vh] left-1/2 ...`. With both as `fixed`, CSS can animate `right`, `top`, `bottom`, `left`, `width`, `transform` continuously.

### 3c. Ask HOAi scene enter — white background fade

**User confirmed:** this fade was part of the "perfect" quality bar.

The pure-white canvas div in `App.tsx:3104` is already a plain CSS transition on `opacity`, gated on `askHoaiFocused`. **No change needed.** Keep as-is.

### 4. Backdrop and overlay

Simplify `.wt-backdrop`:

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

Remove: all `.wt-root[data-scene="payments"] .wt-backdrop` variants, backdrop-filter transition, scene-specific CSS. One backdrop rule set drives all scenes.

### 5. Scene change

`withTransition(update)` becomes `update()`:

```tsx
const advance = useCallback(() => {
  // ...existing VT-name cleanup for leaving-scene (preserve this, it was
  // guarding against stale inline viewTransitionNames; after the rewrite
  // it's redundant but harmless)
  dispatch({ type: "advance" });
}, [state.cursor, sequence]);
```

Later cleanup pass: delete the "strip viewTransitionName on scene leave" block in `advance` once we're confident no inline VT names remain. For Nov 3 we leave it in; it's defensive.

### 6. Backward navigation

Current `back` can dispatch a `reverseTo` click to undo a scene's forward side effect. Keep that mechanism (it clicks a hidden button in the DOM that resets app phase). No change needed.

For back from `payments[0]` (lift beat) to `goToPortal[0]` (cursor beat):
- `LiftBeat` component unmounts. Its cleanup restores inline styles on the payment widget — snaps back to original position.
- Scene appState changes: phase goes from "portal" to "onboarding". MainApp unmounts, NewResidentFlow mounts.
- The dashboard disappears instantly. The onboarding "done" screen appears instantly.

This is a hard cut. For the stage demo, this is acceptable — the presenter scrubs back deliberately and the audience understands.

If a smoother back is wanted, add a 300ms opacity fade on the phase boundary in a follow-up. Not blocking Nov 3.

### 7. Scene isolation enforcement

The core architectural guarantee: each beat component's `useEffect`/`useLayoutEffect` cleanup must FULLY restore any DOM state it mutated. The pattern:

1. On mount, snapshot every inline-style property before mutating.
2. On mount, mutate what's needed.
3. On unmount, restore every snapshotted property via `Object.assign(el.style, saved)`.

If this invariant holds for every beat, scenes cannot bleed into each other. No shared state, no global snapshots, no cross-scene machinery.

To make this visible to future contributors, add a short JSDoc comment on each beat component referencing this invariant. Not a lint rule; just discipline.

### 8. Test strategy

- `sequence.test.ts` continues to validate the scene list order and the `appState` presence.
- Add a jsdom test for `LiftBeat` that mounts the component against a fake target element, asserts inline styles are set, then unmounts and asserts the styles are restored to pre-mount values.
- Add a jsdom test for `ExpandBeat` with the same shape.
- The two pre-existing keyboard-test failures remain. They are a React 19 strict-mode `fireEvent(window)` race, documented in `docs/HANDOFF-2026-10-15.md`.

Target: full test suite goes from 88/90 to 90/92 (adding the two new LiftBeat/ExpandBeat tests). Keyboard tests stay failing.

## What's left to the builder

Decisions a sensible builder can make without re-opening to the user, documented here so they're not re-litigated:

1. **Exact lift timing.** Current VT uses 1000ms cubic-bezier(0.65,0,0.35,1). Preserve that. If a specific beat wants different timing, pass `durationMs` on the beat.
2. **Lift return animation.** Baseline is snap-back on unmount. If visibly jarring during rehearsal, swap to a deferred-cleanup pattern: on unmount, keep the lifted element in `position: fixed` but set `transform: translate(0,0) scale(1)` and attach a `transitionend` listener that restores the saved inline styles when the return transition finishes. Keeps React unmount semantics clean while giving a smooth return. Implement the preemptive GSAP version only if `transitionend` behaves badly in the browser.
3. **ExpandBeat enter animation.** Simple 500ms opacity fade. If it looks weak, add a slight scale-up (0.9 → 1.0) over the same duration.
4. **The AskHoaiPanel sidebar → focused morph duration.** 700ms with the same easing as lift. Tune by eye.
5. **BoardTasksWidget `wt-board-task-current`.** This VT name was only used for the `boardActions` lift. After the rewrite, remove the inline `viewTransitionName` style; the `data-vt-name` attribute stays for `cursor.tsx` click targeting.
6. **AmenitiesPage `wt-amenity-tile-pool`.** Same as above — remove inline VT name, keep `data-vt-name`.
7. **PaymentsWidget VT name in `App.tsx`.** Already gated on `paymentsLiftActive`; remove the gating logic entirely since VT is gone.
8. **The `useVTNameUniquenessGuard` in `WalkthroughRoot.tsx`** can be removed (nothing left to guard).
9. **LiftBeat scroll safety.** Before snapshotting `getBoundingClientRect()`, call `el.scrollIntoView({ block: "center", inline: "center", behavior: "instant" })`. Guarantees the target is in the viewport when the lift starts, regardless of prior scroll state (scene scrub, launcher jump, user scrolled). Cost: one layout read. Benefit: eliminates "lift from off-screen" failure mode.
10. **AskHoaiPanel launcher-case layout.** The `SceneLauncher` can jump directly into any scene. For `ask-hoai`, `scene.appState.askHoaiOpen` is `true`, so the sidebar form is already up when the morph fires — no edge case. The current user-click collapse (`hidden lg:flex` + width transition) stays unchanged because the walkthrough never triggers it. The focused morph CSS and the collapse CSS are two independent transitions on the same element; both are fine as long as one isn't active while the other is. If a rehearsal-time edge case appears, add `onTransitionEnd` guards.
11. **Backdrop timing vs. lift timing.** Backdrop uses `opacity 500ms ease-out` on a pre-set `blur(40px)` background. Lift uses `transform 1000ms cubic-bezier(0.65,0,0.35,1)`. Backdrop lands at 500ms, lift finishes at 1000ms. Intentional — the dim+blur establishes the "focus mode" early, then the widget rises into it. If the user wants a slower backdrop that completes with the lift, change the opacity transition to 1000ms with the lift's easing. Decide after seeing it in the browser.

## Implementation order (recommended)

**Day 1 — Rip-out and baseline (foundation):**
- Remove all `startViewTransition` calls.
- Remove all inline `viewTransitionName` style props.
- Remove view-transition CSS from `walkthrough.css`.
- Delete `useVTNameUniquenessGuard`.
- Verify `sequence.test.ts` and the rest of the non-keyboard tests pass.
- Verify the walkthrough advances through all scenes without crashing. Animations are gone; everything is a hard cut. This is the baseline.

**Day 2 — Lift and Expand:**
- Rewrite `LiftBeat` with inline-style + CSS transition on target.
- Rewrite `ExpandBeat` similarly.
- Add jsdom tests for both.
- Verify in browser: payments scene lifts the widget, boardActions lifts the task card. Backdrop blur reaches both because they're live DOM.

**Day 3 — AskHoaiPanel morph (quality bar day — user confirmed the whole HOAi interaction was the north star):**
- Normalize sidebar and focused forms to both use `position: fixed` so the CSS transition interpolates (section 3b).
- Add `transition: all 700ms cubic-bezier(0.65,0,0.35,1)` on the `aside`.
- Verify sidebar → centered morph matches the "best thing" quality.
- Verify white-background fade (`App.tsx:3104`) still works unchanged (section 3c).
- Implement the GSAP welcome → thread timeline from the start (section 3): phase 1 fade+translate out welcome/questions, phase 2 commit, phase 3 FLIP the input + fade thread in.
- If any of the three HOAi beats land below the quality bar, this is a Day-4 polish item, not a Day-5 handoff item. Rehearsal can slip to day 6 if needed; HOAi quality cannot slip.

**Day 4 — Polish and backdrop:**
- Simplify backdrop CSS.
- Verify payments scene: Ask HOAi panel is blurred live. No white flash.
- Walk through every scene forward and back; fix inline-style residue if any.

**Day 5 — Rehearsal start:**
- Hand off to user for rehearsal. Fix any issues as they surface.

**Days 6-13:** User rehearsal, bug fixes, polish.

If any single day slips, the fallback plan is to drop animation on the slipping scene — hard cut forward instead of animate. The sequence of scenes always plays through; the specific animation is the tunable.

## Open questions I'd ask the user before building (if any)

Resolved. User confirmed on 2026-10-21: "the whole HOAi interaction was perfect for what I was trying to achieve. the intro slide into view, the fading in of the white background, and the chat interactions." All three sub-animations (panel sidebar → centered morph, white background fade-in, welcome → thread morph) are at the quality bar. Day 3 plan now includes the GSAP timeline for welcome → thread upfront, not as a fallback.

Nothing else to ask.
