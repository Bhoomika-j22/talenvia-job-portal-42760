import React from "react";
import { useNavigate } from "react-router-dom";
import { SettingsItem } from "../components/SettingsItem";

/**
 * Inline icons (no extra deps).
 * Sized to fit the existing SettingsItem "icon chip".
 */
function IconUser(props) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12Z" stroke="currentColor" strokeWidth="2" />
      <path d="M20 21a8 8 0 0 0-16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
 * Settings page inside the standard Talenvia dashboard layout (sidebar + main content).
 *
 * NOTE: The dashboard no longer exposes Settings in navigation, and `/settings` is
 * redirected to `/` (Overview) for safety. This file is intentionally kept for
 * potential future reuse.
 *
 * Renders a centered dark glassmorphism card that contains:
 * - Back button + centered title
 * - Stacked settings options (via reusable SettingsItem)
 * - Full-width logout button
 *
 * Excludes “Communication & Privacy” section by request.
 */
export default function SettingsPage() {
  const navigate = useNavigate();

  const onBack = () => {
    // Prefer browser back for a natural “back” experience; fallback to Overview.
    if (window.history.length > 1) navigate(-1);
    else navigate("/", { replace: true });
  };

  const onItemClick = (key) => {
    // Placeholder interaction until nested settings routes are implemented.
    // eslint-disable-next-line no-alert
    alert(`${key} (stub)`);
  };

  const onLogout = () => {
    // Stub logout: clear lightweight preferences and return to Overview.
    try {
      localStorage.removeItem("tv_density");
    } catch {
      // ignore
    }
    navigate("/", { replace: true });
  };

  return (
    <section aria-label="Settings">
      {/* Center the dark card within the existing (light) dashboard main content */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div
          className="tv-settings-screen"
          aria-label="Settings card"
          style={{
            width: "100%",
            maxWidth: 820,
            borderRadius: 20,
            background:
              "linear-gradient(135deg, rgba(11, 18, 32, 0.98) 0%, rgba(20, 27, 45, 0.92) 55%, rgba(11, 18, 32, 0.98) 100%)",
            boxShadow: "0 18px 40px rgba(17, 24, 39, 0.28)",
          }}
        >
          <div className="tv-settings-inner" style={{ maxWidth: "none", padding: 18 }}>
            <header
              className="tv-settings-header"
              style={{
                padding: "4px 2px 12px",
                gridTemplateColumns: "44px 1fr 44px",
              }}
            >
              <button type="button" className="tv-settings-back" onClick={onBack} aria-label="Back">
                <span aria-hidden="true">←</span>
              </button>

              <h1 className="tv-settings-title" style={{ fontSize: 20 }}>
                Settings
              </h1>

              {/* Right spacer to keep title truly centered */}
              <span aria-hidden="true" />
            </header>

            <div className="tv-settings-list" role="list" aria-label="Settings options" style={{ gap: 12 }}>
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

            <footer className="tv-settings-footer" aria-label="Logout" style={{ padding: "18px 0 4px" }}>
              <button
                type="button"
                className="tv-btn tv-settings-logout"
                onClick={onLogout}
                style={{
                  maxWidth: "none",
                  width: "100%",
                  borderRadius: 16,
                  padding: "12px 14px",
                  borderColor: "rgba(139, 92, 246, 0.42)",
                  background: "rgba(139, 92, 246, 0.14)",
                  color: "#c4b5fd",
                }}
              >
                Logout
              </button>
            </footer>
          </div>
        </div>
      </div>
    </section>
  );
}
