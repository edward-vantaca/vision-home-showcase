import React, { useCallback, useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { WalkthroughProvider } from "./walkthrough/WalkthroughProvider";
import { WalkthroughStage } from "./walkthrough/WalkthroughStage";
import { WalkthroughLauncher } from "./walkthrough/WalkthroughLauncher";
import { sequenceRegistry } from "./walkthrough/sequences";

function Root() {
  const [pendingNav, setPendingNav] = useState<string | null>(null);
  const onNavigate = useCallback((page: string) => setPendingNav(page), []);
  return (
    <WalkthroughProvider sequences={sequenceRegistry} onNavigate={onNavigate}>
      <App externalNavRequest={pendingNav} onExternalNavConsumed={() => setPendingNav(null)} />
      <WalkthroughStage />
      <WalkthroughLauncher sequences={sequenceRegistry} />
    </WalkthroughProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
