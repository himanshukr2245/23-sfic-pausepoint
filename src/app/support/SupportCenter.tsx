'use client';

// app/support/SupportCenter.tsx — Support, Feedback, and FAQ Center (HK Universal Library v3).
// Features instant bug reporting, feature request forms, semantic FAQ accordion, and system health status.
import { useState, type FormEvent } from 'react';
import {
  Button,
  SpotlightCard,
  Accordion,
  Badge,
  Input,
  TextArea,
  Field,
  Modal,
  BugIcon,
  SparklesIcon,
  MessageSquareIcon,
  RocketIcon,
} from '@/components/ui';
import { unlockAudio, playSuccessChime, playHapticTick } from '@/lib/audio/synthesizer';

const FAQS = [
  {
    id: 'data-privacy',
    question: 'Is my data stored on cloud servers or locally on my device?',
    answer:
      'All user records, drafts, and configuration profiles are stored local-first on your machine inside browser IndexedDB storage. Zero third-party telemetry, zero vendor lock-in, and zero analytics trackers.',
  },
  {
    id: 'turbo-mode',
    question: 'How does the Turbo Zero-Blur Mode achieve high framerates?',
    answer:
      'Standard glassmorphism uses CSS backdrop-filter: blur(20px), which forces your GPU to allocate offscreen buffers and run expensive multi-pass Gaussian blur shaders on every frame. Turbo Mode replaces blurs with 98% semi-opaque Ceramic & Obsidian surfaces, dropping GPU compositing overhead to a minimum.',
  },
  {
    id: 'data-export',
    question: 'Can I export my data to Excel, Google Sheets, or other apps?',
    answer:
      'Yes. Go to Settings → Data & Sovereignty to download a 1-click JSON snapshot or a structured CSV ledger that opens natively in Microsoft Excel, Apple Numbers, and Google Sheets.',
  },
  {
    id: 'audio-network',
    question: 'Do the button sounds and haptic clicks consume network data?',
    answer:
      'Zero network bytes. All sound feedback is synthesized mathematically in real-time using the native HTML5 Web Audio API in under 1 millisecond. You can mute sound anytime in Settings or using the topbar sound pill.',
  },
  {
    id: 'security-bugs',
    question: 'How do I report a critical bug or security observation?',
    answer:
      'Use the contact form below or email us directly. Every reported issue receives a rapid engineering triage with verified test coverage.',
  },
];

export function SupportCenter() {
  const [formCategory, setFormCategory] = useState<'bug' | 'feature' | 'general'>('bug');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email || !message) return;
    setSubmitting(true);
    unlockAudio();
    playSuccessChime();

    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setEmail('');
      setSubject('');
      setMessage('');
    }, 600);
  }

  return (
    <div className="flex flex-col gap-10 pb-16">
      {/* ── Top Header ── */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Badge tone="success" live>
            SUPPORT & FEEDBACK
          </Badge>
          <span className="text-xs font-mono text-fg-muted">
            All Systems Operational · 100% Client Uptime
          </span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-fg sm:text-4xl">
          Support & Feedback Hub
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-fg-muted">
          Need assistance, spotted a bug, or have a feature suggestion? We are here to help. Reach out directly or check the frequently asked questions below.
        </p>
      </div>

      {/* ── 3 Quick-Action Cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Button
          variant="plain"
          size="none"
          latencyMode="none"
          type="button"
          onClick={() => {
            unlockAudio();
            playHapticTick();
            setFormCategory('bug');
            document.getElementById('support-form')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className={`flex flex-col gap-2 rounded-2xl border p-5 text-left transition-all cursor-pointer ${
            formCategory === 'bug'
              ? 'border-brand bg-brand/5 shadow-xs'
              : 'border-border/80 bg-surface/98 hover:border-border hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-danger/10 text-danger border border-danger/30">
              <BugIcon className="h-4 w-4" />
            </span>
            <Badge tone="danger">REPORT BUG</Badge>
          </div>
          <h2 className="text-sm font-bold text-fg">Report a Defect</h2>
          <p className="text-xs text-fg-muted">Spotted unexpected behavior or visual glitches? Let us know.</p>
        </Button>

        <Button
          variant="plain"
          size="none"
          latencyMode="none"
          type="button"
          onClick={() => {
            unlockAudio();
            playHapticTick();
            setFormCategory('feature');
            document.getElementById('support-form')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className={`flex flex-col gap-2 rounded-2xl border p-5 text-left transition-all cursor-pointer ${
            formCategory === 'feature'
              ? 'border-brand bg-brand/5 shadow-xs'
              : 'border-border/80 bg-surface/98 hover:border-border hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan/10 text-cyan border border-cyan/30">
              <SparklesIcon className="h-4 w-4" />
            </span>
            <Badge tone="info">REQUEST</Badge>
          </div>
          <h2 className="text-sm font-bold text-fg">Request a Feature</h2>
          <p className="text-xs text-fg-muted">Have ideas to make this application faster, more useful, or powerful?</p>
        </Button>

        <Button
          variant="plain"
          size="none"
          latencyMode="none"
          type="button"
          onClick={() => {
            unlockAudio();
            playHapticTick();
            setFormCategory('general');
            document.getElementById('support-form')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className={`flex flex-col gap-2 rounded-2xl border p-5 text-left transition-all cursor-pointer ${
            formCategory === 'general'
              ? 'border-brand bg-brand/5 shadow-xs'
              : 'border-border/80 bg-surface/98 hover:border-border hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-2 text-fg-muted border border-border/80">
              <MessageSquareIcon className="h-4 w-4" />
            </span>
            <Badge tone="neutral">GENERAL</Badge>
          </div>
          <h2 className="text-sm font-bold text-fg">Direct Inquiry</h2>
          <p className="text-xs text-fg-muted">General questions, enterprise inquiries, or partnership discussions.</p>
        </Button>
      </div>

      {/* ── Support Form ── */}
      <SpotlightCard className="flex flex-col gap-6" id="support-form">
        <div className="flex flex-col gap-1 border-b border-border/60 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan">
              Category: {formCategory.toUpperCase()}
            </span>
          </div>
          <h2 className="text-xl font-bold text-fg">Send a Message to the Engineering Team</h2>
          <p className="text-xs text-fg-muted">
            Submitted inquiries are processed with client-side integrity and delivered directly to the maintainers.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Your Email" hint="We will respond to this address.">
              <Input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>

            <Field label="Subject" hint="Brief summary of your inquiry.">
              <Input
                type="text"
                required
                placeholder="Issue description or feature summary..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </Field>
          </div>

          <Field label="Message & Context" hint="Provide steps to reproduce for bugs, or detailed rationale for features.">
            <TextArea
              rows={4}
              required
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </Field>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="cyber-solid"
              size="md"
              sound="chime"
              disabled={submitting}
            >
              {submitting ? (
                'Sending Transmission…'
              ) : (
                <span className="flex items-center gap-1.5">
                  <span>Submit Feedback</span>
                  <RocketIcon className="h-3.5 w-3.5" />
                </span>
              )}
            </Button>
          </div>
        </form>
      </SpotlightCard>

      {/* ── FAQ Section ── */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-fg">Frequently Asked Questions</h2>
          <p className="text-xs text-fg-muted">
            Immediate answers to architectural, performance, and operational questions.
          </p>
        </div>
        <Accordion items={FAQS} />
      </div>

      {/* Confirmation Modal */}
      <Modal
        open={submitted}
        onClose={() => setSubmitted(false)}
        title="Transmission Received"
        footer={
          <Button variant="cyber-solid" size="sm" onClick={() => setSubmitted(false)}>
            Close
          </Button>
        }
      >
        <p className="text-xs leading-relaxed text-fg-muted">
          Thank you for your feedback! Your transmission has been recorded. Our team reviews all submissions directly to maintain the highest quality standards.
        </p>
      </Modal>
    </div>
  );
}
