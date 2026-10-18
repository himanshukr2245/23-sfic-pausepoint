#!/usr/bin/env node
// scripts/hackathon-plan.mjs — 1-Click Hackathon Solution Plan Generator for Claude & AI
// Usage: node scripts/hackathon-plan.mjs "AppName" "Problem Statement" [--archetype <name>]
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { execSync } from 'node:child_process';

const ARCHETYPES = {
  'cyber-saas': {
    name: 'Cyber-Accented Modern SaaS',
    desc: 'Pitch dark obsidian canvas, electric cyan #00e5ff, pulsing beacon dots, command palette.',
    bestFor: 'Hackathon AI Apps, Cybersecurity, Real-time Platforms, Emergency Response',
  },
  productivity: {
    name: 'Precision Data-Dense Productivity',
    desc: 'Alabaster / Slate, monospace figures, 1px hairline dividers, zero blur on scrolling tables.',
    bestFor: 'FinTech, Invoicing, ERP, Analytics Dashboards, Business Tools',
  },
  game: {
    name: 'Cyber-Kinetic High-Feedback',
    desc: 'Large 48px touch targets, high-contrast badges, procedural audio, tactile spring physics.',
    bestFor: 'Accessible Games, Interactive Education, Audio/Haptic Training Tools',
  },
  editorial: {
    name: 'Editorial Ambient Minimalism',
    desc: 'High-prestige typographic hierarchy, mouse-following spotlight glow cards.',
    bestFor: 'Portfolio, Brand Showcase, High-End SaaS Landing Pages',
  },
  notes: {
    name: 'Quiet Flat Minimalism',
    desc: 'Split-pane navigation, distraction-free markdown canvas, flat opaque surfaces.',
    bestFor: 'Personal Knowledge Base, Document Editors, Internal Wikis',
  },
  storytelling: {
    name: 'Editorial Romance & Creative Storytelling',
    desc: 'Warm cream ivory / midnight sepia, elegant serif body, reading focus mode, ambient audio.',
    bestFor: 'Creative Writing, Story Reader, Long-Form Content Platforms',
  },
};

const args = process.argv.slice(2);
const appName = args[0];
const problemStatement = args[1];

if (!appName || !problemStatement) {
  console.log(`
⚡ HK Universal Hackathon Solution Prompt Generator v6.0

Usage:
  node scripts/hackathon-plan.mjs "AppName" "Problem Statement" [options]

Options:
  --archetype <name>    cyber-saas (default) | productivity | game | editorial | notes | storytelling

Example:
  node scripts/hackathon-plan.mjs "PausePoint" "Anti-Phishing Cognitive Firewall detecting scam links & QR codes" --archetype cyber-saas
`);
  process.exit(0);
}

const archetypeArg = args.find((_, i, arr) => arr[i - 1] === '--archetype') || 'cyber-saas';
const archetype = ARCHETYPES[archetypeArg] || ARCHETYPES['cyber-saas'];

// Resolve HK_AI_ONE_SHOT_CODEX.md
const possiblePaths = [
  resolve(process.cwd(), '../../2-Plans/universal/HK_AI_ONE_SHOT_CODEX.md'),
  resolve(process.cwd(), '../2-Plans/universal/HK_AI_ONE_SHOT_CODEX.md'),
  resolve(process.cwd(), '2-Plans/universal/HK_AI_ONE_SHOT_CODEX.md'),
];

let codexContent = '';
for (const p of possiblePaths) {
  if (existsSync(p)) {
    codexContent = readFileSync(p, 'utf8');
    break;
  }
}

if (!codexContent) {
  console.warn('⚠️ Could not locate HK_AI_ONE_SHOT_CODEX.md. Proceeding with embedded core directives.');
}

const prompt = `# Master Architectural Directive: ${appName} Solution Blueprint

## 🎯 The Hackathon Challenge
**Application Name:** ${appName}
**Selected Design Archetype:** ${archetype.name} (${archetype.desc})
**Problem Statement & Core Mandate:**
${problemStatement}

---

## 🏛️ Authoritative Context & System Codex
Follow all immutable laws, component signatures, and speed rules defined below:

${codexContent}

---

## 📋 Required Output: The Award-Winning 5-Phase Master Blueprint

Generate a highly detailed, world-class implementation plan for **${appName}** adhering to this exact schema:

1. **🚨 Executive Summary & Root Cause Diagnostic**:
   - Deconstruct the real-world problem, user vulnerability, or system failure.
   - Detail why existing solutions fail and how ${appName}'s architecture solves it.
2. **Phase 1: Zero-Latency Real-Time Reactive Core Engine**:
   - Sub-millisecond execution, atomic state coupling, reactive analysis on every input change.
3. **Phase 2: Visual Comparison & Forensic Dissection Workspace**:
   - Side-by-side interactive comparator using \`<AwsPrecisionCard>\` and \`<SpotlightCard>\`.
4. **Phase 3: Interactive 60-Second Cognitive / Simulation Arena (The Judge WOW Hook)**:
   - Gamified test challenge testing user intuition, live 0–100% score calculation, and procedural Web Audio haptics.
5. **Phase 4: Court-Ready / Enterprise Export Dossier**:
   - Printable HTML5 Section 65B FIR / audit report with SHA-256 digital fingerprint and verifiable timestamp.
6. **Phase 5: Native Mobile Hardening & Emergency Protocols**:
   - Capacitor Android APK readiness, 1-tap emergency hotline, and offline outbox sync.
7. **🪜 The Verification Ladder**:
   - Exact commands: \`npm run check:fast\`, \`npm run check\`, and verification assertions.
`;

// Save to .hk/hackathon-prompt.md
const hkDir = resolve(process.cwd(), '.hk');
if (!existsSync(hkDir)) {
  mkdirSync(hkDir, { recursive: true });
}
const outputPath = join(hkDir, 'hackathon-prompt.md');
writeFileSync(outputPath, prompt, 'utf8');

console.log(`\n🚀 Hackathon Master Prompt Successfully Generated!`);
console.log(`📦 Application: "${appName}"`);
console.log(`📐 Archetype: ${archetype.name}`);
console.log(`💾 Saved to: .hk/hackathon-prompt.md`);

// Attempt to copy to clipboard on Windows (PowerShell) or macOS (pbcopy)
try {
  if (process.platform === 'win32') {
    execSync(`powershell -command "Get-Content -Raw -Encoding UTF8 '${outputPath}' | Set-Clipboard"`, { stdio: 'ignore' });
    console.log(`📋 Copied directly to Windows Clipboard! Just press Ctrl+V in Claude / Antigravity!\n`);
  } else if (process.platform === 'darwin') {
    execSync(`cat "${outputPath}" | pbcopy`, { stdio: 'ignore' });
    console.log(`📋 Copied directly to macOS Clipboard!\n`);
  }
} catch {
  console.log(`💡 Tip: Open .hk/hackathon-prompt.md to copy your primed prompt.\n`);
}
