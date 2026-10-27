import type { Scene } from "../types";

// Final resting beat: the dashboard, still, in the board member view the
// elections scene's Home click switched to (Board Actions in the sidebar, the
// board tasks widget at the top).
export const closingDashboardScene: Scene = {
  id: "closing-dashboard",
  label: "Back to dashboard",
  page: "dashboard",
  appState: { phase: "portal", page: "dashboard", dashboardView: "board", askHoaiOpen: true, balancePaid: true },
  beats: [{ kind: "idle" }],
};
