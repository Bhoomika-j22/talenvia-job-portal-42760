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

  /**
   * Supabase env handling notes:
   * - CRA only exposes env vars prefixed with REACT_APP_ at build time.
   * - The platform currently provides SUPABASE_URL / SUPABASE_KEY (non-REACT prefixes).
   * - To enable Supabase on the frontend, map them to:
   *   - REACT_APP_SUPABASE_URL
   *   - REACT_APP_SUPABASE_ANON_KEY
   *
   * Existing mock flows remain default. Turn on Supabase paths by setting:
   *   REACT_APP_FEATURE_FLAGS='{"enableSupabase": true}'
   */
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || "";

  // Feature flag gate (defaults to false so we never break mock flows).
  const enableSupabase = Boolean(featureFlags?.enableSupabase);

  return {
    apiBase,
    backendUrl,
    frontendUrl,
    wsUrl,
    nodeEnv,
    logLevel,
    featureFlags,
    experimentsEnabled,

    // Supabase (optional)
    supabaseUrl,
    supabaseAnonKey,
    enableSupabase,
  };
}
