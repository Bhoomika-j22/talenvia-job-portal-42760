import React, { useEffect, useMemo, useState } from "react";
import { PageLayout } from "../components/PageLayout";
import { Card, Button, Input, Badge, Alert } from "../components/ui";
import { useAppState } from "../state/AppStateContext";

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightText(text, query) {
  if (!query) return text;
  const safe = escapeRegExp(query);
  const re = new RegExp(`(${safe})`, "ig");
  const parts = String(text).split(re);
  return parts.map((p, idx) => {
    const isMatch = p.toLowerCase() === query.toLowerCase();
    return isMatch ? (
      <mark key={`${idx}-${p}`} className="tv-highlight">
        {p}
      </mark>
    ) : (
      <React.Fragment key={`${idx}-${p}`}>{p}</React.Fragment>
    );
  });
}

/**
 * PUBLIC_INTERFACE
 * Job browsing/search/apply page.
 */
export default function JobsPage() {
  const { state, actions } = useAppState();

  // Keep local form value for the Jobs page input (so it can diverge if needed),
  // but mirror from global header search query by default.
  const [query, setQuery] = useState(state.searchQuery || "");

  // Initial load
  useEffect(() => {
    actions.searchJobs("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When global header query changes, update local query and refilter jobs.
  useEffect(() => {
    const next = state.searchQuery || "";
    setQuery(next);
    actions.searchJobs(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.searchQuery]);

  const jobs = useMemo(() => state.jobs || [], [state.jobs]);

  const onSearch = async (e) => {
    e.preventDefault();
    // Persist Jobs page input to global query so header stays in sync.
    actions.setSearchQuery(query);
    await actions.searchJobs(query);
  };

  return (
    <PageLayout
      title="Jobs"
      subtitle="Search roles that match your strengths. Apply thoughtfully and track your progress."
      actions={
        <form
          onSubmit={onSearch}
          style={{ display: "flex", gap: 10, alignItems: "center" }}
          role="search"
          aria-label="Search jobs"
        >
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
                  <div style={{ fontSize: 16, fontWeight: 900 }}>{highlightText(job.title, state.searchQuery || "")}</div>
                  <div style={{ color: "var(--tv-text-muted)", marginTop: 4 }}>
                    {highlightText(job.company, state.searchQuery || "")} • {highlightText(job.location, state.searchQuery || "")} •{" "}
                    {highlightText(job.type, state.searchQuery || "")}
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
                    {highlightText(t, state.searchQuery || "")}
                  </span>
                ))}
              </div>

              <p style={{ margin: "10px 0 0", color: "var(--tv-text-muted)" }}>
                {highlightText(job.description, state.searchQuery || "")}
              </p>

              <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Button variant="secondary" onClick={() => navigator.clipboard?.writeText(`${job.title} — ${job.company}`)}>
                  Copy Title
                </Button>
                <Button variant="ghost" onClick={() => actions.setSearchQuery(job.company)}>
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
