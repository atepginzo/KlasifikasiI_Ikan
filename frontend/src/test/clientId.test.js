import { describe, it, expect, beforeEach, vi } from "vitest";
import { getClientId } from "../lib/clientId.js";

describe("clientId", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("creates a valid UUID on first call", () => {
    const id = getClientId();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  it("persists and remains stable across multiple calls", () => {
    const id1 = getClientId();
    const id2 = getClientId();
    expect(id1).toBe(id2);
  });

  it("falls back to in-memory UUID when localStorage throws error", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("Storage disabled");
    });
    const idFallback = getClientId();
    expect(idFallback).toBeDefined();
    expect(typeof idFallback).toBe("string");
    vi.restoreAllMocks();
  });
});
