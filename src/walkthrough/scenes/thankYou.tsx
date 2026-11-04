import type { Scene } from "../types";

// Closing title card: the intro's white card and Vantaca Home logo, with
// "Thank you" in place of the journey title. The association's home page
// stays behind it, so ← lands back on the site the walkthrough ended on.
const vantacaLogo = new URL("../../assets/vantaca-home-logo.png", import.meta.url).href;

export const thankYouScene: Scene = {
  id: "thank-you",
  label: "Thank you",
  page: "dashboard",
  appState: { phase: "site" },
  beats: [
    {
      kind: "intro",
      title: "Thank you",
      logoSrc: vantacaLogo,
      wordmark: "Vantaca Home",
    },
  ],
};
