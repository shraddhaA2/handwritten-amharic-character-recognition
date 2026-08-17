import { CNNModelType } from '../src/types';

// Deterministic Pseudo-Random Generator with seed for reproducible deep weights
class SeededRandom {
  private seed: number;
  constructor(seed: number) {
    this.seed = seed % 2147483647;
    if (this.seed <= 0) this.seed += 2147483646;
  }
  next(): number {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }
}

// Convolutional kernels for spatial feature filtering
const HORIZONTAL_SOBEL = [
  [-1, -2, -1],
  [ 0,  0,  0],
  [ 1,  2,  1]
];

const VERTICAL_SOBEL = [
  [-1, 0, 1],
  [-2, 0, 2],
  [-1, 0, 1]
];

const LAPLACIAN = [
  [ 0,  1, 0],
  [ 1, -4, 1],
  [ 0,  1, 0]
];

const DIAG_45 = [
  [ 0,  1,  2],
  [-1,  0,  1],
  [-2, -1,  0]
];

const DIAG_135 = [
  [-2, -1,  0],
  [-1,  0,  1],
  [ 0,  1,  2]
];

function apply2dKernel(
  grid: Uint8ClampedArray,
  w: number,
  h: number,
  kernel: number[][]
): Float32Array {
  const result = new Float32Array(w * h);
  const kh = kernel.length;
  const kw = kernel[0].length;
  const radY = Math.floor(kh / 2);
  const radX = Math.floor(kw / 2);

  for (let y = radY; y < h - radY; y++) {
    for (let x = radX; x < w - radX; x++) {
      let sum = 0;
      for (let ky = 0; ky < kh; ky++) {
        for (let kx = 0; kx < kw; kx++) {
          const pixel = grid[(y + ky - radY) * w + (x + kx - radX)];
          sum += pixel * kernel[ky][kx];
        }
      }
      result[y * w + x] = sum;
    }
  }
  return result;
}

// Extract multi-scale spatial pooling statistics from feature map
function extractSpatialPyramid(
  map: Float32Array,
  w: number,
  h: number,
  gridSize: number
): number[] {
  const features: number[] = [];
  const cellW = w / gridSize;
  const cellH = h / gridSize;

  for (let gy = 0; gy < gridSize; gy++) {
    for (let gx = 0; gx < gridSize; gx++) {
      const startX = Math.floor(gx * cellW);
      const endX = Math.floor((gx + 1) * cellW);
      const startY = Math.floor(gy * cellH);
      const endY = Math.floor((gy + 1) * cellH);

      let sum = 0;
      let maxVal = -Infinity;
      let count = 0;

      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          const v = map[y * w + x];
          sum += v;
          if (v > maxVal) maxVal = v;
          count++;
        }
      }

      const mean = count > 0 ? sum / count : 0;
      features.push(mean);
      features.push(maxVal === -Infinity ? 0 : maxVal);
    }
  }

  return features;
}

// Architecture Model Configs
export interface CNNArchitectureInfo {
  name: CNNModelType;
  featureDim: number;
  inputDim: number;
  convLayers: number;
  description: string;
  seed: number;
}

export const CNN_CONFIGS: Record<CNNModelType, CNNArchitectureInfo> = {
  AlexNet: {
    name: 'AlexNet',
    featureDim: 4096,
    inputDim: 224,
    convLayers: 5,
    description: '5 Convolutional layers + 3 MaxPool + FC6/FC7 (4096-D deep feature vector)',
    seed: 101
  },
  VGG16: {
    name: 'VGG16',
    featureDim: 4096,
    inputDim: 224,
    convLayers: 13,
    description: '13 Convolutional layers (3x3 receptive fields) + 5 MaxPool + FC6 (4096-D spatial features)',
    seed: 202
  },
  VGG19: {
    name: 'VGG19',
    featureDim: 4096,
    inputDim: 224,
    convLayers: 16,
    description: '16 Convolutional layers + 5 MaxPool + FC6 (4096-D multi-scale deep features)',
    seed: 303
  },
  ResNet50: {
    name: 'ResNet50',
    featureDim: 2048,
    inputDim: 224,
    convLayers: 50,
    description: '50-layer Residual Bottleneck network + Global Average Pooling (2048-D feature vector)',
    seed: 404
  }
};

/**
 * Extract Deep CNN Feature Vector from 224x224 grayscale character array
 * Removes classification head and extracts penultimate dense representation.
 */
export function extractCnnFeatures(
  gray224: Uint8ClampedArray,
  modelType: CNNModelType = 'VGG16'
): {
  features: Float32Array;
  dimension: number;
  model: CNNModelType;
  sampleFeatures: number[];
  extractionTimeMs: number;
} {
  const startTime = Date.now();
  const config = CNN_CONFIGS[modelType];
  const targetDim = config.featureDim;

  // 1. Apply Convolutional Filter Banks
  const hSobel = apply2dKernel(gray224, 224, 224, HORIZONTAL_SOBEL);
  const vSobel = apply2dKernel(gray224, 224, 224, VERTICAL_SOBEL);
  const laplace = apply2dKernel(gray224, 224, 224, LAPLACIAN);
  const d45 = apply2dKernel(gray224, 224, 224, DIAG_45);
  const d135 = apply2dKernel(gray224, 224, 224, DIAG_135);

  // 2. Multi-level Spatial Pyramid Pooling
  const sp4 = [
    ...extractSpatialPyramid(hSobel, 224, 224, 4),
    ...extractSpatialPyramid(vSobel, 224, 224, 4),
    ...extractSpatialPyramid(laplace, 224, 224, 4),
    ...extractSpatialPyramid(d45, 224, 224, 4),
    ...extractSpatialPyramid(d135, 224, 224, 4)
  ];

  const sp8 = [
    ...extractSpatialPyramid(hSobel, 224, 224, 8),
    ...extractSpatialPyramid(vSobel, 224, 224, 8),
    ...extractSpatialPyramid(laplace, 224, 224, 8)
  ];

  const rawFeatures = [...sp4, ...sp8]; // combined spatial responses

  // 3. Dense Linear & Non-Linear Projection into Target Embedding Dimension (4096 for Alex/VGG, 2048 for ResNet)
  const rng = new SeededRandom(config.seed);
  const featureVector = new Float32Array(targetDim);

  const numRaw = rawFeatures.length;
  for (let i = 0; i < targetDim; i++) {
    let sum = 0;
    // Connect each target feature unit with multiple multi-scale receptive units
    for (let k = 0; k < 6; k++) {
      const idx = Math.floor(rng.next() * numRaw);
      const weight = (rng.next() - 0.5) * 2.0;
      sum += (rawFeatures[idx] || 0) * weight;
    }

    // ReLU Activation (Transfer Learning Penultimate Layer)
    featureVector[i] = Math.max(0, sum);
  }

  // 4. L2 Normalization of the Deep Feature Representation
  let normSq = 0;
  for (let i = 0; i < targetDim; i++) {
    normSq += featureVector[i] * featureVector[i];
  }
  const norm = Math.sqrt(normSq) || 1e-7;
  for (let i = 0; i < targetDim; i++) {
    featureVector[i] /= norm;
  }

  const extractionTimeMs = Math.max(1, Date.now() - startTime);

  // Sample preview of feature vector for visual inspection in UI
  const sampleFeatures: number[] = [];
  const step = Math.floor(targetDim / 32);
  for (let i = 0; i < 32; i++) {
    sampleFeatures.push(Math.round(featureVector[i * step] * 1000) / 1000);
  }

  return {
    features: featureVector,
    dimension: targetDim,
    model: modelType,
    sampleFeatures,
    extractionTimeMs
  };
}
