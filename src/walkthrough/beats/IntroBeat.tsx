import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export function IntroBeat({
  title,
  logoSrc,
  wordmark,
}: {
  title: string;
  logoSrc?: string;
  wordmark?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [logoFailed, setLogoFailed] = useState(false);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const logo = root.querySelector<HTMLElement>("[data-intro-logo]");
      const titleEl = root.querySelector<HTMLElement>("[data-intro-title]");
      const tl = gsap.timeline();
      if (logo) {
        tl.fromTo(
          logo,
          { opacity: 0, y: 12, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "power2.out" },
        );
      }
      if (titleEl) {
        tl.fromTo(
          titleEl,
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" },
          "-=0.3",
        );
      }
      return () => {
        tl.kill();
      };
    },
    { scope: rootRef, dependencies: [title, logoSrc, wordmark] },
  );

  return (
    <div
      ref={rootRef}
      data-testid="intro-beat"
      className="wt-intro"
    >
      {logoSrc && !logoFailed ? (
        <img
          data-intro-logo
          src={logoSrc}
          alt={wordmark ?? title}
          onError={() => setLogoFailed(true)}
          className="wt-intro-logo"
        />
      ) : (
        <div data-intro-logo className="wt-intro-wordmark">
          {wordmark ?? "Vantaca Home"}
        </div>
      )}
      <div data-intro-title className="wt-intro-title">
        {title}
      </div>
    </div>
  );
}
