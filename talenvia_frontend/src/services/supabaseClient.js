import { createClient } from "@supabase/supabase-js";
import { getEnvConfig } from "../config/env";
import { logger } from "../utils/logger";

let _client = null;

/**
 * PUBLIC_INTERFACE
 * Returns a singleton Supabase client (or null when not configured).
 *
 * Safety/behavior:
 * - Does NOT throw when env vars are missing; returns null instead.
 * - Uses CRA-exposed env vars via getEnvConfig(): supabaseUrl, supabaseAnonKey.
 * - Intended to be used only behind feature flags so existing mock flows remain default.
 */
export function getSupabaseClient() {
  const { supabaseUrl, supabaseAnonKey } = getEnvConfig();

  if (!supabaseUrl || !supabaseAnonKey) {
    // Keep this at debug level to avoid noisy logs in environments without Supabase.
    logger.debug("Supabase not configured (missing REACT_APP_SUPABASE_URL/REACT_APP_SUPABASE_ANON_KEY).");
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
