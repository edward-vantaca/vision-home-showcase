import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HighlightTarget } from "../beats/HighlightTarget";

describe("HighlightTarget beat", () => {
  it("renders without crashing when target is missing", () => {
    const onComplete = vi.fn();
    render(<HighlightTarget beat={{ kind: "highlight", target: "nope" }} onComplete={onComplete} />);
    expect(screen.getByTestId("highlight-beat")).toBeInTheDocument();
  });

  it("does NOT auto-invoke onComplete when target missing", async () => {
    const onComplete = vi.fn();
    render(<HighlightTarget beat={{ kind: "highlight", target: "nope" }} onComplete={onComplete} />);
    await new Promise((r) => setTimeout(r, 10));
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("renders ring overlay when target exists", async () => {
    const el = document.createElement("div");
    el.setAttribute("data-ux-id", "has-target");
    el.style.width = "100px";
    el.style.height = "40px";
    document.body.appendChild(el);
    const onComplete = vi.fn();
    render(<HighlightTarget beat={{ kind: "highlight", target: "has-target" }} onComplete={onComplete} />);
    expect(screen.getByTestId("highlight-ring")).toBeInTheDocument();
    document.body.removeChild(el);
  });
});
