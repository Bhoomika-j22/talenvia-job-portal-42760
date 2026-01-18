import React from "react";
import { NavLink } from "react-router-dom";

function NavItem({ to, icon, label, desc, onNavigate }) {
  return (
    <li>
      <NavLink
        to={to}
        className="tv-nav-link"
        onClick={onNavigate}
        aria-label={label}
      >
        <span className="tv-nav-icon" aria-hidden="true">
          {icon}
        </span>
        <span style={{ display: "flex", flexDirection: "column" }}>
          <span className="tv-nav-label">{label}</span>
          <span className="tv-nav-desc">{desc}</span>
        </span>
      </NavLink>
    </li>
  );
}

/**
 * PUBLIC_INTERFACE
 * Side navigation panel for main sections.
 */
export function Sidebar({ isOpen, onClose }) {
  const handleNavigate = () => {
    // Close on mobile after navigation to restore content focus
    if (onClose) onClose();
  };

  return (
    <aside className={`tv-sidebar ${isOpen ? "open" : ""}`.trim()} aria-label="Primary navigation">
      <div className="tv-nav-section-title">Platform</div>
      <ul className="tv-nav-list">
        <NavItem to="/" icon="🏠" label="Overview" desc="Your Talenvia dashboard" onNavigate={handleNavigate} />
        <NavItem to="/profile" icon="👤" label="Profile" desc="Manage your information" onNavigate={handleNavigate} />
        <NavItem to="/skills" icon="✨" label="Skills" desc="Track and improve skills" onNavigate={handleNavigate} />
        <NavItem to="/jobs" icon="💼" label="Jobs" desc="Search and apply" onNavigate={handleNavigate} />
        <NavItem to="/mock-tests" icon="🧠" label="Mock Tests" desc="Practice interviews" onNavigate={handleNavigate} />
        <NavItem to="/settings" icon="⚙️" label="Settings" desc="Preferences & privacy" onNavigate={handleNavigate} />
      </ul>

      <div className="tv-nav-section-title" style={{ marginTop: 12 }}>
        Learn
      </div>
      <ul className="tv-nav-list">
        <NavItem to="/how-it-works" icon="🗺️" label="How it Works" desc="From profile to offer" onNavigate={handleNavigate} />
        <NavItem to="/about" icon="ℹ️" label="About Us" desc="Mission & values" onNavigate={handleNavigate} />
      </ul>
    </aside>
  );
}
