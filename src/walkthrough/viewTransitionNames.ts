export const VT = {
  BoardTaskCurrent: "wt-board-task-current",
  AmenityTilePool: "wt-amenity-tile-pool",
} as const

export type VTName = typeof VT[keyof typeof VT]
