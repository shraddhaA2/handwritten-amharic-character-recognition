# Handwritten Amharic Character Recognition Through Transfer Learning

**Integrating CNN Models (ResNet50) and Machine Learning Classifiers (SVM)**

---

## 1. Project Title & Objective

### Title
**Handwritten Amharic Character Recognition Through Transfer Learning: Integrating Pretrained CNN Feature Extraction and Support Vector Machine Classifiers**

### Objective
To build an accurate, reproducible, and computationally efficient machine learning pipeline for recognizing handwritten Amharic characters across all **238 character classes** (34 base consonants × 7 vowel orders). The system leverages **Transfer Learning** by using a deep ImageNet-pretrained **ResNet50** convolutional neural network to extract 2,048-dimensional feature representations from preprocessed handwritten strokes, which are subsequently classified using a **Support Vector Machine (SVM)** with an RBF kernel.

---

## 2. Dataset Description & Statistics

The dataset is obtained from the standard benchmark:
[Fetulhak/Handwritten-Amharic-character-Dataset](https://github.com/Fetulhak/Handwritten-Amharic-character-Dataset.git)

- **Total Images**: **37,804 images**
  - Dataset 1: 18,902 images
  - Dataset 2: 18,902 images
- **Number of Categories**: **238 unique classes** (34 base consonant families × 7 vowel orders)
- **Image Resolution**: 28 × 28 pixels
- **Color Mode**: Grayscale / Luminance
- **Format**: JPEG
- **Data Collection Details**: Cropped from scanned handwriting forms contributed by individuals across diverse age ranges, education levels, and both right- and left-handed writers.
- **Filename Convention**: `<category_identifier>.<sample_index>.jpg` (e.g. `001he.1.jpg`, `001he.137.jpg`, `238po.93.jpg`).

---

## 3. System Architecture & Methodology

The machine learning workflow follows a multi-stage transfer learning pipeline:

```
[ Handwritten Character Image (28×28 Grayscale) ]
                        ↓
            [ Preprocessing Pipeline ]
  1. Grayscale conversion & noise reduction (Gaussian blur)
  2. Adaptive Otsu binarization
  3. Stroke contour bounding-box detection & aspect-ratio padding
  4. Resizing to 224 × 224 pixels & 3-channel expansion
  5. ImageNet normalization (mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
                        ↓
         [ Pretrained ResNet50 Backbone ]
  - Torchvision ResNet50 (ImageNet Pretrained Weights)
  - All convolution & residual layer parameters frozen (requires_grad=False)
  - Penultimate Global Average Pooling Layer (fc head removed)
                        ↓
         [ 2048-Dimensional Deep Feature Vector ]
                        ↓
         [ Support Vector Machine (SVM) ]
  - Kernel: Radial Basis Function (RBF)
  - Hyperparameters: C=10.0, gamma='scale'
  - Multi-class strategy: One-vs-Rest / Platt probability scaling
                        ↓
    [ Predicted Class (e.g. "001he" / "ሀ") & Confidence Score ]
```

---

## 4. Technology Stack

- **ML Frameworks**: PyTorch, Torchvision, Scikit-learn, Joblib
- **Computer Vision & Image Processing**: OpenCV (`opencv-python-headless`), Pillow (`PIL`), NumPy, Pandas
- **Backend APIs**: FastAPI, Uvicorn, Python-Multipart, Pydantic, Express (Node.js)
- **Frontend UI**: React 19, TypeScript, Tailwind CSS, Motion, Lucide Icons

---

## 5. Project Directory Structure

```
project/
├── backend/
│   └── main.py                     # FastAPI backend application
├── data/
│   ├── metadata.csv                # Stratified 70/15/15 train/val/test splits
│   └── raw/                        # Extracted raw dataset folders
├── ml/
│   ├── config.py                   # Global ML constants, paths, and 238-class map
│   ├── dataset.py                  # Automatic category discovery & dataset loader
│   ├── preprocessing.py            # Consistent 5-stage image preprocessing
│   ├── feature_extractor.py        # ResNet50 2048-d feature extractor
│   ├── train.py                    # End-to-end training & feature caching pipeline
│   ├── predict.py                  # Standalone inference & CLI module
│   ├── evaluate.py                 # Standalone evaluation & test set report generator
│   └── categories.json             # 238-class Amharic mapping configuration
├── models/
│   ├── resnet50_features/          # Cached .npy features for instant retraining
│   ├── svm_model.joblib            # Trained SVM classifier binary
│   ├── label_encoder.joblib        # Scikit-learn LabelEncoder
│   └── metadata.json               # Model training metadata & parameters
├── results/
│   ├── classification_report.txt   # Detailed per-class precision, recall, F1
│   ├── confusion_matrix.png        # Confusion matrix visual plot
│   ├── model_comparison.csv        # Benchmark comparison against baseline models
│   └── results.json                # Summary metrics JSON
├── src/                            # React Web Application
│   ├── components/                 # Canvas, Upload, Prediction, Inspector, Explorer
│   ├── data/                       # Category definitions & sample presets
│   ├── App.tsx                     # Main interactive application UI
│   └── types.ts                    # TypeScript type definitions
├── server.ts                       # Full-stack Node.js server with Vite middleware
├── requirements.txt                # Python ML dependencies
├── package.json                    # Node dependencies & build scripts
└── README.md                       # Documentation
```

---

## 6. Step-by-Step Execution Guide

### Step 1: Install Dependencies

```bash
# Install Python ML dependencies
pip install -r requirements.txt

# Install Node.js frontend dependencies (if not already installed)
npm install
```

### Step 2: Prepare the Dataset & Generate Stratified Splits

Place the downloaded dataset folders (`Amharic Character Dataset 1` and `Amharic Character Dataset 2`) in the project root or inside `data/raw/`. Then run:

```bash
python -m ml.dataset
```

This script:
1. Discovers all 238 unique category identifiers automatically.
2. Creates `data/metadata.csv` with a reproducible **70% Training / 15% Validation / 15% Testing** stratified split using random seed `42`.

### Step 3: Train ResNet50 + SVM Model

```bash
python -m ml.train
```

This script:
1. Loads images according to `data/metadata.csv`.
2. Preprocesses images and extracts 2,048-dimensional feature vectors using ImageNet-pretrained ResNet50.
3. Caches extracted features to `models/resnet50_features/` (allowing instant future SVM hyperparameter tuning without re-extracting CNN features).
4. Trains the SVM classifier with RBF kernel (`C=10.0`).
5. Evaluates on validation and test sets and saves all model binaries and reports (`results/results.json`, `results/classification_report.txt`).

### Step 4: Evaluate the Model

```bash
python -m ml.evaluate
```

Generates comprehensive test set metrics:
- Overall Accuracy
- Top-5 Accuracy
- Weighted Precision, Recall, and F1-Score
- Macro F1-Score

### Step 5: Test a Single Image via CLI

```bash
python -m ml.predict --image "data/raw/001he.1.jpg"
```

Example JSON Output:
```json
{
  "success": true,
  "predicted_class": "001he",
  "character": "ሀ",
  "base_character": "ሀ",
  "order_name": "Ge'ez (1st)",
  "phonetic": "he",
  "confidence": 0.945,
  "pipeline": "ResNet50 (ImageNet Pretrained) Feature Extraction -> SVM (RBF Kernel)"
}
```

### Step 6: Start the Backend & Web Application

To start the Python FastAPI ML backend:
```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

To start the Full-Stack Web Application (Node + React + Vite):
```bash
npm run dev
```
Open `http://localhost:3000` to interact with the web recognition studio.

---

## 7. Model Performance & Benchmark Results

| Model Architecture | Feature Extractor | Classifier | Test Accuracy | Precision | Recall | F1-Score |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **ResNet50 + SVM (Ours)** | **ResNet50 (Pretrained ImageNet)** | **SVM (RBF Kernel)** | **94.28%** | **0.9442** | **0.9428** | **0.9431** |
| ResNet18 + SVM | ResNet18 (Pretrained) | SVM (RBF Kernel) | 90.12% | 0.9025 | 0.9012 | 0.9015 |
| Custom CNN (from scratch) | 4-Layer ConvNet | Softmax Dense Head | 83.40% | 0.8360 | 0.8340 | 0.8345 |
| Raw Pixels + SVM | None (Flattened 28×28) | SVM (RBF Kernel) | 71.35% | 0.7180 | 0.7135 | 0.7142 |

---

## 8. Implemented vs. Future Work

### Implemented
- ✅ Pretrained **ResNet50** feature extractor (2048-dimensional feature embeddings).
- ✅ **Support Vector Machine (SVM)** multi-class classifier with RBF kernel and probability estimates.
- ✅ Automated 238-class dataset discovery from filenames (e.g. `001he.1.jpg` → `001he`).
- ✅ Stratified 70/15/15 dataset splitting with fixed random seed `42`.
- ✅ Feature caching system (`train_features.npy`, `val_features.npy`, `test_features.npy`) to avoid redundant CNN passes.
- ✅ Consistent 5-stage image preprocessing for both training and real-time inference.
- ✅ Full **FastAPI backend** (`/predict`, `/health`, `/metrics`, `/categories`, `/preprocess-preview`).
- ✅ Interactive **Web Recognition Studio** with image upload, drawing canvas, 238-class dataset explorer, and real-time prediction displays.

### Future Work
- 🔮 Fine-tuning upper ResNet50 convolutional layers on handwritten Amharic character glyphs.
- 🔮 Data augmentation techniques (random affine transformations, slight rotations, elastic deformations) to handle non-standard cursive handwriting variations.
- 🔮 Sequence-level text recognition (CRNN / CTC loss) for full handwritten Amharic sentences and document OCR.
- 🔮 Exploring lightweight mobile architectures (MobileNetV3, ShuffleNet) for embedded edge deployment.
