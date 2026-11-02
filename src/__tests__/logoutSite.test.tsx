import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render } from "@testing-library/react";
import App from "../App";
import { WalkthroughProvider } from "../walkthrough/cursor";
import { VT } from "../walkthrough/viewTransitionNames";
import { PAGE_LOAD_MS } from "../pageLoad";
import type { Sequence } from "../walkthrough/types";

const seq: Sequence = [
  { id: "portal", page: "dashboard", appState: { phase: "portal", page: "dashboard" }, beats: [{ kind: "idle" }] },
];

function vt(container: HTMLElement, name: string) {
  return container.querySelector<HTMLElement>(`[data-vt-name="${name}"]`);
}

describe("Log Out", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("redirects to the association's home page, which loads, and Log In goes back to the portal", () => {
    const { container, getByText } = render(
      <WalkthroughProvider sequence={seq}>
        <App />
      </WalkthroughProvider>,
    );
    fireEvent.click(vt(container, VT.SidebarNavLogout)!);

    expect(vt(container, VT.AssociationSitePage)).not.toBeNull();
    expect(vt(container, VT.SidebarNavLogout)).toBeNull();
    expect(container.querySelector('[data-ux-id="association-site-loader"]')).not.toBeNull();

    act(() => {
      vi.advanceTimersByTime(PAGE_LOAD_MS);
    });
    expect(container.querySelector('[data-ux-id="association-site-loader"]')).toBeNull();
    expect(getByText("What can we help you with?")).not.toBeNull();

    fireEvent.click(container.querySelector('[data-ux-id="association-site-login"]')!);
    expect(vt(container, VT.AssociationSitePage)).toBeNull();
    expect(vt(container, VT.SidebarNavLogout)).not.toBeNull();
  });
});
