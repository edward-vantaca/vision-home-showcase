import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render } from "@testing-library/react";
import App from "../App";
import { COMMUNITY_FEED_LOAD_MS } from "../communityFeedLoad";
import { WalkthroughProvider } from "../walkthrough/cursor";
import type { Sequence } from "../walkthrough/types";

const seq: Sequence = [
  {
    id: "portal",
    page: "dashboard",
    appState: { phase: "portal", page: "dashboard", dashboardView: "homeowner", askHoaiOpen: true },
    beats: [{ kind: "idle" }],
  },
];

const q = (c: HTMLElement, uxId: string) => c.querySelector<HTMLElement>(`[data-ux-id="${uxId}"]`);

describe("Community feed loader", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("View All Posts lands on a loader for 1.5s, then the feed", () => {
    const { container } = render(
      <WalkthroughProvider sequence={seq}>
        <App />
      </WalkthroughProvider>,
    );
    expect(COMMUNITY_FEED_LOAD_MS).toBe(1500);
    fireEvent.click(q(container, "dashboard-community-feed-view-all-link")!);
    expect(q(container, "community-feed-page")).not.toBeNull();
    expect(q(container, "community-feed-loader")).not.toBeNull();
    expect(q(container, "community-feed-post-6")).toBeNull();
    act(() => {
      vi.advanceTimersByTime(COMMUNITY_FEED_LOAD_MS - 1);
    });
    expect(q(container, "community-feed-post-6")).toBeNull();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(q(container, "community-feed-loader")).toBeNull();
    expect(q(container, "community-feed-post-6")).not.toBeNull();
  });
});
