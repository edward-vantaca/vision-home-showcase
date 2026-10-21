import type { Scene } from "../types";
import { VT } from "../viewTransitionNames";
import { BoardActionStageDetail } from "../stage-content/BoardActionStageDetail";

export const boardActionsScene: Scene = {
  id: "board-actions",
  label: "Board actions",
  page: "dashboard",
  appState: { phase: "portal", page: "dashboard", dashboardView: "board", askHoaiOpen: false },
  beats: [
    { kind: "idle" },
    {
      kind: "highlight",
      target: VT.BoardTaskCurrent,
      caption: "Board members land on the dashboard and immediately see what needs their attention.",
    },
    { kind: "lift", target: VT.BoardTaskCurrent, scale: 1.4, position: "center" },
    {
      kind: "expand",
      target: VT.BoardTaskCurrent,
      content: <BoardActionStageDetail actionId="VIO-1804" />,
      caption: "Every action carries its full history — notices sent, owner response window, prior board comments.",
    },
    {
      kind: "annotate",
      tracks: [
        { type: "typeCaption", text: "Approve the fine. One tap. Timestamped and attributed to you." },
      ],
    },
    { kind: "idle" },
  ],
};
