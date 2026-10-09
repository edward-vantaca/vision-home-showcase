# Curated Walkthrough — Design Spec

**Date:** 2026-10-09
**Owner:** Edward Case
**Status:** Draft — pending user review before implementation planning

## Purpose

A curated, hand-driven walkthrough instrument that elevates individual UI elements out of the live app onto a cinematic "stage," expands them to reveal context and functionality, and returns them to their place in the app. Built for the Vantaca user conference — a keynote-grade demo of the Home Vision prototype's direction, driven live by a presenter on a large screen for existing customers.

### Explicit non-goals

- Not a first-run onboarding tour for residents.
- Not a just-in-time feature coach.
- Not resumable, dismissible, or per-user-persistent.
- Not autoplaying — the presenter drives every advance.
- Not instrumented (no analytics, no telemetry, no i18n).

## Success criteria

- Two sequences — Board Actions and Community Amenity — each ~60–90 seconds end-to-end including presenter narration.
- Hand-driven: `→` / clicker advances; `Esc` always exits cleanly.
- Zero crashes on stage. Failures degrade silently; the presenter is never trapped.
- The signature "lift from app → expand on stage → return to app" morph never visually cuts — the audience sees continuity of identity on the elevated element.
- Toggleable HUD so the presenter can run with on-screen cues (progress, captions, prev/next) or in clean keyboard-only mode.
- Zero impact on existing app code outside the walkthrough subsystem, beyond adding `<WalkthroughProvider>` + `<WalkthroughStage>` at the root and one-line `data-ux-id` additions on referenced targets.

## Audience & stage context

- **Audience:** existing Vantaca customers at the user conference. They already use today's product; the walkthrough shows where Home Vision is going.
- **Presenter:** Edward or another Vantaca presenter, driving live. Assume a Logitech R400-style clicker (sends `Space` / `PageDown`), external projector at 1080p, no network dependencies.
- **Tone:** cinematic, polished, memorable. "Keynote demo," not "product tour."

## Engine choice

**Motion + GSAP hybrid.**

- **Motion** (the renamed `framer-motion`) handles the structural pattern: `layoutId`-driven shared-element morphs for the lift → expand → return arc, plus `AnimatePresence` for the backdrop and captions. This covers ~90% of the on-stage motion with declarative, React-native ergonomics.
- **GSAP** (with `@gsap/react`'s `useGSAP` hook and the Flip plugin available if needed) handles the choreographed hero beats inside the `annotate` beat type: multi-track timelines synchronizing SVG arrow draws, typed captions, and target pulses. GSAP has been free since 2025.

Rejected alternatives: Motion-only (loses hero-beat choreography), GSAP-only (imperative plumbing cost for every beat is too high), View Transitions API (no fine control for element elevation), Theatre.js (authoring overhead doesn't pay off at two sequences), tour libraries like Shepherd / Driver / Reactour (wrong genre — popover highlights, not element elevation).

## Architecture

Four composable pieces, all contained in `src/walkthrough/`:

### 1. `<WalkthroughProvider>`

React context at the app root. State held via `useReducer` (no external state-machine library — ~6 actions, 2 sequences, overkill otherwise).

**State shape:**
```ts
type WalkthroughState = {
  active: boolean;
  sequenceId: string | null;
  currentBeatIndex: number;
  hudVisible: boolean;
  history: number[]; // beat indices visited, for back navigation
};
```

**Actions exposed via context:**
- `start(sequenceId: string)` — mounts the stage, begins beat 0.
- `advance()` — moves to next beat; if last beat, calls `exit()`.
- `back()` — pops `history`, re-runs prior beat.
- `exit()` — resets to `{ active: false }`; stage unmounts; app renders in whatever page/state it was in.
- `toggleHud()` — flips `hudVisible`.
- `replayBeat()` — re-runs current beat from start.
- `skipToEnd()` — emergency unstick; fast-forwards to final beat of current sequence.

### 2. `<WalkthroughStage>`

Full-viewport overlay layer rendered via React portal to `document.body`. Only mounted when `state.active === true`. Three z-planes:

- **Backdrop** (`z-index: 100`): dim + blur applied to the app under the stage.
- **Stage** (`z-index: 110`): where lifted / morphed elements render. Hosts the `layoutId` targets Motion animates to.
- **HUD** (`z-index: 120`): captions and controls. Visibility bound to `state.hudVisible`.

The stage reads `state.sequenceId` + `state.currentBeatIndex`, looks up the current beat from the sequence registry, and dispatches to the matching beat renderer.

### 3. `useWalkthroughTarget(id, ref?)`

Hook components call to register themselves as elevation targets.

Internally maintains a module-level `Map<string, { element: HTMLElement; getRect: () => DOMRect }>`. Beat renderers consult this registry when resolving target IDs.

**Phase 1 shortcut:** the stage ALSO falls back to `document.querySelector('[data-ux-id="..."]')` for any target ID not found in the registry. The app already uses `data-ux-id` attributes extensively, so most sequences work with zero component changes. The ref-based hook is only needed for targets requiring precision beyond attribute lookup (e.g., a dynamic rect inside a scroll container).

### 4. Beat renderers

One React component per beat `kind` in `src/walkthrough/beats/`. Each receives the beat object + a `onComplete` callback (invoked when the beat's animation finishes, enabling the "advance mid-flight" protection described in Error Handling).

## File layout

```
src/walkthrough/
  WalkthroughProvider.tsx       context + useReducer state machine
  WalkthroughStage.tsx          portal overlay + beat dispatcher
  WalkthroughHUD.tsx            captions, progress dots, prev/next, exit
  WalkthroughLauncher.tsx       sequence picker (shown behind ?demo=true or Cmd+Shift+W)
  useWalkthroughTarget.ts       target registration hook
  targetRegistry.ts             module-level Map + data-ux-id fallback resolver
  keyboard.ts                   global key handler (installed when active)
  beats/
    HighlightTarget.tsx         Motion: dim + pulse ring
    LiftToStage.tsx             Motion: layoutId travel + scale
    ExpandContent.tsx           Motion: morph lifted card into stage card with new content
    AnnotateWithGSAP.tsx        GSAP: multi-track timeline (arrow + typeCaption + pulse)
    ReturnToOrigin.tsx          Motion: reverse of Lift via same layoutId
    NavigateApp.tsx             dispatches to existing app navigation; stage stays mounted but hides
  sequences/
    boardActions.tsx            Sequence 1 definition
    amenity.tsx                 Sequence 2 definition
    index.ts                    sequence registry
  stage-content/
    BoardActionStageDetail.tsx  the content rendered inside the Expand beat for Board Actions
    AmenityReservationStage.tsx the content rendered inside the Expand beat for Amenity
  types.ts
```

Integration surface outside `src/walkthrough/`:
- `src/main.tsx` — wrap `<App />` in `<WalkthroughProvider>` and mount `<WalkthroughStage>`.
- `src/App.tsx` — add `data-ux-id="board-task-${task.id}"` to the task row element in `BoardTasksWidget` (one-line change). Add a new `"amenities"` page value to the `Page` type and a nav-conditional entry visible only when `?demo=true`.
- A new `src/amenities/AmenitiesPage.tsx` — the demo-only 4-tile Amenities grid.

## Step DSL & beat catalog

A sequence is a plain array of beats; each beat is a tagged union.

```ts
type Point = { x: number; y: number };

type Beat =
  | { kind: 'highlight';
      target: string;
      caption?: string;
      durationMs?: number }
  | { kind: 'lift';
      target: string;
      scale?: number;
      position?: 'center' | Point;
      caption?: string }
  | { kind: 'expand';
      content: React.ReactNode;
      caption?: string }
  | { kind: 'annotate';
      tracks: Array<
        | { type: 'arrow'; from: string | Point; to: string | Point }
        | { type: 'pulse'; target: string; count?: number }
        | { type: 'typeCaption'; text: string; speedCps?: number }
      >;
      durationMs?: number }
  | { kind: 'return';
      caption?: string }
  | { kind: 'navigate';
      to: Page;
      caption?: string };

type Sequence = {
  id: string;
  title: string;
  beats: Beat[];
};
```

**Beat → engine mapping:**

| Beat kind | Engine | Responsibility |
|---|---|---|
| `highlight` | Motion | Dim everything except target rect; render a pulsing ring around the target. Reversible on advance. |
| `lift` | Motion `layoutId` | Share identity between the in-app element and a stage-mounted copy; animate the morph. The in-app element visually appears to travel to the stage. |
| `expand` | Motion | The lifted stage card grows and swaps its inner content for the beat's `content` React node. `layout` prop animates geometry. |
| `annotate` | GSAP | A `useGSAP`-managed timeline runs the specified tracks in parallel: SVG arrow draws over N ms, caption types over M ms, target pulses K times. |
| `return` | Motion `layoutId` | Reverse of `lift`: the same `layoutId` returns the element to its origin in the app. |
| `navigate` | None | Dispatches to existing app `onNavigate(page)`; stage temporarily hides (not unmounts) during the transition, then re-shows. |

## Driving model

**Launching a tour:**
- URL contains `?demo=true` → `<WalkthroughLauncher>` renders a small floating panel listing available sequences with Start buttons.
- URL contains `?demo=<sequenceId>` (e.g., `?demo=amenity`) → that sequence starts automatically on load.
- Keyboard chord `Cmd+Shift+W` → opens the launcher regardless of URL (so the presenter can summon it mid-session).

**Launcher panel contents:**
- One row per registered sequence (title + Start button).
- A single checkbox: `[x] Show HUD & captions` (default: checked). Starting from the launcher respects this setting.

**Driving an active tour (keyboard):**

| Key | Action |
|---|---|
| `→` / `Space` / `PageDown` | advance to next beat |
| `←` / `PageUp` | step back |
| `Esc` | exit cleanly |
| `.` | skip to end of current sequence (emergency unstick) |
| `0` | re-run current beat from start |
| `H` | toggle HUD + captions visibility |

`Space` and `PageDown` bindings are what hardware presentation remotes send, so a Logitech R400-style clicker works without configuration.

**HUD (when visible):**

- Anchored bottom-center.
- Progress dots showing beat position (e.g., `●●●○○○○ 3 / 7`).
- Prev / Next buttons (mouse fallback for clicker-less case).
- Explicit `✕ exit` button.

**Clean-stage mode (HUD toggled off):**

| Element | HUD on | HUD off |
|---|---|---|
| Stage backdrop (dim + blur) | shown | shown |
| Lifted / morphed elements | shown | shown |
| GSAP annotations (arrows, pulses, typed text inside beats) | shown | shown |
| Progress dots + prev/next bar | shown | hidden |
| System contextual captions | shown | hidden |
| Exit `✕` button | shown | hidden (`Esc` still works) |

**Rule:** chrome of the walkthrough system hides; content of the beat itself (arrows the presenter is pointing at, labels the beat script requested) stays. Keyboard driving remains fully functional in clean mode.

**Captions.** When the HUD is visible, system captions render inside the stage, positioned contextually per beat (not inside the HUD bar), using Motion fade/slide-in. The presenter speaks their own narration; the on-stage caption gives the audience something to read and cues the presenter.

## Sequence storyboards

### Prep required

- **Board Actions:** add `data-ux-id="board-task-${task.id}"` to each task row element in `src/board/BoardTasksWidget.tsx`. One-line additions, no logic changes.
- **Community Amenity:** no amenities page exists today — Community is a Feed. The demo builds a minimal `AmenitiesPage` (4-tile grid using existing images at `public/assets/community-pool.jpg`, `community-tennis.jpg`, `community-cafe.png`, `community-garden.jpg`). The nav entry is visible only when `?demo=true` so it doesn't ship into the real IA.

### Sequence 1 — Board Actions (~45–60 seconds)

**Goal:** context-rich, one-tap decisions directly from the dashboard.

```tsx
export const boardActionsSequence: Sequence = {
  id: 'board-actions',
  title: 'Board Actions',
  beats: [
    { kind: 'highlight', target: 'board-tasks-widget',
      caption: 'Board members land on the dashboard and immediately see what needs their attention.' },

    { kind: 'lift', target: 'board-task-VIO-1804',
      scale: 1.4, position: 'center' },

    { kind: 'expand',
      content: <BoardActionStageDetail actionId="VIO-1804" />,
      caption: 'Every action carries its full history — notices sent, owner response window, prior board comments.' },

    { kind: 'annotate', tracks: [
        { type: 'arrow', from: 'stage-detail-timeline', to: 'stage-vote-approve' },
        { type: 'typeCaption', text: 'Approve the fine. One tap. Timestamped and attributed to you.' },
        { type: 'pulse', target: 'stage-vote-approve', count: 2 },
      ] },

    { kind: 'return', caption: 'Back to the dashboard, next action already queued.' },
  ],
};
```

**Signature move:** beat 2 → beat 3 — the card visible in the widget *is* the card that becomes the full detail view. No "modal opens" cut; identity persists via `layoutId`.

### Sequence 2 — Community Amenity (~50–70 seconds)

**Goal:** amenity reservations feel physical — touch the pool, see when it's free, book it.

```tsx
export const amenitySequence: Sequence = {
  id: 'amenity',
  title: 'Amenity Reservation',
  beats: [
    { kind: 'navigate', to: 'amenities' },

    { kind: 'highlight', target: 'amenity-tile-pool',
      caption: 'Four amenities. Big photos. One tap each.' },

    { kind: 'lift', target: 'amenity-tile-pool',
      scale: 1.6, position: 'center' },

    { kind: 'expand',
      content: <AmenityReservationStage amenityId="pool" />,
      caption: 'Pick a day. Pick a time. The amenity knows the household rules — pool caps at 6 guests on weekends.' },

    { kind: 'annotate', tracks: [
        { type: 'pulse', target: 'reservation-slot-sat-2pm', count: 3 },
        { type: 'arrow', from: 'stage-guest-badge', to: 'reservation-slot-sat-2pm' },
        { type: 'typeCaption', text: 'The slot already knows: 6 guests max this weekend.' },
      ] },

    { kind: 'return', caption: 'Reserved. Confirmation hits the resident app and the gate code.' },
  ],
};
```

**Signature move:** beat 2 → beat 3 — the pool photo never cuts. It stays visually anchored while the surrounding UI rebuilds around it.

### Common arc

Both sequences follow **Highlight → Lift → Expand → Annotate → Return**. Deliberate: the audience learns the visual language from Sequence 1 so Sequence 2 feels inevitable. Future sequences (Elections, Payments) should keep this arc.

## Dependencies

New npm dependencies to add:
- `motion` — the renamed `framer-motion` package.
- `gsap` — core animation library.
- `@gsap/react` — the `useGSAP` React hook (handles context + cleanup).

All three are free and MIT / standard-no-charge-use licensed; GSAP has been free for all use since 2025.

## Error handling

Light-touch — the goal is *never crash on stage*, not *handle every edge case gracefully*.

| Failure | Behavior |
|---|---|
| Beat references a target not in the DOM | Console warning; HUD shows a subtle red dot (invisible to audience); `→` still advances. |
| GSAP timeline throws | Beat finishes immediately with no partial state; `→` advances. |
| Motion `layoutId` origin isn't visible (scrolled off-screen) | Stage calls `scrollIntoView({ block: 'center' })` on the target before starting the lift. |
| User presses `→` during an in-flight animation | Current beat completes instantly (not canceled mid-morph); next beat begins. Implementation: beat renderer's `animate()` promise is awaited before `onComplete`, and advance interrupts by setting the Motion animation to its final values via `controls.set(finalState)`. |
| `Esc` pressed at any time | Provider dispatches `exit`; stage unmounts; app renders in whatever page/state it was in. |

### Explicitly out of scope

- Retry logic.
- Telemetry / analytics.
- User-preference persistence (HUD toggle resets each session; this is intentional).
- i18n for captions (captions are English strings in the sequence files; translation is a future problem).
- Multi-presenter / collaborative driving.

## Testing & rehearsal

### Build-time check

One Vitest spec at `src/walkthrough/__tests__/sequences.test.ts`:
- Imports every sequence from the registry.
- Asserts each sequence's beats array type-checks and references only known beat kinds.
- ~15 lines total. No render tests.

### Rehearsal plan (the real "testing")

Three stages, run before the conference:

1. **Dev-box rehearsal.** On the presenter's laptop, run each sequence end-to-end from the launcher. Verify: no console errors, all five beats land, `Esc` cleans up, `H` toggles HUD. Fix any jank until each sequence runs flawlessly 3× in a row.

2. **Projection rehearsal.** Hook up to the actual presentation display at the conference AV team's target resolution. Verify: no layout breaks at that resolution, no frame drops, captions are readable from the back of the room (stage captions should render at 20pt+ equivalent on a 1080p projector).

3. **Clicker rehearsal.** With the actual presentation remote. Verify: `Space` / `PageDown` from the remote advance correctly, the laser button doesn't accidentally click HUD elements, the back button steps back cleanly.

### Pre-flight checklist (10 min before going on)

- Dev server running, URL has `?demo=true` loaded.
- Clicker paired.
- External display mirroring at target resolution.
- Each sequence runs once end-to-end without `Esc`.
- `H` toggle tested (HUD off / on).

## Open questions / deferred decisions

None blocking implementation. The following are intentional "not now" calls:

- **Visual-design pass on captions.** Default typography/color will match the existing app's DM Sans + brand palette; a dedicated design pass can come after the first dev-box rehearsal reveals what reads well at projection scale.
- **Specific "wow" accents (confetti, screen-shake, haptic hints).** Deliberately omitted from the initial design to keep scope bounded. GSAP makes these trivial to add later if a rehearsal reveals a beat that needs more punch.
- **The actual copy of every caption.** The storyboards above include first-draft caption text; final copy will be refined during Dev-box rehearsal when the presenter can hear it alongside their own narration.

## Transition to implementation

After user review and approval of this spec, invoke the `superpowers:writing-plans` skill to produce the implementation plan. No other skill is invoked between brainstorming and planning.
