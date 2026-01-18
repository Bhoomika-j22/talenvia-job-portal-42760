import React from "react";
import { PageLayout } from "../components/PageLayout";
import { Card, Badge } from "../components/ui";

/**
 * PUBLIC_INTERFACE
 * About Talenvia informational page.
 */
export default function AboutPage() {
  return (
    <PageLayout
      title="About Us"
      subtitle="Talenvia helps candidates build clarity: a strong profile, focused skills, and confident applications."
      actions={<Badge variant="primary">Royal Purple</Badge>}
    >
      <div className="tv-grid two">
        <Card>
          <strong>Our mission</strong>
          <div className="tv-divider" />
          <p style={{ margin: 0, color: "var(--tv-text-muted)" }}>
            Make job searching feel structured and calm — with an elegant workflow that supports profile quality, skill growth,
            and consistent practice.
          </p>
        </Card>

        <Card>
          <strong>What we value</strong>
          <div className="tv-divider" />
          <ul style={{ margin: 0, paddingLeft: 18, color: "var(--tv-text-muted)" }}>
            <li>Clarity over noise</li>
            <li>Accessibility and inclusivity</li>
            <li>Elegant, user-first design</li>
            <li>Continuous learning</li>
          </ul>
        </Card>
      </div>

      <div style={{ marginTop: 12 }} className="tv-grid">
        <Card>
          <strong>Note about this build</strong>
          <div className="tv-divider" />
          <p style={{ margin: 0, color: "var(--tv-text-muted)" }}>
            This frontend is wired with stubbed API services and local mock data. Base URLs are read from environment variables
            when present, but endpoints are not assumed.
          </p>
        </Card>
      </div>
    </PageLayout>
  );
}
