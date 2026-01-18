import React from "react";
import { PageLayout } from "../components/PageLayout";
import { Card, Button, Badge, Alert } from "../components/ui";
import { useAppState } from "../state/AppStateContext";

/**
 * PUBLIC_INTERFACE
 * Mock tests page.
 */
export default function MockTestsPage() {
  const { state, actions } = useAppState();

  return (
    <PageLayout
      title="Mock Tests"
      subtitle="Practice in short, focused sessions. Build confidence before interviews and applications."
      actions={
        state.activeTestSession ? (
          <Badge variant="primary">Session ready</Badge>
        ) : (
          <Button variant="secondary" onClick={() => actions.startMockTest(state.tests?.[0]?.id)} disabled={state.loading || state.tests.length === 0}>
            Quick Start
          </Button>
        )
      }
    >
      {state.error ? (
        <Alert tone="error" title="Error">
          {state.error}
        </Alert>
      ) : null}

      {state.activeTestSession ? (
        <div style={{ marginBottom: 12 }}>
          <Alert tone="success" title="Mock session started">
            Session id: <code>{state.activeTestSession.sessionId}</code> (stub). In a real build, this would open a timed test interface.
          </Alert>
        </div>
      ) : null}

      <div className="tv-grid">
        {state.tests.map((t) => (
          <Card key={t.id} as="article" aria-label={`${t.name} mock test`}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 900 }}>{t.name}</div>
                <div style={{ color: "var(--tv-text-muted)", marginTop: 4 }}>
                  {t.durationMinutes} minutes • Difficulty: {t.difficulty}
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <Button variant="primary" onClick={() => actions.startMockTest(t.id)} disabled={state.loading}>
                  Start
                </Button>
              </div>
            </div>

            <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8 }}>
              {t.topics.map((topic) => (
                <span key={topic} className="tv-badge">
                  {topic}
                </span>
              ))}
            </div>

            <p style={{ margin: "10px 0 0", color: "var(--tv-text-muted)" }}>
              Tip: After finishing, note 2 strengths and 1 improvement area to guide your next practice session.
            </p>
          </Card>
        ))}
      </div>
    </PageLayout>
  );
}
