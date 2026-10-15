import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { WalkthroughRoot } from "./walkthrough/WalkthroughRoot";
import { homeVisionSequence } from "./walkthrough/scenes";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WalkthroughRoot sequence={homeVisionSequence}>
      <App />
    </WalkthroughRoot>
  </React.StrictMode>,
);
