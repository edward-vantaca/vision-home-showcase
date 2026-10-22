import type { Scene } from "../types";

// A still beat on the resident dashboard right after entering the portal:
// no backdrop, no caption, no motion. Same appState as Payments so the
// Payments lift is the only thing that changes when the presenter advances.
export const dashboardScene: Scene = {
  id: "dashboard",
  label: "Dashboard",
  page: "dashboard",
  appState: { phase: "portal", page: "dashboard", dashboardView: "homeowner", askHoaiOpen: true },
  beats: [{ kind: "idle" }],
};
