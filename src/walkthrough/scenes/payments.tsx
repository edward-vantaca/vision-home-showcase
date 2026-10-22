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
      // The lift stays on stage while the cursor waits for it to land and
      // clicks Make a Payment; once the modal covers the screen the widget is
      // released back into the dashboard, so closing the modal reveals it.
      kind: "cursor",
      to: VT.PaymentsMakePaymentBtn,
      action: "click",
      releaseStage: true,
      then: [
        { to: VT.PaymentModalContinueBtn, action: "click" },
        { to: VT.PaymentModalConfirmBtn, action: "click", holdMs: 1000 },
        { to: VT.PaymentModalCloseBtn, action: "click" },
      ],
      replayOnBack: true,
    },
    { kind: "idle" },
  ],
};
