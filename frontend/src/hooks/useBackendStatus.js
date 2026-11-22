import { useState, useEffect } from "react";
import { getHealth, getModelInfo } from "../services/api.js";

/**
 * Fetches /health and /model-info on mount; re-fetches on retry.
 * Provides backend readiness state to the whole app.
 */
export function useBackendStatus() {
  const [status, setStatus] = useState("loading"); // "loading" | "ok" | "error"
  const [modelInfo, setModelInfo] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setStatus("loading");
    let cancelled = false;

    async function check() {
      try {
        const [health, info] = await Promise.all([
          getHealth(),
          getModelInfo(),
        ]);
        if (cancelled) return;
        if (health?.model_loaded === false) {
          setStatus("model_not_loaded");
        } else {
          setStatus("ok");
        }
        setModelInfo(info);
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    check();
    return () => {
      cancelled = true;
    };
  }, [retryCount]);

  const retry = () => setRetryCount((n) => n + 1);

  return { status, modelInfo, retry };
}
