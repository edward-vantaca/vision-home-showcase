import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { WalkthroughRoot } from "../WalkthroughRoot";
import type { Sequence } from "../types";

const seq: Sequence = [{ id: "s", page: "dashboard", beats: [{ kind: "idle" }] }];

describe("WalkthroughRoot", () => {
  it("renders children", () => {
    const { getByText } = render(
      <WalkthroughRoot sequence={seq}>
        <div>child</div>
      </WalkthroughRoot>,
    );
    expect(getByText("child")).toBeInTheDocument();
  });
});
