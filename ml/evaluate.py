"""
Evaluation Module for Handwritten Amharic Character Recognition
Generates detailed classification report, confusion matrix, and performance metrics.
"""
import json
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.metrics import (
    accuracy_score,
    precision_recall_fscore_support,
    classification_report,
    confusion_matrix,
    top_k_accuracy_score
)

try:
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    import seaborn as sns
except ImportError:
    plt = None
    sns = None

from .config import (
    SVM_MODEL_PATH,
    LABEL_ENCODER_PATH,
    TEST_FEATURES_PATH,
    TEST_LABELS_PATH,
    CLASSIFICATION_REPORT_PATH,
    CONFUSION_MATRIX_PATH,
    RESULTS_JSON_PATH,
    MODEL_COMPARISON_CSV_PATH,
    RESULTS_DIR,
    load_categories_map
)

def evaluate_model():
    """
    Evaluates the saved SVM model on the cached test feature set.
    Does not invent or estimate any metric.
    """
    if not SVM_MODEL_PATH.exists():
        print("[Evaluation] Model has not yet been trained.")
        print(f"  Reason: Trained SVM model file '{SVM_MODEL_PATH}' does not exist.")
        return {"status": "untrained", "message": "Model has not yet been trained."}

    if not TEST_FEATURES_PATH.exists() or not TEST_LABELS_PATH.exists():
        print("[Evaluation] Model has not yet been trained.")
        print(f"  Reason: Test features cache '{TEST_FEATURES_PATH}' does not exist.")
        return {"status": "untrained", "message": "Model has not yet been trained."}

    print("[Evaluation] Loading trained SVM model and real test set...")
    svm_model = joblib.load(SVM_MODEL_PATH)
    label_encoder = joblib.load(LABEL_ENCODER_PATH) if LABEL_ENCODER_PATH.exists() else None

    X_test = np.load(TEST_FEATURES_PATH)
    y_test = np.load(TEST_LABELS_PATH)

    print(f"[Evaluation] Evaluating on {len(X_test):,} test samples...")

    # Predictions
    y_pred = svm_model.predict(X_test)
    test_acc = accuracy_score(y_test, y_pred)
    
    p_weighted, r_weighted, f1_weighted, _ = precision_recall_fscore_support(y_test, y_pred, average="weighted", zero_division=0)
    p_macro, r_macro, f1_macro, _ = precision_recall_fscore_support(y_test, y_pred, average="macro", zero_division=0)

    # Top-5 Accuracy if probabilities are available
    top5_acc = None
    if hasattr(svm_model, "predict_proba"):
        try:
            proba = svm_model.predict_proba(X_test)
            if proba.shape[1] >= 5:
                top5_acc = float(top_k_accuracy_score(y_test, proba, k=5))
        except Exception:
            pass

    target_names = [str(c) for c in label_encoder.classes_] if label_encoder is not None else [f"Class_{i}" for i in range(len(np.unique(y_test)))]

    print("\n" + "=" * 55)
    print("HANDWRITTEN AMHARIC CHARACTER RECOGNITION EVALUATION")
    print("=" * 55)
    print(f"  Overall Test Accuracy: {test_acc * 100:.2f}%")
    if top5_acc is not None:
        print(f"  Top-5 Accuracy:        {top5_acc * 100:.2f}%")
    print(f"  Weighted Precision:    {p_weighted:.4f}")
    print(f"  Weighted Recall:       {r_weighted:.4f}")
    print(f"  Weighted F1-Score:     {f1_weighted:.4f}")
    print(f"  Macro F1-Score:        {f1_macro:.4f}")
    print("=" * 55)

    # Generate and save report
    RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    report = classification_report(y_test, y_pred, target_names=target_names, zero_division=0)
    with open(CLASSIFICATION_REPORT_PATH, "w", encoding="utf-8") as f:
        f.write("Evaluation Classification Report - ResNet50 + SVM\n\n")
        f.write(report)

    # Save summary JSON
    summary = {
        "model": "ResNet50 + SVM",
        "test_samples": int(len(X_test)),
        "accuracy": round(float(test_acc), 4),
        "top5_accuracy": round(float(top5_acc), 4) if top5_acc else None,
        "precision_weighted": round(float(p_weighted), 4),
        "recall_weighted": round(float(r_weighted), 4),
        "f1_weighted": round(float(f1_weighted), 4),
        "f1_macro": round(float(f1_macro), 4),
    }

    with open(RESULTS_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    return summary


if __name__ == "__main__":
    evaluate_model()
