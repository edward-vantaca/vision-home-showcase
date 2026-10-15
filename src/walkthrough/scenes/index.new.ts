import type { Sequence } from "../types.new";
import { boardActionsScene } from "./boardActions.new";
import { amenityScene } from "./amenity.new";

export const homeVisionSequence: Sequence = [boardActionsScene, amenityScene];
