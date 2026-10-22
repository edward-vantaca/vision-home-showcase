import type { ReactNode } from "react";
import type { VTName } from "./viewTransitionNames";

export type Page = "inbox" | "onboarding" | "dashboard" | "elections" | "community" | "amenities";

export type Point = { x: number; y: number };

export type CursorStop = {
  to: VTName;
  action?: "click" | "hover" | "tab" | "scroll" | "drop";
  typeText?: string;
  typeCps?: number;
  /** "scroll" stops: how long the target takes to scroll to its bottom. */
  scrollMs?: number;
  /** "drop" stops: the file the cursor carries in from off-screen and drops. */
  file?: string;
  /** Pause after this stop's action before moving on. */
  holdMs?: number;
  /**
   * After this stop's click, release a lift/expand held on stage through the
   * cursor beat (e.g. once a modal covers the screen).
   */
  releaseStage?: boolean;
  /**
   * After this stop's click, fade a stage held through the cursor beat out
   * (it stays lifted, with the backdrop up) until a later releaseStage.
   */
  hideStage?: boolean;
};

export type AnnotateTrack =
  | { type: "arrow"; from: VTName | Point; to: VTName | Point }
  | { type: "pulse"; target: VTName; count?: number }
  | { type: "typeCaption"; text: string; speedCps?: number };

export type Beat =
  | { kind: "idle" }
  | { kind: "highlight"; target: VTName; caption?: string }
  | { kind: "lift"; target: VTName; scale?: number; position?: "center" | Point; caption?: string }
  | { kind: "expand"; target: VTName; content: ReactNode; caption?: string }
  | { kind: "annotate"; tracks: AnnotateTrack[]; durationMs?: number }
  | { kind: "narrate"; title?: string; body: string }
  | {
      kind: "cursor";
      to: VTName;
      action?: "click" | "hover" | "drop";
      file?: string;
      durationMs?: number;
      caption?: string;
      reverseTo?: VTName;
      typeText?: string;
      typeCps?: number;
      holdMs?: number;
      releaseStage?: boolean;
      hideStage?: boolean;
      then?: CursorStop[];
      /**
       * The beat undoes its own effect (opens a modal and closes it again), so
       * landing on it with `back` means the next `advance` replays it.
       */
      replayOnBack?: boolean;
    }
  | { kind: "intro"; title: string; logoSrc?: string; wordmark?: string };

export type AppPhase = "inbox" | "onboarding" | "portal";
export type OnboardingScreen = "account" | "confirm" | "autopay" | "done";
export type DashboardView = "homeowner" | "board";

// Full app-state snapshot a scene expects when the launcher jumps into it.
// Only the phase is required; everything else defaults to the natural state
// for that phase (dashboard view, Ask HOAi closed, etc.).
export type SceneAppState = {
  phase: AppPhase;
  page?: Page;
  onboardingScreen?: OnboardingScreen;
  dashboardView?: DashboardView;
  askHoaiOpen?: boolean;
};

export type Scene = {
  id: string;
  page: Page;
  beats: Beat[];
  label?: string;
  appState?: SceneAppState;
};

export type Sequence = Scene[];

export type Cursor = { sceneIndex: number; beatIndex: number };

export type WalkthroughState = {
  cursor: Cursor;
  hudVisible: boolean;
  lastDirection?: "forward" | "back";
  // Set when `back` crosses a scene boundary onto a cursor beat. The scene's
  // appState resets the app to the scene's start, undoing that beat's click,
  // so the next `advance` replays the beat forward instead of moving past it.
  replayOnAdvance?: boolean;
};

export type WalkthroughAction =
  | { type: "advance" }
  | { type: "back" }
  | { type: "jumpTo"; cursor: Cursor }
  | { type: "toggleHud" };
