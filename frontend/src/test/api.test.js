import { describe, it, expect, beforeEach, vi } from "vitest";
import { predictImage, getHealth } from "../services/api.js";

describe("api service error mapping", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("maps 415 to unsupported format message", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 415,
      json: async () => ({ error: { code: "UNSUPPORTED_MEDIA_TYPE", message: "Invalid type" } }),
    });

    await expect(predictImage(new File([""], "test.txt", { type: "text/plain" }))).rejects.toMatchObject({
      status: 415,
      message: "Format tidak didukung. Gunakan JPG, PNG, atau WebP.",
    });
  });

  it("maps 413 to file too large message", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 413,
      json: async () => ({ error: { code: "PAYLOAD_TOO_LARGE", message: "Too big" } }),
    });

    await expect(predictImage(new File(["x"], "big.png", { type: "image/png" }))).rejects.toMatchObject({
      status: 413,
      message: "Ukuran file melebihi batas maksimum yang diizinkan.",
    });
  });

  it("maps 400 to corrupt file message", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: { code: "INVALID_IMAGE", message: "Cannot read" } }),
    });

    await expect(predictImage(new File(["corrupt"], "bad.png", { type: "image/png" }))).rejects.toMatchObject({
      status: 400,
      message: "File tidak dapat dibaca atau rusak; coba gambar lain.",
    });
  });

  it("maps 503 to model not ready message", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: async () => ({ error: { code: "MODEL_NOT_READY", message: "Not loaded" } }),
    });

    await expect(predictImage(new File(["img"], "img.png", { type: "image/png" }))).rejects.toMatchObject({
      status: 503,
      message: "Model belum siap; coba lagi sebentar lagi.",
    });
  });

  it("handles non-JSON error response gracefully without crashing", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 502,
      json: async () => {
        throw new SyntaxError("Unexpected token < in JSON");
      },
    });

    await expect(getHealth()).rejects.toMatchObject({
      status: 502,
      message: "Terjadi kesalahan di server; coba lagi.",
    });
  });

  it("injects X-Client-Id header in requests", async () => {
    let capturedHeaders = null;
    vi.spyOn(globalThis, "fetch").mockImplementationOnce((url, opts) => {
      capturedHeaders = opts.headers;
      return Promise.resolve({
        ok: true,
        json: async () => ({ status: "ok" }),
      });
    });

    await getHealth();
    expect(capturedHeaders).toHaveProperty("X-Client-Id");
    expect(capturedHeaders["X-Client-Id"]).toMatch(/^[0-9a-f-]{36}$/i);
  });
});
