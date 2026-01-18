import React from "react";

/**
 * PUBLIC_INTERFACE
 * Shared page layout wrapper (title + subtitle + actions).
 */
export function PageLayout({ title, subtitle, actions, children }) {
  return (
    <div>
      <div className="tv-page-header">
        <div>
          <h1 className="tv-page-title">{title}</h1>
          {subtitle ? <p className="tv-page-subtitle">{subtitle}</p> : null}
        </div>
        {actions ? <div className="tv-page-actions">{actions}</div> : null}
      </div>

      {children}
    </div>
  );
}
