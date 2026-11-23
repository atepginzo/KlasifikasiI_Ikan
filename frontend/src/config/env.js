/**
 * Centralized environment configuration.
 * All import.meta.env reads happen here — nowhere else.
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "";
