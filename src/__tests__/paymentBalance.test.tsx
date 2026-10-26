import { describe, expect, it } from "vitest";
import { fireEvent, render } from "@testing-library/react";
import App from "../App";
import { WalkthroughProvider } from "../walkthrough/cursor";
import { VT } from "../walkthrough/viewTransitionNames";
import type { Sequence } from "../walkthrough/types";

const portal = { phase: "portal", page: "dashboard", dashboardView: "homeowner", askHoaiOpen: true } as const;

function renderApp(sequence: Sequence) {
  return render(
    <WalkthroughProvider sequence={sequence}>
      <App />
    </WalkthroughProvider>,
  );
}

const vt = (c: HTMLElement, name: string) => c.querySelector<HTMLElement>(`[data-vt-name="${name}"]`)!;

describe("Payments widget balance", () => {
  it("shows $425.00 until the payment is made, then $0.00 once the modal closes", () => {
    const { container } = renderApp([{ id: "payments", page: "dashboard", appState: portal, beats: [{ kind: "idle" }] }]);
    expect(vt(container, VT.PaymentsWidget).textContent).toContain("$425.00");

    fireEvent.click(vt(container, VT.PaymentsMakePaymentBtn));
    fireEvent.click(vt(container, VT.PaymentModalContinueBtn));
    fireEvent.click(vt(container, VT.PaymentModalConfirmBtn));
    // The confirmation still names the amount paid.
    expect(container.querySelector('[data-ux-id="payment-confirmation-card"]')!.textContent).toContain("$425.00");
    expect(vt(container, VT.PaymentsWidget).textContent).toContain("$425.00");

    fireEvent.click(vt(container, VT.PaymentModalCloseBtn));
    expect(vt(container, VT.PaymentsWidget).textContent).toContain("$0.00");
    expect(vt(container, VT.PaymentsWidget).textContent).not.toContain("$425.00");
  });

  it("closing the modal without paying leaves the balance", () => {
    const { container } = renderApp([{ id: "payments", page: "dashboard", appState: portal, beats: [{ kind: "idle" }] }]);
    fireEvent.click(vt(container, VT.PaymentsMakePaymentBtn));
    fireEvent.click(vt(container, VT.PaymentModalCloseBtn));
    expect(vt(container, VT.PaymentsWidget).textContent).toContain("$425.00");
  });

  it("a scene after Payments (balancePaid) lands on $0.00", () => {
    const { container } = renderApp([
      { id: "ask-hoai", page: "dashboard", appState: { ...portal, balancePaid: true }, beats: [{ kind: "idle" }] },
    ]);
    expect(vt(container, VT.PaymentsWidget).textContent).toContain("$0.00");
  });
});
