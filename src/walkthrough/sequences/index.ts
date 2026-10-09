import type { Sequence } from "../types";
import { boardActionsSequence } from "./boardActions";
import { amenitySequence } from "./amenity";

export const sequenceRegistry: Record<string, Sequence> = {
  [boardActionsSequence.id]: boardActionsSequence,
  [amenitySequence.id]: amenitySequence,
};

export function getSequence(id: string): Sequence | undefined {
  return sequenceRegistry[id];
}
