import { useEffect, useMemo, useState } from "react";
import "./App.css";
import MemberForm from "./components/MemberForm";
import MemberList from "./components/MemberList";
import ConfirmDialog from "./components/ConfirmDialog";
import useLocalStorage from "./hooks/useLocalStorage";
import { Toaster, toast } from "react-hot-toast";
import { apiCreateMember, apiDeleteMember, apiGetMembers, apiUpdateMember } from "./lib/api";

function App() {
  const [members, setMembers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("add"); // add | edit
  const [activeMember, setActiveMember] = useState(null);
  const [mutating, setMutating] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const [theme, setTheme] = useLocalStorage("team-directory-theme", "dark"); // dark | light

  useEffect(() => {
    const t = theme === "light" ? "light" : "dark";
    document.documentElement.dataset.theme = t;
  }, [theme]);

  async function fetchMembers() {
    setLoading(true);
    try {
      const data = await apiGetMembers();
      setMembers(data);
    } catch (e) {
      toast.error(e?.message || "Failed to load members.");
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) => String(m.name || "").toLowerCase().includes(q));
  }, [members, query]);

  const PAGE_SIZE = 9;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);
  const paged = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);
  const hasMore = filtered.length > paged.length;

  async function createMember(payload) {
    setMutating(true);
    setSubmitError("");
    try {
      await apiCreateMember(payload);
      await fetchMembers();
      setFormOpen(false);
      toast.success("Member added");
    } catch (e) {
      setSubmitError(e?.message || "Failed to add member.");
    } finally {
      setMutating(false);
    }
  }

  async function updateMember(memberId, payload) {
    setMutating(true);
    setSubmitError("");
    try {
      await apiUpdateMember(memberId, payload);
      await fetchMembers();
      setFormOpen(false);
      setActiveMember(null);
      toast.success("Member updated");
    } catch (e) {
      setSubmitError(e?.message || "Failed to update member.");
    } finally {
      setMutating(false);
    }
  }

  function requestDelete(member) {
    setPendingDelete(member);
    setConfirmOpen(true);
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setMutating(true);
    try {
      await apiDeleteMember(pendingDelete.id);
      await fetchMembers();
      toast.success("Member deleted");
      setConfirmOpen(false);
      setPendingDelete(null);
    } catch (e) {
      toast.error(e?.message || "Failed to delete member.");
    } finally {
      setMutating(false);
    }
  }

  function openAdd() {
    setFormMode("add");
    setActiveMember(null);
    setFormOpen(true);
    setSubmitError("");
  }

  function openEdit(member) {
    setFormMode("edit");
    setActiveMember(member);
    setFormOpen(true);
    setSubmitError("");
  }

  const emptyMessage = query.trim() ? "No members found" : "No members yet";

  return (
    <div className="page">
      <Toaster position="top-right" toastOptions={{ duration: 3200 }} />
      <header className="topbar">
        <div className="brand">
          <div className="brandMark" aria-hidden="true" />
          <div>
            <div className="brandTitle">Team Directory</div>
            <div className="brandSubtitle">Find, add, and manage your team members.</div>
          </div>
        </div>

        <div className="topActions">
          <div className="searchWrap">
            <input
              className="searchInput"
              placeholder="Search by name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button
            className="btnGhost"
            type="button"
            onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            {theme === "light" ? "Dark" : "Light"}
          </button>
          <button className="btnPrimary" onClick={openAdd} type="button" disabled={mutating}>
            Add Member
          </button>
        </div>
      </header>

      <main className="content">
        <div className="statusRow">
          <div className="countPill">
            {loading ? "Loading..." : `${filtered.length} member${filtered.length === 1 ? "" : "s"}`}
          </div>
          <button className="btnGhost" onClick={fetchMembers} type="button" disabled={loading || mutating}>
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="skeletonGrid" aria-hidden="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <div className="skeletonCard" key={i} />
            ))}
          </div>
        ) : (
          <>
            <MemberList members={paged} onEdit={openEdit} onDelete={requestDelete} emptyMessage={emptyMessage} />
            {hasMore ? (
              <div className="pager">
                <button className="btnGhost" type="button" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}>
                  Load more
                </button>
              </div>
            ) : null}
          </>
        )}
      </main>

      {formOpen ? (
        <MemberForm
          mode={formMode}
          initialMember={activeMember}
          busy={mutating}
          submitError={submitError}
          onCancel={() => {
            if (mutating) return;
            setFormOpen(false);
            setActiveMember(null);
            setSubmitError("");
          }}
          onSubmit={(payload) => {
            if (formMode === "edit" && activeMember) return updateMember(activeMember.id, payload);
            return createMember(payload);
          }}
        />
      ) : null}

      <ConfirmDialog
        open={confirmOpen}
        title="Delete member"
        message={pendingDelete ? `Delete “${pendingDelete.name}”?` : "Delete this member?"}
        confirmText="Delete"
        destructive
        busy={mutating}
        onCancel={() => {
          if (mutating) return;
          setConfirmOpen(false);
          setPendingDelete(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

export default App;