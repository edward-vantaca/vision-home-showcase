import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { AnnotateBeat } from "../beats/AnnotateBeat";

describe("AnnotateBeat", () => {
  it("renders a caption slot with data-track='caption-0'", () => {
    render(<AnnotateBeat tracks={[{ type: "typeCaption", text: "hello world" }]} />);
    expect(document.querySelector('[data-track="caption-0"]')).not.toBeNull();
  });

  it("renders a pulse ring when the target exists in the DOM", () => {
    const el = document.createElement("div");
    el.setAttribute("data-vt-name", "wt-pulse-target");
    document.body.appendChild(el);
    render(<AnnotateBeat tracks={[{ type: "pulse", target: "wt-pulse-target" as any }]} />);
    expect(document.querySelector('[data-track="pulse-0"]')).not.toBeNull();
    el.remove();
  });
});
