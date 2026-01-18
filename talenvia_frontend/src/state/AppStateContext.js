import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { createApiClient } from "../services/api";

const AppStateContext = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case "LOAD_START":
      return { ...state, loading: true, error: null };
    case "LOAD_ERROR":
      return { ...state, loading: false, error: action.error || "Something went wrong." };
    case "LOAD_DONE":
      return { ...state, loading: false, error: null };

    case "SET_PROFILE":
      return { ...state, profile: action.profile };
    case "SET_SKILLS":
      return { ...state, skills: action.skills };
    case "SET_JOBS":
      return { ...state, jobs: action.jobs };
    case "MARK_APPLIED":
      return {
        ...state,
        jobs: state.jobs.map((j) => (j.id === action.jobId ? { ...j, applied: true } : j)),
      };
    case "SET_TESTS":
      return { ...state, tests: action.tests };
    case "SET_ACTIVE_TEST":
      return { ...state, activeTestSession: action.session };

    default:
      return state;
  }
}

/**
 * PUBLIC_INTERFACE
 * Provider that offers basic shared state for the Talenvia SPA.
 */
export function AppStateProvider({ children }) {
  const api = useMemo(() => createApiClient(), []);
  const [state, dispatch] = useReducer(reducer, {
    loading: false,
    error: null,
    profile: null,
    skills: [],
    jobs: [],
    tests: [],
    activeTestSession: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      dispatch({ type: "LOAD_START" });
      try {
        const [profile, skills, tests] = await Promise.all([api.getProfile(), api.getSkills(), api.listMockTests()]);
        if (cancelled) return;
        dispatch({ type: "SET_PROFILE", profile });
        dispatch({ type: "SET_SKILLS", skills });
        dispatch({ type: "SET_TESTS", tests });
        dispatch({ type: "LOAD_DONE" });
      } catch (err) {
        if (cancelled) return;
        dispatch({ type: "LOAD_ERROR", error: String(err?.message || err) });
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [api]);

  const actions = useMemo(() => {
    return {
      // PUBLIC_INTERFACE
      async refreshProfile() {
        dispatch({ type: "LOAD_START" });
        try {
          const profile = await api.getProfile();
          dispatch({ type: "SET_PROFILE", profile });
          dispatch({ type: "LOAD_DONE" });
        } catch (err) {
          dispatch({ type: "LOAD_ERROR", error: String(err?.message || err) });
        }
      },

      // PUBLIC_INTERFACE
      async saveProfile(profile) {
        dispatch({ type: "LOAD_START" });
        try {
          await api.updateProfile(profile);
          dispatch({ type: "SET_PROFILE", profile });
          dispatch({ type: "LOAD_DONE" });
        } catch (err) {
          dispatch({ type: "LOAD_ERROR", error: String(err?.message || err) });
        }
      },

      // PUBLIC_INTERFACE
      async saveSkills(skills) {
        dispatch({ type: "LOAD_START" });
        try {
          await api.saveSkills(skills);
          dispatch({ type: "SET_SKILLS", skills });
          dispatch({ type: "LOAD_DONE" });
        } catch (err) {
          dispatch({ type: "LOAD_ERROR", error: String(err?.message || err) });
        }
      },

      // PUBLIC_INTERFACE
      async searchJobs(query) {
        dispatch({ type: "LOAD_START" });
        try {
          const jobs = await api.searchJobs(query);
          dispatch({ type: "SET_JOBS", jobs });
          dispatch({ type: "LOAD_DONE" });
        } catch (err) {
          dispatch({ type: "LOAD_ERROR", error: String(err?.message || err) });
        }
      },

      // PUBLIC_INTERFACE
      async applyToJob(jobId) {
        dispatch({ type: "LOAD_START" });
        try {
          await api.applyToJob(jobId);
          dispatch({ type: "MARK_APPLIED", jobId });
          dispatch({ type: "LOAD_DONE" });
        } catch (err) {
          dispatch({ type: "LOAD_ERROR", error: String(err?.message || err) });
        }
      },

      // PUBLIC_INTERFACE
      async startMockTest(testId) {
        dispatch({ type: "LOAD_START" });
        try {
          const session = await api.startMockTest(testId);
          dispatch({ type: "SET_ACTIVE_TEST", session });
          dispatch({ type: "LOAD_DONE" });
        } catch (err) {
          dispatch({ type: "LOAD_ERROR", error: String(err?.message || err) });
        }
      },
    };
  }, [api]);

  const value = useMemo(() => ({ state, actions }), [state, actions]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

/**
 * PUBLIC_INTERFACE
 * Hook to access global app state and actions.
 */
export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
