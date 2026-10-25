> **Superseded.** This describes the original View Transitions-based walkthrough, which has been removed. Current reference: [docs/walkthrough.md](../../walkthrough.md).

# Curated Walkthrough — Design Spec

**Date:** 2026-10-09 (original); **Revised:** 2026-10-14
**Owner:** Edward Case
**Status:** Draft — pending user review before implementation planning

> **Revision note (2026-10-14).** This spec supersedes the Motion + GSAP shared-element design with a browser **View Transitions API** primitive and an explicit **Scene** layer above beats. The clone-based `lift` and launcher-driven activation are replaced. Purpose, non-goals, audience, sequence storyboards, and rehearsal plan are preserved; architecture, engine, driving model, and file layout are new. The old approach is kept in git history on branch `walkthrough-subsystem` for reference.

## Purpose

A curated, hand-driven walkthrough instrument that lifts individual UI elements out of the live app onto a cinematic "stage," expands them to reveal context and functionality, and lets them morph back into place. Built for the Vantaca user conference — a keynote-grade demo of the Home Vision prototype, driven live by a presenter on a large screen.

### Explicit non-goals

- Not a first-run onboarding tour for residents.
- Not a just-in-time feature coach.
- Not resumable, dismissible, or per-user-persistent.
- Not autoplaying — the presenter drives every advance.
- Not instrumented (no analytics, no telemetry, no i18n).

## Success criteria

- One sequence of two scenes — Board Actions and Community Amenity — totaling ~2–3 minutes end-to-end including presenter narration.
- **Keyboard is always armed from the moment the page loads.** No launcher, no `?demo=` URL, no modifier chord. The presenter lands on the home page and presses `→` to begin.
- `→` / `←` move forward and back through the entire journey (across both scenes and all their beats). Scene boundaries are transparent to the presenter — one key, one step.
- `Esc` always returns to beat 0 cleanly. No getting stuck.
- Zero crashes on stage. Failures degrade silently; the presenter is never trapped.
- The signature "lift from app → expand on stage → return to app" morph is driven by the **real** React element morphing between layouts — no clones, no snapshot cards. Interactive expand beats remain clickable.
- Toggleable HUD so the presenter can run with on-screen cues (progress, captions, prev/next) or in clean keyboard-only mode.
- Zero impact on existing app code outside the walkthrough subsystem, beyond wrapping `<App />` in `<WalkthroughRoot>` and adding one `viewTransitionName` style per morph target.

## Audience & stage context

- **Audience:** existing Vantaca customers at the user conference. They already use today's product; the walkthrough shows where Home Vision is going.
- **Presenter:** Edward or another Vantaca presenter, driving live. Assume a Logitech R400-style clicker (sends `Space` / `PageDown`), external projector at 1080p, no network dependencies.
- **Tone:** cinematic, polished, memorable. "Keynote demo," not "product tour." Visual voice is informed by jessa.art — understated chrome, generous whitespace, choreographed moments that reward attention.

## Engine choice

**Browser View Transitions API + GSAP (for annotate only).**

- **View Transitions API** owns every structural morph: scene changes, lifts, expands, and returns. Each state change wraps in `document.startViewTransition(() => setCursor(next))`. Elements that participate get a `view-transition-name`; the browser diffs frame-before vs frame-after and interpolates at the compositor level. No React-driven keyframes, no cloned DOM, no `layoutId` plumbing.
- **GSAP** (with `@gsap/react`'s `useGSAP` hook) owns `annotate` beats only: multi-track timelines synchronizing SVG arrow draws, typed captions, and target pulses. These are overlay animations on top of a static DOM structure, which is GSAP's sweet spot.

**Rejected alternatives:**
- *Motion-only* — the current implementation. Clone-based lifts feel plasticky; `layoutId` with portals has sharp edges around unmount timing. Fixed by the next alt.
- *Motion with `layoutId`-of-the-real-element* — technically possible, but once you commit to no cloning, the browser's View Transitions API does the same job natively with less code and less to break.
- *Full route-driven architecture (React Router)* — route changes per beat is architectural overkill for a single-user, single-session presentation.
- *View Transitions only* (no GSAP) — annotate beats need multi-track parallel timelines (arrow + typed text + pulse). Reimplementing that on top of VT is a timeline library you'd have to write and own.

**Browser support (late 2026):** Chromium stable since 111; Safari stable since 18.2 (Dec 2024); Firefox GA since 139 (March 2026). Universally available for the conference audience.

## Architecture

Three composable pieces, all under `src/walkthrough/`:

### 1. `<WalkthroughRoot sequence={…}>`

The entry wrapper. Replaces today's provider + stage + launcher trio with one component mounted in `main.tsx`.

Responsibilities:
- Owns the cursor context (`useReducer` with `{ sceneIndex, beatIndex }`).
- Installs the global keydown listener (always on; input/contentEditable guard preserved from today's `keyboard.ts`).
- Renders children (the app).
- Renders a sibling `<WalkthroughOverlay>` positioned fixed above the app.
- Renders a sibling `<WalkthroughHUD>` (toggleable with `.`).

```ts
type Cursor = { sceneIndex: number; beatIndex: number };

type WalkthroughState = {
  cursor: Cursor;
  hudVisible: boolean;
};
```

**Actions** (dispatched via `useCursor()`):
- `advance()` — next beat; at the last beat of a scene, steps into next scene's beat 0; at the last beat of the last scene, no-op.
- `back()` — previous beat; at beat 0 of a scene, steps into the previous scene's last beat; at beat 0 of scene 0, no-op.
- `jumpTo(sceneIndex, beatIndex)` — absolute jump; used by `Home`, `End`, `Esc`.
- `toggleHud()` — flip `hudVisible`.

Every action resolves through:

```ts
function withTransition(update: () => void) {
  if (document.startViewTransition && !prefersReducedMotion()) {
    document.startViewTransition(update);
  } else {
    update();
  }
}
```

This is the entire animation engine for scene changes, lifts, and expands. There is no beat-level animation code to write — the browser does it based on `view-transition-name` matches between frames.

### 2. `<WalkthroughOverlay>`

Fixed, full-viewport, `pointer-events: none` by default. Three layers:

| Layer | Purpose |
|---|---|
| **Backdrop** | A single `<div>` with `backdrop-filter: blur(6px)` and `background: rgba(0,0,0,.6)`. Opacity set per beat kind via `data-beat-kind` on the overlay root — CSS crossfades between beat kinds for free during VT. |
| **Highlight cutout** | A single `<div>` with `clip-path: polygon(…)` carving a hole around the target rect. Rect is read from `getBoundingClientRect()` in `useLayoutEffect`; recomputed on `resize`. |
| **Stage layer** | Where `lift` and `expand` beats mount their stage slots. These are the elements that share a `view-transition-name` with their scene-side counterpart. |
| **Caption** | A single caption element at a beat-defined position. |

The overlay reads the current beat descriptor and renders only what that beat needs — nothing persists between beats except the backdrop (and only its opacity changes).

### 3. Scenes

A **scene** is a plain React component that renders app content. Scenes are not a framework. They participate in the walkthrough by giving `viewTransitionName` style props to any element that should morph between scenes or lift to the stage. Scenes don't import from the walkthrough subsystem except for the (optional) `useCursor()` hook if they need to react to the beat (rare — most scenes just render static markup).

```tsx
function App() {
  const { sceneId } = useCursor();
  return (
    <main>
      {sceneId === 'board-actions' && <BoardActionsScene />}
      {sceneId === 'amenity'       && <AmenityScene />}
    </main>
  );
}
```

Scene mounting is in `App.tsx`; the walkthrough subsystem does not route or inject scenes.

## File layout

```
src/walkthrough/
  WalkthroughRoot.tsx         wrapper: context + keyboard + overlay + HUD
  WalkthroughOverlay.tsx      backdrop, cutout, caption, stage slots
  WalkthroughHUD.tsx          progress dots, beat label, prev/next (toggleable)
  cursor.tsx                  context + reducer + useCursor + withTransition
  keyboard.ts                 global keydown handler (always armed)
  viewTransitionNames.ts      typed constants for all VT names (prevents duplicates)
  types.ts                    Sequence, Scene, Beat, Cursor types
  walkthrough.css             ::view-transition-group timing + reduced-motion overrides
  beats/
    HighlightBeat.tsx         cutout + caption
    LiftBeat.tsx              empty stage slot with viewTransitionName
    ExpandBeat.tsx            stage slot that renders real React content
    AnnotateBeat.tsx          GSAP timeline (ported from current AnnotateWithGSAP)
    NarrateBeat.tsx           full-overlay title/caption card
  scenes/
    index.ts                  sequence export: Scene[]
    boardActions.tsx          Scene definition
    amenity.tsx               Scene definition
  stage-content/
    BoardActionStageDetail.tsx expanded content for board actions
    AmenityReservationStage.tsx expanded content for amenity
  __tests__/
    sequence.test.ts          type-check the sequence array; verify unique VT names
```

Integration surface outside `src/walkthrough/`:
- `src/main.tsx` — wrap `<App />` in `<WalkthroughRoot sequence={homeVisionSequence}>`.
- `src/App.tsx` — read `sceneId` from `useCursor()` and render the matching scene component. Add `viewTransitionName` style to the two existing morph targets (board task row, amenity tile). The audit confirmed no component refactoring is required: both are fluid containers that morph cleanly at 1.4–1.6× scale.

Deleted from the current subsystem: `WalkthroughProvider.tsx`, `WalkthroughStage.tsx`, `WalkthroughLauncher.tsx`, `targetRegistry.ts`, `useWalkthroughTarget.ts`, old `beats/HighlightTarget.tsx`, `beats/LiftToStage.tsx`, `beats/ExpandContent.tsx`, `beats/ReturnToOrigin.tsx`, `beats/NavigateApp.tsx`, old `sequences/*`, all `.superpowers/sdd/*fix-report*.md` files (the fixes they document are moot in the new system).

## Scene + Beat DSL

```ts
type Scene = {
  id: string;
  render: () => ReactNode;   // what the scene mounts in App.tsx
  beats: Beat[];
};

type Beat =
  | { kind: 'idle' }
  | { kind: 'highlight';
      target: string;              // view-transition-name of target element
      caption?: string }
  | { kind: 'lift';
      target: string;              // same VT name as the in-scene element
      scale?: number;              // visual scale factor at rest on stage (default 1.4)
      position?: 'center' | { x: number; y: number };
      caption?: string }
  | { kind: 'expand';
      target: string;              // same VT name as in lift
      content: ReactNode;          // real interactive React content
      caption?: string }
  | { kind: 'annotate';
      tracks: Array<
        | { type: 'arrow'; from: string | { x: number; y: number }; to: string | { x: number; y: number } }
        | { type: 'pulse'; target: string; count?: number }
        | { type: 'typeCaption'; text: string; speedCps?: number }
      >;
      durationMs?: number }
  | { kind: 'narrate';
      title?: string;
      body: string };

type Sequence = Scene[];
```

**No `return` beat kind.** Returning an element to its scene position is just advancing to the next `idle` beat — the view-transition from "stage-slot with name X exists" to "no element with name X on the overlay" morphs the element back to its scene-side origin automatically.

**No `navigate` beat kind.** Scene changes happen implicitly when the cursor crosses a scene boundary (e.g., last beat of `board-actions` → beat 0 of `amenity`). The browser morphs any element present in both scenes with a matching `view-transition-name`.

**Beat 0 of every scene** should be `idle` — the scene at rest, no overlay, nothing highlighted. Advancing out of `idle` is the user's cue to the audience that "something is about to happen."

## View-transition naming convention

All `view-transition-name` values use the prefix `wt-` and live as typed constants in `viewTransitionNames.ts`:

```ts
export const VT = {
  BoardTaskCurrent: 'wt-board-task-current',
  AmenityTilePool:  'wt-amenity-tile-pool',
  // ...
} as const;
```

Scenes reference them: `<div style={{ viewTransitionName: VT.AmenityTilePool }} />`.

Beats reference the string form: `{ kind: 'lift', target: VT.AmenityTilePool }`.

**Uniqueness enforcement:** `WalkthroughRoot` runs a dev-only `useLayoutEffect` after every render that walks the DOM, collects all `view-transition-name` values, and `console.warn`s on duplicates. The View Transitions API throws at runtime if two live elements share a name — we want to catch it the instant it happens, not during a demo.

## Driving model

**Launch:** none. The keyboard is live from the moment `WalkthroughRoot` mounts. The home page is scene 0, beat 0 (`idle`) — indistinguishable from the normal app until the presenter presses `→`.

**Keyboard map:**

| Key | Action |
|---|---|
| `→` / `Space` / `PageDown` | `advance()` |
| `←` / `PageUp` | `back()` |
| `Home` | `jumpTo(0, 0)` |
| `End` | `jumpTo(lastScene, lastBeat)` |
| `Esc` | `jumpTo(0, 0)` (soft reset — overlays clear, scene 0 remounts, no page reload) |
| `.` | toggle HUD |

`Space` and `PageDown` are what hardware presentation remotes send; a Logitech R400 works unconfigured.

**Input guard:** the handler skips when the keydown target is an `<input>`, `<textarea>`, or `contentEditable` element — presenter can type into form fields during an interactive expand beat without accidentally advancing.

**HUD (when visible):**
- Anchored bottom-right.
- Progress: `scene 2 of 2 · beat 4 of 6` + a dot row.
- Prev / Next buttons (mouse fallback).
- Current beat kind label (dev convenience; styled subtly).

**Clean-stage mode (HUD toggled off):**

| Element | HUD on | HUD off |
|---|---|---|
| Backdrop | shown | shown |
| Highlight cutout | shown | shown |
| Lifted / expanded stage elements | shown | shown |
| GSAP annotations (arrows, pulses, typed captions inside beats) | shown | shown |
| Beat captions | shown | shown |
| Progress / prev-next / beat label | shown | hidden |

Rule: chrome of the walkthrough system hides; content of beats stays. Keyboard remains fully functional in clean mode.

**Captions.** Each beat may define a `caption` string. Captions render in the overlay layer at a beat-defined position (default: below the active target rect, or centered under the stage slot for lift/expand). Styled with the existing app's DM Sans + brand palette; sized to read at 20pt+ on a 1080p projector.

## Sequence storyboards

### Prep required

- **Board Actions:** apply `style={{ viewTransitionName: VT.BoardTaskCurrent }}` to the current task row in `src/board/BoardTasksWidget.tsx`. One-line addition, no logic change.
- **Community Amenity:** the demo-only `AmenitiesPage` from the current branch stays. Apply `viewTransitionName: VT.AmenityTilePool` to the pool tile.

### Scene 1 — Board Actions (~45–60 seconds)

**Goal:** context-rich, one-tap decisions directly from the dashboard.

```tsx
export const boardActionsScene: Scene = {
  id: 'board-actions',
  render: () => <BoardActionsHome />,
  beats: [
    { kind: 'idle' },

    { kind: 'highlight', target: VT.BoardTaskCurrent,
      caption: 'Board members land on the dashboard and immediately see what needs their attention.' },

    { kind: 'lift', target: VT.BoardTaskCurrent, scale: 1.4, position: 'center' },

    { kind: 'expand', target: VT.BoardTaskCurrent,
      content: <BoardActionStageDetail actionId="VIO-1804" />,
      caption: 'Every action carries its full history — notices sent, owner response window, prior board comments.' },

    { kind: 'annotate', tracks: [
        { type: 'arrow', from: 'stage-detail-timeline', to: 'stage-vote-approve' },
        { type: 'typeCaption', text: 'Approve the fine. One tap. Timestamped and attributed to you.' },
        { type: 'pulse', target: 'stage-vote-approve', count: 2 },
      ] },

    { kind: 'idle' },  // the "return" — browser morphs the element back to the dashboard
  ],
};
```

**Signature move:** beat 2 → beat 3 — the real card visible in the widget morphs into the real detail view. No modal cut; the browser interpolates the actual element between its small and large boxes.

### Scene 2 — Community Amenity (~50–70 seconds)

**Goal:** amenity reservations feel physical — touch the pool, see when it's free, book it.

```tsx
export const amenityScene: Scene = {
  id: 'amenity',
  render: () => <AmenitiesPage />,
  beats: [
    { kind: 'idle' },  // first beat; browser morphs any element shared with board-actions

    { kind: 'highlight', target: VT.AmenityTilePool,
      caption: 'Four amenities. Big photos. One tap each.' },

    { kind: 'lift', target: VT.AmenityTilePool, scale: 1.6, position: 'center' },

    { kind: 'expand', target: VT.AmenityTilePool,
      content: <AmenityReservationStage amenityId="pool" />,
      caption: 'Pick a day. Pick a time. The amenity knows the household rules — pool caps at 6 guests on weekends.' },

    { kind: 'annotate', tracks: [
        { type: 'pulse', target: 'reservation-slot-sat-2pm', count: 3 },
        { type: 'arrow', from: 'stage-guest-badge', to: 'reservation-slot-sat-2pm' },
        { type: 'typeCaption', text: 'The slot already knows: 6 guests max this weekend.' },
      ] },

    { kind: 'idle' },  // reservation complete; element morphs back to tile
  ],
};
```

**Signature move:** beat 2 → beat 3 — the pool photo never cuts. It stays visually anchored while the surrounding UI rebuilds around it, via a browser-compositor morph of the actual tile.

**Scene boundary (board-actions last beat → amenity beat 0):** no shared elements, so the browser crossfades the two scenes. If a future scene wants to carry an element across the boundary (e.g., the user's avatar), both scenes give that element the same `viewTransitionName` and the browser morphs it.

### Common arc

Both scenes follow **idle → highlight → lift → expand → annotate → idle**. Deliberate: the audience learns the visual language from Scene 1 so Scene 2 feels inevitable.

## Compatibility & degradation

- **Reduced motion** (`prefers-reduced-motion: reduce`): `withTransition()` skips `startViewTransition` and applies the state update synchronously. Beats still advance; nothing morphs. CSS `@media (prefers-reduced-motion: reduce)` block in `walkthrough.css` shortens all CSS transitions to near-zero.
- **No-VT browsers** (any pre-Safari-18.2 phones in the field): `withTransition()` detects `typeof document.startViewTransition !== 'function'` and runs the plain update. Beats snap-cut; everything else — keyboard, HUD, captions, highlight cutout, annotate — still works. Degrades to a "slide deck" feel. No Motion fallback is built; two animation systems fighting was the trap in the previous design.
- **TypeScript:** add `src/types/view-transitions.d.ts` declaring `startViewTransition` on `Document`. Zero runtime impact; purely a type shim.
- **Border-radius flicker on `overflow: hidden` morph targets** (audit flagged amenity tile): mitigate with `view-transition-class: wt-rounded` and a CSS rule disabling `overflow: hidden` during the active pseudo-element. Only apply if visibly needed in rehearsal.

## Error handling

Light-touch — the goal is *never crash on stage*, not *handle every edge case gracefully*.

| Failure | Behavior |
|---|---|
| Beat references a `view-transition-name` not in the DOM | Browser renders the beat with no morph (no error thrown). HUD shows a subtle red dot. `→` still advances. |
| GSAP timeline throws | Beat renders without the annotate overlay. `→` advances. |
| Duplicate `view-transition-name` detected at runtime | Dev-only warning in `useLayoutEffect`; the browser's native error surfaces at the next `startViewTransition`. Audit workflow catches this before rehearsal. |
| User presses `→` during an in-flight transition | `document.startViewTransition()` queues: the browser lets the current transition finish, then starts the next. No cancellation mid-morph (unlike the current Motion implementation, where this required bespoke interrupt plumbing). |
| `Esc` pressed at any time | `jumpTo(0, 0)` resets the cursor; overlays clear; scene 0 re-renders. |

### Explicitly out of scope

- Retry logic.
- Telemetry / analytics.
- User-preference persistence (HUD toggle resets each session).
- i18n for captions.
- Multi-presenter / collaborative driving.

## Dependencies

**Add:**
- `gsap` — core animation library.
- `@gsap/react` — the `useGSAP` hook.

**Remove:**
- `motion` (and any transitive dev-only dep that comes with it, pending the plan's dep audit).

GSAP has been free for all use since 2025.

## Testing & rehearsal

### Build-time check

One Vitest spec at `src/walkthrough/__tests__/sequence.test.ts`:
- Imports the sequence from the registry.
- Type-checks every beat.
- Walks `VT` constants and asserts uniqueness.
- Asserts every `target` string referenced by a beat exists in `VT`.
- ~25 lines total. No render tests.

### Rehearsal plan

Three stages, run before the conference:

1. **Dev-box rehearsal.** On the presenter's laptop, run the full sequence end-to-end from beat 0. Verify: no console errors (including the uniqueness guard), every beat lands, `Esc` returns to beat 0 cleanly, `.` toggles HUD. Fix any jank until the sequence runs flawlessly 3× in a row.

2. **Projection rehearsal.** Hook up to the actual presentation display at the conference AV team's target resolution. Verify: no layout breaks, no frame drops, captions readable from the back of the room (20pt+ equivalent on 1080p).

3. **Clicker rehearsal.** With the actual presentation remote. Verify: `Space` / `PageDown` advance correctly, laser button doesn't accidentally click HUD elements, back button steps back cleanly.

### Pre-flight checklist (10 min before going on)

- Dev server running, home page loaded.
- Clicker paired.
- External display mirroring at target resolution.
- Full sequence runs once end-to-end without `Esc`.
- `.` toggle tested (HUD off / on).

## Migration path (summary — detailed plan comes from writing-plans)

The subsystem is replaced incrementally, with the new path landing behind the current implementation and the switch happening in one commit:

1. Add the primitive in isolation (`WalkthroughRoot`, `cursor.tsx`, `withTransition`, keyboard) with a throwaway two-beat sanity scene. Prove VT end-to-end.
2. Build the new overlay (`WalkthroughOverlay`, `WalkthroughHUD`, `walkthrough.css`).
3. Build the new beat renderers (`HighlightBeat`, `LiftBeat`, `ExpandBeat`, `NarrateBeat`). Port `AnnotateBeat` from today's `AnnotateWithGSAP`.
4. Convert `boardActionsSequence` and `amenitySequence` to the new `Scene[]` shape. The audit confirmed no component refactoring is required.
5. Switch `main.tsx` from the old provider stack to `<WalkthroughRoot>` in one commit; remove the old subsystem files in the same commit.
6. Delete the `.superpowers/sdd/*fix-report*.md` files — the fixes they document no longer apply.

## Open questions / deferred decisions

None blocking implementation. The following are intentional "not now" calls:

- **Visual-design pass on captions and HUD.** Default typography matches existing app's DM Sans + brand palette; a dedicated pass can follow the first dev-box rehearsal.
- **Specific "wow" accents** (confetti, screen-shake). Deliberately omitted. GSAP makes these trivial to add later if a rehearsal reveals a beat that needs more punch.
- **Final caption copy.** Storyboards above are first-draft; refined during dev-box rehearsal when the presenter can hear it alongside their own narration.
- **A third scene** (Elections, Payments) following the same arc. Scoped out of this cycle to keep rehearsal budget bounded; the architecture supports it with a new `Scene` entry.

## Transition to implementation

After user review and approval of this spec, invoke the `superpowers:writing-plans` skill to produce the implementation plan. No other skill is invoked between brainstorming and planning.
