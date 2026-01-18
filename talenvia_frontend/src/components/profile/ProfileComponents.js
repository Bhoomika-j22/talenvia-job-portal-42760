import React, { useId } from "react";
import { Badge, Button } from "../ui";

/**
 * PUBLIC_INTERFACE
 * Simple circular avatar that shows either an image or initials.
 */
export function Avatar({ src, name = "", size = 56 }) {
  const initials = String(name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  return (
    <div
      aria-label={name ? `Avatar for ${name}` : "Profile avatar"}
      style={{
        width: size,
        height: size,
        borderRadius: "999px",
        overflow: "hidden",
        display: "grid",
        placeItems: "center",
        flex: "0 0 auto",
        background: "rgba(139, 92, 246, 0.14)",
        border: "1px solid rgba(139, 92, 246, 0.22)",
        color: "var(--tv-primary)",
        fontWeight: 900,
        letterSpacing: "-0.02em",
      }}
    >
      {src ? (
        // eslint-disable-next-line jsx-a11y/alt-text
        <img src={src} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <span aria-hidden="true">{initials || "?"}</span>
      )}
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * Small, muted meta row (icon + text).
 */
export function MetaRow({ icon, children }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--tv-text-muted)", fontSize: 13 }}>
      <span aria-hidden="true" style={{ opacity: 0.85 }}>
        {icon}
      </span>
      <span>{children}</span>
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * Profile header section: avatar + name + headline + meta.
 */
export function ProfileHeader({ fullName, headline, location, rightAccessory }) {
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
      <div style={{ display: "flex", gap: 14, alignItems: "center", minWidth: 0 }}>
        <Avatar name={fullName} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 950, letterSpacing: "-0.02em", lineHeight: 1.15 }}>
            {fullName || "Your Name"}
          </div>
          <div style={{ marginTop: 4, color: "var(--tv-text-muted)", fontWeight: 600, fontSize: 13 }}>
            {headline || "Professional Headline"}
          </div>
          {location ? (
            <div style={{ marginTop: 6 }}>
              <MetaRow icon="📍">{location}</MetaRow>
            </div>
          ) : null}
        </div>
      </div>

      {rightAccessory ? <div style={{ display: "flex", gap: 8, alignItems: "center" }}>{rightAccessory}</div> : null}
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * Section heading used inside cards to keep consistent resume-like structure.
 */
export function SectionTitle({ title, rightAccessory }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
      <h2 style={{ margin: 0, fontSize: 14, fontWeight: 950, letterSpacing: "-0.01em" }}>{title}</h2>
      {rightAccessory ? <div>{rightAccessory}</div> : null}
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * Read-only, recruiter-style field row used for “verified email” display.
 */
export function ReadonlyFieldRow({ label, value, rightAccessory }) {
  const id = useId();
  return (
    <div
      style={{
        border: "1px solid rgba(107, 114, 128, 0.22)",
        borderRadius: 14,
        padding: "10px 12px",
        background: "rgba(107, 114, 128, 0.05)",
        display: "grid",
        gap: 4,
      }}
      aria-label={label}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <label htmlFor={id} style={{ fontSize: 12, fontWeight: 900, letterSpacing: "-0.01em" }}>
          {label}
        </label>
        {rightAccessory ? <div style={{ display: "flex", gap: 8, alignItems: "center" }}>{rightAccessory}</div> : null}
      </div>
      <input
        id={id}
        className="tv-input"
        value={value || ""}
        readOnly
        aria-readonly="true"
        style={{
          borderRadius: 12,
          border: "1px solid rgba(107, 114, 128, 0.16)",
          background: "white",
          fontWeight: 650,
        }}
      />
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * Display a clickable external link, but in a clean resume-like row.
 */
export function LinkRow({ label, value }) {
  const href = String(value || "").trim();
  const safeHref = href && !/^https?:\/\//i.test(href) ? `https://${href}` : href;

  return (
    <div style={{ display: "grid", gap: 4 }}>
      <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: "-0.01em" }}>{label}</div>
      {safeHref ? (
        <a
          href={safeHref}
          target="_blank"
          rel="noreferrer"
          style={{ color: "var(--tv-primary)", fontWeight: 800, textDecoration: "none" }}
        >
          {href}
        </a>
      ) : (
        <span style={{ color: "var(--tv-text-muted)" }}>—</span>
      )}
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * Compact, professional skill card with:
 * - skill name + badge
 * - inline dropdown for proficiency
 * - minimal remove action
 */
export function SkillCard({ skill, levels, onChangeLevel, onRemove }) {
  return (
    <div
      style={{
        border: "1px solid var(--tv-border)",
        borderRadius: 16,
        padding: 12,
        background: "white",
        display: "grid",
        gap: 10,
        boxShadow: "0 6px 14px rgba(17, 24, 39, 0.06)",
      }}
      aria-label={`Skill ${skill.name}`}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 950, letterSpacing: "-0.01em" }}>{skill.name}</div>
          <div style={{ marginTop: 6 }}>
            <Badge variant="primary">{skill.level}</Badge>
          </div>
        </div>

        <Button
          variant="secondary"
          onClick={onRemove}
          aria-label={`Remove ${skill.name}`}
          style={{
            padding: "8px 10px",
            borderRadius: 999,
            fontWeight: 900,
          }}
        >
          Remove
        </Button>
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 900 }} htmlFor={`skill_${skill.id}_level`}>
          Proficiency
        </label>
        <select
          id={`skill_${skill.id}_level`}
          className="tv-select"
          aria-label={`Update proficiency for ${skill.name}`}
          value={skill.level}
          onChange={(e) => onChangeLevel(e.target.value)}
        >
          {levels.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
