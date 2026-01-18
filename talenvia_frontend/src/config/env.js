/**
 * Environment configuration for Talenvia frontend.
 * Reads Create React App environment variables (prefixed with REACT_APP_).
 */

/* eslint-disable no-undef */

let _didLogSupabaseEnvSource = false;

function safeEnv(name) {
  // CRA replaces process.env.* at build time; in other contexts these may be undefined.
  try {
    return process?.env?.[name];
  } catch {
    return undefined;
  }
}

function pickSupabaseValue({ preferredName, fallbackName, label }) {
  const preferred = safeEnv(preferredName);
  const fallback = safeEnv(fallbackName);

  if (preferred) {
    if (!_didLogSupabaseEnvSource) {
      // eslint-disable-next-line no-console
      console.info("[env] Supabase config source:", { [label]: preferredName });
      _didLogSupabaseEnvSource = true;
    }
    return { value: preferred, source: preferredName };
  }

  if (fallback) {
    if (!_didLogSupabaseEnvSource) {
      // eslint-disable-next-line no-console
      console.info("[env] Supabase config source (fallback):", { [label]: fallbackName });
      _didLogSupabaseEnvSource = true;
    }
    return { value: fallback, source: fallbackName };
  }

  return { value: "", source: null };
}

/**
 * PUBLIC_INTERFACE
 * Returns a structured view of environment variables used by the frontend.
 * Do not assume endpoints exist; consumers should treat base URLs as optional.
 */
export function getEnvConfig() {
  const apiBase = safeEnv("REACT_APP_API_BASE") || "";
  const backendUrl = safeEnv("REACT_APP_BACKEND_URL") || "";
  const frontendUrl = safeEnv("REACT_APP_FRONTEND_URL") || "";
  const wsUrl = safeEnv("REACT_APP_WS_URL") || "";
  const nodeEnv = safeEnv("REACT_APP_NODE_ENV") || safeEnv("NODE_ENV") || "development";
  const logLevel = safeEnv("REACT_APP_LOG_LEVEL") || "info";

  let featureFlags = {};
  try {
    featureFlags = safeEnv("REACT_APP_FEATURE_FLAGS") ? JSON.parse(safeEnv("REACT_APP_FEATURE_FLAGS")) : {};
  } catch {
    featureFlags = {};
  }

  const experimentsEnabled = String(safeEnv("REACT_APP_EXPERIMENTS_ENABLED") || "false") === "true";

  /**
   * Supabase env handling notes:
   * - CRA only exposes env vars prefixed with REACT_APP_ at build time.
   * - Some platforms provide SUPABASE_URL / SUPABASE_KEY (non-REACT prefixes).
   *
   * This module remains backward compatible by exporting:
   * - supabaseUrl: REACT_APP_SUPABASE_URL OR (fallback) SUPABASE_URL
   * - supabaseAnonKey: REACT_APP_SUPABASE_ANON_KEY OR (fallback) SUPABASE_KEY
   *
   * Existing mock flows remain default. Turn on Supabase paths by setting:
   *   REACT_APP_FEATURE_FLAGS='{"enableSupabase": true}'
   */
  const supabaseUrlPick = pickSupabaseValue({
    preferredName: "REACT_APP_SUPABASE_URL",
    fallbackName: "SUPABASE_URL",
    label: "url",
  });

  const supabaseKeyPick = pickSupabaseValue({
    preferredName: "REACT_APP_SUPABASE_ANON_KEY",
    fallbackName: "SUPABASE_KEY",
    label: "anonKey",
  });

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
    supabaseUrl: supabaseUrlPick.value,
    supabaseAnonKey: supabaseKeyPick.value,
    enableSupabase,
  };
}
