/**
 * Environment configuration for Talenvia frontend.
 *
 * Sources (in priority order):
 * 1) window.__RUNTIME_ENV__ (optional runtime injection via /public/env.js)
 * 2) process.env (CRA build-time injected variables)
 *
 * Notes:
 * - CRA normally only injects REACT_APP_* at build time.
 * - Some environments provide SUPABASE_URL / SUPABASE_KEY; this module supports them.
 */

/* eslint-disable no-undef */

let _didLogEnvOnce = false;

function getRuntimeEnv() {
  try {
    // eslint-disable-next-line no-undef
    return typeof window !== "undefined" ? window.__RUNTIME_ENV__ : undefined;
  } catch {
    return undefined;
  }
}

function safeEnv(name) {
  /**
   * Reads env from runtime injection first, then falls back to process.env.
   * This allows “runtime env” deployments without a rebuild.
   */
  const runtimeEnv = getRuntimeEnv();
  if (runtimeEnv && Object.prototype.hasOwnProperty.call(runtimeEnv, name)) {
    return runtimeEnv[name];
  }

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
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
    return fallback;
  } catch {
    return fallback;
  }
}

function pickFirstNonEmpty(entries) {
  for (const entry of entries) {
    const v = safeEnv(entry);
    const trimmed = (v || "").toString().trim();
    if (trimmed) return trimmed;
  }
  return "";
}

function resolveSupabaseUrl() {
  const value = pickFirstNonEmpty(["REACT_APP_SUPABASE_URL", "SUPABASE_URL"]);
  const source = value
    ? safeEnv("REACT_APP_SUPABASE_URL")
      ? "REACT_APP_SUPABASE_URL"
      : "SUPABASE_URL"
    : null;
  return { value, source };
}

function resolveSupabaseAnonKey() {
  // Accept a wide set of names to reduce “false missing” cases:
  // - Preferred: REACT_APP_SUPABASE_ANON_KEY
  // - Legacy/Template: REACT_APP_SUPABASE_KEY
  // - Non-CRA envs: SUPABASE_ANON_KEY / SUPABASE_KEY
  const value = pickFirstNonEmpty([
    "REACT_APP_SUPABASE_ANON_KEY",
    "REACT_APP_SUPABASE_KEY",
    "SUPABASE_ANON_KEY",
    "SUPABASE_KEY",
  ]);

  const source = value
    ? safeEnv("REACT_APP_SUPABASE_ANON_KEY")
      ? "REACT_APP_SUPABASE_ANON_KEY"
      : safeEnv("REACT_APP_SUPABASE_KEY")
        ? "REACT_APP_SUPABASE_KEY"
        : safeEnv("SUPABASE_ANON_KEY")
          ? "SUPABASE_ANON_KEY"
          : "SUPABASE_KEY"
    : null;

  return { value, source };
}

function maskSecret(secret) {
  if (!secret) return "";
  const s = String(secret);
  if (s.length <= 10) return "…";
  return `${s.slice(0, 6)}…${s.slice(-4)}`;
}

// PUBLIC_INTERFACE
export function getEnvConfig() {
  /**
   * Returns a structured view of environment variables used by the frontend.
   * Consumers should treat URLs/keys as optional unless `isSupabaseConfigured()` is true.
   */
  const apiBase = (safeEnv("REACT_APP_API_BASE") || "").trim();
  const backendUrl = (safeEnv("REACT_APP_BACKEND_URL") || "").trim();
  const frontendUrl = (safeEnv("REACT_APP_FRONTEND_URL") || "").trim();
  const wsUrl = (safeEnv("REACT_APP_WS_URL") || "").trim();
  const nodeEnv = (safeEnv("REACT_APP_NODE_ENV") || safeEnv("NODE_ENV") || "development").trim();
  const logLevel = (safeEnv("REACT_APP_LOG_LEVEL") || "info").trim();

  const featureFlagsRaw = safeEnv("REACT_APP_FEATURE_FLAGS");
  const featureFlags = safeJsonParse(featureFlagsRaw, {});
  const experimentsEnabled = parseBoolean(safeEnv("REACT_APP_EXPERIMENTS_ENABLED"), false);

  const supabaseUrlResolved = resolveSupabaseUrl();
  const supabaseKeyResolved = resolveSupabaseAnonKey();

  const supabaseUrl = supabaseUrlResolved.value;
  const supabaseAnonKey = supabaseKeyResolved.value;

  // Strict “configured” means BOTH url + anon key exist, regardless of which naming scheme provided them.
  const configured = Boolean(supabaseUrl && supabaseAnonKey);

  // Feature flag evaluation:
  // - If enableSupabase is explicitly set, respect it.
  // - Otherwise, “configured implies enabled”.
  const enableSupabase =
    typeof featureFlags?.enableSupabase === "boolean" ? featureFlags.enableSupabase : configured;

  if (!_didLogEnvOnce) {
    _didLogEnvOnce = true;

    // eslint-disable-next-line no-console
    console.debug("[env] resolved", {
      nodeEnv,
      runtimeEnvPresent: Boolean(getRuntimeEnv() && Object.keys(getRuntimeEnv() || {}).length),
      supabaseUrlSource: supabaseUrlResolved.source,
      supabaseKeySource: supabaseKeyResolved.source,
      hasSupabaseUrl: Boolean(supabaseUrl),
      hasSupabaseAnonKey: Boolean(supabaseAnonKey),
      supabaseAnonKeyMasked: maskSecret(supabaseAnonKey),
      featureFlagsRaw: featureFlagsRaw ? "(present)" : "(missing)",
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

    // Diagnostics (safe to show)
    diagnostics: {
      runtimeEnvPresent: Boolean(getRuntimeEnv() && Object.keys(getRuntimeEnv() || {}).length),
      supabaseUrlSource: supabaseUrlResolved.source,
      supabaseKeySource: supabaseKeyResolved.source,
      supabaseAnonKeyMasked: maskSecret(supabaseAnonKey),
      featureFlagsRawPresent: Boolean(featureFlagsRaw),
      configured,
      enableSupabase,
    },
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
