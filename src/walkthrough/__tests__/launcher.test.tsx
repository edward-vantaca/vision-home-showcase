// @vitest-environment jsdom
// @vitest-environment-options {"url": "http://localhost/"}
import { render, screen, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
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

// The component reads: new URLSearchParams(window.location.search)
// Mocking URLSearchParams constructor avoids triggering jsdom navigation
// (which hangs when history.replaceState is called with a query string in jsdom 29).
const RealURLSearchParams = globalThis.URLSearchParams;

function mockSearchOnce(search: string) {
  const preset = new RealURLSearchParams(search);
  let called = false;
  return vi.spyOn(globalThis, "URLSearchParams").mockImplementation(function (
    this: URLSearchParams,
    init?: string | URLSearchParams | Record<string, string> | string[][],
  ) {
    if (!called) {
      called = true;
      return preset;
    }
    return new RealURLSearchParams(init as string);
  } as unknown as typeof URLSearchParams);
}

function renderWith(search: string) {
  const spy = mockSearchOnce(search);
  capturedApi = null;
  const utils = render(
    <WalkthroughProvider sequences={sequences}>
      <WalkthroughLauncher sequences={sequences} />
      <Probe />
    </WalkthroughProvider>,
  );
  spy.mockRestore();
  return { ...utils, getApi: () => capturedApi! };
}

beforeEach(() => {
  capturedApi = null;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("WalkthroughLauncher", () => {
  it("auto-starts sequence when ?demo=<id>", async () => {
    const { getApi } = renderWith("?demo=demoseq");
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });
    expect(getApi().state.active).toBe(true);
    expect(getApi().state.sequenceId).toBe("demoseq");
  });

  it("renders picker when ?demo=true", async () => {
    renderWith("?demo=true");
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });
    expect(screen.getByTestId("walkthrough-launcher")).toBeInTheDocument();
  });

  it("logs warning for unknown sequence id", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { getApi } = renderWith("?demo=does-not-exist");
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });
    expect(warn).toHaveBeenCalled();
    expect(getApi().state.active).toBe(false);
    warn.mockRestore();
  });

  it("Cmd+Shift+W opens picker", async () => {
    renderWith("");
    await act(async () => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key: "w", metaKey: true, shiftKey: true, bubbles: true }),
      );
    });
    expect(screen.getByTestId("walkthrough-launcher")).toBeInTheDocument();
  });
});
