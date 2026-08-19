"""
Dataset discovery and metadata preparation for
Handwritten Amharic Character Recognition.

Responsibilities:
1. Recursively discover all image files.
2. Avoid duplicate files on Windows.
3. Extract class identifiers from dataset filenames.
4. Automatically discover all unique classes.
5. Create reproducible stratified 70/15/15 train/validation/test splits.
6. Validate the generated metadata.
7. Save metadata to data/metadata.csv.

Supported filename examples:

    001he.1.jpg
    001he.2.jpg
    001he.137.jpg

    238po.93.jpg

    015_h.e1.jpg
    015_h.e10.jpg
    015_h.e100.jpg

    224_T.o98.jpg

Examples of extracted labels:

    001he.1.jpg       -> 001he
    001he.137.jpg     -> 001he
    238po.93.jpg      -> 238po
    015_h.e1.jpg      -> 015_h.e
    224_T.o98.jpg     -> 224_T.o

The original images are never copied or modified.
Only their paths are stored in metadata.csv.
"""

from pathlib import Path
import re
import sys

import pandas as pd
from sklearn.model_selection import train_test_split


# ============================================================
# CONFIGURATION
# ============================================================

RANDOM_SEED = 42

PROJECT_ROOT = Path(__file__).resolve().parent.parent

# ============================================================
# DATASET LOCATION
# ============================================================

DATASET_DIRS = [
    Path(r"C:\Users\ADMIN\Handwritten-Amharic-character-Dataset")
]

# ============================================================
# OUTPUT
# ============================================================

METADATA_PATH = PROJECT_ROOT / "data" / "metadata.csv"

# ============================================================
# VALID IMAGE EXTENSIONS
# ============================================================

VALID_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
}


# ============================================================
# IMAGE DISCOVERY
# ============================================================

def find_images(dataset_roots):
    """
    Recursively discover all unique image files.

    Duplicate discovery is avoided by:
        1. Checking suffix case-insensitively.
        2. Resolving absolute paths.
        3. Normalizing paths to lowercase.

    This is important on Windows because paths and filename
    extensions can otherwise be discovered more than once.
    """

    unique_paths = {}

    for root in dataset_roots:

        root = Path(root)

        if not root.exists():

            print(
                f"[Dataset Preparation] WARNING: "
                f"Dataset path does not exist:\n"
                f"    {root}"
            )

            continue

        print(
            f"[Dataset Preparation] Scanning:\n"
            f"    {root}"
        )

        for path in root.rglob("*"):

            if not path.is_file():
                continue

            # Case-insensitive image extension check.
            if path.suffix.lower() not in VALID_EXTENSIONS:
                continue

            try:
                resolved = path.resolve()
            except Exception:
                resolved = path.absolute()

            # Normalize for duplicate detection.
            key = str(resolved).lower()

            unique_paths[key] = resolved

    images = sorted(unique_paths.values())

    return images


# ============================================================
# CLASS EXTRACTION
# ============================================================

def extract_label(image_path):
    """
    Extract the dataset class identifier from a filename.

    Supported formats:

        001he.1.jpg
            -> 001he

        001he.137.jpg
            -> 001he

        238po.93.jpg
            -> 238po

        015_h.e1.jpg
            -> 015_h.e

        015_h.e100.jpg
            -> 015_h.e

        224_T.o98.jpg
            -> 224_T.o

    IMPORTANT:

    The final sample identifier is removed.

    We do NOT manually map the identifier to an Amharic
    Unicode character here.
    """

    filename = image_path.stem

    # --------------------------------------------------------
    # FORMAT 1
    #
    # category.number
    #
    # Example:
    #
    # 001he.137
    # 238po.93
    # --------------------------------------------------------

    match = re.match(
        r"^(.+)\.(\d+)$",
        filename
    )

    if match:

        category = match.group(1)

        return category

    # --------------------------------------------------------
    # FORMAT 2
    #
    # category.letters+number
    #
    # Examples:
    #
    # 015_h.e1
    # 015_h.e10
    # 224_T.o98
    # --------------------------------------------------------

    match = re.match(
        r"^(.+)\.[A-Za-z]+\d+$",
        filename
    )

    if match:

        category = match.group(1)

        return category

    # --------------------------------------------------------
    # FALLBACK
    # --------------------------------------------------------

    print(
        f"[Dataset Preparation] WARNING: "
        f"Could not parse category from filename: "
        f"{image_path.name}"
    )

    return filename


# ============================================================
# BUILD DATAFRAME
# ============================================================

def build_dataframe(image_paths):
    """
    Create a pandas DataFrame containing:

        image_path
        label
    """

    records = []

    for image_path in image_paths:

        label = extract_label(image_path)

        records.append(
            {
                "image_path": str(image_path),
                "label": label,
            }
        )

    df = pd.DataFrame(records)

    return df


# ============================================================
# CREATE LABEL IDS
# ============================================================

def create_label_ids(df):
    """
    Automatically assign numeric IDs to discovered classes.

    Classes are sorted alphabetically so that the mapping
    remains reproducible with random seed 42.
    """

    classes = sorted(
        df["label"].unique()
    )

    label_to_id = {
        label: index
        for index, label in enumerate(classes)
    }

    df = df.copy()

    df["label_id"] = (
        df["label"]
        .map(label_to_id)
        .astype(int)
    )

    return df, label_to_id


# ============================================================
# STRATIFIED SPLITTING
# ============================================================

def create_splits(df):
    """
    Create:

        70% training
        15% validation
        15% testing

    using stratified splitting.

    Random seed:
        42
    """

    # ========================================================
    # SAFETY CHECK
    # ========================================================

    class_counts = df["label_id"].value_counts()

    classes_with_too_few_samples = (
        class_counts[class_counts < 2]
    )

    if len(classes_with_too_few_samples) > 0:

        print()
        print(
            "[Dataset Preparation] ERROR:"
        )

        print(
            "The following classes contain fewer "
            "than 2 images:"
        )

        print(
            classes_with_too_few_samples.to_string()
        )

        raise RuntimeError(
            "Cannot perform stratified splitting because "
            "some classes contain fewer than 2 images."
        )

    # ========================================================
    # FIRST SPLIT
    #
    # 70% TRAIN
    # 30% TEMPORARY
    # ========================================================

    train_df, temp_df = train_test_split(
        df,
        test_size=0.30,
        random_state=RANDOM_SEED,
        stratify=df["label_id"],
    )

    # ========================================================
    # SECOND SPLIT
    #
    # 15% VALIDATION
    # 15% TEST
    #
    # Temporary = 30%
    #
    # Half of temporary = 15%
    # ========================================================

    val_df, test_df = train_test_split(
        temp_df,
        test_size=0.50,
        random_state=RANDOM_SEED,
        stratify=temp_df["label_id"],
    )

    # ========================================================
    # ADD SPLIT COLUMN
    # ========================================================

    train_df = train_df.copy()
    val_df = val_df.copy()
    test_df = test_df.copy()

    train_df["split"] = "train"
    val_df["split"] = "val"
    test_df["split"] = "test"

    # ========================================================
    # COMBINE
    # ========================================================

    final_df = pd.concat(
        [
            train_df,
            val_df,
            test_df,
        ],
        ignore_index=True,
    )

    # ========================================================
    # REPRODUCIBLE SHUFFLE
    # ========================================================

    final_df = (
        final_df
        .sample(
            frac=1.0,
            random_state=RANDOM_SEED,
        )
        .reset_index(drop=True)
    )

    return final_df


# ============================================================
# VALIDATE METADATA
# ============================================================

def validate_metadata(df):
    """
    Perform safety checks on generated metadata.
    """

    print()
    print("=" * 65)
    print("DATASET VALIDATION")
    print("=" * 65)

    # ========================================================
    # BASIC INFORMATION
    # ========================================================

    total = len(df)

    unique_paths = (
        df["image_path"]
        .nunique()
    )

    duplicate_paths = (
        df["image_path"]
        .duplicated()
        .sum()
    )

    classes = (
        df["label"]
        .nunique()
    )

    print()
    print(
        f"Total images:       {total:,}"
    )

    print(
        f"Unique image paths: {unique_paths:,}"
    )

    print(
        f"Duplicate paths:    {duplicate_paths:,}"
    )

    print(
        f"Unique classes:     {classes:,}"
    )

    # ========================================================
    # SPLIT DISTRIBUTION
    # ========================================================

    print()
    print("Split distribution:")
    print()

    split_counts = (
        df["split"]
        .value_counts()
        .sort_index()
    )

    print(
        split_counts.to_string()
    )

    # ========================================================
    # DUPLICATE CHECK
    # ========================================================

    if duplicate_paths != 0:

        raise RuntimeError(
            f"Dataset contains {duplicate_paths} "
            f"duplicate image paths."
        )

    # ========================================================
    # EMPTY DATASET CHECK
    # ========================================================

    if total == 0:

        raise RuntimeError(
            "Metadata contains zero images."
        )

    # ========================================================
    # CLASS CHECK
    # ========================================================

    if classes == 0:

        raise RuntimeError(
            "No classes were discovered."
        )

    # ========================================================
    # SMALL CLASS CHECK
    # ========================================================

    class_counts = (
        df["label"]
        .value_counts()
        .sort_values()
    )

    classes_below_two = (
        class_counts[class_counts < 2]
    )

    if len(classes_below_two) > 0:

        print()
        print(
            "Classes with fewer than 2 images:"
        )

        print(
            classes_below_two.to_string()
        )

        raise RuntimeError(
            "Some classes contain fewer than "
            "2 images. Stratified splitting "
            "cannot be trusted."
        )

    # ========================================================
    # MISSING FILE CHECK
    # ========================================================

    print()
    print(
        "[Dataset Preparation] Checking "
        "that image files exist..."
    )

    missing_files = []

    for image_path in df["image_path"]:

        if not Path(image_path).exists():

            missing_files.append(
                image_path
            )

    if missing_files:

        print()
        print(
            f"Missing files: {len(missing_files):,}"
        )

        # Show only first 10.
        for path in missing_files[:10]:

            print(
                f"    {path}"
            )

        raise RuntimeError(
            f"{len(missing_files)} image paths "
            f"do not exist on disk."
        )

    # ========================================================
    # CHECK EVERY SPLIT HAS EVERY CLASS
    # ========================================================

    print(
        "[Dataset Preparation] Checking "
        "class representation in splits..."
    )

    for split_name in [
        "train",
        "val",
        "test",
    ]:

        split_df = df[
            df["split"] == split_name
        ]

        split_classes = (
            split_df["label"]
            .nunique()
        )

        if split_classes != classes:

            raise RuntimeError(
                f"Split '{split_name}' contains "
                f"{split_classes} classes, but the "
                f"dataset contains {classes} classes."
            )

    # ========================================================
    # VALIDATION SUCCESS
    # ========================================================

    print()
    print(
        "[Dataset Preparation] "
        "Validation successful."
    )


# ============================================================
# SAVE METADATA
# ============================================================

def save_metadata(df):
    """
    Save metadata to:

        data/metadata.csv
    """

    METADATA_PATH.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    # Keep columns in a clear order.
    columns = [
        "image_path",
        "label",
        "label_id",
        "split",
    ]

    df = df[columns]

    df.to_csv(
        METADATA_PATH,
        index=False,
    )

    print()
    print(
        "[Dataset Preparation] "
        f"Saved metadata.csv with "
        f"{len(df):,} samples."
    )

    print(
        f"[Dataset Preparation] "
        f"Location: {METADATA_PATH}"
    )


# ============================================================
# PRINT CLASS SUMMARY
# ============================================================

def print_class_summary(df):
    """
    Print useful information about discovered classes.
    """

    print()
    print("=" * 65)
    print("CLASS SUMMARY")
    print("=" * 65)

    class_counts = (
        df.groupby("label")
        .size()
        .sort_index()
    )

    print()
    print(
        f"Number of classes: "
        f"{len(class_counts):,}"
    )

    print()
    print("First 30 classes:")

    for label in class_counts.index[:30]:

        print(
            f"  {label:<20} "
            f"{class_counts[label]:>5} images"
        )

    if len(class_counts) > 30:

        print(
            f"  ... and "
            f"{len(class_counts) - 30} more classes"
        )

    # ========================================================
    # CLASS SIZE STATISTICS
    # ========================================================

    print()
    print("Class size statistics:")

    print(
        f"  Minimum: "
        f"{class_counts.min()}"
    )

    print(
        f"  Maximum: "
        f"{class_counts.max()}"
    )

    print(
        f"  Average: "
        f"{class_counts.mean():.2f}"
    )

    print(
        f"  Median:  "
        f"{class_counts.median():.2f}"
    )


# ============================================================
# PRINT SPLIT SUMMARY
# ============================================================

def print_split_summary(df):
    """
    Print final train/validation/test information.
    """

    print()
    print("=" * 65)
    print("SPLIT SUMMARY")
    print("=" * 65)

    total = len(df)

    for split_name in [
        "train",
        "val",
        "test",
    ]:

        count = (
            df["split"]
            .eq(split_name)
            .sum()
        )

        percentage = (
            count / total * 100
        )

        print(
            f"{split_name.capitalize():<10}"
            f"{count:>10,}"
            f"  ({percentage:>6.2f}%)"
        )


# ============================================================
# MAIN
# ============================================================

def main():

    print()
    print("=" * 65)
    print(
        "HANDWRITTEN AMHARIC CHARACTER "
        "DATASET PREPARATION"
    )
    print("=" * 65)

    print()
    print(
        f"Random seed: {RANDOM_SEED}"
    )

    # ========================================================
    # DATASET ROOTS
    # ========================================================

    print()
    print(
        "Dataset roots:"
    )

    for root in DATASET_DIRS:

        print(
            f"  - {root}"
        )

    # ========================================================
    # DISCOVER IMAGES
    # ========================================================

    print()
    print(
        "[Dataset Preparation] "
        "Discovering images..."
    )

    image_paths = find_images(
        DATASET_DIRS
    )

    print()
    print(
        "[Dataset Preparation] "
        f"Total unique images found: "
        f"{len(image_paths):,}"
    )

    # ========================================================
    # NO IMAGE CHECK
    # ========================================================

    if not image_paths:

        print()
        print(
            "[Dataset Preparation] ERROR:"
        )

        print(
            "No images were found."
        )

        print()
        print(
            "Check DATASET_DIRS in:"
        )

        print(
            "ml/dataset.py"
        )

        sys.exit(1)

    # ========================================================
    # BUILD DATAFRAME
    # ========================================================

    print()
    print(
        "[Dataset Preparation] "
        "Extracting class labels..."
    )

    df = build_dataframe(
        image_paths
    )

    # ========================================================
    # DISCOVER CLASSES
    # ========================================================

    number_of_classes = (
        df["label"]
        .nunique()
    )

    print()
    print(
        "[Dataset Preparation] "
        f"Discovered {number_of_classes} "
        "unique classes."
    )

    # ========================================================
    # EXPECTED DATASET CHECK
    # ========================================================

    if number_of_classes != 238:

        print()
        print(
            "[Dataset Preparation] WARNING:"
        )

        print(
            f"Expected approximately 238 classes, "
            f"but discovered {number_of_classes}."
        )

        print(
            "This is not automatically treated as "
            "an error because the dataset contents "
            "may differ."
        )

    # ========================================================
    # CREATE LABEL IDS
    # ========================================================

    print()
    print(
        "[Dataset Preparation] "
        "Creating numeric label IDs..."
    )

    df, label_to_id = create_label_ids(
        df
    )

    # ========================================================
    # CREATE STRATIFIED SPLITS
    # ========================================================

    print()
    print(
        "[Dataset Preparation] "
        "Creating stratified 70/15/15 split..."
    )

    df = create_splits(
        df
    )

    # ========================================================
    # VALIDATE
    # ========================================================

    validate_metadata(
        df
    )

    # ========================================================
    # PRINT CLASS SUMMARY
    # ========================================================

    print_class_summary(
        df
    )

    # ========================================================
    # PRINT SPLIT SUMMARY
    # ========================================================

    print_split_summary(
        df
    )

    # ========================================================
    # SAVE
    # ========================================================

    save_metadata(
        df
    )

    # ========================================================
    # FINAL SUMMARY
    # ========================================================

    print()
    print("=" * 65)
    print(
        "DATASET PREPARATION COMPLETE"
    )
    print("=" * 65)

    print()
    print(
        f"Total images : "
        f"{len(df):,}"
    )

    print(
        f"Classes      : "
        f"{df['label'].nunique():,}"
    )

    print(
        f"Unique paths : "
        f"{df['image_path'].nunique():,}"
    )

    print()
    print(
        "Metadata:"
    )

    print(
        f"  {METADATA_PATH}"
    )

    print()
    print(
        "No image files were copied."
    )

    print(
        "No image files were modified."
    )

    print()
    print(
        "The dataset is ready for the "
        "ResNet50 feature extraction stage."
    )

    print()


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":
    main()