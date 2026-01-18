import React from "react";
import { useNavigate } from "react-router-dom";
import { SettingsItem } from "../components/SettingsItem";

/**
 * Simple inline icons (no extra deps).
 * Kept intentionally minimal and consistent with the dark settings styling.
 */
function IconUser(props) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M20 21a8 8 0 0 0-16 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconBriefcase(props) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M9 7V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M4 9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M4 13h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconBlock(props) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M7.5 16.5 16.5 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/**
 * PUBLIC_INTERFACE
 * Settings page (mobile-friendly, dark mode, Naukri-like list items).
 * Includes:
 * - Header with back arrow + title
 * - Rounded list items with left icons + right chevrons
 * - Centered Logout button
 * Excludes: “Communication & Privacy” section by request.
 */
export default function SettingsPage() {
  const navigate = useNavigate();

  const onBack = () => {
    // Prefer browser back for a mobile feel; fallback to overview if history is shallow.
    if (window.history.length > 1) navigate(-1);
    else navigate("/", { replace: true });
  };

  const onItemClick = (key) => {
    // Stub navigation/action: there are no detail routes yet; keep UX responsive.
    // In a real app, these would navigate to nested settings routes.
    // eslint-disable-next-line no-alert
    alert(`${key} (stub)`);
  };

  const onLogout = () => {
    // Stub logout: clear any lightweight local preferences and return to Overview.
    try {
      localStorage.removeItem("tv_density");
    } catch {
      // ignore
    }
    navigate("/", { replace: true });
  };

  return (
    <section className="tv-settings-screen" aria-label="Settings screen">
      <div className="tv-settings-inner">
        <header className="tv-settings-header">
          <button type="button" className="tv-settings-back" onClick={onBack} aria-label="Back">
            <span aria-hidden="true">←</span>
          </button>

          <h1 className="tv-settings-title">Settings</h1>

          {/* Right spacer to keep title truly centered */}
          <span aria-hidden="true" />
        </header>

        <div className="tv-settings-list" role="list" aria-label="Settings options">
          <SettingsItem
            title="Account"
            subtitle="Change your primary email, mobile number or password"
            icon={<IconUser />}
            onClick={() => onItemClick("Account")}
          />
          <SettingsItem
            title="Career Preferences"
            subtitle="Job recommendations based on your career preferences"
            icon={<IconBriefcase />}
            onClick={() => onItemClick("Career Preferences")}
          />
          <SettingsItem
            title="Blocked Companies"
            subtitle="Choose companies you do not want to show your profile to"
            icon={<IconBlock />}
            onClick={() => onItemClick("Blocked Companies")}
          />
        </div>

        <footer className="tv-settings-footer" aria-label="Logout">
          <button type="button" className="tv-btn tv-settings-logout" onClick={onLogout}>
            Logout
          </button>
        </footer>
      </div>
    </section>
  );
}
