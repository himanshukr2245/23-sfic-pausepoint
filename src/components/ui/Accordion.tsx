// components/ui/Accordion.tsx — Accessible zero-JS semantic details/summary FAQ component (HK Universal Library v3).
// Ultra-fast rendering with 0 JavaScript state overhead and native browser keyboard navigation.
import type { ReactNode } from 'react';

export interface AccordionItem {
  id: string;
  question: string;
  answer: ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  className?: string;
}

export function Accordion({ items, className = '' }: AccordionProps) {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {items.map((item) => (
        <details
          key={item.id}
          className="group rounded-2xl border border-border/80 bg-surface/98 p-4 shadow-xs transition-all duration-200 hover:border-border open:border-brand/40"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-fg text-sm select-none">
            <span>{item.question}</span>
            <span
              aria-hidden="true"
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border/80 text-xs text-fg-muted transition-transform duration-200 group-open:rotate-180 group-open:border-brand/40 group-open:text-brand"
            >
              ↓
            </span>
          </summary>
          <div className="mt-3 text-xs leading-relaxed text-fg-muted border-t border-border/40 pt-3">
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  );
}
