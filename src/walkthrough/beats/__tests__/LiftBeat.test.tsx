import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render } from "@testing-library/react";
import { LiftBeat } from "../LiftBeat";

const added: HTMLElement[] = [];

// Restore is deferred one microtask (same-target handoff, see useLiftTarget).
function flushMicrotasks(): Promise<void> {
  return act(async () => {
    await Promise.resolve();
  });
}

function makeTarget(style?: Partial<CSSStyleDeclaration>): HTMLElement {
  const el = document.createElement("div");
  el.setAttribute("data-vt-name", "wt-test");
  if (style) Object.assign(el.style, style);
  document.body.appendChild(el);
  added.push(el);
  return el;
}

describe("LiftBeat", () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(async () => {
    cleanup();
    await flushMicrotasks();
    added.splice(0).forEach((el) => el.remove());
    // @ts-expect-error restore jsdom's lack of scrollIntoView
    delete Element.prototype.scrollIntoView;
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("snapshots and mutates inline styles on mount", () => {
    const target = makeTarget({ position: "relative" });
    render(<LiftBeat target="wt-test" scale={1.4} position="center" />);

    expect(target.style.position).toBe("fixed");
    expect(target.style.zIndex).toBe("260");
    expect(target.style.transition).toContain("transform");
  });

  it("restores all mutated inline styles on unmount", async () => {
    const target = makeTarget({ position: "relative" });
    const { unmount } = render(<LiftBeat target="wt-test" />);
    unmount();
    await flushMicrotasks();

    expect(target.style.position).toBe("relative");
    expect(target.style.zIndex).toBe("");
    expect(target.style.transition).toBe("");
    expect(target.style.transform).toBe("");
  });

  it("calls scrollIntoView before measuring the target rect", () => {
    const target = makeTarget();
    const order: string[] = [];
    target.scrollIntoView = vi.fn(() => {
      order.push("scroll");
    });
    const realRect = target.getBoundingClientRect.bind(target);
    target.getBoundingClientRect = () => {
      order.push("rect");
      return realRect();
    };

    render(<LiftBeat target="wt-test" />);

    expect(target.scrollIntoView).toHaveBeenCalledWith({
      block: "center",
      inline: "center",
      behavior: "instant",
    });
    expect(order[0]).toBe("scroll");
    expect(order.indexOf("scroll")).toBeLessThan(order.indexOf("rect"));
  });

  it("quietly no-ops when the target is missing", () => {
    expect(() => render(<LiftBeat target="wt-nonexistent" />)).not.toThrow();
  });

  it("leaves no style residue after mount, unmount, remount, unmount", async () => {
    const target = makeTarget();
    render(<LiftBeat target="wt-test" />).unmount();
    await flushMicrotasks();
    render(<LiftBeat target="wt-test" />).unmount();
    await flushMicrotasks();

    const style = target.getAttribute("style");
    expect(style === null || style === "").toBe(true);
  });

  it("pins width/height on mount and restores them on unmount", async () => {
    const target = makeTarget({ width: "50%", height: "auto", margin: "8px" });
    target.getBoundingClientRect = () =>
      ({ top: 10, left: 20, width: 300, height: 120, right: 320, bottom: 130, x: 20, y: 10 }) as DOMRect;

    const { unmount } = render(<LiftBeat target="wt-test" />);
    expect(target.style.width).toBe("300px");
    expect(target.style.height).toBe("120px");
    expect(target.style.margin).toBe("0px");

    unmount();
    await flushMicrotasks();
    expect(target.style.width).toBe("50%");
    expect(target.style.height).toBe("auto");
    expect(target.style.margin).toBe("8px");
  });

  it("ignores stale wt-stage-slot elements", () => {
    const stale = makeTarget();
    stale.classList.add("wt-stage-slot");
    render(<LiftBeat target="wt-test" />);
    expect(stale.style.position).toBe("");
  });

  it("flips transform to the centered, scaled value on the next frame", () => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame"] });
    const target = makeTarget();
    target.getBoundingClientRect = () =>
      ({ top: 100, left: 100, width: 200, height: 100, right: 300, bottom: 200, x: 100, y: 100 }) as DOMRect;
    window.innerWidth = 1000;
    window.innerHeight = 800;

    render(<LiftBeat target="wt-test" scale={1.4} position="center" />);
    expect(target.style.transform).toBe("translate(0px, 0px) scale(1)");

    vi.advanceTimersByTime(50);
    // dx = 500 - 200 = 300; dy = 400 - 150 = 250
    expect(target.style.transform).toBe("translate(300px, 250px) scale(1.4)");
  });

  it("dev-warns when an ancestor would trap position:fixed (filter)", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const wrapper = document.createElement("div");
    wrapper.style.filter = "drop-shadow(0px 2px 9px rgba(18,17,48,0.07))";
    document.body.appendChild(wrapper);
    added.push(wrapper);
    const el = document.createElement("div");
    el.setAttribute("data-vt-name", "wt-test");
    wrapper.appendChild(el);

    render(<LiftBeat target="wt-test" />);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0][0])).toContain("filter");
  });

  it("does not warn for a plain ancestor chain", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    makeTarget();
    render(<LiftBeat target="wt-test" />);
    expect(warn).not.toHaveBeenCalled();
  });

  it("lifts a target that appears a few frames after mount (late page render)", () => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame"] });
    render(<LiftBeat target="wt-test" />);
    vi.advanceTimersByTime(16 * 3);

    const target = makeTarget({ position: "relative" });
    vi.advanceTimersByTime(16 * 2);
    expect(target.style.position).toBe("fixed");
    expect(target.style.zIndex).toBe("260");
  });

  it("gives up quietly after the retry window and leaves late targets untouched", async () => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame"] });
    const { unmount } = render(<LiftBeat target="wt-test" />);
    vi.advanceTimersByTime(16 * 60);

    const target = makeTarget();
    vi.advanceTimersByTime(16 * 10);
    expect(target.getAttribute("style")).toBeNull();
    unmount();
    await flushMicrotasks();
    expect(target.getAttribute("style")).toBeNull();
  });

  it("stops retrying on unmount and restores a late-claimed target", async () => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame"] });
    const first = render(<LiftBeat target="wt-test" />);
    first.unmount();
    const target = makeTarget();
    vi.advanceTimersByTime(16 * 5);
    expect(target.getAttribute("style")).toBeNull();

    const second = render(<LiftBeat target="wt-other" />);
    const other = document.createElement("div");
    other.setAttribute("data-vt-name", "wt-other");
    document.body.appendChild(other);
    added.push(other);
    vi.advanceTimersByTime(16 * 2);
    expect(other.style.position).toBe("fixed");
    second.unmount();
    await flushMicrotasks();
    const style = other.getAttribute("style");
    expect(style === null || style === "").toBe(true);
  });
});
