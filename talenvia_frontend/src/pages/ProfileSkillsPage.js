import React, { useEffect, useMemo, useState } from "react";
import { useAppState } from "../state/AppStateContext";
import { PageLayout } from "../components/PageLayout";
import { Card, Button, Input, Textarea, Alert, Select, Badge } from "../components/ui";
import { LinkRow, ProfileHeader, ReadonlyFieldRow, SectionTitle, SkillCard } from "../components/profile/ProfileComponents";

const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];

/**
 * PUBLIC_INTERFACE
 * Recruiter-focused Profile page (Professional Profile + Skills & Expertise).
 * Uses the existing dashboard shell styles and AppStateContext actions so it stays
 * compatible with mock mode and is ready for Supabase integration later.
 */
export default function ProfileSkillsPage() {
  const { state, actions } = useAppState();

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
    setProfileForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const onSaveProfile = async () => {
    setProfileSaved(false);
    // Keep behavior non-breaking: we store whatever the form holds. Backend/Supabase can validate later.
    await actions.saveProfile(profileForm);
    setProfileSaved(true);
  };

  const onRefresh = async () => {
    setProfileSaved(false);
    await actions.refreshProfile();
  };

  // Skills
  const skills = useMemo(() => state.skills || [], [state.skills]);
  const [skillName, setSkillName] = useState("");
  const [skillLevel, setSkillLevel] = useState("Intermediate");
  const [skillsSaved, setSkillsSaved] = useState(false);

  const addSkill = async () => {
    const trimmed = skillName.trim();
    if (!trimmed) return;

    const newSkills = [
      ...skills,
      { id: `s_${trimmed.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}`, name: trimmed, level: skillLevel },
    ];

    setSkillName("");
    setSkillsSaved(false);
    await actions.saveSkills(newSkills);
    setSkillsSaved(true);
  };

  const removeSkill = async (id) => {
    const newSkills = skills.filter((s) => s.id !== id);
    setSkillsSaved(false);
    await actions.saveSkills(newSkills);
    setSkillsSaved(true);
  };

  const updateLevel = async (id, newLevel) => {
    const newSkills = skills.map((s) => (s.id === id ? { ...s, level: newLevel } : s));
    setSkillsSaved(false);
    await actions.saveSkills(newSkills);
    setSkillsSaved(true);
  };

  return (
    <PageLayout
      title="Profile"
      subtitle="A clean, recruiter-ready profile and skills summary inside your Talenvia dashboard."
      actions={
        <>
          <Button variant="secondary" onClick={onRefresh} disabled={state.loading}>
            Reset / Refresh
          </Button>
          <Button variant="primary" onClick={onSaveProfile} disabled={state.loading}>
            Save Profile
          </Button>
        </>
      }
    >
      {profileSaved ? (
        <Alert tone="success" title="Profile saved">
          Your professional profile has been updated (stored locally in mock mode).
        </Alert>
      ) : null}

      {skillsSaved ? (
        <div style={{ marginTop: 12 }}>
          <Alert tone="success" title="Skills updated">
            Your skills list has been updated (stored locally in mock mode).
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
                  <Button variant="secondary" onClick={onRefresh} disabled={state.loading}>
                    Reset / Refresh
                  </Button>
                  <Button variant="primary" onClick={onSaveProfile} disabled={state.loading}>
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
                <Button variant="primary" onClick={addSkill} disabled={state.loading || !skillName.trim()}>
                  Add Skill
                </Button>
                <Button variant="ghost" onClick={() => setSkillName("")} disabled={state.loading || !skillName}>
                  Clear
                </Button>
              </div>
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
                    onChangeLevel={(lvl) => updateLevel(s.id, lvl)}
                    onRemove={() => removeSkill(s.id)}
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
