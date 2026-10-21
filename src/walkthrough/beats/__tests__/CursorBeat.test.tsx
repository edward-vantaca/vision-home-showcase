import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render } from "@testing-library/react";
import gsap from "gsap";
import { CursorBeat } from "../CursorBeat";
import type { VTName } from "../../viewTransitionNames";

const TARGET = "wt-cursor-test" as VTName;

type FakeAnimation = { animation: Animation; finish: () => void };

function fakeAnimation(endTime: number, playState: AnimationPlayState = "running"): FakeAnimation {
  let finish = () => {};
  const finished = new Promise<Animation>((resolve) => {
    finish = () => resolve(animation);
  });
  const animation = {
    playState,
    finished,
    effect: { getComputedTiming: () => ({ endTime }) },
  } as unknown as Animation;
  return { animation, finish };
}

function nextFrames(n = 3): Promise<void> {
  return act(async () => {
    for (let i = 0; i < n; i++) await new Promise((r) => requestAnimationFrame(() => r(undefined)));
  });
}

describe("CursorBeat", () => {
  let target: HTMLElement;

  beforeEach(() => {
    target = document.createElement("button");
    target.setAttribute("data-vt-name", TARGET);
    document.body.appendChild(target);
  });

  afterEach(() => {
    cleanup();
    target.remove();
    // @ts-expect-error jsdom has no document.getAnimations
    delete document.getAnimations;
    vi.restoreAllMocks();
  });

  it("runs on the next frame when document.getAnimations is unavailable (jsdom)", async () => {
    const timeline = vi.spyOn(gsap, "timeline");
    render(<CursorBeat to={TARGET} />);
    await nextFrames();
    expect(timeline).toHaveBeenCalledTimes(1);
  });

  it("waits for running finite animations (e.g. the panel morph) before measuring stops", async () => {
    const morph = fakeAnimation(700);
    document.getAnimations = () => [morph.animation];
    const timeline = vi.spyOn(gsap, "timeline");
    const rect = vi.spyOn(target, "getBoundingClientRect");

    render(<CursorBeat to={TARGET} />);
    await nextFrames();
    expect(timeline).not.toHaveBeenCalled();
    expect(rect).not.toHaveBeenCalled();

    morph.finish();
    await nextFrames();
    expect(rect).toHaveBeenCalled();
    expect(timeline).toHaveBeenCalledTimes(1);
  });

  it("ignores infinite and paused animations", async () => {
    document.getAnimations = () => [fakeAnimation(Infinity).animation, fakeAnimation(500, "paused").animation];
    const timeline = vi.spyOn(gsap, "timeline");
    render(<CursorBeat to={TARGET} />);
    await nextFrames();
    expect(timeline).toHaveBeenCalledTimes(1);
  });

  it("never runs after unmount, even if the animations finish later", async () => {
    const morph = fakeAnimation(700);
    document.getAnimations = () => [morph.animation];
    const timeline = vi.spyOn(gsap, "timeline");

    const { unmount } = render(<CursorBeat to={TARGET} />);
    await nextFrames();
    unmount();
    morph.finish();
    await nextFrames();
    expect(timeline).not.toHaveBeenCalled();
  });
});
