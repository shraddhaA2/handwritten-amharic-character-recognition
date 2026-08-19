"""
Training pipeline for Handwritten Amharic Character Recognition.

Pipeline:

Images
   ↓
Preprocessing
   ↓
ImageNet-pretrained ResNet50
   ↓
2048-dimensional feature vectors
   ↓
Machine Learning classifiers
   ├── Linear SVM
   ├── Random Forest
   └── XGBoost

Dataset information:

    data/metadata.csv

Expected columns:

    image_path
    label
    label_id
    split
"""

from pathlib import Path
import json
import time
import warnings

import numpy as np
import pandas as pd
import joblib

from sklearn.svm import LinearSVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

try:
    from xgboost import XGBClassifier

    XGBOOST_AVAILABLE = True

except ImportError:

    XGBOOST_AVAILABLE = False


from .preprocessing import preprocess_image
from .feature_extractor import get_feature_extractor


# ============================================================
# CONFIGURATION
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent

METADATA_PATH = (
    PROJECT_ROOT
    / "data"
    / "metadata.csv"
)

FEATURE_DIR = (
    PROJECT_ROOT
    / "data"
    / "features"
)

MODEL_DIR = (
    PROJECT_ROOT
    / "models"
)

FEATURE_DIR.mkdir(
    parents=True,
    exist_ok=True,
)

MODEL_DIR.mkdir(
    parents=True,
    exist_ok=True,
)

RANDOM_SEED = 42

BATCH_SIZE = 32


# ============================================================
# LOAD METADATA
# ============================================================

def load_metadata():

    if not METADATA_PATH.exists():

        raise FileNotFoundError(
            f"Metadata file not found:\n"
            f"{METADATA_PATH}\n\n"
            f"Run:\n"
            f"python -m ml.dataset"
        )

    df = pd.read_csv(
        METADATA_PATH
    )

    required_columns = {
        "image_path",
        "label",
        "label_id",
        "split",
    }

    missing = (
        required_columns
        - set(df.columns)
    )

    if missing:

        raise ValueError(
            f"metadata.csv is missing columns: "
            f"{missing}"
        )

    return df


# ============================================================
# FEATURE EXTRACTION
# ============================================================

def extract_features(
    df,
    split_name,
    extractor,
):

    split_df = (
        df[df["split"] == split_name]
        .reset_index(drop=True)
    )

    if len(split_df) == 0:

        raise ValueError(
            f"No samples found for split: "
            f"{split_name}"
        )

    print()
    print("=" * 65)
    print(
        f"FEATURE EXTRACTION: "
        f"{split_name.upper()}"
    )
    print("=" * 65)

    print(
        f"Images: {len(split_df):,}"
    )

    feature_file = (
        FEATURE_DIR
        / f"{split_name}_features.npy"
    )

    label_file = (
        FEATURE_DIR
        / f"{split_name}_labels.npy"
    )

    path_file = (
        FEATURE_DIR
        / f"{split_name}_paths.npy"
    )

    # ========================================================
    # LOAD CACHED FEATURES
    # ========================================================

    if (
        feature_file.exists()
        and label_file.exists()
        and path_file.exists()
    ):

        print()
        print(
            "[Feature Extraction] "
            "Cached features found."
        )

        features = np.load(
            feature_file
        )

        labels = np.load(
            label_file
        )

        paths = np.load(
            path_file,
            allow_pickle=True,
        )

        print(
            "[Feature Extraction] "
            f"Loaded features: "
            f"{features.shape}"
        )

        return (
            features,
            labels,
            paths,
        )

    # ========================================================
    # EXTRACT FEATURES
    # ========================================================

    all_features = []

    all_labels = []

    all_paths = []

    total = len(split_df)

    for start in range(
        0,
        total,
        BATCH_SIZE,
    ):

        end = min(
            start + BATCH_SIZE,
            total,
        )

        batch = (
            split_df.iloc[start:end]
        )

        tensors = []

        valid_labels = []

        valid_paths = []

        # ----------------------------------------------------
        # PREPROCESS IMAGES
        # ----------------------------------------------------

        for _, row in batch.iterrows():

            image_path = row[
                "image_path"
            ]

            try:

                tensor = preprocess_image(
                    image_path
                )

                tensors.append(
                    tensor
                )

                valid_labels.append(
                    int(row["label_id"])
                )

                valid_paths.append(
                    image_path
                )

            except Exception as e:

                warnings.warn(
                    f"Could not process image "
                    f"{image_path}: {e}"
                )

        if not tensors:

            continue

        # ----------------------------------------------------
        # STACK TENSORS
        # ----------------------------------------------------

        import torch

        batch_tensor = torch.stack(
            tensors,
            dim=0,
        )

        # ----------------------------------------------------
        # RESNET50 FEATURES
        # ----------------------------------------------------

        features = (
            extractor.extract_batch(
                batch_tensor
            )
        )

        all_features.append(
            features
        )

        all_labels.extend(
            valid_labels
        )

        all_paths.extend(
            valid_paths
        )

        # ----------------------------------------------------
        # PROGRESS
        # ----------------------------------------------------

        processed = end

        percentage = (
            processed / total
        ) * 100

        print(
            f"\r[Feature Extraction] "
            f"{processed:,}/{total:,} "
            f"({percentage:6.2f}%)",
            end="",
            flush=True,
        )

    print()

    # ========================================================
    # CHECK
    # ========================================================

    if not all_features:

        raise RuntimeError(
            f"No features were extracted "
            f"for {split_name}."
        )

    # ========================================================
    # COMBINE
    # ========================================================

    features = np.concatenate(
        all_features,
        axis=0,
    ).astype(
        np.float32
    )

    labels = np.asarray(
        all_labels,
        dtype=np.int64,
    )

    paths = np.asarray(
        all_paths,
        dtype=object,
    )

    # ========================================================
    # SAVE
    # ========================================================

    np.save(
        feature_file,
        features,
    )

    np.save(
        label_file,
        labels,
    )

    np.save(
        path_file,
        paths,
    )

    print()
    print(
        f"[Feature Extraction] "
        f"Saved: {feature_file}"
    )

    print(
        f"[Feature Extraction] "
        f"Shape: {features.shape}"
    )

    return (
        features,
        labels,
        paths,
    )


# ============================================================
# TRAIN LINEAR SVM
# ============================================================

def train_svm(
    X_train,
    y_train,
    X_val,
    y_val,
):

    print()
    print("=" * 65)
    print("TRAINING SVM")
    print("=" * 65)

    print(
        f"Training samples: "
        f"{len(X_train):,}"
    )

    print(
        f"Validation samples: "
        f"{len(X_val):,}"
    )

    print(
        f"Feature dimension: "
        f"{X_train.shape[1]}"
    )

    print(
        "Kernel: Linear"
    )

    print(
        "C: 1.0"
    )

    print(
        "Probability calibration: DISABLED"
    )

    print()
    print(
        "[SVM] Starting training..."
    )

    start_time = time.time()

    # ========================================================
    # LINEAR SVM
    #
    # LinearSVC is used instead of RBF SVC because the dataset
    # contains 26,356 training samples and 2,048 features.
    #
    # RBF SVC becomes extremely slow for this dataset on CPU.
    # ========================================================

    model = LinearSVC(
        C=1.0,
        random_state=RANDOM_SEED,
        max_iter=5000,
        dual="auto",
    )

    model.fit(
        X_train,
        y_train,
    )

    elapsed = (
        time.time()
        - start_time
    )

    print()
    print(
        f"SVM training completed in "
        f"{elapsed / 60:.2f} minutes."
    )

    # ========================================================
    # VALIDATION
    # ========================================================

    print()
    print(
        "[SVM] Evaluating validation set..."
    )

    predictions = model.predict(
        X_val
    )

    accuracy = accuracy_score(
        y_val,
        predictions,
    )

    print()
    print(
        f"SVM validation accuracy: "
        f"{accuracy * 100:.2f}%"
    )

    # ========================================================
    # SAVE MODEL
    # ========================================================

    model_path = (
        MODEL_DIR
        / "svm_resnet50.joblib"
    )

    joblib.dump(
        model,
        model_path,
    )

    print(
        f"[SVM] Saved model:"
        f"\n{model_path}"
    )

    return (
        model,
        accuracy,
    )


# ============================================================
# TRAIN RANDOM FOREST
# ============================================================

def train_random_forest(
    X_train,
    y_train,
    X_val,
    y_val,
):

    print()
    print("=" * 65)
    print("TRAINING RANDOM FOREST")
    print("=" * 65)

    print(
        "Number of trees: 100"
    )

    print(
        f"Training samples: "
        f"{len(X_train):,}"
    )

    print()
    print(
        "[Random Forest] Starting training..."
    )

    start_time = time.time()

    model = RandomForestClassifier(
        n_estimators=100,
        random_state=RANDOM_SEED,
        n_jobs=-1,
        class_weight="balanced",
    )

    model.fit(
        X_train,
        y_train,
    )

    elapsed = (
        time.time()
        - start_time
    )

    print()
    print(
        f"Random Forest training "
        f"completed in "
        f"{elapsed / 60:.2f} minutes."
    )

    # ========================================================
    # VALIDATION
    # ========================================================

    print()
    print(
        "[Random Forest] "
        "Evaluating validation set..."
    )

    predictions = model.predict(
        X_val
    )

    accuracy = accuracy_score(
        y_val,
        predictions,
    )

    print()
    print(
        f"Random Forest validation accuracy: "
        f"{accuracy * 100:.2f}%"
    )

    # ========================================================
    # SAVE
    # ========================================================

    model_path = (
        MODEL_DIR
        / "random_forest_resnet50.joblib"
    )

    joblib.dump(
        model,
        model_path,
    )

    print(
        f"[Random Forest] Saved model:"
        f"\n{model_path}"
    )

    return (
        model,
        accuracy,
    )


# ============================================================
# TRAIN XGBOOST
# ============================================================

def train_xgboost(
    X_train,
    y_train,
    X_val,
    y_val,
    number_of_classes,
):

    print()
    print("=" * 65)
    print("TRAINING XGBOOST")
    print("=" * 65)

    if not XGBOOST_AVAILABLE:

        print(
            "XGBoost is not installed."
        )

        print(
            "Install with:"
        )

        print(
            "pip install xgboost"
        )

        return (
            None,
            None,
        )

    print(
        f"Training samples: "
        f"{len(X_train):,}"
    )

    print(
        f"Classes: "
        f"{number_of_classes}"
    )

    print()
    print(
        "[XGBoost] Starting training..."
    )

    start_time = time.time()

    model = XGBClassifier(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        objective="multi:softprob",
        num_class=number_of_classes,
        eval_metric="mlogloss",
        random_state=RANDOM_SEED,
        n_jobs=-1,
        tree_method="hist",
    )

    model.fit(
        X_train,
        y_train,
        eval_set=[
            (
                X_val,
                y_val,
            )
        ],
        verbose=False,
    )

    elapsed = (
        time.time()
        - start_time
    )

    print()
    print(
        f"XGBoost training completed in "
        f"{elapsed / 60:.2f} minutes."
    )

    # ========================================================
    # VALIDATION
    # ========================================================

    print()
    print(
        "[XGBoost] "
        "Evaluating validation set..."
    )

    predictions = model.predict(
        X_val
    )

    predictions = (
        predictions.astype(
            np.int64
        )
    )

    accuracy = accuracy_score(
        y_val,
        predictions,
    )

    print()
    print(
        f"XGBoost validation accuracy: "
        f"{accuracy * 100:.2f}%"
    )

    # ========================================================
    # SAVE
    # ========================================================

    model_path = (
        MODEL_DIR
        / "xgboost_resnet50.joblib"
    )

    joblib.dump(
        model,
        model_path,
    )

    print(
        f"[XGBoost] Saved model:"
        f"\n{model_path}"
    )

    return (
        model,
        accuracy,
    )


# ============================================================
# SAVE LABEL MAPPING
# ============================================================

def save_label_mapping(df):

    mapping = (
        df[
            [
                "label_id",
                "label",
            ]
        ]
        .drop_duplicates()
        .sort_values(
            "label_id"
        )
    )

    mapping_dict = {
        str(int(row["label_id"])): row[
            "label"
        ]
        for _, row in mapping.iterrows()
    }

    output_path = (
        MODEL_DIR
        / "label_mapping.json"
    )

    with open(
        output_path,
        "w",
        encoding="utf-8",
    ) as f:

        json.dump(
            mapping_dict,
            f,
            ensure_ascii=False,
            indent=2,
        )

    print(
        f"[Training] Saved label mapping:"
        f"\n{output_path}"
    )


# ============================================================
# TEST EVALUATION
# ============================================================

def evaluate_test_model(
    name,
    model,
    X_test,
    y_test,
):

    if model is None:

        return None

    print()
    print(
        f"[Test] Evaluating {name}..."
    )

    predictions = model.predict(
        X_test
    )

    accuracy = accuracy_score(
        y_test,
        predictions,
    )

    print(
        f"{name} test accuracy: "
        f"{accuracy * 100:.2f}%"
    )

    return accuracy


# ============================================================
# MAIN
# ============================================================

def main():

    print("=" * 70)

    print(
        "HANDWRITTEN AMHARIC "
        "CHARACTER RECOGNITION"
    )

    print(
        "RESNET50 + MACHINE "
        "LEARNING CLASSIFIERS"
    )

    print("=" * 70)

    # ========================================================
    # LOAD METADATA
    # ========================================================

    print()

    print(
        "[Training] Loading metadata..."
    )

    df = load_metadata()

    print(
        f"[Training] Total samples: "
        f"{len(df):,}"
    )

    print(
        f"[Training] Classes: "
        f"{df['label'].nunique()}"
    )

    print()

    print(
        "[Training] Split distribution:"
    )

    print(
        df["split"]
        .value_counts()
        .sort_index()
    )

    # ========================================================
    # LABEL MAPPING
    # ========================================================

    save_label_mapping(
        df
    )

    # ========================================================
    # RESNET50
    # ========================================================

    print()

    print(
        "[Training] Initializing ResNet50..."
    )

    extractor = (
        get_feature_extractor()
    )

    # ========================================================
    # TRAIN FEATURES
    # ========================================================

    X_train, y_train, _ = (
        extract_features(
            df,
            "train",
            extractor,
        )
    )

    # ========================================================
    # VALIDATION FEATURES
    # ========================================================

    X_val, y_val, _ = (
        extract_features(
            df,
            "val",
            extractor,
        )
    )

    # ========================================================
    # TEST FEATURES
    # ========================================================

    X_test, y_test, _ = (
        extract_features(
            df,
            "test",
            extractor,
        )
    )

    # ========================================================
    # FEATURE SUMMARY
    # ========================================================

    print()

    print("=" * 65)

    print(
        "FEATURE SUMMARY"
    )

    print("=" * 65)

    print(
        f"Train features: "
        f"{X_train.shape}"
    )

    print(
        f"Validation features: "
        f"{X_val.shape}"
    )

    print(
        f"Test features: "
        f"{X_test.shape}"
    )

    # ========================================================
    # TRAINING
    # ========================================================

    results = {}

    # ========================================================
    # SVM
    # ========================================================

    svm_model, svm_accuracy = (
        train_svm(
            X_train,
            y_train,
            X_val,
            y_val,
        )
    )

    results["SVM"] = (
        svm_accuracy
    )

    # ========================================================
    # RANDOM FOREST
    # ========================================================

    rf_model, rf_accuracy = (
        train_random_forest(
            X_train,
            y_train,
            X_val,
            y_val,
        )
    )

    results["Random Forest"] = (
        rf_accuracy
    )

    # ========================================================
    # XGBOOST
    # ========================================================

    xgb_model, xgb_accuracy = (
        train_xgboost(
            X_train,
            y_train,
            X_val,
            y_val,
            df["label_id"].nunique(),
        )
    )

    results["XGBoost"] = (
        xgb_accuracy
    )

    # ========================================================
    # FINAL TEST EVALUATION
    # ========================================================

    print()

    print("=" * 65)

    print(
        "FINAL TEST EVALUATION"
    )

    print("=" * 65)

    test_results = {}

    models = {
        "SVM": svm_model,
        "Random Forest": rf_model,
        "XGBoost": xgb_model,
    }

    for name, model in models.items():

        accuracy = evaluate_test_model(
            name,
            model,
            X_test,
            y_test,
        )

        if accuracy is not None:

            test_results[name] = (
                accuracy
            )

    # ========================================================
    # SAVE RESULTS
    # ========================================================

    results_path = (
        MODEL_DIR
        / "training_results.json"
    )

    output = {

        "dataset_samples": int(
            len(df)
        ),

        "classes": int(
            df["label"].nunique()
        ),

        "feature_dimension": int(
            X_train.shape[1]
        ),

        "classifier": {
            "SVM": {
                "type": "LinearSVC",
                "kernel": "linear",
                "C": 1.0,
                "probability_calibration": False,
            },
            "Random Forest": {
                "n_estimators": 100,
            },
            "XGBoost": {
                "n_estimators": 200,
                "max_depth": 6,
                "learning_rate": 0.1,
            },
        },

        "validation_accuracy": {
            key: (
                float(value)
                if value is not None
                else None
            )
            for key, value
            in results.items()
        },

        "test_accuracy": {
            key: float(value)
            for key, value
            in test_results.items()
        },

    }

    with open(
        results_path,
        "w",
        encoding="utf-8",
    ) as f:

        json.dump(
            output,
            f,
            indent=2,
        )

    # ========================================================
    # FINAL SUMMARY
    # ========================================================

    print()

    print("=" * 70)

    print(
        "TRAINING COMPLETE"
    )

    print("=" * 70)

    print()

    print(
        f"Dataset: "
        f"{len(df):,} images"
    )

    print(
        f"Classes: "
        f"{df['label'].nunique()}"
    )

    print(
        f"Feature dimension: "
        f"{X_train.shape[1]}"
    )

    print()

    print(
        "Validation results:"
    )

    for name, accuracy in (
        results.items()
    ):

        if accuracy is not None:

            print(
                f"  {name:15s}: "
                f"{accuracy * 100:.2f}%"
            )

    print()

    print(
        "Test results:"
    )

    for name, accuracy in (
        test_results.items()
    ):

        print(
            f"  {name:15s}: "
            f"{accuracy * 100:.2f}%"
        )

    print()

    print(
        f"Models saved to:"
        f"\n{MODEL_DIR}"
    )

    print()

    print(
        f"Features saved to:"
        f"\n{FEATURE_DIR}"
    )

    print()

    print(
        f"Results saved to:"
        f"\n{results_path}"
    )

    print()

    print(
        "No original dataset images "
        "were modified."
    )


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":

    main()