import React from "react";
import { Link } from "react-router-dom";
import { PageLayout } from "../components/PageLayout";
import { Card, Button } from "../components/ui";

/**
 * PUBLIC_INTERFACE
 * 404 page.
 */
export default function NotFoundPage() {
  return (
    <PageLayout title="Page not found" subtitle="The page you’re looking for doesn’t exist or was moved.">
      <Card>
        <p style={{ margin: 0, color: "var(--tv-text-muted)" }}>
          Use the navigation to continue, or return to the overview.
        </p>
        <div style={{ marginTop: 12 }}>
          <Button as={Link} to="/" variant="primary">
            Go to Overview
          </Button>
        </div>
      </Card>
    </PageLayout>
  );
}
