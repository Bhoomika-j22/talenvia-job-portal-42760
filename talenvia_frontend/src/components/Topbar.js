import React from "react";
import { Link } from "react-router-dom";
import { Button, Badge } from "./ui";
import { getEnvConfig } from "../config/env";

/**
 * PUBLIC_INTERFACE
 * Top navigation bar for Talenvia (brand + primary actions).
 */
export function Topbar({ onToggleSidebar, isSidebarOpen }) {
  const env = getEnvConfig();
  const envLabel = env.nodeEnv === "production" ? "Live" : "Dev";

  return (
    <header className="tv-topbar" role="banner">
      <div className="tv-topbar-inner">
        <div className="tv-brand" aria-label="Talenvia Home">
          <div className="tv-brand-mark" aria-hidden="true" />
          <div className="tv-brand-text">
            <strong>Talenvia</strong>
            <span>Jobs • Skills • Mock Tests</span>
          </div>
        </div>

        <div className="tv-topbar-spacer" />

        <Badge variant="primary">{envLabel}</Badge>

        <nav aria-label="Quick actions" style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Button as={Link} to="/jobs" variant="ghost">
            Browse Jobs
          </Button>
          <Button className="tv-mobile-only" variant="secondary" onClick={onToggleSidebar} aria-pressed={isSidebarOpen}>
            {isSidebarOpen ? "Close Menu" : "Menu"}
          </Button>
        </nav>
      </div>
    </header>
  );
}
