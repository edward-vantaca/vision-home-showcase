import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render } from "@testing-library/react";
import App from "../App";
import { PAGE_LOAD_MS } from "../pageLoad";
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

function renderApp() {
  return render(
    <WalkthroughProvider sequence={seq}>
      <App />
    </WalkthroughProvider>,
  );
}

const advance = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms);
  });

describe("Page loaders", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("loads for 1.5s", () => {
    expect(PAGE_LOAD_MS).toBe(1500);
  });

  it("View All Posts lands on a loader, then the feed", () => {
    const { container } = renderApp();
    fireEvent.click(q(container, "dashboard-community-feed-view-all-link")!);
    expect(q(container, "community-feed-page")).not.toBeNull();
    expect(q(container, "community-feed-loader")).not.toBeNull();
    expect(q(container, "community-feed-post-6")).toBeNull();
    advance(PAGE_LOAD_MS - 1);
    expect(q(container, "community-feed-post-6")).toBeNull();
    advance(1);
    expect(q(container, "community-feed-loader")).toBeNull();
    expect(q(container, "community-feed-post-6")).not.toBeNull();
  });

  it("an ARC form lands on a loader, then the form", () => {
    const { container } = renderApp();
    fireEvent.click(q(container, "sidebar-quick-actions")!);
    fireEvent.click(q(container, "sidebar-quick-actions-arc-request")!);
    fireEvent.click(q(container, "quick-actions-arc-form-fence")!);
    expect(q(container, "arc-form-page")).not.toBeNull();
    expect(q(container, "arc-form-loader")).not.toBeNull();
    expect(q(container, "arc-form-fence-details")).toBeNull();
    advance(PAGE_LOAD_MS - 1);
    expect(q(container, "arc-form-fence-details")).toBeNull();
    advance(1);
    expect(q(container, "arc-form-loader")).toBeNull();
    expect(q(container, "arc-form-fence-details")).not.toBeNull();
  });

  it("Reservations lands on a loader, then the page", () => {
    const { container } = renderApp();
    fireEvent.click(q(container, "sidebar-nav-reservations")!);
    expect(q(container, "reservations-page")).not.toBeNull();
    expect(q(container, "reservations-loader")).not.toBeNull();
    expect(q(container, "reservations-table")).toBeNull();
    advance(PAGE_LOAD_MS - 1);
    expect(q(container, "reservations-table")).toBeNull();
    advance(1);
    expect(q(container, "reservations-loader")).toBeNull();
    expect(q(container, "reservations-table")).not.toBeNull();
  });

  it("the dashboard is ready on arrival in the portal, and loads when clicked back to", () => {
    const { container } = renderApp();
    expect(q(container, "dashboard-loader")).toBeNull();
    expect(q(container, "election-banner")).not.toBeNull();

    fireEvent.click(q(container, "sidebar-nav-reservations")!);
    advance(PAGE_LOAD_MS);
    fireEvent.click(q(container, "sidebar-nav-home")!);
    expect(q(container, "dashboard-loader")).not.toBeNull();
    expect(q(container, "election-banner")).toBeNull();
    advance(PAGE_LOAD_MS - 1);
    expect(q(container, "election-banner")).toBeNull();
    advance(1);
    expect(q(container, "dashboard-loader")).toBeNull();
    expect(q(container, "election-banner")).not.toBeNull();
  });
});
