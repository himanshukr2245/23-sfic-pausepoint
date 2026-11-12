import sharp from 'sharp';
import { resolve, join } from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';

const SOURCE_LOGO = resolve('d:/VS Code Workspaces/7. Google ai.studio/3-Assests/23-sifc-pausepoint/PausePoint_App_logo.png');
const RES_DIR = resolve('android/app/src/main/res');

const MIPMAP_SPECS = [
  { folder: 'mipmap-mdpi', size: 48, fgSize: 108 },
  { folder: 'mipmap-hdpi', size: 72, fgSize: 162 },
  { folder: 'mipmap-xhdpi', size: 96, fgSize: 216 },
  { folder: 'mipmap-xxhdpi', size: 144, fgSize: 324 },
  { folder: 'mipmap-xxxhdpi', size: 192, fgSize: 432 },
];

async function generate() {
  console.log(`Generating Perfect Android Icons from ${SOURCE_LOGO}...`);

  for (const spec of MIPMAP_SPECS) {
    const dir = join(RES_DIR, spec.folder);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    // 1. Adaptive Icon Foreground (Optimized 52% scale for perfect 24% breathing room matching Discord, LinkedIn, Teams)
    const targetFgLogo = Math.round(spec.fgSize * 0.52);
    const fgEmblemBuffer = await sharp(SOURCE_LOGO)
      .resize(targetFgLogo, targetFgLogo, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();

    const fgPadX = Math.round((spec.fgSize - targetFgLogo) / 2);
    const fgPadY = Math.round((spec.fgSize - targetFgLogo) / 2);

    await sharp({
      create: {
        width: spec.fgSize,
        height: spec.fgSize,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
      .composite([{ input: fgEmblemBuffer, left: fgPadX, top: fgPadY }])
      .png()
      .toFile(join(dir, 'ic_launcher_foreground.png'));

    // 2. Legacy Square Launcher Icon (Deep Obsidian Squircle badge with centered emblem)
    const squircleRadius = Math.round(spec.size * 0.22);
    const targetLegacyLogo = Math.round(spec.size * 0.58);
    const legacyEmblemBuffer = await sharp(SOURCE_LOGO)
      .resize(targetLegacyLogo, targetLegacyLogo, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();

    const legacyPad = Math.round((spec.size - targetLegacyLogo) / 2);

    const squircleSvg = Buffer.from(`
      <svg width="${spec.size}" height="${spec.size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="gradSq" cx="50%" cy="50%" r="75%">
            <stop offset="0%" stop-color="#182747" />
            <stop offset="60%" stop-color="#0E1629" />
            <stop offset="100%" stop-color="#060913" />
          </radialGradient>
        </defs>
        <rect width="${spec.size}" height="${spec.size}" rx="${squircleRadius}" ry="${squircleRadius}" fill="url(#gradSq)" />
      </svg>
    `);

    await sharp(squircleSvg)
      .composite([{ input: legacyEmblemBuffer, left: legacyPad, top: legacyPad }])
      .png()
      .toFile(join(dir, 'ic_launcher.png'));

    // 3. Legacy Round Launcher Icon (Deep Obsidian Circular badge with centered emblem)
    const circleSvg = Buffer.from(`
      <svg width="${spec.size}" height="${spec.size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="gradCirc" cx="50%" cy="50%" r="75%">
            <stop offset="0%" stop-color="#182747" />
            <stop offset="60%" stop-color="#0E1629" />
            <stop offset="100%" stop-color="#060913" />
          </radialGradient>
        </defs>
        <circle cx="${spec.size / 2}" cy="${spec.size / 2}" r="${spec.size / 2}" fill="url(#gradCirc)" />
      </svg>
    `);

    await sharp(circleSvg)
      .composite([{ input: legacyEmblemBuffer, left: legacyPad, top: legacyPad }])
      .png()
      .toFile(join(dir, 'ic_launcher_round.png'));

    console.log(`  ✓ Generated calibrated ${spec.folder} (fg: ${spec.fgSize}px, legacy: ${spec.size}px)`);
  }

  // Generate in-app compose drawable logo
  const drawableDir = join(RES_DIR, 'drawable');
  if (!existsSync(drawableDir)) mkdirSync(drawableDir, { recursive: true });

  await sharp(SOURCE_LOGO)
    .resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toFile(join(drawableDir, 'ic_pausepoint_logo.png'));
  console.log(`  ✓ Generated drawable/ic_pausepoint_logo.png (256x256)`);

  console.log('✅ Android Launcher & In-App Brand Icons generated with perfect safe zone ratios!');
}

generate().catch(err => {
  console.error('Failed to generate icons:', err);
  process.exit(1);
});
