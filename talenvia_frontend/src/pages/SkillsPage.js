import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * PUBLIC_INTERFACE
 * Legacy Skills route wrapper.
 * Redirects to the new combined Profile & Skills page to avoid dead links.
 */
export default function SkillsPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/profile-skills", { replace: true });
  }, [navigate]);

  return null;
}
