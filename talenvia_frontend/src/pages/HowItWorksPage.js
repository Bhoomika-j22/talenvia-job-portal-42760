import React from "react";
import { PageLayout } from "../components/PageLayout";
import { Card, Badge } from "../components/ui";

/**
 * PUBLIC_INTERFACE
 * How Talenvia Works informational page.
 */
export default function HowItWorksPage() {
  return (
    <PageLayout
      title="How Talenvia Works"
      subtitle="A simple, multi-step flow: refine your profile, strengthen skills, apply thoughtfully, and practice with mock tests."
      actions={<Badge variant="primary">Guide</Badge>}
    >
      <div className="tv-grid two">
        <Card>
          <strong>1) Profile</strong>
          <div className="tv-divider" />
          <p style={{ margin: 0, color: "var(--tv-text-muted)" }}>
            Add clear basics and a crisp headline. Your profile anchors everything else.
          </p>
        </Card>

        <Card>
          <strong>2) Skills</strong>
          <div className="tv-divider" />
          <p style={{ margin: 0, color: "var(--tv-text-muted)" }}>
            Track skill levels and keep them aligned to the roles you target.
          </p>
        </Card>

        <Card>
          <strong>3) Jobs</strong>
          <div className="tv-divider" />
          <p style={{ margin: 0, color: "var(--tv-text-muted)" }}>
            Search, scan tags, and apply in a focused way. Save details for follow-up.
          </p>
        </Card>

        <Card>
          <strong>4) Mock Tests</strong>
          <div className="tv-divider" />
          <p style={{ margin: 0, color: "var(--tv-text-muted)" }}>
            Practice quickly, identify gaps, and repeat — confidence comes from repetition.
          </p>
        </Card>
      </div>

      <div style={{ marginTop: 12 }} className="tv-grid">
        <Card>
          <strong>What’s next</strong>
          <div className="tv-divider" />
          <p style={{ margin: 0, color: "var(--tv-text-muted)" }}>
            When backend APIs are ready, these sections can connect to real data while keeping the same UI and navigation structure.
          </p>
        </Card>
      </div>
    </PageLayout>
  );
}
