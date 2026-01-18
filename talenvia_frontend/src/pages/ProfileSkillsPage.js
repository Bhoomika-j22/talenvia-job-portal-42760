import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAppState } from "../state/AppStateContext";
import { PageLayout } from "../components/PageLayout";
import { Card, Button, Input, Textarea, Alert, Select, Badge } from "../components/ui";
import { LinkRow, ProfileHeader, ReadonlyFieldRow, SectionTitle, SkillCard } from "../components/profile/ProfileComponents";
import { getEnvConfig } from "../config/env";
import { addSkill, getProfileAndSkills, removeSkill, saveProfile } from "../services/supabaseProfile";

const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];

/**
 * PUBLIC_INTERFACE
 * Recruiter-focused Profile page (Professional Profile + Skills & Expertise).
 * Uses the existing dashboard shell styles and AppStateContext actions so it stays
 * compatible with mock mode and is ready for Supabase integration later.
 */
export default function ProfileSkillsPage() {
  const { state, actions } = useAppState();
  const { enableSupabase } = getEnvConfig();

  // Minimal status for Supabase operations (kept local to preserve existing global mock flows).
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [remoteError, setRemoteError] = useState("");
  const [remoteInfo, setRemoteInfo] = useState("");

  const showBusy = Boolean(state.loading || remoteLoading);

  // Map Supabase profile row to existing UI shape.
  const mapProfileRowToForm = useCallback(
    (row) => {
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
    },
    []
  );

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

  useEffect(() => {
    setProfileForm(initialProfile);
  }, [initialProfile]);

  const onProfileChange = (key) => (e) => {
    setProfileSaved(false);
    setRemoteInfo("");
    setProfileForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  // Load profile + skills from Supabase on mount (feature-flagged).
  useEffect(() => {
    let cancelled = false;

    async function loadRemote() {
      if (!enableSupabase) return;

      setRemoteError("");
      setRemoteInfo("");
      setRemoteLoading(true);

      const res = await getProfileAndSkills();
      if (cancelled) return;

      if (!res.ok) {
        // Graceful fallback: keep existing mock-loaded state, show minimal message.
        setRemoteError(res.error || "Failed to load from Supabase.");
        setRemoteLoading(false);
        return;
      }

      // Apply to local page state + global context (so other screens reflect it).
      const mappedProfile = mapProfileRowToForm(res.profile);
      if (mappedProfile) {
        setProfileForm(mappedProfile);
        await actions.saveProfile(mappedProfile);
      }

      const mappedSkills = mapSkillsRowsToUi(res.skills);
      await actions.saveSkills(mappedSkills);

      setRemoteLoading(false);
    }

    loadRemote();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enableSupabase, mapProfileRowToForm, mapSkillsRowsToUi]);

  const onSaveProfile = async () => {
    setProfileSaved(false);
    setRemoteError("");
    setRemoteInfo("");

    // Default (mock) behavior: store locally.
    if (!enableSupabase) {
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
      setRemoteError(res.error || "Failed to save profile.");
      setRemoteLoading(false);
      return;
    }

    const mappedProfile = mapProfileRowToForm(res.profile);
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

    if (!enableSupabase) {
      await actions.refreshProfile();
      return;
    }

    setRemoteLoading(true);

    const res = await getProfileAndSkills();
    if (!res.ok) {
      setRemoteError(res.error || "Failed to refresh from Supabase.");
      setRemoteLoading(false);
      return;
    }

    const mappedProfile = mapProfileRowToForm(res.profile);
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

    if (!enableSupabase) {
      const newSkills = [
        ...skills,
        { id: `s_${trimmed.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}`, name: trimmed, level: skillLevel },
      ];

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
      setRemoteError(res.error || "Failed to add skill.");
      setRemoteLoading(false);
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

    if (!enableSupabase) {
      const newSkills = skills.filter((s) => s.id !== skill.id);
      setSkillsSaved(false);
      await actions.saveSkills(newSkills);
      setSkillsSaved(true);
      return;
    }

    setRemoteLoading(true);

    const res = await removeSkill({ id: skill.id });
    if (!res.ok) {
      setRemoteError(res.error || "Failed to remove skill.");
      setRemoteLoading(false);
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

    if (!enableSupabase) {
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
      setRemoteError(res.error || "Failed to update proficiency.");
      setRemoteLoading(false);
      return;
    }

    setSkillsSaved(false);
    await actions.saveSkills(mapSkillsRowsToUi(res.skills));
    setSkillsSaved(true);

    setRemoteLoading(false);
    setRemoteInfo("Proficiency updated.");
  };

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
      {remoteLoading ? (
        <Alert tone="success" title="Loading">
          Syncing with {enableSupabase ? "Supabase" : "local state"}…
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
          Your professional profile has been updated {enableSupabase ? "in Supabase." : "(stored locally in mock mode)."}
        </Alert>
      ) : null}

      {skillsSaved ? (
        <div style={{ marginTop: 12 }}>
          <Alert tone="success" title="Skills updated">
            Your skills list has been updated {enableSupabase ? "in Supabase." : "(stored locally in mock mode)."}
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
                <Input
                  label="Full name"
                  name="fullName"
                  value={profileForm.fullName}
                  onChange={onProfileChange("fullName")}
                  placeholder="Your full name"
                />

                <Input
                  label="Professional headline"
                  name="headline"
                  value={profileForm.headline}
                  onChange={onProfileChange("headline")}
                  placeholder="Target role | Core skills | Specialty"
                  hint="Example: Frontend Developer | React | Accessibility"
                />

                <Input
                  label="Location"
                  name="location"
                  value={profileForm.location}
                  onChange={onProfileChange("location")}
                  placeholder="City, Country"
                />
              </div>

              <div className="tv-divider" />

              <SectionTitle
                title="Professional summary"
                rightAccessory={<span style={{ fontSize: 12, color: "var(--tv-text-muted)" }}>3–4 lines</span>}
              />
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
                <ReadonlyFieldRow
                  label="Email (verified)"
                  value={profileForm.email}
                  rightAccessory={<Badge variant="primary">Verified</Badge>}
                />

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
                <Input
                  label="Portfolio"
                  name="portfolio"
                  value={profileForm.portfolio || ""}
                  onChange={onProfileChange("portfolio")}
                  placeholder="https://your-portfolio.com"
                />
                <Input
                  label="GitHub"
                  name="github"
                  value={profileForm.github || ""}
                  onChange={onProfileChange("github")}
                  placeholder="https://github.com/username"
                />
                <Input
                  label="LinkedIn"
                  name="linkedin"
                  value={profileForm.linkedin || ""}
                  onChange={onProfileChange("linkedin")}
                  placeholder="https://linkedin.com/in/username"
                />
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
                <div style={{ marginTop: 4, color: "var(--tv-text-muted)", fontSize: 13 }}>
                  Add only skills you are confident to discuss in interviews.
                </div>
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

              {enableSupabase ? (
                <div style={{ color: "var(--tv-text-muted)", fontSize: 12, lineHeight: 1.5 }}>
                  Note: Supabase proficiency supports <strong>Beginner</strong>, <strong>Intermediate</strong>, <strong>Advanced</strong>.{" "}
                  Selecting <strong>Expert</strong> will be stored as <strong>Advanced</strong>.
                </div>
              ) : null}
            </div>

            <div className="tv-divider" />

            {skills.length === 0 ? (
              <div style={{ color: "var(--tv-text-muted)" }}>
                No skills added yet. Start with 5–10 skills that match your target role.
              </div>
            ) : (
              <div className="tv-grid" style={{ gap: 12 }}>
                {skills.map((s) => (
                  <SkillCard
                    key={s.id}
                    skill={s}
                    levels={SKILL_LEVELS}
                    onChangeLevel={(lvl) => updateLevel(s, lvl)}
                    onRemove={() => removeSkillHandler(s)}
                  />
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
