// scripts/build-cap.mjs — Cross-platform static export builder for Capacitor Android
import { execSync } from 'node:child_process';

process.env.CAP = '1';
console.log('🛡️ Building PausePoint for Capacitor Android (output: export)...');
try {
  execSync('npx next build', {
    stdio: 'inherit',
    env: { ...process.env, CAP: '1' },
  });
  console.log('✅ PausePoint static export complete in out/');
} catch (err) {
  console.error('❌ PausePoint static export failed:', err);
  process.exit(1);
}
