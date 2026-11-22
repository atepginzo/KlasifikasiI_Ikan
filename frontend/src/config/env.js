/**
 * Centralized environment configuration.
 * This is the ONLY place where import.meta.env should be accessed.
 */

export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  appName: "AI Fish Image Classifier",
  appVersion: "0.1.0",
};

export default config;
