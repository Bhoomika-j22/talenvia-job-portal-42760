import React, { useMemo, useState } from "react";
import { useAppState } from "../state/AppStateContext";
import { PageLayout } from "../components/PageLayout";
import { Card, Button, Input, Select, Alert, Badge } from "../components/ui";

const LEVELS = ["Beginner", "Intermediate", "Advanced"];

/**
 * PUBLIC_INTERFACE
 * Skills management page.
 */
export default function SkillsPage() {
  const { state, actions } = useAppState();
  const [name, setName] = useState("");
  const [level, setLevel] = useState("Intermediate");
  const [saved, setSaved] = useState(false);

  const skills = useMemo(() => state.skills || [], [state.skills]);

  const addSkill = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    const newSkills = [
      ...skills,
      { id: `s_${trimmed.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}`, name: trimmed, level },
    ];
    setName("");
    setSaved(false);
    await actions.saveSkills(newSkills);
    setSaved(true);
  };

  const removeSkill = async (id) => {
    const newSkills = skills.filter((s) => s.id !== id);
    setSaved(false);
    await actions.saveSkills(newSkills);
    setSaved(true);
  };

  const updateLevel = async (id, newLevel) => {
    const newSkills = skills.map((s) => (s.id === id ? { ...s, level: newLevel } : s));
    setSaved(false);
    await actions.saveSkills(newSkills);
    setSaved(true);
  };

  return (
    <PageLayout
      title="Skills"
      subtitle="Track the skills you want to be hired for. Keep a balanced mix of fundamentals and role-specific expertise."
      actions={
        <Button variant="primary" onClick={addSkill} disabled={state.loading || !name.trim()}>
          Add Skill
        </Button>
      }
    >
      {saved ? (
        <Alert tone="success" title="Updated">
          Skills saved (stubbed locally for now).
        </Alert>
      ) : null}

      {state.error ? (
        <div style={{ marginTop: 12 }}>
          <Alert tone="error" title="Error">
            {state.error}
          </Alert>
        </div>
      ) : null}

      <div style={{ marginTop: 12 }} className="tv-grid two">
        <Card>
          <strong>Add a new skill</strong>
          <div className="tv-divider" />
          <div className="tv-grid" style={{ gap: 12 }}>
            <Input
              label="Skill name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., React, SQL, Communication"
              hint="Use the same naming you would put on a resume."
            />
            <Select label="Proficiency" value={level} onChange={(e) => setLevel(e.target.value)}>
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </Select>
          </div>
        </Card>

        <Card>
          <strong>Your skills</strong>
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
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 10 }}>
                      {s.name} <Badge variant="primary">{s.level}</Badge>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--tv-text-muted)", marginTop: 4 }}>
                      Tip: Attach a project or result that demonstrates this skill.
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
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
    </PageLayout>
  );
}
