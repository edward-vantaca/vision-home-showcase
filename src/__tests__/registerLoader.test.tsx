import { describe, expect, it } from "vitest";
import { act, fireEvent, render } from "@testing-library/react";
import App from "../App";
import { WalkthroughProvider } from "../walkthrough/cursor";
import { VT } from "../walkthrough/viewTransitionNames";
import type { Sequence } from "../walkthrough/types";

const seq: Sequence = [{ id: "inbox", page: "inbox", appState: { phase: "inbox" }, beats: [{ kind: "idle" }] }];

function vt(container: HTMLElement, name: string) {
  return container.querySelector<HTMLElement>(`[data-vt-name="${name}"]`);
}

describe("Register CTA loading screen", () => {
  it("shows a spinner over the onboarding flow until its fade-out animation ends", () => {
    const { container } = render(
      <WalkthroughProvider sequence={seq}>
        <App />
      </WalkthroughProvider>,
    );
    fireEvent.click(vt(container, VT.InboxHoaEmail)!);
    fireEvent.click(vt(container, VT.InboxRegisterCta)!);

    const loader = container.querySelector<HTMLElement>('[data-ux-id="onboarding-loader"]');
    expect(loader).not.toBeNull();
    expect(loader!.querySelector('[role="status"]')).not.toBeNull();
    // Onboarding is already mounted underneath, so walkthrough targets resolve.
    expect(vt(container, VT.OnboardingPasswordInput)).not.toBeNull();

    // jsdom has no AnimationEvent, so React listens for the webkit-prefixed
    // name there (browsers get the standard animationend).
    act(() => {
      fireEvent(loader!, new Event("webkitAnimationEnd", { bubbles: true }));
    });
    expect(container.querySelector('[data-ux-id="onboarding-loader"]')).toBeNull();
    expect(vt(container, VT.OnboardingPasswordInput)).not.toBeNull();
  });
});
