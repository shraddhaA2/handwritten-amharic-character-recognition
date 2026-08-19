export interface AmharicCategory {
  index: number;
  class_id: string;
  character: string;
  base_character: string;
  base_id: string;
  order_number: number;
  order_name: string;
  phonetic: string;
  description?: string;
}

export interface TopCandidate {
  class_id: string;
  character: string;
  phonetic: string;
  confidence: number;
}

export interface FeatureSummary {
  dimension: number;
  norm: number;
  sample_values: number[];
}

export interface PredictionResultData {
  success: boolean;
  predicted_class: string;
  character: string;
  base_character?: string;
  order_name?: string;
  phonetic?: string;
  confidence: number;
  pipeline: string;
  top_candidates: TopCandidate[];
  feature_summary?: FeatureSummary;
  error?: string;
}

export interface PreprocessingInfo {
  stages: {
    stage_1_grayscale: string;
    stage_2_noise_binarization: string;
    stage_3_centering_padding: string;
    stage_4_resnet_input: string;
  };
  target_dimensions: {
    raw_size: string;
    preprocessed_size: string;
    extracted_feature_vector: string;
  };
}

export interface ModelMetrics {
  test_accuracy: number;
  top5_accuracy?: number;
  validation_accuracy?: number;
  weighted_precision: number;
  weighted_recall: number;
  weighted_f1: number;
  macro_f1?: number;
}

export interface EvaluationResults {
  model_architecture: string;
  cnn_backbone: string;
  classifier: string;
  kernel?: string;
  svm_c?: number;
  svm_gamma?: string;
  feature_dimension: number;
  total_dataset_samples: number;
  classes_count: number;
  train_samples: number;
  val_samples: number;
  test_samples: number;
  metrics: ModelMetrics;
  training_time_seconds?: number;
  device?: string;
  timestamp?: string;
}

export interface ModelComparisonRow {
  model: string;
  backbone: string;
  classifier: string;
  accuracy: string;
  precision: string;
  recall: string;
  f1: string;
}
