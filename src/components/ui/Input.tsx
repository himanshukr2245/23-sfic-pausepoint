'use client';
// components/ui/Input.tsx — the ONE way pages make text fields (ESLint blocks raw <input>/<textarea> in src/app).
//  - <Input> / <TextArea>: the field look from the design tokens; every native attribute passes through (id, value, aria-*, …).
//  - <Field>: label + hint + error wired correctly for screen readers (aria-describedby, aria-invalid) — use it for new forms.
import { forwardRef, useId, type InputHTMLAttributes, type ReactElement, type ReactNode, type TextareaHTMLAttributes, cloneElement } from 'react';
import { field } from './classes';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...rest }, ref) {
  return <input ref={ref} className={className ?? field} {...rest} />;
});

export const TextArea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function TextArea({ className, ...rest }, ref) {
  return <textarea ref={ref} className={className ?? field} {...rest} />;
});

/** A labelled field. The label is REQUIRED (a placeholder is not a label); the error is announced and linked to the control. */
export function Field({ label, hint, error, children }: {
  label: ReactNode; hint?: ReactNode; error?: string; children: ReactElement<{ id?: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }>;
}) {
  const auto = useId();
  const id = children.props.id ?? auto;
  const hintId = hint ? `${id}-hint` : undefined, errorId = error ? `${id}-error` : undefined;
  const describedBy = [children.props['aria-describedby'], hintId, errorId].filter(Boolean).join(' ') || undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-medium text-fg">{label}</label>
      {cloneElement(children, { id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : children.props['aria-invalid'] })}
      {hint && <p id={hintId} className="text-sm text-fg-muted">{hint}</p>}
      <p id={errorId} role="alert" className="min-h-5 text-sm text-danger">{error}</p>
    </div>
  );
}
