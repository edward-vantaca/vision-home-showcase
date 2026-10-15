import { describe, it, expect, vi, afterEach } from "vitest";
import { render } from "@testing-library/react";
import { WalkthroughRoot } from "../WalkthroughRoot";
import type { Sequence } from "../types.new";

const seq: Sequence = [{ id: "s", page: "dashboard", beats: [{ kind: "idle" }] }];

describe("WalkthroughRoot", () => {
  afterEach(() => vi.restoreAllMocks());

  it("renders children", () => {
    const { getByText } = render(
      <WalkthroughRoot sequence={seq}>
        <div>child</div>
      </WalkthroughRoot>,
    );
    expect(getByText("child")).toBeInTheDocument();
  });

  it("warns in dev when duplicate view-transition-names are present", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const a = document.createElement("div");
    a.setAttribute("data-vt-name", "wt-dup");
    const b = document.createElement("div");
    b.setAttribute("data-vt-name", "wt-dup");
    document.body.appendChild(a);
    document.body.appendChild(b);
    render(
      <WalkthroughRoot sequence={seq}>
        <div>child</div>
      </WalkthroughRoot>,
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("wt-dup"));
    a.remove();
    b.remove();
  });
});
