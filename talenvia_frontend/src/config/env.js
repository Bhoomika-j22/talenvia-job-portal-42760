/**
 * Environment configuration for Talenvia frontend.
 * Reads Create React App environment variables (prefixed with REACT_APP_).
 *
 * NOTE:
 * - In CRA, only REACT_APP_* vars are injected into the client bundle at build time.
 * - Some deployment setups provide SUPABASE_URL / SUPABASE_KEY; this module supports
 *   them as a fallback, but those may still be empty in CRA unless the build step
 *   explicitly exposes them.
 */

/* eslint-disable no-undef */

let _didLogEnvOnce = false;

function safeEnv(name) {
  // CRA replaces process.env.* at build time; in other contexts these may be undefined.
  try {
    return process?.env?.[name];
  } catch {
    return undefined;
  }
}

function parseBoolean(value, defaultValue = false) {
  if (value === undefined || value === null) return defaultValue;
  const s = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "y", "on"].includes(s)) return true;
  if (["0", "false", "no", "n", "off"].includes(s)) return false;
  return defaultValue;
}

function safeJsonParse(value, fallback = {}) {
  if (!value) return fallback;
  if (typeof value === "object") return value;
  try {
    const parsed = JSON.parse(String(value));
    // Only accept plain objects.
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
    return fallback;
  } catch {
    return fallback;
  }
}

function pickSupabaseValue({ preferredName, fallbackName }) {
  const preferred = safeEnv(preferredName);
  const fallback = safeEnv(fallbackName);
  return (preferred || fallback || "").trim();
}

// PUBLIC_INTERFACE
export function getEnvConfig() {
  /**
   * Returns a structured view of environment variables used by the frontend.
   * Do not assume endpoints exist; consumers should treat base URLs as optional.
   */
  const apiBase = (safeEnv("REACT_APP_API_BASE") || "").trim();
  const backendUrl = (safeEnv("REACT_APP_BACKEND_URL") || "").trim();
  const frontendUrl = (safeEnv("REACT_APP_FRONTEND_URL") || "").trim();
  const wsUrl = (safeEnv("REACT_APP_WS_URL") || "").trim();
  const nodeEnv = (safeEnv("REACT_APP_NODE_ENV") || safeEnv("NODE_ENV") || "development").trim();
  const logLevel = (safeEnv("REACT_APP_LOG_LEVEL") || "info").trim();

  const featureFlags = safeJsonParse(safeEnv("REACT_APP_FEATURE_FLAGS"), {});

  const experimentsEnabled = parseBoolean(safeEnv("REACT_APP_EXPERIMENTS_ENABLED"), false);

  /**
   * Supabase env handling notes:
   * - CRA expects REACT_APP_* variables; ensure you set:
   *   - REACT_APP_SUPABASE_URL
   *   - REACT_APP_SUPABASE_ANON_KEY (preferred) or REACT_APP_SUPABASE_KEY (legacy)
   *
   * Back-compat:
   * - Some environments provide SUPABASE_URL / SUPABASE_KEY; we read those as fallback.
   */
  const supabaseUrl = pickSupabaseValue({
    preferredName: "REACT_APP_SUPABASE_URL",
    fallbackName: "SUPABASE_URL",
  });

  // Prefer official name, but accept older/alternate names.
  const supabaseAnonKey = pickSupabaseValue({
    preferredName: "REACT_APP_SUPABASE_ANON_KEY",
    fallbackName: "REACT_APP_SUPABASE_KEY",
  }) || pickSupabaseValue({ preferredName: "SUPABASE_KEY", fallbackName: "SUPABASE_ANON_KEY" });

  // Feature flag evaluation:
  // - If enableSupabase is explicitly set, respect it.
  // - Otherwise, "configured implies enabled" so config alone is enough to attempt Supabase usage.
  const configured = Boolean(supabaseUrl && supabaseAnonKey);
  const enableSupabase =
    typeof featureFlags?.enableSupabase === "boolean" ? featureFlags.enableSupabase : configured;

  if (!_didLogEnvOnce) {
    _didLogEnvOnce = true;
    const maskedKey = supabaseAnonKey
      ? `${supabaseAnonKey.slice(0, 6)}…${supabaseAnonKey.slice(-4)}`
      : "";

    // eslint-disable-next-line no-console
    console.debug("[env] resolved", {
      nodeEnv,
      hasSupabaseUrl: Boolean(supabaseUrl),
      hasSupabaseAnonKey: Boolean(supabaseAnonKey),
      supabaseAnonKeyMasked: maskedKey,
      featureFlagsRaw: safeEnv("REACT_APP_FEATURE_FLAGS") ? "(present)" : "(missing)",
      enableSupabase,
      configured,
    });
  }

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

// PUBLIC_INTERFACE
export function getSupabaseEnv() {
  /** Convenience accessor for Supabase-related env values from env.js. */
  const { supabaseUrl, supabaseAnonKey, enableSupabase } = getEnvConfig();
  return { supabaseUrl, supabaseAnonKey, enableSupabase };
}

// PUBLIC_INTERFACE
export function isSupabaseConfigured() {
  /** True when env.js resolves both Supabase URL and anon key. */
  const { supabaseUrl, supabaseAnonKey } = getEnvConfig();
  return Boolean(supabaseUrl && supabaseAnonKey);
}

// PUBLIC_INTERFACE
export function isSupabaseEnabled() {
  /**
   * True when Supabase should be used.
   * If REACT_APP_FEATURE_FLAGS.enableSupabase isn't explicitly set, configuration implies enabled.
   */
  const { enableSupabase } = getEnvConfig();
  return Boolean(enableSupabase);
}
