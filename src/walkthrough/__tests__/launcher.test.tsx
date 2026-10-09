import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useEffect } from "react";
import { WalkthroughLauncher } from "../WalkthroughLauncher";
import { WalkthroughProvider, useWalkthrough } from "../WalkthroughProvider";
import type { Sequence } from "../types";

const sequences: Record<string, Sequence> = {
  demoseq: { id: "demoseq", title: "Demo Seq", beats: [{ kind: "highlight", target: "a" }] },
};

let capturedApi: ReturnType<typeof useWalkthrough> | null = null;

function Probe() {
  const api = useWalkthrough();
  useEffect(() => {
    capturedApi = api;
  }, [api]);
  return null;
}

function setLocationSearch(url: string) {
  const u = new URL(`http://localhost/${url}`);
  Object.defineProperty(window, "location", {
    writable: true,
    configurable: true,
    value: { href: u.href, search: u.search },
  });
}

function renderWith(url: string) {
  setLocationSearch(url);
  capturedApi = null;
  const utils = render(
    <WalkthroughProvider sequences={sequences}>
      <WalkthroughLauncher sequences={sequences} />
      <Probe />
    </WalkthroughProvider>,
  );
  return { ...utils, getApi: () => capturedApi! };
}

beforeEach(() => {
  setLocationSearch("");
});

describe("WalkthroughLauncher", () => {
  it("auto-starts sequence when ?demo=<id>", async () => {
    const { getApi } = renderWith("?demo=demoseq");
    await new Promise((r) => setTimeout(r, 10));
    expect(getApi().state.active).toBe(true);
    expect(getApi().state.sequenceId).toBe("demoseq");
  });

  it("renders picker when ?demo=true", async () => {
    renderWith("?demo=true");
    await new Promise((r) => setTimeout(r, 10));
    expect(screen.getByTestId("walkthrough-launcher")).toBeInTheDocument();
  });

  it("logs warning for unknown sequence id", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { getApi } = renderWith("?demo=does-not-exist");
    await new Promise((r) => setTimeout(r, 10));
    expect(warn).toHaveBeenCalled();
    expect(getApi().state.active).toBe(false);
    warn.mockRestore();
  });

  it("Cmd+Shift+W opens picker", async () => {
    renderWith("");
    document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "w", metaKey: true, shiftKey: true, bubbles: true }));
    await new Promise((r) => setTimeout(r, 10));
    expect(screen.getByTestId("walkthrough-launcher")).toBeInTheDocument();
  });
});
