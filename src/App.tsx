import { Fragment, useEffect, useRef, useState } from "react";
import { imgScreenshot20260109At35226Pm1 } from "../imports/svg-9a9bp";
import NewResidentFlow, { type Screen as OnboardingScreen } from "./onboarding/NewResidentFlow";
import InboxPage from "./inbox/InboxPage";
import BoardTasksWidget from "./board/BoardTasksWidget";
import AmenitiesPage from "./amenities/AmenitiesPage";
import AskHoaiPanel, { AskHoaiIcon } from "./chat/AskHoaiPanel";
import imgBranding from "@/assets/Branding.svg";
import imgPerkspotHero from "@/assets/perkspot-hero.jpg";
import { useCursor } from "./walkthrough/cursor";
import { VT, type VTName } from "./walkthrough/viewTransitionNames";
import { usePageLoad } from "./pageLoad";
import PageLoader from "./PageLoader";

const isDemoMode = () => typeof window !== "undefined" && new URLSearchParams(window.location.search).has("demo");

/* ─── Icons — Font Awesome Pro Regular (paths inlined from @fortawesome/fontawesome-pro 6, svgs/regular) ─── */

const SZ = { width: 16, height: 16, fill: "none" as const, stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, className: "shrink-0" };

// 16px tall, width follows the icon's own aspect ratio, colored by the parent.
function FaIcon({ viewBox, d, size = 16, className = "shrink-0" }: { viewBox: string; d: string; size?: number; className?: string }) {
  const [, , w, h] = viewBox.split(" ").map(Number);
  return (
    <svg width={(size * w) / h} height={size} viewBox={viewBox} fill="currentColor" aria-hidden="true" className={className}>
      <path d={d} />
    </svg>
  );
}

/* fa-inbox */
function IconInbox() {
  return <FaIcon viewBox="0 0 512 512" d="M75.3 94c1-8 7.8-14 15.9-14l329.7 0c8 0 14.8 6 15.9 14l25 194-85.2 0c-13.4 0-25.9 6.7-33.3 17.8l-20.1 30.2-134.3 0-20.1-30.2c-7.4-11.1-19.9-17.8-33.3-17.8l-85.2 0 25-194zM48 336l83.2 0 20.1 30.2c7.4 11.1 19.9 17.8 33.3 17.8l142.9 0c13.4 0 25.9-6.7 33.3-17.8l20.1-30.2 83.2 0 0 80c0 8.8-7.2 16-16 16L64 432c-8.8 0-16-7.2-16-16l0-80zM91.2 32C59 32 31.8 55.9 27.7 87.8L.2 300.9 0 302.5 0 416c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-113.5-.2-1.5-27.5-213.1C480.2 55.9 453 32 420.8 32L91.2 32z" />;
}

/* fa-house */
function IconHome() {
  return <FaIcon viewBox="0 0 512 512" d="M240 6.1c9.1-8.2 22.9-8.2 32 0l232 208c9.9 8.8 10.7 24 1.8 33.9s-24 10.7-33.9 1.8l-8-7.2 0 205.3c0 35.3-28.7 64-64 64l-288 0c-35.3 0-64-28.7-64-64l0-205.3-8 7.2c-9.9 8.8-25 8-33.9-1.8s-8-25 1.8-33.9L240 6.1zm16 50.1L96 199.7 96 448c0 8.8 7.2 16 16 16l48 0 0-104c0-39.8 32.2-72 72-72l48 0c39.8 0 72 32.2 72 72l0 104 48 0c8.8 0 16-7.2 16-16l0-248.3-160-143.4zM208 464l96 0 0-104c0-13.3-10.7-24-24-24l-48 0c-13.3 0-24 10.7-24 24l0 104z" />;
}

/* fa-credit-card */
function IconPayments() {
  return <FaIcon viewBox="0 0 512 512" d="M448 112c8.8 0 16 7.2 16 16l0 32-416 0 0-32c0-8.8 7.2-16 16-16l384 0zm16 112l0 160c0 8.8-7.2 16-16 16L64 400c-8.8 0-16-7.2-16-16l0-160 416 0zM64 64C28.7 64 0 92.7 0 128L0 384c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-256c0-35.3-28.7-64-64-64L64 64zM80 344c0 13.3 10.7 24 24 24l48 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-48 0c-13.3 0-24 10.7-24 24zm144 0c0 13.3 10.7 24 24 24l64 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-64 0c-13.3 0-24 10.7-24 24z" />;
}

/* Payment modal bank icon (stroke style; not part of the nav) */
function IconBank() {
  return (
    <svg {...SZ} width="16" height="16" viewBox="0 0 24 24">
      <path d="M12 2L2 8h20L12 2z"/>
      <line x1="4" y1="8" x2="4" y2="19"/>
      <line x1="9" y1="8" x2="9" y2="19"/>
      <line x1="15" y1="8" x2="15" y2="19"/>
      <line x1="20" y1="8" x2="20" y2="19"/>
      <line x1="2" y1="21" x2="22" y2="21"/>
    </svg>
  );
}

/* fa-box-ballot */
function IconVote() {
  return <FaIcon viewBox="0 0 512 512" d="M171.9 121.4l101.5-101.5 82.7 82.7-101.5 101.5-82.7-82.7zm-33.9 33.9l68.6 68.6-86.6 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l272 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-89.4 0 87.5-87.5c18.7-18.7 18.7-49.1 0-67.9L307.4-14.1c-18.7-18.7-49.1-18.7-67.9 0L137.9 87.5c-18.7 18.7-18.7 49.1 0 67.9zM418.5 176l29.5 0c8.8 0 16 7.2 16 16l0 144-416 0 0-144c0-8.8 7.2-16 16-16l28.7 0c-10.2-14.5-15.8-31.1-17-48L64 128c-35.3 0-64 28.7-64 64L0 448c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-256c0-35-28.1-63.4-62.9-64-4.2 15.3-12.4 29.8-24.4 41.8l-6.2 6.2zM464 384l0 64c0 8.8-7.2 16-16 16L64 464c-8.8 0-16-7.2-16-16l0-64 416 0z" />;
}

/* fa-address-card */
function IconFeed() {
  return <FaIcon viewBox="0 0 576 512" d="M512 80c8.8 0 16 7.2 16 16l0 320c0 8.8-7.2 16-16 16L64 432c-8.8 0-16-7.2-16-16L48 96c0-8.8 7.2-16 16-16l448 0zM64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l448 0c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64L64 32zM208 248a56 56 0 1 0 0-112 56 56 0 1 0 0 112zm-32 40c-44.2 0-80 35.8-80 80 0 8.8 7.2 16 16 16l192 0c8.8 0 16-7.2 16-16 0-44.2-35.8-80-80-80l-64 0zM376 144c-13.3 0-24 10.7-24 24s10.7 24 24 24l80 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-80 0zm0 96c-13.3 0-24 10.7-24 24s10.7 24 24 24l80 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-80 0z" />;
}

/* fa-paper-plane */
function IconRequests() {
  return <FaIcon viewBox="0 0 576 512" d="M290.5 287.7L491.4 86.9 359 456.3 290.5 287.7zM457.4 53L256.6 253.8 88 185.3 457.4 53zM38.1 216.8l205.8 83.6 83.6 205.8c5.3 13.1 18.1 21.7 32.3 21.7 14.7 0 27.8-9.2 32.8-23.1L570.6 8c3.5-9.8 1-20.6-6.3-28s-18.2-9.8-28-6.3L39.4 151.7c-13.9 5-23.1 18.1-23.1 32.8 0 14.2 8.6 27 21.7 32.3z" />;
}

/* fa-folder-open */
function IconDocuments() {
  return <FaIcon viewBox="0 0 576 512" d="M97.5 400l50-160 379.4 0-50 160-379.4 0zm190.7 48L477 448c21 0 39.6-13.6 45.8-33.7l50-160c9.7-30.9-13.4-62.3-45.8-62.3l-379.4 0c-21 0-39.6 13.6-45.8 33.7L80.2 294.4 80.2 96c0-8.8 7.2-16 16-16l138.7 0c3.5 0 6.8 1.1 9.6 3.2L282.9 112c13.8 10.4 30.7 16 48 16l117.3 0c8.8 0 16 7.2 16 16l48 0c0-35.3-28.7-64-64-64L330.9 80c-6.9 0-13.7-2.2-19.2-6.4L273.3 44.8C262.2 36.5 248.8 32 234.9 32L96.2 32c-35.3 0-64 28.7-64 64l0 288c0 35.3 28.7 64 64 64l192 0z" />;
}

/* fa-address-book */
function IconDirectory() {
  return <FaIcon viewBox="0 0 512 512" d="M384 48c8.8 0 16 7.2 16 16l0 384c0 8.8-7.2 16-16 16L96 464c-8.8 0-16-7.2-16-16L80 64c0-8.8 7.2-16 16-16l288 0zM96 0C60.7 0 32 28.7 32 64l0 384c0 35.3 28.7 64 64 64l288 0c35.3 0 64-28.7 64-64l0-384c0-35.3-28.7-64-64-64L96 0zM240 248a56 56 0 1 0 0-112 56 56 0 1 0 0 112zm-32 40c-44.2 0-80 35.8-80 80 0 8.8 7.2 16 16 16l192 0c8.8 0 16-7.2 16-16 0-44.2-35.8-80-80-80l-64 0zM512 80c0-8.8-7.2-16-16-16s-16 7.2-16 16l0 64c0 8.8 7.2 16 16 16s16-7.2 16-16l0-64zM496 192c-8.8 0-16 7.2-16 16l0 64c0 8.8 7.2 16 16 16s16-7.2 16-16l0-64c0-8.8-7.2-16-16-16zm16 144c0-8.8-7.2-16-16-16s-16 7.2-16 16l0 64c0 8.8 7.2 16 16 16s16-7.2 16-16l0-64z" />;
}

/* fa-calendar */
function IconCalendar() {
  return <FaIcon viewBox="0 0 448 512" d="M120 0c13.3 0 24 10.7 24 24l0 40 160 0 0-40c0-13.3 10.7-24 24-24s24 10.7 24 24l0 40 32 0c35.3 0 64 28.7 64 64l0 288c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 128C0 92.7 28.7 64 64 64l32 0 0-40c0-13.3 10.7-24 24-24zm0 112l-56 0c-8.8 0-16 7.2-16 16l0 48 352 0 0-48c0-8.8-7.2-16-16-16l-264 0zM48 224l0 192c0 8.8 7.2 16 16 16l320 0c8.8 0 16-7.2 16-16l0-192-352 0z" />;
}

/* fa-tag */
function IconOffers() {
  return <FaIcon viewBox="0 0 576 512" d="M96.1 88c0-13.3 10.7-24 24-24l156.1 0c6.4 0 12.5 2.5 17 7l208 208c9.4 9.4 9.4 24.6 0 33.9L345.1 469.1c-9.4 9.4-24.6 9.4-33.9 0l-208-208c-4.5-4.5-7-10.6-7-17L96.1 88zm24-72c-39.8 0-72 32.2-72 72l0 156.1c0 19.1 7.6 37.4 21.1 50.9l208 208c28.1 28.1 73.7 28.1 101.8 0L535.1 346.9c28.1-28.1 28.1-73.7 0-101.8l-208-208C313.6 23.6 295.3 16 276.2 16L120.1 16zm56 160a32 32 0 1 0 0-64 32 32 0 1 0 0 64z" />;
}

/* fa-address-card */
function IconProfile() {
  return <FaIcon viewBox="0 0 576 512" d="M512 80c8.8 0 16 7.2 16 16l0 320c0 8.8-7.2 16-16 16L64 432c-8.8 0-16-7.2-16-16L48 96c0-8.8 7.2-16 16-16l448 0zM64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l448 0c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64L64 32zM208 248a56 56 0 1 0 0-112 56 56 0 1 0 0 112zm-32 40c-44.2 0-80 35.8-80 80 0 8.8 7.2 16 16 16l192 0c8.8 0 16-7.2 16-16 0-44.2-35.8-80-80-80l-64 0zM376 144c-13.3 0-24 10.7-24 24s10.7 24 24 24l80 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-80 0zm0 96c-13.3 0-24 10.7-24 24s10.7 24 24 24l80 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-80 0z" />;
}

/* fa-right-from-bracket */
function IconLogout() {
  return <FaIcon viewBox="0 0 512 512" d="M505 273c9.4-9.4 9.4-24.6 0-33.9L361 95c-6.9-6.9-17.2-8.9-26.2-5.2S320 102.3 320 112l0 64-112 0c-26.5 0-48 21.5-48 48l0 64c0 26.5 21.5 48 48 48l112 0 0 64c0 9.7 5.8 18.5 14.8 22.2s19.3 1.7 26.2-5.2L505 273zM368 200l0-30.1 86.1 86.1-86.1 86.1 0-30.1c0-13.3-10.7-24-24-24l-136 0 0-64 136 0c13.3 0 24-10.7 24-24zM168 80c13.3 0 24-10.7 24-24s-10.7-24-24-24L96 32C43 32 0 75 0 128L0 384c0 53 43 96 96 96l72 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-72 0c-26.5 0-48-21.5-48-48l0-256c0-26.5 21.5-48 48-48l72 0z" />;
}

/* fa-chart-simple */
function IconBoardActions() {
  return <FaIcon viewBox="0 0 576 512" d="M304 80l0 352-48 0 0-352 48 0zM256 32c-26.5 0-48 21.5-48 48l0 352c0 26.5 21.5 48 48 48l48 0c26.5 0 48-21.5 48-48l0-352c0-26.5-21.5-48-48-48l-48 0zM112 272l0 160-48 0 0-160 48 0zM64 224c-26.5 0-48 21.5-48 48l0 160c0 26.5 21.5 48 48 48l48 0c26.5 0 48-21.5 48-48l0-160c0-26.5-21.5-48-48-48l-48 0zm384-80l48 0 0 288-48 0 0-288zm-48 0l0 288c0 26.5 21.5 48 48 48l48 0c26.5 0 48-21.5 48-48l0-288c0-26.5-21.5-48-48-48l-48 0c-26.5 0-48 21.5-48 48z" />;
}

/* fa-plus */
function IconPlus() {
  return <FaIcon viewBox="0 0 448 512" d="M248 56c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 176-176 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l176 0 0 176c0 13.3 10.7 24 24 24s24-10.7 24-24l0-176 176 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-176 0 0-176z" />;
}

/* fa-chevron-up */
function IconChevronUp({ className }: { className?: string }) {
  return <FaIcon size={12} className={className} viewBox="0 0 448 512" d="M207.5 103c9.4-9.4 24.6-9.4 33.9 0l200 200c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-183-183-183 183c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l200-200z" />;
}

/* fa-bell-concierge */
function IconBellConcierge() {
  return <FaIcon viewBox="0 0 512 512" d="M216 64c-13.3 0-24 10.7-24 24s10.7 24 24 24l16 0 0 33.3C124.8 156.7 40.2 243.7 32.6 352l48.2 0c8.1-89.7 83.5-160 175.3-160s167.2 70.3 175.3 160l48.2 0C471.8 243.7 387.2 156.7 280 145.3l0-33.3 16 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-80 0zM24 400c-13.3 0-24 10.7-24 24s10.7 24 24 24l464 0c13.3 0 24-10.7 24-24s-10.7-24-24-24L24 400z" />;
}

/* fa-tennis-ball */
function IconTennisBall() {
  return <FaIcon viewBox="0 0 512 512" d="M248 463.8c0-55.2 21.1-110.4 63.3-152.6S408.6 248 463.8 248c-4.1-108.5-91.3-195.7-199.8-199.8 0 55.2-21.1 110.4-63.3 152.6S103.4 264 48.2 264C52.3 372.5 139.5 459.7 248 463.8zm48-3.7c82.8-16.1 148-81.4 164.1-164.1-41.7 1-83.1 17.3-114.9 49.2S297 418.4 296 460.2zM51.9 216c41.7-1 83.1-17.3 114.9-49.2S215 93.6 216 51.9C133.2 68 68 133.2 51.9 216zM0 256a256 256 0 1 1 512 0 256 256 0 1 1 -512 0z" />;
}

/* fa-pickleball */
function IconPickleball() {
  return <FaIcon viewBox="0 0 576 512" d="M448 544a128 128 0 1 1 0-256 128 128 0 1 1 0 256zm0-76a20 20 0 1 0 0 40 20 20 0 1 0 0-40zM257.8 28.3c34.4-34.3 90.1-34.4 124.4 0L517.5 163.5c26.9 26.9 32.6 66.9 17.4 99.4-13.8-7.9-28.8-13.9-44.7-17.8 8.4-15.2 6.2-34.7-6.7-47.7L348.3 62.2c-15.6-15.6-40.9-15.6-56.6 0L178 176 309.6 307.2c-10.2 13-18.6 27.4-24.9 43L155.4 221.3 167.9 333.3c.8 7.3-1.8 14.6-7.1 19.8L97.5 415.1c-8.5 8.3-8.5 21.9-.2 30.2l3.3 2.7c8.2 5.4 19.3 4.6 26.6-2.5l64-62.6 2-1.8c4.9-3.8 11.2-5.6 17.4-4.9l64.4 7.1c-2 10.6-3.1 21.5-3.1 32.7 0 5.2 .3 10.3 .7 15.3l-56-6.2-55.9 54.7C135.4 504.6 95.6 506 68.6 484l-5.2-4.7c-27.2-27.3-27-71.5 .5-98.5l54.9-53.8-11.3-101.8c-2.9-26.6 6.4-53 25.2-71.9l125-125zM376 396a20 20 0 1 0 0 40 20 20 0 1 0 0-40zm72 0a20 20 0 1 0 0 40 20 20 0 1 0 0-40zm72 0a20 20 0 1 0 0 40 20 20 0 1 0 0-40zm-72-72a20 20 0 1 0 0 40 20 20 0 1 0 0-40z" />;
}

/* fa-house-chimney */
function IconHouseChimney() {
  return <FaIcon viewBox="0 0 512 512" d="M272 6.1c-9.1-8.2-22.9-8.2-32 0L8 214.1c-9.9 8.8-10.7 24-1.8 33.9s24 10.7 33.9 1.8l8-7.2 0 205.3c0 35.3 28.7 64 64 64l288 0c35.3 0 64-28.7 64-64l0-205.3 8 7.2c9.9 8.8 25 8 33.9-1.8s8-25-1.8-33.9l-40-35.9 0-90.2c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 47.2-144-129.1zM416 199.7L416 448c0 8.8-7.2 16-16 16l-48 0 0-104c0-39.8-32.2-72-72-72l-48 0c-39.8 0-72 32.2-72 72l0 104-48 0c-8.8 0-16-7.2-16-16L96 199.7 256 56.2 416 199.7zM208 464l0-104c0-13.3 10.7-24 24-24l48 0c13.3 0 24 10.7 24 24l0 104-96 0z" />;
}

/* fa-basketball */
function IconBasketball() {
  return <FaIcon viewBox="0 0 512 512" d="M304 458.4c0-.8 0-1.6 0-2.4 0-33.3 10.7-64.1 28.9-89.2l52.2 52.2c-23.5 18.6-51 32.2-81.1 39.4zM256.2 464l-.2 0c-48.8 0-93.7-16.8-129.1-44.9L256 289.9 298.6 332.6c-26.7 34-42.6 76.9-42.6 123.4 0 2.7 .1 5.3 .2 8zm76.4-165.4L289.9 256 419.1 126.9C447.2 162.3 464 207.2 464 256l0 .2c-2.7-.1-5.3-.2-8-.2-46.6 0-89.4 15.9-123.4 42.6zM458.4 304c-7.1 30.1-20.8 57.7-39.4 81.1l-52.2-52.2c25-18.2 55.9-28.9 89.2-28.9 .8 0 1.6 0 2.4 0zM256 222.1l-42.6-42.6c26.7-34 42.6-76.9 42.6-123.4 0-2.7-.1-5.3-.2-8l.2 0c48.8 0 93.7 16.8 129.1 44.9L256 222.1zm-76.9-76.9L126.9 92.9c23.5-18.6 51-32.2 81.1-39.4 0 .8 0 1.6 0 2.4 0 33.3-10.7 64.1-28.9 89.2zm-33.9 33.9c-25 18.2-55.9 28.9-89.2 28.9-.8 0-1.6 0-2.4 0 7.1-30.1 20.8-57.7 39.4-81.1l52.2 52.2zM48 255.8c2.7 .1 5.3 .2 8 .2 46.6 0 89.4-15.9 123.4-42.6L222.1 256 92.9 385.1C64.8 349.7 48 304.8 48 256l0-.2zM256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512z" />;
}

/* fa-couch */
function IconCouch() {
  return <FaIcon viewBox="0 0 640 512" d="M112 192l0 44.1c17.2 11.5 29.2 30.3 31.6 51.9l352.9 0c2.4-21.6 14.4-40.4 31.6-51.9l0-44.1c0-44.2-35.8-80-80-80l-256 0c-44.2 0-80 35.8-80 80zM64 224.4L64 192c0-70.7 57.3-128 128-128l256 0c70.7 0 128 57.3 128 128l0 32.4c36 4 64 34.5 64 71.6l0 64c0 48.6-39.4 88-88 88L88 448c-48.6 0-88-39.4-88-88l0-64c0-37.1 28-67.6 64-71.6zM48 296l0 64c0 22.1 17.9 40 40 40l464 0c22.1 0 40-17.9 40-40l0-64c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 16c0 13.3-10.7 24-24 24l-400 0c-13.3 0-24-10.7-24-24l0-16c0-13.3-10.7-24-24-24s-24 10.7-24 24z" />;
}

/* fa-screen-users */
function IconScreenUsers() {
  return <FaIcon viewBox="0 0 640 512" d="M576 64c0-35.3-28.7-64-64-64L128 0C92.7 0 64 28.7 64 64l0 148.7c10.1-3 20.9-4.7 32-4.7 5.4 0 10.8 .4 16 1.1L112 64c0-8.8 7.2-16 16-16l384 0c8.8 0 16 7.2 16 16l0 145.1c5.2-.7 10.6-1.1 16-1.1 11.1 0 21.9 1.6 32 4.7L576 64zM160 320a64 64 0 1 0 -128 0 64 64 0 1 0 128 0zM0 480c0 17.7 14.3 32 32 32l128 0c17.7 0 32-14.3 32-32 0-35.3-28.7-64-64-64l-64 0c-35.3 0-64 28.7-64 64zM384 320a64 64 0 1 0 -128 0 64 64 0 1 0 128 0zM224 480c0 17.7 14.3 32 32 32l128 0c17.7 0 32-14.3 32-32 0-35.3-28.7-64-64-64l-64 0c-35.3 0-64 28.7-64 64zm320-96a64 64 0 1 0 0-128 64 64 0 1 0 0 128zm-32 32c-35.3 0-64 28.7-64 64 0 17.7 14.3 32 32 32l128 0c17.7 0 32-14.3 32-32 0-35.3-28.7-64-64-64l-64 0z" />;
}

/* fa-chevron-left */
function IconChevronLeft() {
  return <FaIcon size={14} viewBox="0 0 320 512" d="M7.5 239c-9.4 9.4-9.4 24.6 0 33.9l200 200c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-183-183 183-183c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0L7.5 239z" />;
}

/* fa-chevron-right */
function IconChevronRightFa() {
  return <FaIcon size={14} viewBox="0 0 320 512" d="M313.5 239c9.4 9.4 9.4 24.6 0 33.9l-200 200c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l183-183-183-183c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l200 200z" />;
}

/* fa-angles-left */
function IconAnglesLeft() {
  return <FaIcon size={14} viewBox="0 0 448 512" d="M15.5 239c-9.4 9.4-9.4 24.6 0 33.9l160 160c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-143-143 143-143c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0L15.5 239zm352-160l-160 160c-9.4 9.4-9.4 24.6 0 33.9l160 160c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-143-143 143-143c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0z" />;
}

/* fa-angles-right */
function IconAnglesRight() {
  return <FaIcon size={14} viewBox="0 0 448 512" d="M81.5 433l160-160c9.4-9.4 9.4-24.6 0-33.9L81.5 79c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l143 143-143 143c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0zm192 0l160-160c9.4-9.4 9.4-24.6 0-33.9L273.5 79c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l143 143-143 143c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0z" />;
}

/* fa-bell */
function IconBell({ width = 17, height = 19 }: { width?: number; height?: number }) {
  return (
    <svg width={width} height={height} viewBox="0 0 448 512" fill="#247ae4" className="shrink-0">
      <path d="M224 0c-17.7 0-32 14.3-32 32V51.2C119 66 64 130.6 64 208v18.8c0 47-17.3 92.4-48.5 127.6l-7.4 8.3c-8.4 9.4-10.4 22.9-5.3 34.4S19.4 416 32 416H416c12.6 0 24-7.4 29.2-18.9s3.1-25-5.3-34.4l-7.4-8.3C401.3 319.2 384 273.9 384 226.8V208c0-77.4-55-142-128-156.8V32c0-17.7-14.3-32-32-32zm45.3 493.3C262.8 505.9 244.2 512 224 512s-38.8-6.1-45.3-18.7c-3.8-7.2-1-16.1 6.2-19.9s16.1-1 19.9 6.2c2.5 4.8 10.7 8.4 19.2 8.4s16.7-3.6 19.2-8.4c3.8-7.2 12.7-10 19.9-6.2s10 12.7 6.2 19.9z"/>
    </svg>
  );
}

/* fa-chevron-down */
function IconChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 512 512" fill="currentColor" className="shrink-0">
      <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"/>
    </svg>
  );
}

/* fa-chevron-right */
function IconChevronRight() {
  return (
    <svg width="10" height="14" viewBox="0 0 320 512" fill="currentColor" className="shrink-0">
      <path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"/>
    </svg>
  );
}

/* fa-circle-question */
function IconQuestion() {
  return (
    <svg width="14" height="14" viewBox="0 0 512 512" fill="currentColor" className="shrink-0">
      <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM169.8 165.3c7.9-22.3 29.1-37.3 52.8-37.3h58.3c34.9 0 63.1 28.3 63.1 63.1c0 22.6-12.1 43.5-31.7 54.8L280 264.4c-.2 13-10.9 23.6-24 23.6c-13.3 0-24-10.7-24-24V250.5c0-8.6 4.6-16.5 12.1-20.8l44.3-25.4c4.7-2.7 7.6-7.7 7.6-13.1c0-8.4-6.8-15.1-15.1-15.1H222.6c-3.4 0-6.4 2.1-7.5 5.3l-.4 1.2c-4.4 12.5-18.2 19-30.6 14.6s-19-18.2-14.6-30.6l.4-1.2zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"/>
    </svg>
  );
}

/* ─── Address / User Card ─── */
function AddressCard() {
  return (
    <div data-ux-id="address-card" className="bg-white drop-shadow-[0px_2px_9px_rgba(18,17,48,0.09)] flex gap-[13px] items-center pl-[15px] pr-[21px] py-[12px] rounded-[18px] shrink-0 w-[380px]">
      <div className="relative shrink-0 size-[52px]">
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <img src="/Mask_group.png" alt="" className="w-full h-full object-cover" />
        </div>
        <svg className="absolute" style={{ left: 12, right: 0, bottom: 0, top: 12 }} width="27" height="27" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#f03434" stroke="none"/>
        </svg>
      </div>
      <div className="flex flex-[1_0_0] flex-col gap-[3px] items-start min-w-px">
        <p className="font-['DM_Sans:Bold',sans-serif] font-bold leading-normal text-[#262630] text-[16px] w-full" style={{ fontVariationSettings: '"opsz" 14' }}>Waterfront</p>
        <div className="font-['DM_Sans:Medium',sans-serif] font-medium opacity-65 text-[#262630] text-[14px]" style={{ fontVariationSettings: '"opsz" 14' }}>
          <p className="leading-[16px] mb-0">151225 77th Rd N</p>
          <p className="leading-[16px]">Loxahatchee, FL 33470</p>
        </div>
      </div>
      <span className="text-[#262630]"><IconChevronDown /></span>
    </div>
  );
}

/* ─── Sidebar ─── */
type Page = "dashboard" | "elections" | "community" | "amenities" | "arc-form" | "offers" | "reservations";
type DashboardView = "homeowner" | "board";

/* ─── Inbox messages (dashboard widget; the sidebar badge counts its unread) ─── */
const INBOX_WIDGET_MESSAGES = [
  { unread: true, type: "Reminder", title: "Pool Party This Weekend!", preview: "Join us this Saturday for a splashin' good time at the community pool. The fun begins", tag: "Open", tagBg: "#d9ebfa", date: "July 6" },
  { unread: false, type: "ARC Request", title: "Request received", preview: "We are reviewing your recent request and will be in touch shortly. Please have all", tag: "Updated", tagBg: "#d9ebfa", date: "July 1" },
  { unread: true, type: "Alert", title: "Landscaping Schedule", preview: "The landscaping crew will be on site next Tuesday for regular maintenance. Please keep all pets indoors", tag: "Scheduled", tagBg: "transparent", date: "July 9" },
  { unread: true, type: "Heads Up", title: "Package Delivery Changes", preview: "Effective immediately, all packages will be delivered to the front office. Please pick them up within 48 hours", tag: "Updated", tagBg: "transparent", date: "July 8" },
  { unread: false, type: "Reminder", title: "Board Meeting Next Week", preview: "The next board meeting is scheduled for next Wednesday at 7 PM in the clubhouse. All residents are welcome", tag: "Scheduled", tagBg: "#d9ebfa", date: "July 7" },
];
const INBOX_UNREAD_COUNT = INBOX_WIDGET_MESSAGES.filter((msg) => msg.unread).length;

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  badge?: number;
  active?: boolean;
  onClick?: () => void;
  uxId: string;
  vtName?: VTName;
}

function NavItem({ icon, label, badge, active, onClick, uxId, vtName }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      data-ux-id={`sidebar-nav-${uxId}`}
      data-vt-name={vtName}
      className={`w-full rounded-[8px] flex items-center gap-[12px] pl-[10px] pr-[22px] py-[8px] cursor-pointer transition-colors ${
        active ? "bg-[#e8f1fd]" : "hover:bg-[#f2f6fa]"
      }`}
    >
      <span className={`text-[${active ? "#247ae4" : "#262630"}] flex items-center justify-center size-[24px]`} style={{ color: active ? "#247ae4" : "#262630" }}>
        {icon}
      </span>
      <span
        className={`font-['DM_Sans:Medium',sans-serif] font-medium text-[14px] flex-1 text-left whitespace-nowrap ${active ? "text-[#247ae4]" : "text-[#262630]"}`}
        style={{ fontVariationSettings: '"opsz" 14' }}
      >
        {label}
      </span>
      {badge !== undefined && (
        <span data-ux-id="sidebar-nav-badge" className="bg-[#247ae4] rounded-full min-w-[16px] h-[16px] flex items-center justify-center">
          <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-white text-[12px] px-[3px]" style={{ fontVariationSettings: '"opsz" 14' }}>
            {badge}
          </span>
        </span>
      )}
    </button>
  );
}

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  onClose?: () => void;
  onRestart: () => void;
  dashboardView?: DashboardView;
  askHoaiOpen: boolean;
  onOpenAskHoai: () => void;
  onOpenQuickActions: () => void;
}

function Sidebar({ activePage, onNavigate, onClose, onRestart, dashboardView, askHoaiOpen, onOpenAskHoai, onOpenQuickActions }: SidebarProps) {
  const [boardActionsOpen, setBoardActionsOpen] = useState(true);

  return (
    <div data-ux-id="sidebar" className="bg-white h-screen md:h-full shrink-0 w-[280px] md:w-[265px] border-r border-[#d9ecf8] flex flex-col overflow-hidden shadow-xl md:shadow-none">
      <div className="flex flex-col gap-[42px] items-center px-[26px] py-[40px] flex-1 overflow-y-auto">
        {/* Mobile close button */}
        <button
          onClick={onClose}
          data-ux-id="sidebar-close-button"
          className="md:hidden self-end -mt-[28px] -mr-[10px] w-[32px] h-[32px] flex items-center justify-center rounded-full text-[#262630] opacity-40 hover:opacity-70 transition-opacity"
          aria-label="Close menu"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        {/* Branding */}
        <button
          onClick={onRestart}
          data-ux-id="sidebar-logo-restart"
          className="flex flex-col items-center shrink-0 cursor-pointer"
          aria-label="Restart prototype"
        >
          <img src={imgBranding} alt="Waterfront Community Estates" className="object-contain" style={{ height: "80px" }} />
        </button>

        {/* Quick Actions */}
        <button
          onClick={onOpenQuickActions}
          data-ux-id="sidebar-quick-actions"
          data-vt-name={VT.QuickActionsBtn}
          className="w-full flex items-center justify-center gap-[10px] px-[23px] py-[12px] rounded-[8px] border border-[#247ae4] hover:bg-[#f0f7ff] transition-colors shrink-0"
        >
          <span className="text-[#247ae4] flex items-center"><IconPlus /></span>
          <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#247ae4] text-[14px]" style={{ fontVariationSettings: '"opsz" 14' }}>
            Quick Actions
          </span>
        </button>

        {/* Nav Items */}
        <div data-ux-id="sidebar-nav-list" className="flex flex-col gap-[13px] w-full shrink-0">
          <NavItem icon={<IconInbox />} label="Inbox" badge={INBOX_UNREAD_COUNT} active={false} uxId="inbox" />
          <NavItem icon={<IconHome />} label="Home" active={activePage === "dashboard"} onClick={() => onNavigate("dashboard")} uxId="home" vtName={VT.SidebarNavHome} />
          <NavItem icon={<IconPayments />} label="Payments" uxId="payments" />
          <NavItem icon={<IconVote />} label="Elections" badge={1} active={activePage === "elections"} onClick={() => onNavigate("elections")} uxId="elections" />
          <NavItem icon={<IconFeed />} label="Community Feed" active={activePage === "community"} onClick={() => onNavigate("community")} uxId="community-feed" />
          <NavItem icon={<IconBellConcierge />} label="Reservations" active={activePage === "reservations"} onClick={() => onNavigate("reservations")} uxId="reservations" />
          {isDemoMode() ? (
            <NavItem
              icon={<IconHome />}
              label="Amenities"
              active={activePage === "amenities"}
              onClick={() => onNavigate("amenities")}
              uxId="amenities"
            />
          ) : null}
          <NavItem icon={<IconRequests />} label="Requests" uxId="requests" />
          <NavItem icon={<IconOffers />} label="Offers" active={activePage === "offers"} onClick={() => onNavigate("offers")} uxId="offers" vtName={VT.SidebarNavOffers} />
          <NavItem icon={<IconDocuments />} label="Documents" uxId="documents" />
          <NavItem icon={<IconDirectory />} label="Directory" uxId="directory" />
          <NavItem icon={<IconCalendar />} label="Calendar" uxId="calendar" />

          {/* Ask HOAi reopen pill — visible only when the right panel is collapsed */}
          {!askHoaiOpen && (
            <button
              type="button"
              data-ux-id="sidebar-askhoai-open"
              onClick={onOpenAskHoai}
              className="w-full flex items-center justify-center gap-2 mt-[6px] px-[23px] py-[12px] rounded-full bg-[#1d70dc] hover:bg-[#165bb3] text-white transition-colors shrink-0"
            >
              <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[14px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                Ask HOAi
              </span>
              <AskHoaiIcon className="h-4 w-auto" />
            </button>
          )}

          {/* Board Actions — board member view only */}
          {dashboardView === "board" && <div className="w-full border-t border-[#d9e7f0] my-[9px]" />}
          {dashboardView === "board" && (
            <div className="flex flex-col gap-0 w-full">
              {/* Section header */}
              <button
                type="button"
                onClick={() => setBoardActionsOpen(o => !o)}
                data-ux-id="sidebar-board-actions-toggle"
                className="w-full flex items-center gap-[12px] pl-[10px] pr-[10px] py-[8px] rounded-[8px] hover:bg-[#f2f6fa] transition-colors cursor-pointer"
              >
                <span className="flex items-center justify-center size-[24px] text-[#262630] shrink-0">
                  <IconBoardActions />
                </span>
                <span className="font-['DM_Sans:Medium',sans-serif] font-medium text-[14px] flex-1 text-left text-[#262630]" style={{ fontVariationSettings: '"opsz" 14' }}>
                  Board Actions
                </span>
                <IconChevronUp className={`transition-transform duration-200 text-[#9ca3af] shrink-0 ${boardActionsOpen ? "" : "rotate-180"}`} />
              </button>

              {/* Sub-items */}
              {boardActionsOpen && (
                <div className="flex flex-col mt-[2px] pl-[22px]">
                  {["ARCs", "Invoices", "Work Orders", "Collections", "Homeowners", "Bank Accounts", "Reports", "Inspections", "Violations", "Board Tasks"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      data-ux-id={`sidebar-board-${item.toLowerCase().replace(/\s+/g, "-")}`}
                      className="w-full text-left px-[10px] py-[7px] text-[13px] font-['DM_Sans:Medium',sans-serif] font-medium text-[#262630] hover:text-[#247ae4] hover:bg-[#f2f6fa] rounded-[6px] transition-colors cursor-pointer"
                      style={{ fontVariationSettings: '"opsz" 14' }}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Divider */}
          <div className="w-full border-t border-[#d9e7f0] my-[9px]" />

          <NavItem icon={<IconProfile />} label="My Profile" uxId="profile" />
          <NavItem icon={<IconLogout />} label="Log Out" onClick={onRestart} uxId="logout" />
        </div>
      </div>
    </div>
  );
}

/* ─── Quick Actions Modal ─── */
type QuickActionsView = "menu" | "arc";

const ARC_FORMS: ReadonlyArray<{ id: string; label: string }> = [
  { id: "fence", label: "ARC Request – Fence Installation" },
  { id: "pool", label: "ARC Request – Pool Installation" },
  { id: "solar", label: "ARC Request – Solar Panel" },
  { id: "landscaping", label: "ARC Request – Landscaping" },
  { id: "paint", label: "ARC Request – Exterior Paint" },
];

function QuickActionsModal({
  view,
  onClose,
  onSelectArc,
  onBackToMenu,
  onPickArcForm,
}: {
  view: QuickActionsView;
  onClose: () => void;
  onSelectArc: () => void;
  onBackToMenu: () => void;
  onPickArcForm: (form: { id: string; label: string }) => void;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const options = [
    {
      key: "arc",
      label: "ARC Request",
      uxId: "sidebar-quick-actions-arc-request",
      vtName: VT.QuickActionsArcRequestBtn,
      onClick: onSelectArc,
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 3h8l6 6v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z"/>
          <path d="M12 3v6h6"/>
          <path d="M6.5 12h5"/>
          <path d="M6.5 15h3"/>
        </svg>
      ),
    },
    {
      key: "general",
      label: "General Request",
      uxId: "sidebar-quick-actions-general-request",
      onClick: () => {},
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M18 16v-5a6 6 0 10-12 0v5l-1.5 2h15L18 16z"/>
          <path d="M10 20a2 2 0 004 0"/>
        </svg>
      ),
    },
    {
      key: "service",
      label: "Service Request",
      uxId: "sidebar-quick-actions-service-request",
      onClick: () => {},
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20.5 7.5a4.5 4.5 0 01-5.9 4.3L5.4 20.9a1.5 1.5 0 01-2.1-2.1l9.1-9.1A4.5 4.5 0 0117 2.9l-2.7 2.7 2.1 2.1 2.7-2.7c.9.9 1.4 2.1 1.4 3.5z"/>
        </svg>
      ),
    },
  ];

  return (
    <div
      data-ux-id="quick-actions-modal-backdrop"
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-[2px] px-[16px]"
      role="presentation"
      onMouseDown={onClose}
    >
      <div
        data-ux-id="quick-actions-modal"
        className="w-full max-w-[640px] bg-white rounded-[16px] shadow-[0_8px_40px_rgba(0,0,0,0.18)] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-actions-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between px-[26px] pt-[22px] pb-[18px]">
          <p id="quick-actions-title" className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[17px]" style={{ fontVariationSettings: '"opsz" 14' }}>
            New Request
          </p>
          <button
            type="button"
            onClick={onClose}
            data-ux-id="quick-actions-modal-close"
            className="flex size-[32px] items-center justify-center rounded-[6px] text-[#262630] opacity-55 hover:opacity-100 hover:bg-[#f2f5f7] transition-colors"
            aria-label="Close new request"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
          </button>
        </div>

        {view === "menu" ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-[16px] px-[26px] pb-[26px]">
            {options.map((option) => (
              <button
                key={option.key}
                type="button"
                data-ux-id={option.uxId}
                data-vt-name={option.vtName}
                onClick={option.onClick}
                className="group flex flex-col items-center justify-center gap-[14px] rounded-[12px] border border-[#e2eaf0] bg-white px-[16px] py-[32px] text-center transition-all hover:border-[#247ae4] hover:bg-[#f6faff] hover:shadow-[0_4px_12px_rgba(36,122,228,0.08)]"
              >
                <span className="text-[#262630] group-hover:text-[#247ae4] transition-colors">
                  {option.icon}
                </span>
                <span className="font-['DM_Sans:Medium',sans-serif] font-medium text-[#262630] text-[14px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-[18px] px-[26px] pb-[22px]">
            <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[15px]" style={{ fontVariationSettings: '"opsz" 14' }}>
              ARC Request
            </p>
            <div className="rounded-[8px] border border-[#cfe2fa] bg-[#f3f8ff] px-[18px] py-[14px] font-['DM_Sans:Medium',sans-serif] font-medium text-[#262630] text-[14px]" style={{ fontVariationSettings: '"opsz" 14' }}>
              Select a form from the list below
            </div>
            <ul className="flex flex-col divide-y divide-[#eef2f6] border-t border-b border-[#eef2f6]">
              {ARC_FORMS.map((form) => (
                <li key={form.id}>
                  <button
                    type="button"
                    onClick={() => onPickArcForm(form)}
                    data-ux-id={`quick-actions-arc-form-${form.id}`}
                    data-vt-name={form.id === "fence" ? VT.ArcFenceFormLink : undefined}
                    className="group flex w-full items-center justify-between gap-[14px] px-[6px] py-[14px] text-left transition-colors hover:bg-[#f7fafd]"
                  >
                    <span className="flex items-center gap-[14px] min-w-0">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#262630" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
                        <path d="M14 3H6a1 1 0 00-1 1v16a1 1 0 001 1h12a1 1 0 001-1V8l-5-5z"/>
                        <path d="M14 3v5h5"/>
                      </svg>
                      <span className="truncate font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] text-[14px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                        {form.label}
                      </span>
                    </span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0 group-hover:stroke-[#247ae4]">
                      <path d="M14 3h7v7"/>
                      <path d="M10 14L21 3"/>
                      <path d="M21 14v5a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h5"/>
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between pt-[4px]">
              <button
                type="button"
                onClick={onBackToMenu}
                data-ux-id="quick-actions-arc-back"
                className="inline-flex items-center gap-[8px] rounded-[8px] border border-[#d9e0e7] bg-white px-[16px] py-[9px] font-['DM_Sans:Medium',sans-serif] font-medium text-[#262630] text-[14px] transition-colors hover:bg-[#f2f5f7]"
                style={{ fontVariationSettings: '"opsz" 14' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M19 12H5"/>
                  <path d="M12 19l-7-7 7-7"/>
                </svg>
                Back
              </button>
              <button
                type="button"
                onClick={onClose}
                data-ux-id="quick-actions-arc-cancel"
                className="rounded-[8px] border border-[#d9e0e7] bg-white px-[20px] py-[9px] font-['DM_Sans:Medium',sans-serif] font-medium text-[#262630] text-[14px] transition-colors hover:bg-[#f2f5f7]"
                style={{ fontVariationSettings: '"opsz" 14' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── View Toggle ─── */
function ViewToggle({ view, onChange }: { view: DashboardView; onChange: (v: DashboardView) => void }) {
  return (
    <div
      data-ux-id="dashboard-view-toggle"
      className="fixed bottom-6 left-6 z-50 flex items-center bg-[#1a1f2e] rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.35)] p-[5px] gap-[2px]"
    >
      <button
        onClick={() => onChange("homeowner")}
        data-ux-id="dashboard-view-toggle-homeowner"
        className={`flex items-center gap-[8px] px-[16px] py-[9px] rounded-full text-[13px] font-['DM_Sans:SemiBold',sans-serif] font-semibold transition-all cursor-pointer ${
          view === "homeowner" ? "bg-[#2d3550] text-white" : "text-[#8a95ab] hover:text-white"
        }`}
        style={{ fontVariationSettings: '"opsz" 14' }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
        Homeowner
      </button>
      <button
        onClick={() => onChange("board")}
        data-ux-id="dashboard-view-toggle-board"
        className={`flex items-center gap-[8px] px-[16px] py-[9px] rounded-full text-[13px] font-['DM_Sans:SemiBold',sans-serif] font-semibold transition-all cursor-pointer ${
          view === "board" ? "bg-[#2d3550] text-white" : "text-[#8a95ab] hover:text-white"
        }`}
        style={{ fontVariationSettings: '"opsz" 14' }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/>
          <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/>
          <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/>
          <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/>
        </svg>
        Board Member
      </button>
    </div>
  );
}

/* ─── Payment helpers ─── */
function generateConfirmationNumber() {
  const segment = (length: number) => Array.from({ length }, () => Math.floor(Math.random() * 16).toString(16)).join("").toUpperCase();
  return `${segment(4)}-${segment(4)}-${segment(12)}`;
}

function generateAlphanumericConfirmationNumber() {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const segment = (length: number) => Array.from({ length }, () => charset[Math.floor(Math.random() * charset.length)]).join("");
  return `${segment(6)}-${segment(4)}-${segment(6)}`;
}

function formatCardNumber(v: string) { return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim(); }
function formatCardExpiry(v: string) { const d = v.replace(/\D/g, "").slice(0, 4); return d.length >= 3 ? d.slice(0, 2) + " / " + d.slice(2) : d; }

/* ─── Make a Payment Modal ─── */
function PaymentModal({ onClose, onPaid, currentBalance }: { onClose: () => void; onPaid: (amount: string) => void; currentBalance: string }) {
  const [step, setStep] = useState<"form" | "review" | "confirmation" | "autopay-confirmation" | "new-card-form" | "new-bank-form">("form");
  const [method, setMethod] = useState<"visa" | "bank" | "new-card" | "new-bank">("visa");
  const [methodExpanded, setMethodExpanded] = useState(false);
  const [amountOption, setAmountOption] = useState<"balance" | "other">("balance");
  const [otherAmount, setOtherAmount] = useState("");
  const [confirmationNumber] = useState(generateConfirmationNumber);
  const [autopayConfirmationNumber] = useState(generateAlphanumericConfirmationNumber);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [confirmAccountNumber, setConfirmAccountNumber] = useState("");

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const methodLabel = method === "visa" ? "Visa •••• 4242" : method === "bank" ? "Bank •••• 2363" : method === "new-card" ? "New Card" : "New Bank Account";
  const paymentAmount = amountOption === "balance" ? currentBalance : `$${otherAmount || "0.00"}`;
  // The balance drops once the modal closes on a processed payment, not while
  // the confirmation still shows the amount paid.
  const close = () => {
    if (step === "confirmation" || step === "autopay-confirmation") onPaid(paymentAmount);
    onClose();
  };
  const closeRef = useRef(close);
  closeRef.current = close;
  const processingFee = "$0.00";

  return (
    <div
      data-ux-id="payment-modal-backdrop"
      className="fixed inset-0 z-[300] flex items-center justify-center px-[16px]"
      onMouseDown={close}
    >
      <div
        data-ux-id="payment-modal"
        className="w-full max-w-[560px] max-h-[calc(100dvh-32px)] bg-white rounded-[20px] shadow-[0_8px_40px_rgba(0,0,0,0.18)] flex flex-col overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-[28px] pt-[26px] pb-[20px] flex items-center justify-between shrink-0">
          <p className="font-['DM_Sans:Bold',sans-serif] font-bold text-[#262630] text-[24px]" style={{ fontVariationSettings: '"opsz" 14' }}>
            Make a Payment
          </p>
          <button
            onClick={close}
            data-ux-id="payment-modal-close-button"
            data-vt-name={VT.PaymentModalCloseBtn}
            className="w-[32px] h-[32px] flex items-center justify-center rounded-[6px] hover:bg-[#f2f5f7] transition-colors shrink-0"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#262630" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>
        <div className="w-full h-px bg-[#e2eaf0] shrink-0" />

        {/* Body */}
        {step === "new-card-form" ? (
        <div className="px-[28px] py-[22px] flex flex-col gap-[22px] overflow-y-auto">
          <div className="flex flex-col gap-[8px]">
            <p className="font-['DM_Sans:Bold',sans-serif] font-bold text-[#262630] text-[16px]" style={{ fontVariationSettings: '"opsz" 14' }}>
              Card Number
            </p>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                autoComplete="cc-number"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                data-ux-id="payment-new-card-number-input"
                className="w-full h-[52px] rounded-[10px] border border-[#cfd3da] bg-white pl-[18px] pr-[150px] font-['DM_Sans:Regular',sans-serif] font-normal text-[16px] text-[#262630] tracking-wider placeholder:text-[#9ca3af] outline-none focus:border-[#247ae4] focus:ring-2 focus:ring-[#247ae4]/15"
                style={{ fontVariationSettings: '"opsz" 14' }}
              />
              <div className="absolute right-[14px] top-1/2 -translate-y-1/2 flex items-center gap-[6px]">
                <div className="bg-[#1a1a1a] rounded-[5px] w-[34px] h-[22px] flex items-center justify-center">
                  <div className="flex items-center">
                    <div className="w-[13px] h-[13px] rounded-full bg-[#eb001b]" />
                    <div className="w-[13px] h-[13px] rounded-full bg-[#f79e1b] -ml-[5px] mix-blend-screen" />
                  </div>
                </div>
                <div className="bg-white border border-[#e1e9ef] rounded-[5px] w-[34px] h-[22px] flex items-center justify-center">
                  <span className="font-['DM_Sans:Bold',sans-serif] font-bold text-[#1434cb] text-[9px] italic" style={{ fontVariationSettings: '"opsz" 14' }}>VISA</span>
                </div>
                <div className="bg-[#2557a7] rounded-[5px] w-[34px] h-[22px] flex items-center justify-center">
                  <span className="font-['DM_Sans:Bold',sans-serif] font-bold text-white text-[7px] leading-tight text-center" style={{ fontVariationSettings: '"opsz" 14' }}>AM<br />EX</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-[20px] w-full">
            <div className="flex-1 min-w-0 flex flex-col gap-[8px]">
              <p className="font-['DM_Sans:Bold',sans-serif] font-bold text-[#262630] text-[16px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                Expiration
              </p>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="cc-exp"
                placeholder="MM / YY"
                maxLength={7}
                value={cardExpiry}
                onChange={(e) => setCardExpiry(formatCardExpiry(e.target.value))}
                data-ux-id="payment-new-card-expiry-input"
                className="w-full h-[52px] rounded-[10px] border border-[#cfd3da] bg-white px-[18px] font-['DM_Sans:Regular',sans-serif] font-normal text-[16px] text-[#262630] placeholder:text-[#9ca3af] outline-none focus:border-[#247ae4] focus:ring-2 focus:ring-[#247ae4]/15"
                style={{ fontVariationSettings: '"opsz" 14' }}
              />
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-[8px]">
              <p className="font-['DM_Sans:Bold',sans-serif] font-bold text-[#262630] text-[16px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                CVC
              </p>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="cc-csc"
                placeholder="CVC"
                maxLength={4}
                value={cardCvc}
                onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                data-ux-id="payment-new-card-cvc-input"
                className="w-full h-[52px] rounded-[10px] border border-[#cfd3da] bg-white px-[18px] font-['DM_Sans:Regular',sans-serif] font-normal text-[16px] text-[#262630] placeholder:text-[#9ca3af] outline-none focus:border-[#247ae4] focus:ring-2 focus:ring-[#247ae4]/15"
                style={{ fontVariationSettings: '"opsz" 14' }}
              />
            </div>
          </div>
        </div>
        ) : step === "new-bank-form" ? (
        <div className="px-[28px] py-[22px] flex flex-col gap-[22px] overflow-y-auto">
          <div className="flex flex-col gap-[8px]">
            <p className="font-['DM_Sans:Bold',sans-serif] font-bold text-[#262630] text-[16px]" style={{ fontVariationSettings: '"opsz" 14' }}>
              Routing Number
            </p>
            <input
              type="text"
              inputMode="numeric"
              placeholder="123456789"
              maxLength={9}
              value={routingNumber}
              onChange={(e) => setRoutingNumber(e.target.value.replace(/\D/g, "").slice(0, 9))}
              data-ux-id="payment-new-bank-routing-input"
              className="w-full h-[52px] rounded-[10px] border border-[#cfd3da] bg-white px-[18px] font-['DM_Sans:Regular',sans-serif] font-normal text-[16px] text-[#262630] tracking-wider placeholder:text-[#9ca3af] outline-none focus:border-[#247ae4] focus:ring-2 focus:ring-[#247ae4]/15"
              style={{ fontVariationSettings: '"opsz" 14' }}
            />
          </div>

          <div className="flex gap-[20px] w-full">
            <div className="flex-1 min-w-0 flex flex-col gap-[8px]">
              <p className="font-['DM_Sans:Bold',sans-serif] font-bold text-[#262630] text-[16px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                Account Number
              </p>
              <input
                type="text"
                inputMode="numeric"
                placeholder="000123456789"
                maxLength={17}
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 17))}
                data-ux-id="payment-new-bank-account-number-input"
                className="w-full h-[52px] rounded-[10px] border border-[#cfd3da] bg-white px-[18px] font-['DM_Sans:Regular',sans-serif] font-normal text-[16px] text-[#262630] placeholder:text-[#9ca3af] outline-none focus:border-[#247ae4] focus:ring-2 focus:ring-[#247ae4]/15"
                style={{ fontVariationSettings: '"opsz" 14' }}
              />
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-[8px]">
              <p className="font-['DM_Sans:Bold',sans-serif] font-bold text-[#262630] text-[16px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                Confirm Account Number
              </p>
              <input
                type="text"
                inputMode="numeric"
                placeholder="000123456789"
                maxLength={17}
                value={confirmAccountNumber}
                onChange={(e) => setConfirmAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 17))}
                data-ux-id="payment-new-bank-confirm-account-number-input"
                className="w-full h-[52px] rounded-[10px] border border-[#cfd3da] bg-white px-[18px] font-['DM_Sans:Regular',sans-serif] font-normal text-[16px] text-[#262630] placeholder:text-[#9ca3af] outline-none focus:border-[#247ae4] focus:ring-2 focus:ring-[#247ae4]/15"
                style={{ fontVariationSettings: '"opsz" 14' }}
              />
            </div>
          </div>
        </div>
        ) : step === "autopay-confirmation" ? (
        <div className="px-[28px] py-[22px] flex flex-col gap-[18px] overflow-y-auto">
          <div data-ux-id="payment-confirmation-card" className="border border-[#e5e9ef] rounded-[14px] p-[20px] flex flex-col gap-[14px]">
            <div className="flex items-center gap-[12px]">
              <div className="shrink-0 w-[26px] h-[26px] rounded-full bg-[#dcf5e3] flex items-center justify-center">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#1f9254" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <p className="font-['DM_Sans:Bold',sans-serif] font-bold text-[#262630] text-[17px]" style={{ fontVariationSettings: '"opsz" 14' }}>Payment Confirmed.</p>
            </div>
            <div className="w-full h-px bg-[#e5e9ef]" />
            <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] text-[15px] leading-[1.5]" style={{ fontVariationSettings: '"opsz" 14' }}>
              Your payment of <span className="font-['DM_Sans:Bold',sans-serif] font-bold">{paymentAmount}</span> has been successfully processed. A receipt has been sent to your email.
              <br />
              Confirmation number: {confirmationNumber}
            </p>
          </div>

          <div data-ux-id="payment-autopay-confirmation-card" className="border border-[#e5e9ef] rounded-[14px] p-[20px] flex flex-col gap-[18px]">
            <div className="flex items-center gap-[14px]">
              <div className="shrink-0 w-[36px] h-[36px] rounded-full bg-[#dcf5e3] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#1f9254" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div>
                <p className="font-['DM_Sans:Bold',sans-serif] font-bold text-[#262630] text-[17px]" style={{ fontVariationSettings: '"opsz" 14' }}>You&apos;re enrolled in AutoPay</p>
                <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-55 text-[14px]" style={{ fontVariationSettings: '"opsz" 14' }}>Your payments will be handled automatically.</p>
              </div>
            </div>

            <div className="bg-[#f4f6f8] rounded-[10px] px-[18px] py-[14px] flex flex-col gap-[4px]">
              <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] opacity-55 text-[12px] uppercase tracking-wide" style={{ fontVariationSettings: '"opsz" 14' }}>Confirmation Number</p>
              <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[16px]" style={{ fontVariationSettings: '"opsz" 14' }}>{autopayConfirmationNumber}</p>
            </div>

            <div className="border border-[#e5e9ef] rounded-[12px] overflow-hidden">
              <p className="font-['DM_Sans:Bold',sans-serif] font-bold text-[#262630] text-[16px] px-[18px] py-[14px]" style={{ fontVariationSettings: '"opsz" 14' }}>AutoPay Details</p>
              <div className="border-t border-[#e5e9ef] flex items-center justify-between px-[18px] py-[13px]">
                <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-55 text-[14px]" style={{ fontVariationSettings: '"opsz" 14' }}>Payment Type</p>
                <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] text-[15px]" style={{ fontVariationSettings: '"opsz" 14' }}>Full Balance</p>
              </div>
              <div className="border-t border-[#e5e9ef] flex items-center justify-between px-[18px] py-[13px]">
                <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-55 text-[14px]" style={{ fontVariationSettings: '"opsz" 14' }}>Payment Method</p>
                <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] text-[15px]" style={{ fontVariationSettings: '"opsz" 14' }}>Visa •••• 7531</p>
              </div>
              <div className="border-t border-[#e5e9ef] flex items-center justify-between px-[18px] py-[13px]">
                <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-55 text-[14px]" style={{ fontVariationSettings: '"opsz" 14' }}>Start Date</p>
                <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] text-[15px]" style={{ fontVariationSettings: '"opsz" 14' }}>10/01/2026</p>
              </div>
              <div className="border-t border-[#e5e9ef] flex items-center justify-between px-[18px] py-[13px]">
                <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-55 text-[14px]" style={{ fontVariationSettings: '"opsz" 14' }}>Frequency</p>
                <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] text-[15px]" style={{ fontVariationSettings: '"opsz" 14' }}>Monthly</p>
              </div>
            </div>
          </div>

          <button
            onClick={close}
            data-ux-id="payment-modal-done-button"
            className="w-full bg-[#247ae4] hover:bg-[#1a6ed0] transition-colors text-white rounded-[10px] px-[22px] py-[13px] font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[16px]"
            style={{ fontVariationSettings: '"opsz" 14' }}
          >
            Done
          </button>
        </div>
        ) : step === "confirmation" ? (
        <div className="px-[28px] pt-[22px] pb-[38px] flex flex-col gap-[18px] overflow-y-auto">
          <div data-ux-id="payment-confirmation-card" className="border border-[#e5e9ef] rounded-[14px] p-[20px] flex flex-col gap-[14px]">
            <div className="flex items-center gap-[12px]">
              <div className="shrink-0 w-[26px] h-[26px] rounded-full bg-[#dcf5e3] flex items-center justify-center">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#1f9254" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <p className="font-['DM_Sans:Bold',sans-serif] font-bold text-[#262630] text-[17px]" style={{ fontVariationSettings: '"opsz" 14' }}>Payment Confirmed.</p>
            </div>
            <div className="w-full h-px bg-[#e5e9ef]" />
            <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] text-[15px] leading-[1.5]" style={{ fontVariationSettings: '"opsz" 14' }}>
              Your payment of <span className="font-['DM_Sans:Bold',sans-serif] font-bold">{paymentAmount}</span> has been successfully processed. A receipt has been sent to your email.
              <br />
              Confirmation number: {confirmationNumber}
            </p>
          </div>

          <div data-ux-id="payment-autopay-upsell-card" className="border border-[#e5e9ef] rounded-[14px] p-[20px] flex flex-col gap-[14px]">
            <div className="flex items-center gap-[10px]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#262630" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <path d="M3 12a9 9 0 0115-6.7M21 12a9 9 0 01-15 6.7"/>
                <polyline points="3 3 3 9 9 9"/>
                <polyline points="21 21 21 15 15 15"/>
              </svg>
              <p className="font-['DM_Sans:Bold',sans-serif] font-bold text-[#262630] text-[16px]" style={{ fontVariationSettings: '"opsz" 14' }}>Auto Pay – stay on track of your dues</p>
            </div>
            <div className="w-full h-px bg-[#e5e9ef]" />
            <div className="flex gap-[8px]">
              <p className="font-['DM_Sans:Bold',sans-serif] font-bold text-[#262630] text-[15px] shrink-0 whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>Full Balance</p>
              <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-70 text-[15px] leading-[1.4]" style={{ fontVariationSettings: '"opsz" 14' }}>Pays your full balance on scheduled due date.</p>
            </div>
            <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] text-[14px]" style={{ fontVariationSettings: '"opsz" 14' }}>
              Payment Start Date: <span className="font-['DM_Sans:Bold',sans-serif] font-bold">10/01/26</span>
            </p>
            <div className="flex items-center gap-[12px]">
              <div className="bg-[#1434cb] rounded-[5px] px-[8px] py-[4px] shrink-0">
                <span className="font-['DM_Sans:Bold',sans-serif] font-bold text-white text-[12px] italic" style={{ fontVariationSettings: '"opsz" 14' }}>VISA</span>
              </div>
              <div>
                <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] text-[15px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                  Card ending in <span className="font-['DM_Sans:Bold',sans-serif] font-bold">7531</span>
                </p>
                <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-55 text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>2.99% fee</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setStep("autopay-confirmation")}
            data-ux-id="payment-modal-enroll-autopay-button"
            className="w-full bg-[#247ae4] hover:bg-[#1a6ed0] transition-colors text-white rounded-[10px] px-[22px] py-[13px] font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[16px]"
            style={{ fontVariationSettings: '"opsz" 14' }}
          >
            Enroll in AutoPay
          </button>

          <div className="flex items-center justify-center gap-[8px]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6a7282" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <rect x="5" y="11" width="14" height="10" rx="2"/>
              <path d="M8 11V7a4 4 0 018 0v4"/>
            </svg>
            <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#6a7282] text-[14px]" style={{ fontVariationSettings: '"opsz" 14' }}>Payments are secure &amp; encrypted</p>
          </div>

          <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#6a7282] text-[13px] text-center leading-[1.5]" style={{ fontVariationSettings: '"opsz" 14' }}>
            By clicking Enroll in AutoPay you consent to the payment conditions for your payment selection as described on the{" "}
            <span className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#247ae4]" style={{ fontVariationSettings: '"opsz" 14' }}>Payment Disclosure</span>{" "}
            page.
          </p>
        </div>
        ) : step === "form" ? (
        <div className="px-[28px] py-[22px] flex flex-col gap-[22px] overflow-y-auto">
          {/* Payment Method */}
          <div className="flex flex-col gap-[10px]">
            <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[15px]" style={{ fontVariationSettings: '"opsz" 14' }}>
              Payment Method
            </p>

            {!methodExpanded ? (
              <div data-ux-id="payment-method-selected" className="flex items-center gap-[14px] rounded-[8px] border border-[#247ae4] bg-[#eef5fe] px-[18px] py-[16px]">
                {method === "visa" ? (
                  <div className="bg-[#1434cb] rounded-[5px] px-[8px] py-[4px] shrink-0">
                    <span className="font-['DM_Sans:Bold',sans-serif] font-bold text-white text-[13px] italic" style={{ fontVariationSettings: '"opsz" 14' }}>VISA</span>
                  </div>
                ) : method === "bank" ? (
                  <div className="bg-[#e3f5ea] rounded-[8px] size-[30px] flex items-center justify-center shrink-0 text-[#1f9254]">
                    <IconBank />
                  </div>
                ) : method === "new-card" ? (
                  <div className="bg-[#e7f0fc] rounded-[8px] size-[30px] flex items-center justify-center shrink-0 text-[#247ae4]">
                    <IconPayments />
                  </div>
                ) : (
                  <div className="bg-[#e3f5ea] rounded-[8px] size-[30px] flex items-center justify-center shrink-0 text-[#1f9254]">
                    <IconBank />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[15px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                    {method === "visa" ? "Visa ending in 4242" : method === "bank" ? "Bank •••• 2363" : method === "new-card" ? "New Card" : "New Bank Account"}
                  </p>
                  {method === "visa" && (
                    <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-55 text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>Expires 12/26</p>
                  )}
                  {method === "bank" && (
                    <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-55 text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>Checking Account</p>
                  )}
                </div>
                <button
                  onClick={() => setMethodExpanded(true)}
                  data-ux-id="payment-method-change-button"
                  className="shrink-0 font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#247ae4] text-[15px] hover:underline"
                  style={{ fontVariationSettings: '"opsz" 14' }}
                >
                  Change
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setMethod("visa")}
                  data-ux-id="payment-method-visa"
                  className={`flex items-center gap-[14px] rounded-[8px] border px-[18px] py-[16px] text-left transition-colors ${method === "visa" ? "border-[#247ae4] bg-[#eef5fe]" : "border-[#e1e9ef] bg-white hover:border-[#c8d9e6]"}`}
                >
                  <div className={`shrink-0 w-[20px] h-[20px] rounded-full border-2 flex items-center justify-center ${method === "visa" ? "border-[#247ae4]" : "border-[#c8d9e6]"}`}>
                    {method === "visa" && <div className="w-[10px] h-[10px] rounded-full bg-[#247ae4]" />}
                  </div>
                  <span className="text-[#262630] shrink-0"><IconPayments /></span>
                  <div className="flex-1 min-w-0">
                    <p className="font-['DM_Sans:Bold',sans-serif] font-bold text-[#262630] text-[15px]" style={{ fontVariationSettings: '"opsz" 14' }}>Visa •••• 4242</p>
                    <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-55 text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>Expires 12/26</p>
                  </div>
                </button>

                <button
                  onClick={() => setMethod("bank")}
                  data-ux-id="payment-method-bank"
                  className={`flex items-center gap-[14px] rounded-[8px] border px-[18px] py-[16px] text-left transition-colors ${method === "bank" ? "border-[#247ae4] bg-[#eef5fe]" : "border-[#e1e9ef] bg-white hover:border-[#c8d9e6]"}`}
                >
                  <div className={`shrink-0 w-[20px] h-[20px] rounded-full border-2 flex items-center justify-center ${method === "bank" ? "border-[#247ae4]" : "border-[#c8d9e6]"}`}>
                    {method === "bank" && <div className="w-[10px] h-[10px] rounded-full bg-[#247ae4]" />}
                  </div>
                  <span className="text-[#262630] shrink-0"><IconBank /></span>
                  <div className="flex-1 min-w-0">
                    <p className="font-['DM_Sans:Bold',sans-serif] font-bold text-[#262630] text-[15px]" style={{ fontVariationSettings: '"opsz" 14' }}>Bank •••• 2363</p>
                    <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-55 text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>Checking Account</p>
                  </div>
                </button>

                <div className="flex flex-col md:flex-row gap-[10px] w-full">
                  <button
                    onClick={() => setStep("new-card-form")}
                    data-ux-id="payment-method-new-card"
                    className={`flex-1 min-w-0 flex items-center gap-[10px] rounded-[8px] border px-[12px] py-[16px] text-left transition-colors ${method === "new-card" ? "border-[#247ae4] bg-[#eef5fe]" : "border-[#e1e9ef] bg-white hover:border-[#c8d9e6]"}`}
                  >
                    <div className="bg-[#e7f0fc] rounded-[8px] size-[30px] flex items-center justify-center shrink-0 text-[#247ae4]">
                      <IconPayments />
                    </div>
                    <p className="flex-1 min-w-0 font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[15px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>Add New Card</p>
                  </button>

                  <button
                    onClick={() => setStep("new-bank-form")}
                    data-ux-id="payment-method-new-bank"
                    className={`flex-1 min-w-0 flex items-center gap-[10px] rounded-[8px] border px-[12px] py-[16px] text-left transition-colors ${method === "new-bank" ? "border-[#247ae4] bg-[#eef5fe]" : "border-[#e1e9ef] bg-white hover:border-[#c8d9e6]"}`}
                  >
                    <div className="bg-[#e3f5ea] rounded-[8px] size-[30px] flex items-center justify-center shrink-0 text-[#1f9254]">
                      <IconBank />
                    </div>
                    <p className="flex-1 min-w-0 font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[15px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>Add Bank Account</p>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Payment Amount */}
          {!methodExpanded && (
          <div className="flex flex-col gap-[10px]">
            <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[15px]" style={{ fontVariationSettings: '"opsz" 14' }}>
              Payment Amount
            </p>

            <button
              onClick={() => setAmountOption("balance")}
              data-ux-id="payment-amount-balance"
              className={`flex items-center gap-[14px] rounded-[8px] border px-[18px] py-[16px] text-left transition-colors ${amountOption === "balance" ? "border-[#247ae4] bg-[#eef5fe]" : "border-[#e1e9ef] bg-white hover:border-[#c8d9e6]"}`}
            >
              <div className={`shrink-0 w-[20px] h-[20px] rounded-full border-2 flex items-center justify-center ${amountOption === "balance" ? "border-[#247ae4]" : "border-[#c8d9e6]"}`}>
                {amountOption === "balance" && <div className="w-[10px] h-[10px] rounded-full bg-[#247ae4]" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[15px]" style={{ fontVariationSettings: '"opsz" 14' }}>Current Balance</p>
                <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] text-[20px]" style={{ fontVariationSettings: '"opsz" 14' }}>{currentBalance}</p>
              </div>
            </button>

            <div
              data-ux-id="payment-amount-other"
              className={`rounded-[8px] border transition-colors ${amountOption === "other" ? "border-[#247ae4] bg-[#eef5fe]" : "border-[#e1e9ef] bg-white hover:border-[#c8d9e6]"}`}
            >
              <button
                type="button"
                onClick={() => setAmountOption("other")}
                className="w-full flex items-center gap-[14px] px-[18px] py-[16px] text-left"
              >
                <div className={`shrink-0 w-[20px] h-[20px] rounded-full border-2 flex items-center justify-center ${amountOption === "other" ? "border-[#247ae4]" : "border-[#c8d9e6]"}`}>
                  {amountOption === "other" && <div className="w-[10px] h-[10px] rounded-full bg-[#247ae4]" />}
                </div>
                <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[15px]" style={{ fontVariationSettings: '"opsz" 14' }}>Other Amount</p>
              </button>

              {amountOption === "other" && (
                <div className="px-[18px] pb-[16px] flex flex-col gap-[6px]">
                  <label className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] opacity-70 text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                    Enter Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-[14px] top-1/2 -translate-y-1/2 font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] text-[15px]" style={{ fontVariationSettings: '"opsz" 14' }}>$</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={otherAmount}
                      onChange={(e) => setOtherAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                      placeholder="0.00"
                      data-ux-id="payment-amount-other-input"
                      className="w-full h-[44px] rounded-[8px] border border-[#cfd3da] bg-white pl-[26px] pr-[14px] font-['DM_Sans:Regular',sans-serif] font-normal text-[15px] text-[#262630] outline-none focus:border-[#247ae4] focus:ring-2 focus:ring-[#247ae4]/15"
                      style={{ fontVariationSettings: '"opsz" 14' }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          )}
        </div>
        ) : (
        <div className="px-[28px] py-[22px] flex flex-col gap-[22px] overflow-y-auto">
          {/* Review Payment Details */}
          <div className="flex flex-col gap-[14px]">
            <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[15px]" style={{ fontVariationSettings: '"opsz" 14' }}>
              Review Payment Details
            </p>

            <div data-ux-id="payment-review-summary" className="bg-[#f4f6f8] rounded-[14px] p-[20px] flex flex-col gap-[16px]">
              <div className="flex items-center justify-between">
                <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-55 text-[15px]" style={{ fontVariationSettings: '"opsz" 14' }}>Payment Amount</p>
                <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] text-[17px]" style={{ fontVariationSettings: '"opsz" 14' }}>{paymentAmount}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-55 text-[15px]" style={{ fontVariationSettings: '"opsz" 14' }}>Payment Method</p>
                <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] text-[17px]" style={{ fontVariationSettings: '"opsz" 14' }}>{methodLabel}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-55 text-[15px]" style={{ fontVariationSettings: '"opsz" 14' }}>Processing Fee</p>
                <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] text-[17px]" style={{ fontVariationSettings: '"opsz" 14' }}>{processingFee}</p>
              </div>
              <div className="w-full h-px bg-[#dde3e8]" />
              <div className="flex items-center justify-between">
                <p className="font-['DM_Sans:Bold',sans-serif] font-bold text-[#262630] text-[19px]" style={{ fontVariationSettings: '"opsz" 14' }}>Total Charge</p>
                <p className="font-['DM_Sans:Bold',sans-serif] font-bold text-[#262630] text-[19px]" style={{ fontVariationSettings: '"opsz" 14' }}>{paymentAmount}</p>
              </div>
            </div>
          </div>

          <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#6a7282] text-[13px] text-center leading-[1.5]" style={{ fontVariationSettings: '"opsz" 14' }}>
            By clicking Confirm Payment you consent to the payment conditions for your payment selection as described on the{" "}
            <span className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#247ae4]" style={{ fontVariationSettings: '"opsz" 14' }}>payment disclosure</span>{" "}
            page
          </p>
        </div>
        )}

        {/* Footer */}
        {step !== "confirmation" && step !== "autopay-confirmation" && (
          <div className="px-[28px] pb-[26px] pt-[4px] shrink-0 flex gap-[14px]">
            {step === "form" ? (
              methodExpanded ? (
                <button
                  onClick={() => setMethodExpanded(false)}
                  data-ux-id="payment-modal-use-payment-method-button"
                  className="w-full bg-[#247ae4] hover:bg-[#1a6ed0] transition-colors text-white rounded-[10px] px-[22px] py-[13px] font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[16px]"
                  style={{ fontVariationSettings: '"opsz" 14' }}
                >
                  Use this Payment Method
                </button>
              ) : (
                <button
                  onClick={() => setStep("review")}
                  data-ux-id="payment-modal-continue-button"
                  data-vt-name={VT.PaymentModalContinueBtn}
                  className="w-full bg-[#247ae4] hover:bg-[#1a6ed0] transition-colors text-white rounded-[10px] px-[22px] py-[13px] font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[16px]"
                  style={{ fontVariationSettings: '"opsz" 14' }}
                >
                  Continue
                </button>
              )
            ) : step === "new-card-form" ? (
              <>
                <button
                  onClick={() => setStep("form")}
                  data-ux-id="payment-modal-new-card-back-button"
                  className="flex-1 bg-[#f3f4f6] hover:bg-[#e8eaed] transition-colors text-[#262630] rounded-[10px] px-[22px] py-[13px] font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[16px]"
                  style={{ fontVariationSettings: '"opsz" 14' }}
                >
                  Back
                </button>
                <button
                  onClick={() => { setMethod("new-card"); setMethodExpanded(false); setStep("form"); }}
                  data-ux-id="payment-modal-new-card-save-button"
                  className="flex-1 bg-[#247ae4] hover:bg-[#1a6ed0] transition-colors text-white rounded-[10px] px-[22px] py-[13px] font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[16px]"
                  style={{ fontVariationSettings: '"opsz" 14' }}
                >
                  Save
                </button>
              </>
            ) : step === "new-bank-form" ? (
              <>
                <button
                  onClick={() => setStep("form")}
                  data-ux-id="payment-modal-new-bank-back-button"
                  className="flex-1 bg-[#f3f4f6] hover:bg-[#e8eaed] transition-colors text-[#262630] rounded-[10px] px-[22px] py-[13px] font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[16px]"
                  style={{ fontVariationSettings: '"opsz" 14' }}
                >
                  Back
                </button>
                <button
                  onClick={() => { setMethod("new-bank"); setMethodExpanded(false); setStep("form"); }}
                  data-ux-id="payment-modal-new-bank-save-button"
                  className="flex-1 bg-[#247ae4] hover:bg-[#1a6ed0] transition-colors text-white rounded-[10px] px-[22px] py-[13px] font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[16px]"
                  style={{ fontVariationSettings: '"opsz" 14' }}
                >
                  Save
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setStep("form")}
                  data-ux-id="payment-modal-back-button"
                  className="flex-1 bg-[#f3f4f6] hover:bg-[#e8eaed] transition-colors text-[#262630] rounded-[10px] px-[22px] py-[13px] font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[16px]"
                  style={{ fontVariationSettings: '"opsz" 14' }}
                >
                  Back
                </button>
                <button
                  onClick={() => setStep("confirmation")}
                  data-ux-id="payment-modal-confirm-button"
                  data-vt-name={VT.PaymentModalConfirmBtn}
                  className="flex-1 bg-[#247ae4] hover:bg-[#1a6ed0] transition-colors text-white rounded-[10px] px-[22px] py-[13px] font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[16px]"
                  style={{ fontVariationSettings: '"opsz" 14' }}
                >
                  Confirm Payment
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Dashboard Page ─── */
/** The homeowner's balance until they pay it (the Payments scene does). */
const BALANCE_DUE = 425;

function formatUsd(amount: number): string {
  return amount.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function DashboardPage({ onNavigate, onOpenSidebar, view, loads, balanceDue, onPay }: { onNavigate: (page: Page) => void; onOpenSidebar: () => void; view: DashboardView; loads: boolean; balanceDue: number; onPay: (amount: string) => void }) {
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const loading = usePageLoad(loads);
  const currentBalance = formatUsd(balanceDue);
  return (
    <div data-ux-id="dashboard-page" data-vt-name={VT.DashboardPage} className="flex-1 min-w-0 h-full overflow-y-auto" style={{ overflowAnchor: "none" }}>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-[16px] py-[14px] bg-white border-b border-[#d9ecf8] shrink-0">
        <button onClick={onOpenSidebar} data-ux-id="dashboard-mobile-menu-button" className="w-[36px] h-[36px] flex items-center justify-center rounded-[8px] hover:bg-[#f0f5fa] transition-colors" aria-label="Open menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M3 12h18M3 18h18" stroke="#262630" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
        <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[17px]" style={{ fontVariationSettings: '"opsz" 14' }}>Dashboard</p>
        <div className="w-[36px]" />
      </div>

      {loading ? (
        <PageLoader uxId="dashboard-loader" />
      ) : (
        <div className="flex flex-col gap-[24px] md:gap-[32px] w-full max-w-[1280px] mx-auto pb-[44px] pt-[20px] md:pt-[31px] px-[16px] md:px-[44px] min-w-0 animate-[page-content-in_300ms_ease-out]">
          {/* Header — desktop only */}
          <div className="hidden md:flex items-center justify-between w-full shrink-0">
            <div className="flex flex-col flex-1 min-w-0">
              <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[28px] leading-normal" style={{ fontVariationSettings: '"opsz" 14' }}>
                Dashboard
              </p>
              <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-70 text-[16px] leading-normal" style={{ fontVariationSettings: '"opsz" 14' }}>
                The latest and greatest from your community
              </p>
            </div>
            <AddressCard />
          </div>

          {/* Election Alert Banner */}
          <div data-ux-id="election-banner" className="bg-white rounded-[14px] md:rounded-[18px] shadow-[0px_2px_18px_0px_rgba(18,17,48,0.07)] w-full shrink-0 flex items-center">
            <div className="flex gap-[10px] items-start md:items-center px-[16px] md:px-[26px] py-[14px] md:py-[20px] w-full">
              <span className="text-[#247ae4] shrink-0 mt-[2px] md:mt-0"><IconBell width={14} height={14} /></span>
              <p className="flex-1 font-['DM_Sans:Regular',sans-serif] font-normal text-[14px] md:text-[15px] min-w-0 leading-snug" style={{ fontVariationSettings: '"opsz" 14' }}>
                <span className="text-[#262630]">You have </span>
                <span>a upcoming board election. Go to the </span>
                <button onClick={() => onNavigate("elections")} data-ux-id="election-banner-link" className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#247ae4] underline underline-offset-2 cursor-pointer" style={{ fontVariationSettings: '"opsz" 14' }}>Elections</button>
                {" "}
                <span>page to submit your vote.</span>
              </p>
            </div>
          </div>

          {/* Board Actions widget — board member view only */}
          {view === "board" && <BoardTasksWidget />}

          {/* Payments + Transactions row */}
          <div className="flex flex-col md:flex-row gap-[20px] md:gap-[32px] w-full shrink-0">
            {/* Payments widget */}
            <div
              data-ux-id="payments-widget"
              data-vt-name={VT.PaymentsWidget}
              className="bg-white rounded-[18px] border border-[#d9e7f0] drop-shadow-[0px_2px_9px_rgba(18,17,48,0.07)] flex-1 min-w-0"
            >
              <div className="flex flex-col gap-[14px] pb-[18px] pt-[20px] md:pt-[24px] px-[16px] md:px-[26px]">
                <div className="flex items-center justify-between w-full gap-[8px]">
                  <p className="flex-1 font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[20px] leading-normal min-w-0" style={{ fontVariationSettings: '"opsz" 14' }}>Payments</p>
                  <div className="flex gap-[6px] items-center text-right shrink-0">
                    <p className="font-['DM_Sans:Medium',sans-serif] font-medium text-[13px] md:text-[15px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>Account #: 4329980</p>
                    <span className="text-[14px]"><IconChevronDown /></span>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-[16px] md:gap-[22px] w-full">
                  <div className="flex flex-row md:flex-col gap-[20px] md:gap-[20px] flex-1 min-w-0 justify-between md:justify-start">
                    <div>
                      <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[28px] md:text-[34px] leading-normal" style={{ fontVariationSettings: '"opsz" 14' }}>{currentBalance}</p>
                      <div className="flex gap-[4px] items-center text-[14px]">
                        <p className="font-['DM_Sans:Regular',sans-serif] font-normal opacity-62 text-[#262630] text-[13px] md:text-[14px]" style={{ fontVariationSettings: '"opsz" 14' }}>Current Balance</p>
                        <span className="text-[#262630]"><IconQuestion /></span>
                      </div>
                    </div>
                    <div>
                      <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[22px] md:text-[24px] leading-normal" style={{ fontVariationSettings: '"opsz" 14' }}>$0.00</p>
                      <div className="flex gap-[4px] items-center text-[14px]">
                        <p className="font-['DM_Sans:Regular',sans-serif] font-normal opacity-62 text-[#262630] text-[13px] md:text-[14px]" style={{ fontVariationSettings: '"opsz" 14' }}>Upcoming Charges</p>
                        <span className="text-[#262630]"><IconQuestion /></span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-[12px] md:gap-[22px] md:items-end pb-0 md:pb-[11px] md:pt-[14px] md:shrink-0">
                    <button onClick={() => setPaymentModalOpen(true)} data-ux-id="payments-make-payment-button" data-vt-name={VT.PaymentsMakePaymentBtn} className="bg-[#247ae4] flex items-center justify-center px-[24px] py-[10px] rounded-[8px] hover:bg-[#1a6ed0] transition-colors w-full md:w-auto">
                      <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-white text-[16px] text-center whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>Make a Payment</span>
                    </button>
                    <div className="flex flex-row md:flex-col gap-[16px] md:gap-[10px] md:items-end items-center">
                      <div className="flex gap-[7px] items-center">
                        <div data-ux-id="payments-autopay-toggle" className="bg-[#b8bec5] rounded-[8px] w-[34px] h-[18px] flex items-center px-[2px] shrink-0">
                          <div className="bg-white rounded-[6px] w-[14px] h-[14px]" />
                        </div>
                        <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[13px] md:text-[14px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>Enroll in AutoPay</span>
                      </div>
                      <p data-ux-id="payments-manage-payments-link" className="font-['DM_Sans:Medium',sans-serif] font-medium text-[#247ae4] text-[13px] md:text-[14px] whitespace-nowrap cursor-pointer hover:underline" style={{ fontVariationSettings: '"opsz" 14' }}>Manage payments</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Transactions widget */}
            <div data-ux-id="transactions-widget" className="bg-white rounded-[18px] drop-shadow-[0px_2px_9px_rgba(18,17,48,0.07)] flex-1 min-w-0">
              <div className="flex flex-col gap-[24px] px-[16px] md:px-[26px] py-[20px] md:py-[24px]">
                <div className="flex gap-[14px] items-start w-full">
                  <p className="flex-1 font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[20px] leading-normal min-w-0" style={{ fontVariationSettings: '"opsz" 14' }}>Recent Transactions</p>
                  <div data-ux-id="transactions-view-all-link" className="flex gap-[7px] items-center text-[#0d5bba] text-[14px] whitespace-nowrap cursor-pointer">
                    <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold" style={{ fontVariationSettings: '"opsz" 14' }}>View All</span>
                    <IconChevronRight />
                  </div>
                </div>
                <div className="w-full flex flex-col gap-[11px]">
                  {[
                    { date: "Sep 5, 2026", desc: "Monthly HOA Fee", amount: "$425.00" },
                    { date: "Aug 5, 2026", desc: "Monthly HOA Fee", amount: "$425.00" },
                    { date: "Jul 5, 2026", desc: "Monthly HOA Fee", amount: "$425.00" },
                  ].map((tx, i) => (
                    <div key={i} data-ux-id={`transactions-row-${tx.date.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>
                      <div className="flex gap-[22px] items-center w-full">
                        <div className="flex items-start opacity-65 w-[70px] shrink-0">
                          <p className="font-['DM_Sans:Medium',sans-serif] font-medium text-[#262630] text-[12px] leading-normal whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>{tx.date}</p>
                        </div>
                        <p className="flex-1 font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[15px] leading-normal min-w-0" style={{ fontVariationSettings: '"opsz" 14' }}>{tx.desc}</p>
                        <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] text-[13px] w-[32px]" style={{ fontVariationSettings: '"opsz" 14' }}>PAID</p>
                        <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[16px] text-right whitespace-nowrap w-[67px]" style={{ fontVariationSettings: '"opsz" 14' }}>{tx.amount}</p>
                      </div>
                      {i < 2 && <div className="bg-[#d9d9d9] h-px w-full mt-[11px]" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Community Feed widget */}
          <div data-ux-id="dashboard-community-feed-widget" className="bg-white rounded-[18px] drop-shadow-[0px_2px_9px_rgba(18,17,48,0.07)] w-full shrink-0">
            <div className="flex flex-col gap-[18px] md:gap-[22px] px-[16px] md:px-[26px] py-[20px] md:py-[24px]">
              <div className="flex gap-[14px] items-center w-full">
                <p className="flex-1 font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[20px] leading-normal min-w-0" style={{ fontVariationSettings: '"opsz" 14' }}>Community Feed</p>
                <button onClick={() => onNavigate("community")} data-ux-id="dashboard-community-feed-view-all-link" data-vt-name={VT.DashboardFeedViewAll} className="flex gap-[7px] items-center text-[#0d5bba] text-[14px] whitespace-nowrap cursor-pointer">
                  <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold" style={{ fontVariationSettings: '"opsz" 14' }}>View All Posts</span>
                  <IconChevronRight />
                </button>
              </div>
              <div className="flex flex-col gap-[18px] md:gap-[22px]">
                {initialCommunityPosts
                  .filter((post) => post.image && post.links && post.links.length > 0)
                  .slice(0, 2)
                  .map((post, i, arr) => (
                    <div key={post.id}>
                      <div data-ux-id={`dashboard-community-feed-post-${post.id}`} className="flex gap-[14px] md:gap-[18px] items-start w-full">
                        <img
                          src={post.image}
                          alt={post.imageAlt ?? ""}
                          className="w-[120px] h-[90px] md:w-[160px] md:h-[110px] rounded-[12px] object-cover shrink-0"
                          style={{ objectPosition: post.imagePosition }}
                        />
                        <div className="flex flex-col gap-[6px] min-w-0 flex-1">
                          <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[15px] leading-[1.25]" style={{ fontVariationSettings: '"opsz" 14' }}>
                            {post.title}
                          </p>
                          <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-65 text-[13px] leading-[1.4] line-clamp-2" style={{ fontVariationSettings: '"opsz" 14' }}>
                            {post.body}
                          </p>
                          {post.links && post.links.length > 0 && (
                            <div className="flex flex-wrap gap-[7px] mt-[2px]">
                              {post.links.map((link, linkIdx) => (
                                <a
                                  key={link.href}
                                  href={link.href}
                                  target="_blank"
                                  rel="noreferrer"
                                  data-ux-id={`dashboard-community-feed-post-${post.id}-link-${linkIdx}`}
                                  className="max-w-full truncate rounded-full bg-[#e8f1f6] px-[12px] py-[5px] font-['DM_Sans:SemiBold',sans-serif] text-[12px] font-semibold leading-[1.2] text-[#262630] transition-colors hover:bg-[#d9eaf3] hover:text-[#247ae4]"
                                >
                                  {link.label}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      {i < arr.length - 1 && <div className="bg-[#d9d9d9] h-px w-full mt-[18px] md:mt-[22px]" />}
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Inbox widget */}
          <div data-ux-id="inbox-widget" className="bg-white rounded-[18px] drop-shadow-[0px_2px_9px_rgba(18,17,48,0.07)] w-full shrink-0">
            <div className="flex flex-col gap-[20px] md:gap-[24px] px-[16px] md:px-[26px] py-[20px] md:py-[24px]">
              <div className="flex gap-[14px] items-center w-full">
                <p className="flex-1 font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[20px] leading-normal min-w-0" style={{ fontVariationSettings: '"opsz" 14' }}>Inbox</p>
                <div data-ux-id="inbox-view-all-link" className="flex gap-[7px] items-center text-[#0d5bba] text-[14px] whitespace-nowrap cursor-pointer">
                  <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold" style={{ fontVariationSettings: '"opsz" 14' }}>View All</span>
                  <IconChevronRight />
                </div>
              </div>
              {/* Filter chips */}
              <div className="flex flex-wrap gap-[9px] items-center">
                <div data-ux-id="inbox-filter-all" className="bg-[#247ae4] rounded-[50px] flex items-center gap-[10px] pl-[15px] pr-[7px] py-[8px]">
                  <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-white text-[14px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>All</span>
                  <div className="bg-[rgba(255,255,255,0.3)] rounded-[50px] size-[19px] flex items-center justify-center">
                    <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-white text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>21</span>
                  </div>
                </div>
                <div data-ux-id="inbox-filter-needs-attention" className="bg-[#fff0dd] rounded-[50px] flex items-center gap-[10px] pl-[15px] pr-[7px] py-[8px]">
                  <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[14px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>Needs Attention</span>
                  <div className="bg-[#f17d11] rounded-[50px] size-[19px] flex items-center justify-center">
                    <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-white text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>3</span>
                  </div>
                </div>
                <div data-ux-id="inbox-filter-announcements" className="bg-[#dfeaf0] rounded-[50px] flex items-center gap-[10px] pl-[15px] pr-[7px] py-[8px]">
                  <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[14px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>Announcements</span>
                  <div className="bg-white rounded-[50px] size-[19px] flex items-center justify-center">
                    <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>5</span>
                  </div>
                </div>
                <div data-ux-id="inbox-filter-messages" className="bg-[#dfeaf0] rounded-[50px] flex items-center gap-[10px] pl-[15px] pr-[7px] py-[8px]">
                  <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[14px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>Messages</span>
                  <div className="bg-white rounded-[50px] size-[19px] flex items-center justify-center">
                    <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>3</span>
                  </div>
                </div>
              </div>
              {/* Inbox rows */}
              <div className="w-full border-t border-[#d9d9d9]">
                {INBOX_WIDGET_MESSAGES.map((msg, i) => (
                  <div key={i} data-ux-id={`inbox-row-${msg.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`} className="border-b border-[#d9d9d9] flex items-center cursor-pointer hover:bg-[#f9fbfd]">
                    <div className="flex gap-[12px] md:gap-[29px] items-center px-[14px] md:px-[22px] py-[12px] md:py-[14px] w-full">
                      <div className="shrink-0 size-[8px]">
                        {msg.unread && (
                          <svg data-ux-id="inbox-row-unread-dot" width="8" height="8" viewBox="0 0 8 8" fill="none">
                            <circle cx="4" cy="4" r="4" fill="#247AE4"/>
                          </svg>
                        )}
                      </div>
                      <p
                        className={`text-[13px] md:text-[14px] w-[80px] md:w-[120px] shrink-0 ${msg.unread ? "font-['DM_Sans:Medium',sans-serif] font-medium" : "font-['DM_Sans:Regular',sans-serif] font-normal opacity-70"}`}
                        style={{ fontVariationSettings: '"opsz" 14' }}
                      >
                        {msg.type}
                      </p>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="flex gap-[3px] items-center text-[14px] whitespace-nowrap overflow-hidden">
                          <span
                            className={`shrink-0 ${msg.unread ? "font-['DM_Sans:Bold',sans-serif] font-bold" : "font-['DM_Sans:Regular',sans-serif] font-normal opacity-70"}`}
                            style={{ fontVariationSettings: '"opsz" 14' }}
                          >
                            {msg.title}
                          </span>
                          <span className="opacity-70 overflow-hidden text-ellipsis flex-1 min-w-0 font-['DM_Sans:Regular',sans-serif]" style={{ fontVariationSettings: '"opsz" 14' }}>
                            {" -- "}{msg.preview}
                          </span>
                        </div>
                      </div>
                      <div className="hidden md:flex shrink-0 w-[80px] items-center justify-end">
                        {msg.tagBg !== "transparent" ? (
                          <div className="rounded-[50px] px-[10px] py-[2px]" style={{ backgroundColor: msg.tagBg }}>
                            <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[13px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>{msg.tag}</span>
                          </div>
                        ) : (
                          <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[13px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>{msg.tag}</span>
                        )}
                      </div>
                      <p
                        className={`hidden md:block text-[14px] w-[50px] shrink-0 ${msg.unread ? "font-['DM_Sans:Bold',sans-serif] font-bold" : "font-['DM_Sans:Regular',sans-serif] font-normal opacity-70"}`}
                        style={{ fontVariationSettings: '"opsz" 14' }}
                      >
                        {msg.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {paymentModalOpen && (
        <PaymentModal onClose={() => setPaymentModalOpen(false)} onPaid={onPay} currentBalance={currentBalance} />
      )}
    </div>
  );
}

/* ─── Completed Election Results Card ─── */
function CompletedElectionCard({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const results = {
    title: "2025 Board of Directors Election",
    votingPeriod: "Aug 28 – Sep 15, 2026",
    certifiedDate: "September 17, 2025",
    quorum: { required: 86, achieved: 143, total: 214 },
    ballotsTotal: 143,
    ballotsRejected: 4,
    ballotsValid: 139,
    turnoutPct: 67,
    elected: [
      { name: "Patricia Nguyen", initials: "PN", color: "#247ae4", votes: 118, votePct: 85, role: "Board Director — 2-year term" },
      { name: "Robert Castillo", initials: "RC", color: "#1b8c5a", votes: 97, votePct: 70, role: "Board Director — 2-year term" },
    ],
    runners: [
      { name: "Angela Morrison", initials: "AM", color: "#9b59b6", votes: 62, votePct: 45 },
      { name: "David Park", initials: "DP", color: "#e67e22", votes: 41, votePct: 30 },
    ],
    committee: {
      name: "Waterfront Community Estates Elections Committee",
      members: ["Linda Farrow, Chair", "James Tran", "Priya Mehta"],
      statement: "We, the undersigned members of the Elections Committee, certify that this election was conducted in accordance with the Association's Bylaws and Florida Statute §720. All ballots were verified, counted, and tabulated under independent oversight. The results above are true and accurate to the best of our knowledge.",
    },
  };

  return (
    <div data-ux-id="election-results-card" className="w-full bg-white rounded-[18px] border border-[#d9e7f0] drop-shadow-[0px_2px_9px_rgba(18,17,48,0.07)] shrink-0">
      <div className={`px-[16px] md:px-[26px] pt-[20px] md:pt-[24px] flex flex-col gap-[20px] md:gap-[24px] ${collapsed ? "pb-[20px] md:pb-[24px]" : "pb-[24px] md:pb-[28px]"}`}>

        {/* Header */}
        <div className="flex flex-col gap-[6px]">
          <div className="flex items-center gap-[10px]">
            <span className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-60 text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>
              Voting period {results.votingPeriod}
            </span>
            <div className="bg-[#dfeaf0] rounded-[50px] px-[12px] py-[5px] flex items-center shrink-0">
              <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[13px] leading-[19.5px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>Closed</span>
            </div>
          </div>
          <div className="flex items-start justify-between gap-[12px]">
            <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[20px] leading-normal flex-1 min-w-0" style={{ fontVariationSettings: '"opsz" 14' }}>
              {results.title}
            </p>
            <CollapseButton collapsed={collapsed} onToggle={onToggle} uxId="election-results-collapse-button" />
          </div>
          {!collapsed && (
            <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-65 text-[14px]" style={{ fontVariationSettings: '"opsz" 14' }}>
              Official results certified {results.certifiedDate}. Two board seats were contested by four candidates.
            </p>
          )}
        </div>

        {/* Summary stats row */}
        {!collapsed && <div className="grid grid-cols-2 md:grid-cols-4 gap-[12px]">
          {[
            {
              label: "Ballots Cast", value: results.ballotsTotal.toString(), sub: `${results.turnoutPct}% turnout`,
              icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4M7 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2M9 4h6a1 1 0 010 2H9a1 1 0 010-2z" stroke="#247ae4" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/></svg>,
            },
            {
              label: "Valid Ballots", value: results.ballotsValid.toString(), sub: `${results.ballotsRejected} rejected`,
              icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#1b8c5a" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/></svg>,
            },
            {
              label: "Quorum", value: "Met", sub: `${results.quorum.achieved} of ${results.quorum.required} required`,
              icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="#7c3aed" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/></svg>,
            },
            {
              label: "Total Units", value: results.quorum.total.toString(), sub: "eligible voters",
              icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="#ea8c1e" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 22V12h6v10" stroke="#ea8c1e" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/></svg>,
            },
          ].map((stat) => (
            <div key={stat.label} data-ux-id={`election-results-stat-${stat.label.toLowerCase().replace(/\s+/g, "-")}`} className="bg-[#f8fafc] rounded-[12px] px-[16px] py-[14px] flex flex-col gap-[4px]">
              <div className="flex items-center gap-[6px] mb-[2px]">
                <span className="opacity-80">{stat.icon}</span>
                <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-55 text-[11px] uppercase tracking-wide" style={{ fontVariationSettings: '"opsz" 14' }}>{stat.label}</p>
              </div>
              <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[22px] leading-tight" style={{ fontVariationSettings: '"opsz" 14' }}>{stat.value}</p>
              <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-50 text-[12px]" style={{ fontVariationSettings: '"opsz" 14' }}>{stat.sub}</p>
            </div>
          ))}
        </div>}

        {/* Quorum status bar */}
        {!collapsed && <div className="flex flex-col gap-[8px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-[8px]">
              <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>Quorum Status</p>
              <div className="flex items-center gap-[5px] bg-[#dcfce7] rounded-[50px] px-[9px] py-[3px]">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#166534] text-[11px]" style={{ fontVariationSettings: '"opsz" 14' }}>Achieved</span>
              </div>
            </div>
            <p className="hidden md:block font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-60 text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>
              <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] opacity-100">{results.quorum.achieved}</span> ballots · {results.quorum.required} minimum required
            </p>
          </div>
          <div className="w-full h-[8px] bg-[#e8eff5] rounded-full overflow-hidden">
            <div className="h-full bg-[#1b8c5a] rounded-full" style={{ width: `${Math.round((results.quorum.achieved / results.quorum.total) * 100)}%` }} />
          </div>

          <p className="md:hidden font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-60 text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>
            <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] opacity-100">{results.quorum.achieved}</span> ballots · {results.quorum.required} minimum required
          </p>
        </div>}

        {/* Elected candidates — full row, 2 cards */}
        {!collapsed && <div className="flex flex-col gap-[10px]">
          <div className="flex items-center gap-[8px]">
            <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>Elected Candidates</p>
            <span className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-45 text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>— 2 seats</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px]">
            {results.elected.map((c) => (
              <div key={c.name} data-ux-id={`election-results-elected-${c.name.toLowerCase().replace(/\s+/g, "-")}`} className="border border-[#bbf7d0] bg-[#f0fdf4] rounded-[14px] px-[16px] py-[14px] flex flex-col gap-[10px]">
                <div className="flex items-center gap-[12px]">
                  <div className="w-[36px] h-[36px] rounded-full flex items-center justify-center shrink-0 text-white font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[13px]" style={{ backgroundColor: c.color, fontVariationSettings: '"opsz" 14' }}>
                    {c.initials}
                  </div>
                  <div className="flex flex-col gap-[1px] flex-1 min-w-0">
                    <div className="flex items-center gap-[6px]">
                      <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[14px]" style={{ fontVariationSettings: '"opsz" 14' }}>{c.name}</p>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#16a34a"/><path d="M7 12.5l3.5 3.5 6-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#166534] opacity-80 text-[11px]" style={{ fontVariationSettings: '"opsz" 14' }}>{c.role}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-[4px]">
                  <div className="flex items-center justify-between">
                    <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[16px]" style={{ fontVariationSettings: '"opsz" 14' }}>{c.votes} <span className="text-[12px] font-normal opacity-55">votes</span></p>
                    <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#1b8c5a] text-[11px]" style={{ fontVariationSettings: '"opsz" 14' }}>{c.votePct}%</p>
                  </div>
                  <div className="w-full h-[6px] bg-[#d1fae5] rounded-full overflow-hidden">
                    <div className="h-full bg-[#16a34a] rounded-full" style={{ width: `${c.votePct}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>}

        {/* Other candidates — full row, 2 cards */}
        {!collapsed && <div className="flex flex-col gap-[10px]">
          <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>Other Candidates</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px]">
            {results.runners.map((c) => (
              <div key={c.name} data-ux-id={`election-results-runner-${c.name.toLowerCase().replace(/\s+/g, "-")}`} className="border border-[#e8eff5] bg-white rounded-[12px] px-[16px] py-[14px] flex flex-col gap-[10px]">
                <div className="flex items-center gap-[12px]">
                  <div className="w-[36px] h-[36px] rounded-full flex items-center justify-center shrink-0 text-white font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[13px] opacity-60" style={{ backgroundColor: c.color, fontVariationSettings: '"opsz" 14' }}>
                    {c.initials}
                  </div>
                  <p className="font-['DM_Sans:Medium',sans-serif] font-medium text-[#262630] opacity-70 text-[14px] flex-1 min-w-0" style={{ fontVariationSettings: '"opsz" 14' }}>{c.name}</p>
                </div>
                <div className="flex flex-col gap-[4px]">
                  <div className="flex items-center justify-between">
                    <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] opacity-60 text-[16px]" style={{ fontVariationSettings: '"opsz" 14' }}>{c.votes} <span className="text-[12px] font-normal opacity-70">votes</span></p>
                    <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-40 text-[11px]" style={{ fontVariationSettings: '"opsz" 14' }}>{c.votePct}%</p>
                  </div>
                  <div className="w-full h-[5px] bg-[#e8eff5] rounded-full overflow-hidden">
                    <div className="h-full bg-[#94a3b8] rounded-full" style={{ width: `${c.votePct}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>}

        {/* Ballot breakdown */}
        {!collapsed && <div className="border border-[#e8eff5] rounded-[14px] px-[20px] py-[16px] flex flex-col gap-[10px]">
          <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>Ballot Summary</p>
          <div className="flex flex-col gap-[6px]">
            {[
              { label: "Total ballots cast", value: results.ballotsTotal, highlight: false },
              { label: "Valid ballots counted", value: results.ballotsValid, highlight: false },
              { label: "Rejected / invalid ballots", value: results.ballotsRejected, highlight: true },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between py-[6px] border-b border-[#f1f5f9] last:border-0">
                <p className={`font-['DM_Sans:Regular',sans-serif] font-normal text-[14px] ${row.highlight ? "text-[#b45309]" : "text-[#262630] opacity-70"}`} style={{ fontVariationSettings: '"opsz" 14' }}>{row.label}</p>
                <p className={`font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[14px] ${row.highlight ? "text-[#b45309]" : "text-[#262630]"}`} style={{ fontVariationSettings: '"opsz" 14' }}>{row.value}</p>
              </div>
            ))}
          </div>
          {results.ballotsRejected > 0 && (
            <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#b45309] opacity-80 text-[12px] leading-[1.5]" style={{ fontVariationSettings: '"opsz" 14' }}>
              {results.ballotsRejected} ballots were rejected due to missing signatures or non-matching unit numbers and were not included in the final tally.
            </p>
          )}
        </div>}

        {/* Elections committee certification */}
        {!collapsed && <div className="border border-[#e2eaf0] rounded-[14px] px-[20px] py-[18px] flex flex-col gap-[14px] bg-[#fafcfe]">
          <div className="flex items-start gap-[12px]">
            <div className="w-[34px] h-[34px] rounded-full bg-[#e8f1fd] flex items-center justify-center shrink-0 mt-[1px]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#247ae4" strokeWidth="1.8" strokeLinejoin="round"/>
                <path d="M9 12l2 2 4-4" stroke="#247ae4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="flex flex-col gap-[2px] min-w-0">
              <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[14px]" style={{ fontVariationSettings: '"opsz" 14' }}>{results.committee.name}</p>
              <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-55 text-[12px]" style={{ fontVariationSettings: '"opsz" 14' }}>Certification of Election Results</p>
            </div>
          </div>
          <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-70 text-[13px] leading-[1.65]" style={{ fontVariationSettings: '"opsz" 14' }}>
            {results.committee.statement}
          </p>
          <div className="flex flex-wrap gap-[24px] pt-[16px] border-t border-[#e2eaf0]">
            {results.committee.members.map((member) => (
              <div key={member} className="flex flex-col gap-[6px]">
                <p className="font-['DM_Sans:Medium',sans-serif] font-medium text-[#262630] opacity-60 text-[12px]" style={{ fontVariationSettings: '"opsz" 14' }}>{member}</p>
              </div>
            ))}
          </div>
          <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-40 text-[11px]" style={{ fontVariationSettings: '"opsz" 14' }}>
            Certified {results.certifiedDate} · Waterfront Community Estates, Loxahatchee, FL 33470
          </p>
        </div>}

      </div>
    </div>
  );
}

/* ─── Elections Page ─── */
type CampaignType = "board" | "bylaw" | "budget";
interface Campaign {
  id: string;
  type: CampaignType;
  title: string;
  description: string;
  votingPeriod: string;
  closesDate: string;
  status: "open" | "upcoming" | "closed";
  candidates?: { name: string; role: string; bio: string; initials: string; color: string }[];
  options?: { label: string; description: string }[];
  participation?: { voted: number; total: number };
}

const campaigns: Campaign[] = [
  {
    id: "board-2026",
    type: "board",
    title: "2026 Board of Directors Election",
    description: "4 nominees for 2 board positions. Results will be announced at the September 20th Annual Meeting.",
    votingPeriod: "Aug 28 – Sep 15, 2026",
    closesDate: "Sep 15, 2026",
    status: "open",
    participation: { voted: 87, total: 214 },
    candidates: [
      { name: "Patricia Nguyen", role: "Current Treasurer", bio: "15-year resident with a background in corporate finance. Advocates for transparent budgeting and long-term reserve planning.", initials: "PN", color: "#247ae4" },
      { name: "Robert Castillo", role: "Resident since 2009", bio: "Retired civil engineer passionate about infrastructure improvements, green spaces, and community safety initiatives.", initials: "RC", color: "#1b8c5a" },
      { name: "Angela Morrison", role: "Current Secretary", bio: "Communications professional who has led the community newsletter and digital outreach efforts for three years.", initials: "AM", color: "#9b59b6" },
      { name: "David Park", role: "Resident since 2017", bio: "Software architect and HOA committee volunteer. Interested in modernizing community operations and digital systems.", initials: "DP", color: "#e67e22" },
    ],
  },
  {
    id: "bylaw-2026",
    type: "bylaw",
    title: "Bylaw Amendment — Short-Term Rental Restrictions",
    description: "Proposed amendment to Article VII, Section 4 to prohibit rentals shorter than 30 days and require HOA registration for all rental units.",
    votingPeriod: "Sep 16 – Oct 1, 2026",
    closesDate: "Oct 1, 2026",
    status: "upcoming",
    options: [
      { label: "Yes — Approve the amendment", description: "Adopt the 30-day minimum rental restriction and registration requirement as proposed." },
      { label: "No — Reject the amendment", description: "Keep the existing bylaw language with no changes to rental restrictions." },
    ],
  },
  {
    id: "budget-2026",
    type: "budget",
    title: "FY 2027 Budget Ratification Vote",
    description: "Homeowners vote to ratify the proposed $1.2M operating budget, including a 4.5% assessment increase effective January 1, 2027.",
    votingPeriod: "Oct 5 – Oct 20, 2026",
    closesDate: "Oct 20, 2026",
    status: "upcoming",
    options: [
      { label: "Approve the FY 2027 budget", description: "Ratify the proposed budget including the 4.5% assessment increase." },
      { label: "Reject the FY 2027 budget", description: "Send the budget back to the board for revision before a second vote." },
    ],
  },
];

function CollapseButton({ collapsed, onToggle, uxId = "collapse-button" }: { collapsed: boolean; onToggle: () => void; uxId?: string }) {
  return (
    <button
      onClick={onToggle}
      data-ux-id={uxId}
      className="shrink-0 w-[36px] h-[36px] rounded-full flex items-center justify-center text-[#262630] opacity-35 hover:opacity-70 hover:bg-[#f0f5fa] transition-all"
      aria-label={collapsed ? "Expand section" : "Collapse section"}
    >
      <svg
        width="22" height="22" viewBox="0 0 24 24" fill="none"
        className="transition-transform duration-200"
        style={{ transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)" }}
      >
        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}

function ParticipationBar({ voted, total, uxId = "participation-bar" }: { voted: number; total: number; uxId?: string }) {
  const pct = Math.round((voted / total) * 100);
  return (
    <div data-ux-id={uxId} className="flex flex-col gap-[8px]">
      <div className="flex items-center justify-between">
        <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>
          <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[16px]">{voted}</span>{" of "}{total}{" units voted · "}<span className="text-[#247ae4]">{pct}%</span>
        </p>
        <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>
          {"Quorum: 50% (107 units)"}
        </p>
      </div>
      <div className="w-full h-[8px] bg-[#e8eff5] rounded-full overflow-hidden">
        <div className="h-full bg-[#247ae4] rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ElectionsPage({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const loading = usePageLoad();
  const [ballotSent, setBallotSent] = useState(false);
  const [consentNotices, setConsentNotices] = useState(false);
  const [consentVoting, setConsentVoting] = useState(false);
  const [consentSaved, setConsentSaved] = useState(false);
  const [consentBannerDismissed, setConsentBannerDismissed] = useState(false);
  const [collapsedCards, setCollapsedCards] = useState<Set<string>>(new Set());

  const toggleCard = (id: string) =>
    setCollapsedCards((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const [activeTab, setActiveTab] = useState<"nominations" | "proxy" | "results">("proxy");
  const [showConsentModal, setShowConsentModal] = useState(!consentSaved);
  const daysLeft = 5;

  const tabs: { id: typeof activeTab; label: string }[] = [
    { id: "nominations", label: "Nominations" },
    { id: "proxy", label: "Voting / Campaigns" },
    { id: "results", label: "Results" },
  ];

  return (
    <div data-ux-id="elections-page" className="flex-1 min-w-0 h-full overflow-y-auto">
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-[16px] py-[14px] bg-white border-b border-[#d9ecf8] shrink-0">
        <button onClick={onOpenSidebar} data-ux-id="elections-mobile-menu-button" className="w-[36px] h-[36px] flex items-center justify-center rounded-[8px] hover:bg-[#f0f5fa] transition-colors" aria-label="Open menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M3 12h18M3 18h18" stroke="#262630" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
        <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[17px]" style={{ fontVariationSettings: '"opsz" 14' }}>Governance</p>
        <div className="w-[36px]" />
      </div>

      {loading ? (
        <PageLoader uxId="elections-loader" />
      ) : (
        <div className="flex flex-col gap-[24px] md:gap-[32px] w-full max-w-[1280px] mx-auto pb-[44px] pt-[20px] md:pt-[31px] px-[16px] md:px-[44px] min-w-0 rounded-[6px] animate-[page-content-in_300ms_ease-out]">

          {/* Header — desktop only */}
          <div className="hidden md:flex items-center justify-between w-full shrink-0">
            <div className="flex flex-col flex-1 min-w-0">
              <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[28px] leading-normal" style={{ fontVariationSettings: '"opsz" 14' }}>
                Elections
              </p>
              <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-70 text-[16px] leading-normal" style={{ fontVariationSettings: '"opsz" 14' }}>
                Cast your vote and make your voice heard in the community
              </p>
            </div>
            <AddressCard />
          </div>


          {/* Electronic Consent modal */}
          {showConsentModal && (
            <div
              data-ux-id="elections-consent-modal-backdrop"
              className="fixed inset-0 z-[195] flex items-center justify-center bg-black/40 backdrop-blur-[2px] px-[16px]"
            >
              <div data-ux-id="elections-consent-modal" className="w-full max-w-[560px] bg-white rounded-[20px] shadow-[0_8px_40px_rgba(0,0,0,0.18)] flex flex-col gap-[0px] overflow-hidden">
                {/* Modal header */}
                <div className="px-[28px] pt-[26px] pb-[20px] flex flex-col gap-[2px]">
                  <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[17px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                    Upcoming – 2026 Board of Directors Election
                  </p>
                  <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-55 text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                    Voting open Aug 28 – Sep 15, 2026
                  </p>
                </div>
                <div className="w-full h-px bg-[#e2eaf0]" />
                {/* Modal body */}
                <div className="px-[28px] py-[22px] flex flex-col gap-[18px]">
                  <div className="flex flex-col gap-[4px]">
                    <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[16px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                      Electronic Consent
                    </p>
                    <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-60 text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                      Your association requires consent to send election notices and accept votes electronically.
                    </p>
                    <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[12px] uppercase tracking-wide mt-[6px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                      Review &amp; Agree
                    </p>
                  </div>

                  <div className="flex flex-col gap-[14px]">
                    <label className="flex items-start gap-[14px] cursor-pointer group">
                      <div
                        onClick={() => setConsentNotices(v => !v)}
                        data-ux-id="elections-consent-notices-checkbox"
                        className={`mt-[1px] w-[20px] h-[20px] rounded-[5px] border-2 shrink-0 flex items-center justify-center transition-colors ${consentNotices ? "bg-[#247ae4] border-[#247ae4]" : "bg-white border-[#c8d9e6] group-hover:border-[#247ae4]"}`}
                      >
                        {consentNotices && (
                          <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        )}
                      </div>
                      <div className="flex flex-col gap-[2px] min-w-0" onClick={() => setConsentNotices(v => !v)}>
                        <p className="font-['DM_Sans:Medium',sans-serif] font-medium text-[#262630] text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                          I agree to receive legal notices and documents electronically.
                        </p>
                        <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-55 text-[12px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                          Receive meeting notices, agendas, and ballots via email instead of postal mail.
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-[14px] cursor-pointer group">
                      <div
                        onClick={() => setConsentVoting(v => !v)}
                        data-ux-id="elections-consent-voting-checkbox"
                        className={`mt-[1px] w-[20px] h-[20px] rounded-[5px] border-2 shrink-0 flex items-center justify-center transition-colors ${consentVoting ? "bg-[#247ae4] border-[#247ae4]" : "bg-white border-[#c8d9e6] group-hover:border-[#247ae4]"}`}
                      >
                        {consentVoting && (
                          <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        )}
                      </div>
                      <div className="flex flex-col gap-[2px] min-w-0" onClick={() => setConsentVoting(v => !v)}>
                        <p className="font-['DM_Sans:Medium',sans-serif] font-medium text-[#262630] text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                          I agree to vote and submit proxies electronically for future elections.
                        </p>
                        <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-55 text-[12px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                          Cast your official ballot online. Your vote is encrypted and verified by a neutral third-party.
                        </p>
                      </div>
                    </label>
                  </div>

                  <div className="pt-[2px]">
                    <button
                      onClick={() => { setConsentSaved(true); setShowConsentModal(false); setActiveTab("proxy"); }}
                      data-ux-id="elections-consent-submit-button"
                      className="bg-[#247ae4] hover:bg-[#1a6ed0] transition-colors text-white rounded-[10px] px-[22px] py-[10px] font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[14px]"
                      style={{ fontVariationSettings: '"opsz" 14' }}
                    >
                      Yes, I Consent
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Nominations tab */}
          {activeTab === "nominations" && (
            <div data-ux-id="elections-nominations-card" className="bg-white border border-[#d9e7f0] rounded-[18px] w-full flex items-center justify-between px-[24px] py-[18px] shrink-0">
              <div className="flex flex-col gap-[10px] min-w-0">
                <div className="flex flex-col w-full">
                  <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[16px] leading-[22.5px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                    Want to run in the upcoming elections?
                  </p>
                  <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#4b5563] text-[14px] leading-[22.5px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                    Unit 120A – Waterfront
                  </p>
                </div>
                <div className="flex flex-col w-full">
                  <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] text-[13px] leading-[22.5px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                    Lakestone HOA - Consent Campaign 2026
                  </p>
                  <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] text-[13px] leading-[22.5px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                    <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold" style={{ fontVariationSettings: '"opsz" 14' }}>End Date:</span>
                    {" December 18, 2026 7:00PM ET"}
                  </p>
                </div>
              </div>
              <div className="shrink-0 pl-[24px]">
                <button data-ux-id="elections-nominations-submit-button" className="bg-[#247ae4] hover:bg-[#1a6ed0] transition-colors text-white rounded-[8px] px-[24px] py-[10px] font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[14px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                  Submit Nomination
                </button>
              </div>
            </div>
          )}

          {/* Proxy/Ballot/Meeting tab: open + upcoming elections */}
          {activeTab === "proxy" && <><div data-ux-id="elections-ballot-card" className="border border-[#e2eaf0] rounded-[14px] md:rounded-[18px] w-full flex flex-col md:flex-row md:items-center justify-between gap-[14px] md:gap-[26px] px-[16px] md:px-[26px] py-[16px] md:py-[18px] bg-white shrink-0">
            <div className="flex flex-col gap-[3px] shrink-0 min-w-0">
              <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[15px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                2026 Board of Directors Election – Submit your ballot
              </p>
              <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-60 text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                Voting closes on September 15, 2026 at 5:00PM
              </p>
            </div>
            {!ballotSent && (
              <button
                onClick={() => setBallotSent(true)}
                data-ux-id="elections-vote-now-button"
                className="shrink-0 bg-[#247ae4] hover:bg-[#1a6ed0] transition-colors text-white rounded-[10px] px-[22px] py-[10px] font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[14px]"
                style={{ fontVariationSettings: '"opsz" 14' }}
              >
                Vote Now
              </button>
            )}
            {ballotSent && (
              <div data-ux-id="elections-ballot-sent-confirmation" className="flex items-start justify-between gap-[12px] bg-white border border-[#e2eaf0] rounded-[12px] px-[14px] py-[12px] flex-1 min-w-0">
                <div className="flex items-start gap-[12px] min-w-0">
                  <div className="w-[34px] h-[34px] rounded-full bg-[#dcfce7] flex items-center justify-center shrink-0">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                      <path d="M20 4H4C2.9 4 2 4.9 2 6v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="#16a34a"/>
                    </svg>
                  </div>
                  <div className="flex flex-col gap-[2px] min-w-0">
                    <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                      Check Your Email
                    </p>
                    <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] text-[12px] leading-[1.5]" style={{ fontVariationSettings: '"opsz" 14' }}>
                      A secure voting link has been sent to <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold opacity-100">alex.johnson@email.com</span>. Open the email to cast your ballot before September 15, 2026 at 5:00PM.
                    </p>
                    <button
                      data-ux-id="elections-ballot-resend-button"
                      className="self-start mt-[6px] font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#247ae4] text-[12px] hover:underline transition-opacity"
                      style={{ fontVariationSettings: '"opsz" 14' }}
                    >
                      Resend
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setBallotSent(false)}
                  data-ux-id="elections-ballot-dismiss-button"
                  className="shrink-0 text-[#262630] opacity-30 hover:opacity-60 transition-opacity mt-[1px]"
                  aria-label="Dismiss"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            )}
          </div></>}

          {/* Campaign cards — open/upcoming: Proxy tab only */}
          {activeTab === "proxy" && campaigns.filter(c => c.status !== "closed").map((campaign, campaignIdx) => {
            const isCollapsed = collapsedCards.has(campaign.id);
            return (
            <Fragment key={campaign.id}>
            <div data-ux-id={`election-campaign-${campaign.id}`} className="w-full bg-white rounded-[18px] border border-[#d9e7f0] drop-shadow-[0px_2px_9px_rgba(18,17,48,0.07)] shrink-0">
              <div className={`px-[16px] md:px-[26px] pt-[20px] md:pt-[24px] flex flex-col gap-[16px] md:gap-[20px] ${isCollapsed ? "pb-[20px] md:pb-[24px]" : "pb-[24px] md:pb-[28px]"}`}>
                {/* Header */}
                <div className="flex flex-col gap-[6px]">
                  <div className="flex items-center gap-[10px]">
                    <span className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-60 text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                      Voting {campaign.status === "upcoming" ? "opens" : "open"} {campaign.votingPeriod}
                    </span>
                    {campaign.status === "open" ? (
                      <div className="bg-[#dcfce7] rounded-[50px] px-[12px] py-[5px] flex items-center shrink-0">
                        <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#166534] text-[13px] leading-[19.5px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>Open</span>
                      </div>
                    ) : campaign.status === "upcoming" ? (
                      <div className="bg-[#fef3c7] rounded-[50px] px-[12px] py-[5px] flex items-center shrink-0">
                        <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#92400e] text-[13px] leading-[19.5px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>Upcoming</span>
                      </div>
                    ) : (
                      <div className="bg-[#dfeaf0] rounded-[50px] px-[12px] py-[5px] flex items-center shrink-0">
                        <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[13px] leading-[19.5px] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>Closed</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-start justify-between gap-[12px]">
                    <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[20px] leading-normal flex-1 min-w-0" style={{ fontVariationSettings: '"opsz" 14' }}>
                      {campaign.title}
                    </p>
                    <CollapseButton collapsed={isCollapsed} onToggle={() => toggleCard(campaign.id)} uxId={`election-campaign-${campaign.id}-collapse-button`} />
                  </div>
                  {!isCollapsed && (
                    <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-65 text-[14px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                      {campaign.description}
                    </p>
                  )}
                </div>

                {!isCollapsed && campaign.participation && (
                  <ParticipationBar voted={campaign.participation.voted} total={campaign.participation.total} uxId={`election-campaign-${campaign.id}-participation`} />
                )}

                {/* Board election: candidate grid */}
                {!isCollapsed && campaign.candidates && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px]">
                    {campaign.candidates.map((c) => (
                      <div key={c.name} data-ux-id={`election-candidate-${c.name.toLowerCase().replace(/\s+/g, "-")}`} className="border border-[#e8eff5] rounded-[14px] p-[20px] flex flex-col gap-[14px]">
                        <div className="flex items-center gap-[14px]">
                          <div
                            className="w-[36px] h-[36px] rounded-full flex items-center justify-center shrink-0 text-white font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[14px]"
                            style={{ backgroundColor: c.color, fontVariationSettings: '"opsz" 14' }}
                          >
                            {c.initials}
                          </div>
                          <div className="flex flex-col gap-[2px] min-w-0">
                            <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[15px] leading-normal" style={{ fontVariationSettings: '"opsz" 14' }}>
                              {c.name}
                            </p>
                            <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-60 text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                              {c.role}
                            </p>
                          </div>
                        </div>
                        <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-75 text-[13px] leading-[1.6]" style={{ fontVariationSettings: '"opsz" 14' }}>
                          {c.bio}
                        </p>
                        <button data-ux-id={`election-candidate-${c.name.toLowerCase().replace(/\s+/g, "-")}-bio-button`} className="self-start font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#247ae4] text-[13px] hover:underline" style={{ fontVariationSettings: '"opsz" 14' }}>
                          Read full bio
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Election progress tracker — board campaign only */}
                {!isCollapsed && campaign.type === "board" && (
                  <div data-ux-id={`election-campaign-${campaign.id}-progress-tracker`} className="border-t border-[#e8eff5] pt-[20px] flex flex-col gap-[16px]">
                    <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>Election Progress</p>
                    <div className="flex items-start">
                      {[
                        { label: "Nominations", date: "Jul 1–15", state: "done" },
                        { label: "Notices", date: "Jul 16–28", state: "done" },
                        { label: "Voting", date: "Aug 28–Sep 15", state: "current" },
                        { label: "Results", date: "Sep 20", state: "upcoming" },
                      ].map((step, i, arr) => (
                        <div key={step.label} className="flex items-start flex-1 min-w-0">
                          <div className="flex flex-col items-center flex-1 min-w-0">
                            <div className="flex items-center w-full">
                              <div className={`flex-1 h-[2px] ${i === 0 ? "opacity-0" : arr[i - 1].state === "done" ? "bg-[#247ae4]" : "bg-[#e2eaf0]"}`} />
                              {step.state === "done" ? (
                                <div className="w-[26px] h-[26px] rounded-full bg-[#247ae4] flex items-center justify-center shrink-0">
                                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2.5 7L5.5 10L11.5 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                </div>
                              ) : step.state === "current" ? (
                                <div className="w-[26px] h-[26px] rounded-full bg-[#247ae4] flex items-center justify-center shrink-0 ring-[3px] ring-[#bfdbfe]">
                                  <div className="w-[9px] h-[9px] rounded-full bg-white" />
                                </div>
                              ) : (
                                <div className="w-[26px] h-[26px] rounded-full bg-white border-2 border-[#e2eaf0] shrink-0" />
                              )}
                              <div className={`flex-1 h-[2px] ${i === arr.length - 1 ? "opacity-0" : step.state === "done" ? "bg-[#247ae4]" : "bg-[#e2eaf0]"}`} />
                            </div>
                            <div className="flex flex-col items-center gap-[4px] mt-[8px] px-[4px] text-center">
                              <span className={`font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[10px] md:text-[12px] leading-tight text-center ${step.state === "upcoming" ? "text-[#262630] opacity-35" : "text-[#262630]"}`} style={{ fontVariationSettings: '"opsz" 14' }}>
                                {step.label}
                              </span>
                              {step.state !== "current" && (
                                <span className={`font-['DM_Sans:Regular',sans-serif] font-normal text-[10px] md:text-[11px] text-center ${step.state === "upcoming" ? "text-[#262630] opacity-30" : "text-[#262630] opacity-55"}`} style={{ fontVariationSettings: '"opsz" 14' }}>
                                  {step.date}
                                </span>
                              )}
                              {step.state === "current" && (
                                <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[11px] text-[#247ae4] bg-[#eff6ff] rounded-[50px] px-[7px] py-[2px]" style={{ fontVariationSettings: '"opsz" 14' }}>In progress</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bylaw / budget: options list */}
                {!isCollapsed && campaign.options && (
                  <div className="flex flex-col gap-[10px]">
                    {campaign.options.map((opt, idx) => (
                      <div key={opt.label} data-ux-id={`election-campaign-${campaign.id}-option-${opt.label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`} className="border border-[#e8eff5] rounded-[12px] px-[18px] py-[14px] flex items-start gap-[14px]">
                        <div className="mt-[1px] w-[20px] h-[20px] rounded-full bg-[#f0f5fa] flex items-center justify-center shrink-0">
                          <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] opacity-60 text-[11px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                            {idx + 1}
                          </span>
                        </div>
                        <div className="flex flex-col gap-[2px] min-w-0">
                          <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[14px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                            {opt.label}
                          </p>
                          <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-60 text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                            {opt.description}
                          </p>
                        </div>
                      </div>
                    ))}
                    {campaign.status === "upcoming" && (
                      <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-40 text-[12px] mt-[2px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                        Voting opens {campaign.votingPeriod.split("–")[0].trim()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
            </Fragment>
            );
          })}

          {/* Results tab: closed election card */}
          {activeTab === "results" && <CompletedElectionCard collapsed={collapsedCards.has("completed-2025")} onToggle={() => toggleCard("completed-2025")} />}

        </div>
      )}

      {/* Floating elections tab pill — bottom-left */}
      {!loading && (
        <div
          data-ux-id="elections-tab-toggle"
          className="fixed bottom-6 left-6 z-50 flex items-center bg-[#1a1f2e] rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.35)] p-[5px] gap-[2px]"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              data-ux-id={`elections-tab-${tab.id}`}
              className={`px-[14px] py-[8px] rounded-full text-[13px] font-['DM_Sans:SemiBold',sans-serif] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id ? "bg-[#2d3550] text-white" : "text-[#8a95ab] hover:text-white"
              }`}
              style={{ fontVariationSettings: '"opsz" 14' }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Community Feed ─── */
type CommunityPost = {
  id: number;
  title: string;
  body: string;
  date: string;
  author: string;
  initials: string;
  image?: string;
  imageAlt?: string;
  /** CSS object-position for the cropped image, e.g. "top" to keep a poster's title in view. */
  imagePosition?: string;
  /** Walkthrough handle for the post's card on the feed page. */
  vtName?: VTName;
  likes: number;
  official?: boolean;
  postedByBoard?: boolean;
  links?: { label: string; href: string }[];
};

const initialCommunityPosts: CommunityPost[] = [
  {
    id: 1,
    title: "Food Truck Friday is back",
    body: "Join your neighbors by the clubhouse this Friday from 5–8 PM. Local favorites will be serving dinner, with lawn games and live acoustic music for the whole family.",
    date: "07/30/2026",
    author: "Waterfront Community Association",
    initials: "WC",
    image: "/assets/community-cafe.png",
    imageAlt: "Neighbors enjoying food and conversation at an outdoor cafe",
    likes: 24,
    official: true,
    postedByBoard: true,
    links: [
      { label: "waterfrontcommunity.org/events", href: "https://waterfrontcommunity.org/events" },
      { label: "foodtruckfriday.com", href: "https://foodtruckfriday.com" },
    ],
  },
  {
    id: 6,
    title: "Discounted tickets: Forgotten Island (opening weekend)",
    body: "Resident perk from PerkSpot — grab discounted tickets to DreamWorks' Forgotten Island opening weekend. Save up to 35% at participating AMC, Regal, and Cinemark locations. Promo code and showtimes are available in the Offers section of the portal.",
    date: "10/18/2026",
    author: "Waterfront Community Association",
    initials: "WC",
    image: "/assets/forgotten-island.webp",
    imageAlt: "DreamWorks Forgotten Island movie poster",
    imagePosition: "top",
    vtName: VT.FeedPostForgottenIsland,
    likes: 28,
    official: true,
    links: [
      { label: "portal.waterfrontcommunity.org/offers", href: "https://portal.waterfrontcommunity.org/offers" },
      { label: "perkspot.com/forgotten-island", href: "https://perkspot.com/forgotten-island" },
    ],
  },
  {
    id: 2,
    title: "Tennis courts reopen Saturday",
    body: "The resurfacing project is complete. Courts one through four reopen at 8 AM Saturday, and reservations are now available in the resident portal.",
    date: "07/28/2026",
    author: "Waterfront Community Association",
    initials: "WC",
    image: "/assets/community-tennis.jpg",
    imageAlt: "Aerial view of neighborhood tennis courts surrounded by trees",
    likes: 18,
    official: true,
    postedByBoard: true,
    links: [
      { label: "waterfrontcommunity.org/tennis", href: "https://waterfrontcommunity.org/tennis" },
      { label: "reserve.waterfrontcommunity.org", href: "https://reserve.waterfrontcommunity.org" },
    ],
  },
  {
    id: 3,
    title: "Community garden volunteer morning",
    body: "We are refreshing the raised beds and planting fall vegetables this Sunday at 9 AM. Tools and cold water will be provided—beginners and young helpers are welcome.",
    date: "07/26/2026",
    author: "Waterfront Community Association",
    initials: "WC",
    image: "/assets/community-garden.jpg",
    imageAlt: "Volunteers tending raised beds in a community garden",
    likes: 31,
    official: true,
    links: [
      { label: "waterfrontcommunity.org/garden", href: "https://waterfrontcommunity.org/garden" },
    ],
  },
  {
    id: 4,
    title: "Pool deck maintenance reminder",
    body: "The family pool will close Tuesday from 7 AM–1 PM for routine deck cleaning. The lap pool and splash pad will remain open during this time.",
    date: "07/24/2026",
    author: "Waterfront Community Association",
    initials: "WC",
    image: "/assets/community-pool.jpg",
    imageAlt: "Community pool with lounge chairs and palm trees",
    likes: 12,
    official: true,
    links: [
      { label: "waterfrontcommunity.org/pool", href: "https://waterfrontcommunity.org/pool" },
    ],
  },
  {
    id: 5,
    title: "Welcome our newest neighbors",
    body: "Please join us in welcoming the Patel, Romero, and Williams families to Waterfront Community Estates. We hope to see everyone at the new resident coffee next Saturday at 10 AM.",
    date: "07/21/2026",
    author: "Waterfront Community Association",
    initials: "WC",
    likes: 42,
    official: true,
    links: [
      { label: "waterfrontcommunity.org/welcome", href: "https://waterfrontcommunity.org/welcome" },
      { label: "waterfrontcommunity.org/directory", href: "https://waterfrontcommunity.org/directory" },
    ],
  },
];

const editorTools = [
  { src: "/assets/editor-c9e82.svg", label: "Undo" },
  { src: "/assets/editor-d69e2.svg", label: "Redo" },
  { src: "/assets/editor-83e4c.svg", label: "Bold" },
  { src: "/assets/editor-a3267.svg", label: "Italic" },
  { src: "/assets/editor-12cce.svg", label: "Underline" },
  { src: "/assets/editor-6f139.svg", label: "Strikethrough" },
  { src: "/assets/editor-634f9.svg", label: "Bulleted list" },
  { src: "/assets/editor-8069e.svg", label: "Numbered list" },
  { src: "/assets/editor-4f8a2.svg", label: "Add link" },
  { src: "/assets/editor-7e6f1.svg", label: "Add image" },
  { src: "/assets/editor-de8c5.svg", label: "Code" },
];

function CreatePostModal({
  onClose,
  onPublish,
}: {
  onClose: () => void;
  onPublish: (title: string, body: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [fileName, setFileName] = useState("");

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !body.trim()) return;
    onPublish(title.trim(), body.trim());
  };

  return (
    <div data-ux-id="community-feed-create-post-modal" className="fixed inset-0 z-[195] flex items-center justify-center bg-[#152331]/45 p-[12px] md:p-[24px]" role="presentation" onMouseDown={onClose}>
      <form
        className="flex max-h-[calc(100dvh-24px)] w-full max-w-[890px] flex-col overflow-hidden rounded-[6px] border border-[#e3e3e3] bg-white shadow-[0_20px_60px_rgba(18,17,48,0.22)] md:max-h-[calc(100dvh-48px)]"
        onSubmit={submit}
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-post-title"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#e1e9ef] px-[20px] py-[16px] md:px-[32px]">
          <p id="new-post-title" className="font-['DM_Sans:SemiBold',sans-serif] text-[20px] font-semibold leading-[24px] text-[#262630]" style={{ fontVariationSettings: '"opsz" 14' }}>New Post</p>
          <button type="button" onClick={onClose} data-ux-id="community-feed-create-post-modal-close-button" className="flex size-[32px] items-center justify-center rounded-[6px] text-[#262630] transition-colors hover:bg-[#f2f5f7]" aria-label="Close new post editor">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-[20px] overflow-y-auto px-[20px] py-[24px] md:px-[64px]">
          <label className="flex flex-col gap-[7px] font-['DM_Sans:SemiBold',sans-serif] text-[14px] font-semibold text-[#1a1a1a]" style={{ fontVariationSettings: '"opsz" 14' }}>
            Title
            <input
              autoFocus
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Community Post Title"
              data-ux-id="community-feed-create-post-title-input"
              className="h-[45px] w-full rounded-[6px] border border-[#cfd3da] bg-white px-[20px] font-['DM_Sans:Regular',sans-serif] text-[14px] font-normal text-[#1a1a1a] outline-none transition-shadow placeholder:text-[#1a1a1a]/50 focus:border-[#247ae4] focus:ring-2 focus:ring-[#247ae4]/15"
              required
            />
          </label>

          <label className="flex flex-col gap-[10px] font-['DM_Sans:SemiBold',sans-serif] text-[14px] font-semibold text-[#1a1a1a]" style={{ fontVariationSettings: '"opsz" 14' }}>
            Body
            <div className="overflow-hidden rounded-[6px] border border-[#cfd3da] bg-white focus-within:border-[#247ae4] focus-within:ring-2 focus-within:ring-[#247ae4]/15">
              <div className="flex min-h-[45px] items-center gap-[4px] overflow-x-auto border-b border-[#cfd3da] p-[8px]">
                {editorTools.slice(0, 2).map((tool) => (
                  <button key={tool.label} type="button" className="flex size-[28px] shrink-0 items-center justify-center rounded-[4px] hover:bg-[#f1f3f5]" aria-label={tool.label}>
                    <img src={tool.src} alt="" width="20" height="20" />
                  </button>
                ))}
                <button type="button" className="flex h-[28px] shrink-0 items-center gap-[4px] rounded-[4px] px-[8px] font-['DM_Sans:Regular',sans-serif] text-[14px] font-normal text-[#262630] hover:bg-[#f1f3f5]">
                  Paragraph
                  <img src="/assets/editor-52726.svg" alt="" width="16" height="16" />
                </button>
                <button type="button" className="hidden h-[28px] shrink-0 items-center gap-[2px] rounded-[4px] px-[4px] hover:bg-[#f1f3f5] sm:flex" aria-label="Text alignment">
                  <img src="/assets/editor-9856c.svg" alt="" width="20" height="20" />
                  <img src="/assets/editor-52726.svg" alt="" width="16" height="16" />
                </button>
                {editorTools.slice(2).map((tool) => (
                  <button key={tool.label} type="button" className="flex size-[28px] shrink-0 items-center justify-center rounded-[4px] hover:bg-[#f1f3f5]" aria-label={tool.label}>
                    <img src={tool.src} alt="" width="20" height="20" />
                  </button>
                ))}
              </div>
              <textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                data-ux-id="community-feed-create-post-body-textarea"
                className="h-[180px] w-full resize-none p-[14px] font-['DM_Sans:Regular',sans-serif] text-[14px] font-normal leading-[1.5] text-[#262630] outline-none"
                aria-label="Post body"
                required
              />
            </div>
            <span className="font-['DM_Sans:Regular',sans-serif] text-[13px] font-normal text-[#4b5563]">Paste is converted to plain text to keep formatting clean.</span>
          </label>

          <label className="flex flex-col gap-[7px] font-['DM_Sans:SemiBold',sans-serif] text-[14px] font-semibold text-[#1a1a1a]" style={{ fontVariationSettings: '"opsz" 14' }}>
            Attachments
            <span className="relative flex min-h-[147px] cursor-pointer flex-col items-center justify-center gap-[9px] rounded-[6px] border border-dashed border-[#cfd3da] bg-[#f9fafb] p-[20px] text-center">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 16V3m0 0L7.5 7.5M12 3l4.5 4.5M5 13v6a2 2 0 002 2h10a2 2 0 002-2v-6" stroke="#65666e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span className="font-['DM_Sans:Regular',sans-serif] text-[14px] font-normal text-black">{fileName || "Drag & Drop or "}<span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#247ae4] underline">{fileName ? "" : "Choose file"}</span>{fileName ? "" : " to upload"}</span>
              <span className="font-['DM_Sans:Regular',sans-serif] text-[12px] font-normal uppercase text-[#54585e]">PDF, ZIP, PNG, JPEG</span>
              <span className="font-['DM_Sans:Regular',sans-serif] text-[12px] font-normal text-[#54585e]">MAX 25 MB total</span>
              <input data-ux-id="community-feed-create-post-attachment-input" className="absolute inset-0 cursor-pointer opacity-0" type="file" accept=".pdf,.zip,.png,.jpg,.jpeg" onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")} />
            </span>
          </label>

          <div className="flex flex-col gap-[7px]">
            <p className="font-['DM_Sans:SemiBold',sans-serif] text-[14px] font-semibold text-[#1a1a1a]">Citations</p>
            <button type="button" data-ux-id="community-feed-create-post-add-caption-button" className="flex w-fit items-center gap-[8px] rounded-[8px] border border-[#e0e0e0] px-[24px] py-[12px] font-['DM_Sans:SemiBold',sans-serif] text-[14px] font-semibold text-[#262530] hover:bg-[#f9fafb]">
              <span className="text-[19px] font-normal leading-none">+</span> Add Caption
            </button>
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-[15px] border-t border-[#e1e9ef] px-[20px] py-[16px] md:px-[32px]">
          <button type="button" onClick={onClose} data-ux-id="community-feed-create-post-cancel-button" className="rounded-[8px] bg-[#f6f6f6] px-[16px] py-[8px] font-['DM_Sans:SemiBold',sans-serif] text-[14px] font-semibold leading-[21px] text-[#262630] hover:bg-[#ececec]">Cancel</button>
          <button type="submit" data-ux-id="community-feed-create-post-publish-button" className="rounded-[8px] bg-[#247ae4] px-[16px] py-[8px] font-['DM_Sans:SemiBold',sans-serif] text-[14px] font-semibold leading-[21px] text-white hover:bg-[#176dcb] disabled:cursor-not-allowed disabled:opacity-50" disabled={!title.trim() || !body.trim()}>Publish Post</button>
        </div>
      </form>
    </div>
  );
}

function CommunityFeedPage({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const [posts, setPosts] = useState(initialCommunityPosts);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [createPostOpen, setCreatePostOpen] = useState(false);
  // A short load on arrival, like fetching the feed, so landing here feels real.
  const loading = usePageLoad();

  const toggleLike = (postId: number) => {
    setLikedPosts((current) => {
      const next = new Set(current);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  const publishPost = (title: string, body: string) => {
    setPosts((current) => [{
      id: Date.now(),
      title,
      body,
      date: new Intl.DateTimeFormat("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }).format(new Date()),
      author: "Waterfront Community Association",
      initials: "WC",
      likes: 0,
      official: true,
      postedByBoard: true,
    }, ...current]);
    setCreatePostOpen(false);
  };

  return (
    <div data-ux-id="community-feed-page" data-vt-name={VT.CommunityFeedPage} className="flex-1 min-w-0 h-full overflow-y-auto">
      <div className="md:hidden flex items-center justify-between px-[16px] py-[14px] bg-white border-b border-[#d9ecf8] shrink-0">
        <button onClick={onOpenSidebar} data-ux-id="community-mobile-menu-button" className="w-[36px] h-[36px] flex items-center justify-center rounded-[8px] hover:bg-[#f0f5fa] transition-colors" aria-label="Open menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M3 12h18M3 18h18" stroke="#262630" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
        <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[17px]" style={{ fontVariationSettings: '"opsz" 14' }}>Community Feed</p>
        <div className="w-[36px]" />
      </div>

      {loading ? (
        <PageLoader uxId="community-feed-loader" />
      ) : (
        <div className="flex w-full max-w-[1280px] mx-auto flex-col gap-[24px] px-[16px] pb-[44px] pt-[20px] md:gap-[32px] md:px-[44px] md:pt-[31px] animate-[page-content-in_300ms_ease-out]">
          <div className="hidden w-full items-center justify-between gap-[28px] md:flex">
            <div className="min-w-0 flex-1">
              <p className="font-['DM_Sans:SemiBold',sans-serif] text-[28px] font-semibold leading-normal text-[#262630]" style={{ fontVariationSettings: '"opsz" 14' }}>Community Feed</p>
              <p className="font-['DM_Sans:Regular',sans-serif] text-[16px] font-normal leading-normal text-[#262630]/70" style={{ fontVariationSettings: '"opsz" 14' }}>Connect with your neighbors and stay updated on community happenings</p>
            </div>
            <AddressCard />
          </div>

          <div className="mx-auto flex w-full max-w-[673px] flex-col gap-[16px]">
            <div data-ux-id="community-feed-create-post-card" className="flex items-center gap-[14px] rounded-[18px] bg-white px-[18px] py-[18px] shadow-[0px_2px_9px_rgba(18,17,48,0.07)] md:px-[26px] md:py-[24px]">
              <p className="min-w-0 flex-1 font-['DM_Sans:SemiBold',sans-serif] text-[17px] font-semibold text-[#262630] md:text-[20px]" style={{ fontVariationSettings: '"opsz" 14' }}>What’s happening in the community?</p>
              <button onClick={() => setCreatePostOpen(true)} data-ux-id="community-feed-create-post-button" className="flex shrink-0 items-center gap-[8px] rounded-[8px] bg-[#247ae4] px-[14px] py-[8px] font-['DM_Sans:SemiBold',sans-serif] text-[14px] font-semibold leading-[21px] text-white shadow-sm transition-colors hover:bg-[#176dcb]">
                <span className="text-[18px] font-normal leading-none">+</span>
                <span className="hidden sm:inline">Create Post</span>
                <span className="sm:hidden">Post</span>
              </button>
            </div>

            {posts.map((post) => {
              const liked = likedPosts.has(post.id);
              return (
                <article key={post.id} data-ux-id={`community-feed-post-${post.id}`} data-vt-name={post.vtName} className="flex w-full flex-col gap-[20px] rounded-[18px] border border-[#d9e7f0] bg-white px-[18px] pb-[16px] pt-[22px] shadow-[0px_2px_9px_rgba(18,17,48,0.07)] md:gap-[24px] md:px-[26px] md:pt-[24px]">
                  <div className="flex items-start gap-[14px]">
                    <div className="flex size-[36px] shrink-0 items-center justify-center rounded-full bg-[#247ae4] font-['Open_Sans:Regular',sans-serif] text-[13px] font-normal text-white" style={{ fontVariationSettings: '"wdth" 100' }}>{post.initials}</div>
                    <div className="min-w-0 flex-1">
                      <p className="font-['DM_Sans:SemiBold',sans-serif] text-[14px] font-semibold leading-[1.2] text-[#262630]" style={{ fontVariationSettings: '"opsz" 14' }}>{post.author}</p>
                      {post.postedByBoard ? (
                        <p className="mt-[5px] font-['DM_Sans:Regular',sans-serif] text-[12px] font-normal leading-[1.2] text-[#4b5563]" style={{ fontVariationSettings: '"opsz" 14' }}>
                          Posted by your Board · {post.date}
                        </p>
                      ) : (
                        <div className="mt-[5px] flex items-center gap-[7px] font-['DM_Sans:Regular',sans-serif] text-[12px] font-normal leading-[1.2]" style={{ fontVariationSettings: '"opsz" 14' }}>
                          <span className="text-[#4b5563]">{post.date}</span>
                          <span className="text-[#4b5563]">·</span>
                          <span className="flex items-center gap-[4px] text-[#009c68]">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                              <path d="M5.625 0C5.74219 0 5.83594 0.0234375 5.92969 0.0703125L10.3594 1.94531C10.875 2.15625 11.25 2.67188 11.25 3.28125C11.25 5.60156 10.2891 9.86719 6.25781 11.7891C5.85938 11.9766 5.39062 11.9766 5.01562 11.7891C0.960938 9.86719 0.0234375 5.60156 0 3.28125C0 2.67188 0.375 2.15625 0.890625 1.94531L5.32031 0.0703125C5.41406 0.0234375 5.50781 0 5.625 0ZM1.33594 2.97656C1.19531 3.04688 1.125 3.16406 1.125 3.28125C1.14844 5.41406 2.03906 9.11719 5.50781 10.7812C5.57812 10.8281 5.67188 10.8281 5.76562 10.7812C9.23438 9.11719 10.125 5.41406 10.125 3.28125C10.125 3.16406 10.0547 3.04688 9.91406 2.97656L5.625 1.14844L1.33594 2.97656ZM6.96094 3.79688C7.14844 3.53906 7.5 3.49219 7.75781 3.67969C8.01562 3.84375 8.0625 4.19531 7.875 4.45312L5.48438 7.75781C5.39062 7.89844 5.22656 7.96875 5.0625 7.99219C4.89844 7.99219 4.73438 7.94531 4.61719 7.80469L3.53906 6.67969C3.32812 6.46875 3.32812 6.11719 3.53906 5.90625C3.77344 5.67188 4.125 5.69531 4.33594 5.90625L4.96875 6.5625L6.96094 3.79688Z" fill="currentColor"/>
                            </svg>
                            Verified Safe
                          </span>
                        </div>
                      )}
                    </div>
                    {post.official && (
                      <span className="flex shrink-0 items-center gap-[5px] rounded-full bg-[#247ae4] px-[12px] py-[4px] font-['DM_Sans:SemiBold',sans-serif] text-[12px] font-semibold text-white md:px-[16px] md:text-[13px]">
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                          <path d="M6.44922 0.0761719L11.2227 2.10742C11.7812 2.36133 12.2129 2.89453 12.2129 3.55469C12.1875 6.09375 11.1465 10.6895 6.7793 12.7969C6.34766 13 5.86523 13 5.43359 12.7969C1.06641 10.6895 0.0253906 6.09375 0.0253906 3.55469C0 2.89453 0.431641 2.36133 0.990234 2.10742L5.76367 0.0761719C5.86523 0.0253906 5.99219 0 6.11914 0C6.2207 0 6.34766 0.0253906 6.44922 0.0761719ZM8.98828 5.30664H8.96289C9.2168 5.07812 9.2168 4.69727 8.96289 4.44336C8.73438 4.21484 8.35352 4.21484 8.125 4.44336L5.30664 7.28711L4.11328 6.09375C3.85938 5.83984 3.47852 5.83984 3.25 6.09375C2.99609 6.32227 2.99609 6.70312 3.25 6.93164L4.875 8.55664C5.10352 8.81055 5.48438 8.81055 5.73828 8.55664L8.98828 5.30664Z" fill="white"/>
                        </svg>
                        Official
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-[14px] md:gap-[18px]">
                    <p className="font-['DM_Sans:SemiBold',sans-serif] text-[18px] font-semibold leading-[1.2] text-black" style={{ fontVariationSettings: '"opsz" 14' }}>{post.title}</p>
                    <p className="font-['DM_Sans:Regular',sans-serif] text-[15px] font-normal leading-[1.35] text-[#4b5563] md:text-[16px]" style={{ fontVariationSettings: '"opsz" 14' }}>{post.body}</p>
                    {post.image && <img src={post.image} alt={post.imageAlt ?? ""} className="aspect-[621/316] w-full rounded-[16px] object-cover" style={{ objectPosition: post.imagePosition }} />}
                    {post.links && post.links.length > 0 && (
                      <div className="flex flex-wrap gap-[9px]">
                        {post.links.map((link, linkIdx) => (
                          <a
                            key={link.href}
                            href={link.href}
                            target="_blank"
                            rel="noreferrer"
                            data-ux-id={`community-feed-post-${post.id}-link-${linkIdx}`}
                            className="max-w-full truncate rounded-full bg-[#e8f1f6] px-[15px] py-[8px] font-['DM_Sans:SemiBold',sans-serif] text-[13px] font-semibold leading-[1.2] text-[#262630] transition-colors hover:bg-[#d9eaf3] hover:text-[#247ae4] md:px-[18px] md:text-[14px]"
                          >
                            {link.label}
                          </a>
                        ))}
                      </div>
                    )}
                    <div className="border-t border-[#d9e7f0]" />
                    <button onClick={() => toggleLike(post.id)} aria-pressed={liked} data-ux-id={`community-feed-post-${post.id}-like-button`} className={`flex w-fit items-center gap-[7px] rounded-[6px] px-[2px] py-[2px] font-['DM_Sans:Regular',sans-serif] text-[13px] font-normal transition-colors ${liked ? "text-[#247ae4]" : "text-[#262630] hover:text-[#247ae4]"}`}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"}><path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3m0 11V11l4-9a3 3 0 013 3v4h5.1a2.5 2.5 0 012.45 3l-1.5 7.5A3 3 0 0117.1 22H7z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      {liked ? "Liked" : "Like"} · {post.likes + (liked ? 1 : 0)}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}
      {createPostOpen && <CreatePostModal onClose={() => setCreatePostOpen(false)} onPublish={publishPost} />}
    </div>
  );
}

/* ─── ARC Form Page ─── */
/* ─── Offers Page ─── */
function OffersPage({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const loading = usePageLoad();
  const [activeTab, setActiveTab] = useState<"home" | "recommended" | "tickets" | "travel">("home");
  const [query, setQuery] = useState("");

  const tabs: { id: "home" | "recommended" | "tickets" | "travel"; label: string }[] = [
    { id: "home", label: "Home Essentials" },
    { id: "recommended", label: "Recommended Deals" },
    { id: "tickets", label: "Tickets & Attractions" },
    { id: "travel", label: "Travel" },
  ];

  const bullets = [
    "Exclusive, premium deals",
    "Discount codes that work the first time, always",
    "Trusted by 16M+ deal seekers",
  ];

  const perkspotLogoUrl = "https://www.perkspot.com/wp-content/uploads/perkspot-logo-2025.svg";
  const brands = [
    { name: "Walmart", logo: <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Walmart_logo_%282025%29.svg/250px-Walmart_logo_%282025%29.svg.png" alt="Walmart" className="max-h-[36px] max-w-full object-contain" />, offer: "Earn 500 PerkPoints With Walmart+ Membership" },
    { name: "Samsung", logo: <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Samsung_Black_icon.svg/330px-Samsung_Black_icon.svg.png" alt="Samsung" className="max-h-[26px] max-w-full object-contain" />, offer: "Up to 40% off TVs, Mobile, Home Appliances & More" },
    { name: "Brooklinen", logo: <span className="font-['DM_Sans:Bold',sans-serif] font-bold text-black text-[22px] tracking-tight italic" style={{ fontVariationSettings: '"opsz" 14' }}>brooklinen</span>, offer: "$20 off $100+ Bedding, Bath & More" },
    { name: "PerkSpot", logo: <img src={perkspotLogoUrl} alt="PerkSpot" className="max-h-[28px] max-w-full object-contain" />, offer: "Get Free Shipping on any Order. + Earn Up to 1% in PerkPoints" },
    { name: "Home Depot", logo: <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/The_Home_Depot_logo.svg/250px-The_Home_Depot_logo.svg.png" alt="The Home Depot" className="max-h-[44px] max-w-full object-contain" />, offer: "Earn up to 4% in PerkPoints on Home Improvement Purchases" },
  ];

  return (
    <div data-ux-id="offers-page" className="flex-1 min-w-0 h-full overflow-y-auto">
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-[16px] py-[14px] bg-white border-b border-[#d9ecf8] shrink-0">
        <button onClick={onOpenSidebar} data-ux-id="offers-mobile-menu-button" className="w-[36px] h-[36px] flex items-center justify-center rounded-[8px] hover:bg-[#f0f5fa] transition-colors" aria-label="Open menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M3 12h18M3 18h18" stroke="#262630" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
        <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[17px]" style={{ fontVariationSettings: '"opsz" 14' }}>Offers</p>
        <div className="w-[36px]" />
      </div>

      {loading ? (
        <PageLoader uxId="offers-loader" />
      ) : (
        <div className="flex flex-col gap-[24px] md:gap-[28px] w-full max-w-[1280px] mx-auto pb-[44px] pt-[20px] md:pt-[31px] px-[16px] md:px-[44px] min-w-0 animate-[page-content-in_300ms_ease-out]">
          {/* Header */}
          <div className="flex flex-col gap-[4px]">
            <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[28px] leading-normal" style={{ fontVariationSettings: '"opsz" 14' }}>
              Offers
            </p>
            <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-70 text-[16px] leading-normal" style={{ fontVariationSettings: '"opsz" 14' }}>
              Member discounts powered by PerkSpot
            </p>
          </div>

          {/* PerkSpot card */}
          <div data-ux-id="offers-perkspot-card" className="rounded-[18px] overflow-hidden shadow-[0_2px_18px_rgba(18,17,48,0.07)] bg-white">
            {/* Hero */}
            <div className="relative overflow-hidden">
              <div className="bg-[#1a1b4b] text-center px-[16px] py-[10px]">
                <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-white text-[14px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                  Your HOA has partnered with PerkSpot to bring you exclusive deals.
                </p>
              </div>
              <div className="relative">
                <div
                  className="absolute inset-0"
                  aria-hidden="true"
                  style={{
                    backgroundImage: `linear-gradient(90deg, rgba(26,27,75,0.92) 0%, rgba(26,27,75,0.72) 45%, rgba(26,27,75,0.15) 100%), url(${imgPerkspotHero})`,
                    backgroundSize: "cover",
                    backgroundPosition: "right bottom",
                  }}
                />
                <div className="relative flex flex-col gap-[20px] px-[22px] py-[36px] md:px-[48px] md:py-[52px] max-w-[640px]">
                  <img
                    src={perkspotLogoUrl}
                    alt="PerkSpot"
                    className="self-start h-[32px] md:h-[36px] w-auto"
                    style={{ filter: "brightness(0) invert(1)" }}
                  />
                  <p className="font-['DM_Sans:Bold',sans-serif] font-bold text-white text-[32px] md:text-[40px] leading-[1.1]" style={{ fontVariationSettings: '"opsz" 14' }}>
                    Unlock up to<br />60% off top brands.
                  </p>
                  <div className="flex flex-wrap items-center gap-x-[14px] gap-y-[6px] font-['DM_Sans:SemiBold',sans-serif] font-semibold text-white text-[14px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                    <span>15,000+ deals</span>
                    <span className="opacity-60">·</span>
                    <span>3,000+ brands</span>
                    <span className="opacity-60">·</span>
                    <span className="flex items-center gap-[6px]">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#f9b22c" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77 5.82 21.02 7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      4.9 Chrome Rating
                    </span>
                  </div>
                  <form
                    onSubmit={(event) => event.preventDefault()}
                    className="flex items-center gap-[10px] rounded-full bg-white p-[6px] max-w-[520px]"
                    role="search"
                  >
                    <div className="flex items-center gap-[10px] flex-1 min-w-0 pl-[14px]">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8a94a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
                        <circle cx="11" cy="11" r="7"/>
                        <path d="M21 21l-4.3-4.3"/>
                      </svg>
                      <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search Brands, Categories…"
                        data-ux-id="offers-search-input"
                        className="flex-1 min-w-0 h-[36px] bg-transparent font-['DM_Sans:Regular',sans-serif] font-normal text-[14px] text-[#262630] placeholder:text-[#8a94a6] outline-none italic"
                        style={{ fontVariationSettings: '"opsz" 14' }}
                      />
                    </div>
                    <button
                      type="submit"
                      data-ux-id="offers-search-submit"
                      className="shrink-0 rounded-full bg-[#1d5bff] hover:bg-[#1646c8] transition-colors px-[22px] py-[9px] font-['DM_Sans:SemiBold',sans-serif] font-semibold text-white text-[14px]"
                      style={{ fontVariationSettings: '"opsz" 14' }}
                    >
                      Search
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-[22px] md:gap-[32px] border-b border-[#e2eaf0] px-[22px] md:px-[32px] overflow-x-auto">
              {tabs.map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    data-ux-id={`offers-tab-${tab.id}`}
                    className={`shrink-0 relative py-[14px] font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[15px] transition-colors ${active ? "text-[#1d5bff]" : "text-[#262630] hover:text-[#1d5bff]"}`}
                    style={{ fontVariationSettings: '"opsz" 14' }}
                  >
                    {tab.label}
                    {active && <span aria-hidden="true" className="absolute left-0 right-0 -bottom-px h-[3px] rounded-t-full bg-[#1d5bff]" />}
                  </button>
                );
              })}
            </div>

            {/* Features + brand grid */}
            <div className="flex flex-col gap-[26px] px-[22px] py-[26px] md:px-[32px] md:py-[32px]">
              <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-[26px] items-start">
                <ul className="flex flex-col gap-[16px]">
                  {bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-[12px]">
                      <span className="shrink-0 w-[22px] h-[22px] rounded-full bg-[#1a1b4b] flex items-center justify-center">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12l5 5L20 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </span>
                      <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[14px] leading-[1.3]" style={{ fontVariationSettings: '"opsz" 14' }}>
                        {bullet}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="relative">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-[14px]">
                    {brands.map((brand) => (
                      <div key={brand.name} data-ux-id={`offers-brand-${brand.name.toLowerCase().replace(/\s+/g, "-")}`} className="flex flex-col gap-[12px]">
                        <div className="flex items-center justify-center h-[72px] rounded-[8px] border border-[#e2eaf0] bg-white px-[14px]">
                          {brand.logo}
                        </div>
                        <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] text-[13px] leading-[1.35]" style={{ fontVariationSettings: '"opsz" 14' }}>
                          {brand.offer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#4b5563] text-[12px] leading-[1.5] text-center" style={{ fontVariationSettings: '"opsz" 14' }}>
                Clicking on any link within widget is acceptance and acknowledgement of PerkSpot's updated{" "}
                <a href="#" className="text-[#1d5bff] underline">Terms of Use</a>{" "}and{" "}
                <a href="#" className="text-[#1d5bff] underline">Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ArcFormPage({
  formId,
  formLabel,
  onOpenSidebar,
  onCancel,
}: {
  formId: string;
  formLabel: string;
  onOpenSidebar: () => void;
  onCancel: () => void;
}) {
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");
  const [property, setProperty] = useState("");
  const [areaOfWork, setAreaOfWork] = useState("");
  const [supportingForm, setSupportingForm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [attachment, setAttachment] = useState("");
  const [fence, setFence] = useState({ material: "", style: "", height: "", color: "", length: "", gates: "", contractor: "" });
  // A short load on arrival, like fetching the form, so landing here feels real.
  const loading = usePageLoad();
  const setFenceField = (field: keyof typeof fence) => (event: { target: { value: string } }) =>
    setFence((prev) => ({ ...prev, [field]: event.target.value }));

  const inputBase = "h-[44px] w-full rounded-[8px] border border-[#cfd3da] bg-white px-[14px] font-['DM_Sans:Regular',sans-serif] text-[14px] font-normal text-[#1a1a1a] outline-none transition-shadow placeholder:text-[#1a1a1a]/40 focus:border-[#247ae4] focus:ring-2 focus:ring-[#247ae4]/15";
  const labelBase = "font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[14px]";
  const selectBase = `${inputBase} appearance-none bg-no-repeat bg-[right_14px_center] pr-[36px]`;
  const selectChevron = { backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23262630' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M6 9l6 6 6-6'/></svg>\")" };
  const fenceSelects: ReadonlyArray<{ field: keyof typeof fence; label: string; placeholder: string; options: string[] }> = [
    { field: "material", label: "Material", placeholder: "Select material", options: ["Wood (cedar)", "Wood (pressure-treated pine)", "Vinyl", "Aluminum", "Wrought iron", "Composite", "Chain link"] },
    { field: "style", label: "Style", placeholder: "Select style", options: ["Privacy", "Semi-privacy / shadowbox", "Picket", "Split rail", "Ornamental"] },
    { field: "height", label: "Height", placeholder: "Select height", options: ["3 ft", "4 ft", "5 ft", "6 ft"] },
    { field: "color", label: "Color / Finish", placeholder: "Select color", options: ["Natural wood (clear sealant)", "White", "Tan", "Gray", "Black", "Brown stain"] },
    { field: "gates", label: "Gates", placeholder: "Select gates", options: ["No gate", "1 walk gate", "2 walk gates", "Double drive gate"] },
  ];

  return (
    <div data-ux-id="arc-form-page" data-vt-name={VT.ArcFormPage} className="flex-1 min-w-0 h-full overflow-y-auto">
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-[16px] py-[14px] bg-white border-b border-[#d9ecf8] shrink-0">
        <button onClick={onOpenSidebar} data-ux-id="arc-form-mobile-menu-button" className="w-[36px] h-[36px] flex items-center justify-center rounded-[8px] hover:bg-[#f0f5fa] transition-colors" aria-label="Open menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M3 12h18M3 18h18" stroke="#262630" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
        <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[17px]" style={{ fontVariationSettings: '"opsz" 14' }}>ARC Request</p>
        <div className="w-[36px]" />
      </div>

      {loading ? (
        <PageLoader uxId="arc-form-loader" />
      ) : (
        <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-[24px] px-[16px] py-[20px] md:gap-[32px] md:px-[44px] md:pt-[31px] md:pb-[44px] animate-[page-content-in_300ms_ease-out]">
          {/* Header — desktop only */}
          <div className="hidden md:flex items-center justify-between w-full shrink-0">
            <div className="flex flex-col flex-1 min-w-0">
              <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[28px] leading-normal" style={{ fontVariationSettings: '"opsz" 14' }}>
                Submit a Request
              </p>
              <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-70 text-[16px] leading-normal" style={{ fontVariationSettings: '"opsz" 14' }}>
                Share the details below so your community team can get started.
              </p>
            </div>
            <AddressCard />
          </div>

          <form
            data-ux-id="arc-form"
            className="mx-auto flex w-full max-w-[820px] flex-col gap-[22px] rounded-[18px] bg-white px-[22px] py-[26px] shadow-[0_2px_18px_rgba(18,17,48,0.07)] md:px-[32px] md:py-[32px]"
            onSubmit={(event) => event.preventDefault()}
          >
            <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[20px] md:text-[22px]" style={{ fontVariationSettings: '"opsz" 14' }}>
              {formLabel}
            </p>

            <label className="flex flex-col gap-[8px]">
              <span className={labelBase} style={{ fontVariationSettings: '"opsz" 14' }}>Subject</span>
              <input
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                data-ux-id="arc-form-subject"
                className={inputBase}
              />
            </label>

            <label className="flex flex-col gap-[8px]">
              <span className={labelBase} style={{ fontVariationSettings: '"opsz" 14' }}>Details</span>
              <textarea
                value={details}
                onChange={(event) => setDetails(event.target.value)}
                data-ux-id="arc-form-details"
                className="min-h-[128px] w-full rounded-[8px] border border-[#cfd3da] bg-white px-[14px] py-[12px] font-['DM_Sans:Regular',sans-serif] text-[14px] font-normal leading-[1.4] text-[#1a1a1a] outline-none transition-shadow placeholder:text-[#1a1a1a]/40 focus:border-[#247ae4] focus:ring-2 focus:ring-[#247ae4]/15"
              />
            </label>

            <label className="flex flex-col gap-[8px]">
              <span className={labelBase} style={{ fontVariationSettings: '"opsz" 14' }}>Property</span>
              <select
                value={property}
                onChange={(event) => setProperty(event.target.value)}
                data-ux-id="arc-form-property"
                className={`${inputBase} appearance-none bg-no-repeat bg-[right_14px_center] pr-[36px]`}
                style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23262630' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M6 9l6 6 6-6'/></svg>\")" }}
              >
                <option value=""></option>
                <option value="123-madison-green">123 Madison Green</option>
                <option value="24-waterfront-dr">24 Waterfront Dr</option>
              </select>
            </label>

            <label className="flex flex-col gap-[8px]">
              <span className={labelBase} style={{ fontVariationSettings: '"opsz" 14' }}>Area of Work</span>
              <select
                value={areaOfWork}
                onChange={(event) => setAreaOfWork(event.target.value)}
                data-ux-id="arc-form-area-of-work"
                className={`${inputBase} appearance-none bg-no-repeat bg-[right_14px_center] pr-[36px]`}
                style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23262630' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M6 9l6 6 6-6'/></svg>\")" }}
              >
                <option value=""></option>
                <option value="front-yard">Front yard</option>
                <option value="back-yard">Back yard</option>
                <option value="exterior">Exterior</option>
              </select>
            </label>

            {formId === "fence" && (
              <div data-ux-id="arc-form-fence-details" className="flex flex-col gap-[22px]">
                <div className="grid grid-cols-1 gap-[22px] sm:grid-cols-2">
                  {fenceSelects.map((select) => (
                    <label key={select.field} className="flex flex-col gap-[8px]">
                      <span className={labelBase} style={{ fontVariationSettings: '"opsz" 14' }}>{select.label}</span>
                      <select
                        value={fence[select.field]}
                        onChange={setFenceField(select.field)}
                        data-ux-id={`arc-form-fence-${select.field}`}
                        className={selectBase}
                        style={selectChevron}
                      >
                        <option value="">{select.placeholder}</option>
                        {select.options.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </label>
                  ))}
                  <label className="flex flex-col gap-[8px]">
                    <span className={labelBase} style={{ fontVariationSettings: '"opsz" 14' }}>Total Length (linear ft)</span>
                    <input
                      type="number"
                      min={0}
                      value={fence.length}
                      onChange={setFenceField("length")}
                      placeholder="e.g. 120"
                      data-ux-id="arc-form-fence-length"
                      className={inputBase}
                    />
                  </label>
                </div>
                <label className="flex flex-col gap-[8px]">
                  <span className={labelBase} style={{ fontVariationSettings: '"opsz" 14' }}>Contractor</span>
                  <input
                    value={fence.contractor}
                    onChange={setFenceField("contractor")}
                    placeholder="Company name, or self-installed"
                    data-ux-id="arc-form-fence-contractor"
                    className={inputBase}
                  />
                </label>
              </div>
            )}

            <fieldset className="flex flex-col gap-[12px] rounded-[10px] border border-[#e2eaf0] bg-[#f6f9fc] px-[18px] py-[18px]">
              <legend className="sr-only">Architectural Forms</legend>
              <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[14px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                Architectural Forms
              </p>
              <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-70 text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                Download supporting documents to reference while completing this form.
              </p>
              <label className="flex flex-col gap-[6px]">
                <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>Select form</span>
                <select
                  value={supportingForm}
                  onChange={(event) => setSupportingForm(event.target.value)}
                  data-ux-id="arc-form-supporting-form"
                  className={`${inputBase} appearance-none bg-no-repeat bg-[right_14px_center] pr-[36px]`}
                  style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23262630' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M6 9l6 6 6-6'/></svg>\")" }}
                >
                  <option value="">Choose a form to download</option>
                  <option value="guidelines">Architectural Guidelines (PDF)</option>
                  <option value="plot-plan">Plot Plan Template (PDF)</option>
                  <option value="checklist">Submission Checklist (PDF)</option>
                </select>
              </label>
            </fieldset>

            <div className="flex flex-col gap-[10px]">
              <p className={labelBase} style={{ fontVariationSettings: '"opsz" 14' }}>Date Range</p>
              <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2">
                <label className="flex flex-col gap-[6px]">
                  <span className="font-['DM_Sans:Medium',sans-serif] font-medium text-[#262630] text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>Start Date</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                    data-ux-id="arc-form-start-date"
                    className={inputBase}
                  />
                </label>
                <label className="flex flex-col gap-[6px]">
                  <span className="font-['DM_Sans:Medium',sans-serif] font-medium text-[#262630] text-[13px]" style={{ fontVariationSettings: '"opsz" 14' }}>End Date</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(event) => setEndDate(event.target.value)}
                    data-ux-id="arc-form-end-date"
                    className={inputBase}
                  />
                </label>
              </div>
            </div>

            <label className="flex flex-col gap-[8px]">
              <span className={labelBase} style={{ fontVariationSettings: '"opsz" 14' }}>Attachments</span>
              <span className="relative flex min-h-[132px] cursor-pointer flex-col items-center justify-center gap-[6px] rounded-[8px] border border-dashed border-[#cfd3da] bg-[#f9fafb] px-[18px] py-[18px] text-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 16V3m0 0L7.5 7.5M12 3l4.5 4.5M5 13v6a2 2 0 002 2h10a2 2 0 002-2v-6" stroke="#65666e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span className="font-['DM_Sans:Regular',sans-serif] font-normal text-black text-[14px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                  {attachment ? attachment : <>Drag &amp; Drop or <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#247ae4] underline">Choose file</span> to upload</>}
                </span>
                <span className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#4b5563] text-[12px]" style={{ fontVariationSettings: '"opsz" 14' }}>PDF, ZIP, PNG, JPEG, HEIC</span>
                <span className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#4b5563] text-[12px]" style={{ fontVariationSettings: '"opsz" 14' }}>Max 25 MB total</span>
                <input
                  type="file"
                  data-ux-id="arc-form-attachment"
                  onChange={(event) => setAttachment(event.target.files?.[0]?.name ?? "")}
                  className="absolute inset-0 cursor-pointer opacity-0"
                  aria-label="Upload attachment"
                />
              </span>
            </label>

            <div className="flex items-center justify-end gap-[10px] pt-[6px]">
              <button
                type="button"
                onClick={onCancel}
                data-ux-id="arc-form-cancel"
                className="rounded-[8px] border border-[#d9e0e7] bg-white px-[18px] py-[10px] font-['DM_Sans:Medium',sans-serif] font-medium text-[#262630] text-[14px] transition-colors hover:bg-[#f2f5f7]"
                style={{ fontVariationSettings: '"opsz" 14' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                data-ux-id="arc-form-submit"
                className="rounded-[8px] bg-[#247ae4] px-[18px] py-[10px] font-['DM_Sans:SemiBold',sans-serif] font-semibold text-white text-[14px] shadow-sm transition-colors hover:bg-[#176dcb]"
                style={{ fontVariationSettings: '"opsz" 14' }}
              >
                Submit Request
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

/* ─── Reservations ─── */
const MY_RESERVATIONS: ReadonlyArray<{ amenity: string; date: string; time: string; status: "Confirmed" | "Pending" }> = [
  { amenity: "Tennis Court", date: "Nov 5, 2026", time: "7:00 AM - 8:00 AM", status: "Confirmed" },
  { amenity: "Main Clubhouse", date: "Nov 21, 2026", time: "2:00 PM - 6:00 PM", status: "Pending" },
];

// If a photo fails to load, the card shows a placeholder with the amenity's
// icon instead of a broken image.
const BOOKABLE_AMENITIES: ReadonlyArray<{ slug: string; name: string; image: string; icon: React.ReactNode; details: string[] }> = [
  { slug: "tennis", name: "Tennis Court", image: "/assets/amenity-tennis.jpg", icon: <IconTennisBall />, details: ["1 hr", "Up to 4 guests", "Daily 7:00 AM – 9:00 PM"] },
  { slug: "pickleball", name: "Pickleball Court", image: "/assets/amenity-pickleball.jpg", icon: <IconPickleball />, details: ["1 hr", "Up to 4 guests", "Daily 7:00 AM – 9:00 PM"] },
  { slug: "clubhouse", name: "Main Clubhouse", image: "/assets/amenity-clubhouse.jpg", icon: <IconHouseChimney />, details: ["4 hr", "Up to 60 guests", "Daily 9:00 AM – 11:00 PM"] },
  { slug: "basketball", name: "Basketball Court", image: "/assets/amenity-basketball.jpg", icon: <IconBasketball />, details: ["1 hr", "Up to 10 guests", "Daily 7:00 AM – 9:00 PM"] },
  { slug: "lounge", name: "Lounge Meeting Room", image: "/assets/amenity-lounge.jpg", icon: <IconCouch />, details: ["2 hr", "Up to 20 guests", "Daily 8:00 AM – 10:00 PM"] },
  { slug: "conference", name: "Conference Room", image: "/assets/amenity-conference.jpg", icon: <IconScreenUsers />, details: ["2 hr", "Up to 10 guests", "Daily 8:00 AM – 10:00 PM"] },
];

function AmenityCardImage({ src, alt, icon }: { src: string; alt: string; icon: React.ReactNode }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className="flex aspect-[16/9] w-full items-center justify-center rounded-[12px] bg-[#eef4fb] text-[#247ae4] [&_svg]:h-[56px] [&_svg]:w-auto">
        {icon}
      </div>
    );
  }
  return <img src={src} alt={alt} onError={() => setFailed(true)} className="aspect-[16/9] w-full rounded-[12px] object-cover" />;
}

function ReservationsPage({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const dmSans = { fontVariationSettings: '"opsz" 14' };
  const loading = usePageLoad();
  return (
    <div data-ux-id="reservations-page" className="flex-1 min-w-0 h-full overflow-y-auto">
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-[16px] py-[14px] bg-white border-b border-[#d9ecf8] shrink-0">
        <button onClick={onOpenSidebar} data-ux-id="reservations-mobile-menu-button" className="w-[36px] h-[36px] flex items-center justify-center rounded-[8px] hover:bg-[#f0f5fa] transition-colors" aria-label="Open menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M3 12h18M3 18h18" stroke="#262630" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
        <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[17px]" style={dmSans}>Reservations</p>
        <div className="w-[36px]" />
      </div>

      {loading ? (
        <PageLoader uxId="reservations-loader" />
      ) : (
        <div className="flex flex-col gap-[24px] md:gap-[32px] w-full max-w-[1280px] mx-auto pb-[44px] pt-[20px] md:pt-[31px] px-[16px] md:px-[44px] min-w-0 animate-[page-content-in_300ms_ease-out]">
          {/* Header — desktop only */}
          <div className="hidden md:flex items-center justify-between w-full shrink-0">
            <div className="flex flex-col flex-1 min-w-0">
              <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[28px] leading-normal" style={dmSans}>
                Reservations
              </p>
              <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-70 text-[16px] leading-normal" style={dmSans}>
                See what's coming up and book community amenities.
              </p>
            </div>
            <AddressCard />
          </div>

          {/* My Reservations */}
          <div data-ux-id="my-reservations" className="bg-white rounded-[18px] drop-shadow-[0px_2px_9px_rgba(18,17,48,0.07)] w-full px-[16px] md:px-[26px] py-[20px] md:py-[24px]">
            <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[20px] leading-normal mb-[18px]" style={dmSans}>
              My Reservations
            </p>
            <div className="overflow-x-auto">
              <table data-ux-id="reservations-table" className="w-full min-w-[560px] border-t border-[#e2e8f0] text-left">
                <thead>
                  <tr className="border-b border-[#e2e8f0]">
                    {["Amenity Name", "Date", "Time", "Status"].map((heading) => (
                      <th key={heading} className="py-[14px] pr-[16px] font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[14px]" style={dmSans}>
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MY_RESERVATIONS.map((reservation) => (
                    <tr key={`${reservation.amenity}-${reservation.date}`} className="border-b border-[#e2e8f0]">
                      <td className="py-[14px] pr-[16px] font-['DM_Sans:Regular',sans-serif] text-[#262630] text-[14px]" style={dmSans}>{reservation.amenity}</td>
                      <td className="py-[14px] pr-[16px] font-['DM_Sans:Regular',sans-serif] text-[#262630] text-[14px] whitespace-nowrap" style={dmSans}>{reservation.date}</td>
                      <td className="py-[14px] pr-[16px] font-['DM_Sans:Regular',sans-serif] text-[#262630] text-[14px] whitespace-nowrap" style={dmSans}>{reservation.time}</td>
                      <td className="py-[14px]">
                        <span
                          className={`inline-flex rounded-full px-[12px] py-[4px] font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[13px] ${
                            reservation.status === "Pending" ? "bg-[#fdecdc] text-[#c4622d]" : "bg-[#dff3e6] text-[#1f7a43]"
                          }`}
                          style={dmSans}
                        >
                          {reservation.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination — everything fits on one page */}
            <div className="flex items-center justify-end gap-[14px] pt-[16px] text-[#262630]">
              <span className="opacity-30"><IconAnglesLeft /></span>
              <span className="opacity-30"><IconChevronLeft /></span>
              <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[14px]" style={dmSans}>Page</span>
              <span className="flex h-[32px] min-w-[40px] items-center justify-center rounded-[6px] border border-[#cfd3da] text-[14px]">1</span>
              <span className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[14px]" style={dmSans}>of 1</span>
              <span className="opacity-30"><IconChevronRightFa /></span>
              <span className="opacity-30"><IconAnglesRight /></span>
            </div>
          </div>

          <div className="w-full border-t border-[#d9e7f0]" />

          {/* Bookable amenities */}
          <div className="flex flex-col gap-[16px]">
            <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[20px] leading-normal" style={dmSans}>
              Book an Amenity
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[20px]">
              {BOOKABLE_AMENITIES.map((amenity) => (
                <div
                  key={amenity.slug}
                  data-ux-id={`amenity-card-${amenity.slug}`}
                  className="flex flex-col gap-[14px] bg-white rounded-[18px] drop-shadow-[0px_2px_9px_rgba(18,17,48,0.07)] p-[18px]"
                >
                  <AmenityCardImage src={amenity.image} alt={amenity.name} icon={amenity.icon} />
                  <div className="flex flex-col gap-[4px] flex-1">
                    <h3 className="font-['DM_Sans:SemiBold',sans-serif] font-semibold text-[#262630] text-[20px] leading-tight" style={dmSans}>
                      {amenity.name}
                    </h3>
                    <p className="font-['DM_Sans:Regular',sans-serif] font-normal text-[#262630] opacity-70 text-[13px]" style={dmSans}>
                      {amenity.details.join("  •  ")}
                    </p>
                  </div>
                  <button
                    type="button"
                    data-ux-id={`amenity-view-availability-${amenity.slug}`}
                    className="w-full rounded-[8px] bg-[#247ae4] py-[11px] font-['DM_Sans:SemiBold',sans-serif] font-semibold text-white text-[15px] transition-colors hover:bg-[#1a6ed0]"
                    style={dmSans}
                  >
                    View Availability
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main Portal (post-onboarding) ─── */
type MainAppProps = {
  onRestart: () => void;
  /** Entered by the Go to portal click, so the dashboard "loads" first. */
  entering: boolean;
};

function MainApp({ onRestart, entering }: MainAppProps) {
  const [activePage, setActivePage] = useState<Page>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardView, setDashboardView] = useState<DashboardView>("homeowner");
  const [askHoaiOpen, setAskHoaiOpen] = useState(true);
  const [quickActionsView, setQuickActionsView] = useState<QuickActionsView | null>(null);
  const [arcForm, setArcForm] = useState<{ id: string; label: string } | null>(null);
  // The dashboard loads when clicked to: Go to portal, Home, ARC Cancel.
  // Walkthrough scene jumps land on it ready, so scene targets exist at once.
  const [dashboardLoads, setDashboardLoads] = useState(entering);
  const [balanceDue, setBalanceDue] = useState(BALANCE_DUE);
  const pay = (amount: string) => setBalanceDue((due) => Math.max(0, due - (Number(amount.replace(/[^0-9.]/g, "")) || 0)));

  // Synced to the app scene, not the cursor's: on a phone scene the app
  // underneath keeps (beat 0) or jumps ahead to (beat 1+) a neighbouring
  // scene's state while it's off-screen. See WalkthroughState.appSceneIndex.
  // Effects are keyed on appSyncKey, which also bumps on ← out of a phone
  // scene's beat 0 (same app scene, but it must be reset to its start).
  const { appPage: scenePage, appSceneId, appScene, appSyncKey, direction } = useCursor();
  // Only drive activePage when the WALKTHROUGH scene changes. Having
  // activePage in the deps would snap manual sidebar nav right back to the
  // scene's page every time the user tried to go somewhere else. Keyed on the
  // scene, not its page: a scene that clicked away (ARC request lands on the
  // fence form) must still hand the next same-page scene a clean dashboard.
  useEffect(() => {
    if (scenePage && scenePage !== "inbox" && scenePage !== "onboarding" && !appScene?.keepPage) {
      setActivePage(scenePage);
    }
    setDashboardLoads(false);
    setQuickActionsView(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appSyncKey]);

  // Launcher-driven sync for the rest of MainApp's state. Reads appScene.appState
  // on each appSyncKey bump — manual toggles between scenes are preserved because
  // this effect doesn't re-run while the user is interacting inside a scene.
  useEffect(() => {
    const target = appScene?.appState;
    if (!target || target.phase !== "portal") return;
    if (target.dashboardView) setDashboardView(target.dashboardView);
    if (typeof target.askHoaiOpen === "boolean") setAskHoaiOpen(target.askHoaiOpen);
    setBalanceDue(target.balancePaid ? 0 : BALANCE_DUE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appSyncKey]);

  // The ask-hoai scene's own focus. Keyed on the app scene, so on a phone
  // scene's first beat right after ask-hoai the panel stays focused and slides
  // out exactly as the audience last saw it; from beat 1 the app scene moves
  // on and the panel morphs back and resets off-screen.
  const askHoaiFocused = appSceneId === "ask-hoai";
  // ← landing on ask-hoai as the app scene (e.g. back out of a phone scene
  // that kept it focused) restarts the scene: the panel resets at once.
  const askHoaiRestart = appSceneId === "ask-hoai" && direction === "back";

  const navigate = (page: Page) => {
    if (page !== activePage) setDashboardLoads(page === "dashboard");
    setActivePage(page);
    setSidebarOpen(false);
  };

  return (
    <div data-ux-id="app-shell" className="bg-gradient-to-b from-[#edf9f2] to-[#ddf2ff] flex h-full w-full overflow-hidden relative">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          data-ux-id="sidebar-mobile-backdrop"
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Sidebar — desktop always visible, mobile slides in as overlay */}
      <div className={`fixed md:static inset-y-0 left-0 z-50 transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <Sidebar activePage={activePage} onNavigate={navigate} onClose={() => setSidebarOpen(false)} onRestart={onRestart} dashboardView={dashboardView} askHoaiOpen={askHoaiOpen} onOpenAskHoai={() => setAskHoaiOpen(true)} onOpenQuickActions={() => setQuickActionsView("menu")} />
      </div>
      {/* AskHoaiPanel is position: fixed (so it can morph sidebar <-> focused),
          so reserve its 400px here on lg+ while it's open or focused. Same
          700ms easing as the panel so pill collapse/expand doesn't jump. */}
      <div
        className={`flex-1 flex min-w-0 transition-[padding] duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] ${
          askHoaiOpen || askHoaiFocused ? "lg:pr-[400px]" : ""
        }`}
      >
        {activePage === "dashboard" ? (
          <DashboardPage onNavigate={navigate} onOpenSidebar={() => setSidebarOpen(true)} view={dashboardView} loads={dashboardLoads} balanceDue={balanceDue} onPay={pay} />
        ) : activePage === "elections" ? (
          <ElectionsPage onOpenSidebar={() => setSidebarOpen(true)} />
        ) : activePage === "amenities" ? (
          <AmenitiesPage onOpenSidebar={() => setSidebarOpen(true)} />
        ) : activePage === "arc-form" && arcForm ? (
          <ArcFormPage
            key={arcForm.id}
            formId={arcForm.id}
            formLabel={arcForm.label}
            onOpenSidebar={() => setSidebarOpen(true)}
            onCancel={() => navigate("dashboard")}
          />
        ) : activePage === "reservations" ? (
          <ReservationsPage onOpenSidebar={() => setSidebarOpen(true)} />
        ) : activePage === "offers" ? (
          <OffersPage onOpenSidebar={() => setSidebarOpen(true)} />
        ) : (
          <CommunityFeedPage onOpenSidebar={() => setSidebarOpen(true)} />
        )}
      </div>
      {/* Pure-white canvas when Ask HOAi is focused — abstracts the chat for the interaction. */}
      <div
        aria-hidden="true"
        className={`fixed inset-0 bg-white z-[180] transition-opacity duration-500 ${askHoaiFocused ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />
      <AskHoaiPanel open={askHoaiOpen} onCollapse={() => setAskHoaiOpen(false)} focused={askHoaiFocused} restart={askHoaiRestart} />
      {/* Floating homeowner/board view toggle hidden for now; scenes set dashboardView. */}
      {quickActionsView && (
        <QuickActionsModal
          view={quickActionsView}
          onClose={() => setQuickActionsView(null)}
          onSelectArc={() => setQuickActionsView("arc")}
          onBackToMenu={() => setQuickActionsView("menu")}
          onPickArcForm={(form) => {
            setArcForm(form);
            setQuickActionsView(null);
            navigate("arc-form");
          }}
        />
      )}
    </div>
  );
}

/* ─── Root App — inbox → onboarding → resident portal ─── */
type AppPhase = "inbox" | "onboarding" | "portal";

export default function App() {
  const [phase, setPhase] = useState<AppPhase>("inbox");
  // Lifted so the opened email survives an inbox → onboarding → inbox round-trip.
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  // When the walkthrough scrubs back from portal, we re-enter onboarding on
  // the done screen (not the default account screen).
  const [onboardingReturnScreen, setOnboardingReturnScreen] = useState<OnboardingScreen | undefined>(undefined);
  // The register CTA "loads" the onboarding flow: a spinner covers it for about
  // a second. Its fade-out is a finite CSS animation, so a walkthrough cursor
  // beat started meanwhile waits it out before moving.
  const [registerLoading, setRegisterLoading] = useState(false);
  // Set by the Go to portal click; a scene jump into the portal leaves it unset.
  const [portalEntering, setPortalEntering] = useState(false);

  // Scene-jump sync: when the launcher jumps to a scene whose appState
  // declares a different phase (and optional onboarding sub-screen), snap
  // this root to that phase so the right subtree mounts before the scene's
  // beats start running. Guarded by appState so natural beat-driven phase
  // transitions (register click, finish onboarding) aren't double-driven.
  // Follows the app scene: a phone scene keeps (beat 0) or skips ahead to
  // (beat 1+) a neighbouring scene's phase while the app is off-screen.
  // Keyed on appSyncKey, so ← out of a phone scene's beat 0 re-applies it too.
  const { appScene, appSyncKey } = useCursor();
  useEffect(() => {
    const target = appScene?.appState;
    if (!target) return;
    if (target.phase !== phase) setPhase(target.phase);
    setPortalEntering(false);
    if (target.phase === "onboarding") {
      setOnboardingReturnScreen(target.onboardingScreen);
    } else {
      setOnboardingReturnScreen(undefined);
    }
    // phase is intentionally not in deps — this runs on appSyncKey bumps only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appSyncKey]);
  if (phase === "inbox") {
    return (
      <InboxPage
        onRegister={() => {
          setRegisterLoading(true);
          setPhase("onboarding");
        }}
        selectedId={selectedEmailId}
        onSelect={setSelectedEmailId}
      />
    );
  }
  if (phase === "onboarding") {
    return (
      <>
        <NewResidentFlow
          key={onboardingReturnScreen ?? "fresh"}
          onComplete={() => {
            setOnboardingReturnScreen(undefined);
            setPortalEntering(true);
            setPhase("portal");
          }}
          initialScreen={onboardingReturnScreen}
        />
        {registerLoading && (
          <div
            data-ux-id="onboarding-loader"
            className="fixed inset-0 z-[240] flex items-center justify-center bg-white animate-[onboarding-loader-out_1250ms_ease-out_forwards]"
            onAnimationEnd={(event) => {
              if (event.target === event.currentTarget) setRegisterLoading(false);
            }}
          >
            <div role="status" aria-label="Loading" className="size-[44px] rounded-full border-[3px] border-[#d9e7f0] border-t-[#247ae4] animate-spin" />
          </div>
        )}
        {/* Walkthrough-only reverse hook: click target for ArrowLeft from the inbox CTA beat */}
        <button
          type="button"
          data-vt-name={VT.OnboardingBackToInbox}
          onClick={() => {
            setRegisterLoading(false);
            setPhase("inbox");
          }}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        >
          Back to inbox
        </button>
      </>
    );
  }
  return (
    <>
      <MainApp onRestart={() => setPhase("inbox")} entering={portalEntering} />
      {/* Walkthrough-only reverse hook: ArrowLeft from the Go-to-portal beat lands back on the done screen */}
      <button
        type="button"
        data-vt-name={VT.PortalBackToDone}
        onClick={() => {
          setOnboardingReturnScreen("done");
          setPhase("onboarding");
        }}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      >
        Back to onboarding done
      </button>
    </>
  );
}
