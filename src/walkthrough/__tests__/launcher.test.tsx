import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { WalkthroughLauncher } from "../WalkthroughLauncher";
import { WalkthroughProvider, useWalkthrough } from "../WalkthroughProvider";
import type { Sequence } from "../types";

const sequences: Record<string, Sequence> = {
  demoseq: { id: "demoseq", title: "Demo Seq", beats: [{ kind: "highlight", target: "a" }] },
};

function Probe({ onReady }: { onReady: (api: ReturnType<typeof useWalkthrough>) => void }) {
  const api = useWalkthrough();
  onReady(api);
  return null;
}

function renderWith(url: string) {
  const u = new URL(`http://localhost/${url}`);
  Object.defineProperty(window, "location", {
    writable: true,
    value: { href: u.href, search: u.search },
  });
  let api!: ReturnType<typeof useWalkthrough>;
  const utils = render(
    <WalkthroughProvider sequences={sequences}>
      <WalkthroughLauncher sequences={sequences} />
      <Probe onReady={(a) => (api = a)} />
    </WalkthroughProvider>,
  );
  return { ...utils, getApi: () => api };
}

beforeEach(() => {
  const u = new URL("http://localhost/");
  Object.defineProperty(window, "location", {
    writable: true,
    value: { href: u.href, search: u.search },
  });
});

describe("WalkthroughLauncher", () => {
  it("auto-starts sequence when ?demo=<id>", () => {
    const { getApi } = renderWith("?demo=demoseq");
    expect(getApi().state.active).toBe(true);
    expect(getApi().state.sequenceId).toBe("demoseq");
  });

  it("renders picker when ?demo=true", () => {
    renderWith("?demo=true");
    expect(screen.getByTestId("walkthrough-launcher")).toBeInTheDocument();
  });

  it("logs warning for unknown sequence id", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { getApi } = renderWith("?demo=does-not-exist");
    expect(warn).toHaveBeenCalled();
    expect(getApi().state.active).toBe(false);
    warn.mockRestore();
  });

  it("Cmd+Shift+W opens picker", () => {
    renderWith("");
    document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "w", metaKey: true, shiftKey: true, bubbles: true }));
    expect(screen.getByTestId("walkthrough-launcher")).toBeInTheDocument();
  });
});
