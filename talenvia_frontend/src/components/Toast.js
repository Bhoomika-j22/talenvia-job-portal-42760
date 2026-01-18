import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

/**
 * @typedef {"success" | "error" | "info"} ToastTone
 */

/**
 * @typedef Toast
 * @property {string} id
 * @property {ToastTone} tone
 * @property {string} title
 * @property {string} message
 */

/**
 * PUBLIC_INTERFACE
 * Toast provider + hook. No external dependencies.
 *
 * Usage:
 * - Wrap app in <ToastProvider>
 * - Call `toast.success({title, message})` / `toast.error(...)`
 */
const ToastContext = createContext(null);

function makeId() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

// PUBLIC_INTERFACE
export function ToastProvider({ children }) {
  /** This is a public provider that renders toast UI and exposes toast actions. */
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    ({ tone = "info", title = "", message = "", timeoutMs = 6000 }) => {
      const id = makeId();
      const toast = { id, tone, title, message };
      setToasts((prev) => [...prev, toast]);

      // Auto-dismiss
      if (timeoutMs && timeoutMs > 0) {
        window.setTimeout(() => remove(id), timeoutMs);
      }
      return id;
    },
    [remove]
  );

  const api = useMemo(
    () => ({
      // PUBLIC_INTERFACE
      success: ({ title = "Success", message = "", timeoutMs } = {}) =>
        push({ tone: "success", title, message, timeoutMs }),
      // PUBLIC_INTERFACE
      error: ({ title = "Error", message = "", timeoutMs } = {}) =>
        push({ tone: "error", title, message, timeoutMs: timeoutMs ?? 9000 }),
      // PUBLIC_INTERFACE
      info: ({ title = "Info", message = "", timeoutMs } = {}) => push({ tone: "info", title, message, timeoutMs }),
      // PUBLIC_INTERFACE
      remove,
    }),
    [push, remove]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}

      <div
        aria-live="polite"
        aria-relevant="additions"
        style={{
          position: "fixed",
          right: 16,
          bottom: 16,
          zIndex: 9999,
          display: "grid",
          gap: 10,
          maxWidth: 420,
          width: "calc(100vw - 32px)",
        }}
      >
        {toasts.map((t) => {
          const border =
            t.tone === "success"
              ? "rgba(16, 185, 129, 0.35)"
              : t.tone === "error"
                ? "rgba(239, 68, 68, 0.35)"
                : "rgba(107, 114, 128, 0.28)";
          const bg =
            t.tone === "success"
              ? "rgba(16, 185, 129, 0.08)"
              : t.tone === "error"
                ? "rgba(239, 68, 68, 0.08)"
                : "rgba(107, 114, 128, 0.08)";

          return (
            <div
              key={t.id}
              role={t.tone === "error" ? "alert" : "status"}
              style={{
                border: `1px solid ${border}`,
                background: bg,
                borderRadius: 14,
                padding: "12px 12px",
                boxShadow: "0 18px 32px rgba(17, 24, 39, 0.12)",
                color: "var(--tv-text)",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 950, letterSpacing: "-0.01em" }}>{t.title}</div>
                  {t.message ? (
                    <div style={{ marginTop: 6, color: "var(--tv-text-muted)", lineHeight: 1.45, wordBreak: "break-word" }}>
                      {t.message}
                    </div>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => remove(t.id)}
                  aria-label="Dismiss notification"
                  className="tv-btn secondary"
                  style={{ padding: "6px 10px", borderRadius: 999, fontWeight: 900 }}
                >
                  Close
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

// PUBLIC_INTERFACE
export function useToast() {
  /** Hook to access toast actions. */
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}

