import type { Sequence } from "../types";
import { BoardActionStageDetail } from "../stage-content/BoardActionStageDetail";

export const boardActionsSequence: Sequence = {
  id: "board-actions",
  title: "Board Actions",
  beats: [
    {
      kind: "highlight",
      target: "board-tasks-widget",
      caption: "Board members land on the dashboard and immediately see what needs their attention.",
    },
    {
      kind: "lift",
      target: "board-task-current",
      scale: 1.4,
      position: "center",
    },
    {
      kind: "expand",
      content: <BoardActionStageDetail actionId="VIO-1804" />,
      caption:
        "Every action carries its full history — notices sent, owner response window, prior board comments.",
    },
    {
      kind: "annotate",
      tracks: [
        { type: "arrow", from: "stage-detail-timeline", to: "stage-vote-approve" },
        { type: "typeCaption", text: "Approve the fine. One tap. Timestamped and attributed to you." },
        { type: "pulse", target: "stage-vote-approve", count: 2 },
      ],
    },
    {
      kind: "return",
      caption: "Back to the dashboard, next action already queued.",
    },
  ],
};
