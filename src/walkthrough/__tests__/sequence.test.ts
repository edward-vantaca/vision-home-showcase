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
        if (beat.kind === "cursor") {
          expect(vtValues.has(beat.to as any)).toBe(true);
        }
      }
    }
  });

  it("rests on a motion-free dashboard scene between Enter portal and Payments", () => {
    const ids = homeVisionSequence.map((s) => s.id);
    const portal = ids.indexOf("go-to-portal");
    expect(ids.slice(portal, portal + 3)).toEqual(["go-to-portal", "dashboard", "payments"]);
    const dashboard = homeVisionSequence[portal + 1];
    expect(dashboard.beats.every((b) => b.kind === "idle")).toBe(true);
    // Same app state as Payments, so entering Payments changes nothing but the lift.
    const payments = homeVisionSequence[portal + 2];
    expect(dashboard.appState).toEqual(payments.appState);
  });

  it("ends on a still dashboard after Ask HOAi so the panel returns to the sidebar", () => {
    const ids = homeVisionSequence.map((s) => s.id);
    expect(ids.slice(-2)).toEqual(["ask-hoai", "closing-dashboard"]);
    const closing = homeVisionSequence[homeVisionSequence.length - 1];
    expect(closing.appState?.askHoaiOpen).toBe(true);
    expect(closing.beats.every((b) => b.kind === "idle")).toBe(true);
  });

  it("Payments keeps the lift + blur up through the modal and releases it on the closing X", () => {
    const payments = homeVisionSequence.find((s) => s.id === "payments");
    const demo = payments?.beats.find((b) => b.kind === "cursor");
    if (demo?.kind !== "cursor") throw new Error("payments has no cursor beat");
    const stops = [{ to: demo.to, releaseStage: demo.releaseStage }, ...(demo.then ?? [])];
    expect(stops.filter((s) => s.releaseStage).map((s) => s.to)).toEqual([VT.PaymentModalCloseBtn]);
    expect(stops[stops.length - 1].to).toBe(VT.PaymentModalCloseBtn);
  });

  it("AutoPay starts on the confirm screen Create account lands on (keeps the welcome banner)", () => {
    // Its appState re-mounts the onboarding flow on scene entry; the standalone
    // "autopay" screen has no welcome banner, so it would vanish mid-demo.
    const autopay = homeVisionSequence.find((s) => s.id === "autopay");
    expect(autopay?.appState).toEqual({ phase: "onboarding", onboardingScreen: "confirm" });
  });

  it("every scene has at least one beat", () => {
    for (const scene of homeVisionSequence) {
      expect(scene.beats.length).toBeGreaterThan(0);
    }
  });

  it("VT constants are unique", () => {
    const values = Object.values(VT);
    expect(new Set(values).size).toBe(values.length);
  });
});
