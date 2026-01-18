import React, { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import { Topbar } from "./components/Topbar";
import { Sidebar } from "./components/Sidebar";
import { AppStateProvider } from "./state/AppStateContext";
import OverviewPage from "./pages/OverviewPage";
import ProfileSkillsPage from "./pages/ProfileSkillsPage";
import JobsPage from "./pages/JobsPage";
import MockTestsPage from "./pages/MockTestsPage";

import AboutPage from "./pages/AboutPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import NotFoundPage from "./pages/NotFoundPage";

/**
 * PUBLIC_INTERFACE
 * Main Talenvia application entry component.
 */
function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar on Escape for accessibility (mobile overlay).
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setIsSidebarOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <BrowserRouter>
      <AppStateProvider>
        <div className="tv-app">
          <a className="visually-hidden" href="#main">
            Skip to content
          </a>

          <Topbar onToggleSidebar={() => setIsSidebarOpen((v) => !v)} isSidebarOpen={isSidebarOpen} />

          {isSidebarOpen ? (
            <div className="tv-scrim" role="presentation" onClick={() => setIsSidebarOpen(false)} />
          ) : null}

          <div className="tv-shell">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main id="main" className="tv-content" role="main" tabIndex={-1}>
              <Routes>
                <Route path="/" element={<OverviewPage />} />
                <Route path="/profile-skills" element={<ProfileSkillsPage />} />
                <Route path="/profile" element={<Navigate to="/profile-skills" replace />} />
                <Route path="/skills" element={<Navigate to="/profile-skills" replace />} />
                <Route path="/jobs" element={<JobsPage />} />
                <Route path="/mock-tests" element={<MockTestsPage />} />
                <Route path="/settings" element={<Navigate to="/" replace />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
          </div>
        </div>
      </AppStateProvider>
    </BrowserRouter>
  );
}

export default App;
