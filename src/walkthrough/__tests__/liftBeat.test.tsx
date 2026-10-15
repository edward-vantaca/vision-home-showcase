import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LiftToStage } from "../beats/LiftToStage";
import { ReturnToOrigin } from "../beats/ReturnToOrigin";

describe("Lift / Return beats", () => {
  it("Lift renders without crashing", () => {
    render(
      <LiftToStage
        beat={{ kind: "lift", target: "nope", scale: 1.4, position: "center" }}
        onComplete={vi.fn()}
      />,
    );
    expect(screen.getByTestId("lift-beat")).toBeInTheDocument();
  });

  it("does NOT auto-invoke onComplete when target missing", async () => {
    const onComplete = vi.fn();
    render(
      <LiftToStage
        beat={{ kind: "lift", target: "nope", scale: 1.4, position: "center" }}
        onComplete={onComplete}
      />,
    );
    await new Promise((r) => setTimeout(r, 10));
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("Return renders without crashing", () => {
    render(
      <ReturnToOrigin beat={{ kind: "return" }} onComplete={vi.fn()} />,
    );
    expect(screen.getByTestId("return-beat")).toBeInTheDocument();
  });
});
