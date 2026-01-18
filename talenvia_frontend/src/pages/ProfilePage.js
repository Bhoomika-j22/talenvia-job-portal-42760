import React, { useEffect, useMemo, useState } from "react";
import { useAppState } from "../state/AppStateContext";
import { PageLayout } from "../components/PageLayout";
import { Card, Button, Input, Textarea, Alert } from "../components/ui";

/**
 * PUBLIC_INTERFACE
 * Profile management page.
 */
export default function ProfilePage() {
  const { state, actions } = useAppState();
  const initial = useMemo(
    () =>
      state.profile || {
        fullName: "",
        email: "",
        headline: "",
        location: "",
        bio: "",
      },
    [state.profile]
  );

  const [form, setForm] = useState(initial);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(initial);
  }, [initial]);

  const onChange = (key) => (e) => {
    setSaved(false);
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const onSave = async () => {
    setSaved(false);
    await actions.saveProfile(form);
    setSaved(true);
  };

  return (
    <PageLayout
      title="Profile"
      subtitle="Keep your profile concise and specific. A strong headline and clear skills help Talenvia match you to relevant jobs."
      actions={
        <>
          <Button variant="secondary" onClick={() => actions.refreshProfile()} disabled={state.loading}>
            Refresh
          </Button>
          <Button variant="primary" onClick={onSave} disabled={state.loading}>
            Save Profile
          </Button>
        </>
      }
    >
      {saved ? (
        <Alert tone="success" title="Saved">
          Your profile changes have been stored (stubbed locally for now).
        </Alert>
      ) : null}

      {state.error ? (
        <div style={{ marginTop: 12 }}>
          <Alert tone="error" title="Error">
            {state.error}
          </Alert>
        </div>
      ) : null}

      <div style={{ marginTop: 12 }} className="tv-grid two">
        <Card>
          <strong>Basic details</strong>
          <div className="tv-divider" />
          <div className="tv-grid" style={{ gap: 12 }}>
            <Input label="Full name" name="fullName" value={form.fullName} onChange={onChange("fullName")} placeholder="Your full name" />
            <Input
              label="Email"
              name="email"
              value={form.email}
              onChange={onChange("email")}
              placeholder="name@example.com"
              hint="Used for application confirmations (mocked)."
              inputMode="email"
            />
            <Input label="Location" name="location" value={form.location} onChange={onChange("location")} placeholder="City, Country" />
          </div>
        </Card>

        <Card>
          <strong>Professional summary</strong>
          <div className="tv-divider" />
          <div className="tv-grid" style={{ gap: 12 }}>
            <Input
              label="Headline"
              name="headline"
              value={form.headline}
              onChange={onChange("headline")}
              placeholder="Role • Key skills • Impact"
              hint="Example: React Engineer • Accessibility • Design systems."
            />
            <Textarea
              label="Bio"
              name="bio"
              rows={6}
              value={form.bio}
              onChange={onChange("bio")}
              placeholder="A short summary of your strengths and what roles you're looking for."
            />
          </div>
        </Card>
      </div>
    </PageLayout>
  );
}
