/**
 * Environment configuration for Talenvia frontend (neutral reset).
 *
 * This module intentionally avoids:
 * - runtime env injection (window.__RUNTIME_ENV__)
 * - automatic mapping/aliasing for Supabase keys
 * - console diagnostics for Supabase detection
 *
 * Current state: Supabase is reset to "mock mode". The UI should not rely on
 * Supabase usage until re-enabled explicitly.
 *
 * TODO (re-enable Supabase):
 * - Read REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY from process.env
 * - Parse REACT_APP_FEATURE_FLAGS and gate usage behind enableSupabase flag
 * - Reconnect ProfileSkillsPage TODO sections
 */

/* eslint-disable no-undef */

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

// PUBLIC_INTERFACE
export function getEnvConfig() {
  /**
   * Returns a structured view of environment variables used by the frontend.
   * Supabase values are intentionally nulled in this reset state.
   */
  const apiBase = (process?.env?.REACT_APP_API_BASE || "").trim();
  const backendUrl = (process?.env?.REACT_APP_BACKEND_URL || "").trim();
  const frontendUrl = (process?.env?.REACT_APP_FRONTEND_URL || "").trim();
  const wsUrl = (process?.env?.REACT_APP_WS_URL || "").trim();
  const nodeEnv = (process?.env?.REACT_APP_NODE_ENV || process?.env?.NODE_ENV || "development").trim();
  const logLevel = (process?.env?.REACT_APP_LOG_LEVEL || "info").trim();

  const featureFlagsRaw = process?.env?.REACT_APP_FEATURE_FLAGS;
  const featureFlags = safeJsonParse(featureFlagsRaw, {});
  const experimentsEnabled = parseBoolean(process?.env?.REACT_APP_EXPERIMENTS_ENABLED, false);

  // Supabase is reset/disabled for now (placeholders).
  // TODO: Replace these with actual env reads when reconfiguring.
  const supabaseUrl = null;
  const supabaseAnonKey = null;

  // Feature flag remains available (for future re-enable), but should not be used
  // to auto-enable Supabase wiring in UI until TODO sections are restored.
  const enableSupabase = typeof featureFlags?.enableSupabase === "boolean" ? featureFlags.enableSupabase : false;

  return {
    apiBase,
    backendUrl,
    frontendUrl,
    wsUrl,
    nodeEnv,
    logLevel,
    featureFlags,
    experimentsEnabled,

    // Supabase placeholders (reset state)
    supabaseUrl,
    supabaseAnonKey,
    enableSupabase,
  };
}

// PUBLIC_INTERFACE
export function getSupabaseEnv() {
  /** Convenience accessor for Supabase-related env values (placeholders in reset state). */
  const { supabaseUrl, supabaseAnonKey, enableSupabase } = getEnvConfig();
  return { supabaseUrl, supabaseAnonKey, enableSupabase };
}

// PUBLIC_INTERFACE
export function isSupabaseConfigured() {
  /** Always false in reset state; TODO: compute from env when re-enabling. */
  return false;
}

// PUBLIC_INTERFACE
export function isSupabaseEnabled() {
  /** Always false in reset state; TODO: gate with feature flag when re-enabling. */
  return false;
}
