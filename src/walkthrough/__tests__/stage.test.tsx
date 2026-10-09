import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { WalkthroughProvider, useWalkthrough } from "../WalkthroughProvider";
import { WalkthroughStage } from "../WalkthroughStage";
import type { Sequence } from "../types";

const sequences: Record<string, Sequence> = {
  s1: {
    id: "s1",
    title: "T",
    beats: [{ kind: "highlight", target: "a", caption: "hello" }],
  },
};

function Launcher() {
  const { start } = useWalkthrough();
  return <button onClick={() => start("s1")}>start</button>;
}

describe("WalkthroughStage", () => {
  it("does not render when inactive", () => {
    render(
      <WalkthroughProvider sequences={sequences}>
        <Launcher />
        <WalkthroughStage />
      </WalkthroughProvider>,
    );
    expect(screen.queryByTestId("walkthrough-stage")).toBeNull();
  });

  it("renders stage when active", async () => {
    render(
      <WalkthroughProvider sequences={sequences}>
        <Launcher />
        <WalkthroughStage />
      </WalkthroughProvider>,
    );
    await userEvent.click(screen.getByText("start"));
    expect(screen.getByTestId("walkthrough-stage")).toBeInTheDocument();
  });

  it("renders HUD when hudVisible", async () => {
    render(
      <WalkthroughProvider sequences={sequences}>
        <Launcher />
        <WalkthroughStage />
      </WalkthroughProvider>,
    );
    await userEvent.click(screen.getByText("start"));
    expect(screen.getByTestId("walkthrough-hud")).toBeInTheDocument();
  });

  it("hides HUD when hudVisible is false", async () => {
    render(
      <WalkthroughProvider sequences={sequences}>
        <Launcher />
        <WalkthroughStage />
      </WalkthroughProvider>,
    );
    await userEvent.click(screen.getByText("start"));
    await userEvent.keyboard("h");
    expect(screen.queryByTestId("walkthrough-hud")).toBeNull();
  });

  it("Esc unmounts stage", async () => {
    render(
      <WalkthroughProvider sequences={sequences}>
        <Launcher />
        <WalkthroughStage />
      </WalkthroughProvider>,
    );
    await userEvent.click(screen.getByText("start"));
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByTestId("walkthrough-stage")).toBeNull();
  });
});
