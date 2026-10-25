# Walkthrough & animation reference

How the stage-demo walkthrough is structured, how each animation works, and the
rules that keep it trustworthy on stage. This is the current reference; when it
disagrees with an older spec or handoff, this file wins (and if this file
disagrees with the code, the code wins — fix this file).

Last updated 2026-10-25 (branch `walkthrough-subsystem`): broadcast SMS scene,
phone stage, scene swipe and busy holds.

## Mental model

The real app (`src/App.tsx`, `src/inbox`, `src/chat`, …) is always mounted and
fully clickable. The walkthrough is a thin layer on top that:

1. keeps a **cursor** — which scene and which beat we're on;
2. puts each scene's app into a known **start state** (`appState`);
3. renders the current **beat** — a backdrop, a lifted element, a scripted
   cursor that clicks/types for real, etc.

Beats never fake the app: a scripted click is a real `el.click()`, typing goes
through React's `onChange`. If a beat breaks, the app underneath is still a
working app.

```
main.tsx
└─ <WalkthroughRoot sequence={homeVisionSequence}>   src/walkthrough/WalkthroughRoot.tsx
   ├─ <AppSlide>                   slides the app out for the SMS scene (SceneSwipe.tsx)
   │  └─ <App/>                    the real app; reads useCursor() for scene sync
   ├─ <PhoneLayer/>                white layer holding the phone (z 220)
   ├─ <WalkthroughOverlay/>        renders the current beat (.wt-root, z 250)
   ├─ <WalkthroughHUD/>            prev / next pill, toggled with "."
   └─ <SceneLauncher/>             scene jumper, only with ?launcher in the URL
```

## Files

| File | Role |
| --- | --- |
| `src/walkthrough/types.ts` | `Scene`, `Beat`, `CursorStop`, `SceneAppState` — the authoring API, with doc comments |
| `src/walkthrough/scenes/*.tsx`, `scenes/index.ts` | One file per scene; `index.ts` is the running order |
| `src/walkthrough/cursor.tsx` | Reducer (advance / back / jumpTo), `useCursor()`, `beatBusyRef`, `holdBusy()` / `isWalkthroughBusy()` |
| `src/walkthrough/keyboard.ts` | Presenter keys |
| `src/walkthrough/WalkthroughOverlay.tsx` | Picks the beat component, sticky stage, backdrop kind |
| `src/walkthrough/beats/*` | One component per beat kind; `useLiftTarget.ts` does lift/expand |
| `src/walkthrough/walkthrough.css` | Backdrop, cursor, intro, file-card styles; `askhoai-*` keyframes |
| `src/walkthrough/viewTransitionNames.ts` | `VT` — every element a beat can target (historic name; View Transitions are gone) |
| `src/walkthrough/dropFile.ts` | `DROP_FILE_EVENT`, the event a cursor "drop" fires |
| `src/walkthrough/phone/phoneState.ts` | SMS copy (`SMS_SENDER`, `SMS_BROADCAST`, `SMS_REPLY`, `SMS_ANSWER`) and the phone's state per beat |
| `src/walkthrough/phone/PhoneStage.tsx`, `PhoneFrame.tsx` | The phone: lock screen, notification, SMS thread; `SMS_SCENE_ID` |
| `src/walkthrough/phone/SceneSwipe.tsx` | `AppSlide` / `PhoneLayer` and `swipeFor`, the app ⇄ phone swipe |

## Authoring: scenes and beats

A **scene** is one moment of the demo:

```ts
export const paymentsScene: Scene = {
  id: "payments",
  label: "Payments widget",          // shown in the launcher / HUD
  page: "dashboard",                  // portal page this scene lives on
  appState: { phase: "portal", page: "dashboard", dashboardView: "homeowner", askHoaiOpen: true },
  beats: [ /* one per presenter click */ ],
};
```

Each **beat** is one press of → . Targets are elements tagged
`data-vt-name={VT.Something}`; add new names to `VT` (the sequence test checks
every beat targets a known name and that names are unique).

| Beat `kind` | What the audience sees | Backdrop |
| --- | --- | --- |
| `idle` | Nothing extra — the app as-is | none |
| `intro` | Full-screen white title card with logo / wordmark | white |
| `highlight` | Scrolls target into view; everything but the target is dimmed and blurred | own cutout layer (`.wt-cutout`: dim .55, blur 16px) |
| `lift` | The real element floats to centre (or a point), scaled, above a blurred dim | blur + dim |
| `expand` | Target lifts and dissolves while a detail panel (`content`) fades in at centre | blur + dim |
| `annotate` | GSAP arrows / pulses / typed caption drawn over the stage | blur + dim |
| `narrate` | Title + body text | blur + dim |
| `cursor` | A scripted pointer moves, clicks, types, scrolls, drops files | follows the stage (see below) |

Captions (`caption`) are authored but **not shown** — `.wt-caption` is
`display: none`.

### Cursor beats

A cursor beat is a list of stops: the beat's own fields are the first stop,
`then` adds more. Each stop's `action`:

| `action` | Behaviour |
| --- | --- |
| `"click"` | Travel to target centre, pause, press, real `click()` + `focus()` |
| `"hover"` or omitted | Travel only |
| `"tab"` | No travel; focus the target (as if Tab was pressed), then type |
| `"scroll"` | No travel; ease the target's own scroll to its bottom over `scrollMs` (default 4000) |
| `"drop"` | Cursor enters from off the right edge carrying a file card labelled `file`, travels to the target, lets go: fires `DROP_FILE_EVENT` (`{ name }`, bubbling) on it |

Per-stop extras: `typeText` + `typeCps` (types into an input via the native
setter so React sees it), `holdMs` (pause after the stop), `hideStage` /
`releaseStage` (see sticky stage). Beat-only extras: `durationMs` (travel time),
`reverseTo` (element clicked when the presenter goes ← from this beat, to undo
its effect), `replayOnBack` (beat undoes itself, so ← then → replays it).

Later stops are measured **when the cursor sets off for them**, so a stop can
target something an earlier click rendered (Make a Payment → modal's Continue).
Only the first stop must exist when the beat starts; a missing later stop is
skipped in place.

## How each animation works

### Lift / expand (`beats/useLiftTarget.ts`)

The real element is moved — no clones:

1. snapshot its inline styles; `scrollIntoView`;
2. insert an invisible **spacer** of the same size so siblings don't reflow;
3. pin it `position: fixed` at its current rect, z 260;
4. set the target `transform` (translate to centre + `scale`); a CSS transition
   does the motion: `transform 1000ms cubic-bezier(0.65,0,0.35,1)`,
   `opacity 500ms ease-out`;
5. on release, restore the snapshot and remove the spacer. The restore waits a
   microtask so a same-element handoff (lift → expand, StrictMode remount)
   doesn't snap.

Target lookup retries for ~30 frames (pages that render a beat late). In dev, a
console warning fires if an ancestor would trap `position: fixed` (filter,
transform, …).

### Backdrop (`walkthrough.css`)

One `.wt-backdrop` in `.wt-root`, styled by `data-beat-kind`: `rgba(0,0,0,.6)`
+ `blur(8px) saturate(1.1)`, fading on `opacity 500ms ease-out`. Blur is 8px by
decision — don't change without asking. `.wt-root` must not get
`isolation: isolate` (it would stop the blur reaching the Ask HOAi panel).

### Sticky stage (`WalkthroughOverlay.tsx`)

A `lift`/`expand` stays mounted through a directly following `annotate` or
`cursor` beat, and the backdrop follows it. During that cursor beat:

- a stop with `hideStage` dissolves the held element in place (still lifted,
  blur stays) — e.g. the payment modal now covers it;
- a stop with `releaseStage` lets it go: it snaps back to its slot as the blur
  fades.

Both last only for that beat visit; any cursor/direction change re-holds.

### Scripted cursor (`beats/CursorBeat.tsx`)

GSAP timeline, portaled to `<body>` at z 400.

- **Settle first**: before measuring, waits for every running *finite* CSS/WAAPI
  animation (max 1.5 s); infinite ones (spinners, typing dots) are ignored. This
  is how a cursor beat waits out the Ask HOAi panel morph or the onboarding
  loader — make an entrance animation finite and the cursor will wait for it.
- Travel: `durationMs` (default 1000) `power2.inOut`; drop travel is 1.2×.
- Click: 0.55 s pause → press (scale .82, 80 ms) → `click()` → release (140 ms).
- Type: 0.25 s lead-in, `typeCps` (default 14), 0.4 s settle, then `blur()` so
  the arrow keys work again.
- Drop: 0.35 s hover over the target, event fires, card shrinks away (0.2 s).
- Scroll: `power1.inOut` over `scrollMs`.
- `beatBusyRef` is true while the timeline runs; → / ← are ignored until it ends
  (see busy holds under Navigation rules).
- Going ← onto a cursor beat only moves the pointer to the first stop (no
  clicks).

### Ask HOAi panel (`src/chat/AskHoaiPanel.tsx`)

- One `position: fixed` panel with three forms — sidebar, focused (centred), and
  collapsed — each with an explicit `left` (never `auto`), so CSS morphs between
  them: `all 700ms cubic-bezier(0.65,0,0.35,1)`. Focused while the scene id is
  `ask-hoai`, and on the broadcast SMS scene's first beat so it slides out with
  the app unchanged (`askHoaiFocused` in `App.tsx`); a white canvas (z 180)
  fades in behind it (500 ms). From SMS beat 1 the phone covers the screen, so
  the panel morphs back and resets off-screen and the dashboard swipes back in
  already in its closing state.
- Welcome → conversation (GSAP): welcome + common questions fade up (350 ms),
  state commits via `flushSync`, the input FLIPs to the footer and the thread
  fades in (500 ms). Send is ignored while this runs.
- Scripted conversation: typing dots at +500 ms, reply streams from +1900 ms
  (3 chars / 25 ms), follow-up typed 1.4 s later, then the acknowledgement. All
  timers are tracked and cleared when the scene is left. A busy hold runs from
  Send until the script finishes, so → can't leave mid-stream.
- A file dropped on the input (`DROP_FILE_EVENT`) becomes an attachment chip and
  is sent with the next message.
- Leaving the scene: script stops at once; after the 700 ms morph back, the
  thread fades out (200 ms) and welcome / input / questions fade up (400 ms,
  staggered). Re-entering mid-way resets immediately.

### Scene swipe (`phone/SceneSwipe.tsx`)

- `AppSlide` wraps the app; `PhoneLayer` is a plain white `position: fixed`
  layer (z 220) holding the phone. Both follow the cursor through `swipeFor`.
- On the SMS scene the app sits at `translateX(-100%)` and the layer at `0`;
  everywhere else the layer is at `translateX(100%)`, `visibility: hidden`.
- Only two moves animate, both going forward: ask-hoai → broadcast-sms (app
  out, phone in) and broadcast-sms → closing-dashboard (back again). Both move
  in lockstep: `transform 900ms cubic-bezier(0.65,0,0.35,1)`. Every other
  change, ← included, is a hard cut. (Known quirk: a launcher jump from
  ask-hoai to broadcast-sms also animates.)
- The swipe holds busy from the scene change until the app wrapper's own
  `transitionend` for `transform` (1100 ms fallback).
- Outside the SMS scene, with no swipe in flight, the wrapper's transform is
  `none`: a transform traps `position: fixed` descendants, which would break
  lifts, the payment modal and the Ask HOAi panel.

### Phone stage (`phone/PhoneStage.tsx`)

- An iPhone-style frame (`PhoneFrame`) centred on white, sized from
  `min(72vh, 760px)`; styles are the `sms-*` rules in `walkthrough.css`. Lock
  screen with a static `Sunday, October 25` / `4:12`. No HOAi branding anywhere
  on the phone.
- State per beat comes from `phoneState.ts`: 0 empty lock screen, 1
  notification, 2 thread open on the broadcast, 3 reply typed, 4 answered.
  Landing on a cursor beat that's about to run (forward, or back with
  `replayOnAdvance`) shows the state *before* it so its clicks do the work;
  otherwise the state after it.
- Beat 1 arriving forward drops the notification in (`sms-notification-in`,
  500 ms overshoot) and holds busy until its `animationend` (700 ms fallback).
- The cursor beats are real clicks: the notification opens the thread, the
  input is typed into (`typeCps` 24), Send appends the reply. Send holds busy:
  typing dots at +500 ms, the answer at +1900 ms (`ANSWER_AT_MS`), then the
  hold is released. New bubbles fade up (`sms-bubble-in`, 300 ms).
- The phone keeps its last state when the scene is left, so it slides out
  intact; timers and holds are cleared on every beat change.

### Smaller app-side motions

- **Onboarding loader** (`App.tsx` root): the register CTA mounts onboarding
  under a white spinner overlay (z 240) that holds ~1 s and fades
  (`onboarding-loader-out`, 1250 ms, in `src/index.css`). Finite, so the next
  cursor beat waits for it.
- **Ask HOAi attachment chip**: `askhoai-file-in` keyframes, 320 ms overshoot.

## Navigation rules (`cursor.tsx`)

- → (also Space, PageDown): next beat, then next scene. ← (PageUp): previous.
  Home / Esc: start. End: last beat. `.`: toggle HUD. Keys are ignored while
  focus is in an input or while the walkthrough is busy.
- **Busy** (`isWalkthroughBusy()`): a running cursor beat (`beatBusyRef`) or any
  open `holdBusy()` hold. Holds are ref-counted and their release is
  idempotent; timed app sequences take one — the Ask HOAi chat (Send → end of
  script), the scene swipe, the phone's notification drop and its send →
  answer. While busy, → and ← do nothing, from the keyboard **and** the HUD
  buttons; the presenter just presses again once it settles.
- **Scene start state**: every scene change re-applies that scene's `appState`
  — phase (App root), onboarding screen (re-keys `NewResidentFlow`), page,
  dashboard view, Ask HOAi open (MainApp). MainApp also closes Quick Actions on
  every scene change, and resets the page even when consecutive scenes share
  one (a scene that clicked away, like ARC request → fence form, must still
  hand the next scene a clean dashboard).
- **Back across a scene boundary** onto a cursor beat sets `replayOnAdvance`:
  the scene's `appState` has undone that click, so the next → replays it
  instead of skipping ahead.
- **Back within a scene** onto a `replayOnBack` cursor beat does the same.
- Scrubbing back across phase boundaries is a **hard cut** (accepted).
- `reverseTo` on a cursor beat: ← clicks that element first (one frame before
  moving back) to undo the beat's effect.

## Z-index layers

| z | What |
| --- | --- |
| 40–50 | Mobile sidebar + backdrop |
| 105 | Intro card |
| 180 | White canvas behind focused Ask HOAi |
| 190 | Ask HOAi panel (sidebar form) |
| 195 | Elections / create-post modals |
| 200 | Ask HOAi panel (focused form); Quick Actions modal |
| 220 | Phone layer (white, SMS scene only) |
| 240 | Onboarding loader |
| 250 | `.wt-root` (backdrop, cutout, expand panel) |
| 260 | A lifted / expanded element |
| 300 | Payment modal |
| 310 | HUD |
| 400 | Scripted cursor + its file card |

The app wrapper (`.wt-app-slide`) is transformed only during the SMS scene and
its swipes. While it is, the whole app is one stacking context below the phone
layer; the rest of the time its transform is `none`, so the app's own layers
(lifts at 260, the payment modal at 300) stack against `.wt-root` as listed.

## Current scene order (`scenes/index.ts`)

intro → inbox (open email, click register CTA) → onboarding (password, Create
account) → autopay → go-to-portal → dashboard (still) → payments (lift, Make a
Payment modal walk-through) → arc-request (Quick Actions → ARC Request → fence
form, slow scroll) → ask-hoai (drop fence proposal, ask, scripted chat) →
broadcast-sms (swipe to the phone; storm broadcast arrives, tap it, reply,
answer) → closing-dashboard (swipe back; still).

`boardActions.tsx` and `amenity.tsx` exist but are out of the sequence (one line
each in `index.ts` to restore).

## Adding a scene

1. Tag the elements: `data-vt-name={VT.NewThing}` and add `NewThing` to `VT`.
2. Write `scenes/newScene.tsx` with an `appState` that fully describes the start
   (don't rely on what the previous scene left behind).
3. Add it to `scenes/index.ts`; extend `__tests__/sequence.test.ts` with its
   place and stops.
4. Prefer one cursor beat for a chain of clicks — ← from the next scene then
   resets and replays it cleanly.
5. If the app needs a new capability (a stop type, an event), add a failing test
   in `beats/__tests__` or `src/__tests__` first.

## Gotchas

- **HMR can strand lift state.** After editing `useLiftTarget.ts` while a lift is
  on screen, hard-reload (Cmd+Shift+R) before judging.
- **Anything with `filter`/`transform` on an ancestor breaks lifts** (traps
  `position: fixed`). Watch the dev console warning; it doesn't check the CSS
  `translate`/`scale`/`rotate` properties Tailwind v4 emits.
- **jsdom** has no layout, transitions, `getAnimations` or `AnimationEvent`
  (React listens for `webkitAnimationEnd` there). Tests drive GSAP with
  `timeline.progress(1)`; every visual claim needs a check in the browser.
- **Don't run `pnpm format`/oxfmt on `src/walkthrough/*`** — it strips
  semicolons from TS type literals. Hand-format.
- Reduced-motion is not applied to lifts or the panel morph.

## Older docs

- `docs/superpowers/specs/2026-10-21-walkthrough-css-rewrite-design.md` — design
  rationale for the current lift/backdrop (still accurate for its scope).
- `docs/HANDOFF-2026-10-21.md` — session handoff; overlaps this file.
- `docs/superpowers/specs/2026-10-09-curated-walkthrough-design.md`,
  `docs/HANDOFF-2026-10-15.md` — **superseded** (built on the View Transitions
  API, since removed).
