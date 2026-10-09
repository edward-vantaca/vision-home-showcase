import { render, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useWalkthroughKeyboard } from "../keyboard";
import { WalkthroughProvider, useWalkthrough } from "../WalkthroughProvider";
import type { Sequence } from "../types";

const sequences: Record<string, Sequence> = {
  s1: {
    id: "s1",
    title: "T",
    beats: [
      { kind: "highlight", target: "a" },
      { kind: "highlight", target: "b" },
      { kind: "highlight", target: "c" },
    ],
  },
};

function Harness({ onReady }: { onReady: (api: ReturnType<typeof useWalkthrough>) => void }) {
  useWalkthroughKeyboard();
  const api = useWalkthrough();
  onReady(api);
  return <div data-testid="state">{String(api.state.currentBeatIndex)}</div>;
}

function renderHarness() {
  let api!: ReturnType<typeof useWalkthrough>;
  const utils = render(
    <WalkthroughProvider sequences={sequences}>
      <Harness onReady={(a) => (api = a)} />
    </WalkthroughProvider>,
  );
  return { ...utils, getApi: () => api };
}

describe("useWalkthroughKeyboard", () => {
  it("ArrowRight advances when active", async () => {
    const { getApi } = renderHarness();
    getApi().start("s1");
    await waitFor(() => {
      document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
      expect(getApi().state.currentBeatIndex).toBe(1);
    });
  });

  it("ArrowLeft steps back", async () => {
    const { getApi } = renderHarness();
    getApi().start("s1");
    document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
    await waitFor(() => {
      expect(getApi().state.currentBeatIndex).toBe(0);
    });
  });

  it("Escape exits", async () => {
    const { getApi } = renderHarness();
    getApi().start("s1");
    document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await waitFor(() => {
      expect(getApi().state.active).toBe(false);
    });
  });

  it("H toggles HUD", async () => {
    const { getApi } = renderHarness();
    getApi().start("s1");
    expect(getApi().state.hudVisible).toBe(true);
    await waitFor(() => {
      document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "h", bubbles: true }));
      expect(getApi().state.hudVisible).toBe(false);
    });
  });

  it(". skips to last beat", async () => {
    const { getApi } = renderHarness();
    getApi().start("s1");
    await waitFor(() => {
      document.body.dispatchEvent(new KeyboardEvent("keydown", { key: ".", bubbles: true }));
      expect(getApi().state.currentBeatIndex).toBe(2);
    });
  });

  it("Space advances (clicker compatibility)", async () => {
    const { getApi } = renderHarness();
    getApi().start("s1");
    await waitFor(() => {
      document.body.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
      expect(getApi().state.currentBeatIndex).toBe(1);
    });
  });

  it("keys do nothing when tour inactive", async () => {
    const { getApi } = renderHarness();
    document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    expect(getApi().state.active).toBe(false);
    expect(getApi().state.currentBeatIndex).toBe(0);
  });
});
