import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAppState } from "../state/AppStateContext";
import { PageLayout } from "../components/PageLayout";
import { Card, Button, Input, Textarea, Alert, Select, Badge } from "../components/ui";
import { LinkRow, ProfileHeader, ReadonlyFieldRow, SectionTitle, SkillCard } from "../components/profile/ProfileComponents";
import { getEnvConfig } from "../config/env";
import { addSkill, getProfileAndSkills, removeSkill, saveProfile } from "../services/supabaseProfile";
import { getSupabaseClient } from "../services/supabaseClient";

const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];

/**
 * PUBLIC_INTERFACE
 * Recruiter-focused Profile page (Professional Profile + Skills & Expertise).
 *
 * Behavior:
 * - Prefers Supabase when REACT_APP_SUPABASE_URL + REACT_APP_SUPABASE_ANON_KEY are present.
 * - Uses feature flag (enableSupabase) as an additional signal, but NOT as a hard gate.
 * - Falls back to local mock mode when Supabase is unavailable or user is not signed in.
 *
 * Runtime diagnostics:
 * - Logs at mount and on Save with: hasUrl, hasKey, flagEnabled, isSignedIn, and datasource.
 */
export default function ProfileSkillsPage() {
  const { state, actions } = useAppState();
  const env = getEnvConfig();

  // Prefer Supabase if env vars are present, even if feature flag is missing.
  const hasUrl = Boolean(env.supabaseUrl);
  const hasKey = Boolean(env.supabaseAnonKey);
  const flagEnabled = Boolean(env.enableSupabase);

  // Minimal status for Supabase operations (kept local to preserve existing global mock flows).
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [remoteError, setRemoteError] = useState("");
  const [remoteInfo, setRemoteInfo] = useState("");

  // If we detect mock bootstrap overwriting Supabase data on first render, ignore it once we load remote.
  const didApplyRemoteRef = useRef(false);

  const showBusy = Boolean(state.loading || remoteLoading);

  const showUiError = (message) => {
    // Required by request: surface Supabase errors in UI (simple placeholder).
    // eslint-disable-next-line no-alert
    alert(message);
  };

  const getSupabaseDiagnostics = useCallback(async () => {
    const supabase = getSupabaseClient();
    const canUseSupabase = Boolean(supabase && hasUrl && hasKey);
    let isSignedIn = false;

    if (supabase) {
      try {
        // Prefer session check; it’s lightweight and indicates "signed in" clearly.
        const { data } = await supabase.auth.getSession();
        isSignedIn = Boolean(data?.session);
      } catch {
        isSignedIn = false;
      }
    }

    // Datasource decision:
    // - supabase when configured + signed-in
    // - otherwise mock/local
    const dataSource = canUseSupabase && isSignedIn ? "supabase" : "mock";

    return { supabase, canUseSupabase, isSignedIn, dataSource };
  }, [hasKey, hasUrl]);

  const logDiagnostics = useCallback(
    (eventName, diag) => {
      // Explicit console diagnostics requested.
      // eslint-disable-next-line no-console
      console.info("[ProfileSkillsPage diagnostics]", {
        event: eventName,
        hasUrl,
        hasKey,
        flagEnabled,
        isSignedIn: diag?.isSignedIn ?? false,
        dataSource: diag?.dataSource ?? "unknown",
      });
    },
    [flagEnabled, hasKey, hasUrl]
  );

  // Map Supabase profile row to existing UI shape.
  const mapProfileRowToForm = useCallback((row) => {
    if (!row) return null;
    return {
      fullName: row.full_name || "",
      email: row.email || "",
      headline: row.professional_headline || "",
      location: row.location || "",
      bio: row.professional_summary || "",
      phone: row.phone || "",
      portfolio: row.portfolio_url || "",
      github: row.github_url || "",
      linkedin: row.linkedin_url || "",
    };
  }, []);

  // Map Supabase skills rows to existing UI shape.
  const mapSkillsRowsToUi = useCallback((rows) => {
    const list = Array.isArray(rows) ? rows : [];
    return list.map((r) => ({
      id: r.id ?? `${r.skill_name}_${Date.now()}`,
      name: r.skill_name,
      // UI shows Title Case, Supabase stores lowercase enum.
      level: String(r.proficiency || "intermediate")
        .toLowerCase()
        .replace(/^\w/, (c) => c.toUpperCase()),
    }));
  }, []);

  const initialProfile = useMemo(
    () =>
      state.profile || {
        fullName: "",
        email: "",
        headline: "",
        location: "",
        bio: "",
        phone: "",
        portfolio: "",
        github: "",
        linkedin: "",
      },
    [state.profile]
  );

  const [profileForm, setProfileForm] = useState(initialProfile);
  const [profileSaved, setProfileSaved] = useState(false);

  // Remove stale caching: if we already applied remote state, do not let later mock/bootstrap updates clobber the form.
  useEffect(() => {
    if (didApplyRemoteRef.current) return;
    setProfileForm(initialProfile);
  }, [initialProfile]);

  const onProfileChange = (key) => (e) => {
    setProfileSaved(false);
    setRemoteInfo("");
    setProfileForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  // Load profile + skills from Supabase on mount (auto-enabled if env vars exist).
  useEffect(() => {
    let cancelled = false;

    async function loadRemote() {
      const diag = await getSupabaseDiagnostics();
      logDiagnostics("mount", diag);

      if (diag.dataSource !== "supabase") {
        // If Supabase is configured but user isn't signed in, show a helpful note in console and UI.
        if (diag.canUseSupabase && !diag.isSignedIn) {
          setRemoteInfo("Supabase configured, but you are not signed in. Using mock mode until you sign in.");
        }
        return;
      }

      setRemoteError("");
      setRemoteInfo("");
      setRemoteLoading(true);

      const res = await getProfileAndSkills();
      if (cancelled) return;

      if (!res.ok) {
        setRemoteError(res.error || "Failed to load from Supabase.");
        setRemoteLoading(false);
        showUiError(res.error || "Failed to load from Supabase.");
        return;
      }

      // Apply to local page state + global context (so other screens reflect it).
      didApplyRemoteRef.current = true;

      const mappedProfile = mapProfileRowToForm(res.profile);
      if (mappedProfile) {
        setProfileForm(mappedProfile);
        // Keep app context in sync; this still calls stub api.updateProfile but ensures UI consistency across pages.
        await actions.saveProfile(mappedProfile);
      }

      const mappedSkills = mapSkillsRowsToUi(res.skills);
      await actions.saveSkills(mappedSkills);

      setRemoteLoading(false);
      setRemoteInfo("Loaded from Supabase.");
    }

    loadRemote();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getSupabaseDiagnostics, logDiagnostics, mapProfileRowToForm, mapSkillsRowsToUi]);

  const onSaveProfile = async () => {
    setProfileSaved(false);
    setRemoteError("");
    setRemoteInfo("");

    const diag = await getSupabaseDiagnostics();
    logDiagnostics("save_profile", diag);

    // Fall back to mock/local behavior only if Supabase is unavailable OR user not signed in.
    if (diag.dataSource !== "supabase") {
      await actions.saveProfile(profileForm);
      setProfileSaved(true);
      return;
    }

    setRemoteLoading(true);

    // Save to Supabase, null-safe links handled in helper (empty string -> NULL).
    const res = await saveProfile({
      fullName: profileForm.fullName,
      headline: profileForm.headline,
      location: profileForm.location,
      bio: profileForm.bio,
      email: profileForm.email,
      phone: profileForm.phone,
      portfolio: profileForm.portfolio,
      github: profileForm.github,
      linkedin: profileForm.linkedin,
    });

    if (!res.ok) {
      const message = res.error || "Failed to save profile.";
      setRemoteError(message);
      setRemoteLoading(false);
      showUiError(message);
      return;
    }

    const mappedProfile = mapProfileRowToForm(res.profile);
    didApplyRemoteRef.current = true;

    if (mappedProfile) {
      setProfileForm(mappedProfile);
      await actions.saveProfile(mappedProfile);
    } else {
      await actions.saveProfile(profileForm);
    }

    setRemoteLoading(false);
    setProfileSaved(true);
    setRemoteInfo("Saved to Supabase.");
  };

  const onRefresh = async () => {
    setProfileSaved(false);
    setRemoteError("");
    setRemoteInfo("");

    const diag = await getSupabaseDiagnostics();
    logDiagnostics("refresh", diag);

    if (diag.dataSource !== "supabase") {
      // This will re-load mock data; acceptable fallback when not signed in or not configured.
      await actions.refreshProfile();
      return;
    }

    setRemoteLoading(true);

    const res = await getProfileAndSkills();
    if (!res.ok) {
      const message = res.error || "Failed to refresh from Supabase.";
      setRemoteError(message);
      setRemoteLoading(false);
      showUiError(message);
      return;
    }

    const mappedProfile = mapProfileRowToForm(res.profile);
    didApplyRemoteRef.current = true;

    if (mappedProfile) {
      setProfileForm(mappedProfile);
      await actions.saveProfile(mappedProfile);
    }

    await actions.saveSkills(mapSkillsRowsToUi(res.skills));

    setRemoteLoading(false);
    setRemoteInfo("Refreshed from Supabase.");
  };

  // Skills
  const skills = useMemo(() => state.skills || [], [state.skills]);
  const [skillName, setSkillName] = useState("");
  const [skillLevel, setSkillLevel] = useState("Intermediate");
  const [skillsSaved, setSkillsSaved] = useState(false);

  const normalizeProficiencyForDb = (uiLevel) => {
    // Supabase enum: beginner | intermediate | advanced
    const lower = String(uiLevel || "").toLowerCase().trim();
    if (lower === "expert") return "advanced"; // UI supports Expert; DB doesn't.
    if (["beginner", "intermediate", "advanced"].includes(lower)) return lower;
    return "intermediate";
  };

  const addSkillHandler = async () => {
    const trimmed = skillName.trim();
    if (!trimmed) return;

    setRemoteError("");
    setRemoteInfo("");

    const diag = await getSupabaseDiagnostics();
    logDiagnostics("add_skill", diag);

    if (diag.dataSource !== "supabase") {
      const newSkills = [...skills, { id: `s_${trimmed.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}`, name: trimmed, level: skillLevel }];

      setSkillName("");
      setSkillsSaved(false);
      await actions.saveSkills(newSkills);
      setSkillsSaved(true);
      return;
    }

    setRemoteLoading(true);

    const proficiency = normalizeProficiencyForDb(skillLevel);
    const res = await addSkill(trimmed, proficiency);

    if (!res.ok) {
      const message = res.error || "Failed to add skill.";
      setRemoteError(message);
      setRemoteLoading(false);
      showUiError(message);
      return;
    }

    // reflect in UI + global state
    setSkillName("");
    setSkillsSaved(false);
    await actions.saveSkills(mapSkillsRowsToUi(res.skills));
    setSkillsSaved(true);

    setRemoteLoading(false);
    setRemoteInfo("Skill saved to Supabase.");
  };

  const removeSkillHandler = async (skill) => {
    setRemoteError("");
    setRemoteInfo("");

    const diag = await getSupabaseDiagnostics();
    logDiagnostics("remove_skill", diag);

    if (diag.dataSource !== "supabase") {
      const newSkills = skills.filter((s) => s.id !== skill.id);
      setSkillsSaved(false);
      await actions.saveSkills(newSkills);
      setSkillsSaved(true);
      return;
    }

    setRemoteLoading(true);

    // Prefer deleting by skillName when the local id isn't a UUID from Supabase.
    const looksLikeUuid = typeof skill.id === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(skill.id);
    const res = await removeSkill(looksLikeUuid ? { id: skill.id } : { skillName: skill.name });

    if (!res.ok) {
      const message = res.error || "Failed to remove skill.";
      setRemoteError(message);
      setRemoteLoading(false);
      showUiError(message);
      return;
    }

    // Refresh skills list so UI stays consistent with DB ordering.
    const refreshed = await getProfileAndSkills();
    if (refreshed.ok) {
      await actions.saveSkills(mapSkillsRowsToUi(refreshed.skills));
    }

    setRemoteLoading(false);
    setSkillsSaved(true);
    setRemoteInfo("Skill removed.");
  };

  const updateLevel = async (skill, newLevel) => {
    setRemoteError("");
    setRemoteInfo("");

    const diag = await getSupabaseDiagnostics();
    logDiagnostics("update_skill_level", diag);

    if (diag.dataSource !== "supabase") {
      const newSkills = skills.map((s) => (s.id === skill.id ? { ...s, level: newLevel } : s));
      setSkillsSaved(false);
      await actions.saveSkills(newSkills);
      setSkillsSaved(true);
      return;
    }

    setRemoteLoading(true);

    // Helper supports upsert on (user_id, skill_name), so we "update" via addSkill.
    const proficiency = normalizeProficiencyForDb(newLevel);
    const res = await addSkill(skill.name, proficiency);

    if (!res.ok) {
      const message = res.error || "Failed to update proficiency.";
      setRemoteError(message);
      setRemoteLoading(false);
      showUiError(message);
      return;
    }

    setSkillsSaved(false);
    await actions.saveSkills(mapSkillsRowsToUi(res.skills));
    setSkillsSaved(true);

    setRemoteLoading(false);
    setRemoteInfo("Proficiency updated.");
  };

  const [dataSourceBadge, setDataSourceBadge] = useState("mock");
  const [isSignedIn, setIsSignedIn] = useState(false);

  // Keep a small, user-visible banner about the current datasource.
  useEffect(() => {
    let cancelled = false;

    async function refreshDatasourceBadge() {
      const diag = await getSupabaseDiagnostics();
      if (cancelled) return;
      setDataSourceBadge(diag.dataSource);
      setIsSignedIn(Boolean(diag.isSignedIn));
    }

    refreshDatasourceBadge();

    return () => {
      cancelled = true;
    };
  }, [getSupabaseDiagnostics, remoteInfo, remoteError]);

  return (
    <PageLayout
      title="Profile"
      subtitle="A clean, recruiter-ready profile and skills summary inside your Talenvia dashboard."
      actions={
        <>
          <Button variant="secondary" onClick={onRefresh} disabled={showBusy}>
            Reset / Refresh
          </Button>
          <Button variant="primary" onClick={onSaveProfile} disabled={showBusy}>
            Save Profile
          </Button>
        </>
      }
    >
      {/* Inline mode banner */}
      <div style={{ marginBottom: 12 }}>
        <Alert tone="success" title="Data source">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <Badge variant="primary">{dataSourceBadge === "supabase" ? "Supabase mode" : "Mock mode"}</Badge>
            <span style={{ color: "var(--tv-text-muted)" }}>
              {dataSourceBadge === "supabase"
                ? "Reads/writes are using Supabase helpers."
                : hasUrl && hasKey
                  ? `Supabase is configured, but ${isSignedIn ? "it is not available right now" : "you are not signed in"} — using mocks.`
                  : "Supabase env vars missing — using mocks."}
            </span>
          </div>
        </Alert>
      </div>

      {remoteLoading ? (
        <Alert tone="success" title="Loading">
          Syncing with {dataSourceBadge === "supabase" ? "Supabase" : "local state"}…
        </Alert>
      ) : null}

      {remoteError ? (
        <div style={{ marginTop: 12 }}>
          <Alert tone="error" title="Supabase">
            {remoteError}
          </Alert>
        </div>
      ) : null}

      {remoteInfo ? (
        <div style={{ marginTop: 12 }}>
          <Alert tone="success" title="Status">
            {remoteInfo}
          </Alert>
        </div>
      ) : null}

      {profileSaved ? (
        <Alert tone="success" title="Profile saved">
          Your professional profile has been updated {dataSourceBadge === "supabase" ? "in Supabase." : "(stored locally in mock mode)."}
        </Alert>
      ) : null}

      {skillsSaved ? (
        <div style={{ marginTop: 12 }}>
          <Alert tone="success" title="Skills updated">
            Your skills list has been updated {dataSourceBadge === "supabase" ? "in Supabase." : "(stored locally in mock mode)."}
          </Alert>
        </div>
      ) : null}

      {state.error ? (
        <div style={{ marginTop: 12 }}>
          <Alert tone="error" title="Error">
            {state.error}
          </Alert>
        </div>
      ) : null}

      <div style={{ marginTop: 12 }} className="tv-grid two">
        {/* Left column: Professional Profile */}
        <div className="tv-grid" style={{ gap: 12 }}>
          <Card aria-label="Professional profile">
            <ProfileHeader
              fullName={profileForm.fullName}
              headline={profileForm.headline}
              location={profileForm.location}
              rightAccessory={<Badge variant="primary">Professional Profile</Badge>}
            />

            <div className="tv-divider" />

            <div className="tv-grid" style={{ gap: 12 }}>
              <SectionTitle title="Profile details" />
              <div className="tv-grid" style={{ gap: 12 }}>
                <Input label="Full name" name="fullName" value={profileForm.fullName} onChange={onProfileChange("fullName")} placeholder="Your full name" />

                <Input
                  label="Professional headline"
                  name="headline"
                  value={profileForm.headline}
                  onChange={onProfileChange("headline")}
                  placeholder="Target role | Core skills | Specialty"
                  hint="Example: Frontend Developer | React | Accessibility"
                />

                <Input label="Location" name="location" value={profileForm.location} onChange={onProfileChange("location")} placeholder="City, Country" />
              </div>

              <div className="tv-divider" />

              <SectionTitle title="Professional summary" rightAccessory={<span style={{ fontSize: 12, color: "var(--tv-text-muted)" }}>3–4 lines</span>} />
              <Textarea
                label={null}
                name="bio"
                rows={5}
                value={profileForm.bio}
                onChange={onProfileChange("bio")}
                placeholder="Write a concise summary of your strengths, impact, and the roles you are targeting."
                hint="Use confident, recruiter-friendly language. Keep it focused on outcomes and strengths."
              />

              <div className="tv-divider" />

              <SectionTitle title="Contact information" />

              <div className="tv-grid" style={{ gap: 12 }}>
                <ReadonlyFieldRow label="Email (verified)" value={profileForm.email} rightAccessory={<Badge variant="primary">Verified</Badge>} />

                <Input
                  label="Phone (optional)"
                  name="phone"
                  value={profileForm.phone || ""}
                  onChange={onProfileChange("phone")}
                  placeholder="+91 98xxxxxx"
                  inputMode="tel"
                />
              </div>

              <div className="tv-divider" />

              <SectionTitle title="Links" rightAccessory={<span style={{ fontSize: 12, color: "var(--tv-text-muted)" }}>Optional</span>} />

              <div className="tv-grid" style={{ gap: 12 }}>
                <Input label="Portfolio" name="portfolio" value={profileForm.portfolio || ""} onChange={onProfileChange("portfolio")} placeholder="https://your-portfolio.com" />
                <Input label="GitHub" name="github" value={profileForm.github || ""} onChange={onProfileChange("github")} placeholder="https://github.com/username" />
                <Input label="LinkedIn" name="linkedin" value={profileForm.linkedin || ""} onChange={onProfileChange("linkedin")} placeholder="https://linkedin.com/in/username" />
              </div>

              <div style={{ marginTop: 4, display: "grid", gap: 10 }}>
                <div style={{ color: "var(--tv-text-muted)", fontSize: 12, lineHeight: 1.45 }}>
                  Preview:
                  <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
                    <LinkRow label="Portfolio" value={profileForm.portfolio} />
                    <LinkRow label="GitHub" value={profileForm.github} />
                    <LinkRow label="LinkedIn" value={profileForm.linkedin} />
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <Button variant="secondary" onClick={onRefresh} disabled={showBusy}>
                    Reset / Refresh
                  </Button>
                  <Button variant="primary" onClick={onSaveProfile} disabled={showBusy}>
                    Save Profile
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right column: Skills & Expertise */}
        <div className="tv-grid" style={{ gap: 12 }}>
          <Card aria-label="Skills and expertise">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 950, letterSpacing: "-0.01em" }}>Skills & Expertise</div>
                <div style={{ marginTop: 4, color: "var(--tv-text-muted)", fontSize: 13 }}>Add only skills you are confident to discuss in interviews.</div>
              </div>
              <Badge variant="primary">{`${skills.length} skill${skills.length === 1 ? "" : "s"} added`}</Badge>
            </div>

            <div className="tv-divider" />

            <SectionTitle title="Add skill" />
            <div className="tv-grid" style={{ gap: 12 }}>
              <Input
                label="Skill name"
                value={skillName}
                onChange={(e) => setSkillName(e.target.value)}
                placeholder="e.g., React, SQL, Stakeholder communication"
                hint="Use resume-style naming."
              />

              <Select label="Proficiency" value={skillLevel} onChange={(e) => setSkillLevel(e.target.value)}>
                {SKILL_LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </Select>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Button variant="primary" onClick={addSkillHandler} disabled={showBusy || !skillName.trim()}>
                  Add Skill
                </Button>
                <Button variant="ghost" onClick={() => setSkillName("")} disabled={showBusy || !skillName}>
                  Clear
                </Button>
              </div>

              {dataSourceBadge === "supabase" ? (
                <div style={{ color: "var(--tv-text-muted)", fontSize: 12, lineHeight: 1.5 }}>
                  Note: Supabase proficiency supports <strong>Beginner</strong>, <strong>Intermediate</strong>, <strong>Advanced</strong>. Selecting{" "}
                  <strong>Expert</strong> will be stored as <strong>Advanced</strong>.
                </div>
              ) : null}
            </div>

            <div className="tv-divider" />

            {skills.length === 0 ? (
              <div style={{ color: "var(--tv-text-muted)" }}>No skills added yet. Start with 5–10 skills that match your target role.</div>
            ) : (
              <div className="tv-grid" style={{ gap: 12 }}>
                {skills.map((s) => (
                  <SkillCard key={s.id} skill={s} levels={SKILL_LEVELS} onChangeLevel={(lvl) => updateLevel(s, lvl)} onRemove={() => removeSkillHandler(s)} />
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
