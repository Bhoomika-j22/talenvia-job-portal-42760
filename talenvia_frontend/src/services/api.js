import { getEnvConfig } from "../config/env";
import { mockJobs, mockProfile, mockSkills, mockTests } from "../mocks/data";
import { logger } from "../utils/logger";
import { fetchExampleItems } from "./supabaseData";

/**
 * Simulates latency in mock mode for more realistic UX.
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getBaseUrl() {
  const { apiBase, backendUrl } = getEnvConfig();
  return apiBase || backendUrl || "";
}

/**
 * PUBLIC_INTERFACE
 * Returns a minimal API client abstraction. It is intentionally stubbed:
 * - Reads base URL from env when present
 * - Does not assume backend endpoints exist
 * - Returns placeholder/mock data
 */
export function createApiClient() {
  const baseUrl = getBaseUrl();
  const { enableSupabase } = getEnvConfig();

  async function fetchJson(path, options = {}) {
    if (!baseUrl) return null;
    try {
      const res = await fetch(`${baseUrl}${path}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      logger.warn("Backend fetch failed; falling back to mock data.", { path, err });
      return null;
    }
  }

  return {
    // Profile
    async getProfile() {
      await delay(220);
      // Attempt to read from backend if available; otherwise return mock.
      const maybe = await fetchJson("/profile");
      return maybe || mockProfile;
    },

    async updateProfile(profile) {
      await delay(220);
      // In real implementation, would POST/PUT to backend.
      logger.info("Stub: updateProfile", { profile });
      return { ok: true };
    },

    // Skills
    async getSkills() {
      await delay(200);
      const maybe = await fetchJson("/skills");
      return maybe || mockSkills;
    },

    async saveSkills(skills) {
      await delay(220);
      logger.info("Stub: saveSkills", { count: skills.length });
      return { ok: true };
    },

    // Jobs
    async searchJobs(query) {
      await delay(260);
      const q = (query || "").toLowerCase();
      const filtered = mockJobs.filter((j) => {
        const blob = `${j.title} ${j.company} ${j.location} ${j.type} ${j.tags.join(" ")} ${j.description}`.toLowerCase();
        return !q || blob.includes(q);
      });
      return filtered;
    },

    async applyToJob(jobId) {
      await delay(260);
      logger.info("Stub: applyToJob", { jobId });
      return { ok: true, applicationId: `app_${jobId}_${Date.now()}` };
    },

    // Mock tests
    async listMockTests() {
      await delay(220);
      const maybe = await fetchJson("/mock-tests");
      return maybe || mockTests;
    },

    async startMockTest(testId) {
      await delay(220);
      logger.info("Stub: startMockTest", { testId });
      return { ok: true, sessionId: `test_${testId}_${Date.now()}` };
    },

    /**
     * Optional Supabase path example.
     * Not currently used by the UI; meant as a safe integration point.
     *
     * To switch from mocks to Supabase data reads:
     * 1) Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY
     * 2) Set REACT_APP_FEATURE_FLAGS='{"enableSupabase": true}'
     * 3) Create the placeholder table (default: tv_example_items)
     */
    async listExampleItems() {
      await delay(120);

      if (!enableSupabase) {
        // Default behavior: no Supabase usage.
        return [];
      }

      const res = await fetchExampleItems({ table: "tv_example_items", limit: 5 });
      if (!res.ok) {
        // Non-breaking fallback: return empty array and log debug to avoid surfacing errors.
        logger.debug("Supabase example fetch failed; returning empty list.", { error: res.error });
        return [];
      }
      return res.items;
    },
  };
}
