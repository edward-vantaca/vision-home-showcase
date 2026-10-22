import type { Scene } from "../types";
import { VT } from "../viewTransitionNames";

export const paymentsScene: Scene = {
  id: "payments",
  label: "Payments widget",
  page: "dashboard",
  appState: { phase: "portal", page: "dashboard", dashboardView: "homeowner", askHoaiOpen: true },
  beats: [
    {
      kind: "lift",
      target: VT.PaymentsWidget,
      scale: 1.15,
      position: "center",
      caption: "Dues, balances, and AutoPay — right where you land.",
    },
    {
      // The lift and its blurred backdrop stay on stage while the cursor
      // clicks Make a Payment and runs through the modal; closing the modal
      // releases the widget back into the dashboard and fades the blur out.
      kind: "cursor",
      to: VT.PaymentsMakePaymentBtn,
      action: "click",
      then: [
        { to: VT.PaymentModalContinueBtn, action: "click" },
        { to: VT.PaymentModalConfirmBtn, action: "click", holdMs: 1000 },
        { to: VT.PaymentModalCloseBtn, action: "click", releaseStage: true },
      ],
      replayOnBack: true,
    },
    { kind: "idle" },
  ],
};
