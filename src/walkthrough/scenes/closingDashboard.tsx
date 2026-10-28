import type { Scene } from "../types";

// Final resting beat: the dashboard, still, in the board member view the
// elections scene's Home click switched to (Board Actions in the sidebar, the
// board tasks widget under the notification banner).
export const closingDashboardScene: Scene = {
  id: "closing-dashboard",
  label: "Back to dashboard",
  page: "dashboard",
  appState: { phase: "portal", page: "dashboard", dashboardView: "board", askHoaiOpen: false, balancePaid: true },
  beats: [{ kind: "idle" }],
};
