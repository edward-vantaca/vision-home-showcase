import { describe, expect, it } from "vitest";
import { sequenceRegistry } from "../sequences";
import type { BeatKind } from "../types";

const knownKinds: BeatKind[] = ["highlight", "lift", "expand", "annotate", "return", "navigate"];

describe("sequence registry", () => {
  it("every registered sequence has at least one beat", () => {
    for (const seq of Object.values(sequenceRegistry)) {
      expect(seq.beats.length).toBeGreaterThan(0);
    }
  });

  it("every beat has a known kind", () => {
    for (const seq of Object.values(sequenceRegistry)) {
      for (const beat of seq.beats) {
        expect(knownKinds).toContain(beat.kind);
      }
    }
  });

  it("every sequence has a unique id", () => {
    const ids = Object.values(sequenceRegistry).map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
