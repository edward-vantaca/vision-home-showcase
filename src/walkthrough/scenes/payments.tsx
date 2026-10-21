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
    { kind: "idle" },
  ],
};
