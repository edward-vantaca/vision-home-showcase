import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { WalkthroughProvider } from "../cursor";
import { WalkthroughOverlay } from "../WalkthroughOverlay";
import type { Sequence } from "../types";
import { VT } from "../viewTransitionNames";

const seqIdle: Sequence = [{ id: "s", page: "dashboard", beats: [{ kind: "idle" }] }];
const seqHighlight: Sequence = [
  { id: "s", page: "dashboard", beats: [{ kind: "highlight", target: VT.BoardTaskCurrent, caption: "hello" }] },
];

const cursorScene = (stage?: "phone"): Sequence => [
  { id: "s", page: "dashboard", stage, beats: [{ kind: "cursor", to: VT.SmsSendBtn, action: "click" }] },
];

describe("WalkthroughOverlay", () => {
  it("uses the touch pointer for cursor beats in a phone scene", () => {
    render(
      <WalkthroughProvider sequence={cursorScene("phone")}>
        <WalkthroughOverlay />
      </WalkthroughProvider>,
    );
    expect(document.querySelector(".wt-cursor-touch")).not.toBeNull();
  });

  it("uses the arrow pointer for cursor beats elsewhere", () => {
    render(
      <WalkthroughProvider sequence={cursorScene()}>
        <WalkthroughOverlay />
      </WalkthroughProvider>,
    );
    expect(document.querySelector('[data-testid="cursor-beat"] svg')).not.toBeNull();
    expect(document.querySelector(".wt-cursor-touch")).toBeNull();
  });

  it("renders the backdrop with data-beat-kind='idle' for idle beat", () => {
    render(
      <WalkthroughProvider sequence={seqIdle}>
        <WalkthroughOverlay />
      </WalkthroughProvider>,
    );
    const backdrop = document.querySelector(".wt-backdrop");
    expect(backdrop?.getAttribute("data-beat-kind")).toBe("idle");
  });

  it("renders the caption text for a highlight beat", () => {
    render(
      <WalkthroughProvider sequence={seqHighlight}>
        <WalkthroughOverlay />
      </WalkthroughProvider>,
    );
    expect(screen.getByText("hello")).toBeInTheDocument();
  });

  it("renders the cutout div for a highlight beat with target present", () => {
    const target = document.createElement("div");
    target.setAttribute("data-vt-name", "wt-board-task-current");
    target.getBoundingClientRect = () => new DOMRect(10, 20, 100, 50);
    target.scrollIntoView = () => {};
    document.body.appendChild(target);
    render(
      <WalkthroughProvider sequence={seqHighlight}>
        <WalkthroughOverlay />
      </WalkthroughProvider>,
    );
    expect(document.querySelector(".wt-cutout")).not.toBeNull();
    target.remove();
  });

  it("does not render the cutout div for a highlight beat when target is absent", () => {
    render(
      <WalkthroughProvider sequence={seqHighlight}>
        <WalkthroughOverlay />
      </WalkthroughProvider>,
    );
    expect(document.querySelector(".wt-cutout")).toBeNull();
  });
});
