"""
Handwritten Amharic Character Recognition
Inference / Prediction Pipeline

Pipeline:

Input Image
    ↓
Preprocessing
    ↓
ImageNet-pretrained ResNet50
    ↓
2048-dimensional feature vector
    ↓
Linear SVM
    ↓
Predicted Class
    ↓
Amharic Character / Label
"""

from pathlib import Path
import json
import sys

import numpy as np
import joblib
import torch

from .preprocessing import preprocess_image
from .feature_extractor import get_feature_extractor


# ============================================================
# CONFIGURATION
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent

MODEL_DIR = PROJECT_ROOT / "models"

SVM_MODEL_PATH = (
    MODEL_DIR /
    "svm_resnet50.joblib"
)

LABEL_MAPPING_PATH = (
    MODEL_DIR /
    "label_mapping.json"
)


# ============================================================
# LOAD LABEL MAPPING
# ============================================================

def load_label_mapping():

    if not LABEL_MAPPING_PATH.exists():

        raise FileNotFoundError(
            f"Label mapping not found:\n"
            f"{LABEL_MAPPING_PATH}"
        )

    with open(
        LABEL_MAPPING_PATH,
        "r",
        encoding="utf-8",
    ) as f:

        mapping = json.load(f)

    return mapping


# ============================================================
# LOAD MODEL
# ============================================================

def load_model():

    if not SVM_MODEL_PATH.exists():

        raise FileNotFoundError(
            f"SVM model not found:\n"
            f"{SVM_MODEL_PATH}\n\n"
            f"Run training first:\n"
            f"python -m ml.train"
        )

    model = joblib.load(
        SVM_MODEL_PATH
    )

    return model


# ============================================================
# PREDICT
# ============================================================

def predict_image(
    image_path,
    model,
    extractor,
    label_mapping,
):

    image_path = Path(
        image_path
    )

    if not image_path.exists():

        raise FileNotFoundError(
            f"Image not found:\n"
            f"{image_path}"
        )

    print()
    print("=" * 65)
    print("HANDWRITTEN AMHARIC CHARACTER PREDICTION")
    print("=" * 65)

    print()
    print(
        f"Input image:\n"
        f"{image_path}"
    )

    # --------------------------------------------------------
    # PREPROCESS
    # --------------------------------------------------------

    print()
    print("[1/4] Preprocessing image...")

    tensor = preprocess_image(
        str(image_path)
    )

    # --------------------------------------------------------
    # ADD BATCH DIMENSION
    # --------------------------------------------------------

    if tensor.ndim == 3:

        tensor = tensor.unsqueeze(
            0
        )

    # --------------------------------------------------------
    # RESNET50 FEATURE EXTRACTION
    # --------------------------------------------------------

    print(
        "[2/4] Extracting ResNet50 features..."
    )

    features = extractor.extract_batch(
        tensor
    )

    # Convert to NumPy

    if isinstance(
        features,
        torch.Tensor,
    ):

        features = (
            features.detach()
            .cpu()
            .numpy()
        )

    features = np.asarray(
        features,
        dtype=np.float32,
    )

    # --------------------------------------------------------
    # CHECK FEATURE DIMENSION
    # --------------------------------------------------------

    if features.ndim == 1:

        features = features.reshape(
            1,
            -1,
        )

    print(
        f"Feature shape: "
        f"{features.shape}"
    )

    if features.shape[1] != 2048:

        raise ValueError(
            f"Expected 2048 features, "
            f"got {features.shape[1]}"
        )

    # --------------------------------------------------------
    # SVM PREDICTION
    # --------------------------------------------------------

    print(
        "[3/4] Running Linear SVM prediction..."
    )

    prediction = model.predict(
        features
    )

    predicted_id = int(
        prediction[0]
    )

    # --------------------------------------------------------
    # DECISION SCORE
    # --------------------------------------------------------

    decision_scores = (
        model.decision_function(
            features
        )
    )

    # For multiclass LinearSVC,
    # decision_function returns one score
    # per class.

    scores = np.asarray(
        decision_scores
    ).reshape(-1)

    ranked_indices = np.argsort(
        scores
    )[::-1]

    # --------------------------------------------------------
    # LABEL
    # --------------------------------------------------------

    predicted_label = label_mapping.get(
        str(predicted_id),
        f"Unknown label ({predicted_id})",
    )

    print()
    print(
        "[4/4] Converting prediction..."
    )

    # --------------------------------------------------------
    # RESULT
    # --------------------------------------------------------

    print()
    print("=" * 65)
    print("PREDICTION RESULT")
    print("=" * 65)

    print()
    print(
        f"Predicted class ID : "
        f"{predicted_id}"
    )

    print(
        f"Predicted label    : "
        f"{predicted_label}"
    )

    print()

    print(
        "Top predictions:"
    )

    top_k = min(
        5,
        len(ranked_indices),
    )

    for rank in range(
        top_k
    ):

        class_index = int(
            ranked_indices[rank]
        )

        score = float(
            scores[class_index]
        )

        label = label_mapping.get(
            str(class_index),
            f"Unknown ({class_index})",
        )

        print(
            f"  {rank + 1}. "
            f"Class {class_index:3d} "
            f"| Label: {label} "
            f"| Score: {score:.4f}"
        )

    print()

    print("=" * 65)

    return {
        "class_id": predicted_id,
        "label": predicted_label,
        "score": float(
            scores[predicted_id]
        ),
    }


# ============================================================
# MAIN
# ============================================================

def main():

    if len(sys.argv) < 2:

        print()
        print(
            "Usage:"
        )

        print(
            "python -m ml.predict "
            "<image_path>"
        )

        print()
        print(
            "Example:"
        )

        print(
            'python -m ml.predict '
            '"C:\\Users\\ADMIN\\Handwritten-Amharic-character-Dataset\\Amharic Character Dataset 2\\Amharic Character Dataset 2\\225fe.134.jpg"'
        )

        print()

        sys.exit(1)

    image_path = sys.argv[1]

    # --------------------------------------------------------
    # LOAD MODEL
    # --------------------------------------------------------

    print()
    print(
        "[Prediction] Loading Linear SVM..."
    )

    model = load_model()

    print(
        f"[Prediction] Model loaded."
    )

    print(
        f"[Prediction] Classes: "
        f"{len(model.classes_)}"
    )

    print(
        f"[Prediction] Features: "
        f"{model.n_features_in_}"
    )

    # --------------------------------------------------------
    # LOAD LABEL MAPPING
    # --------------------------------------------------------

    print()
    print(
        "[Prediction] Loading label mapping..."
    )

    label_mapping = (
        load_label_mapping()
    )

    print(
        f"[Prediction] Labels loaded: "
        f"{len(label_mapping)}"
    )

    # --------------------------------------------------------
    # LOAD RESNET50
    # --------------------------------------------------------

    print()
    print(
        "[Prediction] Loading ResNet50..."
    )

    extractor = (
        get_feature_extractor()
    )

    # --------------------------------------------------------
    # PREDICT
    # --------------------------------------------------------

    predict_image(
        image_path,
        model,
        extractor,
        label_mapping,
    )


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":

    main()