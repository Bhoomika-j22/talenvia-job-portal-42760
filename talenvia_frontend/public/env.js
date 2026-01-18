/**
 * Optional runtime environment injection for Talenvia frontend.
 *
 * Why this exists:
 * - In Create React App, process.env variables are baked into the bundle at build time.
 * - Some hosting environments want to inject env at *runtime* without rebuilding.
 *
 * Usage:
 * - Serve this file as /env.js (it is in /public, CRA serves it automatically).
 * - In your hosting layer, rewrite/replace this file content at deploy-time, or
 *   serve it dynamically.
 *
 * Expected shape:
 *   window.__RUNTIME_ENV__ = {
 *     REACT_APP_SUPABASE_URL: "https://...",
 *     REACT_APP_SUPABASE_ANON_KEY: "...",
 *     REACT_APP_FEATURE_FLAGS: "{\"enableSupabase\":true}"
 *   }
 */
/* eslint-disable no-undef */
window.__RUNTIME_ENV__ = window.__RUNTIME_ENV__ || {};
