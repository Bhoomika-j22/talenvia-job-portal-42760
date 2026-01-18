import { getSupabaseClient } from "./supabaseClient";
import { getEnvConfig } from "../config/env";

/**
 * PUBLIC_INTERFACE
 * Sign in via email OTP (magic link).
 *
 * Notes:
 * - This is an OPTIONAL integration point. Keep featureFlags.enableSupabase=false to use mocks.
 * - In CRA, SITE_URL is typically REACT_APP_FRONTEND_URL (already present in env.js).
 * - If REACT_APP_FRONTEND_URL is not set, Supabase will use its default redirect behavior.
 */
export async function signInWithOtp(email) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const { frontendUrl } = getEnvConfig();
  const trimmedEmail = String(email || "").trim();

  if (!trimmedEmail) {
    return { ok: false, error: "Email is required." };
  }

  const { data, error } = await supabase.auth.signInWithOtp({
    email: trimmedEmail,
    options: frontendUrl ? { emailRedirectTo: frontendUrl } : undefined,
  });

  if (error) return { ok: false, error: error.message, data: null };
  return { ok: true, error: null, data };
}

/**
 * PUBLIC_INTERFACE
 * Signs out the current Supabase session.
 */
export async function signOut() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const { error } = await supabase.auth.signOut();
  if (error) return { ok: false, error: error.message };
  return { ok: true, error: null };
}
