'use client';

// src/components/pause/CognitiveImmunityDrillModal.tsx — Cognitive Immunity Drill Modal.
// ⛔ MANDATORY LAW: Commutative layouts — balanced compact cards with uniform geometry across all viewports.
// ⛔ MANDATORY ICON LAW: Pure SVG vector icons only — zero emojis in UI controls.
// Interactive 5-question cognitive immunity test evaluating scam vs genuine message recognition with instant scoring.

import { useState } from 'react';
import { X, Zap, CheckCircle2, XCircle, ShieldCheck, Award, RotateCcw, ArrowRight } from 'lucide-react';
import { playHapticTick, playPop, playSuccessChime, unlockAudio } from '@/lib/audio/synthesizer';

interface DrillQuestion {
  id: number;
  sender: string;
  message: string;
  isScam: boolean;
  trapExplanation: string;
  singleTruth: string;
}

const DRILL_QUESTIONS: DrillQuestion[] = [
  {
    id: 1,
    sender: 'TRAI-ALERT',
    message: 'Urgent notice from TRAI: Your mobile number will be deactivated in 2 hours due to pending KYC. Call our officer on 9876543210 immediately.',
    isScam: true,
    trapExplanation: 'Uses acute fear and urgency to trigger panic.',
    singleTruth: 'TRAI and telecom operators NEVER disconnect your SIM in 2 hours via SMS or phone calls.',
  },
  {
    id: 2,
    sender: 'HDFC Bank',
    message: '849201 is your OTP for purchase of Rs 2,499 at Amazon on card ending 4412. Valid for 10 mins. Do NOT share this OTP with anyone, including bank staff.',
    isScam: false,
    trapExplanation: 'Standard transactional banking SMS with genuine security warning.',
    singleTruth: 'Legitimate banks always explicitly instruct you NOT to share the OTP.',
  },
  {
    id: 3,
    sender: 'Unknown (+91 99887 76655)',
    message: 'This is Inspector Deshmukh from Cyber Branch. A parcel with illegal drugs was caught under your Aadhaar. Join Skype video call immediately for clearance.',
    isScam: true,
    trapExplanation: 'Digital Arrest extortion using fake authority and secrecy.',
    singleTruth: 'No Indian law enforcement agency ever arrests or clears suspects over a video call.',
  },
  {
    id: 4,
    sender: 'Swiggy',
    message: 'Your order from Biryani Blues is arriving in 15 mins! Track delivery partner live: https://www.swiggy.com/track/order-9941',
    isScam: false,
    trapExplanation: 'Official operational delivery update with verified official domain.',
    singleTruth: 'The link resolves to verified official swiggy.com without asking for credentials or transfers.',
  },
  {
    id: 5,
    sender: 'Telegram VIP Group',
    message: 'Exclusive task prediction code! Deposit ₹500, get guaranteed ₹5,000 withdrawal within 10 minutes. Click https://task-vip.top/app',
    isScam: true,
    trapExplanation: 'Greed lure leading to illegal online betting and deposit freeze.',
    singleTruth: 'Guaranteed 10x returns are mathematically impossible; the withdrawal button is intentionally rigged.',
  },
];

interface CognitiveImmunityDrillModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CognitiveImmunityDrillModal({
  isOpen,
  onClose,
}: CognitiveImmunityDrillModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [answered, setAnswered] = useState(false);
  const [finished, setFinished] = useState(false);

  if (!isOpen) return null;

  const currentQ = DRILL_QUESTIONS[currentIndex];
  if (!currentQ) return null;

  function handleAnswer(userChoseScam: boolean) {
    if (answered) return;
    unlockAudio();
    setSelectedAnswer(userChoseScam);
    setAnswered(true);

    const isCorrect = userChoseScam === currentQ.isScam;
    if (isCorrect) {
      setScore((s) => s + 1);
      playSuccessChime();
    } else {
      playPop();
    }
  }

  function handleNext() {
    unlockAudio();
    playHapticTick();
    if (currentIndex + 1 < DRILL_QUESTIONS.length) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    } else {
      setFinished(true);
    }
  }

  function handleReset() {
    unlockAudio();
    playHapticTick();
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setAnswered(false);
    setFinished(false);
  }

  const immunityPercent = Math.round((score / DRILL_QUESTIONS.length) * 100);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="drill-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-shade/80 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-xl rounded-2xl border border-border/80 bg-surface shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border bg-surface-2/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand block">
                Interactive Drill
              </span>
              <h2 id="drill-modal-title" className="text-base font-extrabold text-fg">
                Cognitive Immunity Challenge
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              unlockAudio();
              playHapticTick();
              onClose();
            }}
            aria-label="Close Drill"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-fg-muted hover:text-fg hover:bg-surface-2 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 flex flex-col gap-5">
          {!finished ? (
            <>
              {/* Progress & Question Pill */}
              <div className="flex items-center justify-between text-xs font-mono text-fg-muted">
                <span>
                  Question {currentIndex + 1} of {DRILL_QUESTIONS.length}
                </span>
                <span className="font-bold text-brand">
                  Score: {score}/{currentIndex}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 rounded-full bg-surface-2 overflow-hidden">
                <div
                  className="h-full bg-brand transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / DRILL_QUESTIONS.length) * 100}%` }}
                />
              </div>

              {/* Sender & Message Box */}
              <div className="rounded-xl border border-border/80 bg-surface-2/60 p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-fg-muted uppercase">
                    From: {currentQ.sender}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-border text-fg-muted">
                    SMS / Chat
                  </span>
                </div>
                <p className="text-sm font-medium text-fg leading-relaxed">
                  &ldquo;{currentQ.message}&rdquo;
                </p>
              </div>

              {/* Choice Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  disabled={answered}
                  onClick={() => handleAnswer(true)}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
                    answered
                      ? currentQ.isScam
                        ? 'bg-danger text-brand-fg border-danger shadow-xs'
                        : selectedAnswer === true
                        ? 'bg-danger/20 text-danger border-danger'
                        : 'bg-surface-2 opacity-50 border-border text-fg-muted'
                      : 'bg-surface hover:bg-danger/10 hover:border-danger/40 border-border text-fg'
                  }`}
                >
                  <XCircle className="w-4 h-4 text-danger" />
                  <span>Flag as Scam</span>
                </button>

                <button
                  type="button"
                  disabled={answered}
                  onClick={() => handleAnswer(false)}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
                    answered
                      ? !currentQ.isScam
                        ? 'bg-success text-brand-fg border-success shadow-xs'
                        : selectedAnswer === false
                        ? 'bg-danger/20 text-danger border-danger'
                        : 'bg-surface-2 opacity-50 border-border text-fg-muted'
                      : 'bg-surface hover:bg-success/10 hover:border-success/40 border-border text-fg'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span>Verify as Safe</span>
                </button>
              </div>

              {/* Explanation & The Single Truth (Shown after answering) */}
              {answered && (
                <div className="rounded-xl border border-border/80 bg-surface-2/80 p-4 flex flex-col gap-2 animate-fade-in">
                  <div className="flex items-center gap-2">
                    {selectedAnswer === currentQ.isScam ? (
                      <span className="text-xs font-bold text-success flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Correct Assessment!
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-danger flex items-center gap-1.5">
                        <XCircle className="w-4 h-4" /> Trap Triggered!
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-fg-muted leading-relaxed">
                    {currentQ.trapExplanation}
                  </p>

                  <div className="border-t border-border/60 pt-2 mt-1">
                    <span className="text-[10px] font-mono font-bold uppercase text-brand block">
                      The Disproving Truth
                    </span>
                    <p className="text-xs font-semibold text-fg mt-0.5">
                      {currentQ.singleTruth}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="mt-2 w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-brand text-brand-fg text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <span>Next Scenario</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Results Screen */
            <div className="flex flex-col items-center text-center gap-4 py-4 animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-brand/10 text-brand flex items-center justify-center">
                <Award className="w-8 h-8" />
              </div>

              <div>
                <span className="text-3xl font-extrabold font-mono text-fg">
                  {immunityPercent}%
                </span>
                <h3 className="text-base font-bold text-fg mt-1">
                  Cognitive Immunity Score: {score}/{DRILL_QUESTIONS.length}
                </h3>
                <p className="text-xs text-fg-muted mt-1 max-w-sm leading-relaxed">
                  {immunityPercent >= 80
                    ? 'Excellent prefrontal cognitive defense! You correctly identified deceptive urgency and authority hooks.'
                    : 'Good practice! Scammers rely on emotional rush to bypass logic. Use PausePoint whenever uncertain.'}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-2 border border-border text-xs font-bold text-fg hover:bg-surface cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry Drill</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand text-brand-fg text-xs font-bold hover:opacity-90 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Close &amp; Return</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
