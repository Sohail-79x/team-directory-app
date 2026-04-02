import { useEffect, useMemo, useState } from "react";
import Modal from "./Modal";

const EMPTY = { name: "", role: "", email: "", profilePic: "" };

function validate(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = "Name is required.";
  if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Please enter a valid email.";
  }
  if (values.profilePic.trim()) {
    try {
      // eslint-disable-next-line no-new
      new URL(values.profilePic.trim());
    } catch {
      errors.profilePic = "Please enter a valid URL.";
    }
  }
  return errors;
}

export default function MemberForm({
  mode = "add",
  initialMember,
  onCancel,
  onSubmit,
  busy = false,
  submitError = "",
}) {
  const initial = useMemo(() => {
    if (!initialMember) return EMPTY;
    return {
      name: String(initialMember.name ?? ""),
      role: String(initialMember.role ?? ""),
      email: String(initialMember.email ?? ""),
      profilePic: String(initialMember.profilePic ?? ""),
    };
  }, [initialMember]);

  const [values, setValues] = useState(initial);
  const [touched, setTouched] = useState({});

  useEffect(() => {
    setValues(initial);
    setTouched({});
  }, [initial]);

  const errors = validate(values);
  const canSubmit = Object.keys(errors).length === 0 && !busy;

  const title = mode === "edit" ? "Edit Member" : "Add Member";
  const submitLabel = mode === "edit" ? "Save changes" : "Add member";

  return (
    <Modal open title={title} onClose={busy ? undefined : onCancel}>
      <div className="modalHeader">
        <div>
          <div className="modalTitle">{title}</div>
          <div className="modalSubtitle">Keep it clean and professional.</div>
        </div>
        <button className="iconBtn" onClick={onCancel} type="button" aria-label="Close" disabled={busy}>
          ×
        </button>
      </div>

      <form
        className="form"
        onSubmit={(e) => {
          e.preventDefault();
          setTouched({ name: true, role: true, email: true, profilePic: true });
          if (!canSubmit) return;
          onSubmit({
            name: values.name.trim(),
            role: values.role.trim(),
            email: values.email.trim(),
            profilePic: values.profilePic.trim(),
          });
        }}
      >
        {submitError ? (
          <div className="formError" role="alert">
            {submitError}
          </div>
        ) : null}

        <div className="formGrid">
          <label className="field">
            <span className="label">Name</span>
            <input
              value={values.name}
              onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
              placeholder="e.g., Ayesha Khan"
              autoFocus
            />
            {touched.name && errors.name ? <span className="fieldError">{errors.name}</span> : null}
          </label>

          <label className="field">
            <span className="label">Role</span>
            <input
              value={values.role}
              onChange={(e) => setValues((v) => ({ ...v, role: e.target.value }))}
              onBlur={() => setTouched((t) => ({ ...t, role: true }))}
              placeholder="e.g., Frontend Engineer"
            />
          </label>

          <label className="field">
            <span className="label">Email</span>
            <input
              value={values.email}
              onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              placeholder="e.g., ayesha@company.com"
            />
            {touched.email && errors.email ? <span className="fieldError">{errors.email}</span> : null}
          </label>

          <label className="field">
            <span className="label">Profile Pic URL</span>
            <input
              value={values.profilePic}
              onChange={(e) => setValues((v) => ({ ...v, profilePic: e.target.value }))}
              onBlur={() => setTouched((t) => ({ ...t, profilePic: true }))}
              placeholder="https://..."
            />
            {touched.profilePic && errors.profilePic ? (
              <span className="fieldError">{errors.profilePic}</span>
            ) : null}
          </label>
        </div>

        <div className="formActions">
          <button className="btnGhost" onClick={onCancel} type="button" disabled={busy}>
            Cancel
          </button>
          <button className="btnPrimary" type="submit" disabled={!canSubmit}>
            {busy ? "Saving..." : submitLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}

