import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { WalkthroughProvider, useCursor } from "../cursor";
import { WalkthroughHUD } from "../WalkthroughHUD";
import type { Sequence } from "../types";
import { useEffect } from "react";

const seq: Sequence = [
  { id: "a", page: "dashboard", beats: [{ kind: "idle" }, { kind: "idle" }] },
  { id: "b", page: "amenities", beats: [{ kind: "idle" }] },
];

function ShowHud() {
  const { toggleHud } = useCursor();
  useEffect(() => toggleHud(), [toggleHud]);
  return null;
}

describe("WalkthroughHUD", () => {
  it("is hidden by default", () => {
    render(
      <WalkthroughProvider sequence={seq}>
        <WalkthroughHUD />
      </WalkthroughProvider>,
    );
    expect(screen.queryByTestId("wt-hud")).toBeNull();
  });

  it("shows progress text when visible", () => {
    render(
      <WalkthroughProvider sequence={seq}>
        <ShowHud />
        <WalkthroughHUD />
      </WalkthroughProvider>,
    );
    expect(screen.getByTestId("wt-hud")).toBeInTheDocument();
    expect(screen.getByText(/scene 1 of 2/i)).toBeInTheDocument();
  });

  it("Next button advances the cursor", () => {
    render(
      <WalkthroughProvider sequence={seq}>
        <ShowHud />
        <WalkthroughHUD />
      </WalkthroughProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(screen.getByText(/beat 2 of 2/i)).toBeInTheDocument();
  });
});
