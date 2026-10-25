# Broadcast SMS Scene Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `broadcast-sms` walkthrough scene between `ask-hoai` and `closing-dashboard`: the app swipes left, a phone on a white screen receives the management broadcast, the homeowner replies, the reply is answered, then the app swipes back. Presenter keys are ignored while anything animates.

**Architecture:** A shared, ref-counted busy hold (`holdBusy`) joins the existing `beatBusyRef` so app-side timed sequences (Ask HOAi chat, phone reply, swipes, notification) block → / ←. The phone is a scene-level stage (`PhoneStage`) mounted beside the app in `WalkthroughRoot`. It derives its state from the cursor through a pure `phoneStateOnLanding` function and is driven forward by ordinary cursor beats that click real elements. A wrapper around the app (`AppSlide`) translates the whole app off-screen only while the SMS scene is on, so `transform` never traps `position: fixed` or the z-layers elsewhere in the demo.

**Tech Stack:** React 19, TypeScript, Tailwind v4, plain CSS transitions/keyframes in `walkthrough.css`, Vitest + Testing Library (jsdom).

**Spec:** `docs/superpowers/specs/2026-10-25-broadcast-sms-scene-design.md` (read with `docs/walkthrough.md`).

## Global Constraints

- Scene id `broadcast-sms`, label `"Broadcast SMS"`, order: `… ask-hoai → broadcast-sms → closing-dashboard`.
- Sender name: `Waterfront Community Estates`; avatar initials `WC`.
- Broadcast copy (exact): `⚠️ Severe storms are moving through the area this evening. Local flooding is possible. Please avoid low-lying roads and stay indoors. — Waterfront Community Estates Management`
- Homeowner reply (exact): `Are any of the amenities still open?`
- Answer (exact): `No, the gym, pool, and clubhouse are all closed until further notice. We'll text you as soon as they reopen.`
- **No HOAi branding anywhere on the phone** — no "Answered by HOAi", sparkles, "AI".
- Background behind the phone: plain white.
- Phone clock `4:12`, date `Sunday, October 25` (static).
- Motion: `cubic-bezier(0.65,0,0.35,1)`; swipe `900ms`; every entrance animation finite.
- Every step waits for →; → / ← (keys **and** HUD buttons) are ignored while anything animates.
- Don't run `pnpm format`/oxfmt on `src/walkthrough/*` — hand-format. Double quotes for strings with apostrophes.
- Run tests with `pnpm test` (vitest run). Commit per task; message ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Presenter mashes → mid-animation** (during the swipe, the notification drop, the typing dots, or the Ask HOAi stream): nothing advances until it finishes. Task 1 and Task 2 tests, Task 4 reply test, Task 5 swipe test.
2. **← from closing-dashboard back into the SMS scene**: hard cut, phone shows the typed-but-unsent reply, and the next → replays Send (not a dead press). Task 3 test `back across the boundary shows the pre-send state`.
3. **Launcher jump straight into `broadcast-sms` or past it**: app is not translated outside the scene, so later lifts (and the payment modal at z 300) still work. Task 5 test `no transform outside the SMS scene`.
4. **Leaving a scene while a busy hold is active** (Escape/Home jump, unmount): the hold is released, or keys would lock forever. Task 1 `release is idempotent`, Task 2 `stopScript releases`, Task 4 `unmount releases`.
5. **Ask HOAi panel morphing back to the sidebar while it's sliding out**: focus stays on through beat 0 of the SMS scene. Task 6 sceneSync test.

---

### Task 1: Shared busy hold

**Files:**
- Modify: `src/walkthrough/cursor.tsx` (next to `beatBusyRef`)
- Modify: `src/walkthrough/keyboard.ts:22,28`
- Modify: `src/walkthrough/WalkthroughHUD.tsx` (prev/next `onClick`)
- Test: `src/walkthrough/__tests__/cursor.test.ts`, `src/walkthrough/__tests__/keyboard.test.tsx`, `src/walkthrough/__tests__/WalkthroughHUD.test.tsx`

**Interfaces:**
- Produces: `holdBusy(): () => void` — increments a module-level count, returns an idempotent release. `isWalkthroughBusy(): boolean` — `beatBusyRef.current || count > 0`. `beatBusyRef` stays as is (CursorBeat keeps using it).

- [ ] **Step 1: Write the failing tests**

```ts
// cursor.test.ts
it("holdBusy makes the walkthrough busy until every hold is released", () => {
  const a = holdBusy(); const b = holdBusy();
  expect(isWalkthroughBusy()).toBe(true);
  a(); expect(isWalkthroughBusy()).toBe(true);
  b(); expect(isWalkthroughBusy()).toBe(false);
});
it("release is idempotent", () => {
  const a = holdBusy(); const b = holdBusy();
  a(); a();
  expect(isWalkthroughBusy()).toBe(true);
  b();
  expect(isWalkthroughBusy()).toBe(false);
});
// keyboard.test.tsx
it("ignores ArrowRight / ArrowLeft while a busy hold is active", () => {
  const { result } = renderHook(() => useAll(), { wrapper });
  const release = holdBusy();
  fireEvent.keyDown(window, { key: "ArrowRight" });
  expect(result.current.cursor).toEqual({ sceneIndex: 0, beatIndex: 0 });
  release();
  fireEvent.keyDown(window, { key: "ArrowRight" });
  expect(result.current.cursor).toEqual({ sceneIndex: 0, beatIndex: 1 });
});
// WalkthroughHUD.test.tsx — same shape: with a hold active, clicking "next →" leaves the cursor unchanged.
```

- [ ] **Step 2: Run** `pnpm test src/walkthrough/__tests__` — Expected: FAIL (`holdBusy` not exported).
- [ ] **Step 3: Implement** `holdBusy` / `isWalkthroughBusy` in `cursor.tsx`; replace the two `beatBusyRef.current` checks in `keyboard.ts` with `isWalkthroughBusy()`; wrap the HUD's `back`/`advance` in a guard on `isWalkthroughBusy()`. Update the comment above `beatBusyRef` to mention the holds.
- [ ] **Step 4: Run** `pnpm test` — Expected: all PASS.
- [ ] **Step 5: Commit** `feat(walkthrough): shared busy hold so timed app sequences block presenter keys`

---

### Task 2: Ask HOAi scripted chat holds busy

**Files:**
- Modify: `src/chat/AskHoaiPanel.tsx` (`handleSend`, `animateUserFollowUp`'s final `typeAgentMessage`, `stopScript`)
- Test: `src/chat/__tests__/askHoaiBusy.test.tsx` (create; render `<AskHoaiPanel open focused />` inside `WalkthroughProvider` if it needs `useCursor` — it doesn't today)

**Interfaces:**
- Consumes: `holdBusy`, `isWalkthroughBusy` (Task 1).
- Produces: nothing new.

- [ ] **Step 1: Write the failing tests** (fake timers)
  - `holds busy from Send until the acknowledgement finishes streaming`: type into the input, click Send → `isWalkthroughBusy()` is `true`; `vi.advanceTimersByTime(20_000)` → the thread contains `"Ok, I'll get started. Just a moment."` and `isWalkthroughBusy()` is `false`.
  - `stopScript releases`: click Send, then rerender with `focused={false}` → `isWalkthroughBusy()` is `false` immediately.
- [ ] **Step 2: Run** `pnpm test src/chat` — Expected: FAIL (busy is `false` after Send).
- [ ] **Step 3: Implement** — keep the release in a ref (`releaseScriptBusyRef`). Take the hold in `handleSend` after the morph guard and only when text is non-empty. Release it in the `onDone` of the final `typeAgentMessage("Ok, I'll get started…")` (add the callback) and in `stopScript`.
- [ ] **Step 4: Run** `pnpm test` — Expected: PASS.
- [ ] **Step 5: Commit** `feat(ask-hoai): block presenter keys until the scripted chat finishes`

---

### Task 3: Phone state model

**Files:**
- Create: `src/walkthrough/phone/phoneState.ts`
- Modify: `src/walkthrough/cursor.tsx` (`useCursor` also returns `replayOnAdvance: state.replayOnAdvance ?? false`)
- Test: `src/walkthrough/phone/__tests__/phoneState.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export const SMS_SENDER = "Waterfront Community Estates";
  export const SMS_BROADCAST = "…";   // exact copy from Global Constraints
  export const SMS_REPLY = "Are any of the amenities still open?";
  export const SMS_ANSWER = "…";      // exact copy
  export type PhoneMessage = { from: "them" | "me"; text: string };
  export type PhoneState = {
    notification: boolean;
    view: "lock" | "thread";
    draft: string;
    messages: PhoneMessage[];
  };
  /** State after beat `n` (0 lock, 1 notification, 2 thread open, 3 reply typed, 4 answered). */
  export function settledPhoneState(beatIndex: number): PhoneState;
  /**
   * What to show when the cursor lands on `beatIndex`. A cursor beat that is
   * about to run (forward arrival, or back with replayOnAdvance) shows the
   * state *before* it so its clicks have something to do; otherwise the
   * state after it.
   */
  export function phoneStateOnLanding(
    beatIndex: number,
    opts: { isCursorBeat: boolean; direction: "forward" | "back"; replayOnAdvance: boolean },
  ): PhoneState;
  ```
- `useCursor()` additionally returns `replayOnAdvance: boolean`.

- [ ] **Step 1: Write the failing tests**
  - `settledPhoneState(0)` → `{ notification: false, view: "lock", draft: "", messages: [] }`.
  - `settledPhoneState(1).notification === true` and `view === "lock"`.
  - `settledPhoneState(2)` → `view "thread"`, `messages: [{ from: "them", text: SMS_BROADCAST }]`, `draft ""`.
  - `settledPhoneState(3).draft === SMS_REPLY`.
  - `settledPhoneState(4).messages` equals broadcast, `{ from: "me", text: SMS_REPLY }`, `{ from: "them", text: SMS_ANSWER }`; `draft ""`.
  - `forward onto a cursor beat shows the state before it`: `phoneStateOnLanding(3, { isCursorBeat: true, direction: "forward", replayOnAdvance: false })` equals `settledPhoneState(2)`.
  - `back within the scene shows the beat's result`: `(3, { isCursorBeat: true, direction: "back", replayOnAdvance: false })` equals `settledPhoneState(3)`.
  - `back across the boundary shows the pre-send state`: `(4, { isCursorBeat: true, direction: "back", replayOnAdvance: true })` equals `settledPhoneState(3)`.
  - `non-cursor beats always show their own state`: `(1, { isCursorBeat: false, direction: "forward", replayOnAdvance: false })` equals `settledPhoneState(1)`.
  - `SMS copy carries no HOAi branding`: none of the four strings match `/hoai|\bai\b/i`.
- [ ] **Step 2: Run** `pnpm test src/walkthrough/phone` — Expected: FAIL (module missing).
- [ ] **Step 3: Implement** `phoneState.ts` and the `replayOnAdvance` field on `useCursor`.
- [ ] **Step 4: Run** `pnpm test` — Expected: PASS.
- [ ] **Step 5: Commit** `feat(walkthrough): phone state model for the broadcast SMS scene`

---

### Task 4: PhoneStage component

**Files:**
- Create: `src/walkthrough/phone/PhoneStage.tsx` (default export), `src/walkthrough/phone/PhoneFrame.tsx` (bezel + dynamic island, takes `children`)
- Modify: `src/walkthrough/viewTransitionNames.ts` — add `SmsNotification: "wt-sms-notification"`, `SmsInput: "wt-sms-input"`, `SmsSendBtn: "wt-sms-send-btn"`
- Modify: `src/walkthrough/walkthrough.css` — `@keyframes sms-notification-in` (drop from `translateY(-24px)`, opacity 0 → 1, 500ms, overshoot), `@keyframes sms-bubble-in` (300ms)
- Test: `src/walkthrough/phone/__tests__/PhoneStage.test.tsx`

**Interfaces:**
- Consumes: `phoneStateOnLanding`, `settledPhoneState`, copy constants (Task 3); `useCursor()` incl. `replayOnAdvance`; `holdBusy` (Task 1).
- Produces: `<PhoneStage />` with no props. It renders nothing when `sceneId !== "broadcast-sms"` (Task 5 wraps it in the sliding layer). Exports `SMS_SCENE_ID = "broadcast-sms"`, and the scene and other tasks import it from here.

Behaviour:
- On every cursor change while in the scene: stop any running reply script (releasing its hold), then `setState(phoneStateOnLanding(beatIndex, …))`, where `isCursorBeat` is `scene.beats[beatIndex].kind === "cursor"`.
- Landing forward on beat 1: the notification mounts with `sms-notification-in`; hold busy for the 500ms animation (release on `animationend`, with a 700ms timeout fallback).
- Notification is a `<button data-vt-name={VT.SmsNotification}>`; click → `view: "thread"`, `messages: [broadcast]`.
- Input is a controlled `<input data-vt-name={VT.SmsInput}>` bound to `draft` (CursorBeat types through the native setter, so `onChange` must update `draft`).
- Send is `<button data-vt-name={VT.SmsSendBtn}>`; click with a non-empty draft → hold busy, append `{ from: "me", text: draft }`, clear draft; +500ms typing dots; +1900ms dots off, append `{ from: "them", text: SMS_ANSWER }` (whole bubble, `sms-bubble-in`), release. Track the timers so they're cleared on cursor change and unmount.
- Look per the approved mockup (`.superpowers/brainstorm/99937-1792936417/content/phone-flow.html`): phone height `min(72vh, 760px)`, aspect `9 / 19.5`, bezel `#111`, lock wallpaper `linear-gradient(160deg,#1d3b66,#3f6fa8 55%,#7aa3cf)`, frosted notification card ("MESSAGES" · "now", bold sender, 2-line clamped preview), Messages header with `WC` avatar `#0d5bba`, incoming `#e9e9eb`, outgoing `#0a84ff`/white, typing dots reusing the `askhoai-dot` keyframes. Scale the mockup's px proportionally to the phone height.

- [ ] **Step 1: Write the failing tests** — render `<PhoneStage />` inside `WalkthroughProvider` with a two-scene test sequence that mirrors the real one (`{ id: "before", beats: [idle] }`, `{ id: "broadcast-sms", beats: [idle, idle, cursor→SmsNotification, cursor→SmsInput, cursor→SmsSendBtn] }`) and drive the cursor with `jumpTo` / `advance` / `back` from `useCursor`. Use fake timers.
  - `keeps its last state after leaving the scene`: settle on beat 4, `advance()` to the next scene → the answer text is still rendered.
  - `beat 0 is a lock screen with no notification`: `4:12` visible, no `[data-vt-name="wt-sms-notification"]`.
  - `beat 1 shows the notification from the sender`: notification contains `Waterfront Community Estates`; `isWalkthroughBusy()` is `true` until `fireEvent.animationEnd` (or 700ms).
  - `clicking the notification opens the thread with the broadcast`.
  - `send shows typing dots then the answer and releases busy`: from beat 3 state, click send → `isWalkthroughBusy()` `true`; at 500ms the dots show; at 1900ms the `SMS_ANSWER` text shows, dots are gone, and busy is `false`.
  - `back from beat 4 to beat 3 restores the typed reply`: input value is `SMS_REPLY` and the answer is gone.
  - `never shows HOAi branding`: at beat 4 settled, `container.textContent` doesn't match `/hoai/i`.
  - `unmount releases`: unmount mid-reply → `isWalkthroughBusy()` is `false`.
- [ ] **Step 2: Run** `pnpm test src/walkthrough/phone` — Expected: FAIL.
- [ ] **Step 3: Implement** `PhoneFrame.tsx`, `PhoneStage.tsx`, the VT names and the keyframes.
- [ ] **Step 4: Run** `pnpm test` — Expected: PASS (the sequence test's "known VT names" still passes).
- [ ] **Step 5: Commit** `feat(walkthrough): phone stage with lock screen, notification and SMS thread`

---

### Task 5: The swipe (AppSlide + phone layer)

**Files:**
- Create: `src/walkthrough/phone/SceneSwipe.tsx` — exports `AppSlide` (wraps the app) and `PhoneLayer` (white full-screen layer holding `<PhoneStage />`), plus pure `swipeFor(...)`
- Modify: `src/walkthrough/WalkthroughRoot.tsx` — `Inner` renders `<AppSlide>{children}</AppSlide>` then `<PhoneLayer />` before the overlay
- Modify: `src/walkthrough/walkthrough.css` — `.wt-app-slide`, `.wt-phone-layer`
- Test: `src/walkthrough/phone/__tests__/SceneSwipe.test.tsx`

**Interfaces:**
- Consumes: `SMS_SCENE_ID`, `<PhoneStage />` (Task 4); `useCursor`, `holdBusy`.
- Produces:
  ```ts
  /** Where the app sits and whether the move animates. */
  export function swipeFor(
    prevSceneId: string | undefined,
    sceneId: string | undefined,
    direction: "forward" | "back",
  ): { offset: "none" | "out"; animate: boolean };
  ```
  `offset` is `"out"` iff `sceneId === SMS_SCENE_ID`. `animate` is true only for `ask-hoai → broadcast-sms` and `broadcast-sms → closing-dashboard` going forward. Every other change, including any `back` and any launcher jump, is a hard cut.

Rules:
- `.wt-app-slide` is `height: 100%` (it sits inside `#root`). Its `transform` is **`none`** whenever `offset` is `"none"` and no swipe is in flight. A transform makes a containing block and stacking context, which breaks lifts and the payment modal's z 300 against `.wt-root` z 250 in every other scene.
- Out: `translateX(-100%)`. The phone layer is `position: fixed; inset: 0; background: #fff; z-index: 220`, with `translateX(100%)` when hidden and `0` when shown, so the two move in lockstep. Both get `transition: transform 900ms cubic-bezier(0.65,0,0.35,1)` only when `animate`.
- While an animated swipe runs, hold busy. Release on the app wrapper's `transitionend` for `transform`, with a 1100ms timeout fallback.
- The phone layer has `pointer-events: none` and `visibility: hidden` once fully off-screen.

- [ ] **Step 1: Write the failing tests**
  - `swipeFor`: `("ask-hoai","broadcast-sms","forward")` → `{ offset: "out", animate: true }`; `("broadcast-sms","closing-dashboard","forward")` → `{ offset: "none", animate: true }`; `("closing-dashboard","broadcast-sms","back")` → `{ offset: "out", animate: false }`; `("broadcast-sms","ask-hoai","back")` → `{ offset: "none", animate: false }`; `("intro","broadcast-sms","forward")` (launcher) → `animate: false`.
  - `no transform outside the SMS scene`: render `AppSlide` at a non-SMS scene → `style.transform` is `""` or `"none"`.
  - `swipe holds busy until the transition ends`: from ask-hoai's last beat, `advance()` → `isWalkthroughBusy()` `true`; `fireEvent.transitionEnd(wrapper, { propertyName: "transform" })` → `false`.
  - `swipe back clears the transform afterwards`: from SMS last beat, `advance()` → after `transitionEnd`, the wrapper's transform is `none`.
- [ ] **Step 2: Run** `pnpm test src/walkthrough/phone` — Expected: FAIL.
- [ ] **Step 3: Implement** `SceneSwipe.tsx`, the `Inner` change and the CSS. Track `prevSceneId` with a ref updated after each scene change.
- [ ] **Step 4: Run** `pnpm test` — Expected: PASS, including `WalkthroughRoot.test.tsx`.
- [ ] **Step 5: Commit** `feat(walkthrough): swipe the app out to the phone and back`

---

### Task 6: Scene wiring, panel focus, docs, browser check

**Files:**
- Create: `src/walkthrough/scenes/broadcastSms.tsx`
- Modify: `src/walkthrough/scenes/index.ts`
- Modify: `src/App.tsx:3281` (`askHoaiFocused`)
- Modify: `src/walkthrough/__tests__/sequence.test.ts` (the "ends on a still dashboard after Ask HOAi" test), `src/__tests__/sceneSync.test.tsx`
- Modify: `docs/walkthrough.md` (busy holds in Navigation rules and Scripted cursor; scene order; phone stage and swipe in "How each animation works"; z-index table rows `220 Phone layer` and a note that the app wrapper is transformed only during the SMS scene)

**Interfaces:**
- Consumes: `SMS_SCENE_ID`, VT names (Task 4).
- Produces: `broadcastSmsScene: Scene`.

Scene:
```ts
export const broadcastSmsScene: Scene = {
  id: SMS_SCENE_ID,
  label: "Broadcast SMS",
  page: "dashboard",
  appState: { phase: "portal", page: "dashboard", dashboardView: "homeowner", askHoaiOpen: true },
  beats: [
    { kind: "idle" },                                        // swipe in, empty lock screen
    { kind: "idle" },                                        // notification arrives
    { kind: "cursor", to: VT.SmsNotification, action: "click" },
    { kind: "cursor", to: VT.SmsInput, action: "click", typeText: SMS_REPLY, typeCps: 24 },
    { kind: "cursor", to: VT.SmsSendBtn, action: "click" },
  ],
};
```

Panel focus: `askHoaiFocused = sceneId === "ask-hoai" || (sceneId === SMS_SCENE_ID && cursor.beatIndex === 0)`, with a comment. That keeps the panel focused while it slides out; it morphs back and resets off-screen from beat 1 on, so the dashboard returns already in its closing state.

- [ ] **Step 1: Write the failing tests**
  - sequence: `ids.slice(-3)` equals `["ask-hoai", "broadcast-sms", "closing-dashboard"]`; the SMS scene's beat kinds are `["idle","idle","cursor","cursor","cursor"]`; cursor targets are `[VT.SmsNotification, VT.SmsInput, VT.SmsSendBtn]`; the beat-3 `typeText` is `SMS_REPLY`. Update the existing "ends on a still dashboard" test to the new order.
  - sceneSync: at `broadcast-sms` beat 0 the Ask HOAi panel has the focused class; at beat 1 it doesn't.
- [ ] **Step 2: Run** `pnpm test` — Expected: FAIL.
- [ ] **Step 3: Implement** the scene, index entry and `askHoaiFocused` change; update `docs/walkthrough.md`.
- [ ] **Step 4: Run** `pnpm test` and `pnpm build` — Expected: all PASS, build succeeds.
- [ ] **Step 5: Browser check** (dev server on `$PORT`, default 8443; `?launcher` to jump to Ask HOAi). Walk ask-hoai → SMS → closing with →. Confirm each of these:
  - the panel slides out focused, with no morph mid-swipe;
  - the phone arrives centred on white;
  - → is dead during the chat stream, the swipe, the notification drop and the typing dots;
  - the notification tap, typing and send are real clicks;
  - the answer appears, with no HOAi text on the phone;
  - the swipe back lands on the dashboard with the panel in the sidebar.

  Then press ← from closing (hard cut, typed reply visible, → re-sends) and ← from SMS beat 0 (hard cut to ask-hoai). Finally run the payments scene again to confirm the lift and modal are unaffected.
- [ ] **Step 6: Commit** `feat(walkthrough): broadcast SMS scene between Ask HOAi and the closing dashboard`
