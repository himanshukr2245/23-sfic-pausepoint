// lib/speech.ts — Web Speech API wrapper for crisis narration (HK Universal Library v3).
// Calm, pacing-controlled text-to-speech supporting English (en-IN) and Hindi (hi-IN).

export type SpeechLanguage = 'en-IN' | 'hi-IN';

export interface SpeechOptions {
  lang?: SpeechLanguage;
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: unknown) => void;
}


export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

export function stopSpeaking(): void {
  if (!isSpeechSupported()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    // Ignore speech cancellation errors
  }
}

export function isSpeaking(): boolean {
  if (!isSpeechSupported()) return false;
  return window.speechSynthesis.speaking;
}

/**
 * Speaks text using the browser's speech synthesis engine.
 * Defaults to Indian English (en-IN) or Hindi (hi-IN) with calm, 0.92x pace.
 */
export function speakText(text: string, options: SpeechOptions = {}): boolean {
  if (!isSpeechSupported()) {
    options.onError?.(new Error('Speech synthesis not supported in this browser'));
    return false;
  }

  const {
    lang = 'en-IN',
    rate = 0.92, // Calm, intelligible pace for panicking victims and senior citizens
    pitch = 1.0,
    onStart,
    onEnd,
    onError,
  } = options;

  stopSpeaking();

  try {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = pitch;

    // Pick best matching voice if available
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice =
      voices.find((v) => v.lang.toLowerCase() === lang.toLowerCase()) ||
      voices.find((v) => v.lang.toLowerCase().startsWith(lang.slice(0, 2).toLowerCase()));

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => {
      onStart?.();
    };

    utterance.onend = () => {
      onEnd?.();
    };

    utterance.onerror = (event) => {
      onError?.(event);
    };

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    onError?.(err);
    return false;
  }
}
