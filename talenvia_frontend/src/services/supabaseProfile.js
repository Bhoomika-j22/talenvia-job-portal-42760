import { getSupabaseClient } from "./supabaseClient";

/**
 * Convert empty strings to null so we store NULL (not "") for optional fields.
 */
function emptyToNull(value) {
  const trimmed = typeof value === "string" ? value.trim() : value;
  return trimmed === "" ? null : trimmed;
}

async function requireAuthedUser(supabase) {
  /**
   * Prefer session-based auth detection first.
   * This avoids cases where `getUser()` can return null without a strong error
   * when the session isn't established yet.
   */
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) return { ok: false, error: sessionError.message, user: null };
  if (!sessionData?.session?.user) return { ok: false, error: "No active Supabase session. Please sign in.", user: null };

  const { data, error } = await supabase.auth.getUser();
  if (error) return { ok: false, error: error.message, user: null };
  if (!data?.user) return { ok: false, error: "Not authenticated.", user: null };
  return { ok: true, error: null, user: data.user };
}

/**
 * PUBLIC_INTERFACE
 * Fetch the current user's profile row + skills list.
 *
 * Returns:
 * - ok: boolean
 * - profile: object|null
 * - skills: array
 */
export async function getProfileAndSkills() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured.", profile: null, skills: [] };
  }

  const authed = await requireAuthedUser(supabase);
  if (!authed.ok) return { ok: false, error: authed.error, profile: null, skills: [] };

  const userId = authed.user.id;

  const [{ data: profile, error: profileError }, { data: skills, error: skillsError }] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("profile_skills").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
  ]);

  if (profileError) return { ok: false, error: profileError.message, profile: null, skills: [] };
  if (skillsError) return { ok: false, error: skillsError.message, profile: profile ?? null, skills: [] };

  return {
    ok: true,
    error: null,
    profile: profile ?? null,
    skills: Array.isArray(skills) ? skills : [],
  };
}

/**
 * PUBLIC_INTERFACE
 * UPSERT profile for the current user. Links are stored as NULL when empty.
 *
 * Notes:
 * - Upsert key is user_id (PK). RLS ensures only owner can write.
 */
export async function saveProfile(formData) {
  const supabase = getSupabaseClient();
  if (!supabase) return { ok: false, error: "Supabase is not configured." };

  const authed = await requireAuthedUser(supabase);
  if (!authed.ok) return { ok: false, error: authed.error };

  const payload = {
    user_id: authed.user.id,
    full_name: emptyToNull(formData?.full_name ?? formData?.fullName),
    professional_headline: emptyToNull(formData?.professional_headline ?? formData?.headline),
    location: emptyToNull(formData?.location),
    professional_summary: emptyToNull(formData?.professional_summary ?? formData?.bio),
    email: emptyToNull(formData?.email),
    phone: emptyToNull(formData?.phone),

    // Optional links (store NULL if empty)
    portfolio_url: emptyToNull(formData?.portfolio_url ?? formData?.portfolio),
    github_url: emptyToNull(formData?.github_url ?? formData?.github),
    linkedin_url: emptyToNull(formData?.linkedin_url ?? formData?.linkedin),
  };

  const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "user_id" });
  if (error) return { ok: false, error: error.message };

  // Return fresh row
  const { data: profile, error: readError } = await supabase.from("profiles").select("*").eq("user_id", payload.user_id).maybeSingle();
  if (readError) return { ok: false, error: readError.message };

  return { ok: true, error: null, profile: profile ?? null };
}

/**
 * PUBLIC_INTERFACE
 * Add (or update) a skill for the current user.
 *
 * Uses upsert on (user_id, skill_name) unique constraint.
 */
export async function addSkill(skillName, proficiency) {
  const supabase = getSupabaseClient();
  if (!supabase) return { ok: false, error: "Supabase is not configured." };

  const authed = await requireAuthedUser(supabase);
  if (!authed.ok) return { ok: false, error: authed.error };

  const trimmedName = String(skillName || "").trim();
  if (!trimmedName) return { ok: false, error: "skillName is required." };

  const normalizedProficiency = String(proficiency || "").toLowerCase().trim();
  if (!["beginner", "intermediate", "advanced"].includes(normalizedProficiency)) {
    return { ok: false, error: "Invalid proficiency. Use: beginner | intermediate | advanced." };
  }

  const payload = {
    user_id: authed.user.id,
    skill_name: trimmedName,
    proficiency: normalizedProficiency,
  };

  const { error } = await supabase.from("profile_skills").upsert(payload, { onConflict: "user_id,skill_name" });
  if (error) return { ok: false, error: error.message };

  // Return latest skills list
  const { data: skills, error: skillsError } = await supabase
    .from("profile_skills")
    .select("*")
    .eq("user_id", payload.user_id)
    .order("created_at", { ascending: false });

  if (skillsError) return { ok: false, error: skillsError.message, skills: [] };

  return { ok: true, error: null, skills: Array.isArray(skills) ? skills : [] };
}

/**
 * PUBLIC_INTERFACE
 * Remove a skill by id OR by skill_name (for current user).
 *
 * Provide either:
 * - { id: "uuid" } OR
 * - { skillName: "React" }
 */
export async function removeSkill({ id, skillName } = {}) {
  const supabase = getSupabaseClient();
  if (!supabase) return { ok: false, error: "Supabase is not configured." };

  const authed = await requireAuthedUser(supabase);
  if (!authed.ok) return { ok: false, error: authed.error };

  let query = supabase.from("profile_skills").delete().eq("user_id", authed.user.id);

  if (id) {
    query = query.eq("id", id);
  } else {
    const trimmedName = String(skillName || "").trim();
    if (!trimmedName) return { ok: false, error: "Provide id or skillName." };
    query = query.eq("skill_name", trimmedName);
  }

  const { error } = await query;
  if (error) return { ok: false, error: error.message };

  return { ok: true, error: null };
}
