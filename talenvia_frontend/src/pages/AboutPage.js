import React from "react";
import { PageLayout } from "../components/PageLayout";
import { Card, Badge } from "../components/ui";

/**
 * PUBLIC_INTERFACE
 * About Talenvia informational page.
 * Content sourced from CodeWiki spec: kavia-docs/CodeWiki/Specs/FeatureSpecs/about-us-content-talenvia.md
 */
export default function AboutPage() {
  return (
    <PageLayout
      title="About Us"
      subtitle="Talenvia is a modern career platform that helps you build a strong profile, showcase your skills, and find relevant opportunities with personalized guidance."
      actions={<Badge variant="primary">Royal Purple</Badge>}
    >
      <section aria-label="About Talenvia overview">
        <div className="tv-grid two">
          <Card as="article" aria-label="About Talenvia">
            <strong>About Talenvia</strong>
            <div className="tv-divider" />
            <div className="tv-grid" style={{ gap: 10 }}>
              <p style={{ margin: 0, color: "var(--tv-text-muted)", lineHeight: 1.7 }}>
                Talenvia is designed to bring structure to early-stage career growth. It combines profile building, skill visibility, and
                job discovery in one workspace, so candidates can focus on preparing and applying with clarity.
              </p>
              <p style={{ margin: 0, color: "var(--tv-text-muted)", lineHeight: 1.7 }}>
                It is built for students, freshers, and early-career professionals who want a practical way to present their strengths and
                make steady progress toward job readiness, without relying on disconnected tools.
              </p>
              <p style={{ margin: 0, color: "var(--tv-text-muted)", lineHeight: 1.7 }}>
                Talenvia solves common challenges in the job search process, including unclear skill positioning, difficulty finding
                relevant roles, and lack of consistent guidance on what to improve next.
              </p>
            </div>
          </Card>

          <Card as="article" aria-label="Key features">
            <strong>Key features</strong>
            <div className="tv-divider" />
            <ul style={{ margin: 0, paddingLeft: 18, color: "var(--tv-text-muted)", lineHeight: 1.7 }}>
              <li>Profile and skill management in one place</li>
              <li>Resume upload and updates to keep information current</li>
              <li>Job discovery and matching based on your profile and skills</li>
              <li>Career preferences and personalization to align results to your goals</li>
              <li>AI-driven guidance through recommendations and mentor-like insights</li>
            </ul>
          </Card>
        </div>
      </section>

      <section aria-label="Closing statement" style={{ marginTop: 12 }}>
        <Card as="article">
          <strong>Our commitment</strong>
          <div className="tv-divider" />
          <p style={{ margin: 0, color: "var(--tv-text-muted)", lineHeight: 1.7 }}>
            Talenvia is built to support trust, steady growth, and career success through clear workflows and personalized direction.
          </p>
        </Card>
      </section>
    </PageLayout>
  );
}
