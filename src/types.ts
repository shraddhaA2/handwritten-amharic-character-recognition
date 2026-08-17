export type CNNModelType = 'AlexNet' | 'VGG16' | 'VGG19' | 'ResNet50';
export type ClassifierType = 'SVM' | 'RandomForest' | 'XGBoost';

export interface FidelCharacter {
  char: string;
  name: string;
  phonetic: string;
  order: number; // 1 to 7
  orderName: string; // Ge'ez, Ka'eb, Salis, Rabi, Hamis, Sadis, Sabi
  vowelSound: string;
  family: string;
  familyChar: string;
  unicode: string;
  description?: string;
  sampleSvgPath?: string;
}

export interface FidelFamily {
  name: string;
  baseChar: string;
  ipa: string;
  englishSound: string;
  characters: FidelCharacter[];
}

export interface PreprocessingResult {
  originalImage: string;
  grayscaleImage: string;
  denoisedImage: string;
  resizedImage: string;
  normalizedPreview: string;
  originalWidth: number;
  originalHeight: number;
  processedWidth: number;
  processedHeight: number;
  channels: number;
  meanIntensity: number;
  variance: number;
  otsuThreshold: number;
  foregroundPixelCount: number;
  foregroundPercentage: number;
  normalizationRange: [number, number];
  noiseRemovalApplied: boolean;
}

export interface PredictionCandidate {
  character: string;
  name: string;
  phonetic: string;
  family: string;
  orderName: string;
  confidence: number; // 0 to 1
  order: number;
  unicode: string;
}

export interface PredictionResponse {
  success: boolean;
  predictedCharacter: string;
  confidence: number;
  characterDetails: FidelCharacter;
  topCandidates: PredictionCandidate[];
  cnnModel: CNNModelType;
  classifier: ClassifierType;
  featureDimension: number;
  featureSample: number[];
  preprocessingInfo: {
    originalDimensions: string;
    processedDimensions: string;
    grayscale: boolean;
    noiseRemoved: boolean;
    normalized: boolean;
    otsuThreshold: number;
  };
  inferenceTimeMs: number;
  featureExtractionTimeMs: number;
  classifierTimeMs: number;
  timestamp: string;
  modelStatus: 'TRAINED' | 'TRAINING_REQUIRED' | 'BENCHMARK_PRETRAINED';
}

export interface EvaluationMetric {
  id: string;
  cnnModel: CNNModelType;
  classifier: ClassifierType;
  accuracy: number; // 0.0 - 1.0
  precision: number;
  recall: number;
  f1Score: number;
  trainingTimeSec: number;
  inferenceTimeMs: number;
  featureDimension: number;
  datasetSize: number;
  numClasses: number;
  isTrained: boolean;
  timestamp: string;
  confusionMatrix?: {
    labels: string[];
    matrix: number[][];
  };
  classMetrics?: {
    char: string;
    precision: number;
    recall: number;
    f1: number;
    support: number;
  }[];
}

export interface TrainingProgress {
  stage: 'idle' | 'loading_dataset' | 'preprocessing' | 'feature_extraction' | 'training_classifier' | 'evaluating' | 'saving_model' | 'completed' | 'error';
  progressPercent: number;
  currentStepMessage: string;
  logs: string[];
  cnnModel?: CNNModelType;
  classifier?: ClassifierType;
  epoch?: number;
  totalEpochs?: number;
  result?: EvaluationMetric;
  error?: string;
}

export interface TrainingConfig {
  cnnModel: CNNModelType;
  classifier: ClassifierType;
  datasetType: 'core_amharic_benchmark' | 'extended_fidel' | 'custom_uploaded';
  augmentation: {
    enabled: boolean;
    rotationRange: number; // e.g. 15 degrees
    shiftRange: number; // e.g. 0.1
    zoomRange: number; // e.g. 0.1
  };
  hyperparameters: {
    // SVM
    svmKernel?: 'rbf' | 'linear' | 'poly';
    svmC?: number;
    svmGamma?: 'scale' | 'auto' | number;
    // Random Forest
    rfEstimators?: number;
    rfMaxDepth?: number;
    // XGBoost
    xgbLearningRate?: number;
    xgbMaxDepth?: number;
    xgbEstimators?: number;
  };
}

export interface TrainingLogEntry {
  id: string;
  cnnModel: CNNModelType;
  classifier: ClassifierType;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  trainingDurationSec: number;
  timestamp: string;
  status: 'completed' | 'failed';
}

export interface TrainingJobResponse {
  success: boolean;
  modelId: string;
  cnnModel: CNNModelType;
  classifier: ClassifierType;
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  };
  trainingDurationSec: number;
  modelArtifactPath: string;
  message?: string;
}

export type AmharicCharacterMeta = FidelCharacter;

