import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePrediction } from "../hooks/usePrediction.js";
import * as api from "../services/api.js";

describe("usePrediction state machine", () => {
  it("initializes in idle phase with null state", () => {
    const { result } = renderHook(() => usePrediction());
    expect(result.current.state.phase).toBe("idle");
    expect(result.current.state.file).toBeNull();
    expect(result.current.state.result).toBeNull();
  });

  it("transitions to selected phase when file is chosen", () => {
    const { result } = renderHook(() => usePrediction());
    const mockFile = new File(["test"], "fish.png", { type: "image/png" });

    act(() => {
      result.current.selectFile(mockFile);
    });

    expect(result.current.state.phase).toBe("selected");
    expect(result.current.state.file).toBe(mockFile);
    expect(result.current.state.previewUrl).toBeDefined();
  });

  it("transitions selected -> predicting -> success on predict resolution", async () => {
    const mockResponse = {
      predicted_class: "fish_01",
      confidence: 0.99,
      top5: [{ class_name: "fish_01", confidence: 0.99 }],
    };
    vi.spyOn(api, "predictImage").mockResolvedValueOnce({ data: mockResponse });

    const { result } = renderHook(() => usePrediction());
    const mockFile = new File(["test"], "fish.png", { type: "image/png" });

    act(() => {
      result.current.selectFile(mockFile);
    });

    await act(async () => {
      await result.current.predict();
    });

    expect(result.current.state.phase).toBe("success");
    expect(result.current.state.result.predicted_class).toBe("fish_01");
  });

  it("resets state back to idle cleanly", () => {
    const { result } = renderHook(() => usePrediction());
    const mockFile = new File(["test"], "fish.png", { type: "image/png" });

    act(() => {
      result.current.selectFile(mockFile);
    });
    expect(result.current.state.phase).toBe("selected");

    act(() => {
      result.current.reset();
    });
    expect(result.current.state.phase).toBe("idle");
    expect(result.current.state.file).toBeNull();
    expect(result.current.state.result).toBeNull();
  });
});
