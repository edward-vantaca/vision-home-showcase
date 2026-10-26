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

function q(container: HTMLElement, selector: string) {
  return container.querySelector<HTMLElement>(selector);
}

describe("Reservations", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("the Reservations nav item opens a page of upcoming reservations and bookable amenities", () => {
    const { container } = render(
      <WalkthroughProvider sequence={seq}>
        <App />
      </WalkthroughProvider>,
    );
    const nav = q(container, '[data-ux-id="sidebar-nav-reservations"]')!;
    expect(nav.textContent).toContain("Reservations");
    fireEvent.click(nav);
    act(() => {
      vi.advanceTimersByTime(PAGE_LOAD_MS);
    });

    const page = q(container, '[data-ux-id="reservations-page"]')!;
    expect(page).not.toBeNull();
    expect(nav.className).toContain("bg-[#e8f1fd]");

    const rows = page.querySelectorAll('[data-ux-id="reservations-table"] tbody tr');
    expect(Array.from(rows, (r) => r.querySelector("td")?.textContent)).toEqual(["Tennis Court", "Main Clubhouse"]);

    const cards = Array.from(page.querySelectorAll('[data-ux-id^="amenity-card-"]'));
    expect(cards.map((c) => c.querySelector("h3")?.textContent)).toEqual([
      "Tennis Court",
      "Pickleball Court",
      "Main Clubhouse",
      "Basketball Court",
      "Lounge Meeting Room",
      "Conference Room",
    ]);
    expect(page.textContent).not.toContain("Sauna");
    for (const card of cards) {
      expect(card.querySelector("button")?.textContent).toBe("View Availability");
    }
  });
});
