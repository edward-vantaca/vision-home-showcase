import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render } from "@testing-library/react";
import { WalkthroughProvider, useCursor } from "../cursor";
import { WalkthroughOverlay } from "../WalkthroughOverlay";
import type { Sequence } from "../types";
import { VT } from "../viewTransitionNames";

// Overlay-level integration: lift(T) -> expand(T) -> annotate -> idle on one
// real target, driven through the real WalkthroughProvider cursor.
const T = VT.BoardTaskCurrent;
const sequence: Sequence = [
  {
    id: "stage",
    page: "dashboard",
    beats: [
      { kind: "idle" },
      { kind: "lift", target: T, scale: 1.2 },
      { kind: "expand", target: T, content: <div data-testid="expand-content">detail</div> },
      { kind: "annotate", tracks: [{ type: "typeCaption", text: "note" }], durationMs: 200 },
      { kind: "idle" },
    ],
  },
];

let controls: ReturnType<typeof useCursor> | null = null;
function Controls() {
  controls = useCursor();
  return null;
}

function nextFrames(n = 3): Promise<void> {
  return act(async () => {
    for (let i = 0; i < n; i++) await new Promise((r) => requestAnimationFrame(() => r(undefined)));
    await Promise.resolve();
  });
}

async function step(dir: "advance" | "back") {
  act(() => {
    controls![dir]();
  });
  await nextFrames();
}

function hasNoStyle(el: HTMLElement): boolean {
  const style = el.getAttribute("style");
  return style === null || style === "";
}

describe("WalkthroughOverlay sticky stage", () => {
  let target: HTMLElement;

  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
    target = document.createElement("div");
    target.setAttribute("data-vt-name", T);
    target.getBoundingClientRect = () => new DOMRect(40, 60, 300, 120);
    document.body.appendChild(target);
    render(
      <WalkthroughProvider sequence={sequence}>
        <Controls />
        <WalkthroughOverlay />
      </WalkthroughProvider>,
    );
  });

  afterEach(async () => {
    cleanup();
    await nextFrames(1);
    target.remove();
    controls = null;
    // @ts-expect-error restore jsdom's lack of scrollIntoView
    delete Element.prototype.scrollIntoView;
    vi.restoreAllMocks();
  });

  it("keeps the target staged through lift -> expand -> annotate and fully restores at idle", async () => {
    expect(hasNoStyle(target)).toBe(true);

    await step("advance"); // lift
    expect(target.style.position).toBe("fixed");
    expect(target.style.opacity).toBe("");

    await step("advance"); // expand (same-target handoff)
    expect(target.style.position).toBe("fixed");
    expect(target.style.opacity).toBe("0");
    expect(document.querySelector('[data-testid="expand-content"]')).not.toBeNull();

    await step("advance"); // annotate: expand stays mounted (sticky stage)
    expect(target.style.position).toBe("fixed");
    expect(target.style.opacity).toBe("0");
    expect(document.querySelector('[data-testid="expand-content"]')).not.toBeNull();
    expect(document.querySelector('[data-track="caption-0"]')).not.toBeNull();

    await step("advance"); // idle
    expect(hasNoStyle(target)).toBe(true);
    expect(document.querySelector('[data-testid="expand-content"]')).toBeNull();
  });

  it("scrubbing back from annotate to before the lift restores the target", async () => {
    await step("advance"); // lift
    await step("advance"); // expand
    await step("advance"); // annotate

    await step("back"); // expand
    expect(target.style.position).toBe("fixed");
    expect(target.style.opacity).toBe("0");

    await step("back"); // lift: un-dissolves, still staged
    expect(target.style.position).toBe("fixed");
    expect(target.style.opacity).toBe("");
    // Opacity must transition back in, not snap 0 -> 1.
    expect(target.style.transition).toContain("opacity");

    await step("back"); // idle, before the lift
    expect(hasNoStyle(target)).toBe(true);
  });
});
