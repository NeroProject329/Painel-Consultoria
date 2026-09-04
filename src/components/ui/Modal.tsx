"use client";
import { useEffect, useId, useRef } from "react";

type Props = {
  open: boolean; title: string; description?: string; confirmText?: string;
  cancelText?: string; danger?: boolean; busy?: boolean; children?: React.ReactNode;
  onClose: () => void; onConfirm: () => void;
};
export default function Modal({ open, title, description, confirmText = "Confirmar",
  cancelText = "Cancelar", danger, busy = false, children, onClose, onConfirm }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (open && dialog && !dialog.open) dialog.showModal();
    if (!open && dialog?.open) dialog.close();
  }, [open]);
  return <dialog ref={ref} aria-labelledby={id} aria-describedby={description ? id + "-description" : undefined}
    onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }}
    className="m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-md overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-[var(--text)] backdrop:bg-black/40">
    <h2 id={id} className="text-lg font-semibold">{title}</h2>
    {description && <p id={id + "-description"} className="mt-2 text-sm text-[var(--muted)]">{description}</p>}
    {children && <div className="mt-4">{children}</div>}
    <div className="mt-6 flex flex-wrap justify-end gap-2">
      <button type="button" className="btn px-4 py-2 text-sm" disabled={busy} onClick={onClose}>{cancelText}</button>
      <button type="button" className={(danger ? "btn-danger" : "btn-primary") + " rounded-xl px-4 py-2 text-sm"}
        disabled={busy} onClick={onConfirm}>{busy ? "Salvando…" : confirmText}</button>
    </div>
  </dialog>;
}
