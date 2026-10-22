import type { Scene } from "../types";

// Final resting beat after Ask HOAi: leaving the ask-hoai scene morphs the
// panel back to the right sidebar and fades the white canvas out.
export const closingDashboardScene: Scene = {
  id: "closing-dashboard",
  label: "Back to dashboard",
  page: "dashboard",
  appState: { phase: "portal", page: "dashboard", dashboardView: "homeowner", askHoaiOpen: true },
  beats: [{ kind: "idle" }],
};
