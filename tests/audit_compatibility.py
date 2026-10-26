"""
Compatibility and Audit Script for HACR ML Pipeline
"""
import sys
import json
from pathlib import Path
import joblib
import numpy as np
import torch

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="backslashreplace")
    except Exception:
        pass

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from ml.config import SVM_MODEL_PATH, LABEL_MAPPING_PATH, get_character_info
from ml.preprocessing import preprocess_image
from ml.feature_extractor import get_feature_extractor

print("[Audit] 1. Loading active SVM model and label mapping...")
svm_model = joblib.load(SVM_MODEL_PATH)
with open(LABEL_MAPPING_PATH, "r", encoding="utf-8") as f:
    label_map = json.load(f)

print(f"  Model Type          : {type(svm_model).__name__}")
print(f"  Input Features      : {svm_model.n_features_in_}")
print(f"  Classes Count       : {len(svm_model.classes_)}")
print(f"  Label Mapping Count : {len(label_map)}")

assert svm_model.n_features_in_ == 2048, f"Expected 2048 features, got {svm_model.n_features_in_}"
assert len(svm_model.classes_) == 238, f"Expected 238 classes, got {len(svm_model.classes_)}"
assert len(label_map) == 238, f"Expected 238 labels, got {len(label_map)}"

print("\n[Audit] 2. Verifying 238-class indexing consistency...")
for idx in range(238):
    assert str(idx) in label_map, f"Missing index {idx} in label mapping"
    raw_label = label_map[str(idx)]
    assert int(raw_label[:3]) - 1 == idx, f"Mismatch: {raw_label} vs {idx}"
    info = get_character_info(idx)
    assert info["class_id"] == idx
    assert info["character"] != "?"

print("  ✓ All 238 class indices match exact Ethiopic Fidel matrix mappings.")

print("\n[Audit] 3. Testing feature extractor and inference on sample image...")
sample_path = PROJECT_ROOT / "data" / "samples" / "001he.1.jpg"
extractor = get_feature_extractor()
tensor = preprocess_image(str(sample_path))
assert tensor.shape == (3, 224, 224), f"Preprocessed tensor shape {tensor.shape} != (3, 224, 224)"

features = extractor.extract_batch(tensor.unsqueeze(0))
if isinstance(features, torch.Tensor):
    features = features.detach().cpu().numpy()
assert features.shape == (1, 2048), f"Feature shape {features.shape} != (1, 2048)"

pred = svm_model.predict(features)
scores = svm_model.decision_function(features)[0]
top1_idx = int(np.argmax(scores))

print(f"  Sample Image        : {sample_path.name}")
print(f"  SVM Predict Output  : Class ID {pred[0]} ({label_map[str(pred[0])]})")
print(f"  Decision Max Index  : Class ID {top1_idx}")
assert pred[0] == top1_idx, "LinearSVC.predict() does not match argmax(decision_function())"
assert pred[0] == 0, f"Expected Class 0 (001he), got {pred[0]}"
print("  ✓ Pipeline compatibility verified without any mismatch.")

if __name__ == "__main__":
    pass
