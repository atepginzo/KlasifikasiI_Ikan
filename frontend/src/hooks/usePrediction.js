import { useReducer, useCallback, useRef } from "react";
import { predictImage } from "../services/api.js";

const initialState = {
  phase: "idle", // idle | selected | predicting | success | error
  file: null,
  previewUrl: null,
  result: null,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "SELECT":
      return {
        ...initialState,
        phase: "selected",
        file: action.file,
        previewUrl: action.previewUrl,
      };
    case "PREDICT_START":
      return { ...state, phase: "predicting", error: null };
    case "PREDICT_SUCCESS":
      return { ...state, phase: "success", result: action.result };
    case "PREDICT_ERROR":
      return { ...state, phase: "error", error: action.error };
    case "RESET":
      return { ...initialState };
    default:
      return state;
  }
}

/**
 * State machine hook for the prediction flow.
 * idle → selected → predicting → success | error
 */
export function usePrediction() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const abortRef = useRef(null);

  // Revoke old object URL to avoid memory leaks
  const revokePreview = useCallback(() => {
    if (state.previewUrl) {
      URL.revokeObjectURL(state.previewUrl);
    }
  }, [state.previewUrl]);

  const selectFile = useCallback(
    (file) => {
      revokePreview();
      abortRef.current?.abort();
      const previewUrl = URL.createObjectURL(file);
      dispatch({ type: "SELECT", file, previewUrl });
    },
    [revokePreview]
  );

  const predict = useCallback(async () => {
    if (!state.file || state.phase === "predicting") return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    dispatch({ type: "PREDICT_START" });
    try {
      const result = await predictImage(state.file, {
        signal: controller.signal,
      });
      if (!controller.signal.aborted) {
        dispatch({ type: "PREDICT_SUCCESS", result: result.data ?? result });
      }
    } catch (err) {
      if (err?.code === "ABORTED") return; // User cancelled — no error shown
      if (!controller.signal.aborted) {
        dispatch({ type: "PREDICT_ERROR", error: err });
      }
    }
  }, [state.file, state.phase]);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    revokePreview();
    dispatch({ type: "RESET" });
  }, [revokePreview]);

  return { state, selectFile, predict, reset };
}
