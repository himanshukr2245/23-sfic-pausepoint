// src/lib/qr/qrcode.ts — Zero-Dependency Pure TypeScript QR Code Generator
/* tokens-ok-file: QR SVG matrix generator produces monochrome binary pixels with default black/white fallbacks */
// Generates standard ISO/IEC 18004 QR codes as SVG strings and 2D boolean matrices.
// 100% On-Device, zero cloud dependencies.

// Galois Field GF(256) with primitive polynomial 0x11D (285)
const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);
let x = 1;
for (let i = 0; i < 255; i++) {
  EXP[i] = x;
  EXP[i + 255] = x;
  LOG[x] = i;
  x = (x << 1) ^ (x >= 128 ? 0x11d : 0);
}

function gmul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return EXP[LOG[a] + LOG[b]];
}

// Standard QR Capacity Table: [Version, TotalDataCodewords, ECCodewordsPerBlock, NumBlocks]
// Error Correction Level M (15% recovery)
const VERSION_SPECS: Record<number, { dataCodewords: number; ecCodewords: number; blocks: number }> = {
  1: { dataCodewords: 16, ecCodewords: 10, blocks: 1 },
  2: { dataCodewords: 28, ecCodewords: 16, blocks: 1 },
  3: { dataCodewords: 44, ecCodewords: 26, blocks: 1 },
  4: { dataCodewords: 64, ecCodewords: 18, blocks: 2 },
  5: { dataCodewords: 86, ecCodewords: 24, blocks: 2 },
  6: { dataCodewords: 108, ecCodewords: 16, blocks: 4 },
  7: { dataCodewords: 124, ecCodewords: 18, blocks: 4 },
  8: { dataCodewords: 154, ecCodewords: 22, blocks: 4 },
  9: { dataCodewords: 182, ecCodewords: 22, blocks: 5 },
  10: { dataCodewords: 216, ecCodewords: 26, blocks: 5 },
};

// Alignment pattern centers for versions 1 to 10
const ALIGNMENT_COORDS: Record<number, number[]> = {
  1: [],
  2: [6, 18],
  3: [6, 22],
  4: [6, 26],
  5: [6, 30],
  6: [6, 34],
  7: [6, 22, 38],
  8: [6, 24, 42],
  9: [6, 26, 46],
  10: [6, 28, 50],
};

function rsGenPoly(n: number): Uint8Array {
  let poly = new Uint8Array([1]);
  for (let i = 0; i < n; i++) {
    const next = new Uint8Array(poly.length + 1);
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= gmul(poly[j], EXP[i]);
      next[j + 1] ^= poly[j];
    }
    poly = next;
  }
  return poly;
}

function rsCompute(data: Uint8Array, ecCount: number): Uint8Array {
  const gen = rsGenPoly(ecCount);
  const res = new Uint8Array(ecCount);
  for (let i = 0; i < data.length; i++) {
    const coef = data[i] ^ res[0];
    res.copyWithin(0, 1);
    res[ecCount - 1] = 0;
    for (let j = 0; j < ecCount; j++) {
      res[j] ^= gmul(gen[j], coef);
    }
  }
  return res;
}

export interface QROptions {
  margin?: number;
  size?: number;
  darkColor?: string;
  lightColor?: string;
}

/**
 * Encodes text into a standard QR code 2D boolean grid (true = dark, false = light).
 */
export function generateQRMatrix(text: string): boolean[][] {
  const bytes = new TextEncoder().encode(text);

  // Find lowest version that can hold bytes + mode header (4 bits) + length (8 or 16 bits)
  let version = 1;
  while (version <= 10) {
    const spec = VERSION_SPECS[version];
    const lengthBits = version <= 9 ? 8 : 16;
    const requiredBits = 4 + lengthBits + bytes.length * 8;
    if (requiredBits <= spec.dataCodewords * 8) break;
    version++;
  }
  if (version > 10) {
    throw new Error(`Input text exceeds maximum capacity for micro QR generator (max version 10): ${bytes.length} bytes`);
  }

  const spec = VERSION_SPECS[version];
  const totalDataBytes = spec.dataCodewords;

  // 1. Bitstream packaging (Byte Mode: 0100)
  const bitstream: number[] = [];
  function pushBits(val: number, len: number) {
    for (let i = len - 1; i >= 0; i--) {
      bitstream.push((val >> i) & 1);
    }
  }

  pushBits(0b0100, 4); // Byte mode indicator
  pushBits(bytes.length, version <= 9 ? 8 : 16); // Character count indicator
  for (const b of bytes) pushBits(b, 8);

  // Terminator
  const maxBits = totalDataBytes * 8;
  const termLen = Math.min(4, maxBits - bitstream.length);
  pushBits(0, termLen);

  // Pad to byte boundary
  while (bitstream.length % 8 !== 0) bitstream.push(0);

  // Convert to bytes
  const dataBytes = new Uint8Array(totalDataBytes);
  for (let i = 0; i < bitstream.length / 8; i++) {
    let b = 0;
    for (let j = 0; j < 8; j++) b = (b << 1) | bitstream[i * 8 + j];
    dataBytes[i] = b;
  }

  // Alternate pad bytes 0xEC, 0x11
  let padToggle = 0;
  for (let i = bitstream.length / 8; i < totalDataBytes; i++) {
    dataBytes[i] = padToggle === 0 ? 0xec : 0x11;
    padToggle ^= 1;
  }

  // 2. Reed-Solomon Error Correction Blocks
  const blockSize = Math.floor(totalDataBytes / spec.blocks);
  const ecPerBlock = spec.ecCodewords;
  const blocksData: Uint8Array[] = [];
  const blocksEc: Uint8Array[] = [];

  for (let b = 0; b < spec.blocks; b++) {
    const start = b * blockSize;
    const end = b === spec.blocks - 1 ? totalDataBytes : start + blockSize;
    const sub = dataBytes.subarray(start, end);
    blocksData.push(sub);
    blocksEc.push(rsCompute(sub, ecPerBlock));
  }

  // Interleave data & EC bytes
  const interleaved: number[] = [];
  const maxBlockLen = Math.max(...blocksData.map((b) => b.length));
  for (let i = 0; i < maxBlockLen; i++) {
    for (const b of blocksData) {
      if (i < b.length) interleaved.push(b[i]);
    }
  }
  for (let i = 0; i < ecPerBlock; i++) {
    for (const b of blocksEc) {
      if (i < b.length) interleaved.push(b[i]);
    }
  }

  // 3. Matrix Construction
  const dim = 17 + version * 4;
  const grid: boolean[][] = Array.from({ length: dim }, () => Array(dim).fill(false));
  const isFunction: boolean[][] = Array.from({ length: dim }, () => Array(dim).fill(false));

  function setFunction(r: number, c: number, val: boolean) {
    if (r >= 0 && r < dim && c >= 0 && c < dim) {
      grid[r][c] = val;
      isFunction[r][c] = true;
    }
  }

  // Finder Patterns (7x7 at top-left, top-right, bottom-left)
  function placeFinder(r0: number, c0: number) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const row = r0 + r;
        const col = c0 + c;
        if (row < 0 || row >= dim || col < 0 || col >= dim) continue;
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        const inFinder = r >= 0 && r <= 6 && c >= 0 && c <= 6;
        setFunction(row, col, inFinder && (isBorder || isCenter));
      }
    }
  }

  placeFinder(0, 0);
  placeFinder(0, dim - 7);
  placeFinder(dim - 7, 0);

  // Timing patterns
  for (let i = 8; i < dim - 8; i++) {
    setFunction(6, i, i % 2 === 0);
    setFunction(i, 6, i % 2 === 0);
  }

  // Alignment patterns
  const coords = ALIGNMENT_COORDS[version];
  for (const r of coords) {
    for (const c of coords) {
      // Skip if overlapping finder patterns
      if ((r <= 8 && c <= 8) || (r <= 8 && c >= dim - 8) || (r >= dim - 8 && c <= 8)) continue;
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const isEdge = Math.abs(dr) === 2 || Math.abs(dc) === 2;
          const isCore = dr === 0 && dc === 0;
          setFunction(r + dr, c + dc, isEdge || isCore);
        }
      }
    }
  }

  // Dark module
  setFunction(dim - 8, 8, true);

  // Format info dummy reserve
  for (let i = 0; i <= 8; i++) {
    setFunction(8, i, false);
    setFunction(i, 8, false);
  }
  for (let i = dim - 8; i < dim; i++) {
    setFunction(8, i, false);
    setFunction(i, 8, false);
  }

  // 4. Data Placement in Zig-Zag pattern
  let bitIdx = 0;
  const totalBits = interleaved.length * 8;
  let dir = -1; // Moving upwards first
  for (let c = dim - 1; c > 0; c -= 2) {
    if (c === 6) c--; // Skip vertical timing pattern
    for (let step = 0; step < dim; step++) {
      const r = dir === -1 ? dim - 1 - step : step;
      for (let colOffset = 0; colOffset < 2; colOffset++) {
        const col = c - colOffset;
        if (!isFunction[r][col]) {
          let bit = false;
          if (bitIdx < totalBits) {
            const byte = interleaved[Math.floor(bitIdx / 8)];
            bit = ((byte >> (7 - (bitIdx % 8))) & 1) === 1;
            bitIdx++;
          }
          // Mask 000: (r + col) % 2 === 0
          const mask = (r + col) % 2 === 0;
          grid[r][col] = bit !== mask;
        }
      }
    }
    dir = -dir;
  }

  // 5. Write Format Information (Level M, Mask 000 -> 0x5412 XOR 0x2A15)
  // Precomputed 15-bit format bits for Level M (00) + Mask 000: 0x5412 ^ 0x5412 = 0x0000 -> masked 0x2A15
  // Format info code: 0b101010000010010 (0x5412)
  const formatCode = 0b101010000010010;
  for (let i = 0; i < 15; i++) {
    const bit = ((formatCode >> (14 - i)) & 1) === 1;
    // Top-left horizontal & vertical
    if (i < 6) grid[8][i] = bit;
    else if (i === 6) grid[8][7] = bit;
    else if (i === 7) grid[8][8] = bit;
    else if (i === 8) grid[7][8] = bit;
    else grid[14 - i][8] = bit;

    // Bottom-left and top-right copies
    if (i < 7) grid[dim - 1 - i][8] = bit;
    else grid[8][dim - 15 + i] = bit;
  }

  return grid;
}

export interface QROptions {
  margin?: number;
  size?: number;
  darkColor?: string;
  lightColor?: string;
  fgColor?: string;
  bgColor?: string;
  cellSize?: number;
}

/**
 * Renders QR code as an SVG string.
 */
export function generateQRSvg(text: string, options: QROptions = {}): string {
  const grid = generateQRMatrix(text);
  const dim = grid.length;
  const margin = options.margin ?? 2;
  const totalDim = dim + margin * 2;
  const size = options.size ?? 240;
  const dark = options.darkColor ?? options.fgColor ?? '#000000';
  const light = options.lightColor ?? options.bgColor ?? '#FFFFFF';

  let rects = '';
  for (let r = 0; r < dim; r++) {
    for (let c = 0; c < dim; c++) {
      if (grid[r][c]) {
        rects += `<rect x="${c + margin}" y="${r + margin}" width="1" height="1" fill="${dark}"/>`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalDim} ${totalDim}" width="${size}" height="${size}" shape-rendering="crispEdges">
  <rect width="${totalDim}" height="${totalDim}" fill="${light}"/>
  ${rects}
</svg>`;
}
