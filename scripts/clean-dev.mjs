// scripts/clean-dev.mjs — Clean development server launcher (HK Universal Library v3)
// Safely purges Next 16 dev cache (.next/dev/cache, .next/cache) before starting Turbo.
// Gracefully handles Windows file locking and transparently forwards all CLI arguments.
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const rootDir = process.cwd();
const pathsToPurge = [
  path.join(rootDir, '.next', 'dev', 'cache'),
  path.join(rootDir, '.next', 'cache'),
  path.join(rootDir, '.next', 'types'),
];

for (const targetPath of pathsToPurge) {
  if (fs.existsSync(targetPath)) {
    try {
      fs.rmSync(targetPath, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
    } catch {
      // Non-fatal if locked by an active process
    }
  }
}

// Remove stale dev lockfile if present
const lockFile = path.join(rootDir, '.next', 'dev', 'lock');
if (fs.existsSync(lockFile)) {
  try {
    fs.unlinkSync(lockFile);
  } catch {
    // Non-fatal
  }
}

const userArgs = process.argv.slice(2);
const nextArgs = ['dev', '--turbo', '-H', '127.0.0.1', ...userArgs];

const isWindows = process.platform === 'win32';
const nextBin = isWindows ? 'npx.cmd' : 'npx';

const child = spawn(nextBin, ['next', ...nextArgs], {
  stdio: 'inherit',
  env: process.env,
  shell: isWindows,
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code ?? 0);
  }
});
