import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render } from "@testing-library/react";
import gsap from "gsap";
import { CursorBeat } from "../CursorBeat";
import type { VTName } from "../../viewTransitionNames";
import { DROP_FILE_EVENT } from "../../dropFile";

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

  it("draws an arrow pointer by default", () => {
    render(<CursorBeat to={TARGET} />);
    const cursor = document.querySelector('[data-testid="cursor-beat"]');
    expect(cursor?.querySelector("svg")).not.toBeNull();
    expect(cursor?.querySelector(".wt-cursor-touch")).toBeNull();
  });

  it("draws a touch circle instead of the arrow with pointer='touch'", () => {
    render(<CursorBeat to={TARGET} pointer="touch" />);
    const cursor = document.querySelector('[data-testid="cursor-beat"]');
    expect(cursor?.querySelector(".wt-cursor-touch")).not.toBeNull();
    expect(cursor?.querySelector("svg")).toBeNull();
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

  it("measures later stops when reached, so a target rendered by an earlier click is found", async () => {
    // e.g. Make a Payment opens the modal whose Continue button doesn't exist yet.
    const SECOND = "wt-cursor-test-second" as VTName;
    const secondClicked = vi.fn();
    target.addEventListener("click", () => {
      const second = document.createElement("button");
      second.setAttribute("data-vt-name", SECOND);
      second.addEventListener("click", secondClicked);
      document.body.appendChild(second);
    });
    const timeline = vi.spyOn(gsap, "timeline");

    render(<CursorBeat to={TARGET} action="click" then={[{ to: SECOND, action: "click" }]} />);
    await nextFrames();
    act(() => {
      timeline.mock.results[0].value.progress(1);
    });

    expect(secondClicked).toHaveBeenCalledTimes(1);
    document.querySelector(`[data-vt-name="${SECOND}"]`)?.remove();
  });

  it("calls onReleaseStage right after a releaseStage stop's click", async () => {
    const order: string[] = [];
    target.addEventListener("click", () => order.push("click"));
    const onReleaseStage = vi.fn(() => order.push("release"));
    const timeline = vi.spyOn(gsap, "timeline");

    render(<CursorBeat to={TARGET} action="click" releaseStage onReleaseStage={onReleaseStage} />);
    await nextFrames();
    act(() => {
      timeline.mock.results[0].value.progress(1);
    });

    expect(order).toEqual(["click", "release"]);
  });

  it("calls onHideStage right after a hideStage stop's click", async () => {
    const order: string[] = [];
    target.addEventListener("click", () => order.push("click"));
    const onHideStage = vi.fn(() => order.push("hide"));
    const timeline = vi.spyOn(gsap, "timeline");

    render(<CursorBeat to={TARGET} action="click" hideStage onHideStage={onHideStage} />);
    await nextFrames();
    act(() => {
      timeline.mock.results[0].value.progress(1);
    });

    expect(order).toEqual(["click", "hide"]);
  });

  it("holds for holdMs after a stop's action", async () => {
    const timeline = vi.spyOn(gsap, "timeline");
    const { unmount } = render(<CursorBeat to={TARGET} action="click" />);
    await nextFrames();
    const base = timeline.mock.results[0].value.duration();
    unmount();

    render(<CursorBeat to={TARGET} action="click" holdMs={1000} />);
    await nextFrames();
    const held = timeline.mock.results[1].value.duration();
    expect(held - base).toBeCloseTo(1, 5);
  });

  it("a scroll stop eases its target's scroll to the bottom over scrollMs", async () => {
    const PAGE = "wt-cursor-test-page" as VTName;
    const page = document.createElement("div");
    page.setAttribute("data-vt-name", PAGE);
    Object.defineProperty(page, "scrollHeight", { configurable: true, value: 2400 });
    Object.defineProperty(page, "clientHeight", { configurable: true, value: 800 });
    document.body.appendChild(page);
    const timeline = vi.spyOn(gsap, "timeline");

    const { unmount } = render(<CursorBeat to={TARGET} action="click" />);
    await nextFrames();
    const base = timeline.mock.results[0].value.duration();
    unmount();

    render(<CursorBeat to={TARGET} action="click" then={[{ to: PAGE, action: "scroll", scrollMs: 6000 }]} />);
    await nextFrames();
    const tl = timeline.mock.results[1].value;
    expect(tl.duration() - base).toBeCloseTo(6, 5);
    act(() => {
      tl.progress(1);
    });
    expect(page.scrollTop).toBe(1600);
    page.remove();
  });

  it("a drop stop carries a file card in and drops that file on its target", async () => {
    const dropped = vi.fn();
    target.addEventListener(DROP_FILE_EVENT, (e) => dropped((e as CustomEvent<{ name: string }>).detail.name));
    const timeline = vi.spyOn(gsap, "timeline");

    const { getByText } = render(<CursorBeat to={TARGET} action="drop" file="Fence Proposal.pdf" />);
    expect(getByText("Fence Proposal.pdf")).toBeInTheDocument();
    await nextFrames();
    expect(dropped).not.toHaveBeenCalled();
    act(() => {
      timeline.mock.results[0].value.progress(1);
    });

    expect(dropped).toHaveBeenCalledWith("Fence Proposal.pdf");
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
