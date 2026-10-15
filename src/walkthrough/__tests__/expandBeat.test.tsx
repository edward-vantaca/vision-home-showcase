import { describe, it, expect } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ExpandBeat } from "../beats/ExpandBeat";

describe("ExpandBeat", () => {
  it("renders the content inside a stage slot", () => {
    render(
      <ExpandBeat target="wt-x">
        <div>expanded content</div>
      </ExpandBeat>,
    );
    expect(screen.getByText("expanded content")).toBeInTheDocument();
    const slot = document.querySelector("[data-vt-name='wt-x'].wt-stage-slot");
    expect(slot).not.toBeNull();
  });

  it("applies max-height for viewport-safe scrolling", () => {
    const { container } = render(
      <ExpandBeat target="wt-x">
        <div>c</div>
      </ExpandBeat>,
    );
    const slot = container.querySelector(".wt-stage-slot") as HTMLElement;
    expect(slot.style.maxHeight).toContain("calc(100vh");
  });

  it("hides the scene-side element while mounted", () => {
    const scene = document.createElement("div");
    scene.setAttribute("data-vt-name", "wt-x");
    document.body.appendChild(scene);
    render(<ExpandBeat target="wt-x">c</ExpandBeat>);
    expect(scene.style.visibility).toBe("hidden");
    cleanup();
    expect(scene.style.visibility).toBe("");
    scene.remove();
  });
});
