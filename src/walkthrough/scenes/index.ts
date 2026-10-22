import type { Sequence } from "../types";
import { introScene } from "./intro";
import { inboxScene } from "./inbox";
import { onboardingScene } from "./onboarding";
import { autopayScene } from "./autopay";
import { goToPortalScene } from "./goToPortal";
import { dashboardScene } from "./dashboard";
import { paymentsScene } from "./payments";
import { askHoaiScene } from "./askHoai";
import { boardActionsScene } from "./boardActions";
import { amenityScene } from "./amenity";

export const homeVisionSequence: Sequence = [
  introScene,
  inboxScene,
  onboardingScene,
  autopayScene,
  goToPortalScene,
  dashboardScene,
  paymentsScene,
  askHoaiScene,
  boardActionsScene,
  amenityScene,
];
