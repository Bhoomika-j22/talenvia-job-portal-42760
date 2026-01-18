import React from "react";

/**
 * PUBLIC_INTERFACE
 * Themed button component.
 */
export function Button({ variant = "primary", as = "button", className = "", ...props }) {
  const Comp = as;
  return <Comp className={`tv-btn ${variant} ${className}`.trim()} {...props} />;
}

/**
 * PUBLIC_INTERFACE
 * Themed card container.
 */
export function Card({ as = "section", className = "", children, ...props }) {
  const Comp = as;
  return (
    <Comp className={`tv-card ${className}`.trim()} {...props}>
      {children}
    </Comp>
  );
}

/**
 * PUBLIC_INTERFACE
 * Themed text input with label and hint.
 */
export function Input({ label, hint, id, className = "", ...props }) {
  const inputId = id || props.name;
  return (
    <div className={`tv-field ${className}`.trim()}>
      {label ? <label htmlFor={inputId}>{label}</label> : null}
      <input id={inputId} className="tv-input" {...props} />
      {hint ? <div className="tv-field-hint">{hint}</div> : null}
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * Themed select with label and hint.
 */
export function Select({ label, hint, id, className = "", children, ...props }) {
  const selectId = id || props.name;
  return (
    <div className={`tv-field ${className}`.trim()}>
      {label ? <label htmlFor={selectId}>{label}</label> : null}
      <select id={selectId} className="tv-select" {...props}>
        {children}
      </select>
      {hint ? <div className="tv-field-hint">{hint}</div> : null}
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * Themed textarea with label and hint.
 */
export function Textarea({ label, hint, id, className = "", ...props }) {
  const areaId = id || props.name;
  return (
    <div className={`tv-field ${className}`.trim()}>
      {label ? <label htmlFor={areaId}>{label}</label> : null}
      <textarea id={areaId} className="tv-textarea" {...props} />
      {hint ? <div className="tv-field-hint">{hint}</div> : null}
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * Badge component.
 */
export function Badge({ variant = "primary", children }) {
  return <span className={`tv-badge ${variant}`.trim()}>{children}</span>;
}

/**
 * PUBLIC_INTERFACE
 * Alert component for status messages.
 */
export function Alert({ tone = "success", title, children }) {
  return (
    <div className={`tv-alert ${tone}`.trim()} role={tone === "error" ? "alert" : "status"} aria-live="polite">
      {title ? <strong>{title}</strong> : null}
      <div style={{ marginTop: title ? 6 : 0 }}>{children}</div>
    </div>
  );
}
