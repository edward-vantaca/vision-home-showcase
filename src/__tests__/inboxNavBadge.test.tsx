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
