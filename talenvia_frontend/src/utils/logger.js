import { getEnvConfig } from "../config/env";

const levels = ["debug", "info", "warn", "error"];

function shouldLog(level) {
  const { logLevel } = getEnvConfig();
  const currentIdx = Math.max(0, levels.indexOf((logLevel || "info").toLowerCase()));
  const requestedIdx = Math.max(0, levels.indexOf(level));
  return requestedIdx >= currentIdx;
}

/**
 * PUBLIC_INTERFACE
 * Lightweight logger wrapper that respects REACT_APP_LOG_LEVEL.
 */
export const logger = {
  debug: (...args) => {
    if (shouldLog("debug")) console.debug("[Talenvia]", ...args);
  },
  info: (...args) => {
    if (shouldLog("info")) console.info("[Talenvia]", ...args);
  },
  warn: (...args) => {
    if (shouldLog("warn")) console.warn("[Talenvia]", ...args);
  },
  error: (...args) => {
    if (shouldLog("error")) console.error("[Talenvia]", ...args);
  },
};
