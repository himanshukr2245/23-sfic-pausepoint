import sharp from 'sharp';
import { resolve, join } from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';

const SOURCE_LOGO = resolve('d:/VS Code Workspaces/7. Google ai.studio/4-Projects/00-Assets_Original/23-sifc-pausepoint/PausePoint_App_logo.png');
const RES_DIR = resolve('android/app/src/main/res');

const MIPMAP_SPECS = [
  { folder: 'mipmap-mdpi', size: 48, fgSize: 108 },
  { folder: 'mipmap-hdpi', size: 72, fgSize: 162 },
  { folder: 'mipmap-xhdpi', size: 96, fgSize: 216 },
  { folder: 'mipmap-xxhdpi', size: 144, fgSize: 324 },
  { folder: 'mipmap-xxxhdpi', size: 192, fgSize: 432 },
];

async function generate() {
  console.log(`Generating Android Icons from ${SOURCE_LOGO}...`);

  for (const spec of MIPMAP_SPECS) {
    const dir = join(RES_DIR, spec.folder);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    // Standard square launcher
    await sharp(SOURCE_LOGO)
      .resize(spec.size, spec.size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toFile(join(dir, 'ic_launcher.png'));

    // Round launcher
    await sharp(SOURCE_LOGO)
      .resize(spec.size, spec.size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toFile(join(dir, 'ic_launcher_round.png'));

    // Adaptive icon foreground
    await sharp(SOURCE_LOGO)
      .resize(Math.round(spec.fgSize * 0.75), Math.round(spec.fgSize * 0.75), { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .extend({
        top: Math.round(spec.fgSize * 0.125),
        bottom: Math.round(spec.fgSize * 0.125),
        left: Math.round(spec.fgSize * 0.125),
        right: Math.round(spec.fgSize * 0.125),
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .resize(spec.fgSize, spec.fgSize)
      .toFile(join(dir, 'ic_launcher_foreground.png'));

    console.log(`  ✓ Generated ${spec.folder}`);
  }

  // Generate in-app compose drawable logo
  const drawableDir = join(RES_DIR, 'drawable');
  if (!existsSync(drawableDir)) mkdirSync(drawableDir, { recursive: true });

  await sharp(SOURCE_LOGO)
    .resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toFile(join(drawableDir, 'ic_pausepoint_logo.png'));
  console.log(`  ✓ Generated drawable/ic_pausepoint_logo.png (256x256)`);

  console.log('✅ Android Launcher & In-App Brand Icons generated successfully!');
}

generate().catch(err => {
  console.error('Failed to generate icons:', err);
  process.exit(1);
});
