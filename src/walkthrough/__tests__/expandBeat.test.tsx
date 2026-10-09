import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ExpandContent } from "../beats/ExpandContent";

describe("ExpandContent beat", () => {
  it("renders the content node", () => {
    render(
      <ExpandContent
        beat={{ kind: "expand", content: <div data-testid="payload">hello</div> }}
        onComplete={vi.fn()}
      />,
    );
    expect(screen.getByTestId("payload")).toHaveTextContent("hello");
  });
});
