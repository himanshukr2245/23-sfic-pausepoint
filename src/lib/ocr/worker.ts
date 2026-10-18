// src/lib/ocr/worker.ts — On-Device Tesseract.js Worker Manager
// Pure client-side OCR. No image, text, or metadata leaves the user's phone.

import { createWorker, type Worker } from 'tesseract.js';
import { extractTxn, type Txn } from '@/lib/engine/golden.ts';
import { preprocessReceiptImage } from './canvas.ts';

let workerPromise: Promise<Worker> | null = null;
let isReady = false;

/**
 * Check if the OCR worker is already instantiated and ready.
 */
export function isOcrWorkerReady(): boolean {
  return isReady;
}

/**
 * Get or lazily initialize the shared Tesseract OCR worker.
 */
export async function getOcrWorker(onProgress?: (progress: number, status: string) => void): Promise<Worker> {
  if (typeof window === 'undefined') {
    throw new Error('Tesseract worker can only initialize in the browser');
  }

  if (!workerPromise) {
    workerPromise = (async () => {
      if (onProgress) {
        onProgress(5, 'Initializing optical character engine...');
      }

      const worker = await createWorker('eng', 1, {
        logger: (m) => {
          if (!onProgress) return;
          if (m.status === 'loading tesseract core') {
            onProgress(15, 'Loading core WASM modules...');
          } else if (m.status === 'initializing tesseract') {
            onProgress(30, 'Initializing OCR worker...');
          } else if (m.status === 'loading language traineddata') {
            onProgress(45, 'Loading language dictionaries...');
          } else if (m.status === 'recognizing text') {
            const pct = 50 + Math.round(m.progress * 48);
            onProgress(pct, `Scanning receipt text (${Math.round(m.progress * 100)}%)...`);
          }
        },
      });

      // PSM 6: Assume a single uniform block of text (optimal for receipts & bank SMS)
      await worker.setParameters({
        tessedit_pageseg_mode: '6' as never,
      });

      isReady = true;
      if (onProgress) {
        onProgress(100, 'OCR Engine Ready');
      }
      return worker;
    })();
  }

  return workerPromise;
}

/**
 * Pre-warm the Tesseract OCR worker in the background so subsequent scans are instant.
 */
export async function preloadOcrWorker(): Promise<void> {
  if (typeof window === 'undefined' || isReady || workerPromise) return;
  try {
    await getOcrWorker();
  } catch (err) {
    console.warn('Preloading OCR worker deferred:', err);
  }
}

export interface OcrScanResult {
  rawText: string;
  confidence: number;
  txn: Txn;
  previewUrl: string;
}

/**
 * Recognize receipt text directly from an image file/blob on device:
 * 1. Downscales and normalizes to greyscale canvas
 * 2. Runs Tesseract OCR on the canvas
 * 3. Pipes raw text directly into Golden Hour engine extractTxn()
 */
export async function scanReceipt(
  file: Blob | File,
  onProgress?: (pct: number, status: string) => void
): Promise<OcrScanResult> {
  const { canvas, dataUrl } = await preprocessReceiptImage(file);
  const worker = await getOcrWorker(onProgress);

  const { data } = await worker.recognize(canvas);
  const rawText = data.text;
  const confidence = data.confidence;

  // Extract structured transaction details via Golden Hour v2 engine
  const txn = extractTxn(rawText);

  return {
    rawText,
    confidence,
    txn,
    previewUrl: dataUrl,
  };
}

/**
 * Terminate worker to free memory when idle.
 */
export async function terminateOcrWorker(): Promise<void> {
  if (workerPromise) {
    const worker = await workerPromise;
    await worker.terminate();
    workerPromise = null;
  }
}
