import type { Sequence } from "../types";
import { boardActionsScene } from "./boardActions";
import { amenityScene } from "./amenity";

export const homeVisionSequence: Sequence = [boardActionsScene, amenityScene];
