import { describe, expect, it } from "vitest";
import { walkthroughReducer, initialState } from "../WalkthroughProvider";
import type { Sequence } from "../types";

const sequence: Sequence = {
  id: "s1",
  title: "Test",
  beats: [
    { kind: "highlight", target: "a" },
    { kind: "highlight", target: "b" },
    { kind: "highlight", target: "c" },
  ],
};
const sequences = { s1: sequence };

describe("walkthroughReducer", () => {
  it("start sets active, sequenceId, and resets beat index", () => {
    const next = walkthroughReducer(initialState, { type: "start", sequenceId: "s1" }, sequences);
    expect(next.active).toBe(true);
    expect(next.sequenceId).toBe("s1");
    expect(next.currentBeatIndex).toBe(0);
    expect(next.history).toEqual([]);
  });

  it("start accepts hudVisible override", () => {
    const next = walkthroughReducer(initialState, { type: "start", sequenceId: "s1", hudVisible: false }, sequences);
    expect(next.hudVisible).toBe(false);
  });

  it("start with unknown sequenceId is a no-op", () => {
    const next = walkthroughReducer(initialState, { type: "start", sequenceId: "unknown" }, sequences);
    expect(next).toBe(initialState);
  });

  it("advance increments beat index and pushes to history", () => {
    const started = walkthroughReducer(initialState, { type: "start", sequenceId: "s1" }, sequences);
    const next = walkthroughReducer(started, { type: "advance" }, sequences);
    expect(next.currentBeatIndex).toBe(1);
    expect(next.history).toEqual([0]);
  });

  it("double advance increments by exactly 2 (no stacking)", () => {
    const s0 = walkthroughReducer(initialState, { type: "start", sequenceId: "s1" }, sequences);
    const s1 = walkthroughReducer(s0, { type: "advance" }, sequences);
    const s2 = walkthroughReducer(s1, { type: "advance" }, sequences);
    expect(s2.currentBeatIndex).toBe(2);
  });

  it("advance past last beat triggers exit", () => {
    let state = walkthroughReducer(initialState, { type: "start", sequenceId: "s1" }, sequences);
    for (let i = 0; i < 3; i++) state = walkthroughReducer(state, { type: "advance" }, sequences);
    expect(state.active).toBe(false);
    expect(state.sequenceId).toBeNull();
  });

  it("back pops history", () => {
    let state = walkthroughReducer(initialState, { type: "start", sequenceId: "s1" }, sequences);
    state = walkthroughReducer(state, { type: "advance" }, sequences);
    state = walkthroughReducer(state, { type: "advance" }, sequences);
    expect(state.currentBeatIndex).toBe(2);
    state = walkthroughReducer(state, { type: "back" }, sequences);
    expect(state.currentBeatIndex).toBe(1);
    expect(state.history).toEqual([0]);
  });

  it("back at beat 0 is a no-op", () => {
    const started = walkthroughReducer(initialState, { type: "start", sequenceId: "s1" }, sequences);
    const next = walkthroughReducer(started, { type: "back" }, sequences);
    expect(next).toBe(started);
  });

  it("exit resets to inactive", () => {
    const started = walkthroughReducer(initialState, { type: "start", sequenceId: "s1" }, sequences);
    const next = walkthroughReducer(started, { type: "exit" }, sequences);
    expect(next.active).toBe(false);
    expect(next.sequenceId).toBeNull();
    expect(next.currentBeatIndex).toBe(0);
    expect(next.history).toEqual([]);
  });

  it("toggleHud flips hudVisible", () => {
    const started = walkthroughReducer(initialState, { type: "start", sequenceId: "s1" }, sequences);
    expect(started.hudVisible).toBe(true);
    const next = walkthroughReducer(started, { type: "toggleHud" }, sequences);
    expect(next.hudVisible).toBe(false);
  });

  it("replayBeat returns the same beat index", () => {
    let state = walkthroughReducer(initialState, { type: "start", sequenceId: "s1" }, sequences);
    state = walkthroughReducer(state, { type: "advance" }, sequences);
    const next = walkthroughReducer(state, { type: "replayBeat" }, sequences);
    expect(next.currentBeatIndex).toBe(state.currentBeatIndex);
  });

  it("skipToEnd jumps to last beat without exiting", () => {
    const started = walkthroughReducer(initialState, { type: "start", sequenceId: "s1" }, sequences);
    const next = walkthroughReducer(started, { type: "skipToEnd" }, sequences);
    expect(next.currentBeatIndex).toBe(2);
    expect(next.active).toBe(true);
  });
});
