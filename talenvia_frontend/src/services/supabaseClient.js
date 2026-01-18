import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv, isSupabaseConfigured } from "../config/env";
import { logger } from "../utils/logger";

let _client = null;
let _didDebugLogOnce = false;

function maskKey(key) {
  if (!key) return "";
  const s = String(key);
  if (s.length <= 10) return "…";
  return `${s.slice(0, 6)}…${s.slice(-4)}`;
}

// PUBLIC_INTERFACE
export function getSupabaseClient() {
  /**
   * Returns a singleton Supabase client (or null when not configured).
   *
   * Safety/behavior:
   * - Does NOT throw when env vars are missing; returns null instead.
   * - Uses env.js only (do not read process.env here).
   */
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();

  if (!_didDebugLogOnce) {
    _didDebugLogOnce = true;
    // eslint-disable-next-line no-console
    console.debug("[supabaseClient] resolved", {
      configured: isSupabaseConfigured(),
      hasUrl: Boolean(supabaseUrl),
      hasAnonKey: Boolean(supabaseAnonKey),
      anonKeyMasked: maskKey(supabaseAnonKey),
    });
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    // Keep this at debug level to avoid noisy logs in environments without Supabase.
    logger.debug("Supabase not configured (missing Supabase URL/anon key).");
    return null;
  }

  if (_client) return _client;

  _client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      // Persist session in localStorage so refreshes keep the user signed in.
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return _client;
}
