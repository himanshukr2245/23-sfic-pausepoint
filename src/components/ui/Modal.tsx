'use client';
// components/ui/Modal.tsx — a dialog on the NATIVE <dialog> element (showModal): the browser traps focus, makes the page behind inert,
// closes on Escape and returns focus to the opener — none of it hand-written. Title is required (it names the dialog for screen readers).
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Button } from './Button';
import { CloseIcon } from './icons';

export function Modal({ open, onClose, title, children, footer }: {
  open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog ref={ref} aria-labelledby={titleId} onClose={onClose}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}   // a click on the backdrop (the dialog box itself, outside the panel)
      className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-card border border-border bg-surface p-0 text-fg shadow-xl backdrop:bg-shade/55 backdrop:backdrop-blur-sm">
      <div className="flex flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <h2 id={titleId} className="text-lg font-semibold text-fg">{title}</h2>
          <Button variant="quiet" size="sm" sound="none" aria-label="Close" onClick={onClose}><CloseIcon className="h-4 w-4" /></Button>
        </div>
        <div className="text-fg-muted">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2">{footer}</div>}
      </div>
    </dialog>
  );
}
