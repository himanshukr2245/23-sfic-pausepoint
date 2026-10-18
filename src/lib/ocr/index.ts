// src/lib/ocr/index.ts — Unified Offline OCR & Image Normalization Exports

export {
  calculateTargetDimensions,
  computeLuminance,
  enhanceContrast,
  preprocessReceiptImage,
  type ProcessedImage,
} from './canvas.ts';

export {
  getOcrWorker,
  isOcrWorkerReady,
  preloadOcrWorker,
  scanReceipt,
  terminateOcrWorker,
  type OcrScanResult,
} from './worker.ts';
