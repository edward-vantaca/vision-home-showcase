import type { Sequence } from "../types";
import { introScene } from "./intro";
import { inboxScene } from "./inbox";
import { onboardingScene } from "./onboarding";
import { autopayScene } from "./autopay";
import { goToPortalScene } from "./goToPortal";
import { dashboardScene } from "./dashboard";
import { paymentsScene } from "./payments";
import { arcRequestScene } from "./arcRequest";
import { askHoaiScene } from "./askHoai";
import { communityFeedScene } from "./communityFeed";
import { offersScene } from "./offers";
import { amenityReservationScene } from "./amenityReservation";
import { broadcastSmsScene } from "./broadcastSms";
import { electionsScene } from "./elections";
import { boardReviewScene } from "./boardReview";
import { closingDashboardScene } from "./closingDashboard";

export const homeVisionSequence: Sequence = [
  introScene,
  inboxScene,
  onboardingScene,
  autopayScene,
  goToPortalScene,
  dashboardScene,
  paymentsScene,
  arcRequestScene,
  askHoaiScene,
  communityFeedScene,
  offersScene,
  amenityReservationScene,
  broadcastSmsScene,
  electionsScene,
  boardReviewScene,
  closingDashboardScene,
];
