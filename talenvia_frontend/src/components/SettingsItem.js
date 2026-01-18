import React from "react";

/**
 * PUBLIC_INTERFACE
 * Reusable Settings list row item (mobile-first) with:
 * - left icon
 * - title + subtitle
 * - right chevron
 *
 * Can be used as a <button> (default) or "as" a different element.
 */
export function SettingsItem({
  title,
  subtitle,
  icon,
  onClick,
  as = "button",
  className = "",
  rightAccessory,
  ...props
}) {
  const Comp = as;

  return (
    <Comp
      type={Comp === "button" ? "button" : undefined}
      onClick={onClick}
      className={[
        "tv-settings-item",
        "tv-settings-item-row",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <span className="tv-settings-item-icon" aria-hidden="true">
        {icon}
      </span>

      <span className="tv-settings-item-text">
        <span className="tv-settings-item-title">{title}</span>
        {subtitle ? <span className="tv-settings-item-subtitle">{subtitle}</span> : null}
      </span>

      <span className="tv-settings-item-right" aria-hidden="true">
        {rightAccessory ?? <span className="tv-settings-item-chevron">›</span>}
      </span>
    </Comp>
  );
}
