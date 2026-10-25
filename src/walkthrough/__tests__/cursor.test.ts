import { describe, it, expect, vi } from "vitest";
import { cursorReducer, withTransition, holdBusy, isWalkthroughBusy } from "../cursor";
import type { Sequence, WalkthroughState } from "../types";

const seq: Sequence = [
  { id: "a", page: "dashboard", beats: [{ kind: "idle" }, { kind: "idle" }] },
  { id: "b", page: "amenities", beats: [{ kind: "idle" }, { kind: "idle" }, { kind: "idle" }] },
];

const initial: WalkthroughState = { cursor: { sceneIndex: 0, beatIndex: 0 }, hudVisible: false, appSceneIndex: 0, appSyncKey: 0 };

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

  describe("replaying a cursor beat re-entered across a scene boundary", () => {
    // Scene appState resets the app to the scene's START state on scene
    // change, so a cursor beat landed on by stepping back across a boundary
    // has had its click undone. The next advance must replay it, not skip it.
    const portalSeq: Sequence = [
      { id: "go-to-portal", page: "onboarding", beats: [{ kind: "cursor", to: "wt-btn" as never, action: "click" }] },
      { id: "payments", page: "dashboard", beats: [{ kind: "lift", target: "wt-widget" as never }, { kind: "idle" }] },
    ];

    it("advance replays the cursor beat forward instead of skipping it", () => {
      const atPayments: WalkthroughState = { ...initial, cursor: { sceneIndex: 1, beatIndex: 0 } };
      const backed = cursorReducer(atPayments, { type: "back" }, portalSeq);
      expect(backed.cursor).toEqual({ sceneIndex: 0, beatIndex: 0 });
      expect(backed.lastDirection).toBe("back");

      const replayed = cursorReducer(backed, { type: "advance" }, portalSeq);
      expect(replayed.cursor).toEqual({ sceneIndex: 0, beatIndex: 0 });
      expect(replayed.lastDirection).toBe("forward");

      const onward = cursorReducer(replayed, { type: "advance" }, portalSeq);
      expect(onward.cursor).toEqual({ sceneIndex: 1, beatIndex: 0 });
    });

    it("does not replay after a within-scene back (reverseTo already undid only the later beat)", () => {
      const twoCursorSeq: Sequence = [
        {
          id: "inbox",
          page: "inbox",
          beats: [
            { kind: "cursor", to: "wt-a" as never, action: "click" },
            { kind: "cursor", to: "wt-b" as never, action: "click" },
          ],
        },
      ];
      const atSecond: WalkthroughState = { ...initial, cursor: { sceneIndex: 0, beatIndex: 1 } };
      const backed = cursorReducer(atSecond, { type: "back" }, twoCursorSeq);
      const next = cursorReducer(backed, { type: "advance" }, twoCursorSeq);
      expect(next.cursor).toEqual({ sceneIndex: 0, beatIndex: 1 });
    });

    it("does not replay a non-cursor beat landed on across a boundary", () => {
      const atB: WalkthroughState = { ...initial, cursor: { sceneIndex: 1, beatIndex: 0 } };
      const backed = cursorReducer(atB, { type: "back" }, seq);
      const next = cursorReducer(backed, { type: "advance" }, seq);
      expect(next.cursor).toEqual({ sceneIndex: 1, beatIndex: 0 });
    });

    it("replays a self-reverting cursor beat (replayOnBack) re-entered within its scene", () => {
      // The payment beat opens the modal and closes it again itself, so being
      // "on" it after a back means its demo has to play again.
      const paySeq: Sequence = [
        {
          id: "payments",
          page: "dashboard",
          beats: [
            { kind: "lift", target: "wt-widget" as never },
            { kind: "cursor", to: "wt-pay" as never, action: "click", replayOnBack: true },
            { kind: "idle" },
          ],
        },
      ];
      const atIdle: WalkthroughState = { ...initial, cursor: { sceneIndex: 0, beatIndex: 2 } };
      const backed = cursorReducer(atIdle, { type: "back" }, paySeq);
      expect(backed.cursor).toEqual({ sceneIndex: 0, beatIndex: 1 });
      const replayed = cursorReducer(backed, { type: "advance" }, paySeq);
      expect(replayed.cursor).toEqual({ sceneIndex: 0, beatIndex: 1 });
      expect(replayed.lastDirection).toBe("forward");
      const onward = cursorReducer(replayed, { type: "advance" }, paySeq);
      expect(onward.cursor).toEqual({ sceneIndex: 0, beatIndex: 2 });
    });

    it("a second back after crossing the boundary clears the pending replay", () => {
      const threeSeq: Sequence = [
        { id: "x", page: "onboarding", beats: [{ kind: "idle" }, { kind: "cursor", to: "wt-btn" as never, action: "click" }] },
        { id: "y", page: "dashboard", beats: [{ kind: "idle" }] },
      ];
      const atY: WalkthroughState = { ...initial, cursor: { sceneIndex: 1, beatIndex: 0 } };
      const backed = cursorReducer(atY, { type: "back" }, threeSeq);
      const backedAgain = cursorReducer(backed, { type: "back" }, threeSeq);
      expect(backedAgain.cursor).toEqual({ sceneIndex: 0, beatIndex: 0 });
      const next = cursorReducer(backedAgain, { type: "advance" }, threeSeq);
      expect(next.cursor).toEqual({ sceneIndex: 0, beatIndex: 1 });
    });
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

describe("appSceneIndex: what the app underneath shows", () => {
  // a, b, a 4-beat phone scene, c.
  const phoneSeq: Sequence = [
    { id: "a", page: "dashboard", beats: [{ kind: "idle" }] },
    { id: "b", page: "amenities", beats: [{ kind: "idle" }] },
    { id: "phone", page: "dashboard", stage: "phone", beats: [{ kind: "idle" }, { kind: "idle" }, { kind: "idle" }, { kind: "idle" }] },
    { id: "c", page: "community", beats: [{ kind: "idle" }] },
  ];
  const at = (sceneIndex: number, beatIndex: number, appSceneIndex: number): WalkthroughState => ({
    cursor: { sceneIndex, beatIndex },
    hudVisible: false,
    appSceneIndex,
    appSyncKey: 0,
  });

  it("follows the cursor outside phone scenes", () => {
    const next = cursorReducer(at(0, 0, 0), { type: "advance" }, phoneSeq);
    expect(next.cursor).toEqual({ sceneIndex: 1, beatIndex: 0 });
    expect(next.appSceneIndex).toBe(1);
  });

  it("→ into the phone scene's beat 0 keeps the previous scene", () => {
    const next = cursorReducer(at(1, 0, 1), { type: "advance" }, phoneSeq);
    expect(next.cursor).toEqual({ sceneIndex: 2, beatIndex: 0 });
    expect(next.appSceneIndex).toBe(1);
  });

  it("beat 1 moves it to the next non-phone scene", () => {
    const next = cursorReducer(at(2, 0, 1), { type: "advance" }, phoneSeq);
    expect(next.cursor).toEqual({ sceneIndex: 2, beatIndex: 1 });
    expect(next.appSceneIndex).toBe(3);
  });

  it("← to beat 0 keeps the next scene", () => {
    const next = cursorReducer(at(2, 1, 3), { type: "back" }, phoneSeq);
    expect(next.cursor).toEqual({ sceneIndex: 2, beatIndex: 0 });
    expect(next.appSceneIndex).toBe(3);
  });

  it("← out of the phone scene into b gives b", () => {
    const next = cursorReducer(at(2, 0, 3), { type: "back" }, phoneSeq);
    expect(next.cursor).toEqual({ sceneIndex: 1, beatIndex: 0 });
    expect(next.appSceneIndex).toBe(1);
  });

  it("← from c into the phone scene's last beat gives c", () => {
    const next = cursorReducer(at(3, 0, 3), { type: "back" }, phoneSeq);
    expect(next.cursor).toEqual({ sceneIndex: 2, beatIndex: 3 });
    expect(next.appSceneIndex).toBe(3);
  });

  it("jumpTo the phone scene's beat 0 from a keeps a", () => {
    const next = cursorReducer(at(0, 0, 0), { type: "jumpTo", cursor: { sceneIndex: 2, beatIndex: 0 } }, phoneSeq);
    expect(next.appSceneIndex).toBe(0);
  });

  it("jumpTo the phone scene's beat 2 gives c", () => {
    const next = cursorReducer(at(0, 0, 0), { type: "jumpTo", cursor: { sceneIndex: 2, beatIndex: 2 } }, phoneSeq);
    expect(next.appSceneIndex).toBe(3);
  });

  it("a phone scene last in the sequence keeps the previous value", () => {
    const lastSeq = phoneSeq.slice(0, 3);
    const onBeat0 = cursorReducer(at(1, 0, 1), { type: "advance" }, lastSeq);
    expect(onBeat0.appSceneIndex).toBe(1);
    const onBeat1 = cursorReducer(onBeat0, { type: "advance" }, lastSeq);
    expect(onBeat1.cursor).toEqual({ sceneIndex: 2, beatIndex: 1 });
    expect(onBeat1.appSceneIndex).toBe(1);
  });

  it("toggleHud leaves it alone", () => {
    const next = cursorReducer(at(2, 1, 3), { type: "toggleHud" }, phoneSeq);
    expect(next.appSceneIndex).toBe(3);
  });

  describe("appSyncKey: bumps whenever the app must re-apply its scene's start state", () => {
    const run = (state: WalkthroughState, ...actions: Parameters<typeof cursorReducer>[1][]) =>
      actions.reduce((s, a) => cursorReducer(s, a, phoneSeq), state);

    it("bumps on arriving at a different non-phone scene", () => {
      expect(run(at(0, 0, 0), { type: "advance" }).appSyncKey).toBe(1);
      expect(run(at(1, 0, 1), { type: "jumpTo", cursor: { sceneIndex: 0, beatIndex: 0 } }).appSyncKey).toBe(1);
    });

    it("doesn't bump moving within a scene, re-jumping to the current scene, or toggling the HUD", () => {
      const oneScene: Sequence = [{ id: "x", page: "dashboard", beats: [{ kind: "idle" }, { kind: "idle" }] }];
      expect(cursorReducer(at(0, 0, 0), { type: "advance" }, oneScene).appSyncKey).toBe(0);
      expect(run(at(1, 0, 1), { type: "jumpTo", cursor: { sceneIndex: 1, beatIndex: 0 } }).appSyncKey).toBe(0);
      expect(run(at(1, 0, 1), { type: "toggleHud" }).appSyncKey).toBe(0);
    });

    it("→ into a phone scene's beat 0 doesn't bump (nothing changes mid-slide); beat 1 does", () => {
      const onBeat0 = run(at(1, 0, 1), { type: "advance" });
      expect(onBeat0.appSyncKey).toBe(0);
      const onBeat1 = run(onBeat0, { type: "advance" });
      expect(onBeat1.appSceneIndex).toBe(3);
      expect(onBeat1.appSyncKey).toBe(1);
    });

    it("← from beat 1 to beat 0 doesn't bump (the app keeps the next scene)", () => {
      expect(run(at(2, 1, 3), { type: "back" }).appSyncKey).toBe(0);
    });

    it("← from a phone scene's beat 0 bumps even though the app scene stays the same", () => {
      const next = run(at(2, 0, 1), { type: "back" });
      expect(next.appSceneIndex).toBe(1);
      expect(next.appSyncKey).toBe(1);
    });

    it("→ out of the phone scene onto the scene the app already shows bumps", () => {
      const next = run(at(2, 3, 3), { type: "advance" });
      expect(next.cursor).toEqual({ sceneIndex: 3, beatIndex: 0 });
      expect(next.appSyncKey).toBe(1);
    });
  });
});

describe("withTransition", () => {
  it("invokes update synchronously", () => {
    const update = vi.fn();
    withTransition(update);
    expect(update).toHaveBeenCalledTimes(1);
  });
});

describe("busy holds", () => {
  it("holdBusy makes the walkthrough busy until every hold is released", () => {
    const a = holdBusy();
    const b = holdBusy();
    expect(isWalkthroughBusy()).toBe(true);
    a();
    expect(isWalkthroughBusy()).toBe(true);
    b();
    expect(isWalkthroughBusy()).toBe(false);
  });

  it("release is idempotent", () => {
    const a = holdBusy();
    const b = holdBusy();
    a();
    a();
    expect(isWalkthroughBusy()).toBe(true);
    b();
    expect(isWalkthroughBusy()).toBe(false);
  });
});
