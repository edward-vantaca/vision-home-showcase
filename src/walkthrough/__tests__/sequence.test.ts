import { describe, it, expect } from "vitest";
import { homeVisionSequence } from "../scenes";
import { VT } from "../viewTransitionNames";

const vtValues = new Set(Object.values(VT));

describe("homeVisionSequence", () => {
  it("has at least one scene", () => {
    expect(homeVisionSequence.length).toBeGreaterThan(0);
  });

  it("every targeted beat references a known VT name", () => {
    for (const scene of homeVisionSequence) {
      for (const beat of scene.beats) {
        if (beat.kind === "highlight" || beat.kind === "lift" || beat.kind === "expand") {
          expect(vtValues.has(beat.target as any)).toBe(true);
        }
      }
    }
  });

  it("every scene starts with an idle beat", () => {
    for (const scene of homeVisionSequence) {
      expect(scene.beats[0].kind).toBe("idle");
    }
  });

  it("VT constants are unique", () => {
    const values = Object.values(VT);
    expect(new Set(values).size).toBe(values.length);
  });
});
