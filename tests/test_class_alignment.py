"""
Automated Regression Test for Class-Label Alignment Across All 238 Amharic Classes
Asserts consistency between metadata.csv, label_mapping.json, and ml.config.
"""
import sys
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="backslashreplace")
    except Exception:
        pass

import json
from pathlib import Path
import pandas as pd
import numpy as np

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from ml.config import get_character_info

def test_all_238_classes_alignment():
    # 1. Load metadata.csv
    meta_path = PROJECT_ROOT / "data" / "metadata.csv"
    assert meta_path.exists(), f"Metadata not found at {meta_path}"
    df = pd.read_csv(meta_path)
    
    unique_labels = df[["label", "label_id"]].drop_duplicates().sort_values("label_id").reset_index(drop=True)
    assert len(unique_labels) == 238, f"Expected 238 classes in metadata.csv, found {len(unique_labels)}"

    # 2. Load label_mapping.json
    mapping_path = PROJECT_ROOT / "models" / "label_mapping.json"
    assert mapping_path.exists(), f"Label mapping not found at {mapping_path}"
    with open(mapping_path, "r", encoding="utf-8") as f:
        label_mapping = json.load(f)
    assert len(label_mapping) == 238, f"Expected 238 classes in label_mapping.json, found {len(label_mapping)}"

    # 3. Assert alignment for every class ID 0..237
    for cid in range(238):
        meta_row = unique_labels[unique_labels["label_id"] == cid]
        assert len(meta_row) == 1, f"Missing or duplicate label_id {cid} in metadata.csv"
        meta_label = meta_row.iloc[0]["label"]

        json_label = label_mapping.get(str(cid))
        assert json_label is not None, f"Missing class_id {cid} in label_mapping.json"
        assert meta_label == json_label, f"Mismatch at class_id {cid}: metadata '{meta_label}' vs JSON '{json_label}'"

        conf = get_character_info(cid)
        assert conf["class_id"] == cid, f"config class_id mismatch: expected {cid}, got {conf['class_id']}"
        assert conf["character"] != "?", f"config character unresolved for class_id {cid}"
        assert len(conf["phonetic"]) > 0, f"empty phonetic label for class_id {cid}"

    print(f"All 238 classes (0..237) verified 100% aligned across metadata, label mapping, and config.")

if __name__ == "__main__":
    test_all_238_classes_alignment()
