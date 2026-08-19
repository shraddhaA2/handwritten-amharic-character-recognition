"""
Configuration settings for Handwritten Amharic Character Recognition
Transfer Learning with Pretrained ResNet50 + SVM Classifier
"""
import os
import json
from pathlib import Path

# Base Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
RAW_DATA_DIR = DATA_DIR / "raw"
MODELS_DIR = BASE_DIR / "models"
RESULTS_DIR = BASE_DIR / "results"
FEATURES_DIR = MODELS_DIR / "resnet50_features"

# Ensure directories exist
for d in [DATA_DIR, RAW_DATA_DIR, MODELS_DIR, RESULTS_DIR, FEATURES_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# Dataset paths
METADATA_CSV = DATA_DIR / "metadata.csv"
DATASET_DIRS = [
    "Amharic Character Dataset 1",
    "Amharic Character Dataset 2",
    str(RAW_DATA_DIR),
]

# Random Seed for Reproducibility
RANDOM_SEED = 42

# Dataset Split Ratios
SPLIT_TRAIN = 0.70
SPLIT_VAL = 0.15
SPLIT_TEST = 0.15

# Image Preprocessing Constants
IMAGE_RAW_SIZE = (28, 28)      # Original dataset image size
IMAGE_INPUT_SIZE = (224, 224)  # ResNet50 input dimension
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]

# ResNet50 Feature Extraction
FEATURE_DIM = 2048
BATCH_SIZE = 64
NUM_WORKERS = 2

# SVM Hyperparameters
SVM_KERNEL = "rbf"
SVM_C = 10.0
SVM_GAMMA = "scale"
SVM_PROBABILITY = True

# Model & Artifact Output Paths
SVM_MODEL_PATH = MODELS_DIR / "svm_model.joblib"
LABEL_ENCODER_PATH = MODELS_DIR / "label_encoder.joblib"
MODEL_METADATA_PATH = MODELS_DIR / "metadata.json"
MAPPING_CONFIG_PATH = BASE_DIR / "ml" / "categories.json"

TRAIN_FEATURES_PATH = FEATURES_DIR / "train_features.npy"
TRAIN_LABELS_PATH = FEATURES_DIR / "train_labels.npy"
VAL_FEATURES_PATH = FEATURES_DIR / "val_features.npy"
VAL_LABELS_PATH = FEATURES_DIR / "val_labels.npy"
TEST_FEATURES_PATH = FEATURES_DIR / "test_features.npy"
TEST_LABELS_PATH = FEATURES_DIR / "test_labels.npy"

# Evaluation Output Paths
CLASSIFICATION_REPORT_PATH = RESULTS_DIR / "classification_report.txt"
CONFUSION_MATRIX_PATH = RESULTS_DIR / "confusion_matrix.png"
RESULTS_JSON_PATH = RESULTS_DIR / "results.json"
MODEL_COMPARISON_CSV_PATH = RESULTS_DIR / "model_comparison.csv"

# Amharic 34 Base Consonants x 7 Orders Reference Table
AMHARIC_BASES = [
    ("he", "ሀ", ["ሀ", "ሁ", "ሂ", "ሃ", "ሄ", "ህ", "ሆ"], ["he", "hu", "hi", "ha", "hee", "h", "ho"]),
    ("le", "ለ", ["ለ", "ሉ", "ሊ", "ላ", "ሌ", "ል", "ሎ"], ["le", "lu", "li", "la", "lee", "l", "lo"]),
    ("hhe", "ሐ", ["ሐ", "ሑ", "ሒ", "ሓ", "ሔ", "ሕ", "ሖ"], ["hhe", "hhu", "hhi", "hha", "hhee", "hh", "hho"]),
    ("me", "መ", ["መ", "ሙ", "ሚ", "ማ", "ሜ", "ም", "ሞ"], ["me", "mu", "mi", "ma", "mee", "m", "mo"]),
    ("sse", "ሠ", ["ሠ", "ሡ", "ሢ", "ሣ", "ሤ", "ሥ", "ሦ"], ["sse", "ssu", "ssi", "ssa", "ssee", "ss", "sso"]),
    ("re", "ረ", ["ረ", "ሩ", "ሪ", "ራ", "ሬ", "ር", "ሮ"], ["re", "ru", "ri", "ra", "ree", "r", "ro"]),
    ("se", "ሰ", ["ሰ", "ሱ", "ሲ", "ሳ", "ሴ", "ስ", "ሶ"], ["se", "su", "si", "sa", "see", "s", "so"]),
    ("she", "ሸ", ["ሸ", "ሹ", "ሺ", "ሻ", "ሼ", "ሽ", "ሾ"], ["she", "shu", "shi", "sha", "shee", "sh", "sho"]),
    ("qe", "ቀ", ["ቀ", "ቁ", "ቂ", "ቃ", "ቄ", "ቅ", "ቆ"], ["qe", "qu", "qi", "qa", "qee", "q", "qo"]),
    ("be", "በ", ["በ", "ቡ", "ቢ", "ባ", "ቤ", "ብ", "ቦ"], ["be", "bu", "bi", "ba", "bee", "b", "bo"]),
    ("ve", "ቨ", ["ቨ", "ቩ", "ቪ", "ቫ", "ቬ", "ቭ", "ቮ"], ["ve", "vu", "vi", "va", "vee", "v", "vo"]),
    ("te", "ተ", ["ተ", "ቱ", "ቲ", "ታ", "ቴ", "ት", "ቶ"], ["te", "tu", "ti", "ta", "tee", "t", "to"]),
    ("che", "ቸ", ["ቸ", "ቹ", "ቺ", "ቻ", "ቼ", "ች", "ቾ"], ["che", "chu", "chi", "cha", "chee", "ch", "cho"]),
    ("xhe", "ኀ", ["ኀ", "ኁ", "ኂ", "ኃ", "ኄ", "ኅ", "ኆ"], ["xhe", "xhu", "xhi", "xha", "xhee", "xh", "xho"]),
    ("ne", "ነ", ["ነ", "ኑ", "ኒ", "ና", "ኔ", "ን", "ኖ"], ["ne", "nu", "ni", "na", "nee", "n", "no"]),
    ("nye", "ኘ", ["ኘ", "ኙ", "ኚ", "ኛ", "ኜ", "ኝ", "ኞ"], ["nye", "nyu", "nyi", "nya", "nyee", "ny", "nyo"]),
    ("alef", "አ", ["አ", "ኡ", "ኢ", "ኣ", "ኤ", "እ", "ኦ"], ["'e", "'u", "'i", "'a", "'ee", "'", "'o"]),
    ("ke", "ከ", ["ከ", "ኩ", "ኪ", "ካ", "ኬ", "ክ", "ኮ"], ["ke", "ku", "ki", "ka", "kee", "k", "ko"]),
    ("khe", "ኸ", ["ኸ", "ኹ", "ኺ", "ኻ", "ኼ", "ኽ", "ኾ"], ["khe", "khu", "khi", "kha", "khee", "kh", "kho"]),
    ("we", "ወ", ["ወ", "ዉ", "ዊ", "ዋ", "ዌ", "ው", "ዎ"], ["we", "wu", "wi", "wa", "wee", "w", "wo"]),
    ("ayin", "ዐ", ["ዐ", "ዑ", "ዒ", "ዓ", "ዔ", "ዕ", "ዖ"], ["ae", "au", "ai", "aa", "aee", "a", "ao"]),
    ("ze", "ዘ", ["ዘ", "ዙ", "ዚ", "ዛ", "ዜ", "ዝ", "ዞ"], ["ze", "zu", "zi", "za", "zee", "z", "zo"]),
    ("zhe", "ዠ", ["ዠ", "ዡ", "ዢ", "ዣ", "ዤ", "ዥ", "ዦ"], ["zhe", "zhu", "zhi", "zha", "zhee", "zh", "zho"]),
    ("ye", "የ", ["የ", "ዩ", "ዪ", "ያ", "ዬ", "ይ", "ዮ"], ["ye", "yu", "yi", "ya", "yee", "y", "yo"]),
    ("de", "ደ", ["ደ", "ዱ", "ዲ", "ዳ", "ዴ", "ድ", "ዶ"], ["de", "du", "di", "da", "dee", "d", "do"]),
    ("je", "ጀ", ["ጀ", "ጁ", "ጂ", "ጃ", "ጄ", "ጅ", "ጆ"], ["je", "ju", "ji", "ja", "jee", "j", "jo"]),
    ("ge", "ገ", ["ገ", "ጉ", "ጊ", "ጋ", "ጌ", "ግ", "ጎ"], ["ge", "gu", "gi", "ga", "gee", "g", "go"]),
    ("tte", "ጠ", ["ጠ", "ጡ", "ጢ", "ጣ", "ጤ", "ጥ", "ጦ"], ["tte", "ttu", "tti", "tta", "ttee", "tt", "tto"]),
    ("chee", "ጨ", ["ጨ", "ጩ", "ጪ", "ጫ", "ጬ", "ጭ", "ጮ"], ["che", "chu", "chi", "cha", "chee", "ch", "cho"]),
    ("ppe", "ጰ", ["ጰ", "ጱ", "ጲ", "ጳ", "ጴ", "ጵ", "ጶ"], ["ppe", "ppu", "ppi", "ppa", "ppee", "pp", "ppo"]),
    ("tse", "ጸ", ["ጸ", "ጹ", "ጺ", "ጻ", "ጼ", "ጽ", "ጾ"], ["tse", "tsu", "tsi", "tsa", "tsee", "ts", "tso"]),
    ("tts", "ፀ", ["ፀ", "ፁ", "ፂ", "ፃ", "ፄ", "ፅ", "ፆ"], ["ttse", "ttsu", "ttsi", "ttsa", "ttsee", "tts", "ttso"]),
    ("fe", "ፈ", ["ፈ", "ፉ", "ፊ", "ፋ", "ፌ", "ፍ", "ፎ"], ["fe", "fu", "fi", "fa", "fee", "f", "fo"]),
    ("pe", "ፐ", ["ፐ", "ፑ", "ፒ", "ፓ", "ፔ", "ፕ", "ፖ"], ["pe", "pu", "pi", "pa", "pee", "p", "po"]),
]

def generate_default_categories_map():
    """Generates the 238-class Amharic mapping dictionary."""
    mapping = {}
    counter = 1
    for base_id, base_char, glyphs, orders in AMHARIC_BASES:
        for order_idx, (glyph, phonetic) in enumerate(zip(glyphs, orders), start=1):
            class_id = f"{counter:03d}{phonetic}"
            # Standard order names in Ge'ez linguistics (1st to 7th order)
            order_names = ["Ge'ez (1st)", "Ka'eb (2nd)", "Salis (3rd)", "Rabi (4th)", "Hamis (5th)", "Sadis (6th)", "Sabi (7th)"]
            mapping[class_id] = {
                "index": counter - 1,
                "class_id": class_id,
                "character": glyph,
                "base_character": base_char,
                "base_id": base_id,
                "order_number": order_idx,
                "order_name": order_names[order_idx - 1],
                "phonetic": phonetic,
                "description": f"Family: {base_char} ({base_id}) | Order: {order_idx} ({order_names[order_idx - 1]})"
            }
            counter += 1
    return mapping

def load_categories_map():
    """Loads mapping from categories.json if exists, else generates default."""
    if MAPPING_CONFIG_PATH.exists():
        try:
            with open(MAPPING_CONFIG_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return generate_default_categories_map()
