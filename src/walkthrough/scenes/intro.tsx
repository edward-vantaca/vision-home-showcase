import type { Scene } from "../types";

// Logo lives in src/assets. If the file isn't present the IntroBeat falls back
// to a styled text wordmark so the walkthrough still looks intentional.
const vantacaLogo = new URL("../../assets/vantaca-home-logo.png", import.meta.url).href;

export const introScene: Scene = {
  id: "intro",
  label: "Intro",
  page: "inbox",
  appState: { phase: "inbox" },
  beats: [
    {
      kind: "intro",
      title: "Resident and Board Member Journey",
      logoSrc: vantacaLogo,
      wordmark: "Vantaca Home",
    },
  ],
};
