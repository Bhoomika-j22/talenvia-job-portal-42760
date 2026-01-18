import React, { useEffect, useMemo, useState } from "react";
import { Card, Badge, Button } from "./ui";
import { getEnvConfig, isSupabaseConfigured, isSupabaseEnabled } from "../config/env";
import { getSupabaseClient } from "../services/supabaseClient";

function shortUid(uid) {
  if (!uid) return "";
  const s = String(uid);
  if (s.length <= 12) return s;
  return `${s.slice(0, 8)}…${s.slice(-4)}`;
}

// PUBLIC_INTERFACE
export function EnvDiagnosticsPanel({ defaultOpen = false }) {
  /** Toggleable env/session diagnostics for troubleshooting configuration in the browser. */
  const [open, setOpen] = useState(defaultOpen);
  const [sessionUid, setSessionUid] = useState("");
  const [sessionError, setSessionError] = useState("");

  const env = useMemo(() => getEnvConfig(), []);
  const configured = isSupabaseConfigured();
  const enabled = isSupabaseEnabled();

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      const supabase = getSupabaseClient();
      if (!supabase) {
        setSessionUid("");
        setSessionError("");
        return;
      }

      try {
        const { data, error } = await supabase.auth.getSession();
        if (cancelled) return;
        if (error) {
          setSessionUid("");
          setSessionError(error.message || String(error));
          return;
        }
        setSessionUid(data?.session?.user?.id || "");
        setSessionError("");
      } catch (err) {
        if (cancelled) return;
        setSessionUid("");
        setSessionError(err?.message ? String(err.message) : String(err));
      }
    }

    loadSession();
    return () => {
      cancelled = true;
    };
  }, [configured, enabled]);

  const title = "Env diagnostics";

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <Badge variant="primary">{title}</Badge>
          <span style={{ color: "var(--tv-text-muted)", fontSize: 13 }}>
            {configured ? "Supabase configured" : "Supabase NOT configured"} · {enabled ? "enabled" : "disabled"}
          </span>
        </div>
        <Button variant="secondary" onClick={() => setOpen((v) => !v)}>
          {open ? "Hide" : "Show"}
        </Button>
      </div>

      {open ? (
        <div style={{ marginTop: 10 }}>
          <Card aria-label="Environment diagnostics">
            <div className="tv-grid" style={{ gap: 10 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <Badge variant="primary">Supabase</Badge>
                <span style={{ color: "var(--tv-text-muted)", fontSize: 13 }}>
                  url: {env.supabaseUrl ? "present" : "missing"} (source: {env.diagnostics?.supabaseUrlSource || "n/a"})
                </span>
              </div>

              <div style={{ color: "var(--tv-text-muted)", fontSize: 13 }}>
                anon key: {env.supabaseAnonKey ? `present (${env.diagnostics?.supabaseAnonKeyMasked || "masked"})` : "missing"} (source:{" "}
                {env.diagnostics?.supabaseKeySource || "n/a"})
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <Badge variant="primary">Flags</Badge>
                <span style={{ color: "var(--tv-text-muted)", fontSize: 13 }}>
                  enableSupabase: {String(Boolean(env.enableSupabase))} · featureFlags JSON:{" "}
                  {env.diagnostics?.featureFlagsRawPresent ? "present" : "missing"}
                </span>
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <Badge variant="primary">Runtime env</Badge>
                <span style={{ color: "var(--tv-text-muted)", fontSize: 13 }}>
                  window.__RUNTIME_ENV__: {env.diagnostics?.runtimeEnvPresent ? "present" : "missing"}
                </span>
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <Badge variant="primary">Session</Badge>
                <span style={{ color: "var(--tv-text-muted)", fontSize: 13 }}>
                  uid: {sessionUid ? shortUid(sessionUid) : "none"}
                  {sessionError ? ` (error: ${sessionError})` : ""}
                </span>
              </div>

              <div style={{ marginTop: 6, color: "var(--tv-text-muted)", fontSize: 12, lineHeight: 1.5 }}>
                Tip: If your host provides <code>SUPABASE_URL</code>/<code>SUPABASE_KEY</code> (non-CRA), you can inject them at runtime via{" "}
                <code>/env.js</code> by setting <code>window.__RUNTIME_ENV__</code>.
              </div>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
