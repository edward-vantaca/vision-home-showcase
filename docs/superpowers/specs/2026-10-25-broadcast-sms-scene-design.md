# Broadcast SMS scene — design

Date: 2026-10-25 · Branch: `walkthrough-subsystem`

Read `docs/walkthrough.md` first; this builds on its scene/beat model.

## Intent

The audience should leave believing that **the management company can reach
every homeowner fast with a broadcast SMS**, and that homeowners can reply in
the same thread and get an immediate answer. HOAi is what answers on
management's behalf, but **the phone never says so** — to the homeowner the
reply simply comes from management. The presenter makes the HOAi point out
loud.

## Where it sits

A new scene between `ask-hoai` and `closing-dashboard` in
`src/walkthrough/scenes/index.ts`:

… → ask-hoai → **broadcast-sms** → closing-dashboard

## What the audience sees (one → per step)

| → | On screen |
| --- | --- |
| enter scene | The whole interface (whatever ask-hoai left on screen) slides off to the **left**; a phone slides in from the right and settles at the centre of a **plain white** screen. Lock screen, no notifications. |
| 1 | A notification drops in on the lock screen: sender **Waterfront Community Estates**, a storm/flooding warning. |
| 2 | Scripted cursor travels to the notification and taps it; the Messages thread opens with the broadcast as the first (incoming) bubble. |
| 3 | Cursor taps the message field and types **"Are any of the amenities still open?"** |
| 4 | Cursor taps send. The reply appears as an outgoing bubble, typing dots show, then the incoming answer: **"No, the gym, pool, and clubhouse are all closed until further notice. We'll text you as soon as they reopen."** |
| leave scene (→) | The reverse swipe: phone slides out to the right, the dashboard slides back in from the left, and `closing-dashboard` plays as today. |

Each step waits for the presenter's →; nothing auto-advances between steps.
(Within step 4, the typing dots → answer sequence plays on its own timers, as
the Ask HOAi scripted chat does.)

### Copy

- Notification / broadcast bubble: "⚠️ Severe storms are moving through the
  area this evening. Local flooding is possible. Please avoid low-lying roads
  and stay indoors. — Waterfront Community Estates Management" (notification
  shows a truncated preview).
- Homeowner: "Are any of the amenities still open?"
- Answer: as in the table above.
- **No "Answered by HOAi" label, badge or any HOAi branding on the phone.**
  (Decided by the user after seeing the mockup.)

### Look

Approved mockup: `.superpowers/brainstorm/99937-1792936417/content/phone-flow.html`
(gitignored, local only). In short:

- iPhone-style frame (dark bezel, rounded corners, dynamic island), drawn in
  HTML/CSS — not an image — so the cursor's clicks are real clicks on real
  elements.
- Lock screen: blue gradient wallpaper, date + large time, iOS-style frosted
  notification card ("MESSAGES · now", bold sender, preview).
- Messages: header with round avatar ("WC") and sender name, grey incoming
  bubbles, blue outgoing bubbles, iOS-style text field.
- Background behind the phone: plain white ("for now" — may change later).
- Phone sized to read comfortably on a stage screen (roughly 60–75% of
  viewport height); exact size is the builder's call.

## Decisions made by the user

- Purpose: show management reaching everyone fast via broadcast SMS.
- Replies are answered by HOAi automatically on behalf of management, with no
  on-screen attribution.
- After the exchange, swipe back to the dashboard for the closing scene.
- Every step waits for →.
- White background behind the phone.
- **Presenter keys are always ignored while anything is animating.** That
  is a general rule, not just for this scene. It covers:
  - the ask-hoai scripted chat: the reply streaming and the follow-up, which
    today run on timers after the cursor beat ends;
  - the swipe in and the swipe out;
  - the notification arriving;
  - the typing dots → answer sequence in step 4.

  Today only `beatBusyRef`, held by cursor beats, blocks keys. So this
  needs a shared busy signal that timed app-side sequences (the Ask HOAi
  panel, the phone) can also hold. That also removes the "half-streamed
  chat slides away" risk.

## Calls made by Claude (user hasn't confirmed; easy to change)

- Wording above is lightly edited from the user's ("come up are any of the
  amenities still open" → "Are any of the amenities still open?"; added the
  "We'll text you as soon as they reopen" line and the safety advice in the
  broadcast).
- Sender name "Waterfront Community Estates", the community name already used
  in the app.
- Swipe direction back: phone exits right, dashboard returns from the left
  (the mirror of the entry).
- What swipes out on entry is whatever is on screen at the end of ask-hoai
  (the focused Ask HOAi panel on its white canvas). Since the canvas is white
  and the phone's backdrop is white, the visible motion is the panel sliding
  left and the phone arriving. The panel must *not* morph back to the sidebar
  mid-swipe.
- When the dashboard slides back in it should already be in the
  `closing-dashboard` state (panel in sidebar form, canvas gone), so the
  closing scene is a still landing rather than a second animation.
- ← steps back through the phone's beats in reverse (answer → typed reply →
  thread → notification → empty lock screen). ← from the empty lock screen is
  a **hard cut to ask-hoai's start**, and the next → replays the drop and the
  scripted chat. This is existing walkthrough behaviour, so nothing new is
  needed in `AskHoaiPanel` or the cursor reducer. Restoring the *finished*
  conversation was rejected as not worth the cost.
- The copy in this document is final, not the mockup's: the broadcast bubble
  keeps the "— Waterfront Community Estates Management" signature, and there
  is no "Answered by HOAi" line.
- Phone time/date: static "4:12" / the demo's date; not a live clock.

## Left to the builder

- How the swipe is implemented (e.g. a scene-level transform on the app root
  vs. an overlay that snapshots nothing and just translates the app wrapper),
  keeping in mind `docs/walkthrough.md` gotchas: a `transform` on an ancestor
  traps `position: fixed` — the Ask HOAi panel and canvas are fixed, so they
  must move with the swipe some other way or be swiped explicitly.
- Where the phone lives (a walkthrough stage component under
  `src/walkthrough/stage-content/` is the likely home) and its z-layer (add it
  to the z-index table in `docs/walkthrough.md`).
- Which beat kinds to use: likely an `idle`/custom beat for the notification
  and cursor beats for tap / type / send; new `VT` names for the notification,
  message field and send button. A new beat kind or app-state field
  (e.g. `smsPhone` / `stage: "phone"`) is fine if needed; add tests first per
  the "Adding a scene" rules.
- Timings and easing — match the existing feel (700–1000 ms,
  `cubic-bezier(0.65,0,0.35,1)`); entrance animations must be finite so the
  cursor's settle step waits for them.
- Update `docs/walkthrough.md` (scene order, any new beat kind, z-index table)
  and `__tests__/sequence.test.ts`.

## Non-goals

- A real SMS feature in the app or an admin "send broadcast" screen.
- Showing the management side composing the broadcast.
- Multiple phones / showing the broadcast reaching many homeowners at once.
- Any HOAi branding on the phone.

## Anti-goals (would be a failure even if it works)

- The phone reply reads as a chatbot (labels, sparkle icons, "AI" wording).
- The swipe stutters or the Ask HOAi panel visibly snaps/morphs during it.
- A step plays without the presenter pressing →, or the cursor clicks
  something that isn't really there.
