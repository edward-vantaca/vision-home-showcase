import type { ReactNode } from "react"
import type { VTName } from "./viewTransitionNames"

export type Page = "dashboard" | "elections" | "community" | "amenities"

export type Point = { x: number y: number }

export type AnnotateTrack = {
  type: "arrow"
  from: VTName | Point
  to: VTName | Point
} | { type: "pulse" target: VTName count?: number } | {
  type: "typeCaption"
  text: string
  speedCps?: number
}

export type Beat = { kind: "idle" } | {
  kind: "highlight"
  target: VTName
  caption?: string
} | {
  kind: "lift"
  target: VTName
  scale?: number
  position?: "center" | Point
  caption?: string
} | { kind: "expand" target: VTName content: ReactNode caption?: string } | {
  kind: "annotate"
  tracks: AnnotateTrack[]
  durationMs?: number
} | { kind: "narrate" title?: string body: string }

export type Scene = {
  id: string
  page: Page
  beats: Beat[]
}

export type Sequence = Scene[]

export type Cursor = { sceneIndex: number beatIndex: number }

export type WalkthroughState = {
  cursor: Cursor
  hudVisible: boolean
}

export type WalkthroughAction = { type: "advance" } | { type: "back" } | {
  type: "jumpTo"
  cursor: Cursor
} | { type: "toggleHud" }
