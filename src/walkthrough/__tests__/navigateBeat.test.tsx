import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NavigateApp } from "../beats/NavigateApp";
import { WalkthroughProvider } from "../WalkthroughProvider";
import type { Sequence } from "../types";

const sequences: Record<string, Sequence> = {
  s1: { id: "s1", title: "t", beats: [{ kind: "navigate", to: "amenities" }] },
};

describe("NavigateApp beat", () => {
  it("calls onNavigate on the provider", async () => {
    const onNavigate = vi.fn();
    const onComplete = vi.fn();
    render(
      <WalkthroughProvider sequences={sequences} onNavigate={onNavigate}>
        <NavigateApp beat={{ kind: "navigate", to: "amenities" }} onComplete={onComplete} />
      </WalkthroughProvider>,
    );
    await new Promise((r) => setTimeout(r, 10));
    expect(onNavigate).toHaveBeenCalledWith("amenities");
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("exit mid-navigate does not throw", async () => {
    const onComplete = vi.fn();
    const { unmount } = render(
      <WalkthroughProvider sequences={sequences} onNavigate={vi.fn()}>
        <NavigateApp beat={{ kind: "navigate", to: "amenities" }} onComplete={onComplete} />
      </WalkthroughProvider>,
    );
    unmount();
    // no throw; onComplete is never called since there's no timer anymore
    expect(onComplete).not.toHaveBeenCalled();
  });
});
