import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { WalkthroughProvider, useCursor, holdBusy } from "../cursor";
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

  it("Next and Back buttons do nothing while a busy hold is active", () => {
    render(
      <WalkthroughProvider sequence={seq}>
        <ShowHud />
        <WalkthroughHUD />
      </WalkthroughProvider>,
    );
    const release = holdBusy();
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(screen.getByText(/beat 1 of 2/i)).toBeInTheDocument();
    release();
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(screen.getByText(/beat 2 of 2/i)).toBeInTheDocument();
    const release2 = holdBusy();
    fireEvent.click(screen.getByRole("button", { name: /prev|back|←/i }));
    expect(screen.getByText(/beat 2 of 2/i)).toBeInTheDocument();
    release2();
  });
});
