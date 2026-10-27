# Walkthrough & animation reference

How the stage-demo walkthrough is structured, how each animation works, and the
rules that keep it trustworthy on stage. This is the current reference; when it
disagrees with an older spec or handoff, this file wins (and if this file
disagrees with the code, the code wins — fix this file).

Last updated 2026-10-25 (branch `walkthrough-subsystem`): phone scenes are
independent of their neighbours (`stage: "phone"`, the app scene, a generic
swipe); broadcast SMS scene, phone stage and busy holds.

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
   ├─ <AppSlide>                   slides the app out for phone scenes (SceneSwipe.tsx)
   │  └─ <App/>                    the real app; syncs to useCursor()'s app scene
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
| `src/walkthrough/signal.ts` | `SIGNAL_EVENT`, the event a cursor "signal" fires, and the signal names pages listen for |
| `src/walkthrough/phone/phoneState.ts` | SMS copy (`SMS_SENDER`, `SMS_BROADCAST`, `SMS_PREVIEW` (the notification text, shown in full up to "flooding is possible."), `SMS_REPLY`, `SMS_ANSWER`) and the phone's state per beat |
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

`appState.balancePaid` sets the payments widget to $0.00 (otherwise $425.00).
Every portal scene after Payments declares it, since the Payments scene pays
the balance in the modal (the widget drops to $0.00 when the modal closes on a
processed payment). ← from the next scene back onto Payments' last beat shows
$425.00 again (the scene's own appState).

Each **beat** is one press of → . Targets are elements tagged
`data-vt-name={VT.Something}`; add new names to `VT` (the sequence test checks
every beat targets a known name and that names are unique).

| Beat `kind` | What the audience sees | Backdrop |
| --- | --- | --- |
| `idle` | Nothing extra — the app as-is | none |
| `intro` | Full-screen white title card with logo / wordmark | white |
| `highlight` | Scrolls target into view; everything but the target is dimmed and blurred | own cutout layer (`.wt-cutout`: dim .55, blur 16px) |
| `lift` | The real element floats to centre (or `"top-left"`, 40px in, or a point), scaled, above a blurred dim. With `aside`, a top-left lift gets a panel filling the rest of the screen beside it (fades in; measured from the element's width × scale + 32px gap) | blur + dim |
| `expand` | Target lifts and dissolves while a detail panel (`content`) fades in at centre | blur + dim |
| `annotate` | GSAP arrows / pulses / typed caption drawn over the stage | blur + dim |
| `narrate` | Title + body text | blur + dim |
| `cursor` | A scripted pointer moves, clicks, types, scrolls, drops files | follows the stage (see below) |

Captions (`caption`) are authored but **not shown** — `.wt-caption` is
`display: none`.

### Phone scenes and the app scene

A scene with `stage: "phone"` slides the app off-screen and shows the phone
stage instead (today only `broadcast-sms`). Note that the phone's *content* is
still the SMS script: `PhoneStage` renders its lock screen / thread for the
scene whose id is `SMS_SCENE_ID`, so a second phone scene would show the same
phone until `PhoneStage` learns to render per scene. A phone scene has **no
`appState`**: the app doesn't take its state from it. Instead the reducer keeps
`appSceneIndex`, the scene the app underneath shows, and `useCursor()` returns
it as `appScene` / `appSceneId` / `appPage`:

- on a non-phone scene it is that scene;
- on a phone scene's beat 0 it keeps its previous value, so the app slides out
  exactly as the audience last saw it, whichever scene that was (→, ← or a
  launcher jump);
- on a phone scene's beat 1+ (the app is off-screen) it is the next non-phone
  scene in the sequence (unchanged if there is none), so the app is already in
  place when the phone slides away.

Everything in `App.tsx` that syncs the app to the walkthrough (root phase,
MainApp page / view / Ask HOAi open, Ask HOAi focus and restart) reads the app
scene. The sync effects are keyed on `appSyncKey` (also from `useCursor()`),
a counter the reducer bumps when the app scene changes **or** the cursor
arrives at a non-phone scene from a different scene. The second case is ←
out of a phone scene's beat 0: the app scene stays the same, but the scene
must still be put back to its start (its last cursor beat is replayed by
`replayOnAdvance`). → onto a phone scene's beat 0 never bumps, so nothing
changes while the app slides out. The overlay, HUD, beats and the phone read the cursor's own scene.

### Cursor beats

A cursor beat is a list of stops: the beat's own fields are the first stop,
`then` adds more. Each stop's `action`:

| `action` | Behaviour |
| --- | --- |
| `"click"` | Travel to target centre, pause, press, real `click()` + `focus()` |
| `"hover"` or omitted | Travel only |
| `"tab"` | No travel; focus the target (as if Tab was pressed), then type |
| `"scroll"` | No travel; ease the target's own scroll to its bottom over `scrollMs` (default 4000), or with `scrollTo` until that element is centred in the target (clamped to the scroll range), or with `scrollToTop` back up to the top. Also allowed as the beat's own `action` (with `scrollMs`), so a beat can open on a scroll without the pointer moving |
| `"drop"` | Cursor enters from off the right edge carrying a file card labelled `file`, travels to the target, lets go: fires `DROP_FILE_EVENT` (`{ name }`, bubbling) on it |
| `"signal"` | No travel; fires `SIGNAL_EVENT` (`{ name: signal }`, bubbling) on the target, which changes itself. For scripted changes with no on-screen control (Elections → Results while its tab pill is hidden) |

Per-stop extras: `typeText` + `typeCps` (types into an input via the native
setter so React sees it), `holdMs` (pause after the stop), `hideStage` /
`releaseStage` (see sticky stage). Beat-only extras: `durationMs` (travel time),
`reverseTo` (element clicked when the presenter goes ← from this beat, to undo
its effect), `replayOnBack` (beat undoes itself, so ← then → replays it),
`advanceAfter` (going forward, move straight on to the next beat once this one
ends: a click whose effect is that beat, e.g. View Availability → the card
lifts), `scrollTo` (with a beat-level `"scroll"` action).

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
   `opacity 500ms ease-out`. The translate is nudged so the scaled box's
   top-left lands on a whole pixel, and `will-change: transform` is dropped on
   the transform's `transitionend` so the browser re-renders the text at the
   lifted size (otherwise a scaled lift stays a soft, stretched bitmap);
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

GSAP timeline, portaled to `<body>` at z 400. In a `stage: "phone"` scene the
pointer is a fingertip circle centred on the point (`pointer="touch"`, chosen by
the overlay from the scene flag) instead of the arrow.

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
  them: `all 700ms cubic-bezier(0.65,0,0.35,1)`. Focused while the **app
  scene** is `ask-hoai` (`askHoaiFocused = appSceneId === "ask-hoai"` in
  `App.tsx`); a white canvas (z 180) fades in behind it (500 ms). So when a
  phone scene follows ask-hoai, the panel stays focused on its beat 0 and
  slides out with the app unchanged; from beat 1 the app scene moves on, the
  panel morphs back and resets off-screen behind the phone, and the app swipes
  back in already in the next scene's state.
- Welcome → conversation (GSAP): welcome + common questions fade up (350 ms),
  state commits via `flushSync`, the input FLIPs to the footer and the thread
  fades in (500 ms). Send is ignored while this runs.
- Scripted conversation: typing dots at +500 ms, reply streams from +1900 ms
  (3 chars / 25 ms), follow-up typed 1.4 s later, then the acknowledgement. All
  timers are tracked and cleared when the scene is left. While focused, a busy
  hold runs from Send until the script finishes, so → can't leave mid-stream. A
  manual Send in the sidebar takes no hold.
- A file dropped on the input (`DROP_FILE_EVENT`) becomes an attachment chip and
  is sent with the next message.
- Unfocusing (the app scene leaves ask-hoai: a phone scene's beat 0 → 1, or
  any jump away): script stops at once; after
  the 700 ms morph back, the thread fades out (200 ms) and welcome / input /
  questions fade up (400 ms, staggered). Re-focusing before that fade has run
  resets immediately.
- ← around a phone scene after ask-hoai: from beat 1 to beat 0 the app scene
  stays on the next scene, so the panel stays unfocused off-screen. From beat 0,
  ← to ask-hoai keeps the app scene (and `focused`) unchanged, so nothing above
  fires; instead App passes `restart`
  (`appSceneId === "ask-hoai" && direction === "back"`) and the panel resets to
  the welcome view at once (script stopped, hold released, no fade) while the
  app slides back in. The next → replays the drop and the scripted chat once.

### Scene swipe (`phone/SceneSwipe.tsx`)

- `AppSlide` wraps the app; `PhoneLayer` is a plain white `position: fixed`
  layer (z 220) holding the phone. Both follow the cursor's scene through
  `swipeFor(prev, isPhone)`, which only looks at the scene's `stage` flag,
  never at scene ids.
- On a phone scene the app sits at `translateX(-100%)` and the layer at `0`;
  everywhere else the layer is at `translateX(100%)`, `visibility: hidden`.
- Entering or leaving a phone scene **always** slides, in either direction and
  however it's reached: →, ←, or a launcher jump from any scene. Only the very
  first render and moves between scenes of the same kind (non-phone ⇄
  non-phone, or within a phone scene) don't animate. App and phone move in
  lockstep: `transform 600ms cubic-bezier(0.4,0,0.2,1)` (`SWIPE_MS`), a
  decelerating curve that starts moving at once so it reads as a slide rather
  than a pop.
- The swipe holds busy from the scene change until the app wrapper's own
  `transitionend` for `transform` (900 ms fallback).
- `PhoneLayer` passes `swipeInMs` (`SWIPE_MS` while swiping in, else 0) to the
  phone, which reads it on landing to time the notification.
- Outside phone scenes, with no swipe in flight, the wrapper's transform is
  `none`: a transform traps `position: fixed` descendants, which would break
  lifts, the payment modal and the Ask HOAi panel.

### Phone stage (`phone/PhoneStage.tsx`)

- An iPhone-style frame (`PhoneFrame`) centred on white, sized from
  `min(72vh, 760px)`; styles are the `sms-*` rules in `walkthrough.css`. Lock
  screen with a static `Sunday, October 25` / `4:12`. No HOAi branding anywhere
  on the phone.
- Two beats. State per beat comes from `phoneState.ts`: 0 lock screen with
  the notification, 1 answered (thread open, reply sent, answer in).
  Arriving forward on beat 0 starts with no notification. Landing on a cursor
  beat that's about to run (forward, or back with `replayOnAdvance`) shows the
  state *before* it so its clicks do the work; otherwise the state after it.
- Beat 0 arriving forward drops the notification in by itself
  (`sms-notification-in`, 500 ms overshoot): `NOTIFICATION_DELAY_MS` (500 ms)
  after the swipe lands, i.e. `SWIPE_MS + 500` = 1100 ms after any arrival
  from another scene (all of which swipe), or 500 ms after a jump within the
  scene. Busy is held from landing
  until its `animationend` (700 ms fallback after the drop), so keys stay
  blocked with no gap after the swipe. Reaching beat 0 by ← (from beat 1)
  shows the notification already there, with no animation and no hold.
  Leaving the beat or unmounting before the drop cancels it and releases the
  hold.
- Beat 1 is one cursor beat of real clicks (`then` stops): the notification
  opens the thread, the input is typed into (`typeCps` 24), Send appends the
  reply. The scripted tap holds busy until Send takes over the hold
  (`THREAD_HOLD_FALLBACK_MS` 12 s backstop), so → can't cut the beat short; a
  tap by hand outside the cursor beat holds nothing. The input is a
  one-row `<textarea>` that a layout effect resizes to its `scrollHeight` on
  every draft change, so the whole reply stays visible while it is typed. Send holds busy:
  typing dots at +500 ms, the answer at +1900 ms (`ANSWER_AT_MS`), then the
  hold is released. New bubbles fade up (`sms-bubble-in`, 300 ms).
- The phone keeps its last state when the scene is left, so it slides out
  intact; timers and holds are cleared on every beat change. ← from the next
  scene slides the phone back in on beat 1 showing the lock screen with the
  notification, and the next → replays the tap, reply and answer.
- `PhoneStage` checks the cursor against its own `SMS_SCENE_ID`; that is its
  own scene, not a neighbour.

### Smaller app-side motions

- **Onboarding loader** (`App.tsx` root): the register CTA mounts onboarding
  under a white spinner overlay (z 240) that holds ~1 s and fades
  (`onboarding-loader-out`, 1250 ms, in `src/index.css`). Finite, so the next
  cursor beat waits for it.
- **Ask HOAi attachment chip**: `askhoai-file-in` keyframes, 320 ms overshoot.
- **Board task detail sheet** (`BoardTasksWidget`, View Details): slides in
  from the right (`board-sheet-in`, 350 ms ease-out) as its backdrop fades up;
  closing (X or backdrop) slides it back out (`board-sheet-out`, 250 ms) and it
  unmounts on `animationend`.
- **Page loaders** (`CommunityFeedPage`, `ArcFormPage`, `ReservationsPage`,
  `ElectionsPage` (its floating tab pill waits too), `OffersPage`): every
  visit shows a centred spinner (`PageLoader`) for `PAGE_LOAD_MS` (1500 ms,
  `usePageLoad` in `src/pageLoad.ts`), then the content fades up
  (`page-content-in`, 300 ms).
  The content doesn't exist until then, so the click that opens the page holds
  `PAGE_LOAD_MS` + a beat (community-feed +1000, arc-request +1300, offers +500
  on both its Offers and Home clicks) before the
  scroll stop measures it.
  `DashboardPage` loads too, but only when a click brings it there (Go to
  portal, Home nav, ARC Cancel): scene jumps land on it ready (`dashboardLoads`
  in `MainApp`, reset on every scene sync; `portalEntering` in `App` marks the
  Go to portal click), so dashboard scenes never wait for it and their targets
  exist at beat 0. The go-to-portal click holds `PAGE_LOAD_MS` + 300 so → stays
  blocked until the dashboard is in.

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
- **Scene start state**: the app follows the **app scene** (see "Phone scenes
  and the app scene"). Every `appSyncKey` bump (an app-scene change, or
  arriving at a non-phone scene from another scene) re-applies that scene's
  `appState` — phase (App root), onboarding screen (re-keys
  `NewResidentFlow`), page, dashboard view, Ask HOAi open (MainApp). MainApp
  also closes Quick Actions on every bump, and resets the page even
  when consecutive scenes share one (a scene that clicked away, like ARC
  request → fence form, must still hand the next scene a clean dashboard).
  Entering a phone scene on beat 0 changes nothing in the app; its beat 1
  applies the next non-phone scene's `appState` off-screen.
- **Back across a scene boundary** onto a cursor beat sets `replayOnAdvance`:
  the scene's `appState` has undone that click, so the next → replays it
  instead of skipping ahead.
- A scene with **`reenterAtStart`** is entered by ← from the next scene on
  beat 0 instead of its last beat (with `replayOnAdvance` if beat 0 is a cursor
  beat), for scenes whose later beats sit on a page their `appState` doesn't
  show (community-feed lifts a post on the feed page, but starts idle on the
  dashboard; offers clicks Home from the offers page).
- A scene with **`keepPage`** leaves the portal on whatever page it is showing
  when entered (its `page` only applies to a freshly mounted portal), so it
  works from any page: offers starts by clicking Offers in the sidebar, from
  the feed in sequence or the dashboard from a launcher jump.
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
| 196–197 | Board task detail sheet: backdrop, sheet (over the Ask HOAi sidebar panel) |
| 200 | Ask HOAi panel (focused form); Quick Actions modal |
| 220 | Phone layer (white, phone scenes only) |
| 240 | Onboarding loader |
| 250 | `.wt-root` (backdrop, cutout, expand panel) |
| 260 | A lifted / expanded element |
| 300 | Payment modal |
| 310 | HUD |
| 400 | Scripted cursor + its file card |

The app wrapper (`.wt-app-slide`) is transformed only during phone scenes and
their swipes. While it is, the whole app is one stacking context below the phone
layer; the rest of the time its transform is `none`, so the app's own layers
(lifts at 260, the payment modal at 300) stack against `.wt-root` as listed.

## Current scene order (`scenes/index.ts`)

intro → inbox (open email, click register CTA) → onboarding (password, Create
account) → autopay → go-to-portal → dashboard (pointer stays put; scrolls to the bottom, rests 3 s,
scrolls back up) → payments (lift, Make a
Payment modal walk-through; balance $425.00 → $0.00) → arc-request (Quick Actions → ARC Request → fence
form, slow scroll) → ask-hoai (drop fence proposal, ask, scripted chat) →
community-feed (still on the dashboard; → View All Posts → feed scrolls down to
the last post, then back up until the Forgotten Island post is
centred; lift it at 1.15×; → sets it back down) → offers (click Offers in the
sidebar, page loads; → click Home, dashboard loads) → amenity-reservation
(click Reservations, page loads; → scroll to the Conference Room card, click
View Availability, it lifts top-left at 1.25× beside a 9 AM–5 PM week calendar
(`AmenityBookingStage`, walkthrough-only); → the pointer rests on the open
Tue 27 1 PM slot (its one-hour hover block shows; CursorBeat sends mouseover on
arrival and mouseout when the beat ends) and clicks it,
the Book Reservation modal opens (portaled, z 300); → it all goes away and the
card settles back) → broadcast-sms (swipe to the phone; storm broadcast arrives by itself, tap
it, reply, answer) → elections (swipe back to the dashboard; click Elections,
page loads, slow scroll down past the ballot and the current and upcoming
elections, rest 1.5 s, slow scroll back to the top, then a `signal` stop
switches it to Results, which fades up; → click Home, dashboard loads in the
board member view — a `signal` stop right after the click sets it during the
spinner, so Board Actions joins the sidebar and the board tasks widget shows
under the notification banner;
appState `electionsConsented` keeps the electronic-consent modal shut and
`hideElectionsTabToggle` hides the floating tab pill)
→ closing-dashboard (still; board member view).

`boardActions.tsx` and `amenity.tsx` exist but are out of the sequence (one line
each in `index.ts` to restore).

## Adding a scene

1. Tag the elements: `data-vt-name={VT.NewThing}` and add `NewThing` to `VT`.
2. Write `scenes/newScene.tsx` with an `appState` that fully describes the start
   (don't rely on what the previous scene left behind). A phone scene sets
   `stage: "phone"` and no `appState` instead.
   **Scenes must not reference neighbouring scene ids.** No transition, sync or
   panel behaviour may name the scene before or after it; use scene flags
   (`stage`) and the app scene instead, so the order can be changed freely. A
   scene may use its own id for its own logic.
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
