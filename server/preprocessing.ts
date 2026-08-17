import { PreprocessingResult } from '../src/types';

export interface RawImage {
  width: number;
  height: number;
  data: Uint8ClampedArray; // RGBA
}

// Convert base64 data URL or hex image into RGBA buffer using simple PNG/JPEG or Canvas simulation
export function parseDataUrl(dataUrl: string): { format: string; base64: string } {
  const match = dataUrl.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
  if (match) {
    return { format: match[1], base64: match[2] };
  }
  return { format: 'png', base64: dataUrl };
}

// Compute Otsu's thresholding value on grayscale array
export function calculateOtsuThreshold(grayData: Uint8ClampedArray, width: number, height: number): number {
  const totalPixels = width * height;
  const histogram = new Array(256).fill(0);

  for (let i = 0; i < totalPixels; i++) {
    const val = grayData[i];
    histogram[val]++;
  }

  let sum = 0;
  for (let i = 0; i < 256; i++) {
    sum += i * histogram[i];
  }

  let sumB = 0;
  let wB = 0;
  let wF = 0;
  let maxVariance = 0;
  let threshold = 128;

  for (let t = 0; t < 256; t++) {
    wB += histogram[t];
    if (wB === 0) continue;
    wF = totalPixels - wB;
    if (wF === 0) break;

    sumB += t * histogram[t];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;

    const betweenVariance = wB * wF * Math.pow(mB - mF, 2);
    if (betweenVariance > maxVariance) {
      maxVariance = betweenVariance;
      threshold = t;
    }
  }

  return threshold;
}

// Bilinear resize for 1-channel or 4-channel image
export function resizeGrayscale(
  src: Uint8ClampedArray,
  srcW: number,
  srcH: number,
  destW: number,
  destH: number
): Uint8ClampedArray {
  const dest = new Uint8ClampedArray(destW * destH);
  const xRatio = srcW / destW;
  const yRatio = srcH / destH;

  for (let y = 0; y < destH; y++) {
    for (let x = 0; x < destW; x++) {
      const px = x * xRatio;
      const py = y * yRatio;
      const x1 = Math.floor(px);
      const y1 = Math.floor(py);
      const x2 = Math.min(x1 + 1, srcW - 1);
      const y2 = Math.min(y1 + 1, srcH - 1);

      const xDiff = px - x1;
      const yDiff = py - y1;

      const p1 = src[y1 * srcW + x1];
      const p2 = src[y1 * srcW + x2];
      const p3 = src[y2 * srcW + x1];
      const p4 = src[y2 * srcW + x2];

      const val =
        p1 * (1 - xDiff) * (1 - yDiff) +
        p2 * xDiff * (1 - yDiff) +
        p3 * (1 - xDiff) * yDiff +
        p4 * xDiff * yDiff;

      dest[y * destW + x] = Math.round(val);
    }
  }

  return dest;
}

// Centering and Bounding box isolation (Centers character glyph)
export function centerAndCropGlyph(
  gray: Uint8ClampedArray,
  w: number,
  h: number,
  threshold: number
): { data: Uint8ClampedArray; width: number; height: number } {
  // Determine if dark-on-white or white-on-dark
  let darkCount = 0;
  for (let i = 0; i < w * h; i++) {
    if (gray[i] < threshold) darkCount++;
  }
  const isDarkOnLight = darkCount < (w * h) / 2;

  let minX = w, maxX = 0, minY = h, maxY = 0;
  let found = false;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const val = gray[y * w + x];
      const isForeground = isDarkOnLight ? (val < threshold) : (val > threshold);
      if (isForeground) {
        found = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (!found || maxX <= minX || maxY <= minY) {
    return { data: gray, width: w, height: h };
  }

  // Add 10% padding around bounding box
  const cropW = maxX - minX + 1;
  const cropH = maxY - minY + 1;
  const pad = Math.max(8, Math.round(Math.max(cropW, cropH) * 0.15));

  const boxDim = Math.max(cropW, cropH) + pad * 2;
  const centered = new Uint8ClampedArray(boxDim * boxDim).fill(isDarkOnLight ? 255 : 0);

  const startX = Math.round((boxDim - cropW) / 2);
  const startY = Math.round((boxDim - cropH) / 2);

  for (let y = 0; y < cropH; y++) {
    for (let x = 0; x < cropW; x++) {
      const srcVal = gray[(minY + y) * w + (minX + x)];
      centered[(startY + y) * boxDim + (startX + x)] = srcVal;
    }
  }

  return { data: centered, width: boxDim, height: boxDim };
}

// 3x3 Median noise filter
export function applyMedianFilter(gray: Uint8ClampedArray, w: number, h: number): Uint8ClampedArray {
  const result = new Uint8ClampedArray(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (x === 0 || y === 0 || x === w - 1 || y === h - 1) {
        result[y * w + x] = gray[y * w + x];
        continue;
      }
      const neighbors: number[] = [];
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          neighbors.push(gray[(y + dy) * w + (x + dx)]);
        }
      }
      neighbors.sort((a, b) => a - b);
      result[y * w + x] = neighbors[4]; // median element of 9
    }
  }
  return result;
}

// Convert grayscale array to SVG Data URL for previewing in frontend without canvas overhead
export function grayscaleToSvgDataUrl(data: Uint8ClampedArray, width: number, height: number): string {
  // Sample a compact bitmap representation or SVG rect matrix
  const step = Math.max(1, Math.floor(width / 112));
  const sw = Math.floor(width / step);
  const sh = Math.floor(height / step);

  let rects = '';
  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      const val = data[(y * step) * width + (x * step)];
      if (val < 250) { // Only draw non-white pixels
        rects += `<rect x="${x * step}" y="${y * step}" width="${step}" height="${step}" fill="rgb(${val},${val},${val})" />`;
      }
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="background-color: white;">${rects}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Process Image Buffer through full academic HACR Preprocessing Pipeline
export function runPreprocessingPipeline(
  rgbaData: Uint8ClampedArray,
  origW: number,
  origH: number,
  targetDim: number = 224
): {
  normalizedTensor: number[][][]; // [channels][224][224]
  flattenedGray: Uint8ClampedArray; // 224*224
  resultInfo: PreprocessingResult;
} {
  const totalPixels = origW * origH;
  const grayData = new Uint8ClampedArray(totalPixels);

  let sumIntensity = 0;
  // 1. Grayscale Conversion: 0.299 R + 0.587 G + 0.114 B
  for (let i = 0; i < totalPixels; i++) {
    const r = rgbaData[i * 4];
    const g = rgbaData[i * 4 + 1];
    const b = rgbaData[i * 4 + 2];
    const a = rgbaData[i * 4 + 3];

    // If transparent pixel, treat as white background
    const alpha = a / 255;
    const lum = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    const finalVal = Math.round(lum * alpha + 255 * (1 - alpha));

    grayData[i] = finalVal;
    sumIntensity += finalVal;
  }

  const meanIntensity = Math.round((sumIntensity / totalPixels) * 100) / 100;
  let varianceSum = 0;
  for (let i = 0; i < totalPixels; i++) {
    varianceSum += Math.pow(grayData[i] - meanIntensity, 2);
  }
  const variance = Math.round((varianceSum / totalPixels) * 100) / 100;

  // 2. Noise Removal / Median filtering
  const denoised = applyMedianFilter(grayData, origW, origH);

  // 3. Otsu Threshold Calculation
  const otsuThresh = calculateOtsuThreshold(denoised, origW, origH);

  // 4. Centering & Bounding Box Extraction
  const { data: centeredData, width: cw, height: ch } = centerAndCropGlyph(denoised, origW, origH, otsuThresh);

  // 5. Resizing to CNN Input Resolution (224x224)
  const resized = resizeGrayscale(centeredData, cw, ch, targetDim, targetDim);

  // 6. Normalization with ImageNet mean/std
  const imageNetMean = [0.485, 0.456, 0.406];
  const imageNetStd = [0.229, 0.224, 0.225];

  const normalizedTensor: number[][][] = [
    new Array(targetDim).fill(0).map(() => new Array(targetDim).fill(0)),
    new Array(targetDim).fill(0).map(() => new Array(targetDim).fill(0)),
    new Array(targetDim).fill(0).map(() => new Array(targetDim).fill(0))
  ];

  let foregroundCount = 0;
  for (let y = 0; y < targetDim; y++) {
    for (let x = 0; x < targetDim; x++) {
      const rawVal = resized[y * targetDim + x];
      if (rawVal < otsuThresh) foregroundCount++;
      const normVal = rawVal / 255.0;

      for (let c = 0; c < 3; c++) {
        normalizedTensor[c][y][x] = (normVal - imageNetMean[c]) / imageNetStd[c];
      }
    }
  }

  const foregroundPercentage = Math.round((foregroundCount / (targetDim * targetDim)) * 10000) / 100;

  // Generate SVG previews
  const graySvg = grayscaleToSvgDataUrl(grayData, origW, origH);
  const denoisedSvg = grayscaleToSvgDataUrl(denoised, origW, origH);
  const resizedSvg = grayscaleToSvgDataUrl(resized, targetDim, targetDim);

  const resultInfo: PreprocessingResult = {
    originalImage: '',
    grayscaleImage: graySvg,
    denoisedImage: denoisedSvg,
    resizedImage: resizedSvg,
    normalizedPreview: resizedSvg,
    originalWidth: origW,
    originalHeight: origH,
    processedWidth: targetDim,
    processedHeight: targetDim,
    channels: 3,
    meanIntensity,
    variance,
    otsuThreshold: otsuThresh,
    foregroundPixelCount: foregroundCount,
    foregroundPercentage,
    normalizationRange: [-2.12, 2.64],
    noiseRemovalApplied: true
  };

  return {
    normalizedTensor,
    flattenedGray: resized,
    resultInfo
  };
}
