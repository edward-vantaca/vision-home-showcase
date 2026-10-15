import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { HighlightBeat } from "../beats/HighlightBeat";

describe("HighlightBeat", () => {
  it("calls scrollIntoView on the matching target", () => {
    const el = document.createElement("div");
    el.setAttribute("data-vt-name", "wt-target");
    const spy = vi.fn();
    el.scrollIntoView = spy;
    document.body.appendChild(el);
    render(<HighlightBeat target="wt-target" />);
    expect(spy).toHaveBeenCalledWith({ block: "center", behavior: "auto" });
    el.remove();
  });

  it("is a no-op when no matching element exists", () => {
    expect(() => render(<HighlightBeat target="wt-missing" />)).not.toThrow();
  });
});
