import { getSupabaseClient } from "./supabaseClient";

/**
 * PUBLIC_INTERFACE
 * Example data read from a placeholder table.
 *
 * This is intentionally generic and safe:
 * - Uses `select("*")` with a small limit.
 * - Caller should gate usage behind featureFlags.enableSupabase to avoid breaking mock flows.
 *
 * To switch from mocks to Supabase, create a table (example: `tv_example_items`) and
 * enable the feature flag:
 *   REACT_APP_FEATURE_FLAGS='{"enableSupabase": true}'
 */
export async function fetchExampleItems({ table = "tv_example_items", limit = 5 } = {}) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured.", items: [] };
  }

  const { data, error } = await supabase.from(table).select("*").limit(limit);

  if (error) return { ok: false, error: error.message, items: [] };
  return { ok: true, error: null, items: Array.isArray(data) ? data : [] };
}
