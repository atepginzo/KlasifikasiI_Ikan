/**
 * API service layer — single fetch wrapper.
 * Normalizes errors, injects X-Client-Id, enforces timeouts.
 */

import { API_BASE_URL } from "../config/env.js";
import { getClientId } from "../lib/clientId.js";

const DEFAULT_TIMEOUT_MS = 60_000;

function buildHeaders(extra = {}) {
  return {
    "X-Client-Id": getClientId(),
    ...extra,
  };
}

async function request(path, options = {}) {
  const { timeout = DEFAULT_TIMEOUT_MS, signal: externalSignal, ...rest } = options;

  const controller = new AbortController();
  const timerId = setTimeout(() => controller.abort("timeout"), timeout);

  // Merge external signal if provided
  if (externalSignal) {
    externalSignal.addEventListener("abort", () =>
      controller.abort(externalSignal.reason)
    );
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      signal: controller.signal,
      headers: buildHeaders(rest.headers),
    });
  } catch (err) {
    clearTimeout(timerId);
    if (err?.name === "AbortError" || err === "timeout") {
      throw { code: "ABORTED", message: null, status: 0, requestId: null };
    }
    throw {
      code: "NETWORK_ERROR",
      message: "Tidak dapat menghubungi server; periksa koneksi, lalu coba lagi.",
      status: 0,
      requestId: null,
    };
  }
  clearTimeout(timerId);

  // Try to parse JSON
  let data;
  try {
    data = await response.json();
  } catch {
    // Non-JSON response (502, proxy error, etc.)
    if (!response.ok) {
      throw {
        code: "SERVER_ERROR",
        message: "Terjadi kesalahan di server; coba lagi.",
        status: response.status,
        requestId: null,
      };
    }
    return {};
  }

  if (!response.ok) {
    const err = data?.error ?? {};
    const code = err.code ?? `HTTP_${response.status}`;
    const requestId = data?.request_id ?? null;
    const message = mapErrorToMessage(response.status, err.message, code);
    throw { code, message, status: response.status, requestId, raw: err };
  }

  return data;
}

function mapErrorToMessage(status, serverMsg, code) {
  switch (status) {
    case 415:
      return "Format tidak didukung. Gunakan JPG, PNG, atau WebP.";
    case 413:
      return "Ukuran file melebihi batas maksimum yang diizinkan.";
    case 400:
      return "File tidak dapat dibaca atau rusak; coba gambar lain.";
    case 503:
      return "Model belum siap; coba lagi sebentar lagi.";
    case 500:
      return "Terjadi kesalahan di server; coba lagi.";
    default:
      return serverMsg ?? "Terjadi kesalahan; silakan coba lagi.";
  }
}

// --- Public API functions ---

export async function getHealth(options) {
  return request("/api/v1/health", options);
}

export async function getModelInfo(options) {
  return request("/api/v1/model-info", options);
}

/**
 * @param {File} file
 * @param {{ signal?: AbortSignal }} options
 */
export async function predictImage(file, options = {}) {
  const form = new FormData();
  form.append("file", file);
  return request("/api/v1/predict", {
    method: "POST",
    body: form,
    signal: options.signal,
  });
}

export async function listPredictions(options) {
  return request("/api/v1/predictions", options);
}

export async function getPrediction(id, options) {
  return request(`/api/v1/predictions/${id}`, options);
}

export async function deletePrediction(id, options) {
  return request(`/api/v1/predictions/${id}`, { method: "DELETE", ...options });
}

export async function deleteAllPredictions(options) {
  return request(`/api/v1/predictions?client_id=${getClientId()}`, {
    method: "DELETE",
    ...options,
  });
}

export async function sendFeedback(id, payload, options) {
  return request(`/api/v1/predictions/${id}/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    ...options,
  });
}
