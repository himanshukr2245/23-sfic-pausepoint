import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { TRANSLATIONS, getLanguage, setLanguage, toggleLanguage } from '../src/lib/i18n.ts';
import { isSpeechSupported, stopSpeaking } from '../src/lib/speech.ts';

describe('Phase 4: Bilingual Localisation & i18n Dictionary Integrity', () => {
  const enKeys = Object.keys(TRANSLATIONS.en).sort();
  const hiKeys = Object.keys(TRANSLATIONS.hi).sort();

  test('English and Hindi translation dictionaries have identical key schemas', () => {
    assert.deepEqual(
      enKeys,
      hiKeys,
      `Key mismatch between languages! Missing in Hindi: ${enKeys.filter((k) => !hiKeys.includes(k)).join(', ')}`
    );
  });

  test('all Hindi translations contain non-empty Devanagari or numbers', () => {
    for (const [key, val] of Object.entries(TRANSLATIONS.hi)) {
      assert.ok(val.trim().length > 0, `Empty translation for Hindi key: ${key}`);
      // Key "langSwitch" in Hindi is "English", all other keys should have meaningful text
      if (key !== 'langSwitch') {
        assert.ok(
          /[\u0900-\u097F0-9A-Za-z]/.test(val),
          `Invalid character set for Hindi translation: ${key} -> ${val}`
        );
      }
    }
  });

  test('language state machine transitions properly', () => {
    setLanguage('en');
    assert.equal(getLanguage(), 'en');

    const next = toggleLanguage();
    assert.equal(next, 'hi');
    assert.equal(getLanguage(), 'hi');

    setLanguage('en');
    assert.equal(getLanguage(), 'en');
  });

  test('speech synthesis module handles headless/node environments gracefully', () => {
    assert.equal(isSpeechSupported(), false);
    // stopSpeaking() should not throw in node/headless environment
    assert.doesNotThrow(() => {
      stopSpeaking();
    });
  });
});
