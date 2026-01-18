import React, { useEffect, useMemo, useState } from "react";
import { PageLayout } from "../components/PageLayout";
import { Card, Button, Input, Badge, Alert } from "../components/ui";
import { useAppState } from "../state/AppStateContext";

/**
 * PUBLIC_INTERFACE
 * Job browsing/search/apply page.
 */
export default function JobsPage() {
  const { state, actions } = useAppState();
  const [query, setQuery] = useState("");

  useEffect(() => {
    actions.searchJobs("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const jobs = useMemo(() => state.jobs || [], [state.jobs]);

  const onSearch = async (e) => {
    e.preventDefault();
    await actions.searchJobs(query);
  };

  return (
    <PageLayout
      title="Jobs"
      subtitle="Search roles that match your strengths. Apply thoughtfully and track your progress."
      actions={
        <form onSubmit={onSearch} style={{ display: "flex", gap: 10, alignItems: "center" }} role="search" aria-label="Search jobs">
          <Input
            label={null}
            aria-label="Search jobs"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, company, location, skill…"
            style={{ minWidth: 280 }}
          />
          <Button variant="primary" type="submit" disabled={state.loading}>
            Search
          </Button>
        </form>
      }
    >
      {state.error ? (
        <Alert tone="error" title="Error">
          {state.error}
        </Alert>
      ) : null}

      <div style={{ marginTop: 12 }} className="tv-grid">
        {jobs.length === 0 ? (
          <Card>
            <strong>No jobs found</strong>
            <p style={{ margin: "6px 0 0", color: "var(--tv-text-muted)" }}>
              Try a broader query like “React”, “Remote”, or “Frontend”.
            </p>
          </Card>
        ) : (
          jobs.map((job) => (
            <Card key={job.id} as="article" aria-label={`${job.title} at ${job.company}`}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 900 }}>{job.title}</div>
                  <div style={{ color: "var(--tv-text-muted)", marginTop: 4 }}>
                    {job.company} • {job.location} • {job.type}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <Badge variant="primary">{job.salaryRange}</Badge>
                  {job.applied ? (
                    <Badge variant="primary">Applied</Badge>
                  ) : (
                    <Button variant="primary" onClick={() => actions.applyToJob(job.id)} disabled={state.loading}>
                      Apply
                    </Button>
                  )}
                </div>
              </div>

              <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8 }}>
                {job.tags.map((t) => (
                  <span key={t} className="tv-badge">
                    {t}
                  </span>
                ))}
              </div>

              <p style={{ margin: "10px 0 0", color: "var(--tv-text-muted)" }}>{job.description}</p>

              <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Button variant="secondary" onClick={() => navigator.clipboard?.writeText(`${job.title} — ${job.company}`)}>
                  Copy Title
                </Button>
                <Button variant="ghost" onClick={() => actions.searchJobs(job.company)}>
                  More from {job.company}
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </PageLayout>
  );
}
