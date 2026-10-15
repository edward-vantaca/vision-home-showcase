import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { WalkthroughProvider } from "../cursor";
import { WalkthroughOverlay } from "../WalkthroughOverlay";
import type { Sequence } from "../types.new";
import { VT } from "../viewTransitionNames";

const seqIdle: Sequence = [{ id: "s", page: "dashboard", beats: [{ kind: "idle" }] }];
const seqHighlight: Sequence = [
  { id: "s", page: "dashboard", beats: [{ kind: "highlight", target: VT.BoardTaskCurrent, caption: "hello" }] },
];

describe("WalkthroughOverlay", () => {
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

  it("renders the cutout div for a highlight beat", () => {
    render(
      <WalkthroughProvider sequence={seqHighlight}>
        <WalkthroughOverlay />
      </WalkthroughProvider>,
    );
    expect(document.querySelector(".wt-cutout")).not.toBeNull();
  });
});
