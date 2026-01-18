# Supabase integration (Talenvia frontend)

## Reset completed (mock mode)
Supabase wiring has been reset to a neutral state. The app currently runs in **mock mode** with no Supabase banners/diagnostics and no runtime env injection.

To reconfigure later:
1. Set:
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`
   - `REACT_APP_FEATURE_FLAGS={"enableSupabase": true}`
2. Sign in (Supabase Auth) so a session exists.
3. Re-enable the Supabase paths in `src/pages/ProfileSkillsPage.js` by uncommenting/restoring the TODO sections.

This project includes optional Supabase integration behind a feature flag so the default mock flows remain non-breaking.

## Environment variables (Create React App)
Set these in your environment:

- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`
- `REACT_APP_FEATURE_FLAGS={"enableSupabase":true}`
- Optional: `REACT_APP_FRONTEND_URL` (used for auth redirect in OTP flow)

See `.env.example` for the current template.

## Database migration (SQL)
Apply this SQL in Supabase (SQL Editor) or your migration runner:

- `supabase/migrations/001_create_profiles_and_profile_skills.sql`

It creates:
- `public.profiles` (1 row per user, PK `user_id`)
- `public.profile_skills` (many skills per user, unique `(user_id, skill_name)`)

Security:
- RLS enabled on both tables
- Policies restrict access to `auth.uid()`

Automation:
- `updated_at` is automatically updated on every `UPDATE`.

## Frontend usage (supabase-js examples)

### 1) Fetch profile + skills (Reset / Refresh behavior)
```js
import { getProfileAndSkills } from "../services/supabaseProfile";

const res = await getProfileAndSkills();
if (res.ok) {
  // res.profile: row or null
  // res.skills: array
}
```

### 2) Save Profile (UPSERT)
```js
import { saveProfile } from "../services/supabaseProfile";

await saveProfile({
  full_name: "Ada Lovelace",
  professional_headline: "Frontend Developer | React",
  location: "Bengaluru, IN",
  professional_summary: "Focused on accessible UI and performance.",
  email: "ada@example.com",
  phone: "+91 98xxxxxx",

  // Links: pass empty string to store NULL automatically
  portfolio_url: "",
  github_url: "https://github.com/ada",
  linkedin_url: "",
});
```

### 3) Add/Update a Skill
```js
import { addSkill } from "../services/supabaseProfile";

await addSkill("React", "advanced"); // beginner | intermediate | advanced
```

### 4) Remove a Skill
```js
import { removeSkill } from "../services/supabaseProfile";

// Remove by id
await removeSkill({ id: "b3d2..." });

// Or remove by skill_name
await removeSkill({ skillName: "React" });
```

## Notes
- Optional links: empty inputs are stored as `NULL` (not empty strings).
- Writes are always scoped to the logged-in user (`auth.uid()` via RLS).
- If Supabase env vars are missing, the client returns `null` and helper calls return `{ ok: false, error: ... }`.
