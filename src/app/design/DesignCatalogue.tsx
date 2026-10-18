'use client';
// app/design/DesignCatalogue.tsx — every primitive and its variants on one screen: the catalogue you (and any AI) pick from.
// It is scanned by the a11y and CSP end-to-end tests, so a primitive that breaks contrast or the CSP fails the gates here first.
import { useState, type ReactNode } from 'react';
import { Button, ButtonLink, type ButtonVariant } from '@/components/ui/Button';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { Field, Input, TextArea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { GlassCard } from '@/components/ui/GlassCard';
import { card } from '@/components/ui/classes';

const VARIANTS: ButtonVariant[] = ['primary', 'secondary', 'quiet', 'danger', 'glass', 'cyber-solid', 'cyber-outline', 'expander-pill'];
const TONES: BadgeTone[] = ['neutral', 'success', 'warning', 'danger', 'info'];
const SWATCHES = ['bg', 'surface', 'surface-2', 'border', 'fg', 'fg-muted', 'brand', 'success', 'warning', 'danger', 'cyan', 'cyber'] as const;
const SWATCH_CLASS: Record<(typeof SWATCHES)[number], string> = {
  bg: 'bg-bg', surface: 'bg-surface', 'surface-2': 'bg-surface-2', border: 'bg-border', fg: 'bg-fg', 'fg-muted': 'bg-fg-muted',
  brand: 'bg-brand', success: 'bg-success', warning: 'bg-warning', danger: 'bg-danger', cyan: 'bg-cyan', cyber: 'bg-cyber',
};

function Section({ id, title, usage, children }: { id: string; title: string; usage: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-3">
      <h2 id={id} className="text-xl font-semibold text-fg">{title}</h2>
      <p className="font-mono text-sm text-fg-muted">{usage}</p>
      <div className={card}>{children}</div>
    </section>
  );
}

export function DesignCatalogue() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const error = name.length > 0 && name.trim().length < 2 ? 'Please use at least 2 letters.' : undefined;

  return (
    <div className="flex flex-col gap-10">
      <Section id="tokens" title="Colour tokens" usage="bg-surface · text-fg · border-border · bg-brand + text-brand-fg — never raw colours (check-tokens)">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SWATCHES.map((s) => (
            <li key={s} className="flex items-center gap-2">
              <span aria-hidden="true" className={`h-8 w-8 rounded-lg border border-border ${SWATCH_CLASS[s]}`} />
              <span className="font-mono text-sm text-fg">{s}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="buttons" title="Buttons" usage={'<Button variant="primary" size="md" sound="tick"> · <ButtonLink href="/">'}>
        <div className="flex flex-wrap items-center gap-3">
          {VARIANTS.map((v) => <Button key={v} variant={v}>{v}</Button>)}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm" variant="secondary">small</Button>
          <Button size="md" variant="secondary">medium</Button>
          <Button size="lg" variant="secondary">large</Button>
          <Button variant="secondary" disabled>disabled</Button>
          <ButtonLink href="/" variant="quiet">ButtonLink → home</ButtonLink>
        </div>
      </Section>

      <Section id="badges" title="Badges" usage={'<Badge tone="success" live>Synced</Badge> — the word carries the meaning, colour supports it'}>
        <div className="flex flex-wrap items-center gap-2">
          {TONES.map((t) => <Badge key={t} tone={t}>{t}</Badge>)}
          <Badge tone="success" live>live</Badge>
        </div>
      </Section>

      <Section id="fields" title="Fields" usage={'<Field label="Name" hint="…" error={msg}><Input /></Field> · <TextArea>'}>
        <Field label="Your name" hint="Shown on your notes." error={error}>
          <Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        </Field>
        <Field label="A longer text">
          <TextArea rows={3} />
        </Field>
      </Section>

      <Section id="modal" title="Modal" usage={'<Modal open={open} onClose={…} title="…" footer={…}> — native <dialog>: focus trap, Escape, inert page'}>
        <div><Button variant="secondary" onClick={() => setOpen(true)}>Open the modal</Button></div>
        <Modal open={open} onClose={() => setOpen(false)} title="A calm question"
          footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => setOpen(false)}>Confirm</Button></>}>
          Escape closes it, focus returns to the button that opened it, and the page behind cannot be clicked.
        </Modal>
      </Section>

      <Section id="cards" title="Cards" usage={'<GlassCard shape="hexagon" shapeColor="cyan"> · class recipe `card` for plain panels'}>
        <div className="grid gap-4 sm:grid-cols-2">
          <GlassCard shape="hexagon" shapeColor="cyan"><div className="p-5"><h3 className="font-semibold text-fg">GlassCard</h3><p className="text-sm text-fg-muted">Frosted panel with an optical shape.</p></div></GlassCard>
          <div className={card}><h3 className="font-semibold text-fg">Plain card</h3><p className="text-sm text-fg-muted">The `card` recipe from classes.ts.</p></div>
        </div>
      </Section>

      <Section id="type" title="Type — three tiers" usage="font-teroxia (hero calls to action only) · font-sans (all UI) · font-mono tabular-nums (numbers, ids)">
        <p className="font-teroxia text-2xl uppercase tracking-wider text-fg">Hero action</p>
        <p className="font-sans text-fg">Interface text in the system font — zero downloads.</p>
        <p className="font-mono tabular-nums text-fg">1,234.50 · ID 7f3a-21</p>
      </Section>
    </div>
  );
}
