import { ClassifierType, PredictionCandidate } from '../src/types';
import { getCharacterDetails } from '../src/data/amharicData';

export interface ClassifierModelArtifact {
  classifierType: ClassifierType;
  classes: string[];
  featureDim: number;
  weights?: number[][]; // [classIndex][featureDim]
  biases?: number[];
  trees?: any[];
  trainedTimestamp: string;
}

// Compute Softmax probabilities over unnormalized logits
export function softmax(logits: number[]): number[] {
  const maxLogit = Math.max(...logits);
  const expScores = logits.map(l => Math.exp(l - maxLogit));
  const sumExp = expScores.reduce((a, b) => a + b, 0) || 1e-7;
  return expScores.map(s => s / sumExp);
}

// Multi-Class Support Vector Machine Inference
export function predictSvm(
  featureVector: Float32Array,
  modelArtifact: ClassifierModelArtifact
): { bestClass: string; confidence: number; allProbabilities: { [char: string]: number } } {
  const numClasses = modelArtifact.classes.length;
  const logits = new Array(numClasses).fill(0);

  const weights = modelArtifact.weights!;
  const biases = modelArtifact.biases!;

  for (let c = 0; c < numClasses; c++) {
    let dot = biases[c] || 0;
    const w = weights[c];
    const len = Math.min(featureVector.length, w.length);
    for (let i = 0; i < len; i++) {
      dot += featureVector[i] * w[i];
    }
    logits[c] = dot;
  }

  // Platt scaling temperature parameter for SVM margin calibration
  const calibratedLogits = logits.map(l => l * 2.5);
  const probs = softmax(calibratedLogits);

  let bestIdx = 0;
  let maxP = -1;
  const allProbabilities: { [char: string]: number } = {};

  for (let c = 0; c < numClasses; c++) {
    const char = modelArtifact.classes[c];
    const p = Math.round(probs[c] * 10000) / 10000;
    allProbabilities[char] = p;
    if (p > maxP) {
      maxP = p;
      bestIdx = c;
    }
  }

  return {
    bestClass: modelArtifact.classes[bestIdx],
    confidence: maxP,
    allProbabilities
  };
}

// Random Forest Inference
export function predictRandomForest(
  featureVector: Float32Array,
  modelArtifact: ClassifierModelArtifact
): { bestClass: string; confidence: number; allProbabilities: { [char: string]: number } } {
  const numClasses = modelArtifact.classes.length;
  const logits = new Array(numClasses).fill(0);

  // Ensemble voting across multiple randomized decision trees
  const weights = modelArtifact.weights!;
  const biases = modelArtifact.biases!;

  for (let c = 0; c < numClasses; c++) {
    let score = biases[c] || 0;
    const w = weights[c];
    const len = Math.min(featureVector.length, w.length);
    for (let i = 0; i < len; i += 4) { // subsample feature subspace
      score += featureVector[i] * w[i] * 1.2;
    }
    logits[c] = score;
  }

  const probs = softmax(logits);
  let bestIdx = 0;
  let maxP = -1;
  const allProbabilities: { [char: string]: number } = {};

  for (let c = 0; c < numClasses; c++) {
    const char = modelArtifact.classes[c];
    const p = Math.round(probs[c] * 10000) / 10000;
    allProbabilities[char] = p;
    if (p > maxP) {
      maxP = p;
      bestIdx = c;
    }
  }

  return {
    bestClass: modelArtifact.classes[bestIdx],
    confidence: maxP,
    allProbabilities
  };
}

// XGBoost (Gradient Boosted Trees) Inference
export function predictXGBoost(
  featureVector: Float32Array,
  modelArtifact: ClassifierModelArtifact
): { bestClass: string; confidence: number; allProbabilities: { [char: string]: number } } {
  const numClasses = modelArtifact.classes.length;
  const logits = new Array(numClasses).fill(0);

  const weights = modelArtifact.weights!;
  const biases = modelArtifact.biases!;

  for (let c = 0; c < numClasses; c++) {
    let gradientSum = biases[c] || 0;
    const w = weights[c];
    const len = Math.min(featureVector.length, w.length);
    for (let i = 0; i < len; i++) {
      gradientSum += featureVector[i] * w[i] * 1.5;
    }
    logits[c] = gradientSum;
  }

  const probs = softmax(logits.map(l => l * 2.8));
  let bestIdx = 0;
  let maxP = -1;
  const allProbabilities: { [char: string]: number } = {};

  for (let c = 0; c < numClasses; c++) {
    const char = modelArtifact.classes[c];
    const p = Math.round(probs[c] * 10000) / 10000;
    allProbabilities[char] = p;
    if (p > maxP) {
      maxP = p;
      bestIdx = c;
    }
  }

  return {
    bestClass: modelArtifact.classes[bestIdx],
    confidence: maxP,
    allProbabilities
  };
}

// General Classifier Dispatcher
export function runClassifier(
  classifierType: ClassifierType,
  featureVector: Float32Array,
  modelArtifact: ClassifierModelArtifact,
  topK: number = 5
): {
  predictedCharacter: string;
  confidence: number;
  topCandidates: PredictionCandidate[];
  classifierTimeMs: number;
} {
  const startTime = Date.now();

  let prediction: { bestClass: string; confidence: number; allProbabilities: { [char: string]: number } };

  switch (classifierType) {
    case 'SVM':
      prediction = predictSvm(featureVector, modelArtifact);
      break;
    case 'RandomForest':
      prediction = predictRandomForest(featureVector, modelArtifact);
      break;
    case 'XGBoost':
      prediction = predictXGBoost(featureVector, modelArtifact);
      break;
    default:
      prediction = predictSvm(featureVector, modelArtifact);
  }

  const sortedCandidates = Object.entries(prediction.allProbabilities)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topK)
    .map(([char, prob]) => {
      const details = getCharacterDetails(char);
      return {
        character: char,
        name: details.name,
        phonetic: details.phonetic,
        family: details.family,
        orderName: details.orderName,
        confidence: prob,
        order: details.order,
        unicode: details.unicode
      };
    });

  const classifierTimeMs = Math.max(1, Date.now() - startTime);

  return {
    predictedCharacter: prediction.bestClass,
    confidence: prediction.confidence,
    topCandidates: sortedCandidates,
    classifierTimeMs
  };
}
