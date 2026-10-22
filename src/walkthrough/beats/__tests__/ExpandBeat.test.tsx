import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import { StrictMode, type ReactNode } from "react";
import { ExpandBeat } from "../ExpandBeat";
import { LiftBeat } from "../LiftBeat";

const added: HTMLElement[] = [];
const originalInnerWidth = window.innerWidth;
const originalInnerHeight = window.innerHeight;

function makeTarget(style?: Partial<CSSStyleDeclaration>): HTMLElement {
  const el = document.createElement("div");
  el.setAttribute("data-vt-name", "wt-test");
  if (style) Object.assign(el.style, style);
  document.body.appendChild(el);
  added.push(el);
  return el;
}

function flushMicrotasks(): Promise<void> {
  return act(async () => {
    await Promise.resolve();
  });
}

function hasNoStyle(el: HTMLElement): boolean {
  const style = el.getAttribute("style");
  return style === null || style === "";
}

describe("ExpandBeat", () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(async () => {
    cleanup();
    await flushMicrotasks();
    added.splice(0).forEach((el) => el.remove());
    // @ts-expect-error restore jsdom's lack of scrollIntoView
    delete Element.prototype.scrollIntoView;
    window.innerWidth = originalInnerWidth;
    window.innerHeight = originalInnerHeight;
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("lifts the target and renders fade-in content", () => {
    const target = makeTarget();

    render(
      <ExpandBeat target="wt-test">
        <div data-testid="content">hi</div>
      </ExpandBeat>,
    );

    expect(target.style.position).toBe("fixed");
    expect(screen.getByTestId("content")).toBeInTheDocument();
  });

  it("restores target styles on unmount", async () => {
    const target = makeTarget({ position: "relative" });

    const { unmount } = render(
      <ExpandBeat target="wt-test">
        <div />
      </ExpandBeat>,
    );
    unmount();
    await flushMicrotasks();

    expect(target.style.position).toBe("relative");
  });

  it("quietly no-ops when target is missing", () => {
    expect(() =>
      render(
        <ExpandBeat target="wt-nonexistent">
          <div />
        </ExpandBeat>,
      ),
    ).not.toThrow();
  });

  it("dissolves the target (opacity 0, pointer-events none) and restores after", async () => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame"] });
    const target = makeTarget({ opacity: "0.9" });

    const { unmount } = render(
      <ExpandBeat target="wt-test">
        <div />
      </ExpandBeat>,
    );
    vi.advanceTimersByTime(50);

    expect(target.style.opacity).toBe("0");
    expect(target.style.pointerEvents).toBe("none");
    expect(target.style.transition).toContain("opacity 500ms ease-out");

    unmount();
    await flushMicrotasks();
    expect(target.style.opacity).toBe("0.9");
    expect(target.style.pointerEvents).toBe("");
    expect(target.style.position).toBe("");
  });

  it("centers the target at scale 1 on a fresh mount", () => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame"] });
    const target = makeTarget();
    target.getBoundingClientRect = () =>
      ({ top: 100, left: 100, width: 200, height: 100, right: 300, bottom: 200, x: 100, y: 100 }) as DOMRect;
    window.innerWidth = 1000;
    window.innerHeight = 800;

    render(
      <ExpandBeat target="wt-test">
        <div />
      </ExpandBeat>,
    );
    vi.advanceTimersByTime(50);

    expect(target.style.transform).toBe("translate(300px, 250px) scale(1)");
  });

  it("fades the panel in on the next frame, without stage-slot markers", () => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame"] });

    render(
      <ExpandBeat target="wt-test">
        <div data-testid="content">hi</div>
      </ExpandBeat>,
    );
    const panel = screen.getByTestId("content").parentElement as HTMLElement;

    expect(panel.style.opacity).toBe("0");
    expect(panel.style.transition).toBe("opacity 500ms ease-out");
    expect(panel.style.maxHeight).toContain("calc(100vh");
    expect(panel.classList.contains("wt-stage-slot")).toBe(false);
    expect(panel.hasAttribute("data-vt-name")).toBe(false);

    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(panel.style.opacity).toBe("1");
  });
});

describe("lift → expand handoff", () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(async () => {
    cleanup();
    await flushMicrotasks();
    added.splice(0).forEach((el) => el.remove());
    // @ts-expect-error restore jsdom's lack of scrollIntoView
    delete Element.prototype.scrollIntoView;
    window.innerWidth = originalInnerWidth;
    window.innerHeight = originalInnerHeight;
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  function Stage({ kind }: { kind: "lift" | "expand" }): ReactNode {
    return kind === "lift" ? (
      <LiftBeat target="wt-test" scale={1.4} />
    ) : (
      <ExpandBeat target="wt-test">
        <div />
      </ExpandBeat>
    );
  }

  it("keeps the target lifted across a same-commit lift → expand swap", async () => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame"] });
    const target = makeTarget({ position: "relative" });
    target.getBoundingClientRect = () =>
      ({ top: 100, left: 100, width: 200, height: 100, right: 300, bottom: 200, x: 100, y: 100 }) as DOMRect;
    window.innerWidth = 1000;
    window.innerHeight = 800;

    const { rerender } = render(<Stage kind="lift" />);
    vi.advanceTimersByTime(50);
    expect(target.style.transform).toBe("translate(300px, 250px) scale(1.4)");

    // Every style write from here on must start from a still-pinned element.
    const records: MutationRecord[] = [];
    const observer = new MutationObserver((batch) => records.push(...batch));
    observer.observe(target, { attributes: true, attributeFilter: ["style"], attributeOldValue: true });
    rerender(<Stage kind="expand" />);
    await flushMicrotasks();
    records.push(...observer.takeRecords());
    observer.disconnect();

    expect(target.style.position).toBe("fixed");
    expect(target.style.top).toBe("100px");
    // Expand keeps the lift's transform rather than retargeting.
    expect(target.style.transform).toBe("translate(300px, 250px) scale(1.4)");
    expect(target.style.opacity).toBe("0");
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledTimes(1);
    expect(records.length).toBeGreaterThan(0);
    expect(records.every((r) => (r.oldValue ?? "").includes("position: fixed"))).toBe(true);
  });

  it("keeps exactly one spacer across a lift → expand handoff, removed at the end", async () => {
    const target = makeTarget();
    const parent = target.parentElement!;
    const countSpacers = () => parent.querySelectorAll("[data-wt-lift-spacer]").length;

    const { rerender, unmount } = render(<Stage kind="lift" />);
    expect(countSpacers()).toBe(1);
    rerender(<Stage kind="expand" />);
    await flushMicrotasks();
    expect(countSpacers()).toBe(1);
    unmount();
    await flushMicrotasks();
    expect(countSpacers()).toBe(0);
  });

  it("restores the original snapshot (not lifted values) after the handoff ends", async () => {
    const target = makeTarget({ position: "relative", width: "50%" });

    const { rerender, unmount } = render(<Stage kind="lift" />);
    rerender(<Stage kind="expand" />);
    await flushMicrotasks();
    unmount();
    await flushMicrotasks();

    expect(target.style.position).toBe("relative");
    expect(target.style.width).toBe("50%");
    expect(target.style.zIndex).toBe("");
    expect(target.style.opacity).toBe("");
  });

  it("leaves no residue after a lone unmount", async () => {
    const target = makeTarget();

    const { unmount } = render(
      <ExpandBeat target="wt-test">
        <div />
      </ExpandBeat>,
    );
    unmount();
    await flushMicrotasks();

    expect(hasNoStyle(target)).toBe(true);
  });

  it("leaves no residue after mount, unmount, remount, unmount", async () => {
    const target = makeTarget();

    render(<Stage kind="expand" />).unmount();
    await flushMicrotasks();
    render(<Stage kind="lift" />).unmount();
    render(<Stage kind="expand" />).unmount();
    await flushMicrotasks();

    expect(hasNoStyle(target)).toBe(true);
  });

  it("survives StrictMode double-mount: lifts, then restores with no residue", async () => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame"] });
    const target = makeTarget();
    target.getBoundingClientRect = () =>
      ({ top: 100, left: 100, width: 200, height: 100, right: 300, bottom: 200, x: 100, y: 100 }) as DOMRect;
    window.innerWidth = 1000;
    window.innerHeight = 800;

    const { unmount } = render(
      <StrictMode>
        <Stage kind="expand" />
      </StrictMode>,
    );
    await flushMicrotasks();
    vi.advanceTimersByTime(50);
    expect(target.style.position).toBe("fixed");
    expect(target.style.transform).toBe("translate(300px, 250px) scale(1)");
    expect(target.style.opacity).toBe("0");

    unmount();
    await flushMicrotasks();
    expect(hasNoStyle(target)).toBe(true);
  });
});
