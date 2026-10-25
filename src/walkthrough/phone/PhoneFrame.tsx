import type { ReactNode } from "react";
import "../walkthrough.css";

/** Phone bezel and dynamic island around a screen (styles in walkthrough.css). */
export default function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="sms-phone">
      <div className="sms-screen">
        <div className="sms-island" aria-hidden="true" />
        {children}
      </div>
    </div>
  );
}
