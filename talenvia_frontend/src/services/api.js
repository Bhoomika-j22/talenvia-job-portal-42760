import { getEnvConfig } from "../config/env";
import { mockJobs, mockProfile, mockSkills, mockTests } from "../mocks/data";
import { logger } from "../utils/logger";

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
  };
}
