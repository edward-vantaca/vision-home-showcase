import type { ReactNode } from "react";
import type { VTName } from "./viewTransitionNames";

export type Page = "inbox" | "onboarding" | "dashboard" | "elections" | "community" | "amenities";

export type Point = { x: number; y: number };

export type CursorStop = {
  to: VTName;
  action?: "click" | "hover" | "tab";
  typeText?: string;
  typeCps?: number;
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
  | { kind: "cursor"; to: VTName; action?: "click" | "hover"; durationMs?: number; caption?: string; reverseTo?: VTName; typeText?: string; typeCps?: number; then?: CursorStop[] }
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
