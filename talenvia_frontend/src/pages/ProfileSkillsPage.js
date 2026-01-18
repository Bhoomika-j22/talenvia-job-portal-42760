import React, { useEffect, useMemo, useState } from "react";
import { useAppState } from "../state/AppStateContext";
import { PageLayout } from "../components/PageLayout";
import { Card, Button, Input, Textarea, Alert, Select, Badge } from "../components/ui";

const LEVELS = ["Beginner", "Intermediate", "Advanced"];

/**
 * PUBLIC_INTERFACE
 * Combined Profile & Skills management page.
 * Reuses global state/actions from AppStateContext (no duplicated state layer).
 */
export default function ProfileSkillsPage() {
  const { state, actions } = useAppState();

  // ----- Profile form (mirrors existing ProfilePage behavior) -----
  const initialProfile = useMemo(
    () =>
      state.profile || {
        fullName: "",
        email: "",
        headline: "",
        location: "",
        bio: "",
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
    await actions.saveProfile(profileForm);
    setProfileSaved(true);
  };

  // ----- Skills management (mirrors existing SkillsPage behavior) -----
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
      title="Profile & Skills"
      subtitle="Update your profile basics and keep your skills list aligned to the roles you’re targeting — all in one place."
      actions={
        <>
          <Button variant="secondary" onClick={() => actions.refreshProfile()} disabled={state.loading}>
            Refresh Profile
          </Button>
          <Button variant="primary" onClick={onSaveProfile} disabled={state.loading}>
            Save Profile
          </Button>
        </>
      }
    >
      {profileSaved ? (
        <Alert tone="success" title="Profile saved">
          Your profile changes have been stored (stubbed locally for now).
        </Alert>
      ) : null}

      {skillsSaved ? (
        <div style={{ marginTop: 12 }}>
          <Alert tone="success" title="Skills updated">
            Skills saved (stubbed locally for now).
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
        {/* Left: Profile */}
        <div className="tv-grid" style={{ gap: 12 }}>
          <Card aria-label="Profile editor">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <strong>Profile</strong>
              <Badge variant="primary">Basics</Badge>
            </div>
            <div className="tv-divider" />
            <div className="tv-grid" style={{ gap: 12 }}>
              <Input
                label="Full name"
                name="fullName"
                value={profileForm.fullName}
                onChange={onProfileChange("fullName")}
                placeholder="Your full name"
              />
              <Input
                label="Email"
                name="email"
                value={profileForm.email}
                onChange={onProfileChange("email")}
                placeholder="name@example.com"
                hint="Used for application confirmations (mocked)."
                inputMode="email"
              />
              <Input
                label="Location"
                name="location"
                value={profileForm.location}
                onChange={onProfileChange("location")}
                placeholder="City, Country"
              />
              <Input
                label="Headline"
                name="headline"
                value={profileForm.headline}
                onChange={onProfileChange("headline")}
                placeholder="Role • Key skills • Impact"
                hint="Example: React Engineer • Accessibility • Design systems."
              />
              <Textarea
                label="Bio"
                name="bio"
                rows={6}
                value={profileForm.bio}
                onChange={onProfileChange("bio")}
                placeholder="A short summary of your strengths and what roles you're looking for."
              />
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Button variant="secondary" onClick={() => actions.refreshProfile()} disabled={state.loading}>
                Refresh
              </Button>
              <Button variant="primary" onClick={onSaveProfile} disabled={state.loading}>
                Save Profile
              </Button>
            </div>
          </Card>
        </div>

        {/* Right: Skills */}
        <div className="tv-grid" style={{ gap: 12 }}>
          <Card aria-label="Skills editor">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <strong>Skills</strong>
              <Badge variant="primary">{skills.length} tracked</Badge>
            </div>
            <div className="tv-divider" />

            <div className="tv-grid" style={{ gap: 12 }}>
              <Input
                label="Add a new skill"
                value={skillName}
                onChange={(e) => setSkillName(e.target.value)}
                placeholder="e.g., React, SQL, Communication"
                hint="Use the same naming you would put on a resume."
              />
              <Select label="Proficiency" value={skillLevel} onChange={(e) => setSkillLevel(e.target.value)}>
                {LEVELS.map((l) => (
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
              <p style={{ margin: 0, color: "var(--tv-text-muted)" }}>No skills added yet.</p>
            ) : (
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 10 }}>
                {skills.map((s) => (
                  <li
                    key={s.id}
                    style={{
                      border: "1px solid var(--tv-border)",
                      borderRadius: 12,
                      padding: 10,
                      display: "flex",
                      gap: 10,
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        {s.name} <Badge variant="primary">{s.level}</Badge>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--tv-text-muted)", marginTop: 4 }}>
                        Tip: Attach a project or result that demonstrates this skill.
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                      <select
                        className="tv-select"
                        aria-label={`Change level for ${s.name}`}
                        value={s.level}
                        onChange={(e) => updateLevel(s.id, e.target.value)}
                        style={{ width: 160 }}
                      >
                        {LEVELS.map((l) => (
                          <option key={l} value={l}>
                            {l}
                          </option>
                        ))}
                      </select>
                      <Button variant="secondary" onClick={() => removeSkill(s.id)} aria-label={`Remove ${s.name}`}>
                        Remove
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
