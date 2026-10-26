/**
 * Type definitions for Handwritten Amharic Character Recognition
 */

export interface CandidatePrediction {
  rank: number;
  class_id: number;
  character: string;
  class_label: string;
  phonetic: string;
  order_name: string;
  base_character: string;
  confidence: number;
  decision_score: number;
}

export interface PredictionResponse {
  success: boolean;
  predicted_character: string;
  class_id: number;
  class_label: string;
  standard_label: string;
  base_character: string;
  order_number: number;
  order_name: string;
  phonetic: string;
  confidence: number;
  decision_score: number;
  top_candidates: CandidatePrediction[];
  pipeline: string;
  error?: string;
}

export interface BackendHealth {
  status: string;
  service: string;
  model_loaded: boolean;
  model_file: string;
  model_type: string;
  feature_extractor: string;
  feature_dimension: number;
  total_classes: number;
}
