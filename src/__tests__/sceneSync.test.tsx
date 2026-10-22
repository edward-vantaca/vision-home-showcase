import { describe, expect, it } from "vitest";
import { act, fireEvent, render } from "@testing-library/react";
import App from "../App";
import { WalkthroughProvider, useCursor } from "../walkthrough/cursor";
import type { Sequence } from "../walkthrough/types";

const portal = { phase: "portal", page: "dashboard", dashboardView: "homeowner", askHoaiOpen: true } as const;

// Two scenes on the same page: the second must still pull the app back there.
const seq: Sequence = [
  { id: "first", page: "dashboard", appState: portal, beats: [{ kind: "idle" }] },
  { id: "second", page: "dashboard", appState: portal, beats: [{ kind: "idle" }] },
];

function Next() {
  const { advance } = useCursor();
  return <button type="button" data-testid="next" onClick={advance}>next</button>;
}

function q(container: HTMLElement, uxId: string) {
  return container.querySelector<HTMLElement>(`[data-ux-id="${uxId}"]`);
}

describe("MainApp scene sync", () => {
  it("each scene change returns to the scene's page and closes Quick Actions", () => {
    const { container, getByTestId } = render(
      <WalkthroughProvider sequence={seq}>
        <App />
        <Next />
      </WalkthroughProvider>,
    );

    fireEvent.click(q(container, "sidebar-quick-actions")!);
    fireEvent.click(q(container, "sidebar-quick-actions-arc-request")!);
    fireEvent.click(q(container, "quick-actions-arc-form-fence")!);
    expect(q(container, "arc-form-page")).not.toBeNull();

    fireEvent.click(q(container, "sidebar-quick-actions")!);
    expect(q(container, "quick-actions-modal")).not.toBeNull();

    act(() => {
      fireEvent.click(getByTestId("next"));
    });
    expect(q(container, "arc-form-page")).toBeNull();
    expect(q(container, "dashboard-page")).not.toBeNull();
    expect(q(container, "quick-actions-modal")).toBeNull();
  });
});
