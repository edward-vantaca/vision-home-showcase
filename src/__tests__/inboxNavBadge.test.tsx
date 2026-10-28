import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import App from "../App";
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

describe("Inbox nav item", () => {
  it("shows the unread count of the dashboard Inbox widget", () => {
    const { container } = render(
      <WalkthroughProvider sequence={seq}>
        <App />
      </WalkthroughProvider>,
    );
    const unreadInWidget = container.querySelectorAll('[data-ux-id="inbox-widget"] [data-ux-id="inbox-row-unread-dot"]').length;
    expect(unreadInWidget).toBeGreaterThan(0);
    const navInbox = container.querySelector<HTMLElement>('[data-ux-id="sidebar-nav-inbox"]')!;
    expect(navInbox.querySelector('[data-ux-id="sidebar-nav-badge"]')?.textContent).toBe(String(unreadInWidget));
  });
});

describe("Inbox after the ARC request is submitted (Ask HOAi)", () => {
  it("puts the new ARC request row at the top, unread, and the badge counts it", () => {
    const submitted: Sequence = [{ ...seq[0], appState: { ...seq[0].appState!, arcSubmitted: true } } as Sequence[number]];
    const { container } = render(
      <WalkthroughProvider sequence={submitted}>
        <App />
      </WalkthroughProvider>,
    );
    const rows = container.querySelectorAll<HTMLElement>('[data-ux-id="inbox-widget"] [data-ux-id^="inbox-row-"]:not([data-ux-id="inbox-row-unread-dot"])');
    const first = rows[0];
    expect(first.dataset.uxId).toBe("inbox-row-your-arc-request");
    expect(first.textContent).toMatch(/reviewing your request/i);
    expect(first.querySelector('[data-ux-id="inbox-row-unread-dot"]')).not.toBeNull();
    const unreadInWidget = container.querySelectorAll('[data-ux-id="inbox-widget"] [data-ux-id="inbox-row-unread-dot"]').length;
    const navInbox = container.querySelector<HTMLElement>('[data-ux-id="sidebar-nav-inbox"]')!;
    expect(navInbox.querySelector('[data-ux-id="sidebar-nav-badge"]')?.textContent).toBe(String(unreadInWidget));
  });

  it("is not there before", () => {
    const { container } = render(
      <WalkthroughProvider sequence={seq}>
        <App />
      </WalkthroughProvider>,
    );
    expect(container.querySelector('[data-ux-id="inbox-row-your-arc-request"]')).toBeNull();
  });

  it("has no older ARC request row (only the submitted one, once there)", () => {
    const { container } = render(
      <WalkthroughProvider sequence={seq}>
        <App />
      </WalkthroughProvider>,
    );
    expect(container.querySelector('[data-ux-id="inbox-row-request-received"]')).toBeNull();
  });
});
