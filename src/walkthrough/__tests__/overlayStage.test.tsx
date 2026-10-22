import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render } from "@testing-library/react";
import { WalkthroughProvider, useCursor } from "../cursor";
import { WalkthroughOverlay } from "../WalkthroughOverlay";
import type { Sequence } from "../types";
import gsap from "gsap";
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

// lift(W) -> cursor (clicks a button on the lifted widget, then releases the
// stage once the modal it opens covers the screen) -> idle.
describe("WalkthroughOverlay stage held through a cursor beat", () => {
  const W = VT.PaymentsWidget;
  const BTN = VT.PaymentsMakePaymentBtn;
  const cursorSequence: Sequence = [
    {
      id: "payments",
      page: "dashboard",
      beats: [
        { kind: "lift", target: W, scale: 1.15 },
        { kind: "cursor", to: BTN, action: "click", releaseStage: true, replayOnBack: true },
        { kind: "idle" },
      ],
    },
    {
      id: "payments-modal",
      page: "dashboard",
      beats: [
        { kind: "lift", target: W, scale: 1.15 },
        {
          kind: "cursor",
          to: BTN,
          action: "click",
          hideStage: true,
          then: [{ to: BTN, action: "click", releaseStage: true }],
        },
      ],
    },
  ];
  let widget: HTMLElement;

  const backdropKind = () => document.querySelector(".wt-backdrop")?.getAttribute("data-beat-kind");

  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
    widget = document.createElement("div");
    widget.setAttribute("data-vt-name", W);
    widget.getBoundingClientRect = () => new DOMRect(40, 60, 300, 120);
    const btn = document.createElement("button");
    btn.setAttribute("data-vt-name", BTN);
    widget.appendChild(btn);
    document.body.appendChild(widget);
    render(
      <WalkthroughProvider sequence={cursorSequence}>
        <Controls />
        <WalkthroughOverlay />
      </WalkthroughProvider>,
    );
  });

  afterEach(async () => {
    cleanup();
    await nextFrames(1);
    widget.remove();
    controls = null;
    // @ts-expect-error restore jsdom's lack of scrollIntoView
    delete Element.prototype.scrollIntoView;
    vi.restoreAllMocks();
  });

  it("keeps the widget lifted with the lift backdrop while the cursor approaches", async () => {
    expect(widget.style.position).toBe("fixed");
    const timeline = vi.spyOn(gsap, "timeline");

    await step("advance"); // cursor
    expect(widget.style.position).toBe("fixed");
    expect(backdropKind()).toBe("lift");

    // Run the cursor timeline: click, then release the stage. The widget glides
    // home (still pinned, transform back to identity) while the blur fades.
    act(() => {
      timeline.mock.results[0].value.progress(1);
    });
    await nextFrames();
    expect(widget.style.position).toBe("fixed");
    expect(widget.style.transform).toBe("translate(0px, 0px) scale(1)");
    expect(widget.style.transition).toContain("transform");
    expect(backdropKind()).toBe("cursor");

    await step("advance"); // idle: styles restored once it's home
    expect(hasNoStyle(widget)).toBe(true);
  });

  it("hideStage fades the staged widget out but keeps it lifted with the blur up", async () => {
    const timeline = vi.spyOn(gsap, "timeline");
    act(() => {
      controls!.jumpTo({ sceneIndex: 1, beatIndex: 1 }); // hide-then-release variant
    });
    await nextFrames();
    // Scrub the timeline forward until the hide lands, stopping before the release.
    const tl = timeline.mock.results[0].value;
    for (let p = 0; p <= 1 && widget.style.opacity !== "0"; p += 0.02) {
      act(() => {
        tl.progress(p);
      });
    }
    await nextFrames();
    expect(widget.style.position).toBe("fixed");
    expect(widget.style.opacity).toBe("0");
    expect(backdropKind()).toBe("lift");

    act(() => {
      timeline.mock.results[0].value.progress(1);
    });
    await nextFrames();
    // Released: glides home and fades back in (opacity returns to its original value).
    expect(widget.style.position).toBe("fixed");
    expect(widget.style.transform).toBe("translate(0px, 0px) scale(1)");
    expect(widget.style.opacity).toBe("");
    expect(backdropKind()).toBe("cursor");
  });

  it("re-stages the widget when scrubbing back onto the cursor beat", async () => {
    const timeline = vi.spyOn(gsap, "timeline");
    await step("advance"); // cursor
    act(() => {
      timeline.mock.results[0].value.progress(1);
    });
    await nextFrames();
    await step("advance"); // idle
    expect(hasNoStyle(widget)).toBe(true);

    await step("back"); // cursor, entered backward: lift is staged again
    expect(widget.style.position).toBe("fixed");
    expect(backdropKind()).toBe("lift");

    await step("advance"); // replay forward: the stage must be held again, not "already released"
    expect(widget.style.position).toBe("fixed");
    expect(backdropKind()).toBe("lift");
  });
});
