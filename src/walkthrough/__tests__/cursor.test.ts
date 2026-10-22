import { describe, it, expect, vi } from "vitest";
import { cursorReducer, withTransition } from "../cursor";
import type { Sequence, WalkthroughState } from "../types";

const seq: Sequence = [
  { id: "a", page: "dashboard", beats: [{ kind: "idle" }, { kind: "idle" }] },
  { id: "b", page: "amenities", beats: [{ kind: "idle" }, { kind: "idle" }, { kind: "idle" }] },
];

const initial: WalkthroughState = { cursor: { sceneIndex: 0, beatIndex: 0 }, hudVisible: false };

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

describe("withTransition", () => {
  it("invokes update synchronously", () => {
    const update = vi.fn();
    withTransition(update);
    expect(update).toHaveBeenCalledTimes(1);
  });
});
