"""
Handwritten Amharic Character Recognition
Inference & Prediction Pipeline

Pipeline:
1. Input Image (file path, bytes, base64 data URL, or PIL Image)
2. 8-stage image preprocessing (noise filter, Otsu binarization, center-padding, 224x224 resize)
3. Pretrained ResNet50 deep feature extraction (2048-dimensional embedding)
4. Linear SVM classification across 238 Amharic character classes
5. Character & linguistic metadata mapping (Ethiopic glyph, vowel order, phonetic)
"""
import io
import os
import sys
import json
import warnings
from pathlib import Path
from typing import Union, Dict, Any, List

import numpy as np
import joblib
import torch

from .config import (
    SVM_MODEL_PATH,
    LABEL_MAPPING_PATH,
    FEATURE_DIM,
    get_character_info,
)
from .preprocessing import preprocess_image
from .feature_extractor import get_feature_extractor


def _softmax(scores: np.ndarray, temperature: float = 1.0) -> np.ndarray:
    """
    Computes numerically stable softmax normalized scores over decision margin scores.
    Note: LinearSVC decision margins are not calibrated probabilities.
    Softmax provides an uncalibrated relative score across the 238 classes.
    """
    scaled = scores / temperature
    exp_shifted = np.exp(scaled - np.max(scaled))
    return exp_shifted / np.sum(exp_shifted)


class AmharicPredictor:
    """
    Unified predictor for Handwritten Amharic Character Recognition.
    Loads the trained SVM classifier and ResNet50 extractor once.
    """

    def __init__(self, model_path: Path = None, label_mapping_path: Path = None):
        self.model_path = Path(model_path or SVM_MODEL_PATH)
        self.label_mapping_path = Path(label_mapping_path or LABEL_MAPPING_PATH)

        if not self.model_path.exists():
            raise FileNotFoundError(
                f"Trained SVM model file not found at: {self.model_path}\n"
                f"Please ensure 'svm_resnet50.joblib' is placed in the models/ directory."
            )

        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            self.model = joblib.load(self.model_path)

        # Load label mapping if available
        self.label_mapping = {}
        if self.label_mapping_path.exists():
            try:
                with open(self.label_mapping_path, "r", encoding="utf-8") as f:
                    self.label_mapping = json.load(f)
            except Exception as e:
                warnings.warn(f"Could not load label mapping: {e}")

        # Load ResNet50 feature extractor
        self.extractor = get_feature_extractor()

    def predict(self, image_source: Any, return_top_k: int = 5) -> Dict[str, Any]:
        """
        Runs full inference on the provided image source.
        Returns detailed prediction dictionary.
        """
        # Step 1: Preprocess image to tensor [3, 224, 224]
        tensor = preprocess_image(image_source)
        if tensor.ndim == 3:
            tensor = tensor.unsqueeze(0)

        # Step 2: Extract 2048-dimensional deep feature representation
        features = self.extractor.extract_batch(tensor)
        if isinstance(features, torch.Tensor):
            features = features.detach().cpu().numpy()
        features = np.asarray(features, dtype=np.float32)

        if features.ndim == 1:
            features = features.reshape(1, -1)

        if features.shape[1] != FEATURE_DIM:
            raise ValueError(f"Expected {FEATURE_DIM} features, got {features.shape[1]}")

        # Step 3: Run Linear SVM prediction and decision scores
        pred_label_id = int(self.model.predict(features)[0])
        decision_scores = self.model.decision_function(features)
        scores = np.asarray(decision_scores).reshape(-1)

        # Calculate softmax probabilities over decision margins
        probabilities = _softmax(scores, temperature=1.0)
        ranked_indices = np.argsort(scores)[::-1]

        # Step 4: Map predicted ID to Amharic character metadata
        top_meta = get_character_info(pred_label_id)
        raw_dataset_label = self.label_mapping.get(str(pred_label_id), top_meta["standard_label"])

        # Top-K candidate list
        top_k = min(max(1, return_top_k), len(ranked_indices))
        top_candidates = []
        for rank in range(top_k):
            class_idx = int(ranked_indices[rank])
            c_meta = get_character_info(class_idx)
            c_raw_label = self.label_mapping.get(str(class_idx), c_meta["standard_label"])
            top_candidates.append({
                "rank": rank + 1,
                "class_id": class_idx,
                "character": c_meta["character"],
                "class_label": c_raw_label,
                "phonetic": c_meta["phonetic"],
                "order_name": c_meta["order_name"],
                "base_character": c_meta["base_character"],
                "confidence": round(float(probabilities[class_idx]), 4),
                "decision_score": round(float(scores[class_idx]), 4),
            })

        return {
            "success": True,
            "predicted_character": top_meta["character"],
            "class_id": pred_label_id,
            "class_label": raw_dataset_label,
            "standard_label": top_meta["standard_label"],
            "base_character": top_meta["base_character"],
            "order_number": top_meta["order_number"],
            "order_name": top_meta["order_name"],
            "phonetic": top_meta["phonetic"],
            "confidence": round(float(probabilities[pred_label_id]), 4),
            "decision_score": round(float(scores[pred_label_id]), 4),
            "top_candidates": top_candidates,
            "pipeline": "ResNet50 (ImageNet Pretrained) Feature Extraction -> Linear SVM",
        }


# Global singleton predictor instance
_predictor_instance = None


def get_predictor() -> AmharicPredictor:
    """Returns the cached singleton AmharicPredictor instance."""
    global _predictor_instance
    if _predictor_instance is None:
        _predictor_instance = AmharicPredictor()
    return _predictor_instance


def predict_image(image_path: Union[str, Path]) -> Dict[str, Any]:
    """Convenience helper for single image prediction."""
    predictor = get_predictor()
    return predictor.predict(image_path)


def main():
    """CLI entry point: python -m ml.predict <image_path>"""
    if hasattr(sys.stdout, "reconfigure"):
        try:
            sys.stdout.reconfigure(encoding="utf-8", errors="backslashreplace")
        except Exception:
            pass

    if len(sys.argv) < 2:
        print("\nUsage: python -m ml.predict <image_path>")
        print("Example: python -m ml.predict data/samples/001he.1.jpg\n")
        sys.exit(1)

    image_path = sys.argv[1]
    if not os.path.exists(image_path):
        print(f"\nError: Image file not found: {image_path}\n")
        sys.exit(1)

    try:
        predictor = get_predictor()
        result = predictor.predict(image_path)

        char = result["predicted_character"]
        base_char = result["base_character"]

        print("\n" + "=" * 65)
        print("HANDWRITTEN AMHARIC CHARACTER RECOGNITION (HACR)")
        print("=" * 65)
        print(f"Input Image         : {image_path}")
        print(f"Predicted Character : {char} (Phonetic: '{result['phonetic']}')")
        print(f"Base Consonant      : {base_char}")
        print(f"Vowel Order         : {result['order_name']}")
        print(f"Class Identifier    : {result['class_label']} (ID: {result['class_id']})")
        print(f"Confidence (Softmax): {result['confidence'] * 100:.2f}%")
        print(f"SVM Decision Score  : {result['decision_score']:.4f}")
        print("\nTop 5 Candidates:")
        for cand in result["top_candidates"]:
            print(
                f"  {cand['rank']}. {cand['character']} ({cand['phonetic']}) "
                f"| Label: {cand['class_label']:<8} "
                f"| Conf: {cand['confidence'] * 100:5.2f}% "
                f"| Score: {cand['decision_score']:+.4f}"
            )
        print("=" * 65 + "\n")
    except Exception as e:
        print(f"\nPrediction failed: {e}\n")
        sys.exit(1)


if __name__ == "__main__":
    main()