import type { Scene } from "../types.new";
import { VT } from "../viewTransitionNames";
import { AmenityReservationStage } from "../stage-content/AmenityReservationStage";

export const amenityScene: Scene = {
  id: "amenity",
  page: "amenities",
  beats: [
    { kind: "idle" },
    {
      kind: "highlight",
      target: VT.AmenityTilePool,
      caption: "Four amenities. Big photos. One tap each.",
    },
    { kind: "lift", target: VT.AmenityTilePool, scale: 1.6, position: "center" },
    {
      kind: "expand",
      target: VT.AmenityTilePool,
      content: <AmenityReservationStage amenityId="pool" />,
      caption:
        "Pick a day. Pick a time. The amenity knows the household rules — pool caps at 6 guests on weekends.",
    },
    {
      kind: "annotate",
      tracks: [
        { type: "typeCaption", text: "The slot already knows: 6 guests max this weekend." },
      ],
    },
    { kind: "idle" },
  ],
};
