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
