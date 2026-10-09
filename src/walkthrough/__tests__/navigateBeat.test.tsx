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
    await new Promise((r) => setTimeout(r, 400));
    expect(onNavigate).toHaveBeenCalledWith("amenities");
    expect(onComplete).toHaveBeenCalled();
  });

  it("exit mid-navigate does not throw", async () => {
    const onComplete = vi.fn();
    const { unmount } = render(
      <WalkthroughProvider sequences={sequences} onNavigate={vi.fn()}>
        <NavigateApp beat={{ kind: "navigate", to: "amenities" }} onComplete={onComplete} />
      </WalkthroughProvider>,
    );
    unmount();
    await new Promise((r) => setTimeout(r, 400));
    // onComplete must not fire after unmount, and no throw
    expect(onComplete).not.toHaveBeenCalled();
  });
});
