import { describe, expect, it } from "vitest";
import { fireEvent, render } from "@testing-library/react";
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

function q(container: HTMLElement, uxId: string) {
  return container.querySelector<HTMLElement>(`[data-ux-id="${uxId}"]`);
}

function openArcForm(formId: string) {
  const utils = render(
    <WalkthroughProvider sequence={seq}>
      <App />
    </WalkthroughProvider>,
  );
  fireEvent.click(q(utils.container, "sidebar-quick-actions")!);
  fireEvent.click(q(utils.container, "sidebar-quick-actions-arc-request")!);
  fireEvent.click(q(utils.container, `quick-actions-arc-form-${formId}`)!);
  return utils;
}

const FENCE_FIELDS = [
  "arc-form-fence-material",
  "arc-form-fence-style",
  "arc-form-fence-height",
  "arc-form-fence-color",
  "arc-form-fence-length",
  "arc-form-fence-gates",
  "arc-form-fence-contractor",
];

describe("ArcFormPage", () => {
  it("the fence form asks for fence details (material, style, height, color, length, gates, contractor)", () => {
    const { container } = openArcForm("fence");
    expect(q(container, "arc-form-fence-details")).not.toBeNull();
    for (const id of FENCE_FIELDS) expect(q(container, id), id).not.toBeNull();
  });

  it("other ARC forms don't show the fence details", () => {
    const { container } = openArcForm("pool");
    expect(q(container, "arc-form-page")).not.toBeNull();
    expect(q(container, "arc-form-fence-details")).toBeNull();
  });
});
