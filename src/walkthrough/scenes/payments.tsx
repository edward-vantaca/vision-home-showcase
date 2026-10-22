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
      // clicks Make a Payment. The widget fades out as the modal surfaces (the
      // blur stays), the cursor walks the modal at a slower pace, and closing
      // it releases the widget back into the dashboard as the blur fades out.
      kind: "cursor",
      to: VT.PaymentsMakePaymentBtn,
      action: "click",
      hideStage: true,
      holdMs: 900,
      durationMs: 1300,
      then: [
        { to: VT.PaymentModalContinueBtn, action: "click", holdMs: 900 },
        { to: VT.PaymentModalConfirmBtn, action: "click", holdMs: 1200 },
        { to: VT.PaymentModalCloseBtn, action: "click", releaseStage: true },
      ],
      replayOnBack: true,
    },
    { kind: "idle" },
  ],
};
