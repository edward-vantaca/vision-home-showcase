import type { ReactNode } from "react";

export type Point = { x: number; y: number };

export type BeatKind = "highlight" | "lift" | "expand" | "annotate" | "return" | "navigate";

export type AnnotateTrack =
  | { type: "arrow"; from: string | Point; to: string | Point }
  | { type: "pulse"; target: string; count?: number }
  | { type: "typeCaption"; text: string; speedCps?: number };

export type Beat =
  | { kind: "highlight"; target: string; caption?: string; durationMs?: number }
  | { kind: "lift"; target: string; scale?: number; position?: "center" | Point; caption?: string }
  | { kind: "expand"; content: ReactNode; caption?: string; target?: string }
  | { kind: "annotate"; tracks: AnnotateTrack[]; durationMs?: number }
  | { kind: "return"; caption?: string }
  | { kind: "navigate"; to: string; caption?: string };

export type Sequence = {
  id: string;
  title: string;
  beats: Beat[];
};

export type WalkthroughState = {
  active: boolean;
  sequenceId: string | null;
  currentBeatIndex: number;
  hudVisible: boolean;
  history: number[];
};

export type WalkthroughAction =
  | { type: "start"; sequenceId: string; hudVisible?: boolean }
  | { type: "advance" }
  | { type: "back" }
  | { type: "exit" }
  | { type: "toggleHud" }
  | { type: "replayBeat" }
  | { type: "skipToEnd" };

export type BeatProps<B extends Beat = Beat> = {
  beat: B;
  onComplete: () => void;
};
