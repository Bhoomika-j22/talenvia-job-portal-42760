/**
 * Environment configuration for Talenvia frontend.
 * Reads Create React App environment variables (prefixed with REACT_APP_).
 */

/* eslint-disable no-undef */

/**
 * PUBLIC_INTERFACE
 * Returns a structured view of environment variables used by the frontend.
 * Do not assume endpoints exist; consumers should treat base URLs as optional.
 */
export function getEnvConfig() {
  const apiBase = process.env.REACT_APP_API_BASE || "";
  const backendUrl = process.env.REACT_APP_BACKEND_URL || "";
  const frontendUrl = process.env.REACT_APP_FRONTEND_URL || "";
  const wsUrl = process.env.REACT_APP_WS_URL || "";
  const nodeEnv = process.env.REACT_APP_NODE_ENV || process.env.NODE_ENV || "development";
  const logLevel = process.env.REACT_APP_LOG_LEVEL || "info";

  let featureFlags = {};
  try {
    featureFlags = process.env.REACT_APP_FEATURE_FLAGS ? JSON.parse(process.env.REACT_APP_FEATURE_FLAGS) : {};
  } catch {
    featureFlags = {};
  }

  const experimentsEnabled = String(process.env.REACT_APP_EXPERIMENTS_ENABLED || "false") === "true";

  return {
    apiBase,
    backendUrl,
    frontendUrl,
    wsUrl,
    nodeEnv,
    logLevel,
    featureFlags,
    experimentsEnabled,
  };
}
