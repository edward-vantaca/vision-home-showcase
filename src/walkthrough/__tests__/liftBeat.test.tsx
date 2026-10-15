import { describe, it, expect } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { LiftBeat } from "../beats/LiftBeat";

describe("LiftBeat", () => {
  it("renders a stage slot with the matching data-vt-name", () => {
    render(<LiftBeat target="wt-x" />);
    const slot = document.querySelector("[data-vt-name='wt-x'].wt-stage-slot");
    expect(slot).not.toBeNull();
  });

  it("hides the scene-side element while mounted", () => {
    const scene = document.createElement("div");
    scene.setAttribute("data-vt-name", "wt-x");
    document.body.appendChild(scene);
    render(<LiftBeat target="wt-x" />);
    expect(scene.style.visibility).toBe("hidden");
    cleanup();
    expect(scene.style.visibility).toBe("");
    scene.remove();
  });
});
