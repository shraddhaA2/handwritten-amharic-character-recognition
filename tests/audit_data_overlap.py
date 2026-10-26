"""
Audit Data Overlap and Split Integrity
"""
import sys
import numpy as np
import pandas as pd
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="backslashreplace")
    except Exception:
        pass

PROJECT_ROOT = Path(__file__).resolve().parent.parent

metadata_path = PROJECT_ROOT / "data" / "metadata.csv"
features_dir = PROJECT_ROOT / "data" / "features"

print("[Audit] 1. Checking metadata.csv splits and overlap...")
df = pd.read_csv(metadata_path)

train_df = df[df["split"] == "train"]
val_df = df[df["split"] == "val"]
test_df = df[df["split"] == "test"]

print(f"  Total samples in metadata : {len(df):,}")
print(f"  Train samples             : {len(train_df):,} ({len(train_df)/len(df)*100:.1f}%)")
print(f"  Val samples               : {len(val_df):,} ({len(val_df)/len(df)*100:.1f}%)")
print(f"  Test samples              : {len(test_df):,} ({len(test_df)/len(df)*100:.1f}%)")

# Check path overlap
train_paths = set(train_df["image_path"].str.lower())
val_paths = set(val_df["image_path"].str.lower())
test_paths = set(test_df["image_path"].str.lower())

train_test_overlap = train_paths.intersection(test_paths)
train_val_overlap = train_paths.intersection(val_paths)
val_test_overlap = val_paths.intersection(test_paths)

print(f"  Train-Test path overlap   : {len(train_test_overlap)} (Expected: 0)")
print(f"  Train-Val path overlap    : {len(train_val_overlap)} (Expected: 0)")
print(f"  Val-Test path overlap     : {len(val_test_overlap)} (Expected: 0)")

assert len(train_test_overlap) == 0, f"Found {len(train_test_overlap)} overlapping samples!"
assert len(train_val_overlap) == 0, f"Found {len(train_val_overlap)} overlapping samples!"
assert len(val_test_overlap) == 0, f"Found {len(val_test_overlap)} overlapping samples!"
print("  ✓ Zero sample overlap between Train, Validation, and Test splits.")

print("\n[Audit] 2. Checking cached feature arrays in data/features/...")
test_feat = np.load(features_dir / "test_features.npy")
test_labels = np.load(features_dir / "test_labels.npy")
test_paths_npy = np.load(features_dir / "test_paths.npy", allow_pickle=True)

train_feat = np.load(features_dir / "train_features.npy")
train_labels = np.load(features_dir / "train_labels.npy")
train_paths_npy = np.load(features_dir / "train_paths.npy", allow_pickle=True)

print(f"  train_features.npy shape  : {train_feat.shape}")
print(f"  train_labels.npy shape    : {train_labels.shape}")
print(f"  test_features.npy shape   : {test_feat.shape}")
print(f"  test_labels.npy shape     : {test_labels.shape}")

# Check cached path overlap
cached_train_set = set(str(p).lower() for p in train_paths_npy)
cached_test_set = set(str(p).lower() for p in test_paths_npy)
cached_overlap = cached_train_set.intersection(cached_test_set)
print(f"  Cached Train-Test overlap : {len(cached_overlap)} (Expected: 0)")
assert len(cached_overlap) == 0, f"Cached feature overlap: {len(cached_overlap)}"
print("  ✓ Cached test features have zero overlap with cached training features.")

# Check label distribution in test set
unique_test_labels = np.unique(test_labels)
print(f"  Unique classes in test set: {len(unique_test_labels)} / 238")
assert len(unique_test_labels) == 238, f"Expected 238 unique classes in test set, got {len(unique_test_labels)}"
print("  ✓ All 238 classes are represented in the stratified test set.")

print("\nAudit passed with 100% integrity!")
