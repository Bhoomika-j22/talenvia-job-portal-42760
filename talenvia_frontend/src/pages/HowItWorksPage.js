import React from "react";
import { PageLayout } from "../components/PageLayout";
import { Card, Badge, Button } from "../components/ui";
import { Link } from "react-router-dom";

const STEPS = [
  {
    step: 1,
    title: "Create Your Profile",
    description:
      "Users build a complete professional profile by adding basic details, education, skills, projects, experience, languages, and a profile summary. This profile becomes the foundation for job matching and recommendations.",
  },
  {
    step: 2,
    title: "Discover Relevant Jobs",
    description:
      "Talenvia shows job opportunities based on the user’s profile, skills, and preferences. Users can explore roles, save jobs, and apply directly from the platform.",
  },
  {
    step: 3,
    title: "Prepare with Mock Tests and Practice",
    description:
      "Users strengthen their readiness through mock tests, skill-based assessments, and interview-focused practice designed to improve consistency and confidence.",
  },
  {
    step: 4,
    title: "Track Applications in One Place",
    description:
      "Every application is tracked across stages like saved, applied, interview, offer, and rejected, helping users stay organized without spreadsheets or external tools.",
  },
  {
    step: 5,
    title: "Improve with AI Guidance",
    description:
      "Talenvia provides AI-powered insights to help users understand skill gaps, improve profiles, prepare for interviews, and make better career decisions.",
  },
];

/**
 * PUBLIC_INTERFACE
 * How Talenvia Works informational page.
 * Presents a calm, enterprise-style step-based walkthrough using the existing Card + Badge primitives.
 */
export default function HowItWorksPage() {
  return (
    <PageLayout
      title="How Talenvia Works"
      subtitle="A structured path from profile setup to job readiness, with guidance and tracking built in."
      actions={
        <>
          <Badge variant="primary">Guide</Badge>
          <Button as={Link} to="/profile-skills" variant="secondary">
            Start with Profile
          </Button>
        </>
      }
    >
      <section aria-label="How Talenvia Works steps">
        <div className="tv-grid two">
          {STEPS.map((s) => (
            <Card key={s.step} as="article" aria-label={`Step ${s.step}: ${s.title}`}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <Badge variant="primary">{`Step ${s.step}`}</Badge>
                <span style={{ fontSize: 12, color: "var(--tv-text-muted)" }}>End-to-end flow</span>
              </div>

              <div style={{ marginTop: 10, fontWeight: 900, fontSize: 16, letterSpacing: "-0.01em" }}>{s.title}</div>
              <div className="tv-divider" />
              <p style={{ margin: 0, color: "var(--tv-text-muted)", lineHeight: 1.6 }}>{s.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <div style={{ marginTop: 12 }} className="tv-grid">
        <Card as="section" aria-label="What to do next">
          <strong>What to do next</strong>
          <div className="tv-divider" />
          <p style={{ margin: 0, color: "var(--tv-text-muted)", lineHeight: 1.6 }}>
            If you’re new here, start by completing your profile and skills. Then use the Jobs and Mock Tests sections to build
            momentum with consistent, focused practice.
          </p>
          <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Button as={Link} to="/profile-skills" variant="primary">
              Go to Profile & Skills
            </Button>
            <Button as={Link} to="/jobs" variant="ghost">
              Explore Jobs
            </Button>
            <Button as={Link} to="/mock-tests" variant="secondary">
              Try a Mock Test
            </Button>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
}
