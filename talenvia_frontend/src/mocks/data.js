/**
 * Local mock data used when backend endpoints are not connected yet.
 */

export const mockProfile = {
  fullName: "Aarav Mehta",
  email: "aarav@example.com",
  headline: "Frontend Developer • React • Accessibility",
  location: "Bengaluru, IN",
  bio: "I build elegant, accessible UIs and love crafting thoughtful user experiences.",
};

export const mockSkills = [
  { id: "s1", name: "React", level: "Advanced" },
  { id: "s2", name: "TypeScript", level: "Intermediate" },
  { id: "s3", name: "CSS Architecture", level: "Advanced" },
  { id: "s4", name: "Accessibility (WCAG)", level: "Intermediate" },
];

export const mockJobs = [
  {
    id: "j1",
    title: "React UI Engineer",
    company: "PurpleWorks",
    location: "Remote",
    type: "Full-time",
    salaryRange: "₹18–28 LPA",
    tags: ["React", "UI", "Design Systems"],
    description:
      "Build reusable UI components and high-quality product experiences. Collaborate with design and product to ship polished features.",
    applied: false,
  },
  {
    id: "j2",
    title: "Frontend Developer (SPA)",
    company: "Talenvia Partners",
    location: "Hyderabad",
    type: "Hybrid",
    salaryRange: "₹12–20 LPA",
    tags: ["JavaScript", "React", "Performance"],
    description:
      "Own the SPA performance and developer experience. Improve responsiveness, maintainability, and accessibility across the platform.",
    applied: false,
  },
  {
    id: "j3",
    title: "UI Engineer (Entry)",
    company: "Silverline Labs",
    location: "Pune",
    type: "On-site",
    salaryRange: "₹7–11 LPA",
    tags: ["HTML", "CSS", "React Basics"],
    description:
      "Work with senior engineers to implement pixel-perfect layouts and improve component consistency across multiple products.",
    applied: false,
  },
];

export const mockTests = [
  {
    id: "t1",
    name: "React Fundamentals",
    durationMinutes: 25,
    difficulty: "Easy",
    topics: ["JSX", "State", "Props"],
  },
  {
    id: "t2",
    name: "Frontend System Design",
    durationMinutes: 35,
    difficulty: "Medium",
    topics: ["Caching", "Rendering", "Accessibility"],
  },
  {
    id: "t3",
    name: "DSA Warm-up (for Product Roles)",
    durationMinutes: 30,
    difficulty: "Medium",
    topics: ["Arrays", "Strings", "Complexity"],
  },
];
