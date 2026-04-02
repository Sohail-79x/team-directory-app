import Modal from "./Modal";

export default function ConfirmDialog({
  open,
  title = "Confirm",
  message = "Are you sure?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  destructive = false,
  busy = false,
  onCancel,
  onConfirm,
}) {
  return (
    <Modal open={open} title={title} onClose={busy ? undefined : onCancel}>
      <div className="modalHeader">
        <div>
          <div className="modalTitle">{title}</div>
          <div className="modalSubtitle">{message}</div>
        </div>
        <button
          className="iconBtn"
          onClick={onCancel}
          type="button"
          aria-label="Close"
          disabled={busy}
        >
          ×
        </button>
      </div>

      <div className="modalBody">
        <div className="confirmHint">
          {destructive ? "This action cannot be undone." : "You can cancel if you’re not sure."}
        </div>
      </div>

      <div className="formActions">
        <button className="btnGhost" onClick={onCancel} type="button" disabled={busy}>
          {cancelText}
        </button>
        <button
          className={destructive ? "btnDanger" : "btnPrimary"}
          onClick={onConfirm}
          type="button"
          disabled={busy}
        >
          {busy ? "Please wait..." : confirmText}
        </button>
      </div>
    </Modal>
  );
}

