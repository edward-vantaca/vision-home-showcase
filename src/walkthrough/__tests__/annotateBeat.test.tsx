import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import gsap from "gsap";
import { AnnotateWithGSAP } from "../beats/AnnotateWithGSAP";

describe("AnnotateWithGSAP beat", () => {
  it("renders without crashing with a typeCaption track", () => {
    render(
      <AnnotateWithGSAP
        beat={{
          kind: "annotate",
          tracks: [{ type: "typeCaption", text: "hello world" }],
        }}
        onComplete={vi.fn()}
      />,
    );
    expect(screen.getByTestId("annotate-beat")).toBeInTheDocument();
  });

  it("does not leak timelines after unmount", () => {
    const before = gsap.globalTimeline.getChildren().length;
    const { unmount } = render(
      <AnnotateWithGSAP
        beat={{
          kind: "annotate",
          tracks: [{ type: "typeCaption", text: "x" }],
        }}
        onComplete={vi.fn()}
      />,
    );
    unmount();
    const after = gsap.globalTimeline.getChildren().length;
    expect(after).toBeLessThanOrEqual(before);
  });
});
