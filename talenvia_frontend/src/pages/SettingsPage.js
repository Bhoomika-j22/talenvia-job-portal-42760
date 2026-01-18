import React, { useMemo, useState } from "react";
import { PageLayout } from "../components/PageLayout";
import { Card, Button, Select, Alert, Badge } from "../components/ui";
import { getEnvConfig } from "../config/env";

/**
 * PUBLIC_INTERFACE
 * Settings page (frontend-only preferences for now).
 */
export default function SettingsPage() {
  const env = useMemo(() => getEnvConfig(), []);
  const [density, setDensity] = useState("comfortable");
  const [saved, setSaved] = useState(false);

  const save = () => {
    // Stub: Persist to localStorage for a simple UX loop.
    localStorage.setItem("tv_density", density);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <PageLayout
      title="Settings"
      subtitle="Personalize Talenvia. These preferences are stored locally (stub) until a backend is connected."
      actions={
        <>
          <Button variant="secondary" onClick={() => setDensity("comfortable")}>
            Reset
          </Button>
          <Button variant="primary" onClick={save}>
            Save Settings
          </Button>
        </>
      }
    >
      {saved ? (
        <Alert tone="success" title="Saved">
          Settings saved locally.
        </Alert>
      ) : null}

      <div className="tv-grid two" style={{ marginTop: 12 }}>
        <Card>
          <strong>Preferences</strong>
          <div className="tv-divider" />
          <Select label="Layout density" value={density} onChange={(e) => setDensity(e.target.value)} hint="Choose spacing that feels comfortable.">
            <option value="comfortable">Comfortable</option>
            <option value="compact">Compact</option>
          </Select>
          <div style={{ marginTop: 12, color: "var(--tv-text-muted)", fontSize: 12 }}>
            Note: Density is a placeholder setting to demonstrate basic state management.
          </div>
        </Card>

        <Card>
          <strong>Environment</strong>
          <div className="tv-divider" />
          <div className="tv-grid" style={{ gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <span style={{ color: "var(--tv-text-muted)" }}>API base</span>
              <Badge variant="primary">{env.apiBase || "Not set"}</Badge>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <span style={{ color: "var(--tv-text-muted)" }}>Backend URL</span>
              <Badge variant="primary">{env.backendUrl || "Not set"}</Badge>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <span style={{ color: "var(--tv-text-muted)" }}>WS URL</span>
              <Badge variant="primary">{env.wsUrl || "Not set"}</Badge>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <span style={{ color: "var(--tv-text-muted)" }}>Experiments</span>
              <Badge variant="primary">{env.experimentsEnabled ? "Enabled" : "Disabled"}</Badge>
            </div>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
}
