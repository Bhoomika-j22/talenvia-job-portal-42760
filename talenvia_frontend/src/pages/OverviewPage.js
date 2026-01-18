import React, { useEffect } from "react";
import { useAppState } from "../state/AppStateContext";
import { PageLayout } from "../components/PageLayout";
import { Card, Button, Badge } from "../components/ui";
import { Link } from "react-router-dom";

/**
 * PUBLIC_INTERFACE
 * Landing dashboard/overview page.
 */
export default function OverviewPage() {
  const { state, actions } = useAppState();

  useEffect(() => {
    // Preload jobs list once for a friendly first impression.
    if (state.jobs.length === 0) actions.searchJobs("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageLayout
      title="Overview"
      subtitle="A calm, elegant workspace for your job search — keep your profile and skills updated, then apply with confidence."
      actions={
        <>
          <Button as={Link} to="/profile-skills" variant="secondary">
            Update Profile & Skills
          </Button>
          <Button as={Link} to="/jobs" variant="primary">
            Find Jobs
          </Button>
        </>
      }
    >
      {state.error ? (
        <Card>
          <strong style={{ color: "var(--tv-error)" }}>We hit a snag</strong>
          <div style={{ marginTop: 6, color: "var(--tv-text-muted)" }}>{state.error}</div>
        </Card>
      ) : null}

      <div className="tv-grid two">
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
            <div>
              <strong>Profile snapshot</strong>
              <div style={{ marginTop: 6, color: "var(--tv-text-muted)" }}>
                {state.profile ? (
                  <>
                    <div>{state.profile.fullName}</div>
                    <div>{state.profile.headline}</div>
                    <div>{state.profile.location}</div>
                  </>
                ) : (
                  "Loading profile…"
                )}
              </div>
            </div>
            <Badge variant="primary">Elegant</Badge>
          </div>
        </Card>

        <Card>
          <strong>Next best actions</strong>
          <div className="tv-divider" />
          <ul style={{ margin: 0, paddingLeft: 18, color: "var(--tv-text-muted)" }}>
            <li>Refine your headline to match your target role.</li>
            <li>Add 1–2 skills you can demonstrate with projects.</li>
            <li>Apply to 2 roles and track responses.</li>
          </ul>
        </Card>
      </div>

      <div style={{ marginTop: 12 }} className="tv-grid two">
        <Card>
          <strong>Skills progress</strong>
          <div style={{ marginTop: 8, color: "var(--tv-text-muted)" }}>
            You currently track <strong style={{ color: "var(--tv-text)" }}>{state.skills.length}</strong> skills.
          </div>
          <div style={{ marginTop: 12 }}>
            <Button as={Link} to="/profile-skills" variant="ghost">
              Manage Profile & Skills
            </Button>
          </div>
        </Card>

        <Card>
          <strong>Job activity</strong>
          <div style={{ marginTop: 8, color: "var(--tv-text-muted)" }}>
            Showing <strong style={{ color: "var(--tv-text)" }}>{state.jobs.length}</strong> roles in your feed.
          </div>
          <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Button as={Link} to="/jobs" variant="primary">
              Open Job Board
            </Button>
            <Button as={Link} to="/mock-tests" variant="secondary">
              Take a Mock Test
            </Button>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
}
