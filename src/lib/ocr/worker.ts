// src/lib/ocr/worker.ts — On-Device Tesseract.js Worker Manager
// Pure client-side OCR. No image, text, or metadata leaves the user's phone.

import { createWorker, type Worker } from 'tesseract.js';
import { extractTxn, type Txn } from '@/lib/engine/golden.ts';
import { preprocessReceiptImage } from './canvas.ts';

let workerPromise: Promise<Worker> | null = null;

/**
 * Get or lazily initialize the shared Tesseract OCR worker.
 */
export async function getOcrWorker(onProgress?: (progress: number, status: string) => void): Promise<Worker> {
  if (typeof window === 'undefined') {
    throw new Error('Tesseract worker can only initialize in the browser');
  }

  if (!workerPromise) {
    workerPromise = (async () => {
      const worker = await createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text' && onProgress) {
            onProgress(Math.round(m.progress * 100), m.status);
          }
        },
      });

      // PSM 6: Assume a single uniform block of text (optimal for receipts & bank SMS)
      await worker.setParameters({
        tessedit_pageseg_mode: '6' as never,
      });

      return worker;
    })();
  }

  return workerPromise;
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
