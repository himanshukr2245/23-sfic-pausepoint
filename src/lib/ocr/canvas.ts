// src/lib/ocr/canvas.ts — Client-side Image Pre-processing for Receipt OCR
// Downscales large screenshots to max 1600px and converts to greyscale on an HTML5 canvas.
// Ensures faster OCR execution, higher accuracy on budget devices, and zero cloud uploads.

export interface ProcessedImage {
  canvas: HTMLCanvasElement;
  dataUrl: string;
  width: number;
  height: number;
}

/**
 * Calculate proportional dimensions capped at maxDim (default 1600px).
 */
export function calculateTargetDimensions(
  width: number,
  height: number,
  maxDim: number = 1600
): { width: number; height: number; scaled: boolean } {
  if (width <= 0 || height <= 0) {
    return { width: 0, height: 0, scaled: false };
  }
  if (width <= maxDim && height <= maxDim) {
    return { width, height, scaled: false };
  }

  if (width >= height) {
    const targetHeight = Math.max(1, Math.round((height * maxDim) / width));
    return { width: maxDim, height: targetHeight, scaled: true };
  } else {
    const targetWidth = Math.max(1, Math.round((width * maxDim) / height));
    return { width: targetWidth, height: maxDim, scaled: true };
  }
}

/**
 * Compute ITU-R BT.601 luminance from RGB channels.
 */
export function computeLuminance(r: number, g: number, b: number): number {
  return Math.round(0.299 * r + 0.587 * g + 0.114 * b);
}

/**
 * Linear contrast stretching centered at mid-grey (128).
 * factor 1.25 increases readability of numbers on gradient backgrounds.
 */
export function enhanceContrast(gray: number, factor: number = 1.25): number {
  const adjusted = Math.round((gray - 128) * factor + 128);
  return Math.max(0, Math.min(255, adjusted));
}

/**
 * Preprocess an image file or blob:
 * 1. Loads image into an HTMLImageElement
 * 2. Downscales proportionally if width or height > 1600px
 * 3. Applies luminance-weighted greyscale transformation and contrast enhancement
 */
export async function preprocessReceiptImage(
  file: Blob | File,
  options: { contrastFactor?: number; maxDim?: number } = {}
): Promise<ProcessedImage> {
  if (typeof window === 'undefined') {
    throw new Error('preprocessReceiptImage can only run in the browser');
  }

  const { contrastFactor = 1.25, maxDim = 1600 } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const { width, height } = calculateTargetDimensions(img.width, img.height, maxDim);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (!ctx) {
        reject(new Error('Failed to create canvas 2D rendering context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Apply Greyscale & Contrast Enhancement
      try {
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i] ?? 0;
          const g = data[i + 1] ?? 0;
          const b = data[i + 2] ?? 0;

          const rawGray = computeLuminance(r, g, b);
          const gray = enhanceContrast(rawGray, contrastFactor);

          data[i] = gray;
          data[i + 1] = gray;
          data[i + 2] = gray;
        }

        ctx.putImageData(imgData, 0, 0);
      } catch (err) {
        // If getImageData fails (e.g. cross-origin), canvas image is still usable
        console.warn('Canvas pixel manipulation skipped:', err);
      }

      resolve({
        canvas,
        dataUrl: canvas.toDataURL('image/jpeg', 0.85),
        width,
        height,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image for receipt OCR preprocessing'));
    };

    img.src = objectUrl;
  });
}
