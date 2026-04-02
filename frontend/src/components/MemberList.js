import { AnimatePresence, motion } from "framer-motion";

function initialsFromName(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  if (!parts.length) return "?";
  return parts.map((p) => p[0].toUpperCase()).join("");
}

function avatarBgFromId(id) {
  const n = Number(id) || 0;
  const hues = [162, 176, 190, 204, 218, 148]; // green/teal range
  const hue = hues[Math.abs(n) % hues.length];
  return hue;
}

export default function MemberList({
  members,
  onEdit,
  onDelete,
  emptyMessage = "No members found",
}) {
  if (!members.length) {
    return (
      <div className="emptyState" role="status" aria-live="polite">
        <div className="emptyTitle">{emptyMessage}</div>
        <div className="emptySubtitle">Try adjusting your search or add a new member.</div>
      </div>
    );
  }

  return (
    <motion.div className="grid" role="list" layout>
      <AnimatePresence>
        {members.map((m) => {
        const name = m.name || "Unnamed";
        const role = m.role || "—";
        const email = m.email || "";
        const profilePic = m.profilePic || "";

        return (
          <motion.article
            className="card"
            key={m.id}
            role="listitem"
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.18 }}
            whileHover={{ y: -6 }}
          >
            <div className="cardTop">
              <div className="avatarWrap">
                {profilePic ? (
                  <img
                    className="avatarImg"
                    src={profilePic}
                    alt={`${name} profile`}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : null}
                <div
                  className="avatarFallback"
                  aria-hidden={profilePic ? "true" : "false"}
                  style={{ "--avatar-hue": avatarBgFromId(m.id) }}
                >
                  {initialsFromName(name)}
                </div>
              </div>

              <div className="cardBody">
                <div className="nameRow">
                  <div className="memberName" title={name}>
                    {name}
                  </div>
                </div>
                <div className="memberRole" title={role}>
                  {role}
                </div>

                <div className="metaRow">
                  <span className="metaLabel">Email</span>
                  {email ? (
                    <a className="metaValue link" href={`mailto:${email}`} title={email}>
                      {email}
                    </a>
                  ) : (
                    <span className="metaValue muted">—</span>
                  )}
                </div>
              </div>
            </div>

            <div className="cardActions">
              <button className="btnSmall" onClick={() => onEdit(m)} type="button">
                Edit
              </button>
              <button
                className="btnSmallDanger"
                onClick={() => onDelete(m)}
                type="button"
                aria-label={`Delete ${name}`}
              >
                Delete
              </button>
            </div>
          </motion.article>
        );
        })}
      </AnimatePresence>
    </motion.div>
  );
}

